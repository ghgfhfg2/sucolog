import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type AgentBridgeRequest = {
  prompt: string;
  outputCount: number;
};

export type AgentBridgeResponseItem = Record<string, unknown>;

function inferTopic(prompt: string) {
  const cleaned = prompt
    .replace(/\s+/g, " ")
    .replace(/["'`]/g, "")
    .trim();

  if (cleaned.length <= 40) return cleaned;
  return `${cleaned.slice(0, 40)}...`;
}

function makeMockItems(prompt: string, count: number): AgentBridgeResponseItem[] {
  const topic = inferTopic(prompt);

  return Array.from({ length: count }).map((_, i) => ({
    id: i + 1,
    title: `${topic} 결과 ${i + 1}`,
    content: `${topic}에 대한 생성 결과 샘플 ${i + 1}입니다. 실사용에서는 openclaw-cli 모드에서 실제 응답으로 대체됩니다.`,
    category: "generated",
    createdAt: new Date().toISOString()
  }));
}

function extractJsonPayload(text: string) {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    // continue
  }

  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch?.[1]) {
    try {
      return JSON.parse(codeBlockMatch[1]);
    } catch {
      // continue
    }
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    try {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    } catch {
      // continue
    }
  }

  const firstBracket = trimmed.indexOf("[");
  const lastBracket = trimmed.lastIndexOf("]");
  if (firstBracket >= 0 && lastBracket > firstBracket) {
    try {
      const arr = JSON.parse(trimmed.slice(firstBracket, lastBracket + 1));
      return { items: arr };
    } catch {
      // continue
    }
  }

  throw new Error("Unable to parse JSON payload from agent response");
}

function fallbackItemsFromText(text: string, count: number): AgentBridgeResponseItem[] {
  const cleaned = text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^\s*\[\[.*?\]\]\s*/gm, "")
    .trim();

  const blocks = cleaned
    .split(/\n\s*\n/)
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, count);

  if (!blocks.length) {
    return Array.from({ length: count }).map((_, i) => ({
      id: i + 1,
      title: `Generated item ${i + 1}`,
      content: "(Agent output parse fallback)",
      createdAt: new Date().toISOString()
    }));
  }

  return blocks.map((b, i) => ({
    id: i + 1,
    title: b.split("\n")[0]?.slice(0, 80) || `Generated item ${i + 1}`,
    content: b,
    createdAt: new Date().toISOString()
  }));
}

async function callOpenClawCli(
  req: AgentBridgeRequest
): Promise<AgentBridgeResponseItem[]> {
  const command = process.env.OPENCLAW_BIN ?? "openclaw";
  const timeoutSeconds = Number(process.env.OPENCLAW_AGENT_TIMEOUT_SECONDS ?? "120");
  const sessionId = process.env.OPENCLAW_AGENT_SESSION_ID ?? "p2a-worker";

  const message = [
    "You are generating structured data items for a backend service.",
    `Generate exactly ${req.outputCount} items based on this request: ${req.prompt}`,
    "Return ONLY valid JSON with this exact shape:",
    '{"items":[{"id":1,"title":"...","summary":"..."}]}',
    "No markdown, no extra commentary."
  ].join("\n");

  const args = [
    "agent",
    "--session-id",
    sessionId,
    "--message",
    message,
    "--json",
    "--thinking",
    "low",
    "--timeout",
    String(timeoutSeconds)
  ];

  const { stdout } = await execFileAsync(command, args, {
    timeout: timeoutSeconds * 1000
  });

  const outer = JSON.parse(stdout) as { reply?: string; output?: string };
  const raw = outer.reply ?? outer.output ?? "";

  try {
    const parsed = extractJsonPayload(raw) as { items?: AgentBridgeResponseItem[] };
    if (Array.isArray(parsed.items)) {
      return parsed.items;
    }
    throw new Error("OpenClaw agent response missing items[]");
  } catch {
    return fallbackItemsFromText(raw, req.outputCount);
  }
}

export async function requestAgentGeneration(
  req: AgentBridgeRequest
): Promise<AgentBridgeResponseItem[]> {
  const mode = process.env.AGENT_BRIDGE_MODE ?? "mock";

  if (mode === "mock") {
    return makeMockItems(req.prompt, req.outputCount);
  }

  if (mode === "webhook") {
    const webhookUrl = process.env.AGENT_BRIDGE_WEBHOOK_URL;
    if (!webhookUrl) {
      throw new Error("AGENT_BRIDGE_WEBHOOK_URL is required in webhook mode");
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.AGENT_BRIDGE_BEARER_TOKEN
          ? { Authorization: `Bearer ${process.env.AGENT_BRIDGE_BEARER_TOKEN}` }
          : {})
      },
      body: JSON.stringify(req)
    });

    if (!response.ok) {
      throw new Error(`Agent bridge webhook failed: ${response.status}`);
    }

    const json = (await response.json()) as { items?: AgentBridgeResponseItem[] };

    if (!Array.isArray(json.items)) {
      throw new Error("Agent bridge webhook returned invalid payload: items[] missing");
    }

    return json.items;
  }

  if (mode === "openclaw-cli") {
    return callOpenClawCli(req);
  }

  throw new Error(`Unsupported AGENT_BRIDGE_MODE: ${mode}`);
}
