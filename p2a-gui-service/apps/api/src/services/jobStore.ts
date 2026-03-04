import type { JobRecord } from "../types/job.js";

const jobs = new Map<string, JobRecord>();

export const jobStore = {
  create(job: JobRecord) {
    jobs.set(job.id, job);
    return job;
  },
  update(id: string, patch: Partial<JobRecord>) {
    const current = jobs.get(id);
    if (!current) return undefined;
    const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
    jobs.set(id, next);
    return next;
  },
  get(id: string) {
    return jobs.get(id);
  },
  remove(id: string) {
    const existing = jobs.get(id);
    if (!existing) return undefined;
    jobs.delete(id);
    return existing;
  },
  list() {
    return [...jobs.values()].sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : -1
    );
  }
};
