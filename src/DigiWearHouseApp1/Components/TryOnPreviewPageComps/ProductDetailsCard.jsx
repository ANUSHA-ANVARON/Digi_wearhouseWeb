import React from "react";
import { Package } from "lucide-react";

export const ProductDetailsCard = ({ productData }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-center mb-4">
      <Package className="w-5 h-5 text-[#800000] mr-2" />
      <span className="text-gray-700 font-medium">Product Details</span>
    </div>
    <div className="space-y-1 text-start">
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

    {/* Additional Details Section */}
    {(productData.note || productData.clean || productData.components || (productData.vendorReviews && productData.vendorReviews.length > 0)) && (
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Additional Details</h3>

        {productData.note && (
          <div className="mb-3 text-start">
            <p className="text-xs font-medium text-gray-600 mb-1">Note:</p>
            <p className="text-sm text-gray-700">{productData.note}</p>
          </div>
        )}

        {productData.clean && (
          <div className="mb-3 text-start">
            <p className="text-xs font-medium text-gray-600 mb-1">Material Care:</p>
            <p className="text-sm text-gray-700">{productData.clean}</p>
          </div>
        )}

        {productData.components && (
          <div className="mb-3 text-start">
            <p className="text-xs font-medium text-gray-600 mb-1">Components:</p>
            <p className="text-sm text-gray-700">{productData.components}</p>
          </div>
        )}

        {productData.vendorReviews && productData.vendorReviews.length > 0 && (
          <div className="mt-4 text-start">
            <p className="text-xs font-medium text-gray-600 mb-2">
              Vendor Reviews ({productData.vendorReviews.length}):
            </p>
            <div className="grid grid-cols-2 gap-2">
              {productData.vendorReviews.map((review, index) => (
                <div key={review.id || index} className="border border-gray-200 rounded-lg p-2">
                  {review.image && (
                    <img
                      src={review.image}
                      alt={`Review ${index + 1}`}
                      className="w-full h-20 object-cover rounded mb-1"
                    />
                  )}
                  <p className="text-xs text-gray-600 line-clamp-2">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )}
  </div>
);
