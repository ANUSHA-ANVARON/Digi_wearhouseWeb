import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';
import multer from 'multer';
import { Readable } from 'stream';
import dotenv from "dotenv";
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { GoogleAuth } from 'google-auth-library';

const execPromise = promisify(exec);
dotenv.config();

// Helper function to get Google Cloud access token
async function getGoogleAccessToken() {
  try {
    const { stdout } = await execPromise('gcloud auth application-default print-access-token');
    return stdout.trim();
  } catch (error) {
    const isGcloudMissing = String(error?.message || '').toLowerCase().includes('gcloud') && String(error?.message || '').toLowerCase().includes('not recognized');
    const isSpawnMissing = error?.code === 'ENOENT' || String(error?.message || '').toLowerCase().includes('enoent');

    // If gcloud isn't installed/available, fall back to Application Default Credentials (ADC)
    if (isGcloudMissing || isSpawnMissing) {
      try {
        console.warn('gcloud CLI not available; falling back to GoogleAuth (ADC/service account)');

        const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        console.log('🔐 GOOGLE_APPLICATION_CREDENTIALS:', credsPath || '(missing)');
        if (credsPath) {
          const exists = await fs
            .access(credsPath)
            .then(() => true)
            .catch(() => false);
          console.log('🔐 Creds file exists:', exists);
        }

        const auth = new GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });
        const client = await auth.getClient();
        const token = await client.getAccessToken();
        // token can be string or { token }
        const accessToken = typeof token === 'string' ? token : token?.token;
        if (!accessToken) {
          throw new Error('Empty access token from GoogleAuth');
        }
        return accessToken;
      } catch (authErr) {
        console.error('Failed to get access token via GoogleAuth:', authErr?.message || authErr);
        throw new Error(
          'Google auth failed. Install gcloud OR set GOOGLE_APPLICATION_CREDENTIALS to a service-account JSON key that has Vertex AI permissions.'
        );
      }
    }

    console.error('Failed to get Google access token:', error.message);
    throw new Error('Google Cloud authentication failed. Install gcloud CLI or configure GOOGLE_APPLICATION_CREDENTIALS.');
  }
}

// Convert image URL to base64
async function urlToBase64(imageUrl) {
  try {
    // Check if it's a local file path
    if (imageUrl.startsWith('./') || imageUrl.startsWith('../') || imageUrl.includes('public/')) {
      const filePath = path.join(process.cwd(), imageUrl.replace('./', ''));
      const fileBuffer = await fs.readFile(filePath);
      return Buffer.from(fileBuffer).toString('base64');
    }
    
    // Otherwise fetch from URL
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    return Buffer.from(response.data).toString('base64');
  } catch (error) {
    console.error('Failed to fetch image:', error.message);
    throw error;
  }
}

// Google Virtual Try-On Service
async function applyVirtualTryOn(sareeImageUrl, modelImageUrl) {
  try {
    console.log('🎭 Starting Virtual Try-On...');
    
    const token = await getGoogleAccessToken();
    const sareeBase64 = await urlToBase64(sareeImageUrl);
    const modelBase64 = await urlToBase64(modelImageUrl);
    
    const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${GOOGLE_PROJECT_ID}/locations/${LOCATION}/publishers/google/models/virtual-try-on-001:predict`;
    
    const requestBody = {
      instances: [{
        personImage: {
          image: { bytesBase64Encoded: modelBase64 }
        },
        productImages: [{
          image: { bytesBase64Encoded: sareeBase64 }
        }],
        productType: "APPAREL"
      }],
      parameters: {
        garmentType: "full_body",
        sampleCount: 1,
        preserveGarmentShape: true,
        poseAlignment: true,
        outputStyle: "realistic"
      }
    };
    
    const response = await axios.post(url, requestBody, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      timeout: 120000 // 2 minutes
    });
    
    console.log('✅ Virtual Try-On completed');
    
    // Return the first generated image
    const tryonImageBase64 = response.data.predictions[0].bytesBase64Encoded;
    return {
      data: String(tryonImageBase64),
      mimeType: 'image/png'
    };
    
  } catch (error) {
    console.error('❌ Virtual Try-On failed:', error.response?.data || error.message);
    // Don't throw - return null so the main flow can continue without try-on
    return null;
  }
}

// Google Imagen 3 (capability) image edit (Vertex AI publisher model)
async function editImageWithImagenCapability({
  rawImageBase64,
  prompt,
  negativePrompt = '',
  maskImageBase64 = null,
  extraRawImagesBase64 = []
}) {
  try {
    if (!GOOGLE_PROJECT_ID) {
      throw new Error('GOOGLE_PROJECT_ID not set');
    }
    if (!rawImageBase64) {
      throw new Error('Missing rawImageBase64');
    }
    if (!prompt || !String(prompt).trim()) {
      throw new Error('Missing prompt');
    }

    console.log('🖌️ Starting Imagen edit...');
    const token = await getGoogleAccessToken();

    const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${GOOGLE_PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagen-3.0-capability-001:predict`;

    const buildRequestBody = ({ includeExtraRefs }) => {
      const referenceImages = [
        {
          referenceType: 'REFERENCE_TYPE_RAW',
          referenceId: 1,
          referenceImage: {
            bytesBase64Encoded: rawImageBase64
          }
        }
      ];

      // Vertex Imagen edit has a strict constraint:
      // - Mask-free editing expects EXACTLY 1 RAW image.
      // - Mask editing expects EXACTLY 1 RAW + 1 MASK image.
      // So we cannot pass additional RAW reference images here.
      // Keep the parameter for callers, but ignore it.
      if (includeExtraRefs && Array.isArray(extraRawImagesBase64) && extraRawImagesBase64.filter(Boolean).length > 0) {
        console.warn('⚠️ Imagen edit: extraRawImagesBase64 ignored (API expects exactly 1 RAW image for mask-free edits)');
      }

      if (maskImageBase64) {
        if (Array.isArray(extraRawImagesBase64) && extraRawImagesBase64.filter(Boolean).length > 0) {
          console.warn('⚠️ Imagen mask edit: ignoring extra reference images (API requires exactly RAW+MASK)');
        }

        referenceImages.push({
          referenceType: 'REFERENCE_TYPE_MASK',
          referenceImage: {
            bytesBase64Encoded: maskImageBase64
          },
          maskImageConfig: {
            maskMode: 'MASK_MODE_USER_PROVIDED',
            dilation: 0.01
          }
        });
      }

      const parameters = {
        addWatermark: false,
        sampleCount: 1,
        outputOptions: {
          mimeType: 'image/jpeg',
          compressionQuality: 95
        },
        // The edit API expects sampling steps under editConfig.
        editConfig: {
          baseSteps: 40
        },
        // guidanceScale is an integer (0-500). Keep conservative defaults.
        guidanceScale: 60
      };

      // editMode is required for mask-based editing only.
      if (maskImageBase64) {
        parameters.editMode = 'EDIT_MODE_INPAINT_INSERTION';
      }

      const cleanedNegative = String(negativePrompt || '').trim();
      if (cleanedNegative) {
        parameters.negativePrompt = cleanedNegative;
      }

      return {
        instances: [
          {
            referenceImages,
            prompt: String(prompt).trim()
          }
        ],
        parameters
      };
    };

    const post = async (requestBody) =>
      axios.post(url, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 180000
      });

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    let response;
    const requestBody = buildRequestBody({ includeExtraRefs: true });

    // Retry transient internal errors (500/503/504) a couple times.
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        response = await post(requestBody);
        break;
      } catch (err) {
        const status = err?.response?.status;
        const data = err?.response?.data;

        console.error('❌ Imagen edit request failed', {
          attempt,
          status,
          message: err?.message,
          apiMessage: data?.error?.message,
          apiStatus: data?.error?.status,
          apiDetails: data?.error?.details
        });

        const isTransient = status === 500 || status === 503 || status === 504;
        if (!isTransient || attempt === maxAttempts) {
          throw err;
        }

        const backoffMs = 1500 * attempt;
        console.warn(`🔁 Retrying Imagen edit after ${backoffMs}ms (attempt ${attempt + 1}/${maxAttempts})...`);
        await sleep(backoffMs);
      }
    }

    console.log('✅ Imagen edit completed');

    const pred = response.data?.predictions?.[0];
    const bytes =
      pred?.bytesBase64Encoded ||
      pred?.image?.bytesBase64Encoded ||
      pred?.imageBytesBase64Encoded ||
      response.data?.bytesBase64Encoded;

    if (!bytes) {
      console.error('🛑 Imagen edit unexpected response:', JSON.stringify(response.data || {}, null, 2));
      throw new Error('Imagen edit returned no image bytes');
    }

    return {
      data: String(bytes),
      mimeType: 'image/jpeg'
    };
  } catch (error) {
    console.error('❌ Imagen edit failed:', {
      status: error?.response?.status,
      message: error?.message,
      apiMessage: error?.response?.data?.error?.message,
      apiStatus: error?.response?.data?.error?.status,
      apiDetails: error?.response?.data?.error?.details
    });
    throw error;
  }
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const GEMINI_API_KEY = 'AIzaSyCGGNoinwQJZI66jNp9Y462isJFAp33nN8';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';
const FLUX_LOCAL_URL = 'http://localhost:5003';  // FLUX service
const VITON_LOCAL_URL = process.env.VITON_LOCAL_URL || 'http://localhost:5002';

// Google Virtual Try-On Configuration
const GOOGLE_PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const LOCATION = "us-central1";
const MODEL_FRONT_URL = "https://res.cloudinary.com/doiezptnn/image/upload/v1771054723/saree-models/model-front.png"; // Front view model
const MODEL_BACK_URL = "https://res.cloudinary.com/doiezptnn/image/upload/v1771054724/saree-models/model-back.png"; // Back view model

