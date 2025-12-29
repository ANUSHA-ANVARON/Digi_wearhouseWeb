  // import React, { useState, useEffect } from "react";
  // import { useApp } from "../../context/Context";
  // import firebaseService from "../../../SERVICES/firebaseService";
  // import { Plus, ArrowRight, Package, ArrowLeft } from "lucide-react";
  // import { Link, useNavigate } from "react-router-dom";

  // const ProductsPage = () => {
  //   const { currentUser } = useApp();
  //   const [products, setProducts] = useState([]);
  //   const [loading, setLoading] = useState(true);
  //   const [error, setError] = useState(null);
  //   const navigate = useNavigate();
  //   const [productStats, setProductStats] = useState({
  //     totalProducts: 0,
  //     lastAdded: null,
  //     categoryBreakdown: {
  //       women: 0,
  //       men: 0,
  //       kids: 0,
  //     },
  //     topPerformingProducts: [],
  //     categoryWiseProducts: [],
  //   });

  //   const handleBack = () => {
  //     navigate(-1);
  //   };

  //   // Fetch user's products
  //   useEffect(() => {
  //     const fetchProducts = async () => {
  //       if (!currentUser) {
  //         setError("Please log in to view your products");
  //         setLoading(false);
  //         return;
  //       }

  //       try {
  //         setLoading(true);
  //         console.log("Fetching products for user:", currentUser.uid);

  //         const userProducts = await firebaseService.getUserProducts(
  //           currentUser.uid
  //         );

  //         console.log("Fetched products:", userProducts);
  //         setProducts(userProducts);
  //         calculateStats(userProducts);
  //         setError(null);
  //       } catch (error) {
  //         console.error("Error fetching products:", error);
  //         setError(error.message || "Failed to fetch products");
  //       } finally {
  //         setLoading(false);
  //       }
  //     };

  //     fetchProducts();
  //   }, [currentUser]);

  //   // Calculate statistics from fetched products
  //   const calculateStats = (products) => {
  //     if (!products || products.length === 0) {
  //       setProductStats({
  //         totalProducts: 0,
  //         lastAdded: null,
  //         categoryBreakdown: { women: 0, men: 0, kids: 0 },
  //         topPerformingProducts: [],
  //         categoryWiseProducts: [],
  //       });
  //       return;
  //     }

  //     // Calculate total products
  //     const totalProducts = products.length;

  //     // Find last added product
  //     const sortedByDate = [...products].sort(
  //       (a, b) =>
  //         new Date(b.createdAt || b.timestamp || 0) -
  //         new Date(a.createdAt || a.timestamp || 0)
  //     );
  //     const lastAdded = sortedByDate[0]?.createdAt
  //       ? new Date(sortedByDate[0].createdAt).toLocaleDateString("en-US", {
  //           month: "2-digit",
  //           day: "2-digit",
  //           year: "numeric",
  //         })
  //       : "Unknown";

  //     // Calculate category breakdown
  //     const categoryBreakdown = { women: 0, men: 0, kids: 0 };
  //     const categoryStats = {};
  //     const dressTypeStats = {};

  //     products.forEach((product) => {
  //       const category = (product.category || "").toLowerCase();
  //       const dressType = product.dressType || "Other";

  //       // Category breakdown for main categories
  //       if (
  //         category.includes("women") ||
  //         category.includes("saree") ||
  //         category.includes("lehenga")
  //       ) {
  //         categoryBreakdown.women++;
  //       } else if (
  //         category.includes("men") ||
  //         category.includes("shirt") ||
  //         category.includes("trouser")
  //       ) {
  //         categoryBreakdown.men++;
  //       } else if (category.includes("kids") || category.includes("children")) {
  //         categoryBreakdown.kids++;
  //       } else if (category) {
  //         // If category doesn't match main ones, add to women by default
  //         categoryBreakdown.women++;
  //       }

  //       // Category-wise stats
  //       if (category) {
  //         categoryStats[category] = (categoryStats[category] || 0) + 1;
  //       }

  //       // Dress type stats
  //       if (dressType) {
  //         dressTypeStats[dressType] = (dressTypeStats[dressType] || 0) + 1;
  //       }
  //     });

  //     // Get top performing products (most recent published ones)
  //     const topPerformingProducts = products
  //       .filter((product) => product.isPublished)
  //       .sort(
  //         (a, b) =>
  //           new Date(b.createdAt || b.timestamp || 0) -
  //           new Date(a.createdAt || a.timestamp || 0)
  //       )
  //       .slice(0, 3)
  //       .map((product) => ({
  //         id: product.id,
  //         name: product.title || "Untitled Product",
  //         image: product.imageUrls?.[0] || "/api/placeholder/60/60",
  //         category: product.category || "uncategorized",
  //       }));

  //     // Create category wise products from both category and dress type stats
  //     const allCategories = { ...categoryStats, ...dressTypeStats };
  //     const categoryWiseProducts = Object.entries(allCategories)
  //       .sort(([, a], [, b]) => b - a) // Sort by count descending
  //       .slice(0, 6) // Take top 6
  //       .map(([name, count], index) => ({
  //         id: index + 1,
  //         name: name.charAt(0).toUpperCase() + name.slice(1),
  //         items: count,
  //         image: "/api/placeholder/60/60",
  //       }));

  //     setProductStats({
  //       totalProducts,
  //       lastAdded,
  //       categoryBreakdown,
  //       topPerformingProducts,
  //       categoryWiseProducts,
  //     });
  //   };

  //   // Format date
  //   const formatDate = (dateString) => {
  //     if (!dateString) return "Unknown";
  //     return new Date(dateString).toLocaleDateString("en-US", {
  //       year: "numeric",
  //       month: "short",
  //       day: "numeric",
  //     });
  //   };

  //   // Loading state
  //   if (loading) {
  //     return (
  //       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //         <div className="text-center">
  //           {/* CHANGED */}
  //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800000] mx-auto mb-4"></div>
  //           <p className="text-gray-600">Loading your products...</p>
  //         </div>
  //       </div>
  //     );
  //   }

  //   // Error state
  //   if (error) {
  //     return (
  //       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //         <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-sm">
  //           <div className="text-red-500 text-6xl mb-4">⚠️</div>
  //           <h2 className="text-xl font-semibold text-gray-900 mb-2">
  //             Error Loading Products
  //           </h2>
  //           <p className="text-gray-600 mb-4">{error}</p>
  //           <button
  //             onClick={() => window.location.reload()}
  //             // CHANGED - Using a slightly darker maroon for hover
  //             className="bg-[#800000] hover:bg-[#600000] text-white px-4 py-2 rounded-lg transition-colors"
  //           >
  //             Retry
  //           </button>
  //         </div>
  //       </div>
  //     );
  //   }

  //   return (
  //     <div className="min-h-screen bg-gray-50 p-4 md:p-6">
  //       <div className="max-w-7xl mx-auto mt-7 mb-4 flex items-center space-x-2">
  //         <button
  //           onClick={handleBack}
  //           aria-label="Go Back"
  //           className="p-2 rounded hover:bg-gray-200 transition"
  //         >
  //           <ArrowLeft size={24} />
  //         </button>
  //         <h1 className="text-black text-xl font-bold text-start">Products</h1>
  //       </div>
  //       <div className="max-w-7xl mx-auto">
  //         {/* Top Cards Grid */}
  //         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
  //           {/* Total Products Card */}
  //           {/* CHANGED - Using a slightly darker maroon for gradient */}
  //           <div className="bg-gradient-to-br from-[#800000] to-[#600000] rounded-2xl p-6 text-white relative overflow-hidden">
  //             <Link to={"/recenltyproducts"}>
  //               <div className="relative z-10">
  //                 <h2 className="text-lg md:text-xl font-semibold mb-2">
  //                   Total Products{" "}
  //                 </h2>
  //                 <div className="mb-4">
  //                   <p className="text-sm opacity-90">Last added</p>
  //                   <p className="text-sm opacity-90">
  //                     {productStats.lastAdded || "No products yet"}
  //                   </p>
  //                 </div>
  //                 <div className="text-5xl md:text-6xl font-bold mb-4">
  //                   {productStats.totalProducts}
  //                 </div>
  //               </div>
  //             </Link>
  //           </div>

  //           {/* Category Breakdown */}
  //           <div className="space-y-4">
  //             {/* Women */}
  //             {/* CHANGED - Using a slightly darker maroon for gradient */}
  //             {/* <div className="bg-gradient-to-r from-[#800000] to-[#600000] rounded-2xl p-4 md:p-6 text-white">
  //               <div className="flex items-center justify-between">
  //                 <h3 className="text-lg md:text-xl font-semibold">Women</h3>
  //                 <span className="text-2xl md:text-3xl font-bold">
  //                   {productStats.categoryBreakdown.women}
  //                 </span>
  //               </div>
  //             </div> */}
  //             <div className="bg-white rounded-2xl p-6 shadow-sm">
  //               <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">
  //                 Category Wise products
  //               </h2>

  //               {productStats.categoryWiseProducts.length > 0 ? (
  //                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  //                   {productStats.categoryWiseProducts.map((category) => (
  //                     <div
  //                       key={category.id}
  //                       className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
  //                     >
  //                       {/* CHANGED - Using maroon gradient for these icons */}
  //                       <div className="w-12 h-12 bg-gradient-to-br from-[#800000] to-[#600000] rounded-lg flex-shrink-0 flex items-center justify-center">
  //                         <Package className="w-6 h-6 text-white" />
  //                       </div>
  //                       <div className="flex-1 min-w-0">
  //                         <h4 className="font-medium text-gray-800 text-sm md:text-base">
  //                           {category.name}
  //                         </h4>
  //                         <p className="text-xs md:text-sm text-gray-500">
  //                           {category.items} item{category.items !== 1 ? "s" : ""}
  //                         </p>
  //                       </div>
  //                     </div>
  //                   ))}
  //                 </div>
  //               ) : (
  //                 <div className="text-center py-8 text-gray-500">
  //                   <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
  //                   <p>No categories found</p>
  //                 </div>
  //               )}
  //             </div>

  //             {/* Men */}
  //             {/* CHANGED - Using a slightly darker maroon for gradient */}
  //             {/* <div className="bg-gradient-to-r from-[#800000] to-[#600000] rounded-2xl p-4 md:p-6 text-white">
  //               <div className="flex items-center justify-between">
  //                 <h3 className="text-lg md:text-xl font-semibold">Men</h3>
  //                 <span className="text-2xl md:text-3xl font-bold">
  //                   {productStats.categoryBreakdown.men}
  //                 </span>
  //               </div>
  //             </div> */}

  //             {/* Kids */}
  //             {/* CHANGED - Using a slightly darker maroon for gradient */}
  //             {/* <div className="bg-gradient-to-r from-[#800000] to-[#600000] rounded-2xl p-4 md:p-6 text-white">
  //               <div className="flex items-center justify-between">
  //                 <h3 className="text-lg md:text-xl font-semibold">Kids</h3>
  //                 <span className="text-2xl md:text-3xl font-bold">
  //                   {productStats.categoryBreakdown.kids}
  //                 </span>
  //               </div>
  //             </div> */}
  //           </div>

  //           {/* Add Products Button */}
  //           <Link to={"/upload-products"}>
  //             {/* CHANGED - Using maroon gradient and icon color */}
  //             <div className="bg-gradient-to-br from-[#800000] to-[#600000] rounded-2xl p-6 text-white flex flex-col items-center justify-center cursor-pointer hover:from-[#600000] hover:to-[#500000] transition-all duration-300">
  //               <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center mb-4 hover:scale-105 transition-transform duration-300">
  //                 <Plus className="w-8 h-8 md:w-10 md:h-10 text-[#800000]" />
  //               </div>
  //               <h3 className="text-lg md:text-xl font-semibold text-center">
  //                 Add Products
  //               </h3>
  //             </div>
  //           </Link>
  //         </div>

  //         {/* Bottom Section */}
  //         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
  //           <div className="bg-white rounded-2xl p-6 shadow-sm">
  //             <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">
  //               Top Performing Products
  //             </h2>

  //             {productStats.topPerformingProducts.length > 0 ? (
  //               <div className="space-y-4">
  //                 {productStats.topPerformingProducts.map((product) => (
  //                   <div
  //                     key={product.id}
  //                     className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200 group"
  //                   >
  //                     <div className="flex items-center space-x-4">
  //                       {/* CHANGED - Using #FEC601 gold color as accent */}
  //                       <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#FEC601] to-[#eab308] rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
  //                         {product.image &&
  //                         product.image !== "/api/placeholder/60/60" ? (
  //                           <img
  //                             src={product.image}
  //                             alt={product.name}
  //                             className="w-full h-full object-cover"
  //                           />
  //                         ) : (
  //                           <Package className="w-6 h-6 text-white" />
  //                         )}
  //                       </div>
  //                       <div>
  //                         <h4 className="font-medium text-gray-800 text-sm md:text-base">
  //                           {product.name}
  //                         </h4>
  //                         <p className="text-xs text-gray-500 capitalize">
  //                           {product.category}
  //                         </p>
  //                       </div>
  //                     </div>
  //                     <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
  //                   </div>
  //                 ))}
  //               </div>
  //             ) : (
  //               <div className="text-center py-8 text-gray-500">
  //                 <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
  //                 <p>No published products yet</p>
  //               </div>
  //             )}
  //           </div>

  //           {/* Category Wise Products */}
  //           {/* <div className="bg-white rounded-2xl p-6 shadow-sm">
  //             <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">
  //               Category Wise products
  //             </h2>

  //             {productStats.categoryWiseProducts.length > 0 ? (
  //               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  //                 {productStats.categoryWiseProducts.map((category) => (
  //                   <div
  //                     key={category.id}
  //                     className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
  //                   >

  //                     <div className="w-12 h-12 bg-gradient-to-br from-[#800000] to-[#600000] rounded-lg flex-shrink-0 flex items-center justify-center">
  //                       <Package className="w-6 h-6 text-white" />
  //                     </div>
  //                     <div className="flex-1 min-w-0">
  //                       <h4 className="font-medium text-gray-800 text-sm md:text-base">
  //                         {category.name}
  //                       </h4>
  //                       <p className="text-xs md:text-sm text-gray-500">
  //                         {category.items} item{category.items !== 1 ? "s" : ""}
  //                       </p>
  //                     </div>
  //                   </div>
  //                 ))}
  //               </div>
  //             ) : (
  //               <div className="text-center py-8 text-gray-500">
  //                 <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
  //                 <p>No categories found</p>
  //               </div>
  //             )}
  //           </div> */}
  //         </div>

  //         {/* Empty State for No Products */}
  //         {productStats.totalProducts === 0 && (
  //           <div className="bg-white rounded-2xl p-8 text-center mt-6">
  //             <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
  //               <Package className="w-12 h-12 text-gray-400" />
  //             </div>
  //             <h3 className="text-lg font-semibold text-gray-900 mb-2">
  //               No products yet
  //             </h3>
  //             <p className="text-gray-600 mb-6">
  //               Start by adding your first product to see analytics
  //             </p>
  //             <Link
  //               to="/upload-products"
  //               // CHANGED - Using maroon for button
  //               className="inline-flex items-center bg-[#800000] hover:bg-[#600000] text-white px-6 py-3 rounded-lg font-medium transition-colors"
  //             >
  //               <Plus className="w-4 h-4 mr-2" />
  //               Add Your First Product
  //             </Link>
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   );
  // };

  // export default ProductsPage;

  import React, { useState, useEffect } from "react";
  import { useApp } from "../../context/Context";
  import firebaseService from "../../../SERVICES/firebaseService";
  import { Plus, ArrowRight, Package, ArrowLeft, Edit3 } from "lucide-react";
  import { Link, useNavigate } from "react-router-dom";
  import { useProductDrafts } from "../../CustomHooks/useProductDrafts";

  const ProductsPage = () => {
    const { currentUser } = useApp();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { drafts } = useProductDrafts(); // Drafts hook
    const [productStats, setProductStats] = useState({
      totalProducts: 0,
      lastAdded: null,
      categoryBreakdown: {
        women: 0,
        men: 0,
        kids: 0,
      },
      topPerformingProducts: [],
      categoryWiseProducts: [],
    });

    const [isbulkupload , setbulkupload]  = useState(false)

    const handleBack = () => {
      navigate(-1);
    };

    // Fetch user's products
    useEffect(() => {
      const fetchProducts = async () => {
        if (!currentUser) {
          setError("Please log in to view your products");
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          console.log("Fetching products for user:", currentUser.uid);

          const userProducts = await firebaseService.getUserProducts(
            currentUser.uid
          );

          console.log("Fetched products:", userProducts);
          setProducts(userProducts);
          calculateStats(userProducts);
          setError(null);
        } catch (error) {
          console.error("Error fetching products:", error);
          setError(error.message || "Failed to fetch products");
        } finally {
          setLoading(false);
        }
      };

      fetchProducts();
    }, [currentUser]);

    // Calculate statistics from fetched products
    const calculateStats = (products) => {
      if (!products || products.length === 0) {
        setProductStats({
          totalProducts: 0,
          lastAdded: null,
          categoryBreakdown: { women: 0, men: 0, kids: 0 },
          topPerformingProducts: [],
          categoryWiseProducts: [],
        });
        return;
      }

      // Calculate total products
      const totalProducts = products.length;

      // Find last added product
      const sortedByDate = [...products].sort(
        (a, b) =>
          new Date(b.createdAt || b.timestamp || 0) -
          new Date(a.createdAt || a.timestamp || 0)
      );
      const lastAdded = sortedByDate[0]?.createdAt
        ? new Date(sortedByDate[0].createdAt).toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        })
        : "Unknown";

      // Calculate category breakdown
      const categoryBreakdown = { women: 0, men: 0, kids: 0 };
      const categoryStats = {};
      const dressTypeStats = {};

      products.forEach((product) => {
        const category = (product.category || "").toLowerCase();
        const dressType = product.dressType || "Other";

        // Category breakdown for main categories
        if (
          category.includes("women") ||
          category.includes("saree") ||
          category.includes("lehenga")
        ) {
          categoryBreakdown.women++;
        } else if (
          category.includes("men") ||
          category.includes("shirt") ||
          category.includes("trouser")
        ) {
          categoryBreakdown.men++;
        } else if (category.includes("kids") || category.includes("children")) {
          categoryBreakdown.kids++;
        } else if (category) {
          // If category doesn't match main ones, add to women by default
          categoryBreakdown.women++;
        }

        // Category-wise stats
        if (category) {
          categoryStats[category] = (categoryStats[category] || 0) + 1;
        }

        // Dress type stats
        if (dressType) {
          dressTypeStats[dressType] = (dressTypeStats[dressType] || 0) + 1;
        }
      });

      // Get top performing products (most recent published ones)
      const topPerformingProducts = products
        .filter((product) => product.isPublished)
        .sort(
          (a, b) =>
            new Date(b.createdAt || b.timestamp || 0) -
            new Date(a.createdAt || a.timestamp || 0)
        )
        .slice(0, 3)
        .map((product) => ({
          id: product.id,
          name: product.title || "Untitled Product",
          image: product.imageUrls?.[0] || "/api/placeholder/60/60",
          category: product.category || "uncategorized",
        }));

      // Create category wise products from both category and dress type stats
      const allCategories = { ...categoryStats, ...dressTypeStats };
      const categoryWiseProducts = Object.entries(allCategories)
        .sort(([, a], [, b]) => b - a) // Sort by count descending
        .slice(0, 6) // Take top 6
        .map(([name, count], index) => ({
          id: index + 1,
          name: name.charAt(0).toUpperCase() + name.slice(1),
          items: count,
          image: "/api/placeholder/60/60",
        }));

      setProductStats({
        totalProducts,
        lastAdded,
        categoryBreakdown,
        topPerformingProducts,
        categoryWiseProducts,
      });
    };

    // Format date
    const formatDate = (dateString) => {
      if (!dateString) return "Unknown";
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    // Loading state
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            {/* CHANGED */}
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800000] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your products...</p>
          </div>
        </div>
      );
    }



    // Error state
    if (error) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-sm">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Products
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              // CHANGED - Using a slightly darker maroon for hover
              className="bg-[#800000] hover:bg-[#600000] text-white px-4 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return (
