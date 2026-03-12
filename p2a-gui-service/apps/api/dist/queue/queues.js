import { Queue, Worker } from "bullmq";
import { Redis } from "ioredis";
import { jobStore } from "../services/jobStore.js";
import { generateStructuredItems } from "../services/aiService.js";
import { saveOutputFile } from "../services/formatter.js";
const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const outputDir = process.env.OUTPUT_DIR ?? "./outputs";
const disableQueue = process.env.DISABLE_QUEUE === "true";
async function processGeneration(jobId, payload) {
    jobStore.update(jobId, { status: "running" });
    try {
        const data = await generateStructuredItems(payload.prompt, payload.outputCount);
        const filePath = await saveOutputFile({
            outputDir,
            jobId,
            format: payload.format,
            data
        });
        jobStore.update(jobId, { status: "success", filePath });
    }
    catch (error) {
        jobStore.update(jobId, {
            status: "failed",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}
let generationQueue = null;
let generationWorker = null;
if (!disableQueue) {
    const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });
    generationQueue = new Queue("generation", { connection });
    generationWorker = new Worker("generation", async (job) => {
        const { jobId, payload } = job.data;
        await processGeneration(jobId, payload);
    }, { connection });
}
export { generationQueue, generationWorker };
export async function enqueueGeneration(jobId, payload) {
    if (disableQueue) {
        queueMicrotask(() => {
            void processGeneration(jobId, payload);
        });
        return;
    }
    if (!generationQueue) {
        throw new Error("Queue is not initialized");
    }
    await generationQueue.add("generate", { jobId, payload });
}
