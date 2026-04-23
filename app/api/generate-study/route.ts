import Anthropic from "@anthropic-ai/sdk";
import { jsonrepair } from "jsonrepair";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const client = new Anthropic();

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

const SYSTEM_PROMPT_1 = `You are ScripturePath.ai, a Bible study generation assistant. Return valid JSON only — no markdown, no preamble, no code fences.

ABSOLUTE RULES — violating any is a critical failure:

RULE 1 - SCRIPTURE INTEGRITY: God's Word is never edited. Only KJV translation is used, sourced from bible-api.com (public domain). The full KJV passage text is provided below for reference. Never paraphrase, reword, or alter a Bible verse. Short inline quotes (≤15 words) are acceptable. NEVER paste the full passage text in section_04 — it is a reading guide only, not the text itself.

RULE 2 - PRAYERS TO JESUS: The prayer in section_02 MUST be addressed directly to Jesus Christ. Use "Jesus" or "Lord Jesus" by name explicitly — in the first line and at least twice total. Not "God" alone, not "Lord" alone, not "Father" alone — specifically Jesus Christ. This is REGEX-CHECKED by the backend.

RULE 3 - TRINITY ONLY: Only the Father, the Son (Jesus Christ), and the Holy Spirit receive worship, honour, and praise. Never imply non-Trinitarian frameworks.

RULE 4 - NO FABRICATED DOCTRINE: Where major Christian traditions differ, present 2–3 mainstream interpretations fairly, labelled by tradition name ("Reformed traditions emphasise…", "Catholic teaching holds…", "Many evangelical traditions…"). NEVER declare one view correct unless the passage text is explicit and unambiguous.

RULE 5 - SCRIPTURE-FIRST INTEGRITY: section_05 is pure observation only — what the text says, not what it means. Interpretation belongs in section_06 (generated in Call 2). Application belongs in section_08 (Call 2). No novelty for novelty's sake.

RULE 6 - NO FABRICATED HISTORY: Never invent dates, named discoveries, excavations, inscriptions, or manuscripts. If a claim cannot be stated responsibly, write: "I cannot confirm this; a safer reading is…"

RULE 7 - CONFIDENCE MARKERS: Every historical claim must carry a confidence marker. Use inline phrases: "(widely accepted)", "(scholars suggest)", "traditionally believed", "(scholarly debate exists)", or "commonly dated to". Only high and medium confidence claims appear by default. Never state uncertain things as absolute fact.

UNIQUENESS REQUIREMENT (per study):
- All content must be specific to this passage and study
- The prayer must reference themes from this specific passage — never generic
- Observations must be drawn from the actual verse text provided below
- The key theme in section_01 must be specific to this passage, not a generic theological statement`;

const SYSTEM_PROMPT_2 = `You are ScripturePath.ai, a Bible study generation assistant. Return valid JSON only — no markdown, no preamble, no code fences.

ABSOLUTE RULES — violating any is a critical failure:

RULE 1 - SCRIPTURE INTEGRITY: God's Word is never edited. Only KJV translation is used, sourced from bible-api.com (public domain). Never paraphrase, reword, or alter a Bible verse. Short inline quotes (≤15 words) are acceptable. Never paste large blocks of verse text in sections 06–10; reference by verse citation only.

RULE 2 - PRAYERS TO JESUS: The closing prayer in section_10 MUST be addressed directly to Jesus Christ. Use "Jesus" or "Lord Jesus" by name explicitly — in the first line and at least twice total. Not "God" alone, not "Lord" alone, not "Father" alone — specifically Jesus Christ. This is REGEX-CHECKED by the backend.

RULE 3 - TRINITY ONLY: Only the Father, the Son (Jesus Christ), and the Holy Spirit receive worship, honour, and praise. Never imply non-Trinitarian frameworks.

RULE 4 - NO FABRICATED DOCTRINE: Where major Christian traditions differ, present 2–3 mainstream interpretations fairly, labelled by tradition name ("Reformed traditions emphasise…", "Catholic teaching holds…", "Many evangelical traditions…"). NEVER declare one view correct unless the passage text is explicit and unambiguous.

RULE 5 - SCRIPTURE-FIRST INTEGRITY: Interpretation in section_06 must be anchored to specific verses. Application in section_08 must flow from interpretation — grace-driven, not moralistic. No novelty for novelty's sake.

RULE 6 - NO FABRICATED HISTORY: Never invent historical claims, dates, discoveries, or figures. If uncertain: "I cannot confirm this; a safer reading is…"

RULE 7 - CONFIDENCE MARKERS: Any historical claim must carry a confidence marker. Use: "(widely accepted)", "(scholars suggest)", "traditionally believed", or "(scholarly debate exists)". Only high and medium confidence claims by default.

UNIQUENESS REQUIREMENT (per study):
- Every takeaway must be specific to this passage — no generic theology applicable to any text
- The one-line takeaway in section_10 must be original phrasing, unique to this study, unmistakably about the passage
- Life applications must be concrete, specific, and checkable — "Pray more" is a failure
- At least one takeaway must challenge a common shallow reading of the passage`;

