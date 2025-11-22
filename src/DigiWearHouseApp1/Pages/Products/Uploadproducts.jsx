// components/products/upload/UploadProducts.jsx
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useApp } from "../../context/Context";
import AddProductForm from "../../Components/UploadProducts/AddProductForm";
import EmptyProductsState from "../../Components/UploadProducts/EmptyProductsState";

const UploadProducts = () => {
  const { productData } = useApp();
  const location = useLocation();

  // 1. Extract the product to edit from navigation state
  const productToEdit = location.state?.editProduct;

  // Check if user is returning from navigation, was in add flow, OR IS EDITING
  const [showAddForm, setShowAddForm] = useState(() => {
    return (
      location.state?.inAddFlow === true ||
      !!productToEdit || // Force form open if editing
      (productData && Object.keys(productData).length > 0)
    );
  });

  const [hasProducts] = useState(false);

  const handleAddProduct = () => setShowAddForm(true);
  const handleBackToProducts = () => setShowAddForm(false);

  // Show the add product form
  if (showAddForm) {
    return (
      <AddProductForm
        onBack={handleBackToProducts}
        // 2. PASS THE DATA DOWN HERE
        initialData={productToEdit} 
      />
    );
  }

  // Show empty state when no products exist
  if (!hasProducts) {
    return <EmptyProductsState onAddProduct={handleAddProduct} />;
  }

  return <div>Products List View - Coming Soon</div>;
};

export default UploadProducts;

//previous
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useApp } from "../../context/Context";
// import { Link , useLocation } from "react-router-dom";

// // Model - Data layer
// const ProductDataModel = {
//   // Static data - replace with API calls later
//   getProducts: () => [],

//   getDressTypes: () => [
//     "Traditional Lehenga",
//     "Designer Saree",
//     "Cotton Kurti",
//     "Silk Dress",
//     "Party Wear",
//     "Casual Wear",
//     "Wedding Wear",
//     "Formal Wear"
//   ],

//   getMaterialTypes: () => [
//     "Cotton",
//     "Silk",
//     "Silk Cotton",
//     "Georgette",
//     "Chiffon",
//     "Net",
//     "Velvet",
//     "Crepe",
//     "Khadi",
//     "Tissue",
//     "Pure Linen",
//     "Kota",
//     "Viscose",
//     "Mulmul",
//     "Organza",
//   ],

//   getDesignTypes: () => [
//     "Embroidered",
//     "Ajrakh",
//     "Block Printed",
//     "Batik",
//     "Sanganeri",
//     "Woven",
//     "Printed",
//     "Plain",
//     "Sequined",
//     "Beaded",
//     "Mirror Work",
//     "Dabu",
//     "Shibori",
//     "Mukasish",
//     "Brocade",
//     "Cutout",
//     "Ikat",
//     "Chikankariul"
//   ],

//   getColors: () => [
//     { name: "Red", value: "#ef4444", code: "red" },
//     { name: "Pink", value: "#ec4899", code: "pink" },
//     { name: "Blue", value: "#3b82f6", code: "blue" },
//     { name: "Green", value: "#10b981", code: "green" },
//     { name: "Orange", value: "#f97316", code: "orange" },
//     { name: "Purple", value: "#8b5cf6", code: "purple" },
//     { name: "Black", value: "#1f2937", code: "black" },
//   ],

//   getSizes: () => ["XS", "S", "M", "L", "XL", "XXL"],

//  getFormData: () => ({
//     title: "",
//     description: "",
//     productType: "",
//     category: "",
//     dressType: "",
//     fabric: "",
//     craft: "",
//     price: "",
//     selectedSizes: [],
//     selectedColors: [],
//     units: {},
//     imageUrls: [],
//   }),
// };

// // View Components
// const BackButton = ({ onClick }) => (
//   <button
//     onClick={onClick}
//     className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors p-2"
//   >
//     <svg
//       className="w-5 h-5"
//       fill="none"
//       stroke="currentColor"
//       viewBox="0 0 24 24"
//     >
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         strokeWidth={2}
//         d="M15 19l-7-7 7-7"
//       />
//     </svg>
//   </button>
// );

// const EmptyProductsState = ({ onAddProduct }) => (
//   <div className="min-h-screen bg-gray-50 flex flex-col">
//     {/* Header */}
//     <div className="flex items-center p-4 md:p-6">
//       <BackButton onClick={() => window.history.back()} />
//     </div>

//     {/* Main Content */}
//     <div className="flex-1 flex flex-col items-center justify-center px-4 pb-20">
//       <div className="text-center max-w-md">
//         <h1 className="text-2xl md:text-3xl font-bold text-[#800000] mb-4">
//           Your Products
//         </h1>
//         <p className="text-gray-700 text-base md:text-lg mb-12">
//           Looks like you don't have any products yet!
//         </p>

//         {/* Empty Box Illustration */}
//         <div className="mb-12 flex justify-center">
//           <div className="relative">
//             {/* Box */}
//             <div className="w-32 h-24 md:w-40 md:h-28 bg-gray-300 rounded-lg shadow-lg relative">
//               {/* Box flaps */}
//               <div className="absolute -top-2 left-2 right-2 h-4 bg-gray-400 rounded-t-lg"></div>
//               <div className="absolute -top-1 left-4 right-4 h-3 bg-gray-200 rounded-t-lg"></div>
//               {/* Box details */}
//               <div className="absolute bottom-2 right-2 w-3 h-3 bg-blue-400 rounded"></div>
//             </div>
//             {/* Shadow */}
//             <div className="absolute -bottom-2 left-2 right-2 h-2 bg-gray-200 rounded-full opacity-50"></div>
//           </div>
//         </div>

//         <button
//           onClick={onAddProduct}
//           className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-medium text-base md:text-lg transition-colors flex items-center space-x-3 mx-auto"
//         >
//           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//             <path
//               fillRule="evenodd"
//               d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
//               clipRule="evenodd"
//             />
//           </svg>
//           <span>Add Product</span>
//         </button>
//       </div>
//     </div>
//   </div>
// );

