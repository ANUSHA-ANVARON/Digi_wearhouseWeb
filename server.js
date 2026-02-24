
import "dotenv/config";
import express from "express";
import cors from "cors";
import handler, { photoshootStart, photoshootStream } from "./api/drape-saree-parts.js";
import trainingFeedbackHandler from "./api/training-feedback.js";
import retouchSareeHandler from "./api/retouch-saree.js";

import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
console.log("Cloudinary Name:", CLOUDINARY_CLOUD_NAME);
console.log("Gemini Key:", GEMINI_API_KEY);
console.log("GOOGLE_PROJECT_ID:", process.env.GOOGLE_PROJECT_ID || "(missing)");
console.log(
  "GOOGLE_APPLICATION_CREDENTIALS:",
  process.env.GOOGLE_APPLICATION_CREDENTIALS ? "(set)" : "(missing)"
);

const app = express();

app.use(cors());

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.post("/api/drape-saree-parts", async (req, res) => {
  try {
    await handler(req, res);
  } catch (e) {
    console.error('❌ /api/drape-saree-parts failed:', e);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error', message: e?.message || String(e) });
    }
  }
});

// Single saree upload → front try-on → left/right/back views (streamed)
app.post("/api/photoshoot/start", async (req, res) => {
  try {
    await photoshootStart(req, res);
  } catch (e) {
    console.error('❌ /api/photoshoot/start failed:', e);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error', message: e?.message || String(e) });
    }
  }
});

app.get("/api/photoshoot/stream/:jobId", async (req, res) => {
  try {
    await photoshootStream(req, res);
  } catch (e) {
    console.error('❌ /api/photoshoot/stream failed:', e);
    try {
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error', message: e?.message || String(e) });
      }
    } catch {
      // ignore
    }
  }
});

app.post("/api/training-feedback", async (req, res) => {
  try {
    await trainingFeedbackHandler(req, res);
  } catch (e) {
    console.error('❌ /api/training-feedback failed:', e);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error', message: e?.message || String(e) });
    }
  }
});

app.post("/api/retouch-saree", async (req, res) => {
  try {
    await retouchSareeHandler(req, res);
  } catch (e) {
    console.error('❌ /api/retouch-saree failed:', e);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error', message: e?.message || String(e) });
    }
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});