/**
 * Filter Constants for Product Upload
 * 
 * This file contains all filter configurations for the product upload form.
 * Filters are shown after Dress Category and Dress Type selections.
 */

// ==================== OCCASION FILTER ====================
/**
 * Occasion Filter (Mandatory)
 * Defines the occasion/event for which the product is suitable.
 * Logic:
 * - Wedding/Bridal: Associated with premium fabrics and heavy work
 * - Office/Daily: Prefers cotton, linen, or lightweight fabrics
 * - Others: Flexible fabric choices
 */
export const OCCASIONS = [
  {
    value: "wedding",
    label: "Wedding",
    fabricPreference: "premium",
    description: "Automatically expects premium fabrics and heavy work",
  },
  {
    value: "bridal",
    label: "Bridal",
    fabricPreference: "premium",
    description: "Automatically expects premium fabrics and heavy work",
  },
  {
    value: "festive",
    label: "Festive",
    fabricPreference: "any",
    description: "Flexible fabric choices",
  },
  {
    value: "party",
    label: "Party",
    fabricPreference: "any",
    description: "Flexible fabric choices",
  },
  {
    value: "office",
    label: "Office",
    fabricPreference: "lightweight",
    description: "Prefers cotton, linen, or lightweight fabrics",
  },
  {
    value: "daily",
    label: "Daily",
    fabricPreference: "lightweight",
    description: "Prefers cotton, linen, or lightweight fabrics",
  },
];

// ==================== PRIMARY FABRIC & SUBCATEGORIES ====================
/**
 * Comprehensive Fabric Taxonomy
 * Organized by primary fabric type with nested subcategories.
 * 
 * Structure:
 * - label: Display name for the primary fabric
 * - subcategories: Array of specific fabric variations
 * - supportsWeave: Whether this fabric supports weave type filter
 */
export const FABRIC_CATEGORIES = {
  silk: {
    label: "Silk",
    subcategories: [
      "Pure Silk",
      "Raw Silk",
      "Tussar Silk",
      "Mulberry Silk",
      "Muga Silk",
      "Eri Silk",
      "Matka Silk",
    ],
    supportsWeave: true,
  },
  cotton: {
    label: "Cotton",
    subcategories: [
      "Handloom Cotton",
      "Soft Cotton",
      "Khadi Cotton",
      "Mercerized Cotton",
      "Cotton Silk (Blend)",
    ],
    supportsWeave: true,
  },
  linen: {
    label: "Linen",
    subcategories: [
      "Pure Linen",
      "Linen Silk (Blend)",
      "Linen Cotton (Blend)",
    ],
    supportsWeave: true,
  },
  chiffon: {
    label: "Chiffon",
    subcategories: ["Silk Chiffon", "Georgette Chiffon", "Faux Chiffon"],
    supportsWeave: false,
  },
  georgette: {
    label: "Georgette",
    subcategories: ["Silk Georgette", "Faux Georgette", "Heavy Georgette"],
    supportsWeave: true, // Optional for georgette
  },
  net: {
    label: "Net",
    subcategories: ["Soft Net", "Embroidered Net", "Sequin Net"],
    supportsWeave: false,
  },
  satin: {
    label: "Satin",
    subcategories: ["Silk Satin", "Glossy Satin", "Matte Satin"],
    supportsWeave: true, // Optional
  },
  velvet: {
    label: "Velvet",
    subcategories: ["Silk Velvet", "Crushed Velvet", "Stretch Velvet"],
    supportsWeave: false,
  },
  crepe: {
    label: "Crepe",
    subcategories: ["Silk Crepe", "Satin Crepe", "Heavy Crepe"],
    supportsWeave: false,
  },
  organza: {
    label: "Organza",
    subcategories: ["Silk Organza", "Soft Organza", "Tissue Organza"],
    supportsWeave: false,
  },
  artSilk: {
    label: "Art Silk",
    subcategories: ["Plain", "Printed", "Jacquard"],
    supportsWeave: false,
  },
  viscose: {
    label: "Viscose",
    subcategories: ["Silk", "Crepe", "Printed"],
    supportsWeave: false,
  },
  modal: {
    label: "Modal Silk",
    subcategories: ["Pure", "Printed", "Jacquard"],
    supportsWeave: false,
  },
  rayon: {
    label: "Rayon",
    subcategories: ["Rayon Cotton", "Printed", "Slub"],
    supportsWeave: false,
  },
  nylon: {
    label: "Nylon",
    subcategories: ["Nylon Net", "Nylon Blend"],
    supportsWeave: false,
  },
  polyester: {
    label: "Polyester",
    subcategories: ["Poly Silk", "Poly Cotton", "Poly Georgette", "Poly Crepe"],
    supportsWeave: false,
  },
  woolBlend: {
    label: "Wool Blend",
    subcategories: ["Wool Silk Blend", "Wool Cotton Blend"],
    supportsWeave: false,
  },
};

