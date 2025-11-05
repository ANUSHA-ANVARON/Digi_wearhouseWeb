import React, { useMemo } from "react";
import FormInput from "../UploadSectionComponents/FormInput";
import FormSelect from "../UploadSectionComponents/FormSelect";
import ProductTypeToggle from "../UploadSectionComponents/SizeandPricingComps/ProductTypeToggle";
import {
  READY_TO_WEAR_DRESS_TYPES,
  UNSTITCHED_DRESS_TYPES,
  MATERIAL_TYPES,
  DESIGN_TYPES,
  CATEGORIES,
} from "../../constants/productConstants";
import { DRESS_SUB_CATEGORIES } from "../../constants/dressSubCat";

/**
 * Helper: normalize an array of strings into [{ value, label }]
 * If already objects with value/label, leave as-is.
 */
const normalizeOptions = (opts) => {
  if (!opts) return [];
  // If it's already an array of objects with value/label, return as-is
  if (Array.isArray(opts) && opts.length > 0 && typeof opts[0] === "object" && ("value" in opts[0] || "label" in opts[0])) {
    return opts.map((o) => (o.value ? o : { value: o.label || JSON.stringify(o), label: o.label || o.value || JSON.stringify(o) }));
  }
  // If it's an array of strings
  if (Array.isArray(opts)) {
    return opts.map((o) => ({ value: o, label: o }));
  }
  // If given as object (like { cat: ['a','b'] }), convert to entries
  return Object.entries(opts).map(([k, v]) => ({ value: k, label: k }));
};

/**
 * Build category/subcategory lookup for DRESS_TYPES which may be array OR object.
 * - If DRESS_TYPES is array: categoryOptions === the array, subcategories unavailable.
 * - If DRESS_TYPES is object: keys are categories, values are arrays of sub-types.
 */
const buildDressTypeData = (dressTypes) => {
  if (!dressTypes) return { categoryOptions: [], getSubOptions: () => [] };

  if (Array.isArray(dressTypes)) {
    return {
      categoryOptions: normalizeOptions(dressTypes),
      getSubOptions: () => [], // no subcategories
    };
  }

  // object form: { "Top Wear": ["Kurta","Shirt"], ... }
  const categories = Object.keys(dressTypes || {});
  const categoryOptions = categories.map((k) => ({ value: k, label: k }));
  const getSubOptions = (categoryKey) =>
    Array.isArray(dressTypes[categoryKey])
      ? normalizeOptions(dressTypes[categoryKey])
      : [];
  return { categoryOptions, getSubOptions };
};

/**
 * Build sub-subcategory lookup from DRESS_SUB_CATEGORIES constant.
 * DRESS_SUB_CATEGORIES expected shape: { "Kurta": ["A","B"], "Saree": [...] }
 */
const getSubSubOptionsForType = (dressType) => {
  if (!dressType || !DRESS_SUB_CATEGORIES) return [];
  const raw = DRESS_SUB_CATEGORIES[dressType] || [];
  return normalizeOptions(raw);
};

const GeneralTab = ({ formData, onChange, errors, clearError }) => {
  if (!formData) return <div>Loading...</div>;

  // tolerant productType detection
  const productType = formData.productType || "Ready to Wear";

  const DRESS_TYPES = productType.toLowerCase().includes("unstit")
    ? UNSTITCHED_DRESS_TYPES
    : READY_TO_WEAR_DRESS_TYPES;

  const { categoryOptions, getSubOptions } = useMemo(
    () => buildDressTypeData(DRESS_TYPES),
    [DRESS_TYPES]
  );

  const subCategoryOptions = useMemo(
    () => (formData.dressCategory ? getSubOptions(formData.dressCategory) : []),
    [formData.dressCategory, getSubOptions]
  );

  // NEW: sub-subcategories based on selected dressType
  const subSubCategoryOptions = useMemo(
    () => (formData.dressType ? getSubSubOptionsForType(formData.dressType) : []),
    [formData.dressType]
  );

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
            options={normalizeOptions(CATEGORIES)}
            placeholder="Choose Category"
          />

          <ProductTypeToggle
            value={productType}
            onChange={(value) => {
              const normalized = (value || "").trim();
              onChange("productType", normalized);
              onChange("dressCategory", ""); // reset
              onChange("dressType", "");
              onChange("dressSubCategory", "");
            }}
          />

          {/* Dress Category (parent) */}
          <FormSelect
            label="Dress Category"
            value={formData.dressCategory || ""}
            onChange={(e) => {
              onChange("dressCategory", e.target.value);
              onChange("dressType", ""); // Reset subcategory when category changes
              onChange("dressSubCategory", ""); // reset deeper level
            }}
            options={categoryOptions}
            placeholder="Select Dress Category"
          />

          {/* Dress Type (sub-category) */}
          <FormSelect
            label="Dress Type"
            value={formData.dressType || ""}
            onChange={(e) => {
              onChange("dressType", e.target.value);
              onChange("dressSubCategory", ""); // reset subcategory
            }}
            options={subCategoryOptions}
            placeholder={
              formData.dressCategory ? "Select Sub Category" : "Choose category first"
            }
            disabled={!formData.dressCategory || subCategoryOptions.length === 0}
          />

          {/* NEW: Dress Sub-Category Dropdown */}
          <FormSelect
            label="Dress Sub-Category"
            value={formData.dressSubCategory || ""}
            onChange={(e) => onChange("dressSubCategory", e.target.value)}
            options={subSubCategoryOptions}
            placeholder={
              formData.dressType
                ? "Select Dress Sub-Category"
                : "Choose Dress Type first"
            }
            disabled={!formData.dressType || subSubCategoryOptions.length === 0}
          />

          <FormSelect
            label="Fabric"
            value={formData.fabric || ""}
            onChange={(e) => onChange("fabric", e.target.value)}
            options={normalizeOptions(MATERIAL_TYPES)}
            placeholder="Select Fabric"
          />

          <FormSelect
            label="Craft"
            value={formData.craft || ""}
            onChange={(e) => onChange("craft", e.target.value)}
            options={normalizeOptions(DESIGN_TYPES)}
            placeholder="Select Craft"
          />
          {/* Sell Price & MRP */}
          {/* <FormInput
            label="MRP"
            type="number"
            value={formData.mrp || ""}
            onChange={(e) => onChange("mrp", e.target.value)}
            placeholder="Ex. 14,000"
          /> */}

          {/* <FormInput
            label="Selling Price"
            type="number"
            value={formData.price || ""}
            onChange={(e) => onChange("price", e.target.value)}
            placeholder="Ex. 12,000"
          /> */}

          <div className="flex items-center space-x-3 mt-2">
            <label className="font-medium">Enable Virtual Try-On</label>
            <input
              type="checkbox"
              checked={!!formData.isVirtualTryOnEnabled}
              onChange={(e) => onChange("isVirtualTryOnEnabled", e.target.checked)}
            />
          </div>

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
              onChange={() => {
                onChange("premium", true);
                clearError && clearError("premium");
              }}
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
                clearError && clearError("premium");
              }}
              className="form-radio text-blue-600"
            />
            <span className="ml-2">No</span>
          </label>
        </div>

        {errors?.premium && (
          <p className="text-red-500  text-start text-sm mt-2">{errors.premium}</p>
        )}
      </div>
    </div>
  );
};

export default GeneralTab;
