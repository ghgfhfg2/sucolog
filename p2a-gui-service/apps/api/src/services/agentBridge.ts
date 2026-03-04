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

  throw new Error(`Unsupported AGENT_BRIDGE_MODE: ${mode}`);
}