<>

 {isbulkupload && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    onClick={() => setbulkupload(false)}
  >
    <div
      className="bg-white w-[420px] rounded-xl shadow-lg p-6 relative"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close Button */}
      <button
        onClick={() => setbulkupload(false)}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>

      {/* Title */}
      <h2 className="text-center text-lg font-semibold text-gray-800 mb-6">
        Select one
      </h2>

      {/* Options */}
      <div className="flex gap-4">
        {/* Add One Product */}
        <div
          onClick={() => {
            setbulkupload(false);
            navigate("/upload-products");
          }}
          className="flex-1 border rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
        >
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
            <Plus className="text-white w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-800">
            Add One Product
          </p>
        </div>

        {/* Add Bulk Products */}
        <div
          onClick={() => {
            setbulkupload(false);
            navigate("/bulk-upload");
          }}
          className="flex-1 border rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 hover:bg-gray-50 transition"
        >
          <div className="w-12 h-12 bg-gray-400 rounded-lg flex items-center justify-center mb-3">
            📄
          </div>
          <p className="text-sm font-medium text-gray-800">
            Add Bulk Products
          </p>
        </div>
      </div>

      {/* Help */}
      <div className="mt-6 text-center">
        <button className="text-sm text-blue-600 hover:underline flex items-center justify-center gap-1 mx-auto">
          Need help ?
        </button>
      </div>
    </div>
  </div>
)}

      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto mt-7 mb-4 flex items-center space-x-2">
          <button
            onClick={handleBack}
            aria-label="Go Back"
            className="p-2 rounded hover:bg-gray-200 transition"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-black text-xl font-bold text-start">Products</h1>
        </div>
        <div className="max-w-7xl mx-auto">
          {/* Top Cards Grid - CHANGED to lg:grid-cols-2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Total Products Card */}
            <div className="bg-gradient-to-br from-[#800000] to-[#600000] rounded-2xl p-6 text-white relative overflow-hidden flex flex-col justify-between">
              <div className="flex flex-col items-center z-10">
                <h2 className="text-lg md:text-xl font-semibold mb-2">
                  Total Products
                </h2>

                <Link to={"/recenltyproducts"} className="block mb-6">
                  <div className="text-5xl md:text-6xl font-bold text-center hover:scale-105 transition-transform">
                    {productStats.totalProducts}
                  </div>
                </Link>

                <div className="flex items-center justify-center gap-8 w-full">
                  {/* Last Added Section */}
                  <div className="text-center">
                    <p className="text-sm opacity-90 mb-1">Last added</p>
                    <p className="font-medium text-base">
                      {productStats.lastAdded || "No products"}
                    </p>
                  </div>

                  <div className="w-px h-10 bg-white/20"></div>

                  {/* Drafts Section */}
                  <Link to="/drafts" className="text-center group block">
                    <div className="flex items-center justify-center gap-1.5 mb-1 group-hover:text-amber-200 transition-colors">
                      <p className="text-sm opacity-90">Drafts</p>
                      <Edit3 className="w-3.5 h-3.5" />
                    </div>
                    <div className="font-medium text-base flex items-center justify-center gap-2">
                      {drafts.length}
                      {drafts.length > 0 && (
                        <span className="text-xs text-amber-300 font-normal animate-pulse">
                          Resume
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              </div>

              {/* Add Product Button Section */}
          <div
    onClick={(e) => {
      e.stopPropagation();
      setbulkupload(true);
    }}
    className="mt-6 bg-white/20 hover:bg-white/30 text-white rounded-lg p-4 flex items-center justify-center"
  >
    <Plus className="w-5 h-6 mr-2" />
    Add New Product
  </div>
            </div>

            {/* Category Breakdown (Now Category Wise Products) */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm h-full">
                {" "}
                {/* Added h-full */}
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">
                  Category Wise products
                </h2>
                {productStats.categoryWiseProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {productStats.categoryWiseProducts.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-[#800000] to-[#600000] rounded-lg flex-shrink-0 flex items-center justify-center">
                          <Package className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-800 text-sm md:text-base">
                            {category.name}
                          </h4>
                          <p className="text-xs md:text-sm text-gray-500">
                            {category.items} item{category.items !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 flex flex-col items-center justify-center h-full">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No categories found</p>
                  </div>
                )}
              </div>
              {/* Men */}
              {/* <div className="bg-gradient-to-r from-[#800000] to-[#600000] rounded-2xl p-4 md:p-6 text-white">
                ...
              </div> */}
              {/* Kids */}
              {/* <div className="bg-gradient-to-r from-[#800000] to-[#600000] rounded-2xl p-4 md:p-6 text-white">
                ...
              </div> */}
            </div>

            {/* Add Products Button - REMOVED (Merged into Total Products) */}
            {/* <Link to={"/upload-products"}>
              ...
            </Link> */}
          </div>

          {/* Bottom Section - CHANGED to lg:grid-cols-1 */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 md:gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">
                Top Performing Products
              </h2>

              {productStats.topPerformingProducts.length > 0 ? (
                <div className="space-y-4">
                  {productStats.topPerformingProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200 group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#FEC601] to-[#eab308] rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {product.image &&
                            product.image !== "/api/placeholder/60/60" ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 text-sm md:text-base">
                            {product.name}
                          </h4>
                          <p className="text-xs text-gray-500 capitalize">
                            {product.category}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No published products yet</p>
                </div>
              )}
            </div>

            {/* Category Wise Products (Commented out section) */}
            {/* <div className="bg-white rounded-2xl p-6 shadow-sm">
              ...
            </div> */}
          </div>

          {/* Empty State for No Products */}
          {productStats.totalProducts === 0 && (
            <div className="bg-white rounded-2xl p-8 text-center mt-6">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No products yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start by adding your first product to see analytics
              </p>
              <Link
                to="/upload-products"
                className="inline-flex items-center bg-[#800000] hover:bg-[#600000] text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Product
              </Link>
            </div>
          )}
        </div>
      </div>
</>

    );
  };

  export default ProductsPage;
