import "dotenv/config";
import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { createJobSchema, type JobRecord } from "./types/job.js";
import { jobStore } from "./services/jobStore.js";
import { enqueueGeneration } from "./queue/queues.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "p2a-api" });
});

app.post("/jobs", async (req, res) => {
  const parsed = createJobSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const id = randomUUID();
  const now = new Date().toISOString();
  const record: JobRecord = {
    id,
    prompt: parsed.data.prompt,
    outputCount: parsed.data.outputCount,
    format: parsed.data.format,
    status: "queued",
    createdAt: now,
    updatedAt: now
  };

  jobStore.create(record);
  await enqueueGeneration(id, parsed.data);

  return res.status(202).json(record);
});

app.get("/jobs", (_req, res) => {
  res.json({ items: jobStore.list() });
});

app.get("/jobs/:id", (req, res) => {
  const item = jobStore.get(req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`[p2a-api] listening on :${port}`);
});
