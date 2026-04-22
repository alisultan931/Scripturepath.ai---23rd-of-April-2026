import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import type { Proposal } from "@/components/ui/proposal";

const client = new Anthropic();

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { original, edited }: { original: Proposal; edited: Proposal } = await request.json();

  const changes: string[] = [];
  if (original.title !== edited.title)
    changes.push(`Title changed from "${original.title}" to "${edited.title}"`);
  if (original.scripture_ref !== edited.scripture_ref)
    changes.push(`Scripture reference changed from "${original.scripture_ref}" to "${edited.scripture_ref}"`);
  if (original.summary !== edited.summary)
    changes.push(`Summary changed from "${original.summary}" to "${edited.summary}"`);
  if (original.theme !== edited.theme)
    changes.push(`Theme changed from "${original.theme}" to "${edited.theme}"`);
  if (original.audience !== edited.audience)
    changes.push(`Audience changed from "${original.audience}" to "${edited.audience}"`);
  if (original.tone !== edited.tone)
    changes.push(`Tone changed from "${original.tone}" to "${edited.tone}"`);
  const origVerses = (original.key_verses ?? []).join(", ");
  const editedVerses = (edited.key_verses ?? []).join(", ");
  if (origVerses !== editedVerses)
    changes.push(`Key verses changed from "${origVerses}" to "${editedVerses}"`);

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 300,
    system: `You are a theological content moderator for ScripturePath.ai, a Christian Bible study platform. Your job is to review user edits to AI-generated Bible study proposals and determine if they are appropriate.

APPROVE edits that:
- Correct or refine the scripture reference, title, summary, theme, or key verses
- Adjust audience or tone preferences
- Improve clarity or focus of the study proposal
- Are reasonable Bible study customizations

REJECT edits that:
- Contain offensive, blasphemous, or harmful content
- Replace biblical content with non-Christian or anti-Christian material
- Are clearly nonsensical, test/dummy data (e.g. "asdf", "test123", random characters)
- Promote harmful ideologies or contain hate speech
- Include content unrelated to Bible study (spam, advertising, etc.)

Respond with valid JSON only — no markdown, no preamble:
{"ethical": true} if the edits are acceptable
{"ethical": false, "message": "brief, kind explanation of the issue for the user"} if not acceptable`,
    messages: [
      {
        role: "user",
        content: `Please review these edits to a Bible study proposal:\n\n${changes.join("\n")}\n\nFull edited proposal:\nTitle: ${edited.title}\nScripture: ${edited.scripture_ref}\nSummary: ${edited.summary}\nTheme: ${edited.theme}\nAudience: ${edited.audience}\nTone: ${edited.tone}\nKey Verses: ${editedVerses}`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    return Response.json({ ethical: true });
  }

  try {
    const match = content.text.match(/\{[\s\S]*\}/);
    if (!match) return Response.json({ ethical: true });
    const result = JSON.parse(match[0]);
    return Response.json(result);
  } catch {
    return Response.json({ ethical: true });
  }
}