// const TabNavigation = ({ activeTab, onTabChange, tabs }) => (
//   <div className="border-b border-gray-200 mb-6 md:mb-8">
//     <nav className="flex space-x-8 overflow-x-auto">
//       {tabs.map((tab) => (
//         <button
//           key={tab.id}
//           onClick={() => onTabChange(tab.id)}
//           className={`py-3 px-1 border-b-2 font-medium text-sm md:text-base whitespace-nowrap transition-colors ${
//             activeTab === tab.id
//               ? "border-blue-500 text-blue-600"
//               : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//           }`}
//         >
//           {tab.label}
//         </button>
//       ))}
//     </nav>

//   </div>
// );

// const FormInput = ({
//   label,
//   type = "text",
//   value,
//   onChange,
//   placeholder,
//   className = "",
// }) => (
//   <div className={`space-y-2 ${className}`}>
//     <label className="block text-sm md:text-base font-medium text-gray-700">
//       {label}
//     </label>
//     {type === "textarea" ? (
//       <textarea
//         value={value}
//         onChange={onChange}
//         placeholder={placeholder}
//         rows="4"
//         className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
//       />
//     ) : (
//       <input
//         type={type}
//         value={value}
//         onChange={onChange}
//         placeholder={placeholder}
//         className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
//       />
//     )}
//   </div>
// );

// const FormSelect = ({ label, value, onChange, options, placeholder }) => (
//   <div className="space-y-2">
//     <label className="block text-sm md:text-base font-medium text-gray-700">
//       {label}
//     </label>
//     <select
//       value={value}
//       onChange={onChange}
//       className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none bg-white"
//     >
//       <option  value="">{placeholder}</option>
//       {options.map((option, index) => (
//         <option key={index}  value={option}>
//           {option}
//         </option>
//       ))}
//     </select>
//   </div>
// );

// const ProductTypeToggle = ({ value, onChange }) => (
//   <div className="space-y-2">
//     <label className="block text-sm md:text-base font-medium text-gray-700">
//       Product Type
//     </label>
//     <div className="flex space-x-4">
//       <button
//         type="button"
//         onClick={() => onChange("Ready to Wear")}
//         className={`px-6 py-3 rounded-lg font-medium transition-colors ${
//           value === "Ready to Wear"
//             ? "bg-blue-500 text-white"
//             : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//         }`}
//       >
//         Ready to Wear
//       </button>
//       <button
//         type="button"
//         onClick={() => onChange("Unstitched")}
//         className={`px-6 py-3 rounded-lg font-medium transition-colors ${
//           value === "Unstitched"
//             ? "bg-blue-500 text-white"
//             : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//         }`}
//       >
//         Unstitched
//       </button>
//     </div>
//   </div>
// );

// const GeneralTab = ({
//   formData,
//   onChange,
//   dressTypes,
//   materialTypes,
//   designTypes,
// }) => {
//   if (!formData) return <div>Loading...</div>;

//   return (
//     <div className="space-y-6 md:space-y-8">
//       <div>
//         <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-6">
//           Product Information
//         </h3>
//         <div className="space-y-6">
//           <FormInput
//             label="Product Title"
//             value={formData.title || ""}
//             onChange={(e) => onChange("title", e.target.value)}
//             placeholder="Elegant Women in Pink Floral Traditional Indian Outfit..."
//           />
//           <FormInput
//             label="Product Description"
//             type="textarea"
//             value={formData.description || ""}
//             onChange={(e) => onChange("description", e.target.value)}
//             placeholder="A stylish, beautiful pink floral lehenga..."
//           />
//           <FormSelect
//             label="Category"
//             value={formData.category || ""}
//             onChange={(e) => onChange("category", e.target.value)}
//             options={["WOMEN", "MEN", "KIDS"]} // Uppercase to match B2C
//             placeholder="Choose Category"
//           />
//           <ProductTypeToggle
//             value={formData.productType || "Ready to Wear"}
//             onChange={(value) => onChange("productType", value)}
//           />
//           <FormSelect
//             label="Dress Type"
//             value={formData.dressType || ""}
//             onChange={(e) => onChange("dressType", e.target.value)}
//             options={dressTypes}
//             placeholder="Select Dress"
//           />
//           <FormSelect
//             label="Fabric"
//             value={formData.fabric || ""}
//             onChange={(e) => onChange("fabric", e.target.value)}
//             options={materialTypes}
//             placeholder="Select Fabric"
//           />
//           <FormSelect
//             label="Craft"
//             value={formData.craft || ""}
//             onChange={(e) => onChange("craft", e.target.value)}
//             options={designTypes}
//             placeholder="Select Craft"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// const SizeSelector = ({ sizes, selectedSizes, onChange }) => (
//   <div className="space-y-3">
//     <div className="flex items-center justify-between">
//       <label className="text-sm md:text-base font-medium text-gray-700">
//         Select Sizes
//       </label>
//       <Link to={"/size-chart"}>
//         <button className="text-[#800000] text-sm hover:text-blue-600" >
//         Size chart ?
//       </button>
//       </Link>

//     </div>
//     <div className="flex flex-wrap gap-3">
//       {sizes.map((size) => (
//         <button
//           key={size}
//           type="button"
//           onClick={() => {
//             if (selectedSizes.includes(size)) {
//               onChange(selectedSizes.filter((s) => s !== size));
//             } else {
//               onChange([...selectedSizes, size]);
//             }
//           }}
//           className={`w-12 h-12 rounded-lg font-medium transition-colors ${
//             selectedSizes.includes(size)
//               ? "bg-blue-500 text-white"
//               : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//           }`}
//         >
//           {size}
//         </button>
//       ))}
//     </div>
//     <p className="text-xs text-gray-500">You can select multiple sizes</p>
//   </div>
// );

