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

const execPromise = promisify(exec);
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const GEMINI_API_KEY = 'AIzaSyCGGNoinwQJZI66jNp9Y462isJFAp33nN8';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';
const FLUX_LOCAL_URL = 'http://localhost:5003';  // FLUX service
const VITON_LOCAL_URL = process.env.VITON_LOCAL_URL || 'http://localhost:5002';

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

function rgbToHex(r, g, b) {
  const toHex = (n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
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
    ? `\n\nCOLOR LOCK (NON-NEGOTIABLE):\n- Saree body base color must match: ${sareeBodyHex || 'EXACTLY match saree-body reference'}\n- Blouse base color must match: ${blouseBodyHex || 'EXACTLY match blouse-body reference'}\n- DO NOT shift hue/saturation/brightness. Do NOT introduce maroon/red/orange tints if the reference is pink/blue.\n- Borders/pallu can add accents but MUST NOT recolor the main saree body or blouse body.`
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

export default async function handler(req, res) {
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

    const viewTypes = ['front', 'back'];
    const generatedViews = {};
    const generatedUrls = {};
    let frontImageData = null;

    const userFeedback = req.body?.userFeedback || '';
    const masterReferenceUrl = req.body?.masterReferenceUrl || null;

    // Generate front view first (5-step sequential)
    console.log(`\n🎨 Generating front view with sequential process...`);
    
    try {
      frontImageData = await generateSareeView(uploadResults, 'front', masterReferenceUrl, userFeedback);
      
      if (!frontImageData) {
        throw new Error('No front image data generated');
      }

      // Final safety: sanitize before upload and before generating back view.
      frontImageData = await sanitizeCatalogOutput(frontImageData, { stage: 'front-final-upload' });
      
      // Upload front view to Cloudinary
      const frontUrl = await uploadGeneratedImageToCloudinary(
        frontImageData.data, 
        'front-view',
        frontImageData.mime_type || frontImageData.mimeType || 'image/png'
      );
      
      generatedViews.front = frontUrl;
      generatedUrls.front = frontUrl;
      
      console.log(`✅ Front view generated successfully`);
      
    } catch (error) {
      console.error(`Failed to generate front view:`, error.message);
      throw error;
    }

    // Generate back view from front view (1 step, much faster)
    console.log(`\n🎨 Generating back view from front view...`);
    
    try {
      const backImageDataRaw = await generateBackFromFront(frontImageData, userFeedback);
      const backImageData = await sanitizeCatalogOutput(backImageDataRaw, { stage: 'back-final-upload' });
      
      if (!backImageData) {
        throw new Error('No back image data generated');
      }
      
      // Upload back view to Cloudinary
      const backUrl = await uploadGeneratedImageToCloudinary(
        backImageData.data, 
        'back-view',
        backImageData.mime_type || backImageData.mimeType || 'image/png'
      );
      
      generatedViews.back = backUrl;
      generatedUrls.back = backUrl;
      
      console.log(`✅ Back view generated successfully`);
      
    } catch (error) {
      console.error(`Failed to generate back view:`, error.message);
      throw error;
    }

    res.json({
      success: true,
      frontView: generatedViews.front,
      backView: generatedViews.back,
      generatedUrls,
      message: 'Saree views generated successfully with FLUX!',
      model: 'FLUX.1-schnell'
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
