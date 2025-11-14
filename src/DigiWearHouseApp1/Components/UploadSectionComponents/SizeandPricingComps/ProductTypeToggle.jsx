import React from "react";
import { PRODUCT_TYPES } from "../../../constants/productConstants";

const ProductTypeToggle = ({ value, onChange }) => (
  <div className="space-y-2">
    <label className="block text-start text-sm md:text-base font-medium text-gray-700">
      Product Type
    </label>
    <div className="flex space-x-4">
      {PRODUCT_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            value === type
              ? "bg-[#800000] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {type}
        </button>
      ))}
    </div>
  </div>
);

export default ProductTypeToggle;
