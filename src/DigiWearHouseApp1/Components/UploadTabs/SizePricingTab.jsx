import React from 'react';
import FormInput from '../UploadSectionComponents/FormInput';
import SizeSelector from '../UploadSectionComponents/SizeandPricingComps/SizeSelector';
import ColorSelector from '../UploadSectionComponents/SizeandPricingComps/ColorSelector';
import UnitsSection from '../UploadSectionComponents/SizeandPricingComps/UnitsSection';
import { SIZES } from '../../constants/productConstants';

const SizePricingTab = ({ formData, onChange }) => {
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
        selectedSizes={(!isSaree && !isUnstitched) ? formData.selectedSizes : []}
        selectedColors={formData.selectedColors}
        units={formData.units}
        onChange={(units) => onChange("units", units)}
      />

    </div>
  );
};

export default SizePricingTab;
