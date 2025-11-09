import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  LogOut,
  ShoppingBag,
  Package,
  Menu,
  X,
  Search,
  User,
  Phone,
  LayoutGrid,
  Info,
  Heart,
  Home,
} from "lucide-react";
import axios from "axios";
import SearchPanel from "./SearchPanel";
import Wishlist from "./WishList";

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
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showDesktopSearchPanel, setShowDesktopSearchPanel] = useState(false);
  const [showWishlistPanel, setShowWishlistPanel] = useState(false);
  const [searchCategory, setSearchCategory] = useState("all");
  const [categories, setCategories] = useState([{ label: "All Categories", value: "all" }]);
  const [query, setQuery] = useState("");
  const [headerTranslateY, setHeaderTranslateY] = useState(0);
  const [showCartPanel, setShowCartPanel] = useState(false);
  const [showLoginPanel, setShowLoginPanel] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [products, setProducts] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistAnimation, setWishlistAnimation] = useState('');
  const [wishlistBadgeAnimation, setWishlistBadgeAnimation] = useState('');
  const userDropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const encodedCustomerId = searchParams.get('customerId');
  const [customerId, setCustomerId] = useState(null);

  // Decode customerId from URL param
  useEffect(() => {
    let id = null;
    if (encodedCustomerId) {
      try {
        id = parseInt(atob(encodedCustomerId), 10);
      } catch (e) {
        id = null;
      }
    }
    setCustomerId(id);
  }, [encodedCustomerId]);

  // --- SCROLL TO "Shop by Category" ON LOAD when requested ---
  useEffect(() => {
    if (sessionStorage.getItem('scrollToShopSection') === 'yes') {
      sessionStorage.removeItem('scrollToShopSection');
      setTimeout(() => {
        const shopSection = document.getElementById('shop-by-category');
        if (shopSection) {
          shopSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [location.pathname]);

  // Fetch categories
  useEffect(() => {
    axios.get("https://suyambufoods.com/api/admin/categories", {
      headers: { Origin: "http://localhost:5173" },
    }).then(res => {
      const raw = Array.isArray(res.data) ? res.data : [];
      const mapped = raw.map(c => ({
        label: c.name,
        value: c.slug || c.name.toLowerCase(),
      }));
      setCategories([{ label: "All Categories", value: "all" }, ...mapped]);
    }).catch(() => {});
  }, []);

  // Fetch products for SearchPanel
  useEffect(() => {
    axios.get("https://suyambufoods.com/api/admin/products", {
      headers: { Origin: "http://localhost:5173" },
    }).then(res => {
      const raw = Array.isArray(res.data) ? res.data : [];
      const processed = raw.map(p => ({
        id: p.id,
        name: p.name,
        category_name: p.category_name || "Uncategorized",
        thumbnail_url: p.thumbnail_url
          ? (p.thumbnail_url.startsWith("http") ? p.thumbnail_url : `https://suyambufoods.com/api${p.thumbnail_url}`)
          : "https://via.placeholder.com/100",
        variants: p.variants || [],
        price: (p.variants && p.variants.length > 0 ? p.variants[0].price : p.price) || 0,
      }));
      setProducts(processed);
    }).catch(() => {});
  }, []);

  // Fetch wishlist count
  const fetchWishlistCount = async () => {
    if (!customerId) {
      setWishlistCount(0);
      return;
    }
    const token = localStorage.getItem("customerToken");
    if (!token) {
      setWishlistCount(0);
      return;
    }
    try {
      const res = await axios.get(`https://suyambufoods.com/api/customer/wishlist?customerId=${customerId}`, {
        headers: { 
          Origin: "http://localhost:5173",
          Authorization: `Bearer ${token}`
        },
      });
      const count = res.data.totalWished || 0;
      setWishlistCount(count);
      // Trigger attractive animation on count change
      if (count > 0) {
        setWishlistBadgeAnimation('scale-in');
        setTimeout(() => setWishlistBadgeAnimation(''), 500);
      }
    } catch (err) {
      console.error("Failed to fetch wishlist count:", err);
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    fetchWishlistCount();
  }, [customerId]);

  // Handle browser back/forward with bfcache
  useEffect(() => {
    const handlePageShow = (event) => {
      if (event.persisted) {
        const token = localStorage.getItem("customerToken");
        if (!token) {
          window.location.href = "/";
        } else {
          // Re-fetch wishlist count
          fetchWishlistCount();
        }
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) setShowUserDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY, ticking = false;
    const updateHeader = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) setHeaderTranslateY(-100);
      else setHeaderTranslateY(0);
      lastScrollY = currentScrollY > 0 ? currentScrollY : 0;
      ticking = false;
    };
    const handleScroll = () => { if (!ticking) { requestAnimationFrame(updateHeader); ticking = true; } };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerId");
    setShowUserDropdown(false);
    window.location.href = "/";
  };

  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); setShowSuggestions(false); return; }
    let isMounted = true;
    const fetchSuggestions = async () => {
      try {
        const res = await axios.get(
          `https://suyambufoods.com/api/admin/search-products?query=${encodeURIComponent(query.trim())}`,
          { headers: { Origin: "http://localhost:5173" } }
        );
        const products = Array.isArray(res.data) ? res.data : [];
        if (isMounted) {
          setSuggestions(
            products.slice(0,8).map(p => ({
              id: p.id,
              name: p.name,
              image: p.banner_url
                ? (p.banner_url.startsWith("http") ? p.banner_url : `https://suyambufoods.com/api${p.banner_url}`)
                : "https://via.placeholder.com/50",
              price: p.variants && p.variants.length > 0 ? p.variants[0].price : p.price || 0
            }))
          );
          setShowSuggestions(true);
        }
      } catch (e) {
        if (isMounted) { setSuggestions([]); setShowSuggestions(false); }
      }
    };
    const timer = setTimeout(fetchSuggestions, 200);
    return () => { isMounted = false; clearTimeout(timer); };
  }, [query]);

  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (!e.target.closest(".search-suggestion-dropdown")) setShowSuggestions(false);
    };
    if (showSuggestions) {
      document.addEventListener("mousedown", handleGlobalClick);
      return () => document.removeEventListener("mousedown", handleGlobalClick);
    }
  }, [showSuggestions]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query.trim());
    setShowSuggestions(false);
    setShowSearchModal(false);
    setShowDesktopSearchPanel(false);
  };

  const handleUserClick = () => {
    if (customerData) setShowUserDropdown(!showUserDropdown);
    else { setShowLoginPanel(true); if (onLoginClick) onLoginClick(); }
  };

  const handleCartClick = () => { setShowCartPanel(true); if (onCartClick) onCartClick(); };

  const handleWishlistClick = () => { 
    if (!customerId) {
      setShowLoginPanel(true);
      if (onLoginClick) onLoginClick();
      return;
    }
    setWishlistAnimation('slide-in'); 
    setShowWishlistPanel(true); 
  };

  const handleCloseWishlist = () => { 
    setWishlistAnimation('slide-out'); 
    setTimeout(() => { 
      setShowWishlistPanel(false); 
      setWishlistAnimation(''); 
    }, 300); 
  };

  const handleWishlistCountUpdate = (count) => {
    setWishlistCount(count);
    // console.log("wishlist count passed header successfully");
    // Trigger attractive animation on count change
    if (count > 0) {
      setWishlistBadgeAnimation('scale-in');
      setTimeout(() => setWishlistBadgeAnimation(''), 500);
    }
  };

  const handleOrdersClick = () => { setShowCartPanel(false); setShowLoginPanel(false); if (onOrdersClick) onOrdersClick(); };

  const closePanels = () => { 
    setShowCartPanel(false); 
    setShowLoginPanel(false); 
    setShowWishlistPanel(false);
    setWishlistAnimation('');
    setShowUserDropdown(false); 
    setShowSuggestions(false);
    setShowDesktopSearchPanel(false);
  };

  const handleOverlayClick = (e) => { if (e.target === e.currentTarget) { closePanels(); } };

