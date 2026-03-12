import { requestAgentGeneration } from "./agentBridge.js";
export async function generateStructuredItems(prompt, count) {
    // 외부 OpenAI API 호출 대신 에이전트 브리지로 처리
    return requestAgentGeneration({
        prompt,
        outputCount: count
    });
}