// Retry helper for Gemini API calls
async function callGeminiWithRetry(parts, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 API attempt ${attempt}/${maxRetries}...`);

      // Log the payload for debugging
      console.log('📦 Payload:', JSON.stringify({ contents: [{ parts }] }, null, 2));

      const response = await axios.post(GEMINI_API_URL, {
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.0,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 8192,
          candidateCount: 1
        }
      }, {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY
        },
        timeout: 300000
      });

      // Log the response for debugging
      console.log('✅ API Response:', response.data);

      return response;
    } catch (error) {
      const status = error.response?.status;
      const errorData = error.response?.data;

      console.error(`❌ Attempt ${attempt} failed:`, error.code || status || error.message);

      // Log the error response for debugging
      if (errorData) {
        console.error('🛑 Error Response:', JSON.stringify(errorData, null, 2));
      }

      // 403 Forbidden - API key or quota issue
      if (status === 403) {
        console.error('🚫 API Access Denied (403)');
        throw new Error('Gemini API access denied. Check API key, quota, or rate limits.');
      }

      // 429 Too Many Requests
      if (status === 429) {
        console.error('⏰ Rate limit exceeded (429)');
        if (attempt < maxRetries) {
          const delay = 30000; // 30 seconds for rate limit
          console.log(`⏳ Waiting ${delay / 1000}s for rate limit...`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
      }

      if (attempt < maxRetries) {
        const delay = attempt * 5000; // 5s, 10s, 15s
        console.log(`⏳ Waiting ${delay / 1000}s before retry...`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        throw error;
      }
    }
  }
}

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024, files: 6 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed!'), false);
  }
});

async function uploadToCloudinary(fileBuffer, sareePart) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: `saree-parts/${sareePart}`,
        public_id: `${sareePart}-${Date.now()}`,
        format: 'jpg',
        quality: 'auto:best'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    Readable.from(fileBuffer).pipe(uploadStream);
  });
}

async function uploadGeneratedImageToCloudinary(base64Data, viewType) {
  const buffer = Buffer.from(base64Data, 'base64');
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: `generated-sarees/${viewType}`,
        public_id: `saree-${viewType}-${Date.now()}`,
        format: 'jpg',
        quality: 'auto:best'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
}

// Helper: Compress base64 image data to reduce payload size
async function compressImageData(base64Data, mimeType) {
  try {
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Compress with sharp - reduce to 1024px max width for API transmission only
    const compressed = await sharp(buffer)
      .resize(1024, null, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true })
      .toBuffer();
    
    return {
      data: compressed.toString('base64'),
      mimeType: 'image/jpeg'
    };
  } catch (error) {
    console.warn('Compression failed, using original:', error.message);
    return { data: base64Data, mimeType };
  }
}

function normalizeImageObject(image) {
  if (!image) return null;
  return {
    data: image.data,
    mimeType: image.mimeType || image.mime_type || 'image/jpeg'
  };
}

async function sanitizeCatalogOutput(image, opts = {}) {
  const normalized = normalizeImageObject(image);
  if (!normalized?.data) return image;

  const white = { r: 255, g: 255, b: 255 };
  const source = Buffer.from(normalized.data, 'base64');

  // Get original dimensions
  const metadata = await sharp(source).metadata();
  console.log(`Gemini returned ${opts.stage || 'image'}: ${metadata.width}x${metadata.height}`);

  // ALWAYS output at high resolution - no cropping, no complex logic
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

  // Log dimensions
  const { width, height } = await sharp(out).metadata();
  console.log(`✅ ${opts.stage || 'output'} final: ${width}x${height}`);

  return { ...image, data: out.toString('base64'), mimeType: 'image/jpeg', mime_type: 'image/jpeg' };
}

// Helper: Save intermediate step image to Cloudinary
async function saveStepImage(imageData, stepNumber, viewType) {
  try {
    const buffer = Buffer.from(imageData.data, 'base64');
    
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'saree-generation-steps',
          public_id: `step${stepNumber}_${viewType}_${Date.now()}`,
          resource_type: 'image'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      );
      
      Readable.from(buffer).pipe(uploadStream);
    });
  } catch (error) {
    console.error(`Failed to save step ${stepNumber}:`, error.message);
    return null;
  }
}

async function downloadImageAsBase64(imageUrl) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const base64Data = Buffer.from(response.data).toString("base64");
    const mimeType = response.headers["content-type"] || "image/jpeg";
    return { data: base64Data, mimeType };
  } catch (error) {
    throw new Error(`Failed to download image: ${error.message}`);
  }
}

// Local image memory (disk) to stabilize feedback retries.
// This avoids Cloudinary recompression/lighting drift if the try-on output was used as a reference.
function getImageMemoryDir() {
  return path.join(process.cwd(), 'image_memory');
}

async function saveImageToMemory(base64Data, memoryKey) {
  if (!memoryKey) return;
  const memDir = getImageMemoryDir();
  await fs.mkdir(memDir, { recursive: true });
  const buf = Buffer.from(base64Data, 'base64');
  const memPath = path.join(memDir, `${memoryKey}.jpg`);
  await fs.writeFile(memPath, buf);
}

async function loadImageFromMemory(memoryKey) {
  if (!memoryKey) return null;
  const memPath = path.join(getImageMemoryDir(), `${memoryKey}.jpg`);
  try {
    const buf = await fs.readFile(memPath);
    return { data: buf.toString('base64'), mimeType: 'image/jpeg' };
  } catch {
    return null;
  }
}

function rgbToHex(r, g, b) {
  const toHex = (n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToRgb(hex) {
  const h = String(hex || '').trim();
  if (!/^#[0-9a-fA-F]{6}$/.test(h)) return null;
  return {
    r: parseInt(h.slice(1, 3), 16),
    g: parseInt(h.slice(3, 5), 16),
    b: parseInt(h.slice(5, 7), 16)
  };
}

function colorDistance(a, b) {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function escapeXml(unsafe) {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function downloadImageBuffer(imageUrl) {
  const response = await axios.get(imageUrl, {
    responseType: 'arraybuffer',
    timeout: 30000,
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  return Buffer.from(response.data);
}

function makeLabelSvg(width, height, label) {
  const safeLabel = escapeXml(label);
  // Simple label: white pill with gray border and centered text.
  return Buffer.from(
    `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff"/>
  <rect x="16" y="16" width="${width - 32}" height="${height - 32}" rx="14" ry="14" fill="#ffffff" stroke="#d0d0d0" stroke-width="3"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="44" fill="#111111">${safeLabel}</text>
</svg>`
  );
}

async function createLabeledPartsSheet(partUrls) {
  // Layout matches the example: 3 columns x 2 rows.
  const W = 2400;
  const H = 1600;
  const padding = 40;
  const gap = 30;
  const cols = 3;
  const rows = 2;
  const cellW = Math.floor((W - padding * 2 - gap * (cols - 1)) / cols);
  const cellH = Math.floor((H - padding * 2 - gap * (rows - 1)) / rows);
  const labelH = 140;

  const base = sharp({
    create: {
      width: W,
      height: H,
      channels: 3,
      background: { r: 255, g: 255, b: 255 }
    }
  });

  const order = [
    { key: 'blouse-body', label: 'Blouse Body' },
    { key: 'blouse-border', label: 'Blouse Border' },
    { key: 'saree-body', label: 'Saree Body' },
    { key: 'saree-pleats', label: 'Saree Pleats' },
    { key: 'saree-border', label: 'Saree Border' },
    { key: 'saree-pallu', label: 'Pallu' }
  ];

  const composites = [];

  for (let i = 0; i < order.length; i++) {
    const { key, label } = order[i];
    const url = partUrls?.[key];
    if (!url) continue;

    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = padding + col * (cellW + gap);
    const y = padding + row * (cellH + gap);

    const buf = await downloadImageBuffer(url);

    // Fit image into cell with white padding to preserve full fabric.
    const cellImage = await sharp(buf)
      .resize(cellW, cellH, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255 },
        withoutEnlargement: true
      })
      .jpeg({ quality: 92, progressive: true })
      .toBuffer();

    composites.push({ input: cellImage, left: x, top: y });

    // Label overlay near bottom of the cell.
    const labelSvg = makeLabelSvg(Math.max(1, cellW), Math.max(1, labelH), label);
    composites.push({
      input: labelSvg,
      left: x,
      top: y + cellH - labelH
    });
  }

  const out = await base
    .composite(composites)
    .jpeg({ quality: 92, progressive: true })
    .toBuffer();

  return out;
}

async function estimateDominantColorHexFromUrl(imageUrl) {
  const response = await axios.get(imageUrl, {
    responseType: 'arraybuffer',
    timeout: 30000,
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });

  const buf = Buffer.from(response.data);
  const { data, info } = await sharp(buf)
    .resize(64, 64, { fit: 'inside' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let count = 0;

  // Exclude near-white pixels (background) to focus on fabric color.
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // filter out near-white
    if (r > 245 && g > 245 && b > 245) continue;

    sumR += r;
    sumG += g;
    sumB += b;
    count++;
  }

  if (!count) {
    // Fallback average over all pixels
    for (let i = 0; i < data.length; i += info.channels) {
      sumR += data[i];
      sumG += data[i + 1];
      sumB += data[i + 2];
      count++;
    }
  }

  const r = Math.round(sumR / count);
  const g = Math.round(sumG / count);
  const b = Math.round(sumB / count);
  return rgbToHex(r, g, b);
}

async function estimateDominantColorHexFromBuffer(buf) {
  const { data, info } = await sharp(buf)
    .resize(64, 64, { fit: 'inside' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let count = 0;

  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (r > 245 && g > 245 && b > 245) continue;

    sumR += r;
    sumG += g;
    sumB += b;
    count++;
  }

  if (!count) {
    for (let i = 0; i < data.length; i += info.channels) {
      sumR += data[i];
      sumG += data[i + 1];
      sumB += data[i + 2];
      count++;
    }
  }

  const r = Math.round(sumR / count);
  const g = Math.round(sumG / count);
  const b = Math.round(sumB / count);
  return rgbToHex(r, g, b);
}

async function estimateMedianColorHexFromBuffer(buf) {
  // NOTE:
  // A per-channel median can create a color that doesn't actually exist in the fabric
  // (e.g., pink + green motifs -> muddy brown median). That can lead to bad “locked” colors.
  // Instead, estimate a representative base color by taking the most frequent quantized RGB bin.
  const { data, info } = await sharp(buf)
    .resize(96, 96, { fit: 'inside' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Sample every Nth pixel for speed.
  const stride = Math.max(1, Math.floor((info.width * info.height) / 8000));
  let pixelIndex = 0;

  // Quantize to 16 levels per channel (0-15). This stabilizes “dominant” detection.
  const BIN = 16;
  const stats = new Map();

  for (let i = 0; i < data.length; i += info.channels) {
    pixelIndex++;
    if (pixelIndex % stride !== 0) continue;

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Skip near-white (common backgrounds).
    if (r > 245 && g > 245 && b > 245) continue;

    // Skip very dark pixels (fold shadows) which can bias toward a darker lock.
    if ((r + g + b) < 90) continue;

    // Skip likely metallic/gold motifs. These are typically high R+G with lower B.
    // This helps lock the FABRIC BASE color instead of the zari/motif color.
    // Heuristic: yellow-ish pixels where blue is significantly lower than green.
    if (r > 140 && g > 120 && (g - b) > 40 && b < 170) continue;

    const rq = Math.min(BIN - 1, Math.floor(r / BIN));
    const gq = Math.min(BIN - 1, Math.floor(g / BIN));
    const bq = Math.min(BIN - 1, Math.floor(b / BIN));
    const key = `${rq},${gq},${bq}`;

    const prev = stats.get(key);
    if (prev) {
      prev.count += 1;
      prev.sumR += r;
      prev.sumG += g;
      prev.sumB += b;
    } else {
      stats.set(key, { count: 1, sumR: r, sumG: g, sumB: b });
    }
  }

  if (!stats.size) {
    return await estimateDominantColorHexFromBuffer(buf);
  }

  let best = null;
  for (const v of stats.values()) {
    if (!best || v.count > best.count) best = v;
  }

  const r = Math.round(best.sumR / best.count);
  const g = Math.round(best.sumG / best.count);
  const b = Math.round(best.sumB / best.count);
  return rgbToHex(r, g, b);
}

function createSolidColorSwatchBuffer(hex, size = 256) {
  const clean = String(hex || '').trim();
  if (!/^#[0-9a-fA-F]{6}$/.test(clean)) return null;
  const r = parseInt(clean.slice(1, 3), 16);
  const g = parseInt(clean.slice(3, 5), 16);
  const b = parseInt(clean.slice(5, 7), 16);
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: { r, g, b }
    }
  })
    .jpeg({ quality: 90, progressive: true })
    .toBuffer();
}

async function generateSareeViewWithVITON(imageUrls, viewType) {
  console.log(`Generating ${viewType} view using local IDM-VTON...`);
  
  try {
    const response = await axios.post(`${VITON_LOCAL_URL}/generate_saree`, {
      parts: imageUrls,
      view_type: viewType
    }, {
      timeout: 180000 // 3 minutes timeout
    });
    
    if (response.data.success) {
      return {
        data: response.data.image,
        mimeType: response.data.mime_type
      };
    }
    
    throw new Error('VITON generation failed');
  } catch (error) {
    console.error(`VITON error for ${viewType}:`, error.message);
    throw error;
  }
}

async function generateSareeViewWithFLUX(imageUrls, viewType, seed) {
  console.log(`Generating ${viewType} view using local FLUX model...`);
  
  try {
    // Send all 4 saree part URLs to FLUX service
    const response = await axios.post(`${FLUX_LOCAL_URL}/generate_saree`, {
      parts: imageUrls,  // [blouse, pleats, pallu, shoulder]
      view_type: viewType,
      seed: seed || Math.floor(Math.random() * 1000000)
    }, {
      timeout: 180000 // 3 minutes for FLUX generation
    });
    
    if (response.data.success) {
      return {
        data: response.data.image,
        mimeType: 'image/jpeg'
      };
    }
    
    throw new Error('FLUX generation failed');
  } catch (error) {
    console.error(`FLUX error for ${viewType}:`, error.message);
    throw error;
  }
}

async function generateSareeView(imageUrls, viewType, masterReferenceUrl, userFeedback = '') {
  // Priority: FLUX > Gemini (FLUX gives better pattern accuracy)
  
  // Try FLUX first (90%+ accuracy when working)
  try {
    const healthCheck = await axios.get(`${FLUX_LOCAL_URL}/health`, { timeout: 3000 });
    if (healthCheck.data.status === 'healthy') {
      console.log('✅ Using local FLUX model for high accuracy generation');
      const seed = Math.floor(Math.random() * 1000000);
      return await generateSareeViewWithFLUX(imageUrls, viewType, seed);
    }
  } catch (err) {
    console.log('⚠️ FLUX service not ready yet (model still downloading), using Gemini sequential generation...');
  }
  
  // Fallback to Gemini with SEQUENTIAL generation
  console.log('Using Gemini SEQUENTIAL generation for better accuracy');
  return await generateSareeSequentially(imageUrls, viewType, masterReferenceUrl, userFeedback);
}

// NEW: Generate back view from completed front view (faster, 1 step)
async function generateBackFromFront(frontViewImage, userFeedback = '') {
  console.log('Generating back view from front view in 1 step...');

  const feedbackBlock = userFeedback && String(userFeedback).trim()
    ? `\n\nUSER FEEDBACK FROM PREVIOUS TRY (fix this):\n${String(userFeedback).trim()}\n\nApply the feedback strictly. If feedback mentions collage/split-screen/fabric panels/two women, ensure output is ONE full-body catalog photo on solid white background with nothing else.`
    : '';
  
  const backViewParts = [
    { text: `❌ ABSOLUTELY FORBIDDEN - DO NOT CREATE:
- Side-by-side layouts (front view + back view together)
- Multiple women in one image
- Before/after comparisons
- Split screen showing two views
- Collages or composite images
- Any image with more than ONE woman

✅ REQUIRED: Create EXACTLY ONE 2400×3200 pixel image showing ONLY the BACK VIEW.

I will show you a FRONT VIEW as a REFERENCE ONLY. You must analyze it and generate a completely separate BACK VIEW image.

=== YOUR TASK ===
Generate ONE single photograph showing:
- BACK VIEW ONLY (woman from behind)
- EXACTLY ONE woman
- Same saree patterns and colors as the reference
- Pallu flowing down the back from left shoulder
- Full body head to toe
- Woman fills 80-90% of image height
- Clean white background (RGB 255,255,255)
- Professional catalog quality
- 2400×3200 pixels portrait orientation

FRONT VIEW REFERENCE (for analyzing saree details ONLY - DO NOT include this image in your output):` },
    { inline_data: { mime_type: frontViewImage.mimeType || frontViewImage.mime_type || 'image/jpeg', data: frontViewImage.data } },
    { text: `\n\n=== CRITICAL REMINDER ===
The image above is REFERENCE ONLY for understanding the saree colors and patterns.

Your output MUST be:
✅ ONE SINGLE PHOTOGRAPH
✅ BACK VIEW ONLY (woman from behind)
✅ EXACTLY ONE WOMAN
✅ 2400×3200 pixels
✅ Woman is LARGE, filling 80-90% of height
❌ DO NOT create side-by-side layout
❌ DO NOT show front view and back view together
❌ DO NOT create collage
❌ The reference must NOT appear in output${feedbackBlock}

Generate the back view NOW. Show ONLY the back view. Nothing else.` }
  ];
  
  const response = await callGeminiWithRetry(backViewParts);
  
  const content = response.data.candidates?.[0]?.content?.parts || [];
  let backImage = null;
  for (const part of content) {
    if (part.inlineData || part.inline_data) {
      backImage = part.inlineData || part.inline_data;
      break;
    }
  }
  
  if (!backImage) {
    throw new Error('Failed to generate back view from front view');
  }

  // Sanitize output to avoid collages/fabric panels.
  backImage = await sanitizeCatalogOutput(backImage, { stage: 'back-from-front' });
  
  // Save back view
  const backUrl = await saveStepImage(backImage, 'final', 'back');
  if (backUrl) {
    console.log(`📸 Back view saved: ${backUrl}`);
  }
  
  console.log('✅ Back view generated successfully!');
  return backImage;
}

// NEW: Sequential generation - build saree step by step
async function generateSareeSequentially(imageUrls, viewType, masterReferenceUrl, userFeedback = '') {
  const [sareeBorderUrl, blouseBorderUrl, sareeBodyUrl, blouseBodyUrl, sareePalluUrl, sareePleatsUrl] = imageUrls;
  const viewName = viewType === 'front' ? 'FRONT VIEW' : 'BACK VIEW';

  const feedbackBlock = userFeedback && String(userFeedback).trim()
    ? `\n\nUSER FEEDBACK FROM PREVIOUS TRY (fix this):\n${String(userFeedback).trim()}\n\nApply the feedback strictly while keeping the same single-subject catalog format.`
    : '';
  
  const stepUrls = {}; // Track intermediate step URLs

  // Deterministic color lock based on uploaded references
  let sareeBodyHex = null;
  let blouseBodyHex = null;
  try {
    sareeBodyHex = await estimateDominantColorHexFromUrl(sareeBodyUrl);
    blouseBodyHex = await estimateDominantColorHexFromUrl(blouseBodyUrl);
    console.log(`🎯 Color lock: saree-body ${sareeBodyHex}, blouse-body ${blouseBodyHex}`);
  } catch (e) {
    console.warn('⚠️ Failed to estimate dominant colors from reference images:', e.message);
  }

  const colorLockBlock = (sareeBodyHex || blouseBodyHex)
    ? `\n\nCOLOR LOCK (NON-NEGOTIABLE):\n- Saree BODY base color must EXACTLY match the saree-body reference image (do not darken).\n- Blouse BODY base color must EXACTLY match the blouse-body reference image (do not darken).\n- DO NOT shift hue/saturation/brightness. DO NOT auto-enhance, recolor, increase contrast, or add tints.\n- Borders/pallu can add accents but MUST NOT recolor the main saree body or blouse body.`
    : '';
  
  console.log(`Step 1/4: Generating base with saree body + blouse body...`);
  
  // STEP 1: Generate base woman with BOTH saree body + blouse body patterns
  let step1Parts = [
    { text: `⚠️ CRITICAL REQUIREMENTS - READ CAREFULLY:

1. IMAGE DIMENSIONS: Generate at EXACTLY 2400 pixels wide × 3200 pixels tall
2. SUBJECT SIZE: The woman MUST be LARGE, filling 80-90% of the 3200 pixel height (approximately 2560-2880 pixels tall)
3. SINGLE SUBJECT: EXACTLY ONE woman ONLY

Generate a professional catalog photo of an Indian woman wearing a silk saree (${viewName}).${feedbackBlock}

❌ ABSOLUTELY FORBIDDEN - DO NOT CREATE:
- Multiple women in the same image
- Side-by-side comparison layouts  
- Before/after collages
- Split screen or dual views
- Fabric swatch displays
- Pattern closeup samples
- Reference fabric images visible in output
- Two or more versions in one image
- Small centered subject with lots of white space

✅ REQUIRED OUTPUT:
✅ IMAGE: EXACTLY 2400×3200 pixels (portrait)
✅ SUBJECT: ONE woman filling 80-90% of height (she should be 2560-2880 pixels tall in the image)
✅ COMPOSITION: Full body head to toe, properly framed
✅ BACKGROUND: Clean solid white (RGB 255,255,255)
✅ QUALITY: Professional studio lighting, sharp details
✅ NO collages, NO patches, NO fabric swatches visible

CURRENT TASK - STEP 1: Create the BASE with main fabrics
I will show you TWO fabric patterns:
1. SAREE BODY fabric (main saree fabric)
2. BLOUSE BODY fabric (blouse pattern)

The fabric references are the SOURCE OF TRUTH. Copy patterns AND COLORS exactly.${colorLockBlock}

APPLY these patterns TO THE SAREE ON THE WOMAN:
- Saree body fabric on the main saree (primary drape)
- Blouse body fabric on the blouse/choli
- Simple pleats at waist (no elaborate patterns yet)
- No borders or pallu yet

SAREE BODY fabric reference:` }
  ];

  if (masterReferenceUrl) {
    step1Parts.push({ text: `\n\nMASTER REFERENCE (previous result) - for consistency/locking colors and blouse/saree look.\nUse the SAME base saree-body color and SAME blouse-body color as this image.\nDO NOT create collages; this reference must NOT appear in the output:` });
    const masterImg = await downloadImageAsBase64(masterReferenceUrl);
    step1Parts.push({ inline_data: { mime_type: masterImg.mimeType, data: masterImg.data } });
  }
  
  const sareeBodyImg = await downloadImageAsBase64(sareeBodyUrl);
  step1Parts.push({ inline_data: { mime_type: sareeBodyImg.mimeType, data: sareeBodyImg.data } });
  
  step1Parts.push({ text: `\n\nBLOUSE BODY fabric reference:` });
  
  const blouseBodyImg = await downloadImageAsBase64(blouseBodyUrl);
  step1Parts.push({ inline_data: { mime_type: blouseBodyImg.mimeType, data: blouseBodyImg.data } });
  
  step1Parts.push({ text: `\n\nYour task: Apply these fabric patterns to the woman's saree and blouse.

CRITICAL INSTRUCTIONS:
1. Generate ONE photo showing ONLY the woman wearing the saree
2. Background must be solid white with NOTHING else visible
3. The fabric images I showed you are references - DO NOT include them in your output
4. Output should contain ONLY the woman - no fabric samples, no swatches, no pattern images

Generate the image now. Show only the woman. White background. Nothing else.` });
  
  const step1Response = await callGeminiWithRetry(step1Parts);
  
  const step1Content = step1Response.data.candidates?.[0]?.content?.parts || [];
  let step1Image = null;
  for (const part of step1Content) {
    if (part.inlineData || part.inline_data) {
      step1Image = part.inlineData || part.inline_data;
      break;
    }
  }
  
  if (!step1Image) {
    throw new Error('Step 1 failed: No base image generated');
  }

  step1Image = await sanitizeCatalogOutput(step1Image, { stage: 'step1' });
  
  // Save Step 1 output
  const step1Url = await saveStepImage(step1Image, 1, viewType);
  if (step1Url) {
    stepUrls.step1 = step1Url;
    console.log(`📸 Step 1 saved: ${step1Url}`);
  }
  
  console.log(`✅ Step 1 complete. Step 2/4: Adding saree pleats pattern...`);
  await new Promise(r => setTimeout(r, 2000)); // Rate limit delay
  
  // STEP 2: Add saree pleats pattern
  let step2Parts = [
    { text: `MAINTAIN 2400×3200 PIXEL RESOLUTION. Keep the woman LARGE (80-90% of image height).

I have a saree image. Your task: MODIFY the PLEATS section with a new pattern.${feedbackBlock}${colorLockBlock}

CRITICAL:
- Keep the EXACT SAME woman, pose, and SIZE
- Woman must remain LARGE, filling 80-90% of the 3200px height
- Do NOT shrink the subject or add more white space
- Keep output at EXACTLY 2400×3200 pixels

TASK: Update ONLY the SAREE PLEATS (lower body, waist to ankles - the folded front portion).

KEEP EVERYTHING ELSE THE SAME:
- Same woman, pose, background
- Same main saree body fabric pattern and its BASE COLOR (do not change shade)
- Same blouse body pattern and its BASE COLOR (do not change shade)

CHANGE ONLY: The pleats section pattern

Here is the current image:` }
  ];
  
  // Use full resolution from step 1 (already sanitized at 2400x3200)
  step2Parts.push({ inline_data: { mime_type: step1Image.mimeType || step1Image.mime_type || 'image/jpeg', data: step1Image.data } });
  
  step2Parts.push({ text: `\n\nNow here is the SAREE PLEATS fabric reference - apply this to the pleats section only:` });
  
  const sareePleatsImg = await downloadImageAsBase64(sareePleatsUrl);
  step2Parts.push({ inline_data: { mime_type: sareePleatsImg.mimeType, data: sareePleatsImg.data } });
  
  step2Parts.push({ text: `\n\nApply this pleats pattern to the saree. Output: ONE photo of the woman only. No fabric samples visible. White background.` });
  
  const step2Response = await callGeminiWithRetry(step2Parts);
  
  const step2Content = step2Response.data.candidates?.[0]?.content?.parts || [];
  let step2Image = null;
  for (const part of step2Content) {
    if (part.inlineData || part.inline_data) {
      step2Image = part.inlineData || part.inline_data;
      break;
    }
  }
  
  if (!step2Image) {
    console.warn('Step 2 failed, using step 1 image');
    step2Image = step1Image;
  } else {
    step2Image = await sanitizeCatalogOutput(step2Image, { stage: 'step2' });
    // Save Step 2 output
    const step2Url = await saveStepImage(step2Image, 2, viewType);
    if (step2Url) {
      stepUrls.step2 = step2Url;
      console.log(`📸 Step 2 saved: ${step2Url}`);
    }
  }
  
  console.log(`✅ Step 2 complete. Step 3/4: Adding saree borders...`);
  await new Promise(r => setTimeout(r, 2000)); // Rate limit delay
  
  // STEP 3: Add saree border pattern
  let step3Parts = [
    { text: `MAINTAIN 2400×3200 PIXEL RESOLUTION. Keep the woman LARGE (80-90% of image height).

I have a saree image. Your task: Add SAREE BORDERS with EXACT pattern matching.${feedbackBlock}${colorLockBlock}

CRITICAL:
- Keep the EXACT SAME woman, pose, and SIZE
- Woman must remain LARGE, filling 80-90% of the 3200px height
- Do NOT shrink the subject or add more white space
- Keep output at EXACTLY 2400×3200 pixels

THIS IS CRITICAL: The border pattern MUST be applied exactly as shown in the reference image.

KEEP EVERYTHING ELSE THE SAME:
- Same woman, pose, background
- Same saree body fabric and its BASE COLOR (do not change shade)
- Same blouse body pattern and its BASE COLOR (do not change shade)
- Same pleats pattern

ADD SAREE BORDERS at PRECISE locations:
1. VERTICAL BORDER on the pleats edge (the side edge of the folded pleats at the front)
2. HORIZONTAL BORDER at the bottom hem of the saree (where saree touches the floor)
3. BORDER along the pallu edge (the decorative end piece over shoulder)
4. Any additional traditional saree border placements shown in the reference

PATTERN MATCHING REQUIREMENTS:
- Copy the EXACT colors from the border reference image
- Copy the EXACT motifs/designs from the border reference
- Copy the EXACT width/thickness of the border
- Match the repeating pattern precisely
- Do NOT create new designs - replicate what you see in the reference

Current image:` }
  ];
  
  // Use full resolution from step 2 (already sanitized at 2400x3200)
  step3Parts.push({ inline_data: { mime_type: step2Image.mimeType || step2Image.mime_type || 'image/jpeg', data: step2Image.data } });
  
  step3Parts.push({ text: `\n\nSAREE BORDER reference image - REPLICATE this pattern EXACTLY at the border locations described above:` });
  
  const sareeBorderImg = await downloadImageAsBase64(sareeBorderUrl);
  step3Parts.push({ inline_data: { mime_type: sareeBorderImg.mimeType, data: sareeBorderImg.data } });
  
  step3Parts.push({ text: `\n\nVISUAL ANALYSIS REQUIRED:
1. Identify the base color of the border (navy blue, maroon, green, gold, etc.)
2. Count the number of distinct design elements (motifs like peacocks, elephants, mangoes, flowers, geometric shapes)
3. Note the weaving technique (zari work, embroidery, print)
4. Observe the width and proportion of the border
5. Study the repeating pattern sequence

Now APPLY this border TO THE SAREE at:
- Pleats edge (vertical) - full length from waist to floor
- Bottom hem (horizontal) - running along the bottom
- Pallu edge - along the decorative drape

Apply these borders to the saree. Output: ONE photo of the woman only. No fabric samples visible. White background.` });
  
  const step3Response = await callGeminiWithRetry(step3Parts);
  
  const step3Content = step3Response.data.candidates?.[0]?.content?.parts || [];
  let step3Image = null;
  for (const part of step3Content) {
    if (part.inlineData || part.inline_data) {
      step3Image = part.inlineData || part.inline_data;
      break;
    }
  }
  
  if (!step3Image) {
    console.warn('Step 3 failed, using step 2 image');
    step3Image = step2Image;
  } else {
    step3Image = await sanitizeCatalogOutput(step3Image, { stage: 'step3' });
    // Save Step 3 output
    const step3Url = await saveStepImage(step3Image, 3, viewType);
    if (step3Url) {
      stepUrls.step3 = step3Url;
      console.log(`📸 Step 3 saved: ${step3Url}`);
    }
  }
  
  console.log(`✅ Step 3 complete. Step 4/4: Adding blouse border and pallu (FINAL STEP)...`);
  await new Promise(r => setTimeout(r, 2000)); // Rate limit delay
  
  // STEP 4: Add blouse border AND pallu (combined final step)
  const palluInstruction = viewType === 'front' 
    ? 'Add the SAREE PALLU draped over the LEFT shoulder (partially visible on front)'
    : 'Add the SAREE PALLU flowing down the back from left shoulder (this is the MAIN FOCUS in back view)';
    
  let step4Parts = [
    { text: `MAINTAIN 2400×3200 PIXEL RESOLUTION. Keep the woman LARGE (80-90% of image height).

I have a saree image. FINAL TASK: Add BLOUSE BORDER and SAREE PALLU together.${feedbackBlock}${colorLockBlock}

CRITICAL:
- Keep the EXACT SAME woman, pose, and SIZE  
- Woman must remain LARGE, filling 80-90% of the 3200px height
- Do NOT shrink the subject or add more white space
- Keep output at EXACTLY 2400×3200 pixels

THIS IS THE FINAL STEP - Complete the saree look!

KEEP EVERYTHING ELSE THE SAME:
- Same woman, pose, background
- Same saree body fabric and its BASE COLOR (do not change shade)
- Same blouse body base color (do not change shade)
- Same pleats
- Same saree borders

ADD TWO ELEMENTS:
1. BLOUSE BORDER: Below the shoulder, almost above the elbow (arm border of the blouse)
2. SAREE PALLU: ${palluInstruction}

PALLU is the most decorative element - match it PRECISELY with EXACT pattern and embroidery.

Current image:` }
  ];
  
  // Use full resolution from step 3 (already sanitized at 2400x3200)
  step4Parts.push({ inline_data: { mime_type: step3Image.mimeType || step3Image.mime_type || 'image/jpeg', data: step3Image.data } });
  
  step4Parts.push({ text: `\n\nBLOUSE BORDER fabric reference - add this below shoulder, above elbow:` });
  
  const blouseBorderImg = await downloadImageAsBase64(blouseBorderUrl);
  step4Parts.push({ inline_data: { mime_type: blouseBorderImg.mimeType, data: blouseBorderImg.data } });
  
  step4Parts.push({ text: `\n\nSAREE PALLU fabric reference - Study CAREFULLY and replicate EXACTLY:` });
  
  const sareePalluImg = await downloadImageAsBase64(sareePalluUrl);
  step4Parts.push({ inline_data: { mime_type: sareePalluImg.mimeType, data: sareePalluImg.data } });
  
  step4Parts.push({ text: `\n\nDETAILED PALLU ANALYSIS:

STEP 1 - BASE COLOR: Match the EXACT background color (navy blue, maroon, red, green, etc.)
STEP 2 - MOTIFS: Identify ALL traditional symbols (elephants, peacocks, mangoes, lotuses, geometric patterns, florals)
STEP 3 - EMBROIDERY: Note zari work (gold/silver thread), embroidery style, thread colors
STEP 4 - LAYOUT: Pattern arrangement - rows, scattered, border placement, spacing
STEP 5 - BORDERS: Pallu's own decorative border if present

Now APPLY BOTH:
1. Add blouse border below shoulder, above elbow
2. Add pallu with ALL the intricate details identified above

Apply blouse border (below shoulder, above elbow) and pallu patterns to complete the saree.

CRITICAL: Output must show ONLY the woman wearing the saree. The fabric images are references - do NOT include them in the output. Background: solid white. No fabric samples visible anywhere.

Generate ONE photo of the woman. Nothing else.` });
  
  const step4Response = await callGeminiWithRetry(step4Parts);
  
  const step4Content = step4Response.data.candidates?.[0]?.content?.parts || [];
  let step4Image = null;
  for (const part of step4Content) {
    if (part.inlineData || part.inline_data) {
      step4Image = part.inlineData || part.inline_data;
      break;
    }
  }
  
  if (!step4Image) {
    console.warn('Step 4 failed, using step 3 image');
    step4Image = step3Image;
  } else {
    step4Image = await sanitizeCatalogOutput(step4Image, { stage: 'step4-final' });
    // Save Step 4 output
    const step4Url = await saveStepImage(step4Image, 4, viewType);
    if (step4Url) {
      stepUrls.step4 = step4Url;
      console.log(`📸 Step 4 saved: ${step4Url}`);
    }
  }
  
  // Step 4 is the final image
  const finalImage = step4Image;
  
  console.log(`✅ Sequential generation complete (4 steps)!`);
  console.log(`🎨 View intermediate steps at:`, stepUrls);
  
  // Attach step URLs to the final image for debugging
  finalImage.stepUrls = stepUrls;
  
  return finalImage;
}

// NEW: Single-shot saree DESIGN generation (no multi-step).
// Generates a clean product-style saree design image using ALL 6 parts at once.
async function generateSareeDesignOneShot(
  imageUrls,
  viewType,
  masterReferenceUrl = null,
  userFeedback = '',
  partsSheetImage = null,
  lockedColorsIn = null,
  paletteLockIn = null,
  masterReferenceImage = null
) {
  const [sareeBorderUrl, blouseBorderUrl, sareeBodyUrl, blouseBodyUrl, sareePalluUrl, sareePleatsUrl] = imageUrls;
  const viewName = viewType === 'front' ? 'FRONT VIEW' : 'BACK VIEW';

  // Prefer deterministic locks computed from original upload buffers in the handler.
  const lockedSareeBodyHex = lockedColorsIn?.sareeBody || null;
  const lockedBlouseBodyHex = lockedColorsIn?.blouseBody || null;

  if (lockedSareeBodyHex || lockedBlouseBodyHex) {
    console.log(`🎨 Color lock (saree-body): ${lockedSareeBodyHex || '(unavailable)'}`);
    console.log(`🎨 Color lock (blouse-body): ${lockedBlouseBodyHex || '(unavailable)'}`);
  } else {
    console.warn('⚠️ Color lock unavailable (lockedColorsIn missing)');
  }

  const colorLockBlock = (lockedSareeBodyHex || lockedBlouseBodyHex)
    ? `\n\nCOLOR LOCK (NON-NEGOTIABLE):\n- Saree BODY base color must be preserved EXACTLY as the saree-body reference image. Do NOT shift hue/saturation/brightness. Do NOT darken or increase contrast.\n- Blouse BODY base color must be preserved EXACTLY as the blouse-body reference image. Do NOT shift hue/saturation/brightness. Do NOT darken or increase contrast.\n- Even when applying user feedback, these two base colors must remain unchanged. If feedback conflicts, prioritize color lock.`
    : '';

  // IMPORTANT: Do NOT enforce a full "allowed palette".
  // It can cause unintended shifts in the saree's overall color.
  // We only enforce the two base colors via COLOR LOCK + swatch references.
  void paletteLockIn;

  const feedbackBlock = userFeedback && String(userFeedback).trim()
    ? `\n\nUSER FEEDBACK (apply strictly):\n${String(userFeedback).trim()}`
    : '';

  const editModeBlock = (masterReferenceUrl || masterReferenceImage?.data)
    ? `\n\nEDIT MODE (NON-NEGOTIABLE):\n- Treat the MASTER REFERENCE as the base output.\n- Keep EVERYTHING identical unless the user feedback explicitly requires a change.\n- Preserve ALL colors and patterns; do not recolor or add any new color blocks.\n- Make the smallest possible change to satisfy the feedback.`
    : '';

  const parts = [];

  parts.push({
    text: `You are generating a SINGLE product design image of a saree using reference fabric parts.\n\nOUTPUT REQUIREMENTS (NON-NEGOTIABLE):\n- EXACT size: 2400×3200 px, portrait\n- Background: pure white (RGB 255,255,255)\n- Output must show ONLY the saree product design (NO woman, NO mannequin, NO model, NO jewellery, NO props).\n- Show a complete saree design layout: body, pleats section, pallu, and borders clearly visible.\n- Include the blouse piece/fabric as a small folded piece next to the saree (same background).\n- High-quality e-commerce product photo style.\n\nVIEW: ${viewName}${colorLockBlock}\n${feedbackBlock}${editModeBlock}\n\nI will provide (A) a LABELED 2×3 reference sheet image to help you understand which fabric is which, plus (B) the 6 individual fabric part images.\n\nCRITICAL: The labeled sheet and the reference images are ONLY FOR UNDERSTANDING. Do NOT copy the labels, do NOT include any text, do NOT include any collage/split screen in the output.\n\nCopy patterns and colors EXACTLY. Do not invent new motifs.\n\nStart with MASTER REFERENCE only if present, then use the LABELED SHEET for part identification, then apply all individual parts below.`
  });

  parts.push({
    text: `\nSECTION MAPPING (NON-NEGOTIABLE):\n- Saree BODY area: use ONLY SAREE BODY reference (pattern + color).\n- PALLU area: use ONLY PALLU reference (pattern + color).\n- PLEATS area: use ONLY SAREE PLEATS reference (pattern + color).\n- SAREE BORDERS/EDGES: use ONLY SAREE BORDER reference (pattern + color).\n- BLOUSE PIECE: use ONLY BLOUSE BODY + BLOUSE BORDER references (pattern + color).\n\nABSOLUTELY FORBIDDEN:\n- Adding any new color blocks/bands/panels not present in the references.\n- Adding extra motifs or extra colored stripes.\n- Putting any text/labels in the output.`
  });

  if (masterReferenceImage?.data) {
    parts.push({
      text: `\nMASTER REFERENCE (base output; do not include it in output):`
    });
    parts.push({
      inline_data: {
        mime_type: masterReferenceImage.mimeType || masterReferenceImage.mime_type || 'image/jpeg',
        data: masterReferenceImage.data
      }
    });
  } else if (masterReferenceUrl) {
    parts.push({
      text: `\nMASTER REFERENCE (consistency only, do not include it in output):`
    });
    const masterImg = await downloadImageAsBase64(masterReferenceUrl);
    parts.push({ inline_data: { mime_type: masterImg.mimeType, data: masterImg.data } });
  }

  if (partsSheetImage?.data) {
    parts.push({ text: `\nLABELED REFERENCE SHEET (use for identifying which part is which; do not include in output):` });
    parts.push({
      inline_data: {
        mime_type: partsSheetImage.mimeType || partsSheetImage.mime_type || 'image/jpeg',
        data: partsSheetImage.data
      }
    });
  }

  // Do NOT send hex-derived swatches.
  // In practice, swatches + hex values can cause the model to “reinterpret” the shade.
  // The fabric reference images are the source of truth.

  parts.push({ text: `\nSAREE BODY reference:` });
  const sareeBodyImg = await downloadImageAsBase64(sareeBodyUrl);
  parts.push({ inline_data: { mime_type: sareeBodyImg.mimeType, data: sareeBodyImg.data } });

  parts.push({ text: `\nBLOUSE BODY reference:` });
  const blouseBodyImg = await downloadImageAsBase64(blouseBodyUrl);
  parts.push({ inline_data: { mime_type: blouseBodyImg.mimeType, data: blouseBodyImg.data } });

  parts.push({ text: `\nSAREE PLEATS reference (apply to pleats section):` });
  const sareePleatsImg = await downloadImageAsBase64(sareePleatsUrl);
  parts.push({ inline_data: { mime_type: sareePleatsImg.mimeType, data: sareePleatsImg.data } });

  parts.push({ text: `\nSAREE BORDER reference (apply as borders/edges):` });
  const sareeBorderImg = await downloadImageAsBase64(sareeBorderUrl);
  parts.push({ inline_data: { mime_type: sareeBorderImg.mimeType, data: sareeBorderImg.data } });

  parts.push({ text: `\nBLOUSE BORDER reference (apply to blouse piece border):` });
  const blouseBorderImg = await downloadImageAsBase64(blouseBorderUrl);
  parts.push({ inline_data: { mime_type: blouseBorderImg.mimeType, data: blouseBorderImg.data } });

  parts.push({ text: `\nSAREE PALLU reference (apply to pallu area):` });
  const sareePalluImg = await downloadImageAsBase64(sareePalluUrl);
  parts.push({ inline_data: { mime_type: sareePalluImg.mimeType, data: sareePalluImg.data } });

  parts.push({
    text: `\nFINAL INSTRUCTIONS:\n- Generate ONE SINGLE IMAGE only.\n- Do NOT show any person/model/mannequin.\n- Do NOT show any of the reference images in the output.\n- Keep output clean and centered on white background.\n\nGenerate the saree product design image now.`
  });

  const response = await callGeminiWithRetry(parts);
  const content = response.data.candidates?.[0]?.content?.parts || [];
  let outImage = null;
  for (const part of content) {
    if (part.inlineData || part.inline_data) {
      outImage = part.inlineData || part.inline_data;
      break;
    }
  }

  if (!outImage) {
    throw new Error('One-shot saree design generation failed: no image returned');
  }

  outImage = await sanitizeCatalogOutput(outImage, { stage: `one-shot-${viewType}` });

  return {
    image: outImage,
    lockedColors: {
      sareeBody: lockedSareeBodyHex,
      blouseBody: lockedBlouseBodyHex
    }
  };
}

export default async function handler(req, res) {
  console.log(`\n🧩 [drape-saree-parts] handler reached: ${req.method} (content-type: ${req.headers?.['content-type'] || 'n/a'})`);
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uploadMiddleware = upload.fields([
    { name: 'saree-border', maxCount: 1 },
    { name: 'blouse-border', maxCount: 1 },
    { name: 'saree-body', maxCount: 1 },
    { name: 'blouse-body', maxCount: 1 },
    { name: 'saree-pallu', maxCount: 1 },
    { name: 'saree-pleats', maxCount: 1 },
  ]);

  let cloudinaryResults = {};
  try {
    await new Promise((resolve, reject) => {
      uploadMiddleware(req, res, (err) => {
        if (err) return reject(new Error(`File upload error: ${err.message}`));
        resolve();
      });
    });

    const files = req.files || {};
    const requiredParts = ['saree-border', 'blouse-border', 'saree-body', 'blouse-body', 'saree-pallu', 'saree-pleats'];
    const missingParts = requiredParts.filter(part => !req.files[part]);
    if (missingParts.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required saree part images', 
        missingParts,
        required: 'Please upload all 6 parts: saree-border, blouse-border, saree-body, blouse-body, saree-pallu, saree-pleats'
      });
    }

    const uploadResults = [];
    for (const partName of requiredParts) {
      const result = await uploadToCloudinary(files[partName][0].buffer, partName);
      uploadResults.push(result.secure_url);
      cloudinaryResults[partName] = result;
    }

    // Deterministic color lock from ORIGINAL UPLOAD BUFFERS (not Cloudinary URLs).
    // This avoids tiny drift due to Cloudinary transcoding and keeps feedback retries stable.
    let lockedColorsFromParts = { sareeBody: null, blouseBody: null };
    try {
      lockedColorsFromParts.sareeBody = await estimateMedianColorHexFromBuffer(files['saree-body'][0].buffer);
    } catch (e) {
      console.warn('⚠️ Failed to compute locked saree-body color from buffer:', e?.message || e);
    }
    try {
      lockedColorsFromParts.blouseBody = await estimateMedianColorHexFromBuffer(files['blouse-body'][0].buffer);
    } catch (e) {
      console.warn('⚠️ Failed to compute locked blouse-body color from buffer:', e?.message || e);
    }
    console.log('🎯 Locked colors from uploads:', lockedColorsFromParts);

    // NOTE: User requested to NOT use a full allowed-palette lock.
    // We only lock saree-body + blouse-body base colors for consistency.

    // Create a labeled parts sheet:
    // 1) Return it for UI/debugging
    // 2) ALSO feed it to Gemini as a reference to improve part understanding/accuracy
    let partsSheetUrl = null;
    let partsSheetImageForGemini = null;
    try {
      console.log('🧾 Building labeled parts sheet (2x3 grid)...');
      const partUrls = {
        'saree-border': cloudinaryResults['saree-border']?.secure_url,
        'blouse-border': cloudinaryResults['blouse-border']?.secure_url,
        'saree-body': cloudinaryResults['saree-body']?.secure_url,
        'blouse-body': cloudinaryResults['blouse-body']?.secure_url,
        'saree-pallu': cloudinaryResults['saree-pallu']?.secure_url,
        'saree-pleats': cloudinaryResults['saree-pleats']?.secure_url
      };

      const sheetBuffer = await createLabeledPartsSheet(partUrls);
      partsSheetImageForGemini = { data: sheetBuffer.toString('base64'), mimeType: 'image/jpeg' };

      const sheetUpload = await uploadToCloudinary(sheetBuffer, 'parts-sheet');
      partsSheetUrl = sheetUpload?.secure_url || null;
      if (partsSheetUrl) {
        console.log('✅ Parts sheet uploaded:', partsSheetUrl);
      }
    } catch (e) {
      console.warn('⚠️ Parts sheet generation failed (continuing):', e?.message || e);
    }

    const generatedViews = {};
    const generatedUrls = {};

    const userFeedback = req.body?.userFeedback || '';
    const masterReferenceUrl = req.body?.masterReferenceUrl || null;
    const masterReferenceMemoryKey = req.body?.masterReferenceMemoryKey || null;
    const masterReferenceFrontMemoryKey = req.body?.masterReferenceFrontMemoryKey || null;
    const masterReferenceBackMemoryKey = req.body?.masterReferenceBackMemoryKey || null;
    let feedbackTargets = [];
    try {
      const raw = req.body?.feedbackTargets;
      if (raw) {
        const parsed = JSON.parse(String(raw));
        if (Array.isArray(parsed)) feedbackTargets = parsed;
      }
    } catch {
      // ignore
    }
    const feedbackTargetSet = new Set(Array.isArray(feedbackTargets) ? feedbackTargets : []);
    const sessionId = req.body?.sessionId || null;

    // Stable memory key per session to support "image memory" feedback loops.
    const sareeDesignMemoryKey = String(masterReferenceMemoryKey || (sessionId ? `saree-design-${sessionId}` : 'saree-design-default'));
    const masterReferenceImage = masterReferenceMemoryKey
      ? await loadImageFromMemory(String(masterReferenceMemoryKey))
      : null;
    if (masterReferenceMemoryKey) {
      console.log('🧠 Master reference memory key:', masterReferenceMemoryKey, masterReferenceImage ? '(hit)' : '(miss)');
    }

    // Stable memory keys for final (front/back) outputs.
    const frontViewMemoryKey = String(masterReferenceFrontMemoryKey || (sessionId ? `final-front-${sessionId}` : 'final-front-default'));
    const backViewMemoryKey = String(masterReferenceBackMemoryKey || (sessionId ? `final-back-${sessionId}` : 'final-back-default'));

    const masterFrontImage = masterReferenceFrontMemoryKey
      ? await loadImageFromMemory(String(masterReferenceFrontMemoryKey))
      : null;
    const masterBackImage = masterReferenceBackMemoryKey
      ? await loadImageFromMemory(String(masterReferenceBackMemoryKey))
      : null;
    if (masterReferenceFrontMemoryKey) {
      console.log('🧠 Master FRONT memory key:', masterReferenceFrontMemoryKey, masterFrontImage ? '(hit)' : '(miss)');
    }
    if (masterReferenceBackMemoryKey) {
      console.log('🧠 Master BACK memory key:', masterReferenceBackMemoryKey, masterBackImage ? '(hit)' : '(miss)');
    }

    // If the user is giving feedback and we have BOTH prior final views in memory,
    // prefer editing the final outputs directly (more stable than re-running try-on).
    const hasFeedback = !!(userFeedback && String(userFeedback).trim());
    const canEditFinalViewsFromMemory = hasFeedback && !!(masterFrontImage?.data && masterBackImage?.data);

    async function partBufferToSmallJpegBase64(buf) {
      try {
        const out = await sharp(buf)
          .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85, progressive: true })
          .toBuffer();
        return out.toString('base64');
      } catch {
        return Buffer.from(buf).toString('base64');
      }
    }

    // Build extra fabric refs for Imagen based on the selected feedback targets.
    // This helps Imagen keep the exact fabric/pattern (e.g., pallu) while editing.
    const extraFabricRefsBase64 = [];
    try {
      const map = {
        'saree-pallu': 'saree-pallu',
        'saree-border': 'saree-border',
        'saree-body': 'saree-body',
        'saree-pleats': 'saree-pleats',
        'blouse-body': 'blouse-body',
        'blouse-border': 'blouse-border'
      };
      for (const [target, field] of Object.entries(map)) {
        if (!feedbackTargetSet.has(target)) continue;
        const part = req.files?.[field]?.[0];
        if (part?.buffer) {
          extraFabricRefsBase64.push(await partBufferToSmallJpegBase64(part.buffer));
        }
      }
    } catch (e) {
      console.warn('⚠️ Failed building extra fabric refs for Imagen (continuing):', e?.message || e);
    }

    function buildStrictTargetRulesForImagen(targetSet) {
      const hasTargets = targetSet && targetSet.size > 0;
      const targetsLine = hasTargets
        ? `\n\nONLY CHANGE THESE TARGETS (STRICT):\n- ${Array.from(targetSet).join('\n- ')}\n\nFOR EVERYTHING ELSE:\n- Keep it IDENTICAL to the input image. Do NOT make any other improvements or changes.`
        : `\n\nONLY CHANGE what the user feedback explicitly requires. Otherwise keep everything IDENTICAL.`;

      const rules = [];
      const regions = [
        {
          key: 'saree-pallu',
          name: 'Saree pallu',
          edit: 'Change ONLY the pallu drape/flow/placement/appearance. Do not touch any other saree regions.',
          freeze: 'Do NOT change the pallu (drape, length, folds, pattern, color) unless feedback explicitly demands it.'
        },
        {
          key: 'saree-border',
          name: 'Saree border',
          edit: 'Change ONLY the saree border/edge detailing. Do not recolor or alter the saree body, pleats, or pallu.',
          freeze: 'Do NOT change the saree border/edge detailing.'
        },
        {
          key: 'saree-body',
          name: 'Saree body',
          edit: 'Change ONLY the main saree body area. Do not alter borders, pallu, pleats, or blouse.',
          freeze: 'Do NOT change the saree body area.'
        },
        {
          key: 'saree-pleats',
          name: 'Saree pleats',
          edit: 'Change ONLY the pleats region (folds/placement/pleat pattern alignment). Do not alter pallu, borders, saree body, or blouse.',
          freeze: 'Do NOT change the pleats region.'
        },
        {
          key: 'blouse-body',
          name: 'Blouse body',
          edit: 'Change ONLY the blouse body area. Do not alter the saree (body/border/pallu/pleats).',
          freeze: 'Do NOT change the blouse body area.'
        },
        {
          key: 'blouse-border',
          name: 'Blouse border',
          edit: 'Change ONLY the blouse border/trim. Do not alter blouse body or any saree regions.',
          freeze: 'Do NOT change the blouse border/trim.'
        }
      ];

      for (const r of regions) {
        const on = targetSet?.has?.(r.key);
        rules.push(`- ${r.name}: ${on ? r.edit : r.freeze}`);
      }

      return `${targetsLine}\n\nTARGET-SPECIFIC RULES (STRICT):\n${rules.join('\n')}`;
    }

    // NEW: One-shot saree DESIGN generation (no multi-step)
    console.log(`\n🎨 Generating saree DESIGN in one shot (no multi-step)...`);
    let designImageData = null;
    let designUrl = null;
    let lockedColors = null;
    try {
      const shouldTryImagenEdit = !!(userFeedback && String(userFeedback).trim() && (masterReferenceImage?.data || masterReferenceUrl));

      if (shouldTryImagenEdit) {
        console.log('🧩 Feedback detected + master reference present → trying Imagen edit first');

        // Get the raw base64 from memory (preferred) or from the URL.
        const rawRef = masterReferenceImage?.data
          ? masterReferenceImage
          : (masterReferenceUrl ? await downloadImageAsBase64(masterReferenceUrl) : null);

        const lockedSaree = lockedColorsFromParts?.sareeBody;
        const lockedBlouse = lockedColorsFromParts?.blouseBody;

        const strictRules = buildStrictTargetRulesForImagen(feedbackTargetSet);
        const editPrompt = `Edit the provided saree PRODUCT DESIGN image (flatlay / product layout).\n\nUSER FEEDBACK (apply exactly):\n${String(userFeedback).trim()}${strictRules}\n\nNON-NEGOTIABLE CONSTRAINTS:\n- Saree BODY base color must remain EXACTLY as the saree-body reference image (do NOT darken, do NOT increase contrast).\n- Blouse BODY base color must remain EXACTLY as the blouse-body reference image (do NOT darken, do NOT increase contrast).\n- Do NOT introduce new color bands/blocks/stripes/panels.\n- Do NOT change the overall product layout (single product on pure white background, no person, no text).\n- Output must remain a clean e-commerce product image.\n- Use the provided fabric reference images as the source of truth for pattern + color (no reinterpretation).`;

        const negativePrompt = `No recolor. No new colors. No global enhancement. No style change. No text. No labels. No collage. No split screen. No mannequin. No model. No background patterns.`;

        try {
          const edited = await editImageWithImagenCapability({
            rawImageBase64: rawRef?.data,
            prompt: editPrompt,
            negativePrompt,
            // Imagen edit (mask-free) only supports 1 RAW image; extra refs are ignored.
            extraRawImagesBase64: extraFabricRefsBase64
          });

          const sanitized = await sanitizeCatalogOutput(
            { data: edited.data, mimeType: edited.mimeType, mime_type: edited.mimeType },
            { stage: 'imagen-edit' }
          );

          designImageData = sanitized;
          lockedColors = {
            sareeBody: lockedColorsFromParts?.sareeBody || null,
            blouseBody: lockedColorsFromParts?.blouseBody || null
          };
        } catch (e) {
          console.warn('⚠️ Imagen edit failed; falling back to Gemini one-shot design regeneration:', e?.message || e);
          const designResult = await generateSareeDesignOneShot(
            uploadResults,
            'front',
            masterReferenceUrl,
            userFeedback,
            partsSheetImageForGemini,
            lockedColorsFromParts,
            null,
            masterReferenceImage
          );
          designImageData = designResult?.image;
          lockedColors = designResult?.lockedColors || null;
        }
      } else {
        const designResult = await generateSareeDesignOneShot(
          uploadResults,
          'front',
          masterReferenceUrl,
          userFeedback,
          partsSheetImageForGemini,
          lockedColorsFromParts,
          null,
          masterReferenceImage
        );
        designImageData = designResult?.image;
        lockedColors = designResult?.lockedColors || null;
      }

      if (!designImageData?.data) throw new Error('No design image data generated');

      // Save the *high-quality* design into local memory for the next feedback retry.
      try {
        await saveImageToMemory(designImageData.data, sareeDesignMemoryKey);
        console.log('🧠 Saved design to memory:', sareeDesignMemoryKey);
      } catch (e) {
        console.warn('⚠️ Failed to save design to memory (continuing):', e?.message || e);
      }

      designUrl = await uploadGeneratedImageToCloudinary(
        designImageData.data,
        'saree-design',
        designImageData.mime_type || designImageData.mimeType || 'image/png'
      );

      // Use the same single saree design image for both try-on views.
      generatedViews.front = designUrl;
      generatedViews.back = designUrl;
      generatedUrls.front = designUrl;
      generatedUrls.back = designUrl;

      console.log('\n========================================');
      console.log('🧵 SAREE DESIGN UPLOADED TO CLOUDINARY');
      console.log('========================================');
      console.log('✅ Design URL:', designUrl);
      if (lockedColors?.sareeBody || lockedColors?.blouseBody) {
        console.log('🎨 Locked colors:', lockedColors);
      }
      console.log('========================================\n');
    } catch (error) {
      console.error('Failed to generate one-shot saree design:', error.message);
      throw error;
    }

    // IMPORTANT:
    // Editing human/model photos directly with Imagen (mask-free) has been producing
    // low-quality outputs (face masking, background artifacts). For feedback retries,
    // we always re-run Virtual Try-On on the fixed model images after updating the design.
    // Keep the memory keys, but DO NOT short-circuit by editing final views.
    if (false && canEditFinalViewsFromMemory) {
      console.log('🧩 Editing FINAL front/back views from memory using Imagen...');
      const lockedSaree = lockedColorsFromParts?.sareeBody;
      const lockedBlouse = lockedColorsFromParts?.blouseBody;

      const targetNames = {
        'saree-pallu': 'Saree pallu',
        'saree-border': 'Saree border',
        'saree-body': 'Saree body',
        'saree-pleats': 'Saree pleats',
        'blouse-body': 'Blouse body',
        'blouse-border': 'Blouse border'
      };
      const selectedTargets = Array.from(feedbackTargetSet)
        .map((t) => targetNames[t] || t)
        .filter(Boolean);

      const strictRules = buildStrictTargetRulesForImagen(feedbackTargetSet);

      const commonPrompt = `Edit the provided image of a model wearing the saree.\n\nUSER FEEDBACK (apply exactly):\n${String(userFeedback).trim()}${strictRules}\n\nNON-NEGOTIABLE CONSTRAINTS:\n- Keep the OUTPUT STYLE identical to the input photo.\n- Saree BODY base color must remain EXACTLY as the saree-body reference image (do NOT darken, do NOT increase contrast).\n- Blouse BODY base color must remain EXACTLY as the blouse-body reference image (do NOT darken, do NOT increase contrast).\n- Do NOT introduce any new color bands/blocks/stripes/panels.\n- Keep the same pose, lighting, composition, and background.\n- Do NOT change face, hair, skin, jewelry, background, pose, camera, lighting unless the feedback explicitly demands it.\n- Output must remain ONE single model photo (no collage, no split-screen, no extra people).`;

      const negativePrompt = `No recolor. No new colors. No global enhancement. No style change. No text. No labels. No collage. No split-screen. No extra people. No product-flatlay.`;

      let editedFront = null;
      let editedBack = null;
      try {
        const frontOut = await editImageWithImagenCapability({
          rawImageBase64: masterFrontImage.data,
          prompt: `FRONT VIEW. ${commonPrompt}`,
          negativePrompt,
          extraRawImagesBase64: extraFabricRefsBase64
        });
        editedFront = await sanitizeCatalogOutput(
          { data: frontOut.data, mimeType: frontOut.mimeType, mime_type: frontOut.mimeType },
          { stage: 'imagen-edit-final-front' }
        );
      } catch (e) {
        console.warn('⚠️ Imagen edit failed for FRONT; falling back to previous front image:', e?.message || e);
      }

      try {
        const backOut = await editImageWithImagenCapability({
          rawImageBase64: masterBackImage.data,
          prompt: `BACK VIEW. ${commonPrompt}`,
          negativePrompt,
          extraRawImagesBase64: extraFabricRefsBase64
        });
        editedBack = await sanitizeCatalogOutput(
          { data: backOut.data, mimeType: backOut.mimeType, mime_type: backOut.mimeType },
          { stage: 'imagen-edit-final-back' }
        );
      } catch (e) {
        console.warn('⚠️ Imagen edit failed for BACK; falling back to previous back image:', e?.message || e);
      }

      const finalFrontBase64 = editedFront?.data || masterFrontImage.data;
      const finalBackBase64 = editedBack?.data || masterBackImage.data;

      // Persist edited finals back to memory for the next retry.
      try {
        await saveImageToMemory(finalFrontBase64, frontViewMemoryKey);
        await saveImageToMemory(finalBackBase64, backViewMemoryKey);
        console.log('🧠 Saved edited final views to memory:', frontViewMemoryKey, backViewMemoryKey);
      } catch (e) {
        console.warn('⚠️ Failed to save final views to memory (continuing):', e?.message || e);
      }

      // Upload edited finals for UI.
      const frontUrl = await uploadGeneratedImageToCloudinary(finalFrontBase64, 'final-front-edit');
      const backUrl = await uploadGeneratedImageToCloudinary(finalBackBase64, 'final-back-edit');

      res.json({
        success: true,
        frontView: frontUrl,
        backView: backUrl,
        sareeDesignUrl: designUrl || null,
        sareeDesignMemoryKey,
        frontViewMemoryKey,
        backViewMemoryKey,
        lockedColors: lockedColors || null,
        partsSheetUrl,
        generatedUrls: {
          front: frontUrl,
          back: backUrl
        },
        message: 'Updated front/back views using your feedback.',
        model: 'Imagen Edit (final views)',
        hasTryOn: true
      });
      return;
    }

    // Apply Virtual Try-On to BOTH front and back views (optional, won't break if it fails)
    let tryonFrontView = null;
    let tryonBackView = null;
    
    console.log('\n========================================');
    console.log('🔄 VIRTUAL TRY-ON PROCESS STARTING');
    console.log('========================================');
    
    if (!GOOGLE_PROJECT_ID) {
      console.log('❌ GOOGLE_PROJECT_ID not set - SKIPPING Virtual Try-On');
      console.log('📦 Will return: ORIGINAL GEMINI-GENERATED SAREE DESIGNS');
    } else if (!generatedViews.front || !generatedViews.back) {
      console.log('❌ Missing saree views - SKIPPING Virtual Try-On');
      console.log('📦 Will return: ORIGINAL GEMINI-GENERATED SAREE DESIGNS');
    } else {
      console.log('✅ Google Project ID found:', GOOGLE_PROJECT_ID);
      console.log('✅ Front saree URL:', generatedViews.front);
      console.log('✅ Back saree URL:', generatedViews.back);
      console.log('👗 Starting Virtual Try-On with your model images...\n');
      
      // Apply to FRONT view with FRONT model
      try {
        console.log('🔹 [1/2] FRONT VIEW TRY-ON');
        console.log('    Saree:', generatedViews.front);
        console.log('    Model:', MODEL_FRONT_URL);
        const tryonFrontData = await applyVirtualTryOn(generatedViews.front, MODEL_FRONT_URL);
        if (tryonFrontData) {
          // Save base64 to memory before uploading.
          try {
            await saveImageToMemory(tryonFrontData.data, frontViewMemoryKey);
            console.log('🧠 Saved final FRONT to memory:', frontViewMemoryKey);
          } catch (e) {
            console.warn('⚠️ Failed to save final FRONT to memory (continuing):', e?.message || e);
          }
          const tryonFrontUrl = await uploadGeneratedImageToCloudinary(
            tryonFrontData.data,
            'tryon-front-view',
            tryonFrontData.mimeType
          );
          tryonFrontView = tryonFrontUrl;
          console.log('    ✅ SUCCESS - Front view try-on URL:', tryonFrontUrl);
        } else {
          console.log('    ❌ FAILED - No data returned from Google API');
        }
      } catch (error) {
        console.log('    ❌ FAILED - Error:', error.message);
      }
      
      console.log('');
      
      // Apply to BACK view with BACK model
      try {
        console.log('🔹 [2/2] BACK VIEW TRY-ON');
        console.log('    Saree:', generatedViews.back);
        console.log('    Model:', MODEL_BACK_URL);
        const tryonBackData = await applyVirtualTryOn(generatedViews.back, MODEL_BACK_URL);
        if (tryonBackData) {
          // Save base64 to memory before uploading.
          try {
            await saveImageToMemory(tryonBackData.data, backViewMemoryKey);
            console.log('🧠 Saved final BACK to memory:', backViewMemoryKey);
          } catch (e) {
            console.warn('⚠️ Failed to save final BACK to memory (continuing):', e?.message || e);
          }
          const tryonBackUrl = await uploadGeneratedImageToCloudinary(
            tryonBackData.data,
            'tryon-back-view',
            tryonBackData.mimeType
          );
          tryonBackView = tryonBackUrl;
          console.log('    ✅ SUCCESS - Back view try-on URL:', tryonBackUrl);
        } else {
          console.log('    ❌ FAILED - No data returned from Google API');
        }
      } catch (error) {
        console.log('    ❌ FAILED - Error:', error.message);
      }
      
      console.log('');
    }

    // Return ONLY try-on views if available, otherwise fallback to original generated views
    const finalFrontView = tryonFrontView || generatedViews.front;
    const finalBackView = tryonBackView || generatedViews.back;
    
    console.log('========================================');
    console.log('📦 FINAL OUTPUT:');
    console.log('========================================');
    if (tryonFrontView && tryonBackView) {
      console.log('✅ VIRTUAL TRY-ON SUCCESS!');
      console.log('📸 Returning: MODEL WEARING SAREE (both views)');
      console.log('   Front:', finalFrontView);
      console.log('   Back:', finalBackView);
    } else if (tryonFrontView || tryonBackView) {
      console.log('⚠️ PARTIAL VIRTUAL TRY-ON');
      console.log('📸 Returning: Mixed results');
      console.log('   Front:', tryonFrontView ? '✅ Try-on' : '❌ Fallback to Gemini', finalFrontView);
      console.log('   Back:', tryonBackView ? '✅ Try-on' : '❌ Fallback to Gemini', finalBackView);
    } else {
      console.log('❌ NO VIRTUAL TRY-ON');
      console.log('📸 Returning: ORIGINAL GEMINI-GENERATED DESIGNS');
      console.log('   Front:', finalFrontView);
      console.log('   Back:', finalBackView);
    }
    console.log('========================================\n');

    res.json({
      success: true,
      frontView: finalFrontView,
      backView: finalBackView,
      sareeDesignUrl: designUrl || generatedUrls.front || null,
      sareeDesignMemoryKey,
      frontViewMemoryKey,
      backViewMemoryKey,
      lockedColors: lockedColors || null,
      partsSheetUrl,
      generatedUrls: {
        front: finalFrontView,
        back: finalBackView
      },
      message: (tryonFrontView && tryonBackView) 
        ? 'Saree generated and applied to your model successfully!' 
        : 'Saree views generated successfully!',
      model: 'FLUX.1-schnell + Google Virtual Try-On',
      hasTryOn: !!(tryonFrontView && tryonBackView)
    });

  } catch (error) {
    console.error('API Error:', error);
    
    if (Object.keys(cloudinaryResults).length > 0) {
      for (const part of Object.values(cloudinaryResults)) {
        if (part?.public_id) {
          await cloudinary.uploader.destroy(part.public_id).catch(() => {});
        }
      }
    }

    res.status(500).json({
      error: 'Failed to process saree parts',
      details: error.message
    });
  }
}

export const config = {
  api: { bodyParser: false }
};
