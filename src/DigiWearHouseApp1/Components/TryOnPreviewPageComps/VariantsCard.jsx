import React from "react";
import { productUtils } from "../../utilities/ProductUtils";

export const VariantsCard = ({ productData }) => {
  const isSaree = productUtils.isSareeProduct(productData);
  const displayImages = productUtils.getDisplayImages(productData);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <div className="w-5 h-5 text-[#800000] mr-2">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
          </svg>
        </div>
        <span className="text-gray-700 font-medium">
          {isSaree ? "Saree Details" : "Variants & Inventory"}
        </span>
      </div>

      {!isSaree && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Sizes</label>
            <div className="flex flex-wrap gap-1">
              {productData.selectedSizes?.length > 0 ? (
                productData.selectedSizes.map((size) => (
                  <button
                    key={size}
                    className="px-2 py-1 text-xs border border-gray-300 rounded"
                  >
                    {size}
                  </button>
                ))
              ) : (
                <button className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-500">
                  No sizes
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Colors</label>
            <div className="flex flex-wrap gap-1">
              {productData.selectedColors?.length > 0 ? (
                productData.selectedColors.map((colorCode) => (
                  <div
                    key={colorCode}
                    className="px-2 py-1 text-xs border border-gray-300 rounded capitalize"
                  >
                    {productUtils.getColorDisplayName(colorCode)}
                  </div>
                ))
              ) : (
                <button className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-500">
                  No colors
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {isSaree
              ? displayImages.filter((img) => img.type === "part").length
              : (productData.selectedSizes?.length || 0) *
                (productData.selectedColors?.length || 1)}
          </div>
          <div className="text-xs text-gray-500">
            {isSaree ? "Parts" : "Total Variants"}
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {isSaree
              ? displayImages.length
              : productData.imageUrls?.length || 0}
          </div>
          <div className="text-xs text-gray-500">Images</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {productData.price ? `₹${productData.price}` : "0"}
          </div>
          <div className="text-xs text-gray-500">Est. Value</div>
        </div>
      </div>
    </div>
  );
};
