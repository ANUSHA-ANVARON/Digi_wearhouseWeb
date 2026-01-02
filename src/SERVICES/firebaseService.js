// services/firebaseService.js - UPDATED WITH BULK UPLOAD
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, storage } from '../../firebaseConfig';


class FirebaseService {

  slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-') 
      .replace(/^-+|-+$/g, ''); 
  }

  // Upload multiple images to Firebase Storage
  async uploadImages(imageFiles) {
    try {
      const uploadPromises = imageFiles.map(async (file, index) => {
        const fileName = `${Date.now()}_${index}_${file.name}`;
        const storageRef = ref(storage, `product_images/${fileName}`);

        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        return downloadURL;
      });

      const downloadURLs = await Promise.all(uploadPromises);
      return downloadURLs;
    } catch (error) {
      console.error('Error uploading images:', error);
      if (error.code === 'storage/unauthorized') {
        throw new Error('Unauthorized access to Firebase Storage. Check your security rules.');
      } else if (error.code === 'storage/quota-exceeded') {
        throw new Error('Storage quota exceeded. Please upgrade your Firebase plan.');
      } else {
        throw new Error(`Failed to upload images: ${error.message}`);
      }
    }
  }

  // Convert form data to Firebase format
  formatProductData(formData, imageUrls = [], userId) {
    if (!formData.title) {
      console.warn('Title is missing, using default value');
    }
    if (!userId) {
      throw new Error('userId is required');
    }
    return {
      title: formData.title || 'Untitled Product',
      description: formData.description || '',
      category: formData.chooseType || '',
      productType: formData.productType || 'Ready to Wear',
      dressType: formData.dressType || '',
      subDressType: formData.dressSubCategory || '',
      material: formData.materialType || '',
      design: formData.designType || '',
      price: parseFloat(formData.price) || 0,
      selectedSizes: Array.isArray(formData.selectedSizes) ? formData.selectedSizes : [],
      selectedColors: Array.isArray(formData.selectedColors) ? formData.selectedColors : [],
      units: formData.units || {},
      imageUrls: imageUrls.length > 0 ? imageUrls : (Array.isArray(formData.images) ? formData.images : []),
      timestamp: serverTimestamp(),
      userId: userId,

      slug: formData.slug || this.slugify(formData.title || 'untitled-product'),
      availability: {
        isPublished: false,
        publishedAt: null,
        channels: [{ id: 'web', enabled: false }],
      },
      seo: {
        title: formData.title || 'Untitled Product',
        metaDescription: (formData.description || '').slice(0, 160),
        keywords: Array.isArray(formData.keywords) ? formData.keywords : [],
        canonicalUrl: '',
      },
      attributes: {
        gender: formData.gender || '',
        occasion: Array.isArray(formData.occasion) ? formData.occasion : [],
        pattern: formData.pattern || '',
        work: formData.work || '',
        weave: formData.weave || '',
        material: formData.materialType || formData.material || '',
      },

      // Status and visibility
      metrics: {
        ratingAvg: 0,
        ratingCount: 0,
        soldCount: 0,
        wishlistCount: 0,
      },
      audit: {
        createdBy: userId || 'unknown',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      status: 'active',
      isPublished: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
  }

  // Save product to user's subcollection
  async saveProduct(productData, userId) {
    if (!userId) {
      throw new Error('userId is required');
    }
    if (!productData.title) {
      console.warn('Product title is missing, using default');
      productData.title = 'Untitled Product';
    }
    try {
      const productRef = await addDoc(collection(db, 'users', userId, 'products'), {

        title: productData.title || 'Untitled Product',
        name: productData.title || 'Untitled Product',
        description: productData.description || '',
        category: productData.category?.toUpperCase() || '',
        productType: productData.productType || '',
        dressType: productData.dressType || '',
        subDressType: productData.dressSubCategory || '',
        fabric: productData.fabric || '',
        craft: productData.craft || '',
        boutique: !!(productData.boutique || productData.premium || productData.shopName), 
        shopName: productData.shopName || '',
        note: productData.note || '',
        care: productData.clean || productData.care || '', 
        clean: productData.clean || '',
        components: productData.components || '',
        vendorReviews: Array.isArray(productData.vendorReviews) ? productData.vendorReviews : [],
        linkedBlouseType: productData.linkedBlouseType || '',
        isVirtualTryOnEnabled: !!productData.isVirtualTryOnEnabled,
        price: parseFloat(productData.price) || 0,
        selectedSizes: Array.isArray(productData.selectedSizes) ? productData.selectedSizes : [],
        selectedColors: Array.isArray(productData.selectedColors) ? productData.selectedColors : [],
        units: productData.units || {},
        imageUrls: Array.isArray(productData.imageUrls) ? productData.imageUrls : [],
        userId,
        timestamp: serverTimestamp(),
        slug: productData.slug || this.slugify(productData.title || 'untitled-product'),
        status: productData.status || 'active',
        isPublished: !!productData.isPublished,
        availability: productData.availability || {
          isPublished: false,
          publishedAt: null,
          channels: [{ id: 'web', enabled: false }],
        },
        seo: productData.seo || {
          title: productData.title || 'Untitled Product',
          metaDescription: (productData.description || '').slice(0, 160),
          keywords: Array.isArray(productData.keywords) ? productData.keywords : [],
          canonicalUrl: '',
        },
        attributes: productData.attributes || {
          gender: productData.gender || '',
          occasion: productData.occasion ? [productData.occasion] : (Array.isArray(productData.occasion) ? productData.occasion : []),
          pattern: productData.pattern || '',
          work: productData.work || '',
          weave: productData.weave || '',
          material: productData.material || '',
        },
        metrics: productData.metrics || {
          ratingAvg: 0,
          ratingCount: 0,
          soldCount: 0,
          wishlistCount: 0,
        },
        audit: {
          createdBy: userId || 'unknown',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`Product saved: ${productRef.id}`);
      return { success: true, productId: productRef.id };
    } catch (error) {
      console.error('Error saving product:', error);
      return { success: false, message: error.message };
    }
  }

  // ================================
  // NEW: BULK UPLOAD METHODS
  // ================================

  /**
   * Save a single product from bulk upload to bulkOrders collection
   * Path: users/{userId}/bulkOrders/{productId}
   */
  async saveBulkProduct(productData, userId) {
    if (!userId) {
      throw new Error('userId is required');
    }
    if (!productData.title) {
      throw new Error('Product title is required');
    }

    try {
      // Save to users/{userId}/bulkOrders collection
      const productRef = await addDoc(collection(db, 'users', userId, 'bulkOrders'), {
        // Core fields
        title: productData.title,
        name: productData.title,
        description: productData.description || '',
        category: productData.category?.toUpperCase() || 'WOMEN',
        productType: productData.productType || 'Ready to Wear',
        dressType: productData.dressType || '',
        subDressType: productData.subDressType || '',
        fabric: productData.fabric || '',
        craft: productData.craft || '',
        boutique: !!(productData.boutique || productData.premium || productData.shopName), 
        shopName: productData.shopName || '',
        note: productData.note || '',
        care: productData.clean || productData.care || '',
        clean: productData.clean || '',
        components: productData.components || '',
        vendorReviews: Array.isArray(productData.vendorReviews) ? productData.vendorReviews : [],
        linkedBlouseType: productData.linkedBlouseType || '',
        isVirtualTryOnEnabled: !!productData.isVirtualTryOnEnabled,
        
        // Pricing and inventory
        price: parseFloat(productData.price) || 0,
        selectedSizes: Array.isArray(productData.selectedSizes) ? productData.selectedSizes : [],
        selectedColors: Array.isArray(productData.selectedColors) ? productData.selectedColors : [],
        units: productData.units || {},
        
        // Images
        imageUrls: Array.isArray(productData.imageUrls) ? productData.imageUrls : [],
        
        // Metadata
        userId,
        slug: productData.slug || this.slugify(productData.title),
        status: productData.status || 'active',
        isPublished: !!productData.isPublished,
        
        // Availability
        availability: {
          isPublished: false,
          publishedAt: null,
          channels: [{ id: 'web', enabled: false }],
        },
        
        // SEO
        seo: {
          title: productData.title,
          metaDescription: (productData.description || '').slice(0, 160),
          keywords: Array.isArray(productData.seo?.keywords) ? productData.seo.keywords : [],
          canonicalUrl: '',
        },
        
        // Attributes
        attributes: {
          gender: productData.attributes?.gender || '',
          occasion: productData.occasion ? [productData.occasion] : (Array.isArray(productData.attributes?.occasion) ? productData.attributes.occasion : []),
          pattern: productData.attributes?.pattern || '',
          work: productData.attributes?.work || '',
          weave: productData.attributes?.weave || '',
          material: productData.fabric || productData.attributes?.material || '',
        },
        
        // Metrics
        metrics: {
          ratingAvg: 0,
          ratingCount: 0,
          soldCount: 0,
          wishlistCount: 0,
        },
        
        // Audit
        audit: {
          createdBy: userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        
        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log(`Bulk product saved to bulkOrders: ${productRef.id}`);
      return { success: true, productId: productRef.id };
    } catch (error) {
      console.error('Error saving bulk product:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Save multiple products from bulk upload
   * Returns array of results with success/failure status
   */
  async saveBulkProducts(productsArray, userId) {
    if (!userId) {
      throw new Error('userId is required');
    }
    if (!Array.isArray(productsArray) || productsArray.length === 0) {
      throw new Error('productsArray must be a non-empty array');
    }

    const results = [];

    for (let i = 0; i < productsArray.length; i++) {
      const product = productsArray[i];
      
      try {
        const result = await this.saveBulkProduct(product, userId);
        
        results.push({
          index: i,
          rowNumber: product.rowNumber || i + 1,
          title: product.title,
          status: 'success',
          productId: result.productId,
          message: 'Product uploaded successfully'
        });
      } catch (error) {
        results.push({
          index: i,
          rowNumber: product.rowNumber || i + 1,
          title: product.title || 'Untitled',
          status: 'error',
          productId: null,
          message: error.message
        });
      }
    }

    return results;
  }

  /**
   * Get all bulk order products for a specific user
   * Path: users/{userId}/bulkOrders
   */
  async getUserBulkOrders(userId) {
    try {
      const q = query(
        collection(db, 'users', userId, 'bulkOrders'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
    } catch (error) {
      console.error('Error fetching bulk orders:', error);
      throw error;
    }
  }

  /**
   * Get single bulk order product
   * Path: users/{userId}/bulkOrders/{productId}
   */
  async getBulkOrderProduct(userId, productId) {
    try {
      if (!userId || !productId) {
        throw new Error('User ID and Product ID are required');
      }

      const docRef = doc(db, 'users', userId, 'bulkOrders', productId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        };
      } else {
        throw new Error('Bulk order product not found');
      }
    } catch (error) {
      console.error('Error fetching bulk order product:', error);
      throw new Error(`Failed to fetch bulk order product: ${error.message}`);
    }
  }

  /**
   * Move bulk order product to main products collection
   */
  async moveBulkToProducts(userId, bulkOrderId) {
    try {
      // Get bulk order product
      const bulkOrderRef = doc(db, 'users', userId, 'bulkOrders', bulkOrderId);
      const bulkOrderSnap = await getDoc(bulkOrderRef);

      if (!bulkOrderSnap.exists()) {
        throw new Error('Bulk order product not found');
      }

      const productData = bulkOrderSnap.data();

      // Save to products collection
      const result = await this.saveProduct(productData, userId);

      if (result.success) {
        // Delete from bulk orders
        await deleteDoc(bulkOrderRef);
        return { success: true, productId: result.productId };
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error moving bulk to products:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Delete bulk order product
   */
  async deleteBulkOrder(userId, bulkOrderId) {
    try {
      const bulkOrderRef = doc(db, 'users', userId, 'bulkOrders', bulkOrderId);
      await deleteDoc(bulkOrderRef);
      console.log(`Bulk order deleted: ${bulkOrderId}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting bulk order:', error);
      return { success: false, message: error.message };
    }
  }

  // ================================
  // EXISTING METHODS (UNCHANGED)
  // ================================

  // Toggle product status in user's subcollection
  async toggleUserProductStatus(userId, productId, isPublished) {
    try {
      const productRef = doc(db, 'users', userId, 'products', productId);
      await updateDoc(productRef, {
        isPublished,
        'availability.isPublished': isPublished,
        'availability.publishedAt': isPublished ? serverTimestamp() : null,
        'availability.channels': [{ id: 'web', enabled: isPublished }],
        'audit.updatedAt': serverTimestamp(),
      });
      console.log(`Product status toggled: ${productId}, isPublished: ${isPublished}`);
      return { success: true };
    } catch (error) {
      console.error('Error toggling product status:', error);
      return { success: false, message: error.message };
    }
  }

  // Get all products for a specific user
  async getUserProducts(userId) {
    try {
      const q = collection(db, 'users', userId, 'products');
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching user products:', error);
      throw error;
    }
  }

  // Get single product by ID from user's subcollection
  async getUserProduct(userId, productId) {
    try {
      if (!userId || !productId) {
        throw new Error('User ID and Product ID are required');
      }

      const docRef = doc(db, 'users', userId, 'products', productId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        };
      } else {
        throw new Error('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
  }

  // Delete product from user's subcollection
  async deleteProduct(userId, productId) {
    try {
      const productRef = doc(db, 'users', userId, 'products', productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        throw new Error('Product not found');
      }

      const productData = productSnap.data();
      if (productData.imageUrls && Array.isArray(productData.imageUrls)) {
        const deletePromises = productData.imageUrls.map(async (url) => {
          const imageRef = ref(storage, url);
          try {
            await deleteObject(imageRef);
            console.log(`Deleted image: ${url}`);
          } catch (error) {
            console.warn(`Failed to delete image ${url}: ${error.message}`);
          }
        });
        await Promise.all(deletePromises);
      }

      await deleteDoc(productRef);
      console.log(`Product deleted: ${productId}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { success: false, message: error.message };
    }
  }
}

// Create and export a singleton instance
const firebaseService = new FirebaseService();
export default firebaseService;