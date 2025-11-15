export const INITIAL_FORM_DATA = {
  // Basic info
  title: "",
  description: "",
  productType: "Ready to Wear", // "Ready to Wear" | "Unstitched"
  category: "", // WOMEN / MEN / KIDS
  // Dress category -> dress type -> dress sub-category chain
  dressCategory: "", // e.g. "Ethnic Wear"
  dressType: "", // e.g. "Saree" or "Lehenga"
  dressSubCategory: "", // e.g. "Banarasi Saree" (optional deeper level)

  // Pricing & stock
  price: "", // selling price (string or number)
  mrp: "", // original MRP
  discountPercent: 0, // computed or manual
  currency: "INR",
  stock: 0, // total stock across sizes/colors
  sku: "", // optional SKU / product code
  isBackorderAllowed: false,
  isReturnable: true,
  deliveryEstimate: "", // e.g. "3-7 business days"

  // Sizes & variants
  productSizeType: "standard", // "standard" | "custom" | "length" etc
  selectedSizes: [], // ["S","M"]
  SIZES: ["XS", "S", "M", "L", "XL", "XXL"],

  // Colors & swatches
  availableColors: [], // array of color codes / objects shown in UI (for swatches)
  selectedColors: [], // selected color values
  colorsMetadata: [], // [{ code, name, value, shades:[] }]

  // Units / inventory mapping per size+color
  units: {}, // e.g. { "M|red": 10, "L|blue": 5 } or nested object

  // Material & craft
  fabric: "",
  craft: "",

  // Saree specific (keeps your existing shape)
  sareeParts: {
    blouse: { file: null, preview: null, url: null },
    pleats: { file: null, preview: null, url: null },
    pallu: { file: null, preview: null, url: null },
    shoulder: { file: null, preview: null, url: null },
  },
  generatedSareeImage: null,
  uploadedParts: {},

  // Images
  imageUrls: [],

  // Flags / UI features
  premium: null, // true/false
  isFeatured: false,
  isVirtualTryOnEnabled: false, // yellow "VIRTUAL TRY ON" CTA in UI
  enableLivePreview: false, // live product preview

  // Product details / metadata (appears in description area on UI)
  materialCare: "Dry clean only",
  composition: "", // e.g. "Net with embroidery"
  productDimensions: "", // if applicable
  numberOfPieces: "", // e.g. "3 (Lehenga, Blouse, Dupatta)"

  // Ratings & reviews summary
  rating: 0,
  reviewsCount: 0,
  reviewsSummary: {
    five: 0,
    four: 0,
    three: 0,
    two: 0,
    one: 0,
  },
  reviews: [], // array of { id, name, avatar, rating, text, createdAt }

  // Admin notes / supplier info
  supplierCode: "",
  supplierInfoUrl: "",

  // timestamps / temporary metadata
  createdAt: null,
  updatedAt: null,
};

export const READY_TO_WEAR_DRESS_TYPES = {
  "Ethnic Wear": [
    "Saree",
    "Lehenga",
    "ANARKALIS",
    "SHARARAS",
    "PRET",
    "FUSION",
    "WEDDING",
    "Saree",
    "Lehenga",
    "ANARKALIS",
    "SHARARAS",
    "PRET",
    "FUSION",
    "WEDDING",
    "Salwar Suit Sets (Top, Bottom & Dupatta)",
    "Kurta & Dupatta Sets",
  ],
  "Top Wear": ["T-Shirts", "Shirts", "Blouses"],
  "Bottom Wear": ["Jeans", "Trousers", "Skirts"],
  // You can add these later if needed:
  // "Dresses & Jumpsuits": [
  //   "Maxi Dresses",
  //   "Jumpsuits",
  // ],
  // "Active Wear": [
  //   "Sports Bras",
  //   "Leggings",
  // ],
  // "Winter Wear": [
  //   "Sweatshirts",
  //   "Jackets",
  // ],
  // "Lounge & Sleepwear": [
  //   "Night Suits",
  //   "Pajamas",
  // ],
};

