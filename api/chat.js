import { readFileSync } from "fs";
import { join } from "path";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Simple per-IP sliding-window limiter to deter abuse/cost-runaway on the
// Anthropic API. Lives in function-instance memory: Fluid Compute reuses
// instances across requests, so this holds up for normal traffic even
// though it isn't shared across cold starts or regions.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 8;
const rateLimitBuckets = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(ip);

  if (!bucket || now > bucket.resetAt) {
    rateLimitBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  bucket.count += 1;
  return bucket.count > RATE_LIMIT_MAX_REQUESTS;
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress ?? "unknown";
}

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

  if (isRateLimited(getClientIp(req))) {
    res.status(429).json({ error: "요청이 너무 많아요. 1분 후 다시 시도해주세요." });
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
