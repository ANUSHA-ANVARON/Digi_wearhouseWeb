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

        // Read JSON body
        const chunks = [];
        for await (const c of req) chunks.push(c);
        const raw = Buffer.concat(chunks).toString('utf-8');
        const payload = raw ? JSON.parse(raw) : {};

        const { imageUrl, feedback, rating, metadata } = payload;

        if (!imageUrl) {
            res.status(400).json({ error: 'Missing imageUrl' });
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

        const feedbackEntry = {
            timestamp: new Date().toISOString(),
            imageUrl,
            feedback: feedback || 'Good quality',
            rating: rating || 5,
            metadata: metadata || {},
        };

        feedbackLog.push(feedbackEntry);
        await fs.writeFile(feedbackFile, JSON.stringify(feedbackLog, null, 2));

        console.log(`✅ Saved feedback for image: ${imageUrl}`);
        console.log(`   Rating: ${rating}/5, Total feedback entries: ${feedbackLog.length}`);

        res.json({
            success: true,
            message: 'Feedback saved successfully',
            totalEntries: feedbackLog.length
        });

    } catch (err) {
        console.error('training-feedback error:', err);
        res.status(500).json({ error: 'Failed to save feedback', details: err.message });
    }
}