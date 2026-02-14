import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';
import dotenv from 'dotenv';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const GEMINI_API_KEY = 'AIzaSyCGGNoinwQJZI66jNp9Y462isJFAp33nN8';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';

async function callGeminiWithRetry(parts, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.post(
        GEMINI_API_URL,
        {
          contents: [{ parts }],
          generationConfig: {
            temperature: 0.0,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 8192,
            candidateCount: 1
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': GEMINI_API_KEY
          },
          timeout: 300000
        }
      );
      return response;
    } catch (error) {
      const status = error.response?.status;
      if (status === 403) {
        throw new Error('Gemini API access denied. Check API key, quota, or rate limits.');
      }
      if (status === 429 && attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 30000));
        continue;
      }
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, attempt * 5000));
        continue;
      }
      throw error;
    }
  }
}

// Compress image to reduce payload size for Gemini API
async function compressImageForAPI(buffer, maxWidth = 1024, quality = 80) {
  try {
    const compressed = await sharp(buffer)
      .resize(maxWidth, null, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality, progressive: false })
      .toBuffer();
    console.log(`Compressed image: ${buffer.length} -> ${compressed.length} bytes`);
    return compressed;
  } catch (error) {
    console.error('Compression error:', error);
    return buffer;
  }
}

// Download image as base64, or load from local memory if available
async function downloadImageAsBase64(imageUrl, memoryKey = null, compress = true) {
  // If memoryKey is provided, try to load from local memory first
  if (memoryKey) {
    const memPath = path.join(__dirname || '.', 'image_memory', `${memoryKey}.jpg`);
    try {
      let buf = await fs.readFile(memPath);
      console.log(`Loaded from memory: ${memPath}, size: ${buf.length} bytes`);
      // DON'T compress memory images - they're already high quality and will be used for feedback
      // Only compress fresh downloads when compress=true
      return { data: buf.toString('base64'), mimeType: 'image/jpeg' };
    } catch (err) {
      console.log(`Memory miss for ${memoryKey}, downloading from URL`);
    }
  }
  // Otherwise, download from URL
  const response = await axios.get(imageUrl, {
    responseType: 'arraybuffer',
    timeout: 60000,
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  let buffer = Buffer.from(response.data);
  console.log(`Downloaded from URL: ${buffer.length} bytes`);
  if (compress) {
    buffer = await compressImageForAPI(buffer);
  }
  const base64Data = buffer.toString('base64');
  const mimeType = response.headers['content-type'] || 'image/jpeg';
  return { data: base64Data, mimeType };
}
// Save image to local memory for future feedback/edits
async function saveImageToMemory(base64Data, memoryKey) {
  const memDir = path.join(__dirname || '.', 'image_memory');
  await fs.mkdir(memDir, { recursive: true });
  const buf = Buffer.from(base64Data, 'base64');
  const memPath = path.join(memDir, `${memoryKey}.jpg`);
  await fs.writeFile(memPath, buf);
}

function normalizeImageObject(image) {
  if (!image) return null;
  return {
    data: image.data,
    mimeType: image.mimeType || image.mime_type || 'image/jpeg'
  };
}

// Lightweight sanitizer: enforce high resolution on white background
async function sanitizeCatalogOutput(image) {
  const normalized = normalizeImageObject(image);
  if (!normalized?.data) return image;

  const white = { r: 255, g: 255, b: 255 };
  const source = Buffer.from(normalized.data, 'base64');

  // Get original dimensions
  const metadata = await sharp(source).metadata();
  console.log(`Gemini returned image dimensions: ${metadata.width}x${metadata.height}`);

  // ALWAYS output at this exact size - no compromise
  const TARGET_WIDTH = 2400;
  const TARGET_HEIGHT = 3200;
  
  // Maintain aspect ratio and add white padding to reach exact dimensions
  const out = await sharp(source)
    .resize(TARGET_WIDTH, TARGET_HEIGHT, { 
      fit: 'contain',  // Maintain aspect ratio, add white padding if needed
      background: white,
      position: 'center'
    })
    .jpeg({ quality: 95, progressive: true })
    .toBuffer();

  // Log dimensions of the output image for debugging
  const { width, height } = await sharp(out).metadata();
  console.log(`✅ FINAL output saved at: ${width}x${height} (${(out.length / 1024 / 1024).toFixed(2)} MB)`);

  // Verify we got what we wanted
  if (width !== TARGET_WIDTH || height !== TARGET_HEIGHT) {
    console.error(`❌ ERROR: Expected ${TARGET_WIDTH}x${TARGET_HEIGHT} but got ${width}x${height}`);
  }

  return { ...image, data: out.toString('base64'), mimeType: 'image/jpeg', mime_type: 'image/jpeg' };
}

async function uploadGeneratedImageToCloudinary(base64Data, publicId) {
  const buffer = Buffer.from(base64Data, 'base64');
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'saree-retouch', public_id: publicId, resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}

function buildTargetInstruction(fixTarget, viewType) {
  if (fixTarget === 'saree-border') {
    return `Modify ONLY the SAREE BORDER. Keep everything else identical.

Placement rules:
- Border on pleats edge (vertical) from waist to floor
- Border along bottom hem (horizontal) touching the floor
- Border along pallu edge (decorative edge)

Do NOT change saree body color, blouse color, pleats, background, pose.`;
  }
  if (fixTarget === 'blouse-border') {
    return `Modify ONLY the BLOUSE BORDER (sleeve border). Keep everything else identical.

Placement rules:
- Below shoulder, almost above elbow

Do NOT change saree body color, blouse body color, background, pose.`;
  }
  if (fixTarget === 'saree-pallu') {
    const focus = viewType === 'back'
      ? `Pallu flowing naturally down the back from left shoulder to waist/hip level (main focus)

BACK VIEW CRITICAL:
- Pallu should drape smoothly over the left shoulder and flow down the back
- Show the full width and length of the pallu fabric
- Ensure natural, continuous fabric flow without patches or seams
- Pallu should integrate seamlessly with the saree body
- Pattern should be consistent and not appear as a separate piece
- Avoid any visible edges, borders, or rectangular patches that look artificial`
      : 'Pallu draped over the LEFT shoulder (partially visible, elegant draping)';
    return `Modify ONLY the SAREE PALLU. Keep everything else identical.

${focus}

Do NOT change saree body color, blouse color, borders, pleats, background, pose.
The edit should look completely natural and professionally photographed.`;
  }
  if (fixTarget === 'saree-pleats') {
    return `Modify ONLY the SAREE PLEATS (front folded portion). Keep everything else identical.

Do NOT change saree body color, blouse color, borders, pallu, background, pose.`;
  }
  if (fixTarget === 'saree-body' || fixTarget === 'blouse-body') {
    return `Modify ONLY the ${fixTarget.replace('-', ' ').toUpperCase()} pattern/color. Keep everything else identical.

Do NOT change other regions, pose, background.`;
  }
  return `Modify ONLY the requested area. Keep everything else identical.`;
}

// Helper: get memory key for a session/image
// Use consistent key per viewType so feedback cycles use the same memory slot
function getMemoryKey(outputs, viewType, sessionId = null) {
  // If sessionId provided, use it; otherwise extract from URL
  if (sessionId) {
    return `${sessionId}_${viewType}`;
  }
  
  // Try to extract a base identifier from the URL
  try {
    const url = outputs?.[viewType];
    if (!url) return `default_${viewType}`;
    
    // Extract the base part before any timestamps or variant suffixes
    const parts = url.split('/');
    const filename = parts[parts.length - 1].split('.')[0];
    
    // Remove timestamp suffixes (e.g., front_saree-pallu_1234567890 -> front)
    const baseKey = filename.split('_')[0] || 'default';
    return `${baseKey}_${viewType}`;
  } catch {
    return `default_${viewType}`;
  }
}

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

    // Manually read JSON body (Express route has no json middleware)
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const raw = Buffer.concat(chunks).toString('utf-8');
    const payload = raw ? JSON.parse(raw) : {};

    const { fixTarget, feedbackText, inputs, outputs } = payload;

    if (!fixTarget) {
      res.status(400).json({ error: 'Missing fixTarget' });
      return;
    }
    if (!outputs?.front && !outputs?.back) {
      res.status(400).json({ error: 'Missing outputs.front/back' });
      return;
    }

    const viewTypes = ['front', 'back'];
    const updated = {};

    for (const viewType of viewTypes) {
      const currentUrl = outputs?.[viewType];
      if (!currentUrl) continue;

      // Use consistent memory key for this view type
      const consistentKey = `${viewType}_latest`;
      console.log(`Loading image for ${viewType}, memory key: ${consistentKey}`);

      const parts = [
        {
          text: `I have a professional catalog photo of an Indian woman wearing a saree (${viewType.toUpperCase()} VIEW).

CRITICAL INSTRUCTIONS:
- You are editing an EXISTING photo, NOT creating a new one
- Keep the EXACT SAME woman, pose, background, and lighting
- Do NOT create patches, panels, or separate fabric swatches
- Do NOT show multiple versions or before/after comparisons
- Output must be ONE SEAMLESS photo with natural blending
- Keep the saree-body and blouse-body BASE COLORS unchanged
- Output must be HIGH RESOLUTION, minimum 2400x3200 pixels, sharp and clear
- Output must be FULL BODY, UNCROPPED, showing the entire saree from head to toe
- Ensure the blouse and pallu are sharp, detailed, and match the original design and colors
- For BACK VIEW: ensure smooth, natural fabric draping without visible seams or patches
- Edit should look completely natural, as if the saree was photographed this way originally

TASK:
${buildTargetInstruction(fixTarget, viewType)}

User feedback (what went wrong): ${String(feedbackText || '').trim() || 'N/A'}

CURRENT IMAGE (edit this image; do NOT replace it):`
        }
      ];

      // Load high-quality image from memory (NO compression)
      const currentImgFull = await downloadImageAsBase64(currentUrl, consistentKey, false);
      
      // Compress ONLY for API transmission to avoid 400 errors
      const currentImgCompressed = {
        mimeType: currentImgFull.mimeType,
        data: (await compressImageForAPI(Buffer.from(currentImgFull.data, 'base64'))).toString('base64')
      };
      
      parts.push({ inline_data: { mime_type: currentImgCompressed.mimeType, data: currentImgCompressed.data } });

      // Attach reference image(s) depending on target
      const refUrl = inputs?.[fixTarget];
      if (refUrl) {
        parts.push({ text: `\n\nREFERENCE IMAGE for ${fixTarget} (copy pattern/colors EXACTLY; do NOT paste this as a panel):` });
        const refImg = await downloadImageAsBase64(refUrl, null, true);
        parts.push({ inline_data: { mime_type: refImg.mimeType, data: refImg.data } });
      }

      const response = await callGeminiWithRetry(parts);
      const content = response.data.candidates?.[0]?.content?.parts || [];
      let outImage = null;
      for (const p of content) {
        if (p.inlineData || p.inline_data) {
          outImage = p.inlineData || p.inline_data;
          break;
        }
      }
      if (!outImage) {
        throw new Error(`Retouch failed for ${viewType}: no image returned`);
      }

      outImage = await sanitizeCatalogOutput(outImage);

      // Upload first to get the new URL
      const publicId = `${viewType}_${fixTarget}_${Date.now()}`;
      const url = await uploadGeneratedImageToCloudinary(outImage.data, publicId);
      
      // Save to memory with CONSISTENT key (not based on new URL)
      // This ensures feedback cycles can find the image
      await saveImageToMemory(outImage.data, consistentKey);
      console.log(`Saved to memory: ${consistentKey}, size: ${outImage.data.length} chars`);
      
      updated[viewType] = url;
    }
  
    res.json({ success: true, updated });
  } catch (err) {
    console.error('retouch-saree error:', err);
    res.status(500).json({ error: 'Failed to retouch', details: err.message });
  }
}