import { execFile } from "node:child_process";
import { promisify } from "node:util";
const execFileAsync = promisify(execFile);
function inferTopic(prompt) {
    const cleaned = prompt
        .replace(/\s+/g, " ")
        .replace(/["'`]/g, "")
        .trim();
    if (cleaned.length <= 40)
        return cleaned;
    return `${cleaned.slice(0, 40)}...`;
}
function makeMockItems(prompt, count) {
    const topic = inferTopic(prompt);
    return Array.from({ length: count }).map((_, i) => ({
        id: i + 1,
        title: `${topic} 결과 ${i + 1}`,
        content: `${topic}에 대한 생성 결과 샘플 ${i + 1}입니다. 실사용에서는 openclaw-cli 모드에서 실제 응답으로 대체됩니다.`,
        category: "generated",
        createdAt: new Date().toISOString()
    }));
}
function extractJsonPayload(text) {
    const trimmed = text.trim();
    try {
        return JSON.parse(trimmed);
    }
    catch {
        // continue
    }
    const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch?.[1]) {
        try {
            return JSON.parse(codeBlockMatch[1]);
        }
        catch {
            // continue
        }
    }
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
        try {
            return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
        }
        catch {
            // continue
        }
    }
    const firstBracket = trimmed.indexOf("[");
    const lastBracket = trimmed.lastIndexOf("]");
    if (firstBracket >= 0 && lastBracket > firstBracket) {
        try {
            const arr = JSON.parse(trimmed.slice(firstBracket, lastBracket + 1));
            return { items: arr };
        }
        catch {
            // continue
        }
    }
    throw new Error("Unable to parse JSON payload from agent response");
}
function fallbackItemsFromText(text, count) {
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
function buildGenerationMessage(req) {
    const prompt = req.prompt;
    const isSong = /노래|가사|lyrics?|song/i.test(prompt);
    if (isSong) {
        return [
            "You generate Korean song assets for a backend service.",
            `Generate exactly ${req.outputCount} songs from this request: ${prompt}`,
            "Return ONLY valid JSON.",
            "Required shape (exact keys):",
            '{"items":[{"title":"...","lyrics":"...","styles":"..."}]}',
            "Do not include any other keys unless explicitly requested.",
            "lyrics must be a full lyric, not a short summary:",
            "- at least 12 lines",
            "- include sections with labels: [Verse 1], [Chorus], [Verse 2], [Bridge], [Chorus]",
            "- each line should feel singable in Korean",
            "styles should include vocal tone/layer/BPM/dynamics in one concise line.",
            "No markdown fences, no extra explanation."
        ].join("\n");
    }
    return [
        "You are generating structured data items for a backend service.",
        `Generate exactly ${req.outputCount} items based on this request: ${prompt}`,
        "Return ONLY valid JSON with this exact shape:",
        '{"items":[{"id":1,"title":"...","content":"..."}]}',
        "content must be substantial and useful (not one line).",
        "No markdown, no extra commentary."
    ].join("\n");
}
function normalizeSongItems(items) {
    return items.map((item) => {
        const title = String(item.title ?? item.name ?? "Untitled");
        const lyrics = String(item.lyrics ?? item.content ?? "");
        const styles = String(item.styles ?? item.style ?? item.concept ?? "");
        return { title, lyrics, styles };
    });
}
async function callOpenClawCli(req) {
    const command = process.env.OPENCLAW_BIN ?? "openclaw";
    const timeoutSeconds = Number(process.env.OPENCLAW_AGENT_TIMEOUT_SECONDS ?? "120");
    const sessionId = process.env.OPENCLAW_AGENT_SESSION_ID ?? "p2a-worker";
    const message = buildGenerationMessage(req);
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
    const outer = JSON.parse(stdout);
    const raw = outer.reply ??
        outer.output ??
        outer.payloads?.[0]?.text ??
        outer.result?.payloads?.[0]?.text ??
        "";
    const isSong = /노래|가사|lyrics?|song/i.test(req.prompt);
    try {
        const parsed = extractJsonPayload(raw);
        if (Array.isArray(parsed.items)) {
            return isSong ? normalizeSongItems(parsed.items) : parsed.items;
        }
        throw new Error("OpenClaw agent response missing items[]");
    }
    catch {
        const fallback = fallbackItemsFromText(raw, req.outputCount);
        return isSong ? normalizeSongItems(fallback) : fallback;
    }
}
export async function requestAgentGeneration(req) {
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
        const json = (await response.json());
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
