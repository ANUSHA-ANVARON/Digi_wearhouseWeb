// utils/cloudinary.js
import { UPLOAD_CONFIG } from '../constants/productConstants';
import { compressImage } from './imageCompression';

export const validateFile = (file) => {
  if (!file) {
    throw new Error("No file provided");
  }

  if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
    throw new Error("File size must be less than 10MB");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }
};

export const uploadToCloudinary = async (file) => {
  // Auto-compress if exceeds limit
  let fileToUpload = file;
  if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
    try {
      fileToUpload = await compressImage(file, 10);
    } catch (err) {
      console.error("Compression failed, attempting original upload:", err);
    }
  }

  validateFile(fileToUpload);

  console.log("Starting upload for file:", file.name, "Size:", file.size, "bytes");

  const data = new FormData();
  data.append("file", fileToUpload);
  data.append("upload_preset", UPLOAD_CONFIG.CLOUDINARY_UPLOAD_PRESET);
  data.append("cloud_name", UPLOAD_CONFIG.CLOUDINARY_CLOUD_NAME);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${UPLOAD_CONFIG.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: data,
      }
    );

    const json = await res.json();
    console.log("Cloudinary response:", json);

    if (!res.ok) {
      throw new Error(`Cloudinary API error: ${json.error?.message || "Unknown error"}`);
    }

    if (!json.secure_url) {
      throw new Error("No secure URL returned from Cloudinary");
    }

    console.log("Upload successful:", json.secure_url);
    return json.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};

export const uploadMultipleFiles = async (files) => {
  const uploadedUrls = [];
  
  for (const file of files) {
    const url = await uploadToCloudinary(file);
    uploadedUrls.push(url);
  }
  
  return uploadedUrls;
};