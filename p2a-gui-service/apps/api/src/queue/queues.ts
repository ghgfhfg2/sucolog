import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { jobStore } from "../services/jobStore.js";
import { generateStructuredItems } from "../services/aiService.js";
import { saveOutputFile } from "../services/formatter.js";
import type { CreateJobInput } from "../types/job.js";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const outputDir = process.env.OUTPUT_DIR ?? "./outputs";

const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

export const generationQueue = new Queue("generation", { connection });

export async function enqueueGeneration(jobId: string, payload: CreateJobInput) {
  await generationQueue.add("generate", { jobId, payload });
}

export const generationWorker = new Worker(
  "generation",
  async (job) => {
    const { jobId, payload } = job.data as { jobId: string; payload: CreateJobInput };
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
    } catch (error) {
      jobStore.update(jobId, {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  },
  { connection }
);
