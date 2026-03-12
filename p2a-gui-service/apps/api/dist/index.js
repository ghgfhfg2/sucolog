import "dotenv/config";
import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createJobSchema } from "./types/job.js";
import { jobStore } from "./services/jobStore.js";
import { enqueueGeneration } from "./queue/queues.js";
import { createScheduleSchema } from "./types/schedule.js";
import { createSchedule, getSchedule, listSchedules, pauseSchedule, removeSchedule, resumeSchedule } from "./services/scheduleService.js";
const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, "../public");
const outputDir = path.resolve(process.env.OUTPUT_DIR ?? "./outputs");
const authPassword = process.env.DASHBOARD_PASSWORD ?? "1693";
const authCookieName = "p2a_auth";
function parseCookies(cookieHeader) {
    if (!cookieHeader)
        return {};
    return cookieHeader
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean)
        .reduce((acc, part) => {
        const idx = part.indexOf("=");
        if (idx === -1)
            return acc;
        const key = decodeURIComponent(part.slice(0, idx));
        const val = decodeURIComponent(part.slice(idx + 1));
        acc[key] = val;
        return acc;
    }, {});
}
function isAuthenticated(req) {
    const cookies = parseCookies(req.headers.cookie);
    return cookies[authCookieName] === "ok";
}
app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "p2a-api" });
});
app.get("/login", (req, res) => {
    if (isAuthenticated(req))
        return res.redirect("/");
    res.sendFile(path.join(publicDir, "login.html"));
});
app.post("/login", (req, res) => {
    const password = String(req.body?.password ?? "");
    if (password !== authPassword) {
        return res.redirect("/login?error=1");
    }
    res.setHeader("Set-Cookie", `${authCookieName}=ok; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
    return res.redirect("/");
});
app.post("/logout", (_req, res) => {
    res.setHeader("Set-Cookie", `${authCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
    return res.redirect("/login");
});
app.use((req, res, next) => {
    if (req.path === "/health" || req.path === "/login")
        return next();
    if (isAuthenticated(req))
        return next();
    if (req.path.startsWith("/jobs") ||
        req.path.startsWith("/schedules") ||
        req.path.startsWith("/files")) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    return res.redirect("/login");
});
app.use("/files", express.static(outputDir));
app.use(express.static(publicDir));
app.get("/", (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
});
app.post("/jobs", async (req, res) => {
    const parsed = createJobSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }
    const id = randomUUID();
    const now = new Date().toISOString();
    const record = {
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
    if (!item)
        return res.status(404).json({ error: "Not found" });
    res.json(item);
});
app.delete("/jobs/:id", (req, res) => {
    const deleted = jobStore.remove(req.params.id);
    if (!deleted)
        return res.status(404).json({ error: "Not found" });
    return res.status(204).send();
});
app.post("/schedules", (req, res) => {
    const parsed = createScheduleSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }
    try {
        const schedule = createSchedule(parsed.data);
        return res.status(201).json(schedule);
    }
    catch (error) {
        return res.status(400).json({
            error: error instanceof Error ? error.message : "Failed to create schedule"
        });
    }
});
app.get("/schedules", (_req, res) => {
    res.json({ items: listSchedules() });
});
app.get("/schedules/:id", (req, res) => {
    const item = getSchedule(req.params.id);
    if (!item)
        return res.status(404).json({ error: "Not found" });
    res.json(item);
});
app.post("/schedules/:id/pause", (req, res) => {
    const item = pauseSchedule(req.params.id);
    if (!item)
        return res.status(404).json({ error: "Not found" });
    res.json(item);
});
app.post("/schedules/:id/resume", (req, res) => {
    const item = resumeSchedule(req.params.id);
    if (!item)
        return res.status(404).json({ error: "Not found or not paused" });
    res.json(item);
});
app.delete("/schedules/:id", (req, res) => {
    const deleted = removeSchedule(req.params.id);
    if (!deleted)
        return res.status(404).json({ error: "Not found" });
    return res.status(204).send();
});
const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
    console.log(`[p2a-api] listening on :${port}`);
});
