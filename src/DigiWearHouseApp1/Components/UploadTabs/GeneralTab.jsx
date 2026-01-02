import React, { useMemo } from "react";
import FormInput from "../UploadSectionComponents/FormInput";
import FormSelect from "../UploadSectionComponents/FormSelect";
import ProductTypeToggle from "../UploadSectionComponents/SizeandPricingComps/ProductTypeToggle";
import ProductFilters from "../UploadSectionComponents/Filters/ProductFilters";
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
  if (
    Array.isArray(opts) &&
    opts.length > 0 &&
    typeof opts[0] === "object" &&
    ("value" in opts[0] || "label" in opts[0])
  ) {
    return opts.map((o) =>
      o.value
        ? o
        : {
          value: o.label || JSON.stringify(o),
          label: o.label || o.value || JSON.stringify(o),
        }
    );
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
    () => getSubOptions(formData.dressCategory || "Ethnic Wear"),
    [formData.dressCategory, getSubOptions]
  );

  // NEW: sub-subcategories based on selected dressType
  const subSubCategoryOptions = useMemo(
    () =>
      formData.dressType ? getSubSubOptionsForType(formData.dressType) : [],
    [formData.dressType]
  );

  // NEW: Blouse options for Saree/Lehenga
  const blouseOptions = useMemo(() => {
    const dressType = formData.dressType?.toLowerCase() || "";
    if (dressType.includes("saree") || dressType.includes("lehenga")) {
      return getSubSubOptionsForType("Blouses");
    }
    return [];
  }, [formData.dressType]);

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

          {/* Category (Fixed to WOMEN) */}
          <FormSelect
            label="Category"
            value={formData.category || "WOMEN"}
            onChange={(e) => onChange("category", e.target.value)}
            options={normalizeOptions(CATEGORIES)}
            placeholder="WOMEN"
            disabled={true}
          />

          <ProductTypeToggle
            value={productType}
            onChange={(value) => {
              const normalized = (value || "").trim();
              onChange("productType", normalized);
              // Auto-set to Ethnic Wear (fixed)
              onChange("dressCategory", "Ethnic Wear");
              onChange("dressType", "");
              onChange("dressSubCategory", "");
            }}
          />

          {/* Dress Category (Fixed to Ethnic Wear) */}
          <FormSelect
            label="Dress Category"
            value={formData.dressCategory || "Ethnic Wear"}
            onChange={(e) => {
              onChange("dressCategory", e.target.value);
              onChange("dressType", ""); // Reset subcategory when category changes
              onChange("dressSubCategory", ""); // reset deeper level
            }}
            options={categoryOptions}
            placeholder="Ethnic Wear"
            disabled={true}
          />

          {/* Dress Type */}
          <FormSelect
            label="Dress Type"
            value={formData.dressType || ""}
            onChange={(e) => {
              const newDressType = e.target.value;
              onChange("dressType", newDressType);
              onChange("dressSubCategory", ""); // reset subcategory
              
              // Clear occasion - vendor will select manually
              onChange("occasion", "");
              
              // Reset other filters when dress type changes
              onChange("primaryFabric", "");
              onChange("fabricSubcategory", "");
              onChange("weaveType", "");
            }}
            options={subCategoryOptions}
            placeholder="Select Dress Type"
          />

          {/* ========== OCCASION & FILTERS (Always visible, adapt based on dress type) ========== */}
          <ProductFilters
            dressType={formData.dressType}
            selectedFilters={{
              occasion: formData.occasion || "",
              primaryFabric: formData.primaryFabric || "",
              fabricSubcategory: formData.fabricSubcategory || "",
              weaveType: formData.weaveType || "",
            }}
            onFilterChange={(filterType, value) => {
              onChange(filterType, value);
              // Sync 'primaryFabric' to main 'fabric' field for backward compatibility
              if (filterType === "primaryFabric") {
                onChange("fabric", value);
              }
            }}
          />

          {/* Dress Sub-Category (Always visible, hidden for Saree, disabled when no dress type) */}
          {(!formData.dressType || 
            (!formData.dressType.toLowerCase().includes("saree") && 
             !formData.dressType.toLowerCase().includes("sari"))) && (
            <FormSelect
              label="Dress Sub-Category"
              value={formData.dressSubCategory || ""}
              onChange={(e) => onChange("dressSubCategory", e.target.value)}
              options={subSubCategoryOptions}
              placeholder={
                formData.dressType && subSubCategoryOptions.length > 0
                  ? "Select Dress Sub-Category"
                  : "Choose Dress Type first"
              }
              disabled={!formData.dressType || subSubCategoryOptions.length === 0}
            />
          )}

          {/* NEW: Conditional Blouse Type Dropdown */}
          {/* {blouseOptions.length > 0 && (
            <FormSelect
              label="Blouse Type"
              value={formData.linkedBlouseType || ""}
              onChange={(e) => onChange("linkedBlouseType", e.target.value)}
              options={blouseOptions}
              placeholder="Select Blouse Type"
            />
          )} */}



          <FormSelect
            label="Craft"
            value={formData.craft || ""}
            onChange={(e) => onChange("craft", e.target.value)}
            options={normalizeOptions(DESIGN_TYPES)}
            placeholder="Select Craft"
          />
          {/* Sell Price & MRP */}

          <div className="flex items-center space-x-3 mt-2">
            <label className="font-medium">Enable Virtual Try-On</label>
            <input
              type="checkbox"
              checked={!!formData.isVirtualTryOnEnabled}
              onChange={(e) =>
                onChange("isVirtualTryOnEnabled", e.target.checked)
              }
            />
          </div>
        </div>
      </div>

      <div>
        <FormInput
          label="Boutique Name / Shop Name"
          value={formData.shopName || ""}
          onChange={(e) => {
            const val = e.target.value;
            onChange("shopName", val);
            // Auto-set premium/boutique flag based on if shop name exists
            onChange("premium", !!val && val.trim().length > 0);
          }}
          placeholder="Enter Shop Name (e.g. My Saree Shop)"
        />
        <p className="text-xs text-gray-500 mt-1">
          Entering a shop name automatically marks this as a Boutique Product.
        </p>
      </div>
    </div>
  );
};

export default GeneralTab;
