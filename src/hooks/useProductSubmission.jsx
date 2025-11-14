// // hooks/useProductSubmission.js
// import { useState, useCallback } from 'react';
// import firebaseService from '../SERVICES/firebaseService';

// export const useProductSubmission = () => {
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null
//   const [submitMessage, setSubmitMessage] = useState('');
//   const [submittedProductId, setSubmittedProductId] = useState(null);

//   // Validate product data before submission
//   const validateProductData = useCallback((productData) => {
//     const errors = [];

//     if (!productData.title || productData.title.trim() === '') {
//       errors.push('Product title is required');
//     }

//     if (!productData.price || productData.price === '0') {
//       errors.push('Product price must be greater than 0');
//     }

//     if (!productData.images || productData.images.length === 0) {
//       errors.push('At least one product image is required');
//     }

//     if (!productData.chooseType || productData.chooseType.trim() === '') {
//       errors.push('Product category is required');
//     }

//     if (!productData.dressType || productData.dressType.trim() === '') {
//       errors.push('Dress type is required');
//     }

//     if (!productData.selectedSizes || productData.selectedSizes.length === 0) {
//       errors.push('At least one size must be selected');
//     }

//     return {
//       isValid: errors.length === 0,
//       errors
//     };
//   }, []);

//   // Submit product to Firebase
//   const submitProduct = useCallback(async (productData, imageFiles = null) => {
//     // Reset status
//     setSubmitStatus(null);
//     setSubmitMessage('');
//     setSubmittedProductId(null);

//     // Validate data first
//     const validation = validateProductData(productData);
//     if (!validation.isValid) {
//       setSubmitStatus('error');
//       setSubmitMessage(validation.errors.join(', '));
//       return {
//         success: false,
//         errors: validation.errors
//       };
//     }

//     setIsSubmitting(true);

//     try {
//       console.log('Submitting product:', productData);
      
//       // Save to Firebase
//       const result = await firebaseService.saveProduct(productData, imageFiles);
      
//       if (result.success) {
//         setSubmitStatus('success');
//         setSubmitMessage(`Product saved successfully! Product ID: ${result.productId}`);
//         setSubmittedProductId(result.productId);
        
//         console.log('Product submission successful:', result);
        
//         return {
//           success: true,
//           productId: result.productId,
//           message: result.message
//         };
//       } else {
//         throw new Error(result.message || 'Unknown error occurred');
//       }

//     } catch (error) {
//       console.error('Product submission failed:', error);
//       setSubmitStatus('error');
//       setSubmitMessage(error.message || 'Failed to save product. Please try again.');
      
//       return {
//         success: false,
//         error: error.message
//       };

//     } finally {
//       setIsSubmitting(false);
//     }
//   }, [validateProductData]);

//   // Update existing product
//   const updateProduct = useCallback(async (productId, productData, imageFiles = null) => {
//     if (!productId) {
//       setSubmitStatus('error');
//       setSubmitMessage('Product ID is required for updates');
//       return { success: false, error: 'Product ID is required' };
//     }

//     // Reset status
//     setSubmitStatus(null);
//     setSubmitMessage('');

//     // Validate data
//     const validation = validateProductData(productData);
//     if (!validation.isValid) {
//       setSubmitStatus('error');
//       setSubmitMessage(validation.errors.join(', '));
//       return {
//         success: false,
//         errors: validation.errors
//       };
//     }

//     setIsSubmitting(true);

//     try {
//       console.log('Updating product:', productId, productData);
      
//       const result = await firebaseService.updateProduct(productId, productData, imageFiles);
      
//       if (result.success) {
//         setSubmitStatus('success');
//         setSubmitMessage(`Product updated successfully!`);
//         setSubmittedProductId(productId);
        
//         return {
//           success: true,
//           productId: productId,
//           message: result.message
//         };
//       } else {
//         throw new Error(result.message || 'Unknown error occurred');
//       }

//     } catch (error) {
//       console.error('Product update failed:', error);
//       setSubmitStatus('error');
//       setSubmitMessage(error.message || 'Failed to update product. Please try again.');
      
//       return {
//         success: false,
//         error: error.message
//       };

//     } finally {
//       setIsSubmitting(false);
//     }
//   }, [validateProductData]);

//   // Clear status messages
//   const clearStatus = useCallback(() => {
//     setSubmitStatus(null);
//     setSubmitMessage('');
//   }, []);

//   // Auto-clear status after timeout
//   const setStatusWithTimeout = useCallback((status, message, timeout = 5000) => {
//     setSubmitStatus(status);
//     setSubmitMessage(message);
    
//     setTimeout(() => {
//       setSubmitStatus(null);
//       setSubmitMessage('');
//     }, timeout);
//   }, []);

//   return {
//     // State
//     isSubmitting,
//     submitStatus,
//     submitMessage,
//     submittedProductId,
    
//     // Actions
//     submitProduct,
//     updateProduct,
//     validateProductData,
//     clearStatus,
//     setStatusWithTimeout
//   };
// };