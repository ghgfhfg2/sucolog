import cron, { type ScheduledTask } from "node-cron";
import { randomUUID } from "node:crypto";
import { enqueueGeneration } from "../queue/queues.js";
import type { CreateScheduleInput, ScheduleRecord } from "../types/schedule.js";
import type { JobRecord } from "../types/job.js";
import { jobStore } from "./jobStore.js";
import { loadSchedules, saveSchedules } from "./stateStore.js";

const schedules = new Map<string, ScheduleRecord>();
const tasks = new Map<string, ScheduledTask>();

function normalizeCronExpression(expr: string) {
  const parts = expr.trim().split(/\s+/);
  // node-cron v4 works best with 6-field expressions (sec min hour day month dow)
  // Keep user input compatible: if 5 fields are given, prefix second=0.
  if (parts.length === 5) return `0 ${parts.join(" ")}`;
  return expr;
}

function persistSchedules() {
  saveSchedules([...schedules.values()]);
}

function shouldStop(schedule: ScheduleRecord) {
  if (schedule.maxRuns && schedule.runCount >= schedule.maxRuns) return true;
  if (schedule.endAt && new Date(schedule.endAt).getTime() <= Date.now()) return true;
  return false;
}

async function triggerSchedule(scheduleId: string) {
  const schedule = schedules.get(scheduleId);
  if (!schedule || schedule.status !== "active") return;

  if (shouldStop(schedule)) {
    pauseSchedule(scheduleId, true);
    return;
  }

  const id = randomUUID();
  const now = new Date().toISOString();
  const jobRecord: JobRecord = {
    id,
    prompt: schedule.prompt,
    outputCount: schedule.outputCount,
    format: schedule.format,
    status: "queued",
    createdAt: now,
    updatedAt: now
  };

  jobStore.create(jobRecord);
  await enqueueGeneration(id, {
    prompt: schedule.prompt,
    outputCount: schedule.outputCount,
    format: schedule.format
  });

  const runCount = schedule.runCount + 1;
  const status = shouldStop({ ...schedule, runCount }) ? "completed" : schedule.status;

  schedules.set(scheduleId, {
    ...schedule,
    runCount,
    status,
    lastRunAt: now,
    updatedAt: now
  });
  persistSchedules();

  if (status === "completed") {
    pauseSchedule(scheduleId, true);
  }
}

function createTask(schedule: ScheduleRecord) {
  const task = cron.schedule(
    normalizeCronExpression(schedule.cron),
    () => {
      void triggerSchedule(schedule.id);
    },
    {
      timezone: schedule.timezone
    }
  );
  tasks.set(schedule.id, task);
}

export function createSchedule(input: CreateScheduleInput) {
  const now = new Date().toISOString();
  const id = randomUUID();
  const schedule: ScheduleRecord = {
    id,
    prompt: input.prompt,
    outputCount: input.outputCount,
    format: input.format,
    cron: input.cron,
    maxRuns: input.maxRuns,
    endAt: input.endAt,
    timezone: input.timezone,
    runCount: 0,
    status: "active",
    createdAt: now,
    updatedAt: now
  };

  schedules.set(id, schedule);
  createTask(schedule);
  persistSchedules();
  return schedule;
}

export function listSchedules() {
  return [...schedules.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getSchedule(id: string) {
  return schedules.get(id);
}

export function pauseSchedule(id: string, completed = false) {
  const schedule = schedules.get(id);
  if (!schedule) return undefined;

  const task = tasks.get(id);
  if (task) {
    task.stop();
    task.destroy();
    tasks.delete(id);
  }

  const next: ScheduleRecord = {
    ...schedule,
    status: completed ? "completed" : "paused",
    updatedAt: new Date().toISOString()
  };
  schedules.set(id, next);
  persistSchedules();
  return next;
}

export function resumeSchedule(id: string) {
  const schedule = schedules.get(id);
  if (!schedule || schedule.status !== "paused") return undefined;

  const next: ScheduleRecord = {
    ...schedule,
    status: "active",
    updatedAt: new Date().toISOString()
  };
  schedules.set(id, next);
  createTask(next);
  persistSchedules();
  return next;
}

for (const schedule of loadSchedules()) {
  schedules.set(schedule.id, schedule);
}

for (const schedule of schedules.values()) {
  if (schedule.status !== "active") continue;
  if (shouldStop(schedule)) {
    pauseSchedule(schedule.id, true);
    continue;
  }
  createTask(schedule);
}
