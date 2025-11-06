import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/Context';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { updateProfile, updatePassword } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ProfileHeader from '../../Components/ProfileComponents/ProfileHeader';
import MessageBanner from '../../Components/ProfileComponents/MessageBanner';
import NavigationTabs from '../../Components/ProfileComponents/ProfileNavigationTabs';
import { db, storage, auth } from '../../../../firebaseConfig';
import FormSection from '../../Components/ProfileComponents/FormSection';
import ActionButtons from '../../Components/ProfileComponents/ActionButtons'; 


const Profilepage = () => {
  const { currentUser, userData, loading, error, setError, signOut } = useApp();
  const [activeSection, setActiveSection] = useState('account');
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [profileData, setProfileData] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
    address: '',
    sellsFor: [],
    selectedCategories: [],
    designTypes: [],
    materialTypes: [],
    dressTypes: [],
    shopName: '',
    gstnNumber: '',
    firstName: '',
    businessType: '',
    shopAddress: '',
    bankName: '',
    bankAddress: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
    profileImage: '',
    coverImage: ''
  });

  const tabs = [
    { id: 'account', label: 'Account Preferences' },
    { id: 'vendor', label: 'Vendor' },
    { id: 'shop', label: 'Shop' },
    { id: 'payout', label: 'Payout details' },
    { id: 'rating', label: 'Rating and review' },
    { id: 'support', label: 'Support' }
  ];

  // Real-time listener with onSnapshot
  useEffect(() => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'vendor_registrations', currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfileData({
          fullName: data.firstName || currentUser.displayName || '',
          mobileNumber: data.contactNumber || '',
          email: currentUser.email || '',
          address: data.address || '',
          sellsFor: data.vendorPreferences?.sellsFor || [],
          selectedCategories: data.vendorPreferences?.categories || [],
          designTypes: data.vendorPreferences?.designTypes || [],
          materialTypes: data.vendorPreferences?.materialTypes || [],
          dressTypes: data.vendorPreferences?.dressTypes || [],
          shopName: data.shopDetails?.shopName || '',
          gstnNumber: data.shopDetails?.gstnNumber || '',
          firstName: data.firstName || '',
          businessType: data.shopDetails?.businessType || '',
          shopAddress: data.shopDetails?.shopAddress || '',
          bankName: data.bankDetails?.bankName || '',
          bankAddress: data.bankDetails?.branchName || '',
          accountHolderName: data.bankDetails?.accountHolder || '',
          accountNumber: data.bankDetails?.accountNumber || '',
          ifscCode: data.bankDetails?.ifscCode || '',
          upiId: data.bankDetails?.upiId || '',
          profileImage: data.profileImage || '/api/placeholder/120/120',
          coverImage: data.coverImage || '/default-cover.jpg'
        });
      } else {
        // Handle case where document doesn't exist
        setProfileData({
          fullName: currentUser.displayName || '',
          email: currentUser.email || '',
          mobileNumber: '',
          address: '',
          sellsFor: [],
          selectedCategories: [],
          designTypes: [],
          materialTypes: [],
          dressTypes: [],
          shopName: '',
          gstnNumber: '',
          firstName: currentUser.displayName || '',
          businessType: '',
          shopAddress: '',
          bankName: '',
          bankAddress: '',
          accountHolderName: '',
          accountNumber: '',
          ifscCode: '',
          upiId: '',
          profileImage: '/api/placeholder/120/120',
          coverImage: '/default-cover.jpg'
        });
        setError('No profile data found. Please complete your registration.');
      }
    }, (error) => {
      setError('Failed to load profile data: ' + error.message);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [currentUser, setError]);

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayFieldChange = (field, value, isSelected) => {
    setProfileData(prev => ({
      ...prev,
      [field]: isSelected
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleImageUpload = async (e, type) => {
    if (!isEditing || !currentUser) return;
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUpdateLoading(true);
      const storageRef = ref(storage, `users/${currentUser.uid}/${type}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setProfileData(prev => ({
        ...prev,
        [type]: downloadURL
      }));
      await updateDoc(doc(db, 'vendor_registrations', currentUser.uid), { [type]: downloadURL });
      setSuccessMessage(`${type === 'profileImage' ? 'Profile' : 'Cover'} image updated successfully!`);
    } catch (error) {
      setError('Failed to upload image: ' + error.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!currentUser) {
      setError('User not authenticated');
      return;
    }
    if (activeSection === 'account' && profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (activeSection === 'shop' && profileData.gstnNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(profileData.gstnNumber)) {
      setError('Invalid GSTN number');
      return;
    }
    setUpdateLoading(true);
    setError('');
    try {
      const userDocRef = doc(db, 'vendor_registrations', currentUser.uid);
      let updateData = { updatedAt: new Date().toISOString() };
      switch (activeSection) {
        case 'account':
          updateData = {
            ...updateData,
            firstName: profileData.fullName,
            contactNumber: profileData.mobileNumber,
            address: profileData.address
          };
          if (profileData.fullName !== currentUser.displayName) {
            await updateProfile(currentUser, { displayName: profileData.fullName });
          }
          if (profileData.newPassword && profileData.newPassword === profileData.confirmPassword) {
            await updatePassword(currentUser, profileData.newPassword);
            setProfileData(prev => ({
              ...prev,
              newPassword: '',
              confirmPassword: ''
            }));
          }
          break;
        case 'vendor':
          updateData = {
            ...updateData,
            vendorPreferences: {
              sellsFor: profileData.sellsFor,
              categories: profileData.selectedCategories,
              designTypes: profileData.designTypes,
              materialTypes: profileData.materialTypes,
              dressTypes: profileData.dressTypes
            }
          };
          break;
        case 'shop':
          updateData = {
            ...updateData,
            shopDetails: {
              shopName: profileData.shopName,
              gstnNumber: profileData.gstnNumber,
              businessType: profileData.businessType,
              shopAddress: profileData.shopAddress
            },
            firstName: profileData.firstName
          };
          break;
        case 'payout':
          updateData = {
            ...updateData,
            bankDetails: {
              bankName: profileData.bankName,
              branchName: profileData.bankAddress,
              accountHolder: profileData.accountHolderName,
              accountNumber: profileData.accountNumber,
              ifscCode: profileData.ifscCode,
              upiId: profileData.upiId
            }
          };
          break;
      }
      await updateDoc(userDocRef, updateData);
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setError('Failed to update profile: ' + error.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(''); // Use setError from context
    // Revert to original data from userData
    if (userData && currentUser) {
      setProfileData({
        fullName: userData.firstName || currentUser.displayName || '',
        mobileNumber: userData.contactNumber || '',
        email: currentUser.email || '',
        address: userData.address || '',
        sellsFor: userData.vendorPreferences?.sellsFor || [],
        selectedCategories: userData.vendorPreferences?.categories || [],
        designTypes: userData.vendorPreferences?.designTypes || [],
        materialTypes: userData.vendorPreferences?.materialTypes || [],
        dressTypes: userData.vendorPreferences?.dressTypes || [],
        shopName: userData.shopDetails?.shopName || '',
        gstnNumber: userData.shopDetails?.gstnNumber || '',
        firstName: userData.firstName || '',
        businessType: userData.shopDetails?.businessType || '',
        shopAddress: userData.shopDetails?.shopAddress || '',
        bankName: userData.bankDetails?.bankName || '',
        bankAddress: userData.bankDetails?.branchName || '',
        accountHolderName: userData.bankDetails?.accountHolder || '',
        accountNumber: userData.bankDetails?.accountNumber || '',
        ifscCode: userData.bankDetails?.ifscCode || '',
        upiId: userData.bankDetails?.upiId || '',
        profileImage: userData.profileImage || '/api/placeholder/120/120',
        coverImage: userData.coverImage || '/default-cover.jpg'
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      setError('Failed to sign out: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error && !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-sm">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button className="bg-primary-blue hover:bg-primary-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full relative">
      <ProfileHeader profileData={profileData} isEditing={isEditing} handleImageUpload={handleImageUpload} updateLoading={updateLoading} />
      <MessageBanner successMessage={successMessage} error={error} />
       {/* Edit button at bottom right */}
      {activeSection !== 'rating' && activeSection !== 'support' && (
        <div className="right-0 m-2">
          <ActionButtons
            activeSection={activeSection}
            isEditing={isEditing}
            handleEdit={handleEdit}
            handleSave={handleSave}
            handleCancel={handleCancel}
            updateLoading={updateLoading}
          />
        </div>
      )}
      <div className="w-full px-4 md:px-6 lg:px-12 xl:px-12 2xl:px-16 py-8 m-10">
        <NavigationTabs tabs={tabs} activeSection={activeSection} setActiveSection={setActiveSection} />
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 lg:p-10 xl:p-12 w-full">
          <FormSection
            activeSection={activeSection}
            profileData={profileData}
            isEditing={isEditing}
            handleInputChange={handleInputChange}
            handleArrayFieldChange={handleArrayFieldChange}
            updateLoading={updateLoading}
          />
        </div>
      </div>
     
    </div>
  );
};

export default Profilepage;

// import React, { useState, useEffect } from 'react';
// import { useApp } from '../../context/Context';
// import ProfileHeader from '../../Components/ProfileComponents/ProfileHeader';
// import MessageBanner from '../../Components/ProfileComponents/MessageBanner';
// import NavigationTabs from '../../Components/ProfileComponents/ProfileNavigationTabs';
// import FormSection from '../../Components/ProfileComponents/FormSection';

// const Profilepage = () => {
//   const { currentUser, userData, loading, error } = useApp();
//   const [activeSection, setActiveSection] = useState('account');
//   const [profileData, setProfileData] = useState({
//     fullName: '',
//     mobileNumber: '',
//     email: '',
//     address: '',
//     sellsFor: [],
//     selectedCategories: [],
//     designTypes: [],
//     materialTypes: [],
//     dressTypes: [],
//     shopName: '',
//     gstnNumber: '',
//     firstName: '',
//     businessType: '',
//     shopAddress: '',
//     bankName: '',
//     bankAddress: '',
//     accountHolderName: '',
//     accountNumber: '',
//     ifscCode: '',
//     upiId: '',
//     profileImage: '',
//     coverImage: ''
//   });

//   const tabs = [
//     { id: 'account', label: 'Account Preferences' },
//     { id: 'vendor', label: 'Vendor' },
//     { id: 'shop', label: 'Shop' },
//     { id: 'payout', label: 'Payout details' },
//     { id: 'rating', label: 'Rating and review' },
//     { id: 'support', label: 'Support' }
//   ];

//   // Sync profileData with userData from context
//   useEffect(() => {
//     if (userData && currentUser) {
//       setProfileData({
//         fullName: userData.firstName || currentUser.displayName || '',
//         mobileNumber: userData.contactNumber || '',
//         email: currentUser.email || '',
//         address: userData.address || '',
//         sellsFor: userData.vendorPreferences?.sellsFor || [],
//         selectedCategories: userData.vendorPreferences?.categories || [],
//         designTypes: userData.vendorPreferences?.designTypes || [],
//         materialTypes: userData.vendorPreferences?.materialTypes || [],
//         dressTypes: userData.vendorPreferences?.dressTypes || [],
//         shopName: userData.shopDetails?.shopName || '',
//         gstnNumber: userData.shopDetails?.gstnNumber || '',
//         firstName: userData.firstName || '',
//         businessType: userData.shopDetails?.businessType || '',
//         shopAddress: userData.shopDetails?.shopAddress || '',
//         bankName: userData.bankDetails?.bankName || '',
//         bankAddress: userData.bankDetails?.branchName || '',
//         accountHolderName: userData.bankDetails?.accountHolder || '',
//         accountNumber: userData.bankDetails?.accountNumber || '',
//         ifscCode: userData.bankDetails?.ifscCode || '',
//         upiId: userData.bankDetails?.upiId || '',
//         profileImage: userData.profileImage || '/api/placeholder/120/120',
//         coverImage: userData.coverImage || '/default-cover.jpg'
//       });
//     } else if (!currentUser) {
//       setProfileData({
//         fullName: '',
//         email: '',
//         mobileNumber: '',
//         address: '',
//         sellsFor: [],
//         selectedCategories: [],
//         designTypes: [],
//         materialTypes: [],
//         dressTypes: [],
//         shopName: '',
//         gstnNumber: '',
//         firstName: '',
//         businessType: '',
//         shopAddress: '',
//         bankName: '',
//         bankAddress: '',
//         accountHolderName: '',
//         accountNumber: '',
//         ifscCode: '',
//         upiId: '',
//         profileImage: '/api/placeholder/120/120',
//         coverImage: '/default-cover.jpg'
//       });
//     }
//   }, [userData, currentUser]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading your profile...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error && !currentUser) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-sm">
//           <div className="text-red-500 text-6xl mb-4">⚠️</div>
//           <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
//           <p className="text-gray-600 mb-4">{error}</p>
//           <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
//             Go to Login
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 w-full">
//       <ProfileHeader profileData={profileData} isEditing={false} updateLoading={false} />
//       <MessageBanner successMessage="" error={error} />
//       <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
//         <NavigationTabs tabs={tabs} activeSection={activeSection} setActiveSection={setActiveSection} />
//         <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 lg:p-10 xl:p-12 w-full">
//           <FormSection
//             activeSection={activeSection}
//             profileData={profileData}
//             isEditing={false}
//             handleInputChange={() => {}} // Placeholder, not used since editing is disabled
//             handleArrayFieldChange={() => {}} // Placeholder, not used since editing is disabled
//             updateLoading={false}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profilepage;


// // import React, { useState, useEffect } from 'react';
// // import { useApp } from '../../context/Context';
// // import { doc, updateDoc, getDoc } from 'firebase/firestore';
// // import { db, storage } from '../../../../firebaseConfig';
// // import { updateProfile, updatePassword } from 'firebase/auth';
// // import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// // import coverImg from '../../../assets/coverimg.svg'

// // const Profilepage = () => {
// //   const { currentUser, userData, signOut } = useApp();
// //   const [activeSection, setActiveSection] = useState('account');
// //   const [isEditing, setIsEditing] = useState(false);
// //   const [loading, setLoading] = useState(true);
// //   const [updateLoading, setUpdateLoading] = useState(false);
// //   const [error, setError] = useState(null);
// //   const [successMessage, setSuccessMessage] = useState('');

// //   // Profile data state
// //   const [profileData, setProfileData] = useState({
// //     fullName: '',
// //     mobileNumber: '',
// //     email: '',
// //     address: '',
// //     newPassword: '',
// //     confirmPassword: '',
// //     sellsFor: [],
// //     selectedCategories: [],
// //     designTypes: [],
// //     materialTypes: [],
// //     dressTypes: [],
// //     shopName: '',
// //     gstnNumber: '',
// //     firstName: '',
// //     businessType: '',
// //     shopAddress: '',
// //     bankName: '',
// //     bankAddress: '',
// //     accountHolderName: '',
// //     accountNumber: '',
// //     ifscCode: '',
// //     upiId: '',
// //     profileImage: '',
// //     coverImage: '' 
// //   });

// //   // Rating data (static for now, can be made dynamic later)
// //   const [ratingData] = useState({
// //     averageRating: 4.5,
// //     totalReviews: 120,
// //     ratingBreakdown: [
// //       { stars: 5, percentage: 40, color: 'bg-gray-800' },
// //       { stars: 4, percentage: 30, color: 'bg-gray-600' },
// //       { stars: 3, percentage: 15, color: 'bg-gray-400' },
// //       { stars: 2, percentage: 10, color: 'bg-gray-300' },
// //       { stars: 1, percentage: 5, color: 'bg-gray-200' }
// //     ],
// //     dressTypeRatings: [
// //       { type: 'Casual', count: '4.2 stars', reviews: '15 reviews' },
// //       { type: 'Formal', count: '4.5 stars', reviews: '25 reviews' },
// //       { type: 'Party', count: '4.8 stars', reviews: '8 reviews' }
// //     ]
// //   });

// //   // Navigation tabs
// //   const tabs = [
// //     { id: 'account', label: 'Account Preferences' },
// //     { id: 'vendor', label: 'Vendor' },
// //     { id: 'shop', label: 'Shop' },
// //     { id: 'payout', label: 'Payout details' },
// //     { id: 'rating', label: 'Rating and review' },
// //     { id: 'support', label: 'Support' }
// //   ];

// //   // Load user data
// //   useEffect(() => {
// //     const loadUserData = async () => {
// //       if (!currentUser) {
// //         setError('Please log in to view your profile');
// //         setLoading(false);
// //         return;
// //       }

// //       try {
// //         setLoading(true);
// //         console.log('Loading user data for:', currentUser.uid);

// //         const userDocRef = doc(db, 'users', currentUser.uid);
// //         const userDoc = await getDoc(userDocRef);

// //         if (userDoc.exists()) {
// //           const data = userDoc.data();
// //           setProfileData(prevData => ({
// //             ...prevData,
// //             fullName: data.firstName || currentUser.displayName || '',
// //             mobileNumber: data.contactNumber || '',
// //             email: currentUser.email || '',
// //             address: data.address || '',
// //             sellsFor: data.vendorPreferences?.sellsFor || [],
// //             selectedCategories: data.vendorPreferences?.categories || [],
// //             designTypes: data.vendorPreferences?.designTypes || [],
// //             materialTypes: data.vendorPreferences?.materialTypes || [],
// //             dressTypes: data.vendorPreferences?.dressTypes || [],
// //             shopName: data.shopDetails?.shopName || '',
// //             gstnNumber: data.shopDetails?.gstnNumber || '',
// //             firstName: data.firstName || '',
// //             businessType: data.shopDetails?.businessType || '',
// //             shopAddress: data.shopDetails?.shopAddress || '',
// //             bankName: data.bankDetails?.bankName || '',
// //             bankAddress: data.bankDetails?.branchName || '',
// //             accountHolderName: data.bankDetails?.accountHolder || '',
// //             accountNumber: data.bankDetails?.accountNumber || '',
// //             ifscCode: data.bankDetails?.ifscCode || '',
// //             upiId: data.bankDetails?.upiId || '',
// //             profileImage: data.profileImage || '/api/placeholder/120/120',
// //             coverImage: data.coverImage || coverImg
// //           }));
// //         } else {
// //           setProfileData(prevData => ({
// //             ...prevData,
// //             fullName: currentUser.displayName || '',
// //             email: currentUser.email || ''
// //           }));
// //         }

// //         setError(null);
// //       } catch (error) {
// //         console.error('Error loading user data:', error);
// //         setError('Failed to load profile data');
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     loadUserData();
// //   }, [currentUser]);

// //   // Clear messages after 5 seconds
// //   useEffect(() => {
// //     if (successMessage || error) {
// //       const timer = setTimeout(() => {
// //         setSuccessMessage('');
// //         setError('');
// //       }, 5000);
// //       return () => clearTimeout(timer);
// //     }
// //   }, [successMessage, error]);

// //   // Handle input changes
// //   const handleInputChange = (field, value) => {
// //     setProfileData(prev => ({
// //       ...prev,
// //       [field]: value
// //     }));
// //   };

// //   // Handle array field changes
// //   const handleArrayFieldChange = (field, value, isSelected) => {
// //     setProfileData(prev => ({
// //       ...prev,
// //       [field]: isSelected
// //         ? prev[field].filter(item => item !== value)
// //         : [...prev[field], value]
// //     }));
// //   };

// //   // Handle image uploads
// //   const handleImageUpload = async (e, type) => {
// //     if (!isEditing || !currentUser) return;

// //     const file = e.target.files[0];
// //     if (!file) return;

// //     try {
// //       setUpdateLoading(true);
// //       const storageRef = ref(storage, `users/${currentUser.uid}/${type}`);
// //       await uploadBytes(storageRef, file);
// //       const downloadURL = await getDownloadURL(storageRef);

// //       setProfileData(prev => ({
// //         ...prev,
// //         [type]: downloadURL
// //       }));

// //       const userDocRef = doc(db, 'users', currentUser.uid);
// //       await updateDoc(userDocRef, { [type]: downloadURL });

// //       setSuccessMessage(`${type === 'profileImage' ? 'Profile' : 'Cover'} image updated successfully!`);
// //     } catch (error) {
// //       console.error('Error uploading image:', error);
// //       setError('Failed to upload image');
// //     } finally {
// //       setUpdateLoading(false);
// //     }
// //   };

// //   // Handle edit/save functionality
// //   const handleEdit = () => {
// //     setIsEditing(true);
// //   };

// //   const handleSave = async () => {
// //     if (!currentUser) {
// //       setError('User not authenticated');
// //       return;
// //     }

// //     // Basic validation
// //     if (activeSection === 'account' && profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
// //       setError('Passwords do not match');
// //       return;
// //     }

// //     if (activeSection === 'shop' && profileData.gstnNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(profileData.gstnNumber)) {
// //       setError('Invalid GSTN number');
// //       return;
// //     }

// //     setUpdateLoading(true);
// //     setError('');

// //     try {
// //       const userDocRef = doc(db, 'users', currentUser.uid);
// //       let updateData = {};

// //       switch (activeSection) {
// //         case 'account':
// //           updateData = {
// //             firstName: profileData.fullName,
// //             contactNumber: profileData.mobileNumber,
// //             address: profileData.address,
// //             updatedAt: new Date().toISOString()
// //           };

// //           if (profileData.fullName !== currentUser.displayName) {
// //             await updateProfile(currentUser, {
// //               displayName: profileData.fullName
// //             });
// //           }

// //           if (profileData.newPassword && profileData.newPassword === profileData.confirmPassword) {
// //             await updatePassword(currentUser, profileData.newPassword);
// //             setProfileData(prev => ({
// //               ...prev,
// //               newPassword: '',
// //               confirmPassword: ''
// //             }));
// //           }
// //           break;

// //         case 'vendor':
// //           updateData = {
// //             vendorPreferences: {
// //               sellsFor: profileData.sellsFor,
// //               categories: profileData.selectedCategories,
// //               designTypes: profileData.designTypes,
// //               materialTypes: profileData.materialTypes,
// //               dressTypes: profileData.dressTypes
// //             },
// //             updatedAt: new Date().toISOString()
// //           };
// //           break;

// //         case 'shop':
// //           updateData = {
// //             shopDetails: {
// //               shopName: profileData.shopName,
// //               gstnNumber: profileData.gstnNumber,
// //               businessType: profileData.businessType,
// //               shopAddress: profileData.shopAddress
// //             },
// //             firstName: profileData.firstName,
// //             updatedAt: new Date().toISOString()
// //           };
// //           break;

// //         case 'payout':
// //           updateData = {
// //             bankDetails: {
// //               bankName: profileData.bankName,
// //               branchName: profileData.bankAddress,
// //               accountHolder: profileData.accountHolderName,
// //               accountNumber: profileData.accountNumber,
// //               ifscCode: profileData.ifscCode,
// //               upiId: profileData.upiId
// //             },
// //             updatedAt: new Date().toISOString()
// //           };
// //           break;
// //       }

// //       await updateDoc(userDocRef, updateData);
// //       setSuccessMessage('Profile updated successfully!');
// //       setIsEditing(false);
// //     } catch (error) {
// //       console.error('Error updating profile:', error);
// //       setError(`Failed to update profile: ${error.message}`);
// //     } finally {
// //       setUpdateLoading(false);
// //     }
// //   };

// //   const handleCancel = () => {
// //     setIsEditing(false);
// //     setError('');
// //   };

// //   const handleSignOut = async () => {
// //     try {
// //       await signOut();
// //     } catch (error) {
// //       console.error('Error signing out:', error);
// //       setError('Failed to sign out');
// //     }
// //   };

// //   // Render form sections
// //   const renderFormSection = () => {
// //     switch (activeSection) {
// //       case 'account':
// //         return (
// //           <div className="w-full">
// //             <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 lg:gap-8 2xl:gap-12">
// //               <div className="space-y-2">
// //                 <label className="block text-sm font-medium text-gray-700">Full Name</label>
// //                 <input
// //                   type="text"
// //                   value={profileData.fullName}
// //                   onChange={(e) => handleInputChange('fullName', e.target.value)}
// //                   placeholder="Your full name"
// //                   disabled={!isEditing}
// //                   className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
// //                     !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
// //                   }`}
// //                 />
// //               </div>
// //               <div className="space-y-2">
// //                 <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
// //                 <input
// //                   type="tel"
// //                   value={profileData.mobileNumber}
// //                   onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
// //                   placeholder="Mobile number"
// //                   disabled={!isEditing}
// //                   className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
// //                     !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
// //                   }`}
// //                 />
// //               </div>
// //               <div className="space-y-2">
// //                 <label className="block text-sm font-medium text-gray-700">Email Id</label>
// //                 <input
// //                   type="email"
// //                   value={profileData.email}
// //                   placeholder="Email Id"
// //                   disabled={true}
// //                   className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
// //                 />
// //                 <p className="text-xs text-gray-500">Email cannot be changed</p>
// //               </div>
// //               {isEditing && (
// //                 <>
// //                   <div className="space-y-2">
// //                     <label className="block text-sm font-medium text-gray-700">New Password</label>
// //                     <input
// //                       type="password"
// //                       value={profileData.newPassword}
// //                       onChange={(e) => handleInputChange('newPassword', e.target.value)}
// //                       placeholder="Leave blank to keep current"
// //                       className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
// //                     />
// //                   </div>
// //                   <div className="space-y-2">
// //                     <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
// //                     <input
// //                       type="password"
// //                       value={profileData.confirmPassword}
// //                       onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
// //                       placeholder="Confirm new password"
// //                       className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
// //                     />
// //                   </div>
// //                 </>
// //               )}
// //               <div className="space-y-2 lg:col-span-2 2xl:col-span-3">
// //                 <label className="block text-sm font-medium text-gray-700">Address</label>
// //                 <textarea
// //                   value={profileData.address}
// //                   onChange={(e) => handleInputChange('address', e.target.value)}
// //                   placeholder="Address"
// //                   rows="3"
// //                   disabled={!isEditing}
// //                   className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
// //                     !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
// //                   }`}
// //                 />
// //               </div>
// //             </div>
// //           </div>
// //         );

// //       case 'vendor':
// //         const sellsForOptions = ['Men', 'Women', 'Kids', 'Unisex'];
// //         const categoryOptions = ['Clothing', 'Accessories'];
// //         const designTypeOptions = ['Type 1', 'Type 2', 'Traditional', 'Modern'];
// //         const materialTypeOptions = ['Cotton Lycra', 'Silk', 'Cotton', 'Polyester', 'Linen'];
// //         const dressTypeOptions = ['Western/Light', 'Traditional', 'Party Wear', 'Casual', 'Formal'];

// //         return (
// //           <div className="w-full">
// //             <div>
// //               <h3 className="text-lg font-medium text-gray-900 mb-6">Who do you sell for?</h3>
// //               <div className="flex flex-wrap gap-3">
// //                 {sellsForOptions.map((option) => {
// //                   const isSelected = profileData.sellsFor.includes(option);
// //                   return (
// //                     <button
// //                       key={option}
// //                       type="button"
// //                       onClick={() => isEditing && handleArrayFieldChange('sellsFor', option, isSelected)}
// //                       disabled={!isEditing}
// //                       className={`px-6 py-3 rounded-full text-sm cursor-pointer transition-colors ${
// //                         isSelected
// //                           ? 'bg-blue-500 text-white'
// //                           : isEditing
// //                           ? 'bg-gray-100 text-gray-700 hover:bg-blue-500 hover:text-white'
// //                           : 'bg-gray-100 text-gray-700'
// //                       } ${!isEditing ? 'cursor-not-allowed' : ''}`}
// //                     >
// //                       {option}
// //                     </button>
// //                   );
// //                 })}
// //               </div>
// //             </div>

// //             <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 lg:gap-12 mt-8">
// //               <div className="space-y-4">
// //                 <h4 className="text-base font-medium text-gray-900">Select Categories</h4>
// //                 <div className="space-y-3">
// //                   {categoryOptions.map((category) => {
// //                     const isSelected = profileData.selectedCategories.includes(category);
// //                     return (
// //                       <button
// //                         key={category}
// //                         type="button"
// //                         onClick={() => isEditing && handleArrayFieldChange('selectedCategories', category, isSelected)}
// //                         disabled={!isEditing}
// //                         className={`w-full px-6 py-4 rounded-lg transition-colors font-medium ${
// //                           isSelected
// //                             ? 'bg-blue-500 text-white'
// //                             : isEditing
// //                             ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
// //                             : 'bg-gray-50 text-gray-500 cursor-not-allowed'
// //                         }`}
// //                       >
// //                         {category}
// //                       </button>
// //                     );
// //                   })}
// //                 </div>
// //               </div>

// //               <div className="space-y-4">
// //                 <h4 className="text-base font-medium text-gray-900">Design Type</h4>
// //                 <div className="grid grid-cols-2 gap-3">
// //                   {designTypeOptions.map((design) => {
// //                     const isSelected = profileData.designTypes.includes(design);
// //                     return (
// //                       <button
// //                         key={design}
// //                         type="button"
// //                         onClick={() => isEditing && handleArrayFieldChange('designTypes', design, isSelected)}
// //                         disabled={!isEditing}
// //                         className={`px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
// //                           isSelected
// //                             ? 'bg-blue-500 text-white'
// //                             : isEditing
// //                             ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
// //                             : 'bg-gray-50 text-gray-500 cursor-not-allowed'
// //                         }`}
// //                       >
// //                         {design}
// //                       </button>
// //                     );
// //                   })}
// //                 </div>
// //               </div>

// //               <div className="space-y-4">
// //                 <h4 className="text-base font-medium text-gray-900">Material Type</h4>
// //                 <div className="flex flex-wrap gap-2">
// //                   {materialTypeOptions.map((material) => {
// //                     const isSelected = profileData.materialTypes.includes(material);
// //                     return (
// //                       <button
// //                         key={material}
// //                         type="button"
// //                         onClick={() => isEditing && handleArrayFieldChange('materialTypes', material, isSelected)}
// //                         disabled={!isEditing}
// //                         className={`px-4 py-2 rounded-full text-sm transition-colors ${
// //                           isSelected
// //                             ? 'bg-blue-500 text-white'
// //                             : isEditing
// //                             ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
// //                             : 'bg-gray-50 text-gray-500 cursor-not-allowed'
// //                         }`}
// //                       >
// //                         {material}
// //                       </button>
// //                     );
// //                   })}
// //                 </div>
// //               </div>

// //               <div className="space-y-4">
// //                 <h4 className="text-base font-medium text-gray-900">Dress Type</h4>
// //                 <div className="flex flex-wrap gap-2">
// //                   {dressTypeOptions.map((dress) => {
// //                     const isSelected = profileData.dressTypes.includes(dress);
// //                     return (
// //                       <button
// //                         key={dress}
// //                         type="button"
// //                         onClick={() => isEditing && handleArrayFieldChange('dressTypes', dress, isSelected)}
// //                         disabled={!isEditing}
// //                         className={`px-4 py-2 rounded-full text-sm transition-colors ${
// //                           isSelected
// //                             ? 'bg-blue-500 text-white'
// //                             : isEditing
// //                             ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
// //                             : 'bg-gray-50 text-gray-500 cursor-not-allowed'
// //                         }`}
// //                       >
// //                         {dress}
// //                       </button>
// //                     );
// //                   })}
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         );

// //       case 'shop':
// //         return (
// //           <div className="w-full">
// //             <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 lg:gap-8 2xl:gap-12">
// //               <div className="space-y-2">
// //                 <label className="block text-sm font-medium text-gray-700">Shop Name</label>
// //                 <input
// //                   type="text"
// //                   value={profileData.shopName}
// //                   onChange={(e) => handleInputChange('shopName', e.target.value)}
// //                   placeholder="Your shop name"
// //                   disabled={!isEditing}
// //                   className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
// //                     !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
// //                   }`}
// //                 />
// //               </div>
// //               <div className="space-y-2">
// //                 <label className="block text-sm font-medium text-gray-700">GSTN Number</label>
// //                 <input
// //                   type="text"
// //                   value={profileData.gstnNumber}
// //                   onChange={(e) => handleInputChange('gstnNumber', e.target.value)}
// //                   placeholder="GST number"
// //                   disabled={!isEditing}
// //                   className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
// //                     !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
// //                   }`}
// //                 />
// //               </div>
// //               <div className="space-y-2">
// //                 <label className="block text-sm font-medium text-gray-700">First Name</label>
// //                 <input
// //                   type="text"
// //                   value={profileData.firstName}
// //                   onChange={(e) => handleInputChange('firstName', e.target.value)}
// //                   placeholder="First name"
// //                   disabled={!isEditing}
// //                   className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
// //                     !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
// //                   }`}
// //                 />
// //               </div>
// //               <div className="space-y-2">
// //                 <label className="block text-sm font-medium text-gray-700">Business Type</label>
// //                 <input
// //                   type="text"
// //                   value={profileData.businessType}
// //                   onChange={(e) => handleInputChange('businessType', e.target.value)}
// //                   placeholder="Business type"
// //                   disabled={!isEditing}
// //                   className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
// //                     !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
// //                   }`}
// //                 />
// //               </div>
// //               <div className="space-y-2 lg:col-span-2 2xl:col-span-3">
// //                 <label className="block text-sm font-medium text-gray-700">Shop Address</label>
// //                 <textarea
// //                   value={profileData.shopAddress}
// //                   onChange={(e) => handleInputChange('shopAddress', e.target.value)}
// //                   placeholder="Shop address"
// //                   rows="3"
// //                   disabled={!isEditing}
// //                   className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
// //                     !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
// //                   }`}
// //                 />
// //               </div>
// //             </div>
// //           </div>
// //         );

// //       case 'payout':
// //         return (
// //           <div className="w-full">
// //             <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-6 lg:gap-8 xl:gap-12">
// //               <div className="space-y-2">
// //                 <label className="block text-sm font-medium text-gray-700">Bank Name</label>
// //                 <input
// //                   type="text"
// //                   value={profileData.bankName}
// //                   onChange={(e) => handleInputChange('bankName', e.target.value)}
// //                   placeholder="Bank name"
// //                   disabled={!isEditing}
// //                   className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
// //                     !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
// //                   }`}
// //                 />
// //               </div>
// //               <div className="space-y-2">
// //                 <label className="block text-sm font-medium text-gray-700">Bank Address</label>
// //                 <input
// //                   type="text"
// //                   value={profileData.bankAddress}
// //                   onChange={(e) => handleInputChange('bankAddress', e.target.value)}
// //                   placeholder="Branch name/address"
// //                   disabled={!isEditing}
// //                   className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
// //                     !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
// //                   }`}
// //                 />
// //               </div>
// //               <div className="space-y-2">
// //                 <label className="block text-sm font-medium text-gray-700">Account Holder Name</label>
// //                 <input
// //                   type="text"
// //                   value={profileData.accountHolderName}
// //                   onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
// //                   placeholder="Account holder name"
// //                   disabled={!isEditing}
// //                   className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
// //                     !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
// //                   }`}
// //                 />
// //               </div>
// //               <div className="space-y-2">
// //                 <label className="block text-sm font-medium text-gray-700">Bank Account Number</label>
// //                 <input
// //                   type="text"
// //                   value={profileData.accountNumber}
// //                   onChange={(e) => handleInputChange('accountNumber', e.target.value)}
// //                   placeholder="Bank account number"
// //                   disabled={!isEditing}
// //                   className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
// //                     !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
// //                   }`}
// //                 />
// //               </div>
// //               <div className="space-y-2">
// //                 <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
// //                 <input
// //                   type="text"
// //                   value={profileData.ifscCode}
// //                   onChange={(e) => handleInputChange('ifscCode', e.target.value)}
// //                   placeholder="IFSC code"
// //                   disabled={!isEditing}
// //                   className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
// //                     !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
// //                   }`}
// //                 />
// //               </div>
// //               <div className="space-y-2">
// //                 <label className="block text-sm font-medium text-gray-700">UPI ID</label>
// //                 <input
// //                   type="text"
// //                   value={profileData.upiId}
// //                   onChange={(e) => handleInputChange('upiId', e.target.value)}
// //                   placeholder="UPI ID"
// //                   disabled={!isEditing}
// //                   className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
// //                     !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
// //                   }`}
// //                 />
// //               </div>
// //             </div>
// //           </div>
// //         );

// //       case 'rating':
// //         return (
// //           <div className="w-full space-y-10">
// //             <div className="flex flex-col xl:flex-row xl:items-start xl:space-x-16 space-y-8 xl:space-y-0">
// //               <div className="text-center xl:text-left">
// //                 <div className="text-6xl font-bold text-gray-900 mb-4">{ratingData.averageRating}</div>
// //                 <div className="flex items-center justify-center xl:justify-start mb-4">
// //                   {[...Array(Math.floor(ratingData.averageRating))].map((_, i) => (
// //                     <svg key={i} className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 20 20">
// //                       <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
// //                     </svg>
// //                   ))}
// //                   {ratingData.averageRating % 1 !== 0 && (
// //                     <svg className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 20 20">
// //                       <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
// //                       <path d="M10 15V0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545L10 15z" fill="gray"/>
// //                     </svg>
// //                   )}
// //                   {[...Array(5 - Math.ceil(ratingData.averageRating))].map((_, i) => (
// //                     <svg key={i} className="w-6 h-6 text-gray-300 fill-current" viewBox="0 0 20 20">
// //                       <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
// //                     </svg>
// //                   ))}
// //                 </div>
// //                 <div className="text-base text-gray-600">{ratingData.totalReviews} reviews</div>
// //               </div>

// //               <div className="flex-1 max-w-md">
// //                 <div className="space-y-3">
// //                   {ratingData.ratingBreakdown.map((item) => (
// //                     <div key={item.stars} className="flex items-center space-x-4">
// //                       <span className="text-sm w-3">{item.stars}</span>
// //                       <div className="flex-1 bg-gray-100 rounded-full h-3">
// //                         <div
// //                           className={`h-3 rounded-full ${item.color} transition-all duration-300`}
// //                           style={{ width: `${item.percentage}%` }}
// //                         />
// //                       </div>
// //                       <span className="text-sm text-gray-600 w-10">{item.percentage}%</span>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>
// //             </div>

// //             <div>
// //               <h4 className="text-xl font-medium text-gray-900 mb-6">Dress Type Ratings</h4>
// //               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// //                 {ratingData.dressTypeRatings.map((item, index) => (
// //                   <div key={index} className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
// //                     <div className="flex items-center space-x-4">
// //                       <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
// //                       <span className="font-medium text-gray-900">{item.type}</span>
// //                     </div>
// //                     <div className="text-right">
// //                       <div className="text-sm font-medium text-gray-900">{item.count}</div>
// //                       <div className="text-sm text-blue-500 hover:text-blue-600 cursor-pointer">{item.reviews}</div>
// //                     </div>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>
// //           </div>
// //         );

// //       case 'support':
// //         return (
// //           <div className="text-center py-16">
// //             <h3 className="text-xl font-medium text-gray-900">Support</h3>
// //             <p className="text-gray-600 mt-3 text-lg">Contact support for assistance</p>
// //             <div className="mt-6">
// //               <p className="text-gray-600">Email: <a href="mailto:support@example.com" className="text-blue-500 hover:text-blue-600">support@example.com</a></p>
// //               <p className="text-gray-600">Phone: <a href="tel:+1234567890" className="text-blue-500 hover:text-blue-600">+1 (234) 567-890</a></p>
// //             </div>
// //             <button
// //               onClick={handleSignOut}
// //               className="mt-6 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
// //             >
// //               Sign Out
// //             </button>
// //           </div>
// //         );

// //       default:
// //         return null;
// //     }
// //   };

// //   // Loading state
// //   if (loading) {
// //     return (
// //       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
// //         <div className="text-center">
// //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
// //           <p className="text-gray-600">Loading your profile...</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   // Error state for unauthenticated users
// //   if (error && !currentUser) {
// //     return (
// //       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
// //         <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-sm">
// //           <div className="text-red-500 text-6xl mb-4">⚠️</div>
// //           <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
// //           <p className="text-gray-600 mb-4">{error}</p>
// //           <button
// //             onClick={() => window.location.href = '/login'}
// //             className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
// //           >
// //             Go to Login
// //           </button>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="min-h-screen bg-gray-50 w-full">
// //       {/* Header with cover image */}
// //       <div className="relative h-48 md:h-64 lg:h-80 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 w-full">
// //         <img
// //           src={coverImg}
// //           alt="Cover"
// //           className="w-full h-full object-cover"
// //         />
// //         <div className="absolute inset-0 bg-blue bg-opacity-30"></div>

// //         {/* Profile section */}
// //         <div className="absolute bottom-0 left-0 right-0 px-4 md:px-6 lg:px-8 xl:px-12 pb-6">
// //           <div className="flex items-end space-x-6">
// //             <div className="relative">
// //               <img
// //                 src={profileData.profileImage}
// //                 alt="Profile"
// //                 className="w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full border-4 border-white object-cover shadow-lg"
// //               />
// //               {isEditing && (
// //                 <label className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer">
// //                   <input
// //                     type="file"
// //                     accept="image/*"
// //                     onChange={(e) => handleImageUpload(e, 'profileImage')}
// //                     className="hidden"
// //                     disabled={updateLoading}
// //                   />
// //                   <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
// //                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
// //                   </svg>
// //                 </label>
// //               )}
// //             </div>
// //             <div className="text-white pb-4">
// //               <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">{profileData.fullName || 'User Name'}</h1>
// //               <p className="text-base md:text-lg lg:text-xl text-gray-200">{profileData.address || 'Location not set'}</p>
// //             </div>
// //           </div>
// //         </div>

// //         {/* Edit Profile Button and Cover Image Upload */}
// //         {isEditing ? (
// //           <label className="absolute top-4 right-4 md:top-6 md:right-6 lg:top-8 lg:right-8 bg-[#4F9EBB] bg-opacity-20 text-white px-4 py-2 lg:px-6 lg:py-3 rounded-lg text-sm lg:text-base backdrop-blur-sm hover:bg-opacity-30 transition-colors cursor-pointer">
// //             Change Cover Image
// //             <input
// //               type="file"
// //               accept="image/*"
// //               onChange={(e) => handleImageUpload(e, 'coverImage')}
// //               className="hidden"
// //               disabled={updateLoading}
// //             />
// //           </label>
// //         ) : (
// //           <button
// //             onClick={handleEdit}
// //             className="absolute top-4 right-4 md:top-6 md:right-6 lg:top-8 lg:right-8 bg-[#4F9EBB] bg-opacity-20 text-white px-4 py-2 lg:px-6 lg:py-3 rounded-lg text-sm lg:text-base backdrop-blur-sm hover:bg-opacity-30 transition-colors"
// //           >
// //             Edit Profile
// //           </button>
// //         )}
// //       </div>

// //       {/* Messages */}
// //       {(successMessage || error) && (
// //         <div className="px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-4">
// //           {successMessage && (
// //             <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6">
// //               {successMessage}
// //             </div>
// //           )}
// //           {error && (
// //             <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
// //               {error}
// //             </div>
// //           )}
// //         </div>
// //       )}

// //       {/* Main Content */}
// //       <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
// //         {/* Navigation Tabs */}
// //         <div className="border-b border-gray-200 mb-10">
// //           <nav className="flex space-x-6 md:space-x-8 lg:space-x-12 xl:space-x-16 overflow-x-auto">
// //             {tabs.map((tab) => (
// //               <button
// //                 key={tab.id}
// //                 onClick={() => setActiveSection(tab.id)}
// //                 className={`py-4 px-2 border-b-2 font-medium text-sm lg:text-base whitespace-nowrap transition-colors ${
// //                   activeSection === tab.id
// //                     ? 'border-blue-500 text-blue-600'
// //                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
// //                 }`}
// //               >
// //                 {tab.label}
// //               </button>
// //             ))}
// //           </nav>
// //         </div>

// //         {/* Form Content */}
// //         <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 lg:p-10 xl:p-12 w-full">
// //           {renderFormSection()}
          
// //           {/* Action Buttons */}
// //           {activeSection !== 'rating' && activeSection !== 'support' && (
// //             <div className="mt-10 lg:mt-12 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
// //               {!isEditing ? (
// //                 <button
// //                   onClick={handleEdit}
// //                   disabled={updateLoading}
// //                   className={`w-full sm:w-auto px-8 lg:px-10 py-3 lg:py-4 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors text-base lg:text-lg ${
// //                     updateLoading ? 'opacity-50 cursor-not-allowed' : ''
// //                   }`}
// //                 >
// //                   Edit
// //                 </button>
// //               ) : (
// //                 <>
// //                   <button
// //                     onClick={handleCancel}
// //                     disabled={updateLoading}
// //                     className={`w-full sm:w-auto px-8 lg:px-10 py-3 lg:py-4 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors text-base lg:text-lg ${
// //                       updateLoading ? 'opacity-50 cursor-not-allowed' : ''
// //                     }`}
// //                   >
// //                     Cancel
// //                   </button>
// //                   <button
// //                     onClick={handleSave}
// //                     disabled={updateLoading}
// //                     className={`w-full sm:w-auto px-8 lg:px-10 py-3 lg:py-4 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors text-base lg:text-lg ${
// //                       updateLoading ? 'opacity-50 cursor-not-allowed' : ''
// //                     }`}
// //                   >
// //                     {updateLoading ? 'Saving...' : 'Save Changes'}
// //                   </button>
// //                 </>
// //               )}
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Profilepage;