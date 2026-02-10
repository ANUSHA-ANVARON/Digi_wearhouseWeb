import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Settings, LogOut, Menu, X } from "lucide-react";
import menImage from "../../assets/men.png";
import womenImage from "../../assets/women.png";
import kidsImage from "../../assets/kids.png";
import accessoriesImage from "../../assets/accessories.png";
import logo from "../../assets/logo.png";
import notificationIcon from "../../assets/notification-icon.svg";
import user_icon from "../../assets/user-circle.svg";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/Context";

const Navbar = () => {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Get userData and signOut from context
  const { userData, signOut } = useApp();

  const notifRef = useRef(null);
  const categoriesRef = useRef(null);
  const profileRef = useRef(null);

  // Function to handle FAQ navigation
  const handleFAQClick = (e) => {
    e.preventDefault();
    if (location.pathname === "/") {
      const faqElement = document.getElementById("faq");
      if (faqElement) {
        faqElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      navigate("/");
      setTimeout(() => {
        const faqElement = document.getElementById("faq");
        if (faqElement) {
          faqElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
    setIsMobileMenuOpen(false);
  };

  // Categories data
  const categories = [
    {
      id: 1,
      name: "Women",
      image: womenImage,
      backgroundColor: "#D4A574",
      subcategories: {
        Topwear: [
          "T-shirts", "Tops & Blouses", "Shirts", "Kurtis & Kurtas",
          "Tunics", "Tank Tops", "Crop Tops", "Camisoles",
        ],
        Bottomwear: [
          "Jeans", "Trousers & Pants", "Leggings", "Palazzos",
          "Skirts", "Shorts", "Jeggings", "Culottes", "Dhoti Pants",
        ],
        "Ethnic wear": [
          "Sarees", "Salwar Suits", "Lehengas", "Anarkalis",
          "Dupattas", "Ethnic Jackets", "Gowns",
        ],
        Jumpsuits: [
          "Maxi Dresses", "Midi Dresses", "Bodycon Dresses",
          "A-line Dresses", "Jumpsuits", "Rompers",
        ],
        Sleepwear: [
          "Night Suits", "Nighties", "Pyjamas", "Loungewear Sets", "Robes",
        ],
        Winterwear: [
          "Sweaters", "Cardigans", "Sweatshirts", "Jackets",
          "Coats", "Shawls", "Ponchos",
        ],
        Activewear: [
          "Sports Bras", "Track Pants", "Workout T-Shirts",
          "Yoga Pants", "Joggers",
        ],
        Innerwear: ["Bras", "Panties", "Slips & Camisoles", "Shapewear"],
        Maternitywear: [
          "Maternity Dresses", "Feeding Tops", "Maternity Leggings",
        ],
      },
    },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotificationOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(e.target)) {
        setIsCategoriesOpen(false);
        setSelectedCategory(null);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle categories toggle
  const handleCategoriesToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const currentState = isCategoriesOpen;
    setIsCategoriesOpen(!currentState);
    if (currentState) {
      setSelectedCategory(null);
    }
  };

  // Determine navigation items based on current route
  const isHomeRoute =
    location.pathname === "/" ||
    location.pathname === "/who-we-are" ||
    location.pathname === "/privacy-policy" ||
    location.pathname === "/contact-us";

  const navItems = isHomeRoute
    ? [
      { name: "Home", type: "link", path: "/" },
      { name: "About", type: "link", path: "/who-we-are" },
      { name: "FAQ", type: "custom", action: handleFAQClick },
      { name: "Contact Us", type: "link", path: "/contact-us" },
      { name: "Dashboard", type: "link", path: "/dashboard" },
    ]
    : [
      // { name: "Dashboard", type: "link", path: "/dashboard" },
      { name: "Orders", type: "link", path: "/orders" },
      { name: "Add Product", type: "link", path: "/upload-products" },
    ];

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-8">
          <div className="flex justify-between items-center h-16 px-2 sm:px-4">
            {/* Logo */}
            <Link to={"/"}>
              <div className="flex items-center justify-center pt-2">
                <img
                  src={logo}
                  alt="DVYB Logo"
                  style={{
                    width: '39.56782531738281px',
                    height: '33.48046875px',
                    position: 'absolute',
                    top: '24.26px',
                    left: '175px',
                    opacity: 1
                  }}
                />
              </div>
            </Link>

            {/* ====== CENTER NAVIGATION (DESKTOP) ====== */}
            <div className="hidden lg:flex items-center justify-center space-x-8">
              {navItems.map((item) => {
                if (item.type === "link") {
                  return (
                    <Link key={item.name} to={item.path}>
                      <span className="cursor-pointer text-gray-700 hover:text-red-800 px-3 py-2 text-[17px] font-medium transition-colors">
                        {item.name}
                      </span>
                    </Link>
                  );
                } else if (item.type === "custom") {
                  return (
                    <button
                      key={item.name}
                      onClick={item.action}
                      className="cursor-pointer text-gray-700 hover:text-red-800 px-3 py-2 text-sm font-medium transition-colors"
                    >
                      {item.name}
                    </button>
                  );
                } else {
                  return (
                    <a key={item.name} href={item.path}>
                      <span className="cursor-pointer text-gray-700 hover:text-red-800 px-3 py-2 text-sm font-medium transition-colors">
                        {item.name}
                      </span>
                    </a>
                  );
                }
              })}

              {/* Categories Dropdown (only for non-home route) */}
              {!isHomeRoute && (
                <div className="relative" ref={categoriesRef}>
                  <button
                    onClick={handleCategoriesToggle}
                    className="flex items-center space-x-1 text-gray-700 hover:text-red-800 px-3 py-2 text-sm font-medium transition-colors duration-200"
                  >
                    <span className="text-[16px]">Categories</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${isCategoriesOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isCategoriesOpen && (
                    <div
                      className="absolute top-full left-[-150px] transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden"
                      style={{
                        width: "96vw",
                        maxHeight: "80vh",
                        overflowY: "auto",
                      }}
                    >
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l border-t border-gray-100"></div>

                      <div className="p-8">
                        {!selectedCategory ? (
                          <div className="max-w-6xl mx-auto">
                            <div className="grid grid-cols-4 gap-8 justify-center">
                              {categories.map((category) => (
                                <div
                                  key={category.id}
                                  className="flex flex-col items-center cursor-pointer group"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCategory(category);
                                  }}
                                >
                                  <div
                                    className="w-24 h-24 rounded-full mb-4 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-200 shadow-lg"
                                    style={{ backgroundColor: category.backgroundColor }}
                                  >
                                    <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                                  </div>
                                  <span className="text-lg font-semibold text-gray-800 transition-colors duration-200">
                                    {category.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="max-w-7xl mx-auto">
                            <div className="flex items-center justify-between mb-8">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCategory(null);
                                }}
                                className="flex items-center transition-colors cursor-pointer text-red-700 hover:text-red-800"
                              >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back
                              </button>
                              <h2 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">
                                {selectedCategory.name}
                              </h2>
                              <div></div>
                            </div>
                            <div className="grid grid-cols-6 gap-8">
                              {Object.entries(selectedCategory.subcategories).map(([subcategoryName, items]) => (
                                <div key={subcategoryName} className="space-y-4">
                                  <h3 className="text-lg font-semibold text-red-700 border-b border-gray-200 pb-2">
                                    {subcategoryName}
                                  </h3>
                                  <div className="space-y-2">
                                    {items.map((item, index) => (
                                      <a
                                        key={index}
                                        href="#"
                                        className="block text-start ps-8 text-sm text-gray-600 hover:text-red-800 hover:underline transition-colors duration-200 py-1"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setIsCategoriesOpen(false);
                                          setSelectedCategory(null);
                                        }}
                                      >
                                        {item}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ====== RIGHT SIDE ICONS / BUTTONS ====== */}
            <div className="flex items-center gap-4">

              {/* 1. LOGIN / REGISTER (Logged Out Only) - SINGLE BUTTON */}
              {!userData && (
                <div className="hidden lg:flex items-center gap-4">
                  <button
                    onClick={() => navigate("/register?mode=login", { state: { mode: "login" } })}
                    className="bg-red-800 hover:bg-red-900 text-white px-7 py-2 font-semibold transition-all duration-200 transform hover:scale-105"
                  >
                    Login / Register
                  </button>
                </div>
              )}

              {/* 2. NOTIFICATION & PROFILE (Logged In Only) */}
              {userData && (
                <div className="flex items-center gap-3">
                  {/* Notification Icon */}
                  <div className="relative" ref={notifRef}>
                    <button
                      className="p-2 cursor-pointer text-gray-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsNotificationOpen(!isNotificationOpen);
                      }}
                    >
                      <img src={notificationIcon} alt="notifications" className="w-6 h-6" />
                    </button>

                    {isNotificationOpen && (
                      <div
                        className="absolute right-0 w-80 bg-white backdrop-blur-lg rounded-2xl shadow-xl text-center z-50 border border-gray-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="absolute -top-2 right-5 w-4 h-4 bg-white rotate-45 shadow-md border-l border-t border-gray-100"></div>
                        <button
                          onClick={() => setIsNotificationOpen(false)}
                          className="absolute top-3 right-3 text-gray-500 hover:text-black transition-colors"
                        >
                          <X size={18} />
                        </button>

                        {/* Bell Icon in Maroon */}
                        <div className="flex justify-center mb-4 pt-6">
                          <span className="text-red-800 text-6xl">🔔</span>
                        </div>

                        <p className="text-gray-700 font-medium mb-4">No Notification yet</p>
                        <button className="cursor-pointer bg-red-800 text-white px-4 py-2 rounded-md hover:bg-red-900 transition-colors mb-6">
                          Explore Categories
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Profile Icon */}
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsProfileOpen(!isProfileOpen);
                      }}
                      className="p-2 text-gray-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors duration-200"
                    >
                      <img src={user_icon} alt="profile" className="w-6 h-6" />
                    </button>

                    {isProfileOpen && (
                      <div
                        className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="py-1">
                          <Link to={"/profile"}>
                            <button className="cursor-pointer flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <Settings size={18} className="mr-3" />
                              <span>Settings</span>
                            </button>
                          </Link>

                          {/* Logout Button */}
                          <button
                            onClick={() => {
                              signOut();
                              setIsProfileOpen(false);
                              navigate("/register?mode=login");
                            }}
                            className="cursor-pointer flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <LogOut size={18} className="mr-3" />
                            <span>Logout</span>
                          </button>

                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. MOBILE MENU BUTTON (Always Visible on Mobile) */}
              <div className="lg:hidden">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMobileMenuOpen(!isMobileMenuOpen);
                  }}
                  className="p-2 text-gray-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-200"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ====== MOBILE MENU DRAWER ====== */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const commonClass =
                  "block w-full text-center px-3 py-2 text-base font-medium text-gray-700 hover:text-red-800 hover:bg-gray-50 rounded-md transition-colors cursor-pointer";

                if (item.type === "link") {
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={commonClass}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  );
                } else if (item.type === "custom") {
                  return (
                    <button
                      key={item.name}
                      onClick={(e) => {
                        item.action?.(e);
                        setIsMobileMenuOpen(false);
                      }}
                      className={commonClass}
                    >
                      {item.name}
                    </button>
                  );
                } else {
                  return (
                    <a
                      key={item.name}
                      href={item.path}
                      className={commonClass}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </a>
                  );
                }
              })}

              {/* Mobile Login/Register (Logged Out Only) - SINGLE BUTTON */}
              {!userData && (
                <div className="flex flex-col gap-2 mt-4 px-3">
                  <button
                    onClick={() => {
                      navigate("/register?mode=login", { state: { mode: "login" } });
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-red-800 text-white px-4 py-2 rounded font-semibold"
                  >
                    Login / Register
                  </button>
                </div>
              )}

              {/* Mobile Categories (only for non-home route) */}
              {!isHomeRoute && (
                <div className="px-3 py-2">
                  <button
                    onClick={handleCategoriesToggle}
                    className="flex flex-col items-center w-full text-base font-medium text-gray-700 hover:text-red-800 transition-colors"
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>Categories</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${isCategoriesOpen ? "rotate-180" : ""}`}
                      />
                    </div>
                  </button>

                  {isCategoriesOpen && (
                    <div
                      className="mt-2 pl-4 space-y-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {!selectedCategory ? (
                        categories.map((category) => (
                          <button
                            key={category.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCategory(category);
                            }}
                            className="flex items-center space-x-3 py-2 text-sm text-gray-600 hover:text-red-800 w-full text-left"
                          >
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: category.backgroundColor }}
                            >
                              <img src={category.image} alt={category.name} className="w-full h-full object-cover rounded-full" />
                            </div>
                            <span>{category.name}</span>
                          </button>
                        ))
                      ) : (
                        // mobile subcategories
                        <div className="space-y-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCategory(null);
                            }}
                            className="flex items-center text-sm text-red-700 hover:text-red-800 mb-3"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Categories
                          </button>

                          <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            {selectedCategory.name}
                          </h3>

                          {Object.entries(selectedCategory.subcategories).map(([subcategoryName, items]) => (
                            <div key={subcategoryName} className="space-y-2">
                              <h4 className="text-sm font-medium text-red-700 border-b border-gray-200 pb-1">
                                {subcategoryName}
                              </h4>
                              <div className="space-y-1 pl-3">
                                {items.map((item, index) => (
                                  <button
                                    key={index}
                                    className="block text-xs text-gray-600 hover:text-red-800 py-1 w-full text-left"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIsCategoriesOpen(false);
                                      setSelectedCategory(null);
                                      setIsMobileMenuOpen(false);
                                    }}
                                  >
                                    {item}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;