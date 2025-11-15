// // services/firebaseService.js
// import { 
//   collection, 
//   addDoc, 
//   getDocs, 
//   doc, 
//   updateDoc, 
//   deleteDoc, 
//   query, 
//   orderBy,
//   serverTimestamp,
//   getDoc 
// } from 'firebase/firestore';
// import { 
//   ref, 
//   uploadBytes, 
//   getDownloadURL, 
//   deleteObject 
// } from 'firebase/storage';
// import { db, storage } from '../../firebaseConfig';

// class FirebaseService {
//   // Upload multiple images to Firebase Storage
//   async uploadImages(imageFiles) {
//     try {
//       const uploadPromises = imageFiles.map(async (file, index) => {
//         const fileName = `${Date.now()}_${index}_${file.name}`;
//         const storageRef = ref(storage, `product_images/${fileName}`);
        
//         const snapshot = await uploadBytes(storageRef, file);
//         const downloadURL = await getDownloadURL(snapshot.ref);
        
//         return downloadURL;
//       });

//       const downloadURLs = await Promise.all(uploadPromises);
//       return downloadURLs;
//     } catch (error) {
//       console.error('Error uploading images:', error);
//       throw new Error(`Failed to upload images: ${error.message}`);
//     }
//   }

//   // Convert form data to Firebase format
//   formatProductData(formData, imageUrls = [], userId) {
//     return {
//       // Basic product info
//       title: formData.title || '',
//       description: formData.description || '',
//       category: formData.chooseType || '',
//       productType: formData.productType || 'Ready to Wear',
//       dressType: formData.dressType || '',
//       material: formData.materialType || '',
//       design: formData.designType || '',
      
//       // Pricing and inventory
//       price: formData.price || '0',
//       selectedSizes: formData.selectedSizes || [],
//       selectedColors: formData.selectedColors || [],
//       units: formData.units || {},
      
//       // Images and metadata
//       imageUrls: imageUrls.length > 0 ? imageUrls : formData.images || [],
//       timestamp: serverTimestamp(),
//       userId: userId, // Store the user ID
      
//       // Status and visibility
//       status: 'active',
//       isPublished: false,
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString()
//     };
//   }

//   // Save product to user's subcollection with enhanced debugging
//   async saveProduct(productData, userId) {
//     try {
//       const productRef = await addDoc(collection(db, 'users', userId, 'products'), {
//         title: productData.title || 'Untitled Product',
//         name: productData.title || 'Untitled Product', // Alias for B2C
//         description: productData.description || '',
//         category: productData.category?.toUpperCase() || '', // e.g., WOMEN
//         productType: productData.productType || '',
//         dressType: productData.dressType || '',
//         fabric: productData.fabric || '',
//         craft: productData.craft || '',
//         price: parseFloat(productData.price) || 0,
//         selectedSizes: productData.selectedSizes || [],
//         selectedColors: productData.selectedColors || [],
//         units: productData.units || {}, // { [color]: { [size]: quantity } }
//         imageUrls: productData.imageUrls || [],
//         userId,
//         timestamp: serverTimestamp(),
//         createdAt: new Date().toISOString(),
//       });
//       console.log(`Product saved: ${productRef.id}`);
//       return { success: true, productId: productRef.id };
//     } catch (error) {
//       console.error('Error saving product:', error);
//       return { success: false, message: error.message };
//     }
//   }

//   // Test Firestore connection and permissions
//   async testFirestoreConnection(userId) {
//     try {
//       console.log('🧪 Testing Firestore connection and permissions...');
      
//       if (!userId) {
//         console.error('❌ No userId provided for test');
//         return { success: false, error: 'No userId provided' };
//       }
      
//       // Test 1: Simple write to root collection
//       console.log('Test 1: Writing to root test collection...');
//       const testData1 = {
//         test: 'root test',
//         timestamp: new Date().toISOString(),
//         userId: userId
//       };
      
//       const rootTestRef = await addDoc(collection(db, 'test'), testData1);
//       console.log('✅ Root test successful, ID:', rootTestRef.id);
      
//       // Test 2: Write to user subcollection
//       console.log('Test 2: Writing to user subcollection...');
//       const testData2 = {
//         test: 'user subcollection test',
//         timestamp: new Date().toISOString(),
//         userId: userId
//       };
      
//       const userTestRef = await addDoc(collection(db, 'users', userId, 'test'), testData2);
//       console.log('✅ User subcollection test successful, ID:', userTestRef.id);
//       console.log('   Path: users/' + userId + '/test/' + userTestRef.id);
      
//       // Test 3: Read back the data
//       console.log('Test 3: Reading back user subcollection data...');
//       const readDoc = await getDoc(userTestRef);
//       if (readDoc.exists()) {
//         console.log('✅ Read test successful:', readDoc.data());
//       } else {
//         console.error('❌ Read test failed - document not found');
//       }
      
