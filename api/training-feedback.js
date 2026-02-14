import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export default async function handler(req, res) {
    try {
        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }

        if (req.method !== 'POST') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }

        // Read JSON body
        const chunks = [];
        for await (const c of req) chunks.push(c);
        const raw = Buffer.concat(chunks).toString('utf-8');
        const payload = raw ? JSON.parse(raw) : {};

        // Support both payload shapes:
        // 1) Legacy: { imageUrl, feedback, rating, metadata }
        // 2) Frontend (current): { verdict, note, inputs, outputs: {front, back}, meta }

        const legacyImageUrl = payload?.imageUrl;
        const legacyFeedback = payload?.feedback;
        const legacyRating = payload?.rating;
        const legacyMetadata = payload?.metadata;

        const verdict = payload?.verdict; // e.g. 'good' | 'bad'
        const note = payload?.note;
        const inputs = payload?.inputs;
        const outputs = payload?.outputs;
        const meta = payload?.meta;

        const outputUrls = [];
        if (outputs?.front) outputUrls.push(outputs.front);
        if (outputs?.back) outputUrls.push(outputs.back);

        const imageUrlsToSave = legacyImageUrl ? [legacyImageUrl] : outputUrls;

        if (!imageUrlsToSave.length) {
            res.status(400).json({ error: 'Missing imageUrl', details: 'Provide imageUrl or outputs.front/outputs.back' });
            return;
        }

        // Create training-data directory
        const trainingDir = path.join(__dirname, '..', 'training-data');
        await fs.mkdir(trainingDir, { recursive: true });

        // Save feedback to JSON file
        const feedbackFile = path.join(trainingDir, 'feedback-log.json');
        let feedbackLog = [];

        try {
            const existing = await fs.readFile(feedbackFile, 'utf-8');
            feedbackLog = JSON.parse(existing);
        } catch {
            // File doesn't exist yet, start fresh
        }

        const nowIso = new Date().toISOString();
        const savedEntries = [];

        for (const imageUrl of imageUrlsToSave) {
            const feedbackEntry = {
                timestamp: nowIso,
                imageUrl,
                verdict: verdict || (legacyRating === 5 ? 'good' : undefined) || 'good',
                feedback: legacyFeedback || note || 'Good quality',
                rating: legacyRating || 5,
                metadata: legacyMetadata || meta || {},
                inputs: inputs || {},
                outputs: outputs || {},
            };

            feedbackLog.push(feedbackEntry);
            savedEntries.push(feedbackEntry);
        }

        await fs.writeFile(feedbackFile, JSON.stringify(feedbackLog, null, 2));

        for (const entry of savedEntries) {
            console.log(`✅ Saved feedback for image: ${entry.imageUrl}`);
            console.log(`   Verdict: ${entry.verdict}, Rating: ${entry.rating}/5`);
        }
        console.log(`   Total feedback entries: ${feedbackLog.length}`);

        res.json({
            success: true,
            message: 'Feedback saved successfully',
            saved: savedEntries.length,
            totalEntries: feedbackLog.length
        });

    } catch (err) {
        console.error('training-feedback error:', err);
        res.status(500).json({ error: 'Failed to save feedback', details: err.message });
    }
}