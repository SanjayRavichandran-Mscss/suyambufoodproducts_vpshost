import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LogOut,
  ShoppingCart,
  Package,
  Menu,
  X,
  Search,
  User,
  Phone,
} from "lucide-react";

export default function Header({
  customerData,
  onLoginClick,
  onRegisterClick,
  cartItems,
  onCartClick,
  onOrdersClick,
  onSearch,
  selectedCategory,
  onCategorySelect,
  onResetCategory,
}) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [headerTranslateY, setHeaderTranslateY] = useState(0);
  const [showCartPanel, setShowCartPanel] = useState(false);
  const [showLoginPanel, setShowLoginPanel] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const userDropdownRef = useRef(null);
  const location = useLocation(); // To detect current page for navigation

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Effect to handle clicks outside of the user dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll-based header visibility
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateHeader = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Scrolling down, hide header
        setHeaderTranslateY(-100);
      } else {
        // Scrolling up or at top, show header
        setHeaderTranslateY(0);
      }
      lastScrollY = currentScrollY > 0 ? currentScrollY : 0;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerId");
    setShowUserDropdown(false);
    window.location.reload();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query.trim());
    }
  };

  const handleUserClick = () => {
    if (customerData) {
      setShowUserDropdown(!showUserDropdown);
    } else {
      // Trigger login panel
      setShowLoginPanel(true);
      if (onLoginClick) onLoginClick();
    }
  };

  const handleCartClick = () => {
    setShowCartPanel(true);
    if (onCartClick) onCartClick();
  };

  const handleOrdersClick = () => {
    setShowCartPanel(false);
    setShowLoginPanel(false);
    if (onOrdersClick) onOrdersClick();
  };

  const closePanels = () => {
    setShowCartPanel(false);
    setShowLoginPanel(false);
    setShowUserDropdown(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closePanels();
    }
  };

  const handleScrollToBanner = () => {
    const bannerElement = document.getElementById('banner');
    if (bannerElement) {
      bannerElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (onResetCategory) {
      onResetCategory();
    }
    setShowMobileMenu(false);
    closePanels();
  };

  const handleScrollToProducts = () => {
    const productsElement = document.getElementById('products');
    if (productsElement) {
      productsElement.scrollIntoView({ behavior: 'smooth' });
    }
    setShowMobileMenu(false);
    closePanels();
  };

  // Check if current page is home for scroll vs navigate
  const isHomePage = location.pathname === '/' || location.pathname === '/customer';

  const BRAND_PRIMARY = "#3D2F23"; // Dark brown for text
  const BRAND_SECONDARY = "#B6895B"; // Gold/Brown for accents
  const BACKGROUND_COLOR = "#FFFFFF"; // White background

  // Responsive side panel width: full on mobile, 400px on desktop
  const panelWidth = 'w-full md:w-96 lg:w-[400px]';

  return (
    <>
      {/* Global Styles for Marquee and Panels */}
      <style>{`
        .marquee-container {
          width: 100%;
          overflow: hidden;
        }
        .marquee-text {
          display: inline-block;
          white-space: nowrap;
          animation: marquee 20s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .side-panel-enter {
          transform: translateX(100%);
        }
        .side-panel-enter-active {
          transform: translateX(0);
          transition: transform 300ms ease-in-out;
        }
        .side-panel-exit {
          transform: translateX(0);
        }
        .side-panel-exit-active {
          transform: translateX(100%);
          transition: transform 300ms ease-in-out;
        }
        .vertical-scale-enter {
          transform: scaleY(0);
        }
        .vertical-scale-enter-active {
          transform: scaleY(1);
          transition: transform 300ms ease-in-out;
        }
        .vertical-scale-exit {
          transform: scaleY(1);
        }
        .vertical-scale-exit-active {
          transform: scaleY(0);
          transition: transform 300ms ease-in-out;
        }
      `}</style>

      {/* Marquee Banner Above Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#3D2F23] text-white py-2 overflow-hidden">
        <div className="relative">
          <div className="flex items-center justify-between px-4 md:px-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <Phone size={16} className="mr-2" />
                <span className="text-sm">+91 9345872342</span>
              </div>
            </div>
            <div className="flex-1 mx-8">
              <div className="marquee-container">
                <div className="marquee-text">
                  Free Shipping | 45% Discount | Limited Time Offer | Free Shipping | 45% Discount | Limited Time Offer
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">Welcome!</span>
            </div>
          </div>
        </div>
      </div>

      <header
        className="bg-white px-4 md:px-8 py-3 fixed top-[40px] left-0 right-0 z-40 shadow-sm flex items-center justify-between transition-transform duration-300 ease-out"
        style={{ 
          backgroundColor: BACKGROUND_COLOR,
          transform: `translateY(${headerTranslateY}%)`
        }}
      >
        {/* Left Section: Logo & Mobile Menu */}
        <div className="flex items-center">
          <button
            className="md:hidden mr-3 p-1 rounded-md"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            style={{ color: BRAND_PRIMARY }}
          >
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link to="/" className="flex items-center">
            <img
              src="/Assets/Suyambu_Eng_logo.png"
              alt="Suyambu Stores Logo"
              className="h-10 md:h-12 object-contain"
            />
          </Link>
        </div>

        {/* Center Section: Navigation */}
        <nav className="hidden md:flex flex-1 justify-center items-center gap-8 font-medium">
          {isHomePage ? (
            <button
              onClick={handleScrollToBanner}
              className={`font-medium ${!selectedCategory ? 'text-[#B6895B]' : ''}`}
              style={{ color: BRAND_PRIMARY }}
            >
              Home
            </button>
          ) : (
            <Link to="/" style={{ color: BRAND_PRIMARY }}>
              Home
            </Link>
          )}
          {isHomePage ? (
            <button
              onClick={handleScrollToProducts}
              className="font-medium"
              style={{ color: BRAND_PRIMARY }}
            >
              Shop
            </button>
          ) : (
            <Link to="/customer" style={{ color: BRAND_PRIMARY }}>
              Shop
            </Link>
          )}
          <Link to="/about" style={{ color: BRAND_PRIMARY }}>
            About Us
          </Link>
          <Link to="/contact" style={{ color: BRAND_PRIMARY }}>
            Contact
          </Link>
        </nav>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-4 md:gap-6">
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden lg:block"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="pl-10 pr-4 py-2 rounded-lg text-sm border focus:outline-none focus:ring-1"
              style={{
                borderColor: BRAND_SECONDARY,
                ringColor: BRAND_SECONDARY,
              }}
            />
            <button
              type="submit"
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: BRAND_SECONDARY }}
            >
              <Search size={18} />
            </button>
          </form>

          <button
            onClick={handleUserClick}
            style={{ color: BRAND_PRIMARY }}
            className="relative hover:opacity-80 transition-opacity"
          >
            <User size={24} />
          </button>

          <button
            onClick={handleCartClick}
            className="relative hover:opacity-80 transition-opacity"
            style={{ color: BRAND_PRIMARY }}
          >
            <ShoppingCart size={24} />
            {Array.isArray(cartItems) && cartItems.length > 0 && (
              <span
                className="absolute -top-2 -right-2 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
                style={{ backgroundColor: BRAND_SECONDARY }}
              >
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>

        {/* User Dropdown */}
        {showUserDropdown && customerData && (
          <div
            ref={userDropdownRef}
            className="absolute right-4 top-16 mt-2 w-56 bg-white rounded-lg shadow-lg z-50 overflow-hidden border"
          >
            <div className="p-4 border-b">
              <div className="font-semibold">{customerData.full_name}</div>
              <div className="text-xs text-gray-500 mt-1">
                {customerData.email}
              </div>
            </div>
            <div className="p-2">
              <button
                onClick={handleOrdersClick}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 text-sm"
              >
                <Package size={16} /> My Orders
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 text-sm"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        )}
      </header>
      
      {/* Mobile Menu - Sliding Side Panel */}
      {showMobileMenu && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-45 md:hidden"
            onClick={() => setShowMobileMenu(false)}
          />
          {/* Side Panel */}
          <div 
            className="fixed top-[40px] right-0 h-[calc(100vh-40px)] w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-lg overflow-y-auto md:hidden"
            style={{ backgroundColor: BACKGROUND_COLOR }}
          >
            <div className="p-6">
              <button
                onClick={() => setShowMobileMenu(false)}
                className="absolute top-4 right-4 text-gray-500"
              >
                <X size={24} />
              </button>
              <nav className="flex flex-col gap-6 text-lg font-medium mt-8">
                {/* Mobile Search */}
                <form onSubmit={handleSearchSubmit} className="relative w-full mb-4">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg text-sm border"
                    style={{ borderColor: BRAND_SECONDARY }}
                  />
                  <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: BRAND_SECONDARY }}>
                    <Search size={18} />
                  </button>
                </form>

                {isHomePage ? (
                  <button 
                    onClick={handleScrollToBanner}
                    className={`py-2 ${!selectedCategory ? 'text-[#B6895B]' : ''}`}
                    style={{ color: BRAND_PRIMARY }}
                  >
                    Home
                  </button>
                ) : (
                  <Link to="/" onClick={() => setShowMobileMenu(false)} style={{ color: BRAND_PRIMARY }}>
                    Home
                  </Link>
                )}
                {isHomePage ? (
                  <button 
                    onClick={handleScrollToProducts}
                    className="py-2"
                    style={{ color: BRAND_PRIMARY }}
                  >
                    Shop
                  </button>
                ) : (
                  <Link to="/customer" onClick={() => setShowMobileMenu(false)} style={{ color: BRAND_PRIMARY }}>
                    Shop
                  </Link>
                )}
                <Link to="/about" onClick={() => setShowMobileMenu(false)} style={{ color: BRAND_PRIMARY }}>
                  About Us
                </Link>
                <Link to="/contact" onClick={() => setShowMobileMenu(false)} style={{ color: BRAND_PRIMARY }}>
                  Contact
                </Link>
              </nav>
            </div>
          </div>
        </>
      )}

      {/* Cart Side Panel - Responsive */}
      {showCartPanel && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleOverlayClick}
          />
          {/* Side Panel */}
        
        </>
      )}

      {/* Login Side Panel - Responsive */}
      {showLoginPanel && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleOverlayClick}
          />
       
        </>
      )}
    </>
  );
}