import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';
import multer from 'multer';
import { Readable } from 'stream';
import dotenv from "dotenv";
dotenv.config();


// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Gemini API configuration (model name you showed access for)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Multer config
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024, files: 4 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed!'), false);
  }
});

// upload part -> Cloudinary
async function uploadToCloudinary(fileBuffer, sareePart) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: `saree-parts/${sareePart}`,
        public_id: `${sareePart}-${Date.now()}`,
        format: 'jpg',
        quality: 'auto:good',
        width: 512,
        height: 512,
        crop: 'limit'
      },
      (error, result) => {
        if (error) {
          console.error(`Cloudinary upload error for ${sareePart}:`, error);
          return reject(error);
        }
        resolve(result);
      }
    );

    Readable.from(fileBuffer).pipe(uploadStream);
  });
}

// upload generated base64 image to Cloudinary
async function uploadGeneratedImageToCloudinary(base64Data, viewType) {
  const buffer = Buffer.from(base64Data, 'base64');
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: `generated-sarees/${viewType}`,
        public_id: `saree-${viewType}-${Date.now()}`,
        format: 'jpg',
        quality: 'auto:good'
      },
      (error, result) => {
        if (error) {
          console.error(`Cloudinary upload error for ${viewType}:`, error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}


// Convert image URL → Base64 → inline_data
async function downloadImageAsBase64(imageUrl) {
  try {
    console.log(`Downloading: ${imageUrl}`);

    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const base64Data = Buffer.from(response.data).toString("base64");
    const mimeType = response.headers["content-type"] || "image/jpeg";

    return { data: base64Data, mimeType };
  } catch (error) {
    console.error("downloadImageAsBase64 ERROR:", error.message);
    throw new Error(`Failed to download image: ${error.message}`);
  }
}


// Generate a single view — now using image URLs (not inline base64)
async function generateSareeViewUsingUrls(imageUrlResults, viewType, masterReferenceUrl) {
  const viewName = viewType === 'front' ? 'FRONT VIEW' : 'BACK VIEW';
  const viewInstruction = viewType === 'front' ? 'Front View' : 'Back View';

  const parts = [
    { text: `ROLE: Virtual Saree Assembler.
TASK: Assemble the 4 provided garment parts (BLOUSE, PLEATS, PALLU, SHOULDER) into a single COHESIVE ${viewName} saree image on a realistic Indian model.

INSTRUCTIONS:
1. BLOUSE: Use the provided 'BLOUSE' image for the top garment.
2. PLEATS: Use the 'PLEATS' image for the central lower drape.
3. PALLU: Drap the 'PALLU' image over the left shoulder.
4. SHOULDER: Connect the pleats and pallu using the 'SHOULDER' image.

CRITICAL RULES:
- OUTPUT: Generate ONLY a ${viewInstruction}.
- STITCHING: The parts must blend seamlessly. No visible cut lines.
- FIDELITY: Keep the colors and patterns exactly as they are in the source images.
- STYLE: Simple, clean, realistic catalog shot. No dramatic lighting or extra effects.
- NO WATERMARKS: Do not include any watermarks, logos, text overlaid on image, or signature of any kind.` }
  ];

  if (masterReferenceUrl) {
    const { data: refBase64, mimeType: refMime } = await downloadImageAsBase64(masterReferenceUrl);
    parts.push({ text: "MASTER REFERENCE IMAGE (STRICTLY MATCH THIS MODEL AND LIGHTING):" });
    parts.push({
      inline_data: {
        mime_type: refMime,
        data: refBase64
      }
    });
  }

  for (const { partName, secure_url } of imageUrlResults) {
    const { data: base64Data, mimeType } = await downloadImageAsBase64(secure_url);

    parts.push({ text: `${partName.toUpperCase()} PART:` });
    parts.push({
      inline_data: {
        mime_type: mimeType,
        data: base64Data
      }
    });
  }
const requestPayload = {
  contents: [{ parts }],
  generationConfig: {
    temperature: 0.2, // Lower temperature for maximum literal adherence to prompt
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 8192
  }
  };

  let geminiResponse;

  try {
    geminiResponse = await axios.post(GEMINI_API_URL, requestPayload, {
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY
      },
      timeout: 300000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });

  } catch (error) {
    console.log("\n\n===== GEMINI ERROR =====");
    console.log("STATUS:", error.response?.status);
    console.log("ERROR BODY:", JSON.stringify(error.response?.data, null, 2));
    console.log("========================\n\n");
    throw error;
  }

  const content = geminiResponse.data.candidates[0]?.content?.parts || [];
  let generatedImageData = null;
  let responseText = "";

  for (const part of content) {
    if (part.inlineData || part.inline_data) {
      generatedImageData = part.inlineData || part.inline_data;
    }
    if (part.text) responseText += part.text;
  }

  return { generatedImageData, responseText };
}
// Main handler
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uploadMiddleware = upload.fields([
    { name: 'blouse', maxCount: 1 },
    { name: 'pleats', maxCount: 1 },
    { name: 'pallu', maxCount: 1 },
    { name: 'shoulder', maxCount: 1 },
  ]);
  
  console.log("--> API HANDLER LOADED. FORCE FRONT VIEW ONLY.");

  let cloudinaryResults = {};
  try {
    // Multer
    await new Promise((resolve, reject) => {
      uploadMiddleware(req, res, (err) => {
        if (err) {
          console.error('Multer error:', err);
          return reject(new Error(`File upload error: ${err.message}`));
        }
        resolve();
      });
    });

    const files = req.files || {};
    // env checks
    const missingEnvs = [];
    if (!process.env.CLOUDINARY_CLOUD_NAME) missingEnvs.push('CLOUDINARY_CLOUD_NAME');
    if (!process.env.CLOUDINARY_API_KEY) missingEnvs.push('CLOUDINARY_API_KEY');
    if (!process.env.CLOUDINARY_API_SECRET) missingEnvs.push('CLOUDINARY_API_SECRET');
    if (!process.env.GEMINI_API_KEY) missingEnvs.push('GEMINI_API_KEY');
    if (missingEnvs.length > 0) {
      console.error('Missing environment variables:', missingEnvs);
      return res.status(500).json({ error: 'Server configuration error: Missing environment variables', missing: missingEnvs });
    }



    // FALLBACK TO ORIGINAL 4-PART WORKFLOW
    const requiredParts = ['blouse','pleats','pallu','shoulder'];
    const missingParts = requiredParts.filter(p => !files[p] || files[p].length === 0);
    if (missingParts.length > 0) {
      return res.status(400).json({ error: `Missing saree parts (or mannequin_image): ${missingParts.join(', ')}`, missingParts });
    }

    // Upload each part to Cloudinary and collect secure URLs (small payload)
    // Upload each part to Cloudinary SEQUENTIALLY to avoid timeouts
    const uploadResults = [];
    for (const partName of requiredParts) {
      console.log(`Uploading ${partName} to Cloudinary...`);
      const file = files[partName][0];
      const result = await uploadToCloudinary(file.buffer, partName);
      uploadResults.push({ partName, result });
      cloudinaryResults[partName] = result;
    }

    // Build array of { partName, secure_url } to pass to Gemini
    const imageUrlResults = uploadResults.map(({ partName, result }) => ({
      partName,
      secure_url: result.secure_url
    }));

    // Generate views sequentially to be safe
    // USER REQUEST: Generate ONLY Front View for the 4-part workflow
    const viewTypes = ['front', 'back']; // ['front','back','side','sitting'];
    const generatedViews = {};
    const generatedUrls = {};

    let masterReferenceUrl = null;

    for (const viewType of viewTypes) {
      try {
        const { generatedImageData, responseText } = await generateSareeViewUsingUrls(imageUrlResults, viewType, masterReferenceUrl);

        if (!generatedImageData) {
          console.warn(`No inline image returned for ${viewType}, skipping upload.`);
          continue;
        }

        // Upload generated image (base64) to Cloudinary and get URL
        const base64Data = generatedImageData.data;
        const cloudUrl = await uploadGeneratedImageToCloudinary(base64Data, viewType);

        // Update master reference for subsequent views
        if (viewType === 'front') {
          masterReferenceUrl = cloudUrl;
        }

        generatedViews[viewType] = {
          data: base64Data,
          mimeType: generatedImageData.mime_type || generatedImageData.mimeType || 'image/png',
          responseText: responseText || ''
        };
        generatedUrls[viewType] = cloudUrl;

        // small delay
        await new Promise(r => setTimeout(r, 1000));
      } catch (err) {
        console.error(`Failed to generate ${viewType}:`, err.message || err);
        // continue to next view
      }
    }

    if (Object.keys(generatedViews).length === 0) {
      throw new Error('Failed to generate any saree views');
    }

    const uploadedParts = {};
    Object.entries(cloudinaryResults).forEach(([partName, result]) => {
      uploadedParts[partName] = { url: result.secure_url, publicId: result.public_id };
    });

    res.json({
      success: true,
      generatedViews,
      generatedUrls,
      message: `Generated ${Object.keys(generatedViews).length} saree views successfully!`,
      uploadedParts,
      partsProcessed: requiredParts,
      viewsGenerated: Object.keys(generatedViews)
    });

  } catch (error) {
    console.error('API Error:', error);
    // cleanup cloudinary uploaded parts if any
    if (Object.keys(cloudinaryResults).length > 0) {
      try {
        const cleanupPromises = Object.values(cloudinaryResults).map(r => cloudinary.uploader.destroy(r.public_id));
        await Promise.all(cleanupPromises);
        console.log('Cleaned up Cloudinary uploads');
      } catch (cleanupError) {
        console.error('Failed Cloudinary cleanup:', cleanupError);
      }
    }

    let errorMessage = 'Failed to process saree parts';
    let statusCode = 500;
    if (error.message && error.message.includes('Missing saree parts')) {
      errorMessage = error.message; statusCode = 400;
    } else if (error.message && (error.message.toLowerCase().includes('cloudinary') || error.message.toLowerCase().includes('upload'))) {
      errorMessage = 'Failed to upload images to cloud storage'; statusCode = 503;
    } else if (error.response) {
      statusCode = error.response.status;
      if (statusCode === 400) errorMessage = 'Invalid request to AI service';
      else if (statusCode === 403) errorMessage = 'Access denied to AI model';
      else if (statusCode === 429) errorMessage = 'Rate limit exceeded - please try again later';
      else errorMessage = `AI service error: ${statusCode}`;
    }

    res.status(statusCode).json({
      error: errorMessage,
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      uploadedParts: Object.keys(cloudinaryResults)
    });
  }
}

export const config = {
  api: { bodyParser: false }
};