// // Updated ColorSelector component that properly stores selections
// const ColorSelector = ({ selectedColors, onChange }) => {
//   const [selectedColor, setSelectedColor] = useState(null);
//   const [selectedShade, setSelectedShade] = useState(null);

//   // Simplified color structure
//   const colors = [
//     {
//       code: "red",
//       name: "Red",
//       value: "#FF0000",
//       shades: [
//         "#8B0000", "#B22222", "#DC143C", "#FF0000",
//         "#FF4500", "#FF6347", "#FF7F7F", "#FFB6B6"
//       ],
//     },
//     {
//       code: "pink",
//       name: "Pink",
//       value: "#FF69B4",
//       shades: [
//         "#C71585", "#DB7093", "#FF1493", "#FF69B4",
//         "#FFB6C1", "#FFC0CB", "#FFD6E7"
//       ],
//     },
//     {
//       code: "blue",
//       name: "Blue",
//       value: "#0000FF",
//       shades: [
//         "#00008B", "#0000CD", "#1E90FF", "#4169E1",
//         "#4682B4", "#87CEEB", "#B0E0E6"
//       ],
//     },
//     {
//       code: "green",
//       name: "Green",
//       value: "#008000",
//       shades: [
//         "#006400", "#228B22", "#008000", "#32CD32",
//         "#00FF7F", "#90EE90", "#C1E1C1"
//       ],
//     },
//     {
//       code: "orange",
//       name: "Orange",
//       value: "#FFA500",
//       shades: [
//         "#FF8C00", "#FF7F50", "#FF6347", "#FFA500",
//         "#FFA07A", "#FFDAB9", "#FFE4B5", "#FFF5E1"
//       ],
//     },
//     {
//       code: "purple",
//       name: "Purple",
//       value: "#800080",
//       shades: [
//         "#4B0082", "#6A0DAD", "#800080", "#8A2BE2",
//         "#9370DB", "#BA55D3", "#D8BFD8", "#E6E6FA"
//       ],
//     },
//     {
//       code: "black",
//       name: "Black",
//       value: "#000000",
//       shades: [
//         "#000000", "#2F2F2F", "#555555", "#808080",
//         "#A9A9A9", "#C0C0C0", "#E0E0E0", "#F5F5F5"
//       ],
//     },
//   ];

//   // Handle shade selection - store as string
//   const handleShadeSelection = (shade, colorName) => {
//     setSelectedShade(shade);
//     // Store as simple string array
//     onChange([`${colorName.toLowerCase()}_${shade}`]);
//   };

//   // Handle base color selection - store as string
//   const handleBaseColorSelection = (color) => {
//     setSelectedShade(color.value);
//     // Store as simple string array
//     onChange([color.code]);
//   };

//   // Check if a shade is currently selected
//   const isShadeSelected = (shadeValue, colorName) => {
//     const shadeCode = `${colorName.toLowerCase()}_${shadeValue}`;
//     return selectedColors.includes(shadeCode);
//   };

//   // Check if a base color is selected
//   const isBaseColorSelected = (colorCode) => {
//     return selectedColors.includes(colorCode);
//   };

//   // Get selected color display info
//   const getSelectedColorInfo = () => {
//     if (!selectedColors || selectedColors.length === 0) return null;

//     const selected = selectedColors[0];

//     // Check if it's a base color
//     const baseColor = colors.find(c => c.code === selected);
//     if (baseColor) {
//       return { name: baseColor.name, value: baseColor.value };
//     }

//     // Check if it's a shade
//     for (const color of colors) {
//       const shadeIndex = color.shades.findIndex(shade =>
//         selected === `${color.name.toLowerCase()}_${shade}`
//       );
//       if (shadeIndex !== -1) {
//         return {
//           name: `${color.name} Shade`,
//           value: color.shades[shadeIndex]
//         };
//       }
//     }

//     return null;
//   };

//   const selectedColorInfo = getSelectedColorInfo();

//   return (
//     <div className="space-y-6">
//       <h3 className="text-lg md:text-xl font-semibold text-gray-900 text-center">
//         Select Color
//       </h3>

//       {/* Main colors */}
//       <div className="grid grid-cols-7 gap-3 max-w-md mx-auto">
//         {colors.map((color) => (
//           <button
//             key={color.code}
//             type="button"
//             onClick={() => {
//               setSelectedColor(color);
//               setSelectedShade(null);
//             }}
//             onDoubleClick={() => handleBaseColorSelection(color)}
//             className="relative group border border-gray-300 rounded-lg p-2 shadow-sm hover:shadow-md transition-all"
//           >
//             <div
//               className={`w-8 h-8 rounded-full border-2 transition-all ${
//                 selectedColor?.code === color.code
//                   ? "border-gray-800 scale-110"
//                   : isBaseColorSelected(color.code)
//                   ? "border-blue-500 scale-110"
//                   : "border-gray-300 hover:scale-105"
//               }`}
//               style={{ backgroundColor: color.value }}
//             />
//             <div className="text-xs text-center mt-1 text-gray-600 pe-2">
//               {color.name}
//             </div>
//           </button>
//         ))}
//       </div>

//       <div className="text-center text-xs text-gray-500">
//         Click to see shades • Double-click to select base color
//       </div>