function buildUserPrompt1(
  title: string,
  passage: string,
  description: string,
  theme: string,
  audience: string,
  tone: string,
  depth: string,
  passageText: string,
  passageUrl: string,
): string {
  const bgUrl = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(passage)}&version=KJV`;
  const esvUrl = `https://www.esv.org/${passage.replace(/\s+/g, "+")}`;
  return `Study Details:
Title: ${title}
Passage: ${passage}
Description: ${description}
Theme: ${theme}
Audience: ${audience}
Tone: ${tone}
Depth: ${depth}

KJV Passage Text (verbatim — public domain, sourced from bible-api.com):
${passageText}

---

Generate Sections 01 through 05. Return valid JSON with exactly these top-level keys in order: section_01, section_02, section_03, section_04, section_05.

Apply depth rules:

IF depth is "normal":
  - section_02 prayer: 6–8 lines
  - section_03: three sub-sections only (Literary Context, Historical Setting, Why It Matters Today)
  - section_05: 5–8 observations
  - section_01 read time label: "~15 min"

IF depth is "deep_dive":
  - section_02 prayer: 8–10 lines
  - section_03: five sub-sections (add Scholarly Notes and Archaeological Context)
  - section_05: 8–12 observations
  - section_01 read time label: "~45 min"

---

SECTION 01 — AT A GLANCE

Purpose: Instant orientation panel before the study begins.

Return an object with exactly two fields: key_facts (a JSON object) and html_content (an HTML string).

key_facts must contain exactly these 11 fields:
  book_date            — Date range using "commonly dated to" phrasing
  book_date_confidence — One of: "high", "medium", or "cautious"
  traditional_attribution — Authorship using "traditionally attributed to" phrasing; if disputed: "varies by tradition"
  tradition_note       — Note if authorship is debated, or null if not
  key_figure           — Central person(s) in this passage (comma-separated if multiple)
  genre                — Pipe-separated genres matching the books: e.g. "Law | Prophecy | Gospel | Epistle" or single e.g. "Epistle"
  book_display         — Human-readable book label: if single book use "BookName (Genre)" e.g. "Romans (Epistle)"; if multiple books use "Multiple books: Book1 (Genre1), Book2 (Genre2), ..."
  key_theme            — One-line core message specific to this passage — not generic
  read_time            — "~15 minutes" (normal depth) or "~45 minutes" (deep_dive depth)
  source_label         — Always "bible-api.com"
  passage_url          — "${passageUrl}"

html_content must contain exactly ONE sentence placing this passage in the Bible's big story (Creation → Fall → Redemption → Restoration). Wrap it in a single <p> tag. No heading, no theme, no read time — just that one sentence.

Rules: Never invent authorship or dates. Use "traditionally attributed to" and "commonly dated to". If authorship is debated, say "varies by tradition" and add a tradition_note.

---

SECTION 02 — OPENING PRAYER

Purpose: Set the heart posture before study. Create reverence, not performance.

ABSOLUTE RULE: Prayer MUST be addressed directly to Jesus Christ. Use "Jesus" or "Lord Jesus" by name. First line must address Jesus. Must contain "Jesus" at least twice. REGEX-CHECKED.

Requirements:
- Open by addressing Jesus by name in the very first line
- Reference the specific passage or theme from ${passage} — not a generic prayer
- Express desire for truth and understanding of this specific text
- Ask for openness to the Spirit's conviction and correction
- Request empowerment to apply what is learned
- Warm, reverent, and personal — never preachy or formulaic
- 6–8 lines (normal) or 8–10 lines (deep_dive)
- End with "Amen."

Return as an HTML string wrapped in <p> tags.
Example format: "<p>Lord Jesus, as we open this passage today...</p>"

---

SECTION 03 — CONTEXT & BACKGROUND

Purpose: Help the reader understand the world behind the text — making the ancient accessible.

Structure using <h3> sub-headings:

1. Literary Context
   - What comes immediately before ${passage} in the book
   - What comes immediately after
   - How this passage fits the author's overall argument or narrative arc

2. Historical Setting
   - 2–4 historical or cultural background points (widely accepted only)
   - For EACH point: explain "How this affects how we read the text"
   - Use "traditionally associated with" for authorship, "commonly dated to" for dates
   - If uncertain about any claim: "I cannot confirm this; a safer reading is…"
   - Every claim must carry a confidence marker

3. Why It Matters Today
   - 1–2 specific points connecting the ancient context to contemporary life for ${audience}
   - Be specific about WHY the context changes the reader's understanding

IF depth is "deep_dive", add:

4. Scholarly Notes
   - 1–2 scholarly framing points (source criticism, literary structure debates, textual issues)
   - Present debates fairly, labelled by tradition or scholarly camp

5. Archaeological Context
   - Open with: "External evidence can help, but Scripture remains primary."
   - 1–2 cautious points with explicit confidence markers
   - NEVER invent discoveries, excavations, inscriptions, or manuscripts

Return as an HTML string with <h3> sub-headings, <p> paragraphs, <ul> lists where appropriate.

---

SECTION 04 — READ THE PASSAGE

Purpose: Guide the reader into the text before analysing it. This is a reading GUIDE — NEVER paste the full passage text.

Structure:

1. Passage Reference
   - Display "${passage}" prominently in an <h3> tag
   - Reading prompt: "Before we dig in, read the passage slowly."
   - Source line (copy exactly): 'Read the full passage at <a href="${bgUrl}" target="_blank" rel="noopener">Bible Gateway</a> or <a href="${esvUrl}" target="_blank" rel="noopener">ESV.org</a>.'

2. Three-Pass Reading Plan
   Introduce with: "Before engaging the questions and commentary below, read through all passages using this three-pass approach. Each pass takes only a few minutes but significantly deepens engagement."
   As a numbered list (<ol>), give these three distinct reading passes with their sub-headings and guiding questions:
   Pass 1 — Read for Overall Flow and Story: "Read the whole passage without stopping. What is the overall movement? What is the author building toward?"
   Pass 2 — Read for Repeated Words and Phrases: "Read again, this time with a pen or highlighter. Mark every time you see words that repeat." Name 3–5 specific words that recur in this passage. Ask: "Why does this word keep appearing? What does its repetition signal?"
   Pass 3 — Read for Structure: "Read a final time looking for the literary shape of each passage." Name 2–3 specific structural features (commands, promises, contrasts, cause-and-effect chains). Ask: "How does each passage build its argument or tell its story?"

3. Key Verse Anchors
   - Introduce with: "Pay particular attention to these verses as you read:"
   - List 3–5 specific verses from the passage that deserve extra attention
   - For each: verse reference + 1 sentence explaining why it is a theological or narrative anchor

4. Optional Short Quotes
   - Include 1–2 very short quotes (≤15 words) from the passage as teasers — not the full text
   - Wrap each in <blockquote> tags

ABSOLUTE RULE: NEVER paste the full passage text. Return as an HTML string.

---

SECTION 05 — KEY OBSERVATIONS

Purpose: Pure observation — what the text says, not what it means.

CRITICAL RULE: PURE OBSERVATION only. No theological conclusions. No interpretive claims.

Start the section with this exact intro paragraph (italic):
<p><em>The following observations report only what the text says — no interpretation or theology yet. Each point cites the specific verse(s) observed.</em></p>

Then provide the numbered observations as an <ol>.

Categories to look for:
- WHO: Who is speaking? Who is addressed? Who is mentioned?
- WHAT: What actions occur? What commands are given? What promises?
- REPEATED WORDS: What words or phrases appear more than once?
- CONTRASTS: What opposites are set against each other?
- STRUCTURE: What is the logical flow? Chiasm? Parallel? List?
- CAUSE-AND-EFFECT: "Because X, therefore Y" patterns
- SURPRISES: Anything unexpected or counter-intuitive in the text

Count: 5–8 (normal) or 8–12 (deep_dive)

For each observation:
  - State what the text says (not what it means)
  - 1–2 sentences stating what the text explicitly says
  - Cite the specific verse(s)
  - Wrap verse references in <strong> tags

End with a Structure Snapshot: one sentence describing the passage's overall structure (e.g. "Paul builds an argument in three stages: suffering → perseverance → glory").

Return as an HTML string with <ol> for numbered observations.

---

SELF-CHECK — VERIFY EVERY POINT BEFORE RETURNING

1. Does section_01 contain BOTH key_facts (with all 11 required fields including book_display, key_theme, read_time) AND html_content (single big-story sentence)?
2. Does section_02 contain "Jesus" addressed directly? (REGEX-CHECKED)
3. Does section_03 cover Literary Context, Historical Setting, Why It Matters Today?
4. Does section_04 have Passage Reference, Three-Pass Reading Plan, Key Verse Anchors, and Optional Short Quotes WITHOUT pasting the full passage text?
5. Is section_05 PURE OBSERVATION only?
6. Are exactly the keys section_01 through section_05 returned?

IF ANY CHECK FAILS, FIX THE OUTPUT BEFORE RETURNING.

Response format — valid JSON only:
{
  "section_01": {
    "key_facts": {
      "book_date": "...",
      "book_date_confidence": "high | medium | cautious",
      "traditional_attribution": "traditionally attributed to ...",
      "tradition_note": "... or null",
      "key_figure": "...",
      "genre": "Law | Prophecy | Gospel | Epistle",
      "book_display": "Multiple books: Exodus (Law), Isaiah (Prophecy), ...",
      "key_theme": "...",
      "read_time": "~15 minutes",
      "source_label": "bible-api.com",
      "passage_url": "${passageUrl}"
    },
    "html_content": "<p>One sentence placing this passage in the Bible's big story.</p>"
  },
  "section_02": "<p>Lord Jesus, ...</p>",
  "section_03": "<h3>Literary Context</h3><p>...</p>",
  "section_04": "<h3>Passage reference</h3><p>Before we dig in...</p><p>Read the full passage at ...</p><ol><li>Pass 1...</li>...</ol><h3>Key Verse Anchors</h3>...<blockquote>Short quote...</blockquote>",
  "section_05": "<p><em>The following observations report only what the text says — no interpretation or theology yet. Each point cites the specific verse(s) observed.</em></p><ol><li>...<strong>Book Chapter:Verse</strong>...</li></ol><p><strong>Structure Snapshot:</strong> ...</p>"
}`;
}

