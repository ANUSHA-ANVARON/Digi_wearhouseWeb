// import React, { useState, useEffect } from 'react';
// import { ArrowLeft } from 'lucide-react';
// import Right_mark from "../../../assets/right_mark.png"
// import Frame from "../../../assets/Frame.png"
// // Mock data
// const mockCommissionData = {
//   totalCommissionRate: 10,
//   commissionEarned: 43457,
//   productCommission: 4567,
//   vendorCommission: 4567,
//   companyCommission: 4567,
//   defaultCommissionRate: 10,
//   products: [
//     {
//       id: 1,
//       name: "silk fashion top",
//       image: Frame,
//       commission: 2325,
//       commissionRate: "5% per sale"
//     },
//     {
//       id: 2,
//       name: "Kids suits",
//       image: Frame,
//       commission: 3224,
//       commissionRate: "8% per sale"
//     },
//     {
//       id: 3,
//       name: "Red saree",
//       image: Frame,
//       commission: 1222.50,
//       commissionRate: "6% per sale"
//     },
//   ]
// };

// // Simulated API
// const fetchCommissionData = async () => {
//   return new Promise((resolve) => {
//     setTimeout(() => resolve(mockCommissionData), 500);
//   });
// };

// const updateDefaultCommission = async (newRate) => {
//   return new Promise((resolve) => {
//     setTimeout(() => resolve({ success: true, newRate }), 300);
//   });
// };

// const CommissionPage = () => {
//   const [commissionData, setCommissionData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showDefaultCommission, setShowDefaultCommission] = useState(false);
//   const [showConfirmModal, setShowConfirmModal] = useState(false);
//   const [showSuccessModal, setShowSuccessModal] = useState(false);

//   useEffect(() => {
//     loadCommissionData();
//   }, []);

//   const loadCommissionData = async () => {
//     setLoading(true);
//     try {
//       const data = await fetchCommissionData();
//       setCommissionData(data);
//     } catch (error) {
//       console.error('Failed to load commission data:', error);
//       setCommissionData(mockCommissionData);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveChanges = () => {
//     setShowConfirmModal(true); // Open confirmation modal
//   };

//   const handleConfirmUpdate = async () => {
//     try {
//       await updateDefaultCommission(commissionData.defaultCommissionRate);
//       setShowConfirmModal(false);
//       setShowSuccessModal(true);
//       setTimeout(() => setShowSuccessModal(false), 2000); // Auto-close success modal
//     } catch (error) {
//       console.error("Failed to update commission rate");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-lg">Loading...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="p-4 max-w-7xl mx-auto">
//         {/* Back Button and Title */}
//         <div className="flex items-center mb-6">
//           <ArrowLeft className="w-5 h-5 mr-2 text-gray-600" />
//           <h1 className="text-lg font-semibold text-gray-800">Total Revenue</h1>
//         </div>

//         {/* Top Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//           <div className="bg-slate-700 rounded-lg p-6 text-white">
//             <h2 className="text-sm font-medium mb-2">Total Commission Rate</h2>
//             <div className="text-4xl font-bold">{commissionData.totalCommissionRate}%</div>
//           </div>
//           <div className="bg-white rounded-lg p-6 border border-gray-200">
//             <h2 className="text-sm font-medium text-gray-600 mb-2">Commission Earned</h2>
//             <div className="text-4xl font-bold text-gray-800">
//               ₹{commissionData.commissionEarned.toLocaleString()}
//             </div>
//           </div>
//         </div>

//         {/* Breakdown */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//           <div className="bg-white rounded-lg p-6 border border-gray-200">
//             <h3 className="text-sm font-medium text-gray-600 mb-2">Product commission</h3>
//             <div className="text-2xl font-bold text-gray-800">₹{commissionData.productCommission.toLocaleString()}</div>
//           </div>
//           <div className="bg-white rounded-lg p-6 border border-gray-200">
//             <h3 className="text-sm font-medium text-gray-600 mb-2">Vendor Commission</h3>
//             <div className="text-2xl font-bold text-gray-800">₹{commissionData.vendorCommission.toLocaleString()}</div>
//           </div>
//           <div className="bg-white rounded-lg p-6 border border-gray-200">
//             <h3 className="text-sm font-medium text-gray-600 mb-2">Company Commission</h3>
//             <div className="text-2xl font-bold text-gray-800">₹{commissionData.companyCommission.toLocaleString()}</div>
//           </div>
//         </div>

//         {/* Default Commission */}
//         <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
//           <div className="flex items-center justify-between mb-4">
//             <div>
//               <h3 className="text-lg font-semibold text-gray-800">Default Commission</h3>
//               <p className="text-sm text-gray-600">Set Default Commission Rate</p>
//             </div>
//             <button
//               onClick={() => setShowDefaultCommission(!showDefaultCommission)}
//               className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors"
//             >
//               Save Changes
//             </button>
//           </div>

//           {showDefaultCommission && (
//             <div className="border-t pt-4">
//               <p className="text-sm text-gray-600 mb-3">
//                 This rate will be applied to all new products you list. You can adjust the commission rate for individual products later.
//               </p>
//               <input
//                 type="number"
//                 value={commissionData.defaultCommissionRate}
//                 onChange={(e) =>
//                   setCommissionData({
//                     ...commissionData,
//                     defaultCommissionRate: parseFloat(e.target.value) || 0,
//                   })
//                 }
//                 className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <span className="ml-2 text-sm text-gray-600">%</span>
//               <button
//                 onClick={handleSaveChanges}
//                 className="ml-4 bg-green-500 text-white px-4 py-2 rounded-md text-sm hover:bg-green-600 transition-colors"
//               >
//                 Update Rate
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Commission by Product */}
//         <div>
//           <h2 className="text-lg font-semibold text-[#800000] mb-4">Commission by Product</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {commissionData.products.map((product) => (
//               <div key={product.id} className="bg-white rounded-lg p-4 border border-gray-200">
//                 <div className="flex items-center space-x-3">
//                   {/* <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-md flex-shrink-0 flex items-center justify-center">
//                     <div className="w-8 h-8 bg-white rounded-sm opacity-80"></div>
//                   </div> */}
//                   <div>
//                     <img src={product.image} alt="" />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <h4 className="font-medium text-gray-800 text-sm">{product.name}</h4>
//                     <p className="text-xs text-gray-500">{product.commissionRate}</p>
//                   </div>
//                   <div className="text-right">
//                     <div className="font-bold text-gray-800">₹{product.commission}</div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Confirmation Modal */}
//       {showConfirmModal && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-md z-50">
//           <div className="bg-white rounded-lg p-6 w-96 text-center shadow-lg">
//             <h2 className="text-xl font-bold mb-4">Confirm Commission Changes</h2>
//             <p className="text-gray-600 mb-6">
//               You are about to update your default commission rate to {commissionData.defaultCommissionRate}%.
//               This will affect all new product listings. Are you sure you want to proceed?
//             </p>
//             <div className="flex justify-between">
//               <button
//                 onClick={() => setShowConfirmModal(false)}
//                 className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleConfirmUpdate}
//                 className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
//               >
//                 Confirm
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Success Modal */}
//       {showSuccessModal && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-md z-50">
//           <div className="bg-white rounded-lg p-8 w-96 text-center shadow-lg">
//            <div className='flex items-center justify-center'><img src={Right_mark} className=' w-20 h-20' alt="rightmark"/></div>
//             <h2 className="text-lg font-semibold text-gray-800">
//               Your Commission Rate has been changed
//             </h2>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CommissionPage;