// Unstitched Categories
export const UNSTITCHED_DRESS_TYPES = {
  "Ethnic Wear": [
    "ANARKALIS",
    "SHARARAS",
    "PRET",
    "FUSION",
    "WEDDING",
    "ANARKALIS",
    "SHARARAS",
    "PRET",
    "FUSION",
    "WEDDING",
    "Salwar Suit Sets (Top, Bottom & Dupatta)",
    "Kurta & Dupatta Sets",
    "Saree Fabrics",
    "Lehenga Fabrics",
  ],
  "Fabric by Meter": [
    "Cotton Fabric",
    "Silk Fabric",
    "Chiffon/Georgette Fabric",
    "Linen Fabric",
  ],
  "Printed & Embroidered Sets": [
    "Printed Suit Sets",
    "Embroidered Suit Sets",
    "Handloom Suit Sets",
  ],
  "Seasonal Fabrics": [
    "Summer Cotton Sets",
    "Winter Woolen Suit Fabrics",
    "Festive Wear Fabrics",
  ],
};

// Keep the old DRESS_TYPES for backward compatibility (optional)
export const DRESS_TYPES = READY_TO_WEAR_DRESS_TYPES;

export const MATERIAL_TYPES = [
  "Cotton",
  "Silk",
  "Silk Cotton",
  "Georgette",
  "Chiffon",
  "Net",
  "Velvet",
  "Crepe",
  "Khadi",
  "Tissue",
  "Pure Linen",
  "Kota",
  "Viscose",
  "Mulmul",
  "Organza",
];

export const DESIGN_TYPES = [
  "Embroidered",
  "Ajrakh",
  "Block Printed",
  "Batik",
  "Sanganeri",
  "Woven",
  "Printed",
  "Plain",
  "Sequined",
  "Beaded",
  "Mirror Work",
  "Dabu",
  "Shibori",
  "Mukasish",
  "Brocade",
  "Cutout",
  "Ikat",
  "Chikankariul",
];

export const COLORS = [
  {
    code: "red",
    name: "Red",
    value: "#FF0000",
    shades: [
      "#8B0000",
      "#B22222",
      "#DC143C",
      "#FF0000",
      "#FF4500",
      "#FF6347",
      "#FF7F7F",
      "#FFB6B6",
    ],
  },
  {
    code: "pink",
    name: "Pink",
    value: "#FF69B4",
    shades: [
      "#C71585",
      "#DB7093",
      "#FF1493",
      "#FF69B4",
      "#FFB6C1",
      "#FFC0CB",
      "#FFD6E7",
    ],
  },
  {
    code: "blue",
    name: "Blue",
    value: "#0000FF",
    shades: [
      "#00008B",
      "#0000CD",
      "#1E90FF",
      "#4169E1",
      "#4682B4",
      "#87CEEB",
      "#B0E0E6",
    ],
  },
  {
    code: "green",
    name: "Green",
    value: "#008000",
    shades: [
      "#006400",
      "#228B22",
      "#008000",
      "#32CD32",
      "#00FF7F",
      "#90EE90",
      "#C1E1C1",
    ],
  },
  {
    code: "orange",
    name: "Orange",
    value: "#FFA500",
    shades: [
      "#FF8C00",
      "#FF7F50",
      "#FF6347",
      "#FFA500",
      "#FFA07A",
      "#FFDAB9",
      "#FFE4B5",
      "#FFF5E1",
    ],
  },
  {
    code: "purple",
    name: "Purple",
    value: "#800080",
    shades: [
      "#4B0082",
      "#6A0DAD",
      "#800080",
      "#8A2BE2",
      "#9370DB",
      "#BA55D3",
      "#D8BFD8",
      "#E6E6FA",
    ],
  },
  {
    code: "black",
    name: "Black",
    value: "#000000",
    shades: [
      "#000000",
      "#2F2F2F",
      "#555555",
      "#808080",
      "#A9A9A9",
      "#C0C0C0",
      "#E0E0E0",
      "#F5F5F5",
    ],
  },
  {
    code: "white",
    name: "White",
    value: "#ffffffff",
    shades: ["#ffffffff"],
  },
];

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export const CATEGORIES = ["WOMEN", "MEN", "KIDS"];

export const PRODUCT_TYPES = ["Ready to Wear", "Unstitched"];

export const UPLOAD_CONFIG = {
  MAX_IMAGES: 4,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_TYPES: ["image/jpeg", "image/png", "image/gif"],
  CLOUDINARY_UPLOAD_PRESET: "tryon_unsigned",
  CLOUDINARY_CLOUD_NAME: "doiezptnn",
};

export const TABS = [
  { id: "general", label: "General" },
  { id: "size-pricing", label: "Size & Pricing" },
  { id: "upload", label: "Upload" },
];

// Helper function to check if dress type is saree
export const isSareeType = (dressType) => {
  if (!dressType) return false;
  const lowerType = dressType.toLowerCase();
  return lowerType.includes("saree") || lowerType.includes("sari");
};