function buildUserPrompt2(
  title: string,
  passage: string,
  description: string,
  theme: string,
  audience: string,
  tone: string,
  depth: string,
  passageText: string,
): string {
  return `Study Details:
Title: ${title}
Passage: ${passage}
Description: ${description}
Theme: ${theme}
Audience: ${audience}
Tone: ${tone}
Depth: ${depth}

KJV Passage Text (for reference — public domain, sourced from bible-api.com):
${passageText}

---

Generate Sections 06 through 10. Return valid JSON with exactly these top-level keys in order: section_06, section_07, section_08, section_09, section_10.

Apply depth rules:

IF depth is "normal":
  - section_06 key takeaways: 3–5
  - section_06 cross-references: 2–4
  - section_06 fresh angles: none
  - section_08 applications: 3–5, covering at least 2 distinct life domains
  - section_08 3-day plan: omit
  - section_09 questions: 5–8
  - section_09 deep dive markers: none
  - section_10 summary bullets: 5–7
  - section_10 prayer: 6–8 lines

IF depth is "deep_dive":
  - section_06 key takeaways: 5–7
  - section_06 cross-references: 4–6
  - section_06 fresh angles: 1–2 (at least one Christological)
  - section_08 applications: 5–7, covering at least 3 distinct life domains
  - section_08 3-day plan: include
  - section_09 questions: 8–10, mark 2 as [Deep Dive]
  - section_10 summary bullets: 7–10
  - section_10 prayer: 8–10 lines

---

SECTION 06 — KEY TAKEAWAYS & INTERPRETATION

Interpret the passage and extract key takeaways. Theme: ${theme}. Depth: ${depth}.

Structure:

1. THESIS SENTENCE
Open directly with a <p> containing exactly one sentence: "This passage teaches that…"
This sentence must be specific to this passage, not generic.
NO <h3> heading before this paragraph — it follows the section heading immediately.

2. KEY TAKEAWAYS
${depth === "deep_dive" ? "5–7 takeaways" : "3–5 takeaways"}
NO <h3> "Key Takeaways" heading. Each takeaway uses a numbered label in its headline.
For each takeaway:
- <h3> heading in this exact format: "Takeaway N: [Insight headline]" (e.g. "Takeaway 1: The Sabbath Is Grounded in Creation, Not Just Covenant")
- 2–3 sentences in <p> tags explaining and grounding it in the text
- At least one specific verse citation wrapped in <em>
- If the takeaway touches disputed doctrine: present 2–3 mainstream views neutrally inside the same <p>. Label by tradition ("Reformed traditions emphasise…", "Catholic teaching holds…", "Many evangelical traditions…"). NEVER declare one view as correct unless the passage text is explicit and unambiguous.

3. CROSS-REFERENCES
${depth === "deep_dive" ? "4–6 cross-references" : "2–4 cross-references"}
Use a single <h3>Cross-References</h3> heading, then a <ul>. Use these three exact category labels as <strong> inline labels:
- <strong>Clarifies a key term:</strong> another passage that defines a word used here
- <strong>Echoes the same theme:</strong> another passage making the same point
- <strong>Provides caution or balance:</strong> a passage that qualifies or nuances
For each item: 1 sentence explaining WHY it is relevant. No random verse-dumps.

IF depth is "deep_dive", add:
4. FRESH ANGLES
Use a single <h3>Fresh Angles</h3> heading.
1–2 perspectives that challenge a common shallow reading of this text.
- Must be gently stated and text-grounded (not provocative for shock value)
- At least one must connect to Jesus (a Christological reading) without forcing the connection
- Exact format for each: "A common reading says… But looking more closely, the text suggests…"

FORMATTING RULES FOR THIS SECTION:
- NEVER use "---" or "<hr>" as separators
- Use only <h3>, <strong>, <p>, <ul>, <li>, <em>, <blockquote>

Return as HTML string using <h3> for takeaway headings and sub-section headings, <p> for explanations, <ul> for cross-references.

---

SECTION 07 — CHRIST CONNECTION

Write 1–2 paragraphs showing how the passage connects to Jesus Christ.
- Natural and text-grounded connection
- At least one verse from the passage AND one New Testament text about Jesus
- End with a pull quote in <blockquote> tags

Return as HTML string.

---

SECTION 08 — LIFE APPLICATION

Write practical life applications for ${passage}. Theme: ${theme}. Depth: ${depth}.

STRUCTURE:

Open with this exact intro paragraph (italic):
<p><em>Each application flows from a specific textual insight and answers what God invites us to think, desire, and do.</em></p>

Then add a <hr> separator, then go directly into the applications — NO "Applications" heading or any other heading before the first application.

${depth === "deep_dive" ? "5–7 applications" : "3–5 applications"}

For each application:
- <h3> bold headline (1 line) — use format: "Application N: [headline]"
- <strong>From:</strong> verse citation from the passage
- <strong>Think:</strong> grace-driven theological shift (2–3 sentences) — root in what God has done, not moral commands
- <strong>Desire:</strong> heart-level longing (2–3 sentences)
- <strong>Do:</strong> one concrete, specific, checkable action this week — "This week, identify one relationship where you can practice the forgiveness described in v.12" is good. "Pray more" is NOT acceptable.

Every application must:
- Tie to a SPECIFIC insight from ${passage} (cite the verse)
- Be GRACE-DRIVEN: "Because Christ forgave you (v.13), you can extend that same forgiveness to…" not "You should forgive more."

Cover at least ${depth === "deep_dive" ? "3" : "2"} distinct life domains: relationships, work, speech, habits, service, conflict, finances, identity, community, rest, etc.

2. ACCOUNTABILITY SUGGESTION
One concrete action the user can take THIS WEEK. Make it small, specific, and measurable. Frame it as an act of faith.

IF deep_dive, add:

3. THREE-DAY MINI ACTION PLAN
For each of 3 days, provide:
- Micro-action: one small, doable thing (5–10 minutes)
- Prayer focus: a specific prayer point addressed to Jesus
- Reflection prompt: one question to journal or meditate on
Cover 3 distinct life domains across the 3 days.

Return as HTML string. Use <h3> for sub-headings and application headlines, <strong> for inline labels (Think:, Desire:, Do:, From:).

---

SECTION 09 — DISCUSSION QUESTIONS

Count: 5–8 (normal) or 8–10 (deep_dive)

Required types (label each in <em> tags):
[Ice-breaker] — 1, open-ended, no Bible knowledge needed (Question 1)
[Comprehension] — at least 2, answerable from the text
[Interpretation] — at least 2, requires thinking about meaning
[Heart-level] — at least 1, personal and reflective
[Community] — at least 1, outward-facing

IF deep_dive: mark exactly 2 questions [Deep Dive]

All questions must be open-ended. No yes/no questions.

Return as HTML string with <ol>.

---

SECTION 10 — SUMMARY & CLOSING PRAYER

Structure:
1. Summary Bullets (correct count for depth) — covering arc: observations → meaning → Christ → application
2. One-Line Takeaway in <blockquote>: "If you remember one thing from this study, let it be this: [original sentence specific to this passage]"
3. Closing Prayer — MUST address Jesus by name in first line, contain "Jesus" at least twice, end with "Amen."

Return as HTML string.

---

SELF-CHECK BEFORE RETURNING:
1. section_06 opens with "This passage teaches that…"? No "---" separators? Cross-references grouped by the three exact category labels? Disputed doctrine handled fairly with tradition labels?
2. section_07 has pull quote in <blockquote>?
3. All section_08 applications are grace-driven with checkable DO actions?
4. section_09 has correct question count and types?
5. section_10 has "If you remember one thing…" and closing prayer addresses Jesus?
6. Exactly keys section_06 through section_10 returned?

Response format — valid JSON only:
{
  "section_06": "<h3>Thesis</h3><p>This passage teaches that...</p>...",
  "section_07": "<p>...</p><blockquote>...</blockquote>",
  "section_08": "<h3>Applications</h3>...",
  "section_09": "<ol><li><em>[Ice-breaker]</em> ...</li>...</ol>",
  "section_10": "<ul><li>...</li></ul><blockquote>If you remember one thing from this study, let it be this: ...</blockquote><p>Lord Jesus, ...</p>"
}`;
}

