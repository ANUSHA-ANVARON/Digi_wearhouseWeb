import React, { useState } from "react";
import { X, Upload, Trash2 } from "lucide-react";
import { uploadToCloudinary } from "../../../utilities/cloudinary";

const AdditionalDetailsModal = ({ show, onClose, formData, onChange }) => {
    const [uploading, setUploading] = useState(false);
    const [localReviews, setLocalReviews] = useState(formData.vendorReviews || []);

    if (!show) return null;

    const handleAddReview = () => {
        const newReview = {
            id: Date.now().toString(),
            text: "",
            image: ""
        };
        setLocalReviews([...localReviews, newReview]);
    };

    const handleReviewTextChange = (id, text) => {
        const updated = localReviews.map(review =>
            review.id === id ? { ...review, text } : review
        );
        setLocalReviews(updated);
    };

    const handleReviewImageUpload = async (id, file) => {
        if (!file) return;

        setUploading(true);
        try {
            const imageUrl = await uploadToCloudinary(file);
            const updated = localReviews.map(review =>
                review.id === id ? { ...review, image: imageUrl } : review
            );
            setLocalReviews(updated);
        } catch (error) {
            console.error("Failed to upload review image:", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteReview = (id) => {
        setLocalReviews(localReviews.filter(review => review.id !== id));
    };

    const handleSave = () => {
        onChange("vendorReviews", localReviews);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="border-b border-gray-200 p-6 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Additional Product Details</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Note */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Note
                        </label>
                        <textarea
                            value={formData.note || ""}
                            onChange={(e) => onChange("note", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="3"
                            placeholder="Any additional notes about the product..."
                        />
                    </div>

                    {/* Material Care */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Material Care Instructions
                        </label>
                        <textarea
                            value={formData.clean || ""}
                            onChange={(e) => onChange("clean", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="3"
                            placeholder="How to care for this product..."
                        />
                    </div>

                    {/* Components */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Components
                        </label>
                        <textarea
                            value={formData.components || ""}
                            onChange={(e) => onChange("components", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="2"
                            placeholder="List product components..."
                        />
                    </div>

                    {/* Vendor Reviews */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Vendor Reviews (Minimum 5 required)
                            </label>
                            <button
                                onClick={handleAddReview}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                + Add Review
                            </button>
                        </div>

                        {localReviews.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                <p className="text-gray-500 text-sm">No reviews added yet. Click "Add Review" to start.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {localReviews.map((review, index) => (
                                    <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-sm font-medium text-gray-700">Review {index + 1}</span>
                                            <button
                                                onClick={() => handleDeleteReview(review.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            <textarea
                                                value={review.text}
                                                onChange={(e) => handleReviewTextChange(review.id, e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                rows="2"
                                                placeholder="Review text..."
                                            />

                                            <div>
                                                {review.image ? (
                                                    <div className="relative w-full h-32">
                                                        <img
                                                            src={review.image}
                                                            alt={`Review ${index + 1}`}
                                                            className="w-full h-full object-cover rounded-lg"
                                                        />
                                                        <button
                                                            onClick={() => handleReviewTextChange(review.id, review.text)}
                                                            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                                                        >
                                                            <X className="w-4 h-4 text-gray-600" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                                                        <Upload className="w-6 h-6 text-gray-400 mb-2" />
                                                        <span className="text-sm text-gray-500">Upload review image</span>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => handleReviewImageUpload(review.id, e.target.files[0])}
                                                            disabled={uploading}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-6 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={uploading || (localReviews.length > 0 && localReviews.length < 5)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${uploading || (localReviews.length > 0 && localReviews.length < 5)
                                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                    >
                        {uploading ? "Uploading..." : "Save Details"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdditionalDetailsModal;
