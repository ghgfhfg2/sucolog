import { loadJobs, saveJobs } from "./stateStore.js";
const jobs = new Map();
for (const item of loadJobs()) {
    jobs.set(item.id, item);
}
function persistJobs() {
    saveJobs([...jobs.values()]);
}
export const jobStore = {
    create(job) {
        jobs.set(job.id, job);
        persistJobs();
        return job;
    },
    update(id, patch) {
        const current = jobs.get(id);
        if (!current)
            return undefined;
        const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
        jobs.set(id, next);
        persistJobs();
        return next;
    },
    get(id) {
        return jobs.get(id);
    },
    remove(id) {
        const existing = jobs.get(id);
        if (!existing)
            return undefined;
        jobs.delete(id);
        persistJobs();
        return existing;
    },
    list() {
        return [...jobs.values()].sort((a, b) => a.createdAt < b.createdAt ? 1 : -1);
    }
};
