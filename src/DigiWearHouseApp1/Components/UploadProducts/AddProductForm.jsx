import React, { useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../../context/Context";
import { useProductForm } from "../../CustomHooks/useProductForm";
import { useProductDrafts } from "../../CustomHooks/useProductDrafts";
import { useTabNavigation } from "../../CustomHooks/useTabNavigation";
import { TABS, INITIAL_FORM_DATA } from "../../constants/productConstants";

import TabNavigation from "../UploadSectionComponents/TabNavigation";
import NavigationButtons from "../UploadSectionComponents/NavigationButtons";
import GeneralTab from "../UploadTabs/GeneralTab";
import SizePricingTab from "../UploadTabs/SizePricingTab";
import UploadTab from "../UploadTabs/UploadTab";
import { ArrowLeft } from "lucide-react";

// 1. Accept initialData as a prop
const AddProductForm = ({ onBack, initialData }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { productData, updateProductData } = useApp();
  const [errors, setErrors] = React.useState({});

  // Draft management
  const { saveDraft, deleteDraft, createNewDraft } = useProductDrafts();
  const draftIdRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const isFormDirtyRef = useRef(false);

  // Check if we're loading from a draft
  const draftData = location.state?.draftData;
  const existingDraftId = location.state?.draftId;

  // Initialize hook with context data (default)
  const { formData, updateField, resetForm } = useProductForm(productData);

  const {
    activeTab,
    setActiveTab,
    goToNextTab,
    goToPreviousTab,
    isFirstTab,
    isLastTab,
  } = useTabNavigation(TABS, "general");

  // 2. Add useEffect to populate form when editing (from edit mode)
  useEffect(() => {
    if (initialData) {
      console.log("Pre-filling form for Edit mode:", initialData);

      // Loop through all keys in the passed product and update the form
      Object.keys(initialData).forEach((key) => {
        // Skip system fields that shouldn't be in the form state
        if (
          key === "id" ||
          key === "userId" ||
          key === "createdAt" ||
          key === "updatedAt"
        )
          return;

        updateField(key, initialData[key]);
      });

      // Special handling for Images:
      // Ensure 'images' field is set if your UploadTab expects 'images' but DB has 'imageUrls'
      if (initialData.imageUrls) {
        updateField("images", initialData.imageUrls);
        updateField("imageUrls", initialData.imageUrls); // Keep original key too just in case
      }
    }
  }, [initialData]); // Run once when initialData is provided

  // 3. Initialize draft: load from draft or create new
  useEffect(() => {
    if (draftData && existingDraftId) {
      // Loading from an existing draft
      console.log("Loading draft:", existingDraftId);
      draftIdRef.current = existingDraftId;

      // Pre-fill form from draft data
      Object.keys(draftData).forEach((key) => {
        if (
          key === "id" ||
          key === "userId" ||
          key === "createdAt" ||
          key === "updatedAt"
        )
          return;
        updateField(key, draftData[key]);
      });

      if (draftData.imageUrls) {
        updateField("images", draftData.imageUrls);
        updateField("imageUrls", draftData.imageUrls);
      }
    } else if (!initialData) {
      // New product - create a new draft ID
      draftIdRef.current = createNewDraft();
      console.log("Created new draft ID:", draftIdRef.current);
    }
  }, []); // Run once on mount

  // 4. Auto-save form data to localStorage (debounced)
  useEffect(() => {
    // Skip if editing an existing product (not a new draft)
    if (initialData) return;

    // Check if form has any data worth saving
    const hasContent = formData.title ||
      formData.category ||
      formData.dressType ||
      formData.price ||
      (formData.imageUrls && formData.imageUrls.length > 0);

    if (!hasContent) return;

    isFormDirtyRef.current = true;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Save after 1 second of inactivity
    saveTimeoutRef.current = setTimeout(() => {
      if (draftIdRef.current && isFormDirtyRef.current) {
        console.log("Auto-saving draft:", draftIdRef.current);
        saveDraft(draftIdRef.current, formData);
      }
    }, 1000);

    // Cleanup timeout on unmount or when formData changes
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData, initialData, saveDraft]);

  // 5. Cleanup on unmount - save any pending changes
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // Save final state if form is dirty
      if (draftIdRef.current && isFormDirtyRef.current && !initialData) {
        const hasContent = formData.title ||
          formData.category ||
          formData.dressType ||
          formData.price ||
          (formData.imageUrls && formData.imageUrls.length > 0);
        if (hasContent) {
          saveDraft(draftIdRef.current, formData);
        }
      }
    };
  }, []);

  const handleBack = () => {
    if (!goToPreviousTab()) {
      // If we are on the first tab and going back, reset the form
      resetForm();
      onBack();
    }
  };

  const clearError = (field) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleNext = () => {
    if (activeTab === "general") {
      if (formData.premium === null || formData.premium === undefined) {
        setErrors({ premium: "Please select one option." });
        return; // stop navigation
      }
    }

    // clear errors if valid
    setErrors({});
    goToNextTab();
  };

  const handleSubmit = () => {
    if (formData.premium === null) {
      alert("Please select if this product is premium (Yes/No).");
      return;
    }
    const dressType = formData?.dressType?.toLowerCase() || "";
    const isSaree = dressType.includes("saree") || dressType.includes("sari");

    // If saree and AI views not yet ready → block
    if (
      isSaree &&
      (!formData.generatedSareeViews ||
        Object.keys(formData.generatedSareeViews).length === 0)
    ) {
      alert(
        "Please wait until the AI has finished generating your saree views before proceeding."
      );
      return;
    }

    // Delete draft when proceeding to preview (will be published)
    if (draftIdRef.current) {
      console.log("Deleting draft before preview:", draftIdRef.current);
      deleteDraft(draftIdRef.current);
      draftIdRef.current = null;
      isFormDirtyRef.current = false;
    }

    updateProductData(formData);
    console.log("Product data:", formData);
    navigate("/tryon-preview");
  };

  // Check if saree generation is complete
  const isSareeGenerationComplete = () => {
    const dressType = formData?.dressType?.toLowerCase() || "";
    const isSaree = dressType.includes("saree") || dressType.includes("sari");

    if (!isSaree) return true; // Not a saree, so no generation needed

    // Check if we have generated views
    const generatedViews = formData.generatedSareeViews;
    return generatedViews && Object.keys(generatedViews).length > 0;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <GeneralTab
            formData={formData}
            onChange={updateField}
            errors={errors}
            clearError={clearError}
          />
        );
      case "size-pricing":
        return <SizePricingTab formData={formData} onChange={updateField} />;
      case "upload":
        return <UploadTab formData={formData} onChange={updateField} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 lg:px-8 py-4 md:py-6">
        <div className="max-w-4xl mx-auto relative flex items-center justify-center">
          {/* Back Button (absolute left) */}
          <button
            onClick={() => navigate(-1)}
            className="absolute left-0 flex items-end text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            {/* <span className="hidden sm:inline ml-1">Back</span> */}
          </button>

          {/* Title (centered) */}
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 text-center">
            {/* 3. Dynamic Title */}
            {initialData ? "Edit Product" : "Add One Product"}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={TABS}
        />

        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          {renderTabContent()}

          <NavigationButtons
            onBack={handleBack}
            onNext={handleNext}
            isLastTab={isLastTab}
            isFirstTab={isFirstTab}
            onSubmit={handleSubmit}
            disableSubmit={!isSareeGenerationComplete()}
          />
        </div>
      </div>
    </div>
  );
};

export default AddProductForm;
