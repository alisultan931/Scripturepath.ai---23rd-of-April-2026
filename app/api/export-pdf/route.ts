import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const client = new Anthropic();

const PDF_SYSTEM_PROMPT = `You are a presentation content architect for ScripturePath Bible Study.
Your task: transform a 10-section Bible study JSON into a precise PDF slide specification.

The output renders as a dark-theme 16:9 PDF presentation:
  Background  #08080A  |  Text  #F5F2EE  |  Gold accent  #C4956A
  Fonts: Lora (serif headings) + Inter (body)

───────────────────────────────────────────────────
SECTION → SLIDE MAPPING  (exactly 10 slides, in order)
───────────────────────────────────────────────────
section_01  →  slide 1  · "Glance"       · layout: cover
section_02  →  slide 2  · "Prayer"       · layout: prayer
section_03  →  slide 3  · "Context"      · layout: three_panel  (use two_panel if only 2 clear topics)
section_04  →  slide 4  · "Passage"      · layout: two_panel
section_05  →  slide 5  · "Observations" · layout: two_panel
section_06  →  slide 6  · "Takeaways"    · layout: card_grid
section_07  →  slide 7  · "Christ"       · layout: quote_feature
section_08  →  slide 8  · "Apply"        · layout: steps_list
section_09  →  slide 9  · "Discussion"   · layout: questions_list
section_10  →  slide 10 · "Close"        · layout: prayer

───────────────────────────────────────────────────
LAYOUT FIELD SPECIFICATIONS
───────────────────────────────────────────────────

## cover
Source: section_01.key_facts + section_01.html_content
{
  "label":       "ScripturePath Bible Study",
  "title":       "<Book Chapter:Verses>",
  "subtitle":    "<key_theme trimmed to max 10 words>",
  "meta_row":    ["<genre>", "<book_date short e.g. c. AD 56>", "<read_time>", "<author short>"],
  "key_figure":  "<key_figure>",
  "theme_brief": "<key_theme full sentence, max 25 words>"
}

## prayer  (sections 02 and 10)
Source: html content — strip all tags, split into natural sentence groups
{
  "heading": "Opening Prayer"  |  "Closing Prayer",
  "lines":   ["<sentence/phrase>", ...],   // max 6 lines, each max 16 words
  "close":   "Amen."
}

## two_panel  (sections 03 alt, 04, 05)
Source: html content — identify two natural halves (e.g. Literary Context + Historical Setting)
{
  "heading": "<slide heading>",
  "left": {
    "title": "<left panel title>",
    "items": [
      { "bold": "<label>:",  "text": "<description, max 2 lines>" }
    ]   // max 5 items
  },
  "right": {
    "title": "<right panel title>",
    "items": [
      { "bold": "<label>:", "text": "<description, max 2 lines>" }
    ]   // max 5 items
  }
}

## three_panel  (section 03 preferred when 3+ clear topics exist)
Source: html content — identify 3 thematic columns (e.g. OT Foundation, NT Fulfillment, Modern Relevance)
{
  "heading": "<slide heading>",
  "panels": [
    {
      "title": "<panel title>",
      "badge": "<key term or ref e.g. Genesis 2:2-3>",
      "items": ["<point 1>", "<point 2>", "<point 3>"]   // max 4 items, plain strings
    }
  ]   // exactly 3 panels
}

## card_grid  (section 06 — Takeaways)
Source: html content — extract exactly 4 key theological takeaways
{
  "heading": "Key Takeaways",
  "cards": [
    {
      "title": "<takeaway title, max 5 words>",
      "body":  "<2-3 sentence explanation, max 30 words>",
      "note":  "<scripture ref or supporting citation>"   // optional
    }
  ]   // exactly 4 cards
}

## quote_feature  (section 07 — Christ Connection)
Source: html content — identify the central Christ-pointing statement and supporting points
{
  "heading": "Christ Connection",
  "quote":   "<key verse or theological statement, max 30 words>",
  "source":  "<scripture reference>",
  "points":  [
    { "bold": "<short label>:", "text": "<explanation, max 2 lines>" }
  ]   // max 4 points
}

## steps_list  (section 08 — Apply)
Source: html content — extract practical application steps
{
  "heading": "Life Application",
  "steps": [
    {
      "num":     1,
      "title":   "<step name, max 4 words>",
      "action":  "<what to do, max 15 words>",
      "reflect": "<reflection question, max 12 words>"
    }
  ],   // max 6 steps
  "footer": "<brief encouragement sentence>"
}

## questions_list  (section 09 — Discussion)
Source: html content — group questions by category
{
  "heading": "Discussion Questions",
  "groups": [
    {
      "label":     "<category e.g. Comprehension | Interpretation | Heart | Deep Dive>",
      "questions": ["<Q1>", "<Q2>"]   // max 2 questions per group
    }
  ]   // max 4 groups
}

───────────────────────────────────────────────────
CONTENT RULES
───────────────────────────────────────────────────
1. Strip ALL HTML tags from every string value — no <p>, <strong>, <ul>, <li>, <h3>, etc.
2. Decode HTML entities: &amp; → &, &mdash; → —, &nbsp; → space, etc.
3. Every field value must be a plain string or array of plain strings — zero HTML.
4. Condense aggressively: slides are glanced, not read.
5. Preserve theological accuracy — never alter doctrine, key terms, or scripture references.
6. Do not fabricate scripture references or content not present in the source.
7. Prayer lines: break at natural sentence/clause boundaries. Each line ≤ 16 words.

───────────────────────────────────────────────────
OUTPUT FORMAT — return ONLY this JSON, no markdown fences, no commentary
───────────────────────────────────────────────────
{
  "meta": {
    "title": "<book passage>",
    "total_slides": 10
  },
  "slides": [
    {
      "id":           "s01",
      "section":      1,
      "section_name": "Glance",
      "layout":       "cover",
      "data":         { ...cover fields... }
    },
    {
      "id":           "s02",
      "section":      2,
      "section_name": "Prayer",
      "layout":       "prayer",
      "data":         { ...prayer fields... }
    },
    ... (10 slides total, sections 1-10 in order)
  ]
}`;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: deductResult, error: deductError } = await admin.rpc(
    "deduct_credits",
    { user_uuid: user.id, amount: 2 }
  );

  if (deductError) {
    console.error("[export-pdf] credit deduction error:", deductError);
    return Response.json({ error: "Failed to process credits" }, { status: 500 });
  }

  if (deductResult === -1) {
    return Response.json({ error: "Insufficient credits" }, { status: 402 });
  }

  const { studyData } = await request.json();

  let result;
  try {
    result = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 4000,
      system: PDF_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: JSON.stringify(studyData),
        },
      ],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Anthropic API error";
    console.error("[export-pdf] Anthropic error:", msg);
    return Response.json({ error: `Claude API error: ${msg}` }, { status: 502 });
  }

  try {
    const content = result.content[0];
    if (content.type !== "text") throw new Error("Unexpected response format");
    const match = content.text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found in response");
    const slideSpec = JSON.parse(match[0]);
    return Response.json(slideSpec);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to parse slide spec";
    console.error("[export-pdf] parse error:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
