import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type AgentBridgeRequest = {
  prompt: string;
  outputCount: number;
};

export type AgentBridgeResponseItem = Record<string, unknown>;

function makeMockItems(prompt: string, count: number): AgentBridgeResponseItem[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: i + 1,
    title: `Agent generated item ${i + 1}`,
    summary: `Prompt: ${prompt}`,
    tags: ["agent", "p2a"],
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
    return JSON.parse(codeBlockMatch[1]);
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
  }

  throw new Error("Unable to parse JSON payload from agent response");
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
  const parsed = extractJsonPayload(raw) as { items?: AgentBridgeResponseItem[] };

  if (!Array.isArray(parsed.items)) {
    throw new Error("OpenClaw agent response missing items[]");
  }

  return parsed.items;
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
