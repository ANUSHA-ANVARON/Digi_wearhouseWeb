import React from "react";
import { X, Package } from "lucide-react";

const ProductViewModal = ({ show, onClose, product }) => {
    if (!show || !product) return null;

    const formatDate = (dateString) => {
        if (!dateString) return "Unknown";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="border-b border-gray-200 p-6 flex justify-between items-center">
                    <div className="flex items-center">
                        <Package className="w-6 h-6 text-blue-600 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Images */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Product Images</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {product.imageUrls && product.imageUrls.length > 0 ? (
                                    product.imageUrls.map((url, index) => (
                                        <img
                                            key={index}
                                            src={url}
                                            alt={`Product ${index + 1}`}
                                            className="w-full h-40 object-cover rounded-lg border border-gray-200"
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-2 flex items-center justify-center h-40 bg-gray-100 rounded-lg">
                                        <Package className="w-12 h-12 text-gray-400" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Details */}
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-2xl font-bold text-gray-900 mb-1">
                                    {product.title || "Untitled Product"}
                                </h4>
                                <div className="flex items-center space-x-2">
                                    <span
                                        className={`px-2 py-1 text-xs rounded-full font-medium ${product.isPublished
                                                ? "bg-green-100 text-green-800"
                                                : "bg-yellow-100 text-yellow-800"
                                            }`}
                                    >
                                        {product.isPublished ? "Published" : "Draft"}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">Category:</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {product.category || "N/A"}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">Type:</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {product.dressType || "N/A"}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">Fabric:</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {product.fabric || "N/A"}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">Price:</span>
                                    <span className="text-lg font-bold text-gray-900">
                                        ₹{product.price || "0"}
                                    </span>
                                </div>
                            </div>

                            {product.description && (
                                <div>
                                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Description</h5>
                                    <p className="text-sm text-gray-600">{product.description}</p>
                                </div>
                            )}

                            {product.selectedSizes && product.selectedSizes.length > 0 && (
                                <div>
                                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Available Sizes</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {product.selectedSizes.map((size) => (
                                            <span
                                                key={size}
                                                className="px-3 py-1 text-sm border border-gray-300 rounded-full"
                                            >
                                                {size}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {product.selectedColors && product.selectedColors.length > 0 && (
                                <div>
                                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Available Colors</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {product.selectedColors.map((color) => (
                                            <span
                                                key={color}
                                                className="px-3 py-1 text-sm border border-gray-300 rounded-full capitalize"
                                            >
                                                {color}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-200">
                                <div className="text-xs text-gray-500">
                                    Created: {formatDate(product.createdAt)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductViewModal;
