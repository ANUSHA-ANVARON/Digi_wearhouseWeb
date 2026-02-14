
import "dotenv/config";
import express from "express";
import cors from "cors";
import handler from "./api/drape-saree-parts.js";
import trainingFeedbackHandler from "./api/training-feedback.js";
import retouchSareeHandler from "./api/retouch-saree.js";

import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
console.log("Cloudinary Name:", CLOUDINARY_CLOUD_NAME);
console.log("Gemini Key:", GEMINI_API_KEY);

const app = express();

app.use(cors());

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.post("/api/drape-saree-parts", (req, res) => {
  handler(req, res);
});

app.post("/api/training-feedback", (req, res) => {
  trainingFeedbackHandler(req, res);
});

app.post("/api/retouch-saree", (req, res) => {
  retouchSareeHandler(req, res);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});