//       {/* Palette */}
//       {selectedColor && (
//         <div className="mt-4">
//           <h4 className="text-sm font-medium text-gray-700 mb-2 text-center">
//             Choose a shade of {selectedColor.name}
//           </h4>
//           <div className="flex justify-center flex-wrap gap-2">
//             {selectedColor.shades.map((shade, idx) => (
//               <button
//                 key={idx}
//                 type="button"
//                 onClick={() => handleShadeSelection(shade, selectedColor.name)}
//                 className={`w-8 h-8 rounded-full border-2 transition-all ${
//                   isShadeSelected(shade, selectedColor.name)
//                     ? "border-gray-800 scale-110 ring-2 ring-blue-400"
//                     : "border-gray-300 hover:scale-105"
//                 }`}
//                 style={{ backgroundColor: shade }}
//                 title={shade}
//               />
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Selected color preview */}
//       {selectedColorInfo && (
//         <div className="text-center mt-4">
//           <p className="text-sm text-gray-700 mb-2">Selected Color:</p>
//           <div className="flex justify-center">
//             <div className="flex flex-col items-center">
//               <div
//                 className="w-12 h-12 rounded-full border-2 border-gray-800 shadow-lg"
//                 style={{ backgroundColor: selectedColorInfo.value }}
//               />
//               <div className="text-xs text-center mt-2 text-gray-700 font-medium max-w-24">
//                 {selectedColorInfo.name}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Updated UnitsSection with simplified data handling
// const UnitsSection = ({ selectedSizes, selectedColors, units, onChange }) => {
//   const [errorMessages, setErrorMessages] = useState({});
//   const safeSizes = Array.isArray(selectedSizes) ? selectedSizes : [];
//   const safeColors = Array.isArray(selectedColors) ? selectedColors : [];

//   const getColorDisplay = (colorCode) => {
//     const colorMap = {
//       red: { name: 'Red', value: '#FF0000' },
//       pink: { name: 'Pink', value: '#FF69B4' },
//       blue: { name: 'Blue', value: '#0000FF' },
//       green: { name: 'Green', value: '#008000' },
//       orange: { name: 'Orange', value: '#FFA500' },
//       purple: { name: 'Purple', value: '#800080' },
//       black: { name: 'Black', value: '#000000' }
//     };

//     if (colorMap[colorCode]) return colorMap[colorCode];
//     if (colorCode.includes('_')) {
//       const [baseColorName, hexValue] = colorCode.split('_');
//       if (colorMap[baseColorName]) {
//         return { name: `${colorMap[baseColorName].name} Shade`, value: hexValue.startsWith('#') ? hexValue : `#${hexValue}` };
//       }
//     }
//     return { name: colorCode, value: '#808080' };
//   };

//   const handleUnitChange = (size, colorCode, value) => {
//     const key = `${size}-${colorCode}`;
//     if (value === '' || /^[0-9]*$/.test(value)) {
//       const updatedUnits = {
//         ...units,
//         [colorCode]: {
//           ...(units[colorCode] || {}),
//           [size]: value
//         }
//       };
//       onChange(updatedUnits);
//       setErrorMessages((prev) => ({ ...prev, [key]: null }));
//     } else {
//       setErrorMessages((prev) => ({
//         ...prev,
//         [key]: 'Please enter a valid number'
//       }));
//     }
//   };

