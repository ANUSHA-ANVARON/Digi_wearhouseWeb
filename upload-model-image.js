import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadModelImage() {
  try {
    // Upload the model image from public folder
    const result = await cloudinary.uploader.upload('./public/img5.png', {
      folder: 'saree-models',
      public_id: 'default-model',
      overwrite: true
    });
    
    console.log('✅ Model image uploaded successfully!');
    console.log('📎 URL:', result.secure_url);
    console.log('\n🔧 Update this URL in api/drape-saree-parts.js:');
    console.log(`const MODEL_IMAGE_URL = "${result.secure_url}";`);
    
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
  }
}

uploadModelImage();