// ==================== WEAVE TYPE FILTER ====================
/**
 * Weave Type Filter (Optional - Shown After Fabric Selection)
 * 
 * Notes:
 * - Uses dress sub-categories as weave type options
 * - Recommended for: Silk, Cotton, and Linen sarees
 * - Optional for: Net, Satin, Georgette, and Party Wear sarees
 * - Improves filtering, discovery, and SEO
 */
export const WEAVE_TYPES = [
  // Keep Ikat from original weave types
  {
    value: "ikat",
    label: "Ikat (Pochampally)",
    description: "Traditional Ikat pattern",
  },
  // Add all Saree sub-categories as weave types
  {
    value: "gadwal_pattu",
    label: "Gadwal Pattu Saree",
    description: "Traditional Gadwal saree",
  },
  {
    value: "venkatagri_pattu",
    label: "Venkatagri Pattu Saree",
    description: "Venkatagri silk saree",
  },
  {
    value: "chauderi",
    label: "Chauderi Saree",
    description: "Lightweight Chanderi saree",
  },
  {
    value: "kanchi_pattu_pure",
    label: "Kanchi Pattu Saree - Pure Pattu/Bridal",
    description: "Pure Kanjivaram bridal saree",
  },
  {
    value: "kanchi_pattu_semi",
    label: "Kanchi Pattu Saree - Semi Pattu",
    description: "Semi silk Kanjivaram saree",
  },
  {
    value: "kanchi_pattu_vintage",
    label: "Kanchi Pattu Saree - Vintage",
    description: "Vintage Kanjivaram saree",
  },
  {
    value: "banaras_pattu",
    label: "Banaras Pattu Saree",
    description: "Traditional Banarasi silk saree",
  },
  {
    value: "banaras_tissue",
    label: "Banaras Saree - Tissue",
    description: "Banarasi tissue saree",
  },
  {
    value: "digital_printed",
    label: "Digital Printed Saree",
    description: "Modern digital print saree",
  },
  {
    value: "chiffon_fancy",
    label: "Chiffon Fancy Saree - Thread Work & Half 'n' Half",
    description: "Chiffon saree with thread work",
  },
  {
    value: "kota",
    label: "Kota Saree",
    description: "Lightweight Kota saree",
  },
  {
    value: "bandini",
    label: "Bandini Saree",
    description: "Bandhani tie-dye saree",
  },
  {
    value: "khadi",
    label: "Khadi Saree",
    description: "Handspun khadi saree",
  },
  {
    value: "bengal_cotton",
    label: "Bengal Cotton Saree",
    description: "Traditional Bengal cotton saree",
  },
  {
    value: "mashru_satin",
    label: "Mashru Satin Saree",
    description: "Mashru silk satin saree",
  },
  {
    value: "organza",
    label: "Organza Saree",
    description: "Lightweight organza saree",
  },
  {
    value: "patola",
    label: "Patola Saree",
    description: "Traditional Patola saree",
  },
  {
    value: "georgette",
    label: "Georgette Saree",
    description: "Georgette saree",
  },
  {
    value: "seiko",
    label: "Seiko Saree",
    description: "Seiko fabric saree",
  },
  {
    value: "mulmul",
    label: "Mulmul Saree",
    description: "Soft mulmul cotton saree",
  },
];