//   if (safeSizes.length === 0 || safeColors.length === 0) {
//     return (
//       <div className="space-y-4">
//         <label className="text-sm md:text-base font-medium text-gray-700">Units</label>
//         <p className="text-sm text-gray-500">
//           Please select sizes and colors to input units.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       <label className="text-sm md:text-base font-medium text-gray-700">
//         Units (Stock for each size and color combination)
//       </label>
//       <div className="space-y-4">
//         <div className="grid grid-cols-3 gap-4 font-medium text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
//           <div>Size</div>
//           <div>Color</div>
//           <div>Units</div>
//         </div>
//         <div className="space-y-3">
//           {safeColors.map((colorCode) => {
//             const colorDisplay = getColorDisplay(colorCode);
//             return safeSizes.map((size) => {
//               const key = `${size}-${colorCode}`;
//               return (
//                 <div key={key} className="grid grid-cols-3 gap-4 items-center">
//                   <div className="bg-gray-100 rounded-md p-3 text-center text-sm font-medium text-gray-700">
//                     {size}
//                   </div>
//                   <div
//                     className="rounded-md p-3 text-center text-sm font-medium shadow-sm"
//                     style={{
//                       backgroundColor: colorDisplay.value,
//                       color: (colorDisplay.value === '#FFFFFF' || colorDisplay.value === '#F5F5F5' || colorDisplay.value === '#FFFF00') ? '#000000' : '#FFFFFF'
//                     }}
//                   >
//                     {colorDisplay.name}
//                   </div>
//                   <div className="relative">
//                     <input
//                       type="text"
//                       value={units[colorCode]?.[size] || ''}
//                       onChange={(e) => handleUnitChange(size, colorCode, e.target.value)}
//                       placeholder="e.g. 22"
//                       className={`w-full h-12 text-center border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium ${
//                         errorMessages[key] ? 'border-red-500' : 'border-gray-300'
//                       }`}
//                     />
//                     {errorMessages[key] && (
//                       <p className="text-xs text-red-500 mt-1 absolute">
//                         {errorMessages[key]}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               );
//             });
//           })}
//         </div>
//         <div className="mt-4 p-3 bg-blue-50 rounded-lg">
//           <div className="text-sm text-blue-800">
//             <strong>Total combinations:</strong> {safeSizes.length} sizes × {safeColors.length} colors = {safeSizes.length * safeColors.length} variants
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const SizePricingTab = ({ formData, onChange, sizes, colors }) => {
//   const isSaree = formData?.dressType?.toLowerCase().includes("saree");

//   return (
//     <div className="space-y-6 md:space-y-8 max-w-2xl mx-auto">
//       {!isSaree && (
//         <SizeSelector
//           sizes={sizes}
//           selectedSizes={formData.selectedSizes}
//           onChange={(sizes) => onChange("selectedSizes", sizes)}
//         />
//       )}
//       <FormInput
//         label="Price"
//         type="number"
//         value={formData.price}
//         onChange={(e) => onChange("price", e.target.value)}
//         placeholder="Ex. 12,000"
//       />
//       <ColorSelector
//         selectedColors={formData.selectedColors}
//         onChange={(colors) => onChange("selectedColors", colors)}
//       />
//       <UnitsSection
//         selectedSizes={formData.selectedSizes}
//         selectedColors={formData.selectedColors}
//         units={formData.units}
//         onChange={(units) => onChange("units", units)}
//       />
//     </div>
//   );
// };

// const uploadToCloudinary = async (file) => {
//   // Validate file
//   if (!file) {
//     throw new Error("No file provided");
//   }

//   // Check file size (10MB limit)
//   if (file.size > 10 * 1024 * 1024) {
//     throw new Error("File size must be less than 10MB");
//   }

//   // Check file type
//   if (!file.type.startsWith("image/")) {
//     throw new Error("File must be an image");
//   }

//   console.log(
//     "Starting upload for file:",
//     file.name,
//     "Size:",
//     file.size,
//     "bytes"
//   );

//   const data = new FormData();
//   data.append("file", file);
//   data.append("upload_preset", "tryon_unsigned"); // Make sure this is correct
//   data.append("cloud_name", "doiezptnn"); // Make sure this is correct

//   try {
//     const res = await fetch(
//       "https://api.cloudinary.com/v1_1/doiezptnn/image/upload",
//       {
//         method: "POST",
//         body: data,
//       }
//     );

//     const json = await res.json();
//     console.log("Cloudinary response:", json);

//     if (!res.ok) {
//       throw new Error(
//         `Cloudinary API error: ${json.error?.message || "Unknown error"}`
//       );
//     }

//     if (!json.secure_url) {
//       throw new Error("No secure URL returned from Cloudinary");
//     }

//     console.log("Upload successful:", json.secure_url);
//     return json.secure_url;
//   } catch (error) {
//     console.error("Cloudinary upload error:", error);
//     throw new Error(`Upload failed: ${error.message}`);
//   }
// };

// const SuccessNotification = ({ show, onClose, message }) => {
//   if (!show) return null;

//   return (
//     <div className="fixed inset-0 bg-black/20 backdrop-blur-sm  bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 text-center">
//         <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
//           <svg
//             className="w-8 h-8 text-green-600"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M5 13l4 4L19 7"
//             />
//           </svg>
//         </div>
//         <h3 className="text-lg font-semibold text-gray-900 mb-2">Success!</h3>
//         <p className="text-gray-600 mb-6">{message}</p>
//         <button
//           onClick={onClose}
//           className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
//         >
//           OK
//         </button>
//       </div>
//     </div>
//   );
// };

// // Bulk Upload interface component
// const BulkUploadInterface = ({ onBack, onSuccess }) => {
//   const [uploading, setUploading] = useState(false);
//   const [uploadedFiles, setUploadedFiles] = useState([]);
//   const { currentUser } = useApp();

//   const handleFileUpload = async (e) => {
//     const files = Array.from(e.target.files);
//     if (files.length === 0) return;

//     // Validate file types
//     const validTypes = [
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
//       "application/vnd.ms-excel", // .xls
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
//       "application/msword", // .doc
//     ];

//     const invalidFiles = files.filter(
//       (file) => !validTypes.includes(file.type)
//     );
//     if (invalidFiles.length > 0) {
//       alert(
//         "Please upload only Excel (.xlsx, .xls) or Word (.docx, .doc) files."
//       );
//       return;
//     }

//     setUploading(true);
//     try {
//       // Simulate file processing
//       await new Promise((resolve) => setTimeout(resolve, 2000));

//       const newFiles = files.map((file) => ({
//         name: file.name,
//         size: file.size,
//         type: file.type,
//         uploadedAt: new Date().toISOString(),
//       }));

//       setUploadedFiles((prev) => [...prev, ...newFiles]);
//       onSuccess(
//         `Successfully uploaded ${files.length} file(s) for bulk processing.`
//       );
//     } catch (error) {
//       alert(`Upload failed: ${error.message}`);
//     } finally {
//       setUploading(false);
//       e.target.value = "";
//     }
//   };

//   const removeFile = (index) => {
//     setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
//   };

//   const formatFileSize = (bytes) => {
//     if (bytes === 0) return "0 Bytes";
//     const k = 1024;
//     const sizes = ["Bytes", "KB", "MB", "GB"];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
//   };

//   const getFileIcon = (type) => {
//     if (type.includes("sheet") || type.includes("excel")) {
//       return (
//         <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
//           <span className="text-xs font-bold text-green-700">XLS</span>
//         </div>
//       );
//     } else if (type.includes("word")) {
//       return (
//         <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
//           <span className="text-xs font-bold text-blue-700">DOC</span>
//         </div>
//       );
//     }
//     return (
//       <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
//         <svg
//           className="w-4 h-4 text-gray-600"
//           fill="currentColor"
//           viewBox="0 0 20 20"
//         >
//           <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
//         </svg>
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-6 md:space-y-8 max-w-2xl mx-auto">
//       {/* Header with back button */}
//       <div className="flex items-center space-x-4">
//         <button
//           onClick={onBack}
//           className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
//         >
//           <svg
//             className="w-5 h-5"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M15 19l-7-7 7-7"
//             />
//           </svg>
//           <span>Back</span>
//         </button>
//         <h3 className="text-lg md:text-xl font-semibold text-gray-900">
//           Upload File
//         </h3>
//       </div>

//       <p className="text-sm text-gray-600">Add files of your product</p>

//       {/* Upload Area */}
//       <div
//         className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
//           uploading
//             ? "border-gray-200 bg-gray-50"
//             : "border-gray-300 hover:border-blue-400 cursor-pointer"
//         }`}
//         onClick={() =>
//           !uploading && document.getElementById("bulk-file-input").click()
//         }
//       >
//         <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
//           <svg
//             className="w-8 h-8 text-gray-400"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={1.5}
//               d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
//             />
//           </svg>
//         </div>

//         <div className="text-gray-700 font-medium mb-2">
//           {uploading
//             ? "Processing files..."
//             : "Browse and choose the file you want to upload from your computer"}
//         </div>

//         {!uploading && (
//           <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
//             Upload
//           </button>
//         )}
//       </div>

//       {/* Hidden file input */}
//       <input
//         id="bulk-file-input"
//         type="file"
//         multiple
//         accept=".xlsx,.xls,.docx,.doc"
//         onChange={handleFileUpload}
//         className="hidden"
//         disabled={uploading}
//       />

//       {/* Upload Instructions */}
//       <div>
//         <div className="flex items-center justify-between mb-4">
//           <h4 className="text-base md:text-lg font-medium text-gray-900">
//             Upload Instructions
//           </h4>
//           <button className="text-[#800000] text-sm hover:text-blue-600 flex items-center space-x-1">
//             <span>View</span>
//             <svg
//               className="w-4 h-4"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M9 5l7 7-7 7"
//               />
//             </svg>
//           </button>
//         </div>

//         <ul className="space-y-3 text-sm md:text-base text-gray-600">
//           <li className="flex items-start space-x-2">
//             <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
//             <span>Use our template file as the basis for bulk upload</span>
//           </li>
//           <li className="flex items-start space-x-2">
//             <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
//             <span>
//               Supported formats: Excel (.xlsx, .xls) and Word (.docx, .doc)
//             </span>
//           </li>
//           <li className="flex items-start space-x-2">
//             <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
//             <span>Maximum file size: 5MB per </span>
//           </li>
//           <li className="flex items-start space-x-2">
//             <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
//             <span>Ensure all required fields are filled in the template</span>
//           </li>
//           <li className="flex items-start space-x-2">
//             <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
//             <span>Include product images URLs in the designated columns</span>
//           </li>
//           <li className="flex items-start space-x-2">
//             <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
//             <span>Review data before uploading to avoid errors</span>
//           </li>
//         </ul>
//       </div>

//       {/* Uploaded Files */}
//       {uploadedFiles.length > 0 && (
//         <div className="mt-6">
//           <h4 className="text-sm font-medium text-gray-700 mb-3">
//             Uploaded Files ({uploadedFiles.length})
//           </h4>
//           <div className="space-y-3">
//             {uploadedFiles.map((file, index) => (
//               <div
//                 key={index}
//                 className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
//               >
//                 {getFileIcon(file.type)}
//                 <div className="flex-1 min-w-0">
//                   <div className="text-sm font-medium text-gray-900 truncate">
//                     {file.name}
//                   </div>
//                   <div className="text-xs text-gray-500">
//                     {formatFileSize(file.size)} • Uploaded{" "}
//                     {new Date(file.uploadedAt).toLocaleTimeString()}
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => removeFile(index)}
//                   className="text-red-500 hover:text-red-700 p-1"
//                   title="Remove file"
//                 >
//                   <svg
//                     className="w-4 h-4"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M6 18L18 6M6 6l12 12"
//                     />
//                   </svg>
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Bulk Upload Notification Component
// const BulkUploadNotification = ({ show, onClose, onProceed }) => {
//   if (!show) return null;

