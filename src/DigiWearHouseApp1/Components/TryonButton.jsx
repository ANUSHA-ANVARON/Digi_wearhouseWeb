import React, { useState } from "react";
import { UPLOAD_CONFIG } from "../constants/productConstants";

export default function TryOnButton({ garmentImage }) {
  const [tryOnImage, setTryOnImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_CONFIG.CLOUDINARY_UPLOAD_PRESET);
    data.append("cloud_name", UPLOAD_CONFIG.CLOUDINARY_CLOUD_NAME);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${UPLOAD_CONFIG.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: data,
      }
    );

    const json = await res.json();

    if (!json.secure_url) {
      throw new Error("Cloudinary upload failed");
    }

    return json.secure_url;
  };

  const handleTryOn = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate that garmentImage is provided
    if (!garmentImage) {
      setErrorMsg("Please select a garment image first");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setTryOnImage(null);

    try {
      const modelImageUrl = await uploadToCloudinary(file);

      console.log("Sending to backend:", {
        modelImage: modelImageUrl,
        garmentImage: garmentImage,
      });

      const response = await fetch("https://sumaya-backend.onrender.com/api/tryon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modelImage: modelImageUrl,
          garmentImage: garmentImage,
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend error:${response.status}`);
      }

      const data = await response.json();

      if (data.output && data.output.length > 0) {
        setTryOnImage(data.output[0]);
      } else {
        setErrorMsg("TryOn failed. Please try another image.");
      }
    } catch (error) {
      console.error("TryOn failed:", error);
      setErrorMsg(error.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <label className="cursor-pointer inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
        {loading ? "Processing..." : "TryOn"}
        <input
          type="file"
          accept="image/*"
          onChange={handleTryOn}
          className="hidden"
          disabled={loading || !garmentImage}
        />
      </label>

      {!garmentImage && (
        <p className="text-yellow-600 text-sm mt-2">
          Please upload product images first to enable try-on
        </p>
      )}

      {errorMsg && <p className="text-red-500 text-sm mt-2">{errorMsg}</p>}

      {tryOnImage && (
        <div className="mt-4">
          <p className="font-semibold mb-2 text-white">TryOn Result:</p>
          <img
            src={tryOnImage}
            alt="TryOn Output"
            className="w-full max-w-sm rounded shadow-lg"
          />
          <button
            onClick={() => setTryOnImage(null)}
            className="mt-2 text-sm text-white underline hover:no-underline"
          >
            Clear Result
          </button>
        </div>
      )}
    </div>
  );
}