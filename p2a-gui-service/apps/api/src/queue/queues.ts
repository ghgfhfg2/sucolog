import { Queue, Worker } from "bullmq";
import { Redis } from "ioredis";
import { jobStore } from "../services/jobStore.js";
import { generateStructuredItems } from "../services/aiService.js";
import { saveOutputFile } from "../services/formatter.js";
import type { CreateJobInput } from "../types/job.js";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const outputDir = process.env.OUTPUT_DIR ?? "./outputs";
const disableQueue = process.env.DISABLE_QUEUE === "true";

async function processGeneration(jobId: string, payload: CreateJobInput) {
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
}

let generationQueue: Queue | null = null;
let generationWorker: Worker | null = null;

if (!disableQueue) {
  const connection = new Redis(redisUrl, { maxRetriesPerRequest: null }) as unknown as any;
  generationQueue = new Queue("generation", { connection });
  generationWorker = new Worker(
    "generation",
    async (job) => {
      const { jobId, payload } = job.data as { jobId: string; payload: CreateJobInput };
      await processGeneration(jobId, payload);
    },
    { connection }
  );
}

export { generationQueue, generationWorker };

export async function enqueueGeneration(jobId: string, payload: CreateJobInput) {
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
