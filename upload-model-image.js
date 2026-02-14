import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
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

async function uploadModelImage() {
  try {
    // Upload front view model
    const frontImagePath = path.join(__dirname, 'public', 'img5.png');
    const frontResult = await cloudinary.uploader.upload(frontImagePath, {
      folder: 'saree-models',
      public_id: 'model-front',
      overwrite: true
    });
    
    console.log('✅ Front model image uploaded!');
    console.log('📎 Front URL:', frontResult.secure_url);
    
    // Upload back view model
    const backImagePath = path.join(__dirname, 'public', 'image.png');
    const backResult = await cloudinary.uploader.upload(backImagePath, {
      folder: 'saree-models',
      public_id: 'model-back',
      overwrite: true
    });
    
    console.log('✅ Back model image uploaded!');
    console.log('📎 Back URL:', backResult.secure_url);
    
    console.log('\n🔧 Update these URLs in api/drape-saree-parts.js:');
    console.log(`const MODEL_FRONT_URL = "${frontResult.secure_url}";`);
    console.log(`const MODEL_BACK_URL = "${backResult.secure_url}";`);
    
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
  }
}

uploadModelImage();