//   return (
//     <div className="fixed inset-0  bg-black/20 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 relative">
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
//         >
//           <svg
//             className="w-6 h-6"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M6 18L18 6M6 6l12 12"
//             />
//           </svg>
//         </button>

//         <div className="text-center">
//           <h3 className="text-xl font-semibold text-gray-900 mb-4">
//             Please follow the below format to add documents
//           </h3>

//           {/* Document format information */}
//           <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <h4 className="font-semibold text-gray-800 mb-2">
//                   Required Fields:
//                 </h4>
//                 <ul className="text-sm text-gray-600 space-y-1">
//                   <li>• Product Name</li>
//                   <li>• Product Description</li>
//                   <li>• Category</li>
//                   <li>• Price</li>
//                   <li>• Available Sizes</li>
//                   <li>• Colors Available</li>
//                   <li>• Material Type</li>
//                   <li>• Design Type</li>
//                 </ul>
//               </div>
//               <div>
//                 <h4 className="font-semibold text-gray-800 mb-2">
//                   File Requirements:
//                 </h4>
//                 <ul className="text-sm text-gray-600 space-y-1">
//                   <li>• Excel format (.xlsx, .xls)</li>
//                   <li>• Word format (.docx, .doc)</li>
//                   <li>• Maximum file size: 5MB</li>
//                   <li>• Include product image URLs</li>
//                   <li>• Use our template format</li>
//                   <li>• Fill all mandatory fields</li>
//                 </ul>
//               </div>
//             </div>
//           </div>

//           {/* Additional instructions */}
//           <div className="text-left mb-6">
//             <h4 className="font-semibold text-gray-800 mb-3">
//               Important Notes:
//             </h4>
//             <ul className="text-sm text-gray-600 space-y-2">
//               <li className="flex items-start space-x-2">
//                 <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
//                 <span>
//                   Download our template file to ensure proper formatting
//                 </span>
//               </li>
//               <li className="flex items-start space-x-2">
//                 <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
//                 <span>
//                   Each row should represent one product with complete
//                   information
//                 </span>
//               </li>
//               <li className="flex items-start space-x-2">
//                 <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
//                 <span>
//                   Image URLs should be publicly accessible and high quality
//                 </span>
//               </li>
//               <li className="flex items-start space-x-2">
//                 <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
//                 <span>
//                   Review your data before uploading to avoid processing errors
//                 </span>
//               </li>
//             </ul>
//           </div>

//           {/* Action buttons */}
//           <div className="flex justify-center space-x-4">
//             <button
//               onClick={onClose}
//               className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={onProceed}
//               className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
//             >
//               Continue
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Main Upload Tab Component
// const UploadTab = ({ formData, onChange }) => {
//   const [uploading, setUploading] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [uploadMode, setUploadMode] = useState("single");
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [successMessage, setSuccessMessage] = useState("");
//   const [showBulkNotification, setShowBulkNotification] = useState(false);

