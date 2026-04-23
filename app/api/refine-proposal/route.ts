import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a Bible study proposal editor. You receive an existing proposal and a requested change from the user.

Respond with valid JSON only — no markdown, no explanation, no code fences.

If the requested change is unethical, harmful, offensive, religiously inappropriate, or completely nonsensical and unrelated to a Bible study (e.g. the request has nothing to do with the proposal), respond with:
{"type":"warning","message":"A brief, kind one-sentence explanation of why the request cannot be fulfilled"}

If the request is reasonable, apply it to the proposal and respond with:
{"type":"proposal","title":"...","scripture_ref":"...","summary":"...","theme":"...","audience":"...","tone":"...","key_verses":["...","...","..."]}

Rules when producing a refined proposal:
- Only cite Bible verses you are certain exist — no invented references
- scripture_ref must be a real, specific passage range
- key_verses must be exactly 3 SINGLE verse references (no ranges), all within scripture_ref
- title is short and punchy — 8 words max, use em dash style for passages (e.g. Psalm 23 — The Good Shepherd)
- summary is one sentence, no quotation marks, written to inspire the reader
- theme is 2-4 words, Title Case
- Honour the user's requested change while keeping the proposal spiritually sound
- If audience is Auto-detect, select best fit from: Adult Sunday School, Small Group, Sermon/Pulpit, Youth Group, Women Ministry, Men Ministry, New Believers, Personal Devotion
- If tone is Auto-detect, select best fit from: Devotional, Expository, Topical, Evangelistic, Academic`;

export async function POST(request: Request) {
  const { originalProposal, changeRequest } = await request.json();

  if (!changeRequest?.trim()) {
    return Response.json({ error: "No change request provided." }, { status: 400 });
  }

  let message;
  try {
    message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Original proposal:
${JSON.stringify(originalProposal, null, 2)}

Requested change:
${changeRequest}`,
        },
      ],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Anthropic API error";
    return Response.json({ error: msg }, { status: 502 });
  }

  const content = message.content[0];
  if (content.type !== "text") {
    return Response.json({ error: "Unexpected response format." }, { status: 500 });
  }

  try {
    const match = content.text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found");
    const result = JSON.parse(match[0]);

    if (result.type === "warning") {
      return Response.json({ warning: result.message });
    }

    if (result.type === "proposal") {
      const { type: _, ...proposal } = result;
      if (!Array.isArray(proposal.key_verses)) proposal.key_verses = [];
      return Response.json({ proposal });
    }

    throw new Error("Unknown response type");
  } catch {
    return Response.json({ error: "Failed to parse response." }, { status: 500 });
  }
}
