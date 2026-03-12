import { z } from "zod";
import { createJobSchema } from "./job.js";
export const createScheduleSchema = createJobSchema.extend({
    cron: z.string().min(1),
    maxRuns: z.number().int().positive().optional(),
    endAt: z.string().datetime().optional(),
    timezone: z.string().optional()
});
