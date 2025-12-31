import React, { useMemo } from "react";
import FormSelect from "../FormSelect";
import {
  OCCASIONS,
  FABRIC_CATEGORIES,
  WEAVE_TYPES,
  getPrimaryFabricOptions,
  getFabricSubcategories,
  shouldShowWeaveFilter,
} from "../../../constants/filterConstants";

/**
 * ProductFilters Component
 * 
 * Renders product filters with smart conditional logic:
 * - Occasion: Always shown for all dress types
 *   - For Saree: User can manually select (enabled)
 *   - For others: Auto-set and disabled
 * - Fabric & Weave filters: Only shown for Saree types
 * 
 * @param {string} dressType - Currently selected dress type
 * @param {object} selectedFilters - Current filter selections
 * @param {function} onFilterChange - Callback (filterType, value) when filters change
 */
const ProductFilters = ({
  dressType,
  selectedFilters = {},
  onFilterChange,
}) => {
  const {
    occasion = "",
    primaryFabric = "",
    fabricSubcategory = "",
    weaveType = "",
  } = selectedFilters;

  // Check if current dress type is Saree
  const isSareeType = useMemo(() => {
    if (!dressType) return false;
    const lowerType = dressType.toLowerCase();
    return lowerType.includes("saree") || lowerType.includes("sari");
  }, [dressType]);

  // Prepare occasion options for dropdown
  const occasionOptions = useMemo(
    () => OCCASIONS.map((occ) => ({ value: occ.value, label: occ.label })),
    []
  );

  // Get primary fabric options
  const primaryFabricOptions = useMemo(() => getPrimaryFabricOptions(), []);

  // Get fabric subcategory options based on selected primary fabric
  const fabricSubcategoryOptions = useMemo(() => {
    if (!primaryFabric) return [];
    const subcategories = getFabricSubcategories(primaryFabric);
    return subcategories.map((sub) => ({ value: sub, label: sub }));
  }, [primaryFabric]);

  // Get weave type options
  const weaveTypeOptions = useMemo(
    () => WEAVE_TYPES.map((weave) => ({ value: weave.value, label: weave.label })),
    []
  );

  // Determine if weave filter should be shown
  const showWeaveFilter = useMemo(() => {
    if (!primaryFabric) return false;
    return shouldShowWeaveFilter([primaryFabric]);
  }, [primaryFabric]);

  return (
    <div className="space-y-6">
      {/* ========== OCCASION FILTER (Always visible) ========== */}
      <div>
        <FormSelect
          label="Occasion"
          value={occasion}
          onChange={(e) => onFilterChange?.("occasion", e.target.value)}
          options={occasionOptions}
          placeholder={dressType ? "Select Occasion" : "Select Dress Type first"}
          disabled={!dressType}
        />
      </div>

      {/* ========== FABRIC & WEAVE FILTERS (Only for Saree) ========== */}
      {isSareeType && (
        <>
          {/* ========== PRIMARY FABRIC FILTER ========== */}
          <FormSelect
            label="Primary Fabric"
            value={primaryFabric}
            onChange={(e) => {
              onFilterChange?.("primaryFabric", e.target.value);
              // Reset dependent fields when fabric changes
              onFilterChange?.("fabricSubcategory", "");
              onFilterChange?.("weaveType", "");
            }}
            options={primaryFabricOptions}
            placeholder="Select Primary Fabric"
          />

          {/* ========== FABRIC SUBCATEGORY (Conditional) ========== */}
          {primaryFabric && fabricSubcategoryOptions.length > 0 && (
            <FormSelect
              label="Fabric Sub-Category"
              value={fabricSubcategory}
              onChange={(e) => onFilterChange?.("fabricSubcategory", e.target.value)}
              options={fabricSubcategoryOptions}
              placeholder={
                primaryFabric
                  ? "Select Fabric Sub-Category"
                  : "Choose primary fabric first"
              }
              disabled={!primaryFabric}
            />
          )}

          {/* ========== WEAVE TYPE FILTER (Conditional) ========== */}
          {showWeaveFilter && (
            <FormSelect
              label="Weave Type"
              value={weaveType}
              onChange={(e) => onFilterChange?.("weaveType", e.target.value)}
              options={weaveTypeOptions}
              placeholder="Select Weave Type"
            />
          )}
        </>
      )}
    </div>
  );
};

export default ProductFilters;