// ==================== HELPER FUNCTIONS ====================

/**
 * Check if a fabric supports weave type selection
 * @param {string} fabricKey - The fabric category key
 * @returns {boolean} - Whether the fabric supports weave types
 */
export const fabricSupportsWeave = (fabricKey) => {
  if (!fabricKey) return false;
  const fabric = FABRIC_CATEGORIES[fabricKey];
  return fabric?.supportsWeave || false;
};

/**
 * Get subcategories for a given fabric
 * @param {string} fabricKey - The fabric category key
 * @returns {array} - Array of subcategory strings
 */
export const getFabricSubcategories = (fabricKey) => {
  if (!fabricKey) return [];
  const fabric = FABRIC_CATEGORIES[fabricKey];
  return fabric?.subcategories || [];
};

/**
 * Get all primary fabric options for dropdown
 * @returns {array} - Array of {value, label} objects
 */
export const getPrimaryFabricOptions = () => {
  return Object.keys(FABRIC_CATEGORIES).map((key) => ({
    value: key,
    label: FABRIC_CATEGORIES[key].label,
  }));
};

/**
 * Check if any selected fabric supports weave types
 * @param {array} selectedFabrics - Array of selected fabric keys
 * @returns {boolean} - Whether weave filter should be shown
 */
export const shouldShowWeaveFilter = (selectedFabrics = []) => {
  if (!Array.isArray(selectedFabrics) || selectedFabrics.length === 0) {
    return false;
  }
  return selectedFabrics.some((fabricKey) => fabricSupportsWeave(fabricKey));
};

// ==================== DRESS TYPE TO OCCASION MAPPING ====================
/**
 * Fixed mapping of dress types to their predetermined occasions
 * Each dress type has a specific occasion that is automatically set
 */
export const DRESS_TYPE_OCCASION_MAP = {
  // Wedding occasions
  "Lehenga": "wedding",
  "WEDDING": "wedding",
  "Lehenga Fabrics": "wedding",
  
  // Bridal occasions
  "Bridal Lehenga": "bridal",
  
  // Festive occasions
  "Saree": "festive",
  "Saree Fabrics": "festive",
  "ANARKALIS": "festive",
  "SHARARAS": "festive",
  "Anarkalis": "festive",
  "Sharara Sets": "festive",
  "Gowns": "festive",
  "PRET": "festive",
  "FUSION": "festive",
  "Kaftans": "festive",
  
  // Party occasions
  "Salwar Suit Sets (Top, Bottom & Dupatta)": "party",
  
  // Office/Daily occasions
  "Kurta-Sets": "daily",
  "Kurta & Dupatta Sets": "daily",
  "Skirts": "office",
  
  // Fabric categories
  "Cotton Fabric": "daily",
  "Silk Fabric": "festive",
  "Chiffon/Georgette Fabric": "party",
  "Linen Fabric": "office",
  "Printed Suit Sets": "festive",
  "Embroidered Suit Sets": "festive",
  "Handloom Suit Sets": "festive",
  "Summer Cotton Sets": "daily",
  "Winter Woolen Suit Fabrics": "daily",
  "Festive Wear Fabrics": "festive",
};

/**
 * Get the fixed occasion for a given dress type
 * @param {string} dressType - The selected dress type
 * @returns {string} - The occasion value (wedding, bridal, festive, party, office, daily)
 */
export const getOccasionForDressType = (dressType) => {
  if (!dressType) return "";
  return DRESS_TYPE_OCCASION_MAP[dressType] || "festive"; // default to festive
};
