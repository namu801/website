import { readFileSync } from "fs";
import { join } from "path";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const RULES_TEMPLATE = readFileSync(
  join(process.cwd(), "chat-rules.md"),
  "utf-8",
);

function buildInstructions() {
  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return RULES_TEMPLATE.replace("{{TODAY}}", today);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { message, history } = req.body ?? {};

  if (typeof message !== "string" || !message.trim()) {
    res.status(400).json({ error: "Missing 'message' in request body" });
    return;
  }

  const safeHistory = Array.isArray(history)
    ? history.filter(
        (turn) =>
          turn &&
          (turn.role === "user" || turn.role === "assistant") &&
          typeof turn.content === "string",
      )
    : [];

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: buildInstructions(),
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [...safeHistory, { role: "user", content: message }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    res.status(200).json({ reply: textBlock?.text ?? "" });
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: "죄송해요, 문제가 발생했어요. 잠시 후 다시 시도해주세요." });
  }
}
