import fs from "node:fs";
import path from "node:path";
const dataDir = path.resolve(process.env.DATA_DIR ?? "./data");
const jobsFile = path.join(dataDir, "jobs.json");
const schedulesFile = path.join(dataDir, "schedules.json");
function ensureDataDir() {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
}
function readJsonFile(filePath, fallback) {
    try {
        if (!fs.existsSync(filePath))
            return fallback;
        const raw = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(raw);
    }
    catch {
        return fallback;
    }
}
function writeJsonFile(filePath, data) {
    ensureDataDir();
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempPath, filePath);
}
export function loadJobs() {
    return readJsonFile(jobsFile, []);
}
export function saveJobs(items) {
    writeJsonFile(jobsFile, items);
}
export function loadSchedules() {
    return readJsonFile(schedulesFile, []);
}
export function saveSchedules(items) {
    writeJsonFile(schedulesFile, items);
}