//       return { 
//         success: true, 
//         message: 'All Firestore tests passed!',
//         rootTestId: rootTestRef.id,
//         userTestId: userTestRef.id
//       };
      
//     } catch (error) {
//       console.error('💥 Firestore test failed:', error);
//       return { 
//         success: false, 
//         error: error.message,
//         code: error.code 
//       };
//     }
//   }


  

// async updateProduct(userId, productId, productData) {
//     try {
//       const productRef = doc(db, 'users', userId, 'products', productId);
//       await updateDoc(productRef, {
//         title: productData.title || 'Untitled Product',
//         name: productData.title || 'Untitled Product',
//         description: productData.description || '',
//         category: productData.category?.toUpperCase() || '',
//         productType: productData.productType || '',
//         dressType: productData.dressType || '',
//         fabric: productData.fabric || '',
//         craft: productData.craft || '',
//         price: parseFloat(productData.price) || 0,
//         selectedSizes: productData.selectedSizes || [],
//         selectedColors: productData.selectedColors || [],
//         units: productData.units || {},
//         imageUrls: productData.imageUrls || [],
//       });
//       console.log(`Product updated: ${productId}`);
//       return { success: true };
//     } catch (error) {
//       console.error('Error updating product:', error);
//       return { success: false, message: error.message };
//     }
//   }

//   // Get all products for a specific user
//  async getUserProducts(userId) {
//     try {
//       const q = collection(db, 'users', userId, 'products');
//       const querySnapshot = await getDocs(q);
//       return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//     } catch (error) {
//       console.error('Error fetching user products:', error);
//       throw error;
//     }
//   }

//   // Get single product by ID from user's subcollection
//   async getUserProduct(userId, productId) {
//     try {
//       if (!userId || !productId) {
//         throw new Error('User ID and Product ID are required');
//       }

//       const docRef = doc(db, "users", userId, "products", productId);
//       const docSnap = await getDoc(docRef);
      
//       if (docSnap.exists()) {
//         return {
//           id: docSnap.id,
//           ...docSnap.data()
//         };
//       } else {
//         throw new Error('Product not found');
//       }
//     } catch (error) {
//       console.error('Error fetching product:', error);
//       throw new Error(`Failed to fetch product: ${error.message}`);
//     }
//   }

//   // Delete product from user's subcollection
//  async deleteProduct(userId, productId) {
//     try {
//       const productRef = doc(db, 'users', userId, 'products', productId);
//       await deleteDoc(productRef);
//       console.log(`Product deleted: ${productId}`);
//       return { success: true };
//     } catch (error) {
//       console.error('Error deleting product:', error);
//       return { success: false, message: error.message };
//     }
//   }

//   // Toggle product status in user's subcollection
//   async testFirestoreConnection(userId) {
//     try {
//       const testDocRef = doc(db, 'users', userId, 'test', 'connectionTest');
//       await setDoc(testDocRef, { test: true, timestamp: serverTimestamp() });
//       return { success: true, message: 'Firestore connection successful' };
//     } catch (error) {
//       console.error('Firestore connection test failed:', error);
//       return { success: false, error: error.message };
//     }
//   }

//   // Legacy methods for backward compatibility (now deprecated)
//   async getAllProducts() {
//     console.warn('getAllProducts is deprecated. Use getUserProducts(userId) instead.');
//     return [];
//   }

//   async getProductById(productId) {
//     console.warn('getProductById is deprecated. Use getUserProduct(userId, productId) instead.');
//     throw new Error('Please provide userId and use getUserProduct instead');
//   }

//   async deleteProduct(productId) {
//     console.warn('deleteProduct is deprecated. Use deleteUserProduct(userId, productId) instead.');
//     throw new Error('Please provide userId and use deleteUserProduct instead');
//   }

//   async toggleProductStatus(productId, isPublished) {
//     console.warn('toggleProductStatus is deprecated. Use toggleUserProductStatus(userId, productId, isPublished) instead.');
//     throw new Error('Please provide userId and use toggleUserProductStatus instead');
//   }
// }

// // Create and export a singleton instance
// const firebaseService = new FirebaseService();
// export default firebaseService; 

// services/firebaseService.js
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
      .replace(/[\s\W-]+/g, '-') // Replace spaces and non-word chars with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
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
        fabric: productData.fabric || '',
        craft: productData.craft || '',
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
          occasion: Array.isArray(productData.occasion) ? productData.occasion : [],
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
      });
      console.log(`Product saved: ${productRef.id}`);
      return { success: true, productId: productRef.id };
    } catch (error) {
      console.error('Error saving product:', error);
      return { success: false, message: error.message };
    }
  }

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