//   const handleUploadClick = () => setShowModal(true);

//   const handleModalChoice = (choice) => {
//     setShowModal(false);
//     if (choice === "single") {
//       setUploadMode("single");
//       document.getElementById("file-input").click();
//     } else if (choice === "bulk") {
//       setShowBulkNotification(true);
//     }
//   };

//   const handleBulkNotificationProceed = () => {
//     setShowBulkNotification(false);
//     setUploadMode("bulk");
//   };

//   const handleBulkNotificationClose = () => setShowBulkNotification(false);

//   const handleFileUpload = async (e) => {
//     const files = Array.from(e.target.files);
//     if (files.length === 0) return;

//     if (formData.imageUrls.length + files.length > 4) {
//       alert(`You can only upload ${4 - formData.imageUrls.length} more images. Maximum 4 images allowed.`);
//       return;
//     }

//     setUploading(true);
//     try {
//       const uploadedUrls = [];
//       for (const file of files) {
//         const url = await uploadToCloudinary(file);
//         uploadedUrls.push(url);
//       }

//       const newImageUrls = [...formData.imageUrls, ...uploadedUrls];
//       onChange("imageUrls", newImageUrls);
//       setSuccessMessage(`Successfully uploaded ${files.length} image(s)`);
//       setShowSuccess(true);
//     } catch (error) {
//       alert(`Upload failed: ${error.message}. Please try again.`);
//     } finally {
//       setUploading(false);
//       e.target.value = "";
//     }
//   };

//   const removeImage = (index) => {
//     const newImageUrls = formData.imageUrls.filter((_, i) => i !== index);
//     onChange("imageUrls", newImageUrls);
//   };

//   const handleBackToSingle = () => setUploadMode("single");

//   const handleBulkSuccess = (message) => {
//     setSuccessMessage(message);
//     setShowSuccess(true);
//   };

//   if (uploadMode === "bulk") {
//     return (
//       <>
//         <BulkUploadInterface
//           onBack={handleBackToSingle}
//           onSuccess={handleBulkSuccess}
//         />
//         <SuccessNotification
//           show={showSuccess}
//           onClose={() => setShowSuccess(false)}
//           message={successMessage}
//         />
//       </>
//     );
//   }

//   const canUpload = !uploading && formData.imageUrls.length < 4;

//   return (
//     <div className="space-y-6 md:space-y-8 max-w-2xl mx-auto">
//       <div>
//         <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
//           Upload Photos
//         </h3>
//         <p className="text-gray-600 text-sm md:text-base mb-6">
//           Add photos of your product ({formData.imageUrls.length}/4 images)
//         </p>
//         <div
//           className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
//             canUpload ? "border-gray-300 hover:border-blue-400 cursor-pointer" : "border-gray-200 bg-gray-50"
//           }`}
//           onClick={canUpload ? handleUploadClick : undefined}
//         >
//           <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
//             <svg
//               className="w-8 h-8 text-gray-400"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={1.5}
//                 d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
//               />
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={1.5}
//                 d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
//               />
//             </svg>
//           </div>
//           {canUpload ? (
//             <div className="text-gray-700 font-medium hover:text-gray-900">
//               {uploading ? "Uploading..." : "Click to add photos"}
//             </div>
//           ) : (
//             <div className="text-gray-500">
//               {uploading ? "Uploading..." : "Maximum 4 images reached"}
//             </div>
//           )}
//         </div>
//         <input
//           id="file-input"
//           type="file"
//           multiple
//           accept="image/*"
//           onChange={handleFileUpload}
//           className="hidden"
//           disabled={uploading}
//         />
//         <div className="mt-4 text-sm text-gray-500 text-center">
//           <p>• Accepted formats: JPG, PNG, GIF</p>
//           <p>• Maximum file size: 5MB per image</p>
//           <p>• You can select multiple images at once</p>
//         </div>
//         {formData.imageUrls?.length > 0 && (
//           <div className="mt-6">
//             <h4 className="text-sm font-medium text-gray-700 mb-3">
//               Uploaded Images ({formData.imageUrls.length}/4)
//             </h4>
//             <div className="grid grid-cols-2 gap-4">
//               {formData.imageUrls.map((imageUrl, index) => (
//                 <div key={index} className="relative group">
//                   <img
//                     src={imageUrl}
//                     alt={`Product ${index + 1}`}
//                     className="w-full h-32 object-cover rounded-lg border border-gray-200"
//                   />
//                   <button
//                     onClick={() => removeImage(index)}
//                     className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
//                     title="Remove image"
//                   >
//                     ×
//                   </button>
//                   <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
//                     {index + 1}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//       <div>
//         <div className="flex items-center justify-between mb-4">
//           <h4 className="text-base md:text-lg font-medium text-gray-900">
//             Capture Instructions
//           </h4>
//           <button className="text-[#800000] text-sm hover:text-blue-600 flex items-center space-x-1">
//             <span>View</span>
//             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//             </svg>
//           </button>
//         </div>
//         <ul className="space-y-3 text-sm md:text-base text-gray-600">
//           <li className="flex items-start space-x-2">
//             <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
//             <span>Click 'Upload Photo beside the product name.</span>
//           </li>
//           <li className="flex items-start space-x-2">
//             <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
//             <span>Include Image details in the description.</span>
//           </li>
//           <li className="flex items-start space-x-2">
//             <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
//             <span>Set the price before uploading the image</span>
//           </li>
//           <li className="flex items-start space-x-2">
//             <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
//             <span>If multiple images are allowed, specify the number.</span>
//           </li>
//           <li className="flex items-start space-x-2">
//             <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
//             <span>Select the right category for your image</span>
//           </li>
//           <li className="flex items-start space-x-2">
//             <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
//             <span>Choose the brand linked to the product image.</span>
//           </li>
//         </ul>
//       </div>
//       {showModal && (
//         <div className="fixed bg-black/20 backdrop-blur-sm inset-0 bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
//             <button
//               onClick={() => setShowModal(false)}
//               className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
//             >
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//             <div className="text-center">
//               <h3 className="text-lg font-semibold text-gray-900 mb-6">Select one</h3>
//               <div className="grid grid-cols-2 gap-4">
//                 <button
//                   onClick={() => handleModalChoice("single")}
//                   className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
//                 >
//                   <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
//                     <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                     </svg>
//                   </div>
//                   <span className="text-sm font-medium text-gray-700">Add One Product</span>
//                 </button>
//                 <button
//                   onClick={() => handleModalChoice("bulk")}
//                   className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
//                 >
//                   <div className="w-12 h-12 bg-gray-400 rounded-lg flex items-center justify-center mb-3">
//                     <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                     </svg>
//                   </div>
//                   <span className="text-sm font-medium text-gray-700">Add Bulk Products</span>
//                 </button>
//               </div>
//               <div className="mt-6 text-center">
//                 <a href="#" className="text-sm text-[#800000] hover:text-blue-600 flex items-center justify-center space-x-1">
//                   <span>Need help</span>
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </a>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//       <BulkUploadNotification
//         show={showBulkNotification}
//         onClose={handleBulkNotificationClose}
//         onProceed={handleBulkNotificationProceed}
//       />
//       <SuccessNotification
//         show={showSuccess}
//         onClose={() => setShowSuccess(false)}
//         message={successMessage}
//       />
//     </div>
//   );
// };

