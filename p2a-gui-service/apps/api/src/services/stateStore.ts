import fs from "node:fs";
import path from "node:path";
import type { JobRecord } from "../types/job.js";
import type { ScheduleRecord } from "../types/schedule.js";

const dataDir = path.resolve(process.env.DATA_DIR ?? "./data");
const jobsFile = path.join(dataDir, "jobs.json");
const schedulesFile = path.join(dataDir, "schedules.json");

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJsonFile<T>(filePath: string, data: T) {
  ensureDataDir();
  const tempPath = `${filePath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tempPath, filePath);
}

export function loadJobs() {
  return readJsonFile<JobRecord[]>(jobsFile, []);
}

export function saveJobs(items: JobRecord[]) {
  writeJsonFile(jobsFile, items);
}

export function loadSchedules() {
  return readJsonFile<ScheduleRecord[]>(schedulesFile, []);
}

export function saveSchedules(items: ScheduleRecord[]) {
  writeJsonFile(schedulesFile, items);
}
