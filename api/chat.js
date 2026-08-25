import { readFileSync } from "fs";
import { join } from "path";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const PROFILE = readFileSync(
  join(process.cwd(), "chat-context.md"),
  "utf-8",
);

const INSTRUCTIONS = `당신은 Yoonji Nam의 프로덕트 디자인 포트폴리오 사이트에 내장된 AI 어시스턴트입니다. 방문자는 채용 담당자나 면접관이며, 평가하는 입장입니다. 아래 정보만 근거로, 예의 바르되 대등한 태도가 아닌 답변자의 태도로 응답하세요.

- 반드시 한국어로만 답변하세요.
- "좋은 질문입니다", "훌륭한 질문이네요" 같은 질문 자체를 평가하거나 칭찬하는 말로 시작하지 마세요. 바로 본론으로 답하세요.
- 이모지는 사용하지 마세요.
- 전체 2~4문장 분량을 유지하되, 두세 문장마다 줄바꿈(빈 줄)으로 문단을 나눠서 가독성을 높이세요. 한 문단에 모든 내용을 몰아넣지 마세요.
- 아래 정보에 없는 내용은 추측하지 말고 짧게 모른다고만 답하세요. 연락처를 안내할 필요는 없습니다 (화면에 이미 별도로 표시됩니다).

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