// const NavigationButtons = ({ onBack, onNext, isLastTab, onSubmit }) => (
//   <div className="flex justify-between pt-6 md:pt-8 border-gray-200">
//     <button
//       onClick={onBack}
//       className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
//     >
//       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//       </svg>
//       <span>Back</span>
//     </button>
//     <button
//       onClick={isLastTab ? onSubmit : onNext}
//       className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
//     >
//       <span>{isLastTab ? "Submit" : "Next"}</span>
//       {!isLastTab && (
//         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//         </svg>
//       )}
//     </button>
//   </div>
// );

// const AddProductForm = ({ onBack }) => {
//   const navigate = useNavigate();
//   const { productData, updateProductData } = useApp();
//   const [activeTab, setActiveTab] = useState("general");
//   // const [formData, setFormData] = useState(productData);
//   const [formData, setFormData] = useState(() => {
//     const defaultData = ProductDataModel.getFormData();
//     return productData ? { ...defaultData, ...productData } : defaultData;
//   });
//   const tabs = [
//     { id: "general", label: "General" },
//     { id: "size-pricing", label: "Size & Pricing" },
//     { id: "upload", label: "Upload" },
//   ];
//   const [myselectedColor, setMyselectedColor] = useState("select color");
//   const dressTypes = ProductDataModel.getDressTypes();
//   const materialTypes = ProductDataModel.getMaterialTypes();
//   const designTypes = ProductDataModel.getDesignTypes();
//   const colors = ProductDataModel.getColors();
//   const sizes = ProductDataModel.getSizes();

//   const handleFormChange = (field, value) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const handleNext = () => {
//     const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
//     if (currentIndex < tabs.length - 1) {
//       setActiveTab(tabs[currentIndex + 1].id);
//     }
//   };

//   const handleBack = () => {
//     const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
//     if (currentIndex > 0) {
//       setActiveTab(tabs[currentIndex - 1].id);
//     } else {
//       onBack();
//     }
//   };

//   const handleSubmit = () => {
//     // Update context with final data
//     updateProductData(formData);
//     console.log("Product data:", formData);

//     // Navigate to tryon preview page
//     navigate("/tryon-preview");
//   };

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case "general":
//         return (
//           <GeneralTab
//             formData={formData}
//             onChange={handleFormChange}
//             dressTypes={dressTypes}
//             materialTypes={materialTypes}
//             designTypes={designTypes}
//           />
//         );
//       case "size-pricing":
//         return (
//           <SizePricingTab
//             formData={formData}
//             onChange={handleFormChange}
//             sizes={sizes}
//             colors={colors}
//             myselectedColor={myselectedColor}
//           />
//         );
//       case "upload":
//         return <UploadTab formData={formData} onChange={handleFormChange} />;
//       default:
//         return null;
//     }
//   };

//   const isLastTab = activeTab === tabs[tabs.length - 1].id;

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200 px-4 md:px-6 lg:px-8 py-4 md:py-6">
//         <div className="max-w-4xl mx-auto">
//           <h1 className="text-xl md:text-2xl font-bold text-gray-900 text-center">
//             Add One Product
//           </h1>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
//         <TabNavigation
//           activeTab={activeTab}
//           onTabChange={setActiveTab}
//           tabs={tabs}
//         />

//         <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
//           {renderTabContent()}

//           <NavigationButtons
//             onBack={handleBack}
//             onNext={handleNext}
//             isLastTab={isLastTab}
//             onSubmit={handleSubmit}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// // Controller Component
// // Controller Component - FIXED VERSION
// const UploadProducts = () => {
//   const { productData } = useApp();
//   const location = useLocation();

//   // Check if user is returning from navigation and was in add product flow
//   const [showAddForm, setShowAddForm] = useState(() => {
//     // If coming back from navigation and there's form data, show the form
//     return location.state?.inAddFlow === true ||
//            (productData && Object.keys(productData).length > 0);
//   });

//   const [hasProducts] = useState(false);

//   const handleAddProduct = () => setShowAddForm(true);
//   const handleBackToProducts = () => setShowAddForm(false);

//   if (showAddForm) {
//     return <AddProductForm onBack={handleBackToProducts} />;
//   }

//   if (!hasProducts) {
//     return <EmptyProductsState onAddProduct={handleAddProduct} />;
//   }

//   return <div>Products List View</div>;
// };

// export default UploadProducts;
