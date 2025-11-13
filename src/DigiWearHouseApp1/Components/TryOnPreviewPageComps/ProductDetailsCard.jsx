import React from "react";
import { Package } from "lucide-react";

export const ProductDetailsCard = ({ productData }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-center mb-4">
      <Package className="w-5 h-5 text-[#800000] mr-2" />
      <span className="text-gray-700 font-medium">Product Details</span>
    </div>
    <div className="space-y-1  text-start">
      <p className="text-sm text-gray-600">
        Category:{" "}
        <span className="font-semibold">
          {productData.category || "No Category"}
        </span>
      </p>
      <p className="text-sm text-gray-600">
        Dress Type:{" "}
        <span className="font-semibold">
          {productData.dressType || "No Type"}
        </span>
      </p>
      <p className="text-sm text-gray-600">
        Fabric:{" "}
        <span className="font-semibold">
          {productData.fabric || "No Fabric"}
        </span>
      </p>
      <p className="text-sm text-gray-600">
        Craft:{" "}
        <span className="font-semibold">{productData.craft || "No Craft"}</span>
      </p>
    </div>
    {productData.description && (
      <div className="mt-4 text-start">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Description:</h3>
        <p className="text-sm text-gray-600">
          <span className="font-semibold">{productData.description}</span>
        </p>
      </div>
    )}
  </div>
);
