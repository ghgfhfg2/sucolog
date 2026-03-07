import type { JobRecord } from "../types/job.js";
import { loadJobs, saveJobs } from "./stateStore.js";

const jobs = new Map<string, JobRecord>();

for (const item of loadJobs()) {
  jobs.set(item.id, item);
}

function persistJobs() {
  saveJobs([...jobs.values()]);
}

export const jobStore = {
  create(job: JobRecord) {
    jobs.set(job.id, job);
    persistJobs();
    return job;
  },
  update(id: string, patch: Partial<JobRecord>) {
    const current = jobs.get(id);
    if (!current) return undefined;
    const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
    jobs.set(id, next);
    persistJobs();
    return next;
  },
  get(id: string) {
    return jobs.get(id);
  },
  remove(id: string) {
    const existing = jobs.get(id);
    if (!existing) return undefined;
    jobs.delete(id);
    persistJobs();
    return existing;
  },
  list() {
    return [...jobs.values()].sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : -1
    );
  }
};
