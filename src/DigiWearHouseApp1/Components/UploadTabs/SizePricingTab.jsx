import React, { useState } from 'react';
import FormInput from "../UploadSectionComponents/FormInput";
import SizeSelector from "../UploadSectionComponents/SizeandPricingComps/SizeSelector";
import ColorSelector from "../UploadSectionComponents/SizeandPricingComps/ColorSelector";
import UnitsSection from "../UploadSectionComponents/SizeandPricingComps/UnitsSection";
import AdditionalDetailsModal from "../UploadSectionComponents/models/AdditionalDetailsModal";
import { SIZES } from "../../constants/productConstants";
import { Info } from "lucide-react";

const SizePricingTab = ({ formData, onChange }) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Add a guard for formData
  if (!formData) {
    return (
      <div className="text-center p-10 text-gray-500">Loading form data...</div>
    );
  }

  const isSaree = formData?.dressType?.toLowerCase().includes("saree");
  const isUnstitched = formData?.productType?.toLowerCase() === "unstitched";

  return (
    <div className="space-y-6 md:space-y-8 max-w-2xl mx-auto">
      {!isSaree && !isUnstitched && (
        <SizeSelector
          sizes={SIZES}
          selectedSizes={formData.selectedSizes}
          onChange={(sizes) => onChange("selectedSizes", sizes)}
        />
      )}

      <FormInput
        label="Price"
        type="number"
        value={formData.price}
        onChange={(e) => onChange("price", e.target.value)}
        placeholder="Ex. 12,000"
      />

      <ColorSelector
        selectedColors={formData.selectedColors}
        onChange={(colors) => onChange("selectedColors", colors)}
      />

      {/* Stock */}
      <FormInput
        label="Total Stock"
        type="number"
        value={formData.stock || 0}
        onChange={(e) => onChange("stock", Number(e.target.value))}
        placeholder="0"
      />

      {/* UnitsSection already expects units; ensure it supports keys like "M|red" */}
      <UnitsSection
        selectedSizes={!isSaree && !isUnstitched ? formData.selectedSizes : []}
        selectedColors={formData.selectedColors}
        units={formData.units}
        onChange={(units) => onChange("units", units)}
      />

      {/* Additional Details Modal */}
      <AdditionalDetailsModal
        show={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        formData={formData}
        onChange={onChange}
      />

      {/* Additional Details Button */}
      <div className="flex justify-start">
        <button
          type="button"
          onClick={() => setShowDetailsModal(true)}
          className="flex cursor-pointer justify-start px-4 py-2 text-sm font-medium text-[#800000] bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          <Info className="w-4 h-4 mr-2 cursor-pointer" />
          Additional Details
        </button>
      </div>
    </div>
  );
};

export default SizePricingTab;
