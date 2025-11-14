// Context.js
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "../../../firebaseConfig";
import ProductModel from "../../ConstantData/ProductModel";
import { useNavigate, useLocation } from "react-router-dom";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const defaultProductData = ProductModel;
  const [productData, setProductData] = useState(defaultProductData);

  const updateProductData = (data) => {
    setProductData((prev) => ({ ...prev, ...data }));
  };

  const resetProductData = () => setProductData(defaultProductData);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
   
      try {
        // Define public routes
        const publicRoutes = [
          "/",
          "/who-we-are",
          "/privacy-policy",
          "/contact-us",
          "/login",
          "/register",
        ];
        const isPublicRoute = publicRoutes.includes(location.pathname);

        if (user) {
          setCurrentUser(user);
          const userRef = doc(db, "vendor_registrations", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setUserData(data);
            if (!data.registrationCompleted && !isPublicRoute) {
              console.log("Registration incomplete, redirecting to /register");
              sessionStorage.setItem(
                "registerNotice",
                "Please complete your vendor registration to continue."
              );
              navigate("/register");
            } else {
              console.log("User authenticated, registration completed:", data);
            }
          } else if (!isPublicRoute) {
            console.log("No user profile, redirecting to /register");
            setUserData(null);
            sessionStorage.setItem(
              "registerNotice",
              "Please complete your vendor registration to continue."
            );
            navigate("/register");
          }
        } else if (!isPublicRoute) {
          console.log("No user logged in, redirecting to /login");
          setCurrentUser(null);
          setUserData(null);
          navigate("/login");
        } else {
          console.log("No user logged in, on public route:", location.pathname);
          setCurrentUser(null);
          setUserData(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [navigate, location.pathname]);

  const clearError = () => setError(null);

  const checkUserExists = async (identifier) => {
    try {
      const userQuery = query(
        collection(db, "vendor_registrations"),
        where("email", "==", identifier)
      );
      let querySnapshot = await getDocs(userQuery);

      if (!querySnapshot.empty) {
        return { exists: true, method: "email" };
      }

      const phoneQuery = query(
        collection(db, "vendor_registrations"),
        where("contactNumber", "==", identifier)
      );
      querySnapshot = await getDocs(phoneQuery);

      if (!querySnapshot.empty) {
        return { exists: true, method: "phone" };
      }

      return { exists: false };
    } catch (error) {
      console.error("Error checking user existence:", error);
      throw new Error("Failed to check user existence");
    }
  };

  const registerUser = async (email, password, userData) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: userData.firstName,
      });

      const userDocData = {
        uid: user.uid,
        email: user.email,
        username: userData.username,
        firstName: userData.firstName,
        contactNumber: userData.contactNumber,
        shopDetails: userData.shopDetails || {},
        bankDetails: userData.bankDetails || {},
        kycDocuments: userData.kycDocuments || {},
        createdAt: new Date().toISOString(),
        emailVerified: user.emailVerified,
        phoneVerified: userData.phoneVerified || false,
        registrationCompleted: userData.registrationCompleted || false,
        isActive: true,
      };

      await setDoc(doc(db, "vendor_registrations", user.uid), userDocData);
      setUserData(userDocData);

      if (userData.contactNumber) {
        const normalizedPhone = userData.contactNumber.replace(/\D/g, "");
        await setDoc(doc(db, "phones", normalizedPhone), { uid: user.uid });
      }

      console.log("User registered successfully:", userDocData);
      return { success: true, user };
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = "Registration failed";

      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "Email is already registered";
          break;
        case "auth/weak-password":
          errorMessage = "Password should be at least 6 characters";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
        default:
          errorMessage = error.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const loginUser = async (email, password) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "vendor_registrations", user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }

      return { success: true, user };
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Login failed";

      switch (error.code) {
        case "auth/user-not-found":
        case "auth/invalid-credential":
          errorMessage = "Invalid email or password";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        default:
          errorMessage = error.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const uploadKycFile = async (file, userId, fileName) => {
    if (!file) throw new Error(`No ${fileName} file selected`);

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`${fileName} must be a PNG or JPEG image`);
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error(`${fileName} must be less than 5MB`);
    }

    const storageRef = ref(storage, `kyc/${userId}/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        null,
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      console.log("Signed out, navigating to /");
      navigate("/");
      setCurrentUser(null);
      setUserData(null);
      setConfirmationResult(null);
      setRecaptchaVerifier(null);
    } catch (error) {
      console.error("Sign out error:", error);
      throw new Error("Failed to sign out");
    }
  };

  const clearConfirmationResult = () => {
    setConfirmationResult(null);
  };

  const initializeRecaptcha = () => {
    try {
      const container = document.getElementById("recaptcha-container");
      if (!container) {
        throw new Error("reCAPTCHA container not found");
      }

      if (!recaptchaVerifier) {
        const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: (response) => {
            console.log("reCAPTCHA solved");
          },
          "expired-callback": () => {
            console.log("reCAPTCHA expired");
            setError("reCAPTCHA expired. Please try again.");
          },
        });
        setRecaptchaVerifier(verifier);
        return verifier;
      }
      return recaptchaVerifier;
    } catch (error) {
      console.error("Error initializing reCAPTCHA:", error);
      setError("Failed to initialize verification. Please try again.");
      throw error;
    }
  };

  const sendOtp = async (phoneNumber) => {
    try {
      setError(null);

      let formattedPhone = phoneNumber.replace(/\D/g, "");
      if (formattedPhone.length === 10) {
        formattedPhone = `+91${formattedPhone}`;
      }

      console.log("Sending OTP to:", formattedPhone);

      await new Promise((resolve) => setTimeout(resolve, 200));

      const verifier = initializeRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      setConfirmationResult(confirmation);

      return { success: true };
    } catch (error) {
      console.error("Error sending OTP:", error);
      setError(error.message);
      throw error;
    }
  };

  const verifyOtp = async (otp) => {
    try {
      if (!confirmationResult) {
        throw new Error("No confirmation result found");
      }

      const result = await confirmationResult.confirm(otp);
      return { success: true, user: result.user };
    } catch (error) {
      console.error("Error verifying OTP:", error);
      throw error;
    }
  };

  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      sessionStorage.setItem(
        "registerPrefill",
        JSON.stringify({
          email: user.email || "",
          firstName: user.displayName?.split(" ")[0] || "",
          photoURL: user.photoURL || "",
        })
      );

      console.log("Google sign-in successful, navigating to /register");
      navigate("/register");
      return { success: true, user };
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      setError(error.message || "Google sign-in failed");
      throw error;
    }
  };

  const getVendorProfileByUid = async (uid) => {
    try {
      if (!uid) return null;
      const ref = doc(db, "vendor_registrations", uid);
      const snap = await getDoc(ref);
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (err) {
      console.error("getVendorProfileByUid error:", err);
      return null;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        userData,
        loading,
        error,
        setError,
        clearError,
        googleSignIn,
        registerUser,
        loginUser,
        checkUserExists,
        signOut,
        sendOtp,
        verifyOtp,
        initializeRecaptcha,
        confirmationResult,
        clearConfirmationResult,
        getVendorProfileByUid,
        uploadKycFile,
        productData,
        updateProductData,
        resetProductData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);



// import React from "react";
// import { createContext, useContext, useState, useEffect } from "react";
// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signOut as firebaseSignOut,
//   onAuthStateChanged,
//   updateProfile,
//   RecaptchaVerifier,
//   signInWithPhoneNumber,
//   GoogleAuthProvider,
//   signInWithPopup,
// } from "firebase/auth";
// import {
//   doc,
//   getDoc,
//   setDoc,
//   collection,
//   query,
//   where,
//   getDocs,
// } from "firebase/firestore";
// import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// import { db, storage, auth } from "../../../firebaseConfig";
// import ProductModel from "../../ConstantData/ProductModel";
// import { useNavigate } from "react-router-dom";

// const AppContext = createContext();

// export const AppProvider = ({ children }) => {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [userData, setUserData] = useState(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);
//   const [confirmationResult, setConfirmationResult] = useState(null);
//   const navigate = useNavigate();

//   const defaultProductData = ProductModel;
//   const [productData, setProductData] = useState(defaultProductData);

//   const updateProductData = (data) => {
//     setProductData((prev) => ({ ...prev, ...data }));
//   };

//   const resetProductData = () => setProductData(defaultProductData);

//   // Auth state listener
//  useEffect(() => {
//   const unsubscribe = onAuthStateChanged(auth, async (user) => {
//     try {
//       const publicRoutes = [
//           "/",
//           "/who-we-are",
//           "/privacy-policy",
//           "/contact-us",
//           "/login",
//           "/register",
//         ];
//         const isPublicRoute = publicRoutes.includes(location.pathname);

//       if (user) {
//         setCurrentUser(user);
//         const userRef = doc(db, "vendor_registrations", user.uid);
//         const userSnap = await getDoc(userRef);

//         if (userSnap.exists()) {
//           const data = userSnap.data();
//           setUserData(data);
//           if (!data.registrationCompleted && !isPublicRoute) {
//             sessionStorage.setItem(
//               "registerNotice",
//               "Please complete your vendor registration to continue."
//             );
//             navigate("/register");
//           }
//         } else {
//           setUserData(null);
//           sessionStorage.setItem(
//             "registerNotice",
//             "Please complete your vendor registration to continue."
//           );
//           navigate("/register");
//         }
//       } else {
//         setCurrentUser(null);
//         setUserData(null);
//         navigate("/");
//       }
//     } catch (error) {
//       console.error("Auth state change error:", error);
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   });

//   return unsubscribe;
// }, [navigate]);

//   const clearError = () => setError(null);

//   const checkUserExists = async (identifier) => {
//     try {
//       const userQuery = query(
//         collection(db, "vendor_registrations"),
//         where("email", "==", identifier)
//       );
//       let querySnapshot = await getDocs(userQuery);

//       if (!querySnapshot.empty) {
//         return { exists: true, method: "email" };
//       }

//       const phoneQuery = query(
//         collection(db, "vendor_registrations"),
//         where("contactNumber", "==", identifier)
//       );
//       querySnapshot = await getDocs(phoneQuery);

//       if (!querySnapshot.empty) {
//         return { exists: true, method: "phone" };
//       }

//       return { exists: false };
//     } catch (error) {
//       console.error("Error checking user existence:", error);
//       throw new Error("Failed to check user existence");
//     }
//   };

//   const registerUser = async (email, password, userData) => {
//     try {
//       setError(null);
//       const userCredential = await createUserWithEmailAndPassword(
//         auth,
//         email,
//         password
//       );
//       const user = userCredential.user;

//       await updateProfile(user, {
//         displayName: userData.firstName,
//       });

//       const userDocData = {
//         uid: user.uid,
//         email: user.email,
//         username: userData.username,
//         firstName: userData.firstName,
//         contactNumber: userData.contactNumber,
//         shopDetails: userData.shopDetails || {},
//         bankDetails: userData.bankDetails || {},
//         kycDocuments: userData.kycDocuments || {},
//         createdAt: new Date().toISOString(),
//         emailVerified: user.emailVerified,
//         phoneVerified: userData.phoneVerified || false,
//         registrationCompleted: userData.registrationCompleted || false,
//         isActive: true,
//       };

//       await setDoc(doc(db, "vendor_registrations", user.uid), userDocData);
//       setUserData(userDocData);

//       if (userData.contactNumber) {
//         const normalizedPhone = userData.contactNumber.replace(/\D/g, "");
//         await setDoc(doc(db, "phones", normalizedPhone), { uid: user.uid });
//       }

//       console.log("User registered successfully:", userDocData);
//       return { success: true, user };
//     } catch (error) {
//       console.error("Registration error:", error);
//       let errorMessage = "Registration failed";

//       switch (error.code) {
//         case "auth/email-already-in-use":
//           errorMessage = "Email is already registered";
//           break;
//         case "auth/weak-password":
//           errorMessage = "Password should be at least 6 characters";
//           break;
//         case "auth/invalid-email":
//           errorMessage = "Invalid email address";
//           break;
//         default:
//           errorMessage = error.message;
//       }

//       setError(errorMessage);
//       throw new Error(errorMessage);
//     }
//   };

//   const loginUser = async (email, password) => {
//     try {
//       setError(null);
//       const userCredential = await signInWithEmailAndPassword(
//         auth,
//         email,
//         password
//       );
//       const user = userCredential.user;

//       const userDoc = await getDoc(doc(db, "vendor_registrations", user.uid));
//       if (userDoc.exists()) {
//         setUserData(userDoc.data());
//       }

//       return { success: true, user };
//     } catch (error) {
//       console.error("Login error:", error);
//       let errorMessage = "Login failed";

//       switch (error.code) {
//         case "auth/user-not-found":
//         case "auth/invalid-credential":
//           errorMessage = "Invalid email or password";
//           break;
//         case "auth/wrong-password":
//           errorMessage = "Incorrect password";
//           break;
//         case "auth/invalid-email":
//           errorMessage = "Invalid email address";
//           break;
//         case "auth/too-many-requests":
//           errorMessage = "Too many failed attempts. Please try again later.";
//           break;
//         default:
//           errorMessage = error.message;
//       }

//       setError(errorMessage);
//       throw new Error(errorMessage);
//     }
//   };

//   const uploadKycFile = async (file, userId, fileName) => {
//     if (!file) throw new Error(`No ${fileName} file selected`);

//     const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
//     if (!allowedTypes.includes(file.type)) {
//       throw new Error(`${fileName} must be a PNG or JPEG image`);
//     }

//     if (file.size > 5 * 1024 * 1024) {
//       throw new Error(`${fileName} must be less than 5MB`);
//     }

//     const storageRef = ref(storage, `kyc/${userId}/${fileName}`);
//     const uploadTask = uploadBytesResumable(storageRef, file);

//     return new Promise((resolve, reject) => {
//       uploadTask.on(
//         "state_changed",
//         null,
//         (error) => reject(error),
//         async () => {
//           const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
//           resolve(downloadURL);
//         }
//       );
//     });
//   };

//   const signOut = async () => {
//     try {
//       await firebaseSignOut(auth);
//       navigate("/register");
//       setCurrentUser(null);
//       setUserData(null);
//       setConfirmationResult(null);
//       setRecaptchaVerifier(null);
//     } catch (error) {
//       console.error("Sign out error:", error);
//       throw new Error("Failed to sign out");
//     }
//   };

//   const clearConfirmationResult = () => {
//     setConfirmationResult(null);
//   };

//   const initializeRecaptcha = () => {
//     try {
//       const container = document.getElementById("recaptcha-container");
//       if (!container) {
//         throw new Error("reCAPTCHA container not found");
//       }

//       if (!recaptchaVerifier) {
//         const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
//           size: "invisible",
//           callback: (response) => {
//             console.log("reCAPTCHA solved");
//           },
//           "expired-callback": () => {
//             console.log("reCAPTCHA expired");
//             setError("reCAPTCHA expired. Please try again.");
//           },
//         });
//         setRecaptchaVerifier(verifier);
//         return verifier;
//       }
//       return recaptchaVerifier;
//     } catch (error) {
//       console.error("Error initializing reCAPTCHA:", error);
//       setError("Failed to initialize verification. Please try again.");
//       throw error;
//     }
//   };

//   const sendOtp = async (phoneNumber) => {
//     try {
//       setError(null);

//       let formattedPhone = phoneNumber.replace(/\D/g, "");
//       if (formattedPhone.length === 10) {
//         formattedPhone = `+91${formattedPhone}`;
//       }

//       console.log("Sending OTP to:", formattedPhone);

//       await new Promise((resolve) => setTimeout(resolve, 200));

//       const verifier = initializeRecaptcha();
//       const confirmation = await signInWithPhoneNumber(auth, formattedPhone, verifier);
//       setConfirmationResult(confirmation);

//       return { success: true };
//     } catch (error) {
//       console.error("Error sending OTP:", error);
//       setError(error.message);
//       throw error;
//     }
//   };

//   const verifyOtp = async (otp) => {
//     try {
//       if (!confirmationResult) {
//         throw new Error("No confirmation result found");
//       }

//       const result = await confirmationResult.confirm(otp);
//       return { success: true, user: result.user };
//     } catch (error) {
//       console.error("Error verifying OTP:", error);
//       throw error;
//     }
//   };

//   const googleSignIn = async () => {
//     const provider = new GoogleAuthProvider();
//     try {
//       const result = await signInWithPopup(auth, provider);
//       const user = result.user;

//       sessionStorage.setItem(
//         "registerPrefill",
//         JSON.stringify({
//           email: user.email || "",
//           firstName: user.displayName?.split(" ")[0] || "",
//           photoURL: user.photoURL || "",
//         })
//       );

//       navigate("/register");
//       return { success: true, user };
//     } catch (error) {
//       console.error("Google Sign-In Error:", error);
//       setError(error.message || "Google sign-in failed");
//       throw error;
//     }
//   };

//   const getVendorProfileByUid = async (uid) => {
//     try {
//       if (!uid) return null;
//       const ref = doc(db, "vendor_registrations", uid);
//       const snap = await getDoc(ref);
//       return snap.exists() ? { id: snap.id, ...snap.data() } : null;
//     } catch (err) {
//       console.error("getVendorProfileByUid error:", err);
//       return null;
//     }
//   };

//   return (
//     <AppContext.Provider
//       value={{
//         currentUser,
//         userData,
//         loading,
//         error,
//         setError,
//         clearError,
//         googleSignIn,
//         registerUser,
//         loginUser,
//         checkUserExists,
//         signOut,
//         sendOtp,
//         verifyOtp,
//         initializeRecaptcha,
//         confirmationResult,
//         clearConfirmationResult,
//         getVendorProfileByUid,
//         uploadKycFile,
//         productData,
//         updateProductData,
//         resetProductData,
//       }}
//     >
//       {children}
//     </AppContext.Provider>
//   );
// };

// export const useApp = () => useContext(AppContext);