import { z } from "zod";
import { createJobSchema } from "./job.js";

export const createScheduleSchema = createJobSchema.extend({
  cron: z.string().min(1),
  maxRuns: z.number().int().positive().optional(),
  endAt: z.string().datetime().optional(),
  timezone: z.string().optional()
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;

export type ScheduleRecord = {
  id: string;
  prompt: string;
  outputCount: number;
  format: "json" | "csv" | "xlsx" | "pdf";
  cron: string;
  maxRuns?: number;
  endAt?: string;
  timezone?: string;
  runCount: number;
  status: "active" | "paused" | "completed";
  createdAt: string;
  updatedAt: string;
  lastRunAt?: string;
};
