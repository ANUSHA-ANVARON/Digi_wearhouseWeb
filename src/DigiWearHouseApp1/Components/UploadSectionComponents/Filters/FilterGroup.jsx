import React, { useState } from "react";

/**
 * FilterGroup Component
 * 
 * Handles checkbox groups with support for nested subcategories.
 * Features:
 * - Single or multi-select modes
 * - Nested subcategories with visual indentation
 * - Expandable primary categories
 * - Clean, accessible markup
 * 
 * @param {array} options - Array of options { value, label, subcategories? }
 * @param {string|array} selectedValues - Selected value(s)
 * @param {function} onChange - Callback with (value, isSelected)
 * @param {boolean} multiSelect - Enable multi-selection
 * @param {string} name - Input name for radio buttons (required for single select)
 */
const FilterGroup = ({
  options = [],
  selectedValues = [],
  onChange,
  multiSelect = true,
  name = "filter",
}) => {
  // Track expanded state for categories with subcategories
  const [expandedCategories, setExpandedCategories] = useState({});

  // Normalize selectedValues to array for easier checking
  const selectedArray = Array.isArray(selectedValues)
    ? selectedValues
    : [selectedValues].filter(Boolean);

  const isSelected = (value) => selectedArray.includes(value);

  const handleToggle = (value) => {
    if (!onChange) return;

    if (multiSelect) {
      // Multi-select: toggle the value
      onChange(value, !isSelected(value));
    } else {
      // Single select: set the value
      onChange(value, true);
    }
  };

  const toggleCategory = (categoryValue) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryValue]: !prev[categoryValue],
    }));
  };

  const renderOption = (option, isSubcategory = false) => {
    const hasSubcategories =
      option.subcategories && option.subcategories.length > 0;
    const isExpanded = expandedCategories[option.value];
    const inputId = `filter-${option.value}`;

    return (
      <div key={option.value} className={isSubcategory ? "ml-6" : ""}>
        <div className="flex items-start gap-2 py-2">
          {/* Checkbox or Radio */}
          <input
            type={multiSelect ? "checkbox" : "radio"}
            id={inputId}
            name={name}
            value={option.value}
            checked={isSelected(option.value)}
            onChange={() => handleToggle(option.value)}
            className={`mt-1 ${
              multiSelect
                ? "rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                : "border-gray-300 text-blue-600 focus:ring-blue-500"
            }`}
          />

          {/* Label */}
          <label
            htmlFor={inputId}
            className="flex-1 text-sm text-gray-700 cursor-pointer select-none"
          >
            {option.label}
            {option.description && (
              <span className="block text-xs text-gray-500 mt-0.5">
                {option.description}
              </span>
            )}
          </label>

          {/* Expand button for categories with subcategories */}
          {hasSubcategories && (
            <button
              type="button"
              onClick={() => toggleCategory(option.value)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              {isExpanded ? "Collapse" : "Expand"}
            </button>
          )}
        </div>

        {/* Render subcategories if expanded */}
        {hasSubcategories && isExpanded && (
          <div className="mt-1 space-y-1">
            {option.subcategories.map((subOption) =>
              renderOption(
                typeof subOption === "string"
                  ? { value: subOption, label: subOption }
                  : subOption,
                true
              )
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {options.length === 0 ? (
        <p className="text-sm text-gray-500 italic py-2">
          No options available
        </p>
      ) : (
        options.map((option) => renderOption(option))
      )}
    </div>
  );
};

export default FilterGroup;
