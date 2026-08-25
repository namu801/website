import { readFileSync } from "fs";
import { join } from "path";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const PROFILE = readFileSync(
  join(process.cwd(), "chat-context.md"),
  "utf-8",
);

const INSTRUCTIONS = `당신은 Yoonji Nam의 프로덕트 디자인 포트폴리오 사이트에 내장된 AI 어시스턴트입니다. 방문자(주로 채용 담당자)의 질문에 아래 정보만 근거로 답하세요.

- 반드시 한국어로만 답변하세요.
- 2~4문장, 따뜻하고 전문적인 톤을 유지하세요.
- 이모지는 사용하지 마세요.
- 아래 정보에 없는 내용은 추측하지 말고, 모른다고 말한 뒤 zjavbxjlove@naver.com으로 직접 문의하시라고 안내하세요.

--- Yoonji Nam 정보 ---
${PROFILE}`;

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
      system: INSTRUCTIONS,
      messages: [...safeHistory, { role: "user", content: message }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    res.status(200).json({ reply: textBlock?.text ?? "" });
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: "죄송해요, 문제가 발생했어요. 잠시 후 다시 시도해주세요." });
  }
}
