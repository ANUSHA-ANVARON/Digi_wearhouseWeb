
import React from 'react';
import FormInput from '../UploadSectionComponents/FormInput';
import FormSelect from '../UploadSectionComponents/FormSelect';
import ProductTypeToggle from '../UploadSectionComponents/SizeandPricingComps/ProductTypeToggle';
import { 
  // DRESS_TYPES, 
  READY_TO_WEAR_DRESS_TYPES,
  UNSTITCHED_DRESS_TYPES,
  MATERIAL_TYPES, 
  DESIGN_TYPES, 
  CATEGORIES 
} from '../../constants/productConstants';

const GeneralTab = ({ formData, onChange,errors,clearError }) => {
  if (!formData) return <div>Loading...</div>;

  // Extract parent categories (keys of DRESS_TYPES)
// Extract parent categories (keys of DRESS_TYPES) as simple array
  // const categoryOptions = Object.keys(DRESS_TYPES);

  // // Get subcategories based on selected category as simple array
  // const subCategoryOptions = formData.dressCategory
  //   ? DRESS_TYPES[formData.dressCategory]
  //   : [];


  const DRESS_TYPES = formData.productType === "Unstitched" 
    ? UNSTITCHED_DRESS_TYPES 
    : READY_TO_WEAR_DRESS_TYPES;

  // Extract parent categories (keys of DRESS_TYPES) as simple array
  const categoryOptions = Object.keys(DRESS_TYPES);

  // Get subcategories based on selected category as simple array
  const subCategoryOptions = formData.dressCategory
    ? DRESS_TYPES[formData.dressCategory]
    : [];




  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-6">
          Product Information
        </h3>
        <div className="space-y-6">
          <FormInput
            label="Product Title"
            value={formData.title || ""}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="Elegant Women in Pink Floral Traditional Indian Outfit..."
          />
          
          <FormInput
            label="Product Description"
            type="textarea"
            value={formData.description || ""}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="A stylish, beautiful pink floral lehenga..."
          />
          
          <FormSelect
            label="Category"
            value={formData.category || ""}
            onChange={(e) => onChange("category", e.target.value)}
            options={CATEGORIES}
            placeholder="Choose Category"
          />
          
          {/* <ProductTypeToggle
            value={formData.productType || "Ready to Wear"}
            onChange={(value) => onChange("productType", value)}
          /> */}
          
          {/* <FormSelect
            label="Dress Type"
            value={formData.dressType || ""}
            onChange={(e) => onChange("dressType", e.target.value)}
            options={DRESS_TYPES}
            placeholder="Select Dress"
          /> */}
         {/* Dress Category Dropdown */}
          {/* <FormSelect
            label="Dress Category"
            value={formData.dressCategory || ""}
            onChange={(e) => {
              onChange("dressCategory", e.target.value);
              onChange("dressType", ""); // Reset subcategory when category changes
            }}
            options={categoryOptions}
            placeholder="Select Dress Category"
          /> */}

          {/* Dress Type Dropdown (sub-category) */}
          {/* <FormSelect
            label="Dress Type"
            value={formData.dressType || ""}
            onChange={(e) => onChange("dressType", e.target.value)}
            options={subCategoryOptions}
            placeholder={
              formData.dressCategory
                ? "Select Sub Category"
                : "Choose category first"
            }
            disabled={!formData.dressCategory}
          /> */}

            <ProductTypeToggle
            value={formData.productType || "Ready to Wear"}
            onChange={(value) => {
              onChange("productType", value);
              // Reset dress category and type when product type changes
              onChange("dressCategory", "");
              onChange("dressType", "");
            }}
          />
          
          {/* Dress Category Dropdown */}
          <FormSelect
            label="Dress Category"
            value={formData.dressCategory || ""}
            onChange={(e) => {
              onChange("dressCategory", e.target.value);
              onChange("dressType", ""); // Reset subcategory when category changes
            }}
            options={categoryOptions}
            placeholder="Select Dress Category"
          />

          {/* Dress Type Dropdown (sub-category) */}
          <FormSelect
            label="Dress Type"
            value={formData.dressType || ""}
            onChange={(e) => onChange("dressType", e.target.value)}
            options={subCategoryOptions}
            placeholder={
              formData.dressCategory
                ? "Select Sub Category"
                : "Choose category first"
            }
            disabled={!formData.dressCategory}
          />
          
          
          <FormSelect
            label="Fabric"
            value={formData.fabric || ""}
            onChange={(e) => onChange("fabric", e.target.value)}
            options={MATERIAL_TYPES}
            placeholder="Select Fabric"
          />
          
          <FormSelect
            label="Craft"
            value={formData.craft || ""}
            onChange={(e) => onChange("craft", e.target.value)}
            options={DESIGN_TYPES}
            placeholder="Select Craft"
          />
        </div>
      </div>

      <div>
  <label className="block text-start text-sm md:text-base font-medium text-gray-700 mb-2">
    Is this product premium?
  </label>
  <div className="flex space-x-6">
    <label className="inline-flex items-center">
      <input
        type="radio"
        name="premium"
        value="yes"
        checked={formData.premium === true}
        onChange={() =>{ onChange("premium", true)
           clearError("premium");
        }
        }
        className="form-radio text-blue-600"
      />
      <span className="ml-2">Yes</span>
    </label>
    <label className="inline-flex items-center">
      <input
        type="radio"
        name="premium"
        value="no"
        checked={formData.premium === false}
       onChange={() => {
            onChange("premium", false);
            clearError("premium"); 
          }}
        className="form-radio text-blue-600"
      />
      <span className="ml-2">No</span>
    </label>
  </div>

  {/* Show inline error */}
  {errors?.premium && (
      <p className="text-red-500  text-start text-sm mt-2">{errors.premium}</p>
    )}
</div>


    </div>
  );
};

export default GeneralTab;