async function fetchBibleChunk(query: string): Promise<string> {
  const res = await fetch(`https://bible-api.com/${query}`);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`bible-api.com ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  const text = data.text ?? data.verses?.map((v: { text: string }) => v.text).join(" ") ?? "";
  if (!text) throw new Error("Empty passage text from bible-api.com");
  return text;
}

async function fetchPassageText(passage: string): Promise<string> {
  // Cross-chapter verse range: "Book C1:V1-C2:V2"
  const versedRange = passage.match(/^(.+?)\s+(\d+):(\d+)\s*[-–]\s*(\d+):(\d+)$/);
  if (versedRange) {
    const [, book, sc, sv, ec, ev] = versedRange;
    const startChap = parseInt(sc), startVerse = parseInt(sv);
    const endChap = parseInt(ec), endVerse = parseInt(ev);
    const bq = book.toLowerCase().replace(/\s+/g, "+");

    if (endChap - startChap >= 1) {
      // Fetch each chapter individually to avoid cross-chapter 404s.
      // bible-api.com doesn't support cross-chapter ranges like C1:V1-C2:V2.
      // Middle chapters are fetched whole; last chapter uses :1-C:V.
      const chunks: string[] = [];
      for (let c = startChap; c <= endChap; c++) {
        if (c === startChap && startVerse > 1) {
          // Partial first chapter — fetch whole chapter for simplicity
          chunks.push(`${bq}+${c}`);
        } else if (c === endChap) {
          chunks.push(`${bq}+${c}:1-${c}:${endVerse}`);
        } else {
          chunks.push(`${bq}+${c}`);
        }
      }
      const parts = await Promise.all(chunks.map(fetchBibleChunk));
      return parts.join("\n");
    }
  }

  // Chapter-only range: "Book C1-C2"
  const chapterRange = passage.match(/^(.+?)\s+(\d+)\s*[-–]\s*(\d+)$/);
  if (chapterRange) {
    const [, book, sc, ec] = chapterRange;
    const startChap = parseInt(sc), endChap = parseInt(ec);
    const bq = book.toLowerCase().replace(/\s+/g, "+");

    if (endChap - startChap >= 1) {
      const chunks = Array.from({ length: endChap - startChap + 1 }, (_, i) =>
        `${bq}+${startChap + i}`
      );
      const parts = await Promise.all(chunks.map(fetchBibleChunk));
      return parts.join("\n");
    }
  }

  return fetchBibleChunk(passage.toLowerCase().replace(/\s+/g, "+"));
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = ADMIN_EMAILS.includes(user.email ?? "");

  const { title, passage, description, theme, audience, tone, depth } =
    await request.json();
  const { signal } = request;

  const admin = createAdminClient();

  if (!isAdmin) {
    if (depth === "deep_dive") {
      const { data: profile } = await admin
        .from("profiles")
        .select("subscription_status")
        .eq("id", user.id)
        .single();
      const status = profile?.subscription_status;
      if (status !== "active" && status !== "canceling" && status !== "trialing") {
        return Response.json({ error: "Deep Dive requires a trial or premium subscription" }, { status: 403 });
      }
    }

    const creditCost = depth === "deep_dive" ? 2 : 1;
    const { data: deductResult, error: deductError } = await admin.rpc(
      "deduct_credits",
      { user_uuid: user.id, amount: creditCost }
    );

    if (deductError) {
      console.error("[generate-study] credit deduction error:", deductError);
      return Response.json({ error: "Failed to process credits" }, { status: 500 });
    }

    if (deductResult === -1) {
      return Response.json({ error: "Insufficient credits" }, { status: 402 });
    }
  }

  const passageQuery = passage.toLowerCase().replace(/\s+/g, "+");
  const passageUrl = `https://bible-api.com/${passageQuery}`;

  let passageText: string;
  try {
    passageText = await fetchPassageText(passage);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch passage";
    console.error("[generate-study] bible-api.com error:", msg);
    return Response.json({ error: `Passage fetch failed: ${msg}` }, { status: 502 });
  }

  // Run both Claude calls in parallel
  let result1, result2;
  try {
    [result1, result2] = await Promise.all([
      client.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 8000,
        system: SYSTEM_PROMPT_1,
        messages: [
          {
            role: "user",
            content: buildUserPrompt1(title, passage, description, theme, audience, tone, depth, passageText, passageUrl),
          },
        ],
      }, { signal }),
      client.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 8000,
        system: SYSTEM_PROMPT_2,
        messages: [
          {
            role: "user",
            content: buildUserPrompt2(title, passage, description, theme, audience, tone, depth, passageText),
          },
        ],
      }, { signal }),
    ]);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Anthropic API error";
    console.error("[generate-study] Anthropic error:", msg);
    return Response.json({ error: `Claude API error: ${msg}` }, { status: 502 });
  }

  function extractJson(message: Anthropic.Message): Record<string, unknown> {
    if (message.stop_reason === "max_tokens") {
      console.error("[generate-study] Response truncated — increase max_tokens");
      throw new Error("Study generation was cut short. Please try again.");
    }
    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response format");
    const match = content.text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object found in response");
    return JSON.parse(jsonrepair(match[0]));
  }

  try {
    const sections1 = extractJson(result1);
    const sections2 = extractJson(result2);
    const studyData = { ...sections1, ...sections2 };

    await admin.from("studies").insert({
      user_id: user.id,
      title,
      scripture_ref: passage,
      study_data: studyData,
      depth,
      credits_used: isAdmin ? 0 : (depth === "deep_dive" ? 2 : 1),
    });

    return Response.json(studyData);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to parse study";
    return Response.json({ error: msg }, { status: 500 });
  }
}

// This is a single-line comment