import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Edit3, Package, Clock, AlertCircle } from "lucide-react";
import { useProductDrafts } from "../../CustomHooks/useProductDrafts";

const DraftsPage = () => {
    const navigate = useNavigate();
    const { drafts, deleteDraft, loadDrafts } = useProductDrafts();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [draftToDelete, setDraftToDelete] = useState(null);

    useEffect(() => {
        loadDrafts();
    }, [loadDrafts]);

    const handleBack = () => {
        navigate(-1);
    };

    const handleContinueEditing = (draft) => {
        // Navigate to upload-products with draft data
        navigate("/upload-products", {
            state: {
                inAddFlow: true,
                draftId: draft.id,
                draftData: draft.formData,
            },
        });
    };

    const handleDeleteClick = (draft) => {
        setDraftToDelete(draft);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (draftToDelete) {
            deleteDraft(draftToDelete.id);
            setShowDeleteModal(false);
            setDraftToDelete(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Unknown";
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        // Less than 1 hour ago
        if (diff < 3600000) {
            const mins = Math.floor(diff / 60000);
            return mins <= 1 ? "Just now" : `${mins} minutes ago`;
        }
        // Less than 24 hours ago
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
        }
        // Within last week
        if (diff < 604800000) {
            const days = Math.floor(diff / 86400000);
            return days === 1 ? "Yesterday" : `${days} days ago`;
        }
        // Otherwise show date
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            {/* Header */}
            <div className="max-w-4xl mx-auto mt-7 mb-6 flex items-center space-x-3">
                <button
                    onClick={handleBack}
                    aria-label="Go Back"
                    className="p-2 rounded hover:bg-gray-200 transition"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-black text-xl font-bold">Unsaved Products</h1>
                    <p className="text-sm text-gray-500">
                        {drafts.length} draft{drafts.length !== 1 ? "s" : ""} saved
                    </p>
                </div>
            </div>

            {/* Warning Note */}
            <div className="max-w-4xl mx-auto mb-6">
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-[#800000] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-[#800000]">
                        <span className="font-semibold">Note:</span> Unsaved drafts are automatically deleted after 2 days. Please complete your product uploads to avoid losing data.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                {drafts.length === 0 ? (
                    // Empty State
                    <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Package className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No unsaved products
                        </h3>
                        <p className="text-gray-600 mb-6">
                            When you start adding a product and leave without publishing, it
                            will appear here as a draft.
                        </p>
                        <button
                            onClick={() => navigate("/upload-products")}
                            className="inline-flex items-center bg-[#800000] hover:bg-[#600000] text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            <Package className="w-4 h-4 mr-2" />
                            Add New Product
                        </button>
                    </div>
                ) : (
                    // Drafts List
                    <div className="space-y-4">
                        {drafts.map((draft) => (
                            <div
                                key={draft.id}
                                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        {/* Title and Type */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                {draft.title || "Untitled Product"}
                                            </h3>
                                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                                Draft
                                            </span>
                                        </div>

                                        {/* Category Info */}
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mb-3">
                                            {draft.category && (
                                                <span className="flex items-center gap-1">
                                                    <Package className="w-4 h-4" />
                                                    {draft.category}
                                                </span>
                                            )}
                                            {draft.dressType && (
                                                <span className="text-gray-400">|</span>
                                            )}
                                            {draft.dressType && <span>{draft.dressType}</span>}
                                            {draft.price && (
                                                <>
                                                    <span className="text-gray-400">|</span>
                                                    <span className="font-medium text-gray-800">
                                                        ₹{draft.price}
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        {/* Timestamp */}
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>Last edited {formatDate(draft.lastModified)}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 ml-4">
                                        <button
                                            onClick={() => handleContinueEditing(draft)}
                                            className="flex items-center gap-2 px-4 py-2 bg-[#800000] hover:bg-[#600000] text-white text-sm font-medium rounded-lg transition-colors"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                            Continue
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(draft)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            aria-label="Delete draft"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-100 rounded-full">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Delete Draft?
                            </h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "
                            {draftToDelete?.title || "Untitled Product"}"? This action cannot
                            be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDraftToDelete(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DraftsPage;
