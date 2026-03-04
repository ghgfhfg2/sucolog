import { z } from "zod";

export const outputFormatSchema = z.enum(["json", "csv", "xlsx", "pdf"]);

export const createJobSchema = z.object({
  prompt: z.string().min(1),
  outputCount: z.number().int().min(1).max(1000).default(10),
  format: outputFormatSchema,
  schedule: z
    .object({
      enabled: z.boolean().default(false),
      cron: z.string().optional(),
      maxRuns: z.number().int().positive().optional(),
      endAt: z.string().datetime().optional()
    })
    .optional()
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type OutputFormat = z.infer<typeof outputFormatSchema>;
export type JobStatus = "queued" | "running" | "success" | "failed";

export type JobRecord = {
  id: string;
  prompt: string;
  outputCount: number;
  format: OutputFormat;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  filePath?: string;
  error?: string;
};
