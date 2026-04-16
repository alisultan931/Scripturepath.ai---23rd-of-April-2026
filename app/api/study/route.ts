import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a Bible study proposal generator. Return valid JSON only — no markdown, no explanation.

Output exactly this structure:
{
  "title": "Short punchy title, max 8 words, use em dash style if passage (e.g. Psalm 23 — The Good Shepherd)",
  "scripture_ref": "Passage range (e.g. Psalm 23:1-6)",
  "summary": "One compelling sentence that captures the central truth — written to inspire, not describe",
  "theme": "2-4 words, Title Case",
  "audience": "Chosen audience",
  "tone": "Chosen tone",
  "key_verses": ["Book X:Y", "Book X:Y", "Book X:Y"]
}

Rules:
- Only cite Bible verses you are certain exist — no invented references
- scripture_ref must be a real, specific passage range
- key_verses must be exactly 3 SINGLE verse references (no ranges), all within scripture_ref
- title is short and punchy — 8 words max
- summary is one sentence, no quotation marks, written to inspire the reader
- theme is 2-4 words, Title Case
- If audience is Auto-detect, select best fit from: Adult Sunday School, Small Group, Sermon/Pulpit, Youth Group, Women Ministry, Men Ministry, New Believers, Personal Devotion
- If tone is Auto-detect, select best fit from: Devotional, Expository, Topical, Evangelistic, Academic`;

export async function POST(request: Request) {
  const { query, audience, tone, translation } = await request.json();

  let message;
  try {
    message = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Topic/Query: ${query}
Target Audience: ${audience}
Teaching Tone: ${tone}
Bible Translation: ${translation}`,
        },
      ],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Anthropic API error";
    return Response.json({ error: msg }, { status: 502 });
  }

  const content = message.content[0];
  if (content.type !== "text") {
    return Response.json({ error: "Unexpected response format" }, { status: 500 });
  }

  try {
    const raw = content.text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const proposal = JSON.parse(raw);
    if (!Array.isArray(proposal.key_verses)) {
      proposal.key_verses = [];
    }
    return Response.json(proposal);
  } catch {
    return Response.json({ error: "Failed to parse proposal" }, { status: 500 });
  }
}