const handleScrollToBanner = () => {
  if (location.pathname === '/' || location.pathname === '/customer') {
    const bannerElement = document.getElementById('banner');
    if (bannerElement) bannerElement.scrollIntoView({ behavior: 'smooth' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
    if (onResetCategory) onResetCategory();
  } else {
    navigate("/");
  }
  setShowMobileMenu(false); closePanels();
};

  const handleShopClick = (isMobileVersion = false) => {
    if (location.pathname === '/' || location.pathname === '/customer') {
      const section = document.getElementById('shop-by-category');
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
      setShowMobileMenu(false); closePanels();
      return;
    } else {
      sessionStorage.setItem('scrollToShopSection', 'yes');
      navigate("/");
      setShowMobileMenu(false); closePanels();
    }
  };

  const isHomePage = location.pathname === '/' || location.pathname === '/customer';

  const BRAND_PRIMARY = "#3D2F23";
  const BRAND_SECONDARY = "#B6895B";
  const BACKGROUND_COLOR = "#FFFFFF";
  const panelWidth = 'w-full md:w-96 lg:w-[400px]';

  const handleSuggestionClick = (productId) => {
    setShowSuggestions(false);
    setQuery("");
    const encodedProductId = btoa(productId.toString());
    navigate(`/customer?productId=${encodedProductId}`);
    closePanels();
    setShowSearchModal(false);
    setShowDesktopSearchPanel(false);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  };

  const cartCount = Array.isArray(cartItems) ? cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;

  const userMenuText = customerData ? 'Account' : 'Login / Register';
  const welcomeText = customerData ? `Welcome, ${customerData.full_name}!` : 'Welcome!';

  return (
    <>
      <style>{`
        .nav-link-underline {
          position: relative;
          display: inline-block;
          padding-bottom: 2px;
          cursor: pointer;
        }
        .nav-link-underline::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -2px;
          width: 0;
          height: 2.5px;
          background: #B6895B;
          transition: width 0.35s cubic-bezier(.75,.05,.27,1);
          border-radius: 2px;
        }
        .nav-link-underline:hover::after,
        .nav-link-underline:focus::after {
          width: 100%;
        }
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
        @media (max-width: 768px) {
          .marquee-text {
            animation-duration: 15s linear infinite;
            font-size: 0.75rem;
          }
        }
        @media (max-width: 640px) {
          .marquee-text {
            font-size: 0.7rem;
          }
        }
        .wishlist-badge {
          animation: scale-in 0.5s ease-out;
        }
        @keyframes scale-in {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div className="fixed top-0 left-0 right-0 z-50 bg-[#3D2F23] text-white py-3 overflow-hidden">
        <div className="relative">
          <div className="flex items-center justify-between px-4 md:px-8">
            <div className="flex items-center">
              <div className="hidden sm:flex items-center min-w-[120px]">
                <Phone size={16} className="mr-2" />
                <span className="text-xs">+91 9345872342</span>
              </div>
            </div>
            <div className="flex-1 mx-2">
              <div className="marquee-container">
                <div className="marquee-text">
                  Free Shipping | 45% Discount | Limited Time Offer | Free Shipping | 45% Discount | Limited Time Offer
                </div>
              </div>
            </div>
            <div className="flex items-center min-w-[120px] justify-end">
              <span className="text-xs truncate pr-2">{welcomeText}</span>
            </div>
          </div>
        </div>
      </div>

      <header
        className="bg-white px-4 md:px-8 py-3 fixed top-[48px] left-0 right-0 z-40 shadow-sm flex items-center justify-between transition-transform duration-300 ease-out"
        style={{ backgroundColor: BACKGROUND_COLOR, transform: `translateY(${headerTranslateY}%)`}}
      >
        {/* Left: Mobile Menu Button or Desktop Logo */}
        <div className="flex items-center">
          {isMobile ? (
            <button
              className="p-1 rounded-md"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              style={{ color: BRAND_PRIMARY }}
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          ) : (
            <Link to="/" className="flex items-center">
              <img
                src="/Assets/Suyambu_New_logo.png"
                alt="Suyambu Stores Logo"
                className="h-10 md:h-12 object-contain"
              />
            </Link>
          )}
        </div>

        {/* Center: Logo on Mobile, Nav on Desktop */}
        <div className="flex-1 flex justify-center">
          {isMobile ? (
            <Link to="/" className="flex items-center">
              <img
                src="/Assets/Suyambu_New_logo.png"
                alt="Suyambu Stores Logo"
                className="h-10 md:h-12 object-contain"
              />
            </Link>
          ) : (
            <nav className="flex justify-center items-center gap-8 font-medium">
              <button
                onClick={handleScrollToBanner}
                className={`nav-link-underline font-medium ${!selectedCategory ? 'text-[#B6895B]' : ''}`}
                style={{ color: BRAND_PRIMARY, background: "none", border: "none" }}
              >
                Home
              </button>
              <button
                onClick={() => handleShopClick(false)}
                className="nav-link-underline font-medium"
                style={{ color: BRAND_PRIMARY, background: "none", border: "none" }}
              >
                Shop
              </button>
              <Link to="/about" className="nav-link-underline" style={{ color: BRAND_PRIMARY }}>
                About Us
              </Link>
              <Link to="/contact" className="nav-link-underline" style={{ color: BRAND_PRIMARY }}>
                Contact
              </Link>
            </nav>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-6">
          {/* Mobile Search Icon */}
          <button 
            onClick={() => setShowSearchModal(true)} 
            className="md:hidden p-1 hover:opacity-80 transition-opacity" 
            style={{ color: BRAND_PRIMARY }}
          >
            <Search size={24} />
          </button>

          {/* Desktop Search Icon */}
          <button 
            onClick={() => setShowDesktopSearchPanel(true)} 
            className="hidden lg:block p-1 hover:opacity-80 transition-opacity" 
            style={{ color: BRAND_PRIMARY }}
          >
            <Search size={24} />
          </button>

          {/* Wishlist - Hidden on Mobile */}
          <button 
            onClick={handleWishlistClick} 
            className="hidden md:block relative p-1 hover:opacity-80 transition-opacity" 
            style={{ color: BRAND_PRIMARY }}
          >
            <Heart size={24} />
            {wishlistCount > 0 && (
              <span 
                className={`absolute -top-2 -right-2 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold wishlist-badge ${wishlistBadgeAnimation}`}
                style={{ backgroundColor: '#ef4444' }}
              >
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
          </button>

          {/* User */}
          <button onClick={handleUserClick} className="relative hover:opacity-80 transition-opacity" style={{ color: BRAND_PRIMARY }}>
            <User size={24} />
            {customerData && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>}
          </button>

          {/* Cart - Hidden on Mobile */}
          <button onClick={handleCartClick} className="hidden md:block relative hover:opacity-80 transition-opacity" style={{ color: BRAND_PRIMARY }}>
            <ShoppingBag size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
                style={{ backgroundColor: BRAND_SECONDARY }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {showUserDropdown && customerData && (
          <div 
            ref={userDropdownRef} 
            className={isMobile 
              ? 'fixed top-[calc(48px+3rem)] left-1/2 -translate-x-1/2 w-[90vw] max-w-sm bg-white rounded-lg shadow-lg z-50 overflow-hidden border mx-2'
              : 'absolute right-4 top-16 mt-2 w-56 bg-white rounded-lg shadow-lg z-50 overflow-hidden border'
            }
          >
            <div className="p-4 border-b">
              <div className="font-semibold">{customerData.full_name}</div>
              <div className="text-xs text-gray-500 mt-1">{customerData.email}</div>
            </div>
            <div className="p-2">
              <button onClick={handleOrdersClick}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 text-sm"
              ><Package size={16} /> My Orders
              </button>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 text-sm"
              ><LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex justify-around items-center py-2">
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="flex flex-col items-center p-1 text-gray-600 hover:text-[#3D2F23] transition-colors"
          >
            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            <span className="text-xs mt-1">Menu</span>
          </button>
          <button 
            onClick={() => handleShopClick(true)}
            className="flex flex-col items-center p-1 text-gray-600 hover:text-[#3D2F23] transition-colors"
          >
            <LayoutGrid size={20} />
            <span className="text-xs mt-1">Shop</span>
          </button>
          <button 
            onClick={handleCartClick}
            className="relative flex flex-col items-center p-1 text-gray-600 hover:text-[#3D2F23] transition-colors"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span 
                className="absolute -top-1 -right-1 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold"
                style={{ backgroundColor: BRAND_SECONDARY }}
              >
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
            <span className="text-xs mt-1">Cart</span>
          </button>
          <button 
            onClick={handleWishlistClick}
            className="relative flex flex-col items-center p-1 text-gray-600 hover:text-[#3D2F23] transition-colors"
          >
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span 
                className={`absolute -top-1 -right-1 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold wishlist-badge ${wishlistBadgeAnimation}`}
                style={{ backgroundColor: '#ef4444' }}
              >
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
            <span className="text-xs mt-1">Wishlist</span>
          </button>
        </nav>
      )}

      {/* Mobile Search Modal */}
      {showSearchModal && isMobile && (
        <div 
          className="fixed inset-0 bg-white z-50 flex flex-col" 
          onClick={(e) => e.target === e.currentTarget && setShowSearchModal(false)}
        >
          <div className="flex-1 p-4 overflow-y-auto w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base">SEARCH OUR SITE</h3>
              <button onClick={() => setShowSearchModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <select 
              value={searchCategory} 
              onChange={(e) => setSearchCategory(e.target.value)}
              className="w-full mb-3 p-2 border rounded-sm text-sm bg-white"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <form onSubmit={handleSearchSubmit} className="mb-4 relative" autoComplete="off">
              <input 
                type="text" 
                placeholder="Search" 
                className="w-full pl-10 pr-4 py-2 border rounded-sm text-sm bg-white focus:outline-none focus:ring-1" 
                style={{ borderColor: BRAND_SECONDARY, ringColor: BRAND_SECONDARY }}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.trim() && setShowSuggestions(true)}
                autoComplete="off"
              />
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </form>
            <p className="text-xs text-gray-600 mb-4 leading-tight">
              Quick search:<br />
              Rice, Millets, Ghee, Honey,<br />
              Spices, Oil, Snacks
            </p>
            {showSuggestions && suggestions.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto search-suggestion-dropdown border">
                {suggestions.map(p => (
                  <div 
                    key={p.id} 
                    className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer flex justify-between items-center" 
                    onClick={() => { handleSuggestionClick(p.id); setShowSearchModal(false); }}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded object-cover bg-gray-100 flex-shrink-0" />
                      <span className="text-gray-900 text-sm font-medium truncate flex-1 min-w-0">{p.name}</span>
                    </div>
                    <span className="text-green-600 font-semibold text-sm">₹{p.price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop Search Panel */}
      {showDesktopSearchPanel && (
        <SearchPanel
          onClose={() => setShowDesktopSearchPanel(false)}
          categories={categories}
          products={products}
        />
      )}

      {/* Wishlist Panel */}
      {showWishlistPanel && customerId && (
        <div 
          className={`fixed inset-0 bg-black/30 flex z-50 transition-opacity duration-300 ${
            wishlistAnimation.includes("in") ? "opacity-100" : "opacity-0"
          }`} 
          onClick={handleCloseWishlist}
        >
          <Wishlist 
            onClose={handleCloseWishlist} 
            customerId={customerId}
            wishlistAnimation={wishlistAnimation}
            onWishlistCountUpdate={handleWishlistCountUpdate}
          />
        </div>
      )}

      {/* --- Mobile Menu --- */}
      {showMobileMenu && (
        <>
          <div className="fixed inset-0 bg-black/50 z-45 md:hidden"
            onClick={() => setShowMobileMenu(false)}
          />
          <div className="fixed top-[48px] right-0 h-[calc(100vh-48px)] w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-lg overflow-y-auto md:hidden rounded-tl-xl"
            style={{ backgroundColor: BACKGROUND_COLOR }}
          >
            <div className="flex flex-col justify-start h-full relative pt-8">
              <button onClick={() => setShowMobileMenu(false)}
                className="absolute top-4 right-4 text-gray-500"
                style={{zIndex:10}}
              >
                <X size={24} />
              </button>
              <nav className="flex flex-col w-full pt-16">
                <button 
                  onClick={() => { navigate("/"); setShowMobileMenu(false); }}
                  className="flex items-center gap-3 px-4 py-4 border-b border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Home size={20} className="text-gray-500 flex-shrink-0" />
                  <span className="nav-link-underline text-base font-medium" style={{ color: BRAND_PRIMARY }}>Home</span>
                </button>
                <button 
                  onClick={() => { setShowSearchModal(true); setShowMobileMenu(false); }}
                  className="flex items-center gap-3 px-4 py-4 border-b border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Search size={20} className="text-gray-500 flex-shrink-0" />
                  <span className="nav-link-underline text-base font-medium" style={{ color: BRAND_PRIMARY }}>Search</span>
                </button>
                <button 
                  onClick={() => { handleOrdersClick(); setShowMobileMenu(false); }}
                  className="flex items-center gap-3 px-4 py-4 border-b border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Package size={20} className="text-gray-500 flex-shrink-0" />
                  <span className="nav-link-underline text-base font-medium" style={{ color: BRAND_PRIMARY }}>Track Your Order</span>
                </button>
                <Link to="/about" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-4 border-b border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                  <Info size={20} className="text-gray-500 flex-shrink-0" />
                  <span className="nav-link-underline text-base font-medium" style={{ color: BRAND_PRIMARY }}>About us</span>
                </Link>
                <Link to="/contact" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-4 text-gray-700 hover:bg-gray-50 transition-colors">
                  <Phone size={20} className="text-gray-500 flex-shrink-0" />
                  <span className="nav-link-underline text-base font-medium" style={{ color: BRAND_PRIMARY }}>Contact us</span>
                </Link>
              </nav>
            </div>
          </div>
        </>
      )}

      {showCartPanel && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={handleOverlayClick} />
        </>
      )}
      {showLoginPanel && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={handleOverlayClick} />
        </>
      )}
    </>
  );
}