import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/Context';
import firebaseService from '../../SERVICES/firebaseService';

export const useProductSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const { updateProductData, currentUser } = useApp();
  const navigate = useNavigate();
  const { resetProductData } = useApp();

  // Check if product is a saree
  const isSareeProduct = (productData) => {
    const dressType = productData?.dressType?.toLowerCase() || '';
    return dressType.includes('saree') || dressType.includes('sari');
  };

  // Clean saree data for Firebase - now simplified since images are already in imageUrls
  const cleanDataForFirebase = (productData) => {
    const cleanedData = { ...productData };
    
    if (isSareeProduct(productData)) {
      console.log("Cleaning saree data for Firebase...");
      
      // Clean saree parts - remove file objects, keep only URLs
      if (cleanedData.sareeParts) {
        const cleanedParts = {};
        Object.entries(cleanedData.sareeParts).forEach(([partName, partData]) => {
          cleanedParts[partName] = {
            url: partData.url || null
          };
        });
        cleanedData.sareeParts = cleanedParts;
      }
      
      // Handle base64 images - remove if still present
      if (cleanedData.generatedSareeImage && cleanedData.generatedSareeImage.startsWith('data:')) {
        console.warn("Base64 image still present - removing to avoid Firebase size limit");
        cleanedData.generatedSareeImage = "BASE64_REMOVED";
      }
      
      console.log("Saree imageUrls being saved:", cleanedData.imageUrls);
    }
    
    return cleanedData;
  };

  const handleSubmit = async (productData) => {
    // Validation
    if (!productData.title || productData.title.trim() === "") {
      setSubmitStatus("error");
      setSubmitMessage("Product title is required");
      setTimeout(() => setSubmitStatus(null), 5000);
      return;
    }
    if (!productData.price || productData.price === "0") {
      setSubmitStatus("error");
      setSubmitMessage("Product price is required");
      setTimeout(() => setSubmitStatus(null), 5000);
      return;
    }
    if (!currentUser) {
      setSubmitStatus("error");
      setSubmitMessage("User not authenticated. Please log in again.");
      setTimeout(() => setSubmitStatus(null), 5000);
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      console.log("=== FIREBASE SAVE DEBUG ===");
      console.log("Submitting product for user:", currentUser.uid);
      console.log("Is saree product:", isSareeProduct(productData));
      console.log("Product imageUrls:", productData.imageUrls);
      
      if (isSareeProduct(productData)) {
        console.log("Saree parts:", productData.sareeParts);
        console.log("Generated saree image:", productData.generatedSareeImage);
        console.log("Number of images:", productData.imageUrls?.length || 0);
        console.log("First image (should be generated):", productData.imageUrls?.[0]);
      }
      
      // Clean the data for Firebase
      const cleanedData = cleanDataForFirebase(productData);
      console.log("Final data being saved:", {
        ...cleanedData,
        imageUrls: cleanedData.imageUrls
      });
      
      const result = await firebaseService.saveProduct(cleanedData, currentUser.uid);
      
      if (result.success) {
        setSubmitStatus("success");
        setSubmitMessage(`Product saved successfully! ID: ${result.productId}`);
        updateProductData({ ...productData, id: result.productId });
        resetProductData(); 

        console.log("Product saved successfully with imageUrls:", cleanedData.imageUrls);
        
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        throw new Error(result.message || "Failed to save product");
      }
    } catch (error) {
      console.error("=== FIREBASE SAVE ERROR ===");
      console.error("Error submitting product:", error);
      console.error("Error message:", error.message);
      
      setSubmitStatus("error");
      setSubmitMessage(error.message || "Failed to save product. Please try again.");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus(null), submitStatus === "success" ? 10000 : 5000);
    }
  };

  return {
    isSubmitting,
    submitStatus,
    submitMessage,
    handleSubmit
  };
};