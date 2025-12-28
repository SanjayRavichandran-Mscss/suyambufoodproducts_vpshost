// import React, { useState, useEffect, useRef } from "react";
// import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
// import {
//   LogOut,
//   ShoppingBag,
//   Package,
//   Menu,
//   X,
//   Search,
//   User,
//   Phone,
//   ShoppingCart,
//   Info,
//   Heart,
//   Home,
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import axios from "axios";
// import SearchPanel from "./SearchPanel";
// import Wishlist from "./WishList";

// export default function Header({
//   customerData,
//   onLoginClick,
//   onRegisterClick,
//   cartItems,
//   onCartClick,
//   onOrdersClick,
//   onSearch,
//   selectedCategory,
//   onCategorySelect,
//   onResetCategory,
// }) {
//   const [showUserDropdown, setShowUserDropdown] = useState(false);
//   const [showMobileMenu, setShowMobileMenu] = useState(false);
//   const [showSearchPanel, setShowSearchPanel] = useState(false);
//   const [showWishlistPanel, setShowWishlistPanel] = useState(false);
//   const [categories, setCategories] = useState([{ label: "All Categories", value: "all" }]);
//   const [headerTranslateY, setHeaderTranslateY] = useState(0);
//   const [showCartPanel, setShowCartPanel] = useState(false);
//   const [showLoginPanel, setShowLoginPanel] = useState(false);
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
//   const [products, setProducts] = useState([]);
//   const [wishlistCount, setWishlistCount] = useState(0);
//   const [wishlistBadgeAnimation, setWishlistBadgeAnimation] = useState('');
//   const userDropdownRef = useRef(null);
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const encodedCustomerId = searchParams.get('customerId');
//   const [customerId, setCustomerId] = useState(null);

//   // Animation variants for left-to-right slide (mobile menu)
//   const leftSlideVariants = {
//     hidden: { x: '-100%' },
//     visible: { 
//       x: 0,
//       transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
//     },
//     exit: { 
//       x: '-100%',
//       transition: { duration: 0.2, ease: 'easeIn' }
//     }
//   };

//   // Animation variants for right-to-left slide (wishlist, search, cart)
//   const rightSlideVariants = {
//     hidden: { x: '100%' },
//     visible: { 
//       x: 0,
//       transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
//     },
//     exit: { 
//       x: '100%',
//       transition: { duration: 0.2, ease: 'easeIn' }
//     }
//   };

//   // Overlay fade variant
//   const overlayVariants = {
//     hidden: { opacity: 0 },
//     visible: { opacity: 1, transition: { duration: 0.2 } },
//     exit: { opacity: 0, transition: { duration: 0.15 } }
//   };

//   // Dropdown animation variants
//   const dropdownVariants = {
//     hidden: { opacity: 0, scale: 0.95, y: -10 },
//     visible: { 
//       opacity: 1, 
//       scale: 1, 
//       y: 0, 
//       transition: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] } 
//     },
//     exit: { 
//       opacity: 0, 
//       scale: 0.95, 
//       y: -10, 
//       transition: { duration: 0.1 } 
//     }
//   };

//   useEffect(() => {
//     let id = null;
//     if (encodedCustomerId) {
//       try {
//         id = parseInt(atob(encodedCustomerId), 10);
//       } catch (e) {
//         id = null;
//       }
//     }
//     setCustomerId(id);
//   }, [encodedCustomerId]);

//   useEffect(() => {
//     if (sessionStorage.getItem('scrollToShopSection') === 'yes') {
//       sessionStorage.removeItem('scrollToShopSection');
//       setTimeout(() => {
//         const shopSection = document.getElementById('shop-by-category');
//         if (shopSection) {
//           shopSection.scrollIntoView({ behavior: "smooth", block: "start" });
//         }
//       }, 100);
//     }
//   }, [location.pathname]);

//   useEffect(() => {
//     axios.get("https://suyambufoods.com/api/admin/categories", {
//       headers: { Origin: "http://localhost:5173" },
//     }).then(res => {
//       const raw = Array.isArray(res.data) ? res.data : [];
//       const mapped = raw.map(c => ({
//         label: c.name,
//         value: c.slug || c.name.toLowerCase(),
//       }));
//       setCategories([{ label: "All Categories", value: "all" }, ...mapped]);
//     }).catch(() => {});
//   }, []);

//   useEffect(() => {
//     axios.get("https://suyambufoods.com/api/admin/products", {
//       headers: { Origin: "http://localhost:5173" },
//     }).then(res => {
//       const raw = Array.isArray(res.data) ? res.data : [];
//       const processed = raw.map(p => ({
//         id: p.id,
//         name: p.name,
//         category_name: p.category_name || "Uncategorized",
//         thumbnail_url: p.thumbnail_url
//           ? (p.thumbnail_url.startsWith("http") ? p.thumbnail_url : `https://suyambufoods.com/api${p.thumbnail_url}`)
//           : "https://via.placeholder.com/100",
//         variants: p.variants || [],
//         price: (p.variants && p.variants.length > 0 ? p.variants[0].price : p.price) || 0,
//       }));
//       setProducts(processed);
//     }).catch(() => {});
//   }, []);

//   const fetchWishlistCount = async () => {
//     if (!customerId) {
//       setWishlistCount(0);
//       return;
//     }
//     const token = localStorage.getItem("customerToken");
//     if (!token) {
//       setWishlistCount(0);
//       return;
//     }
//     try {
//       const res = await axios.get(`https://suyambufoods.com/api/customer/wishlist/?customerId=${customerId}`, {
//         headers: {
//           Origin: "http://localhost:5173",
//           Authorization: `Bearer ${token}`
//         },
//       });
//       const data = res.data;
//       const allWishlist = data.wishlist || [];
//       const likedCount = allWishlist.filter(item => item.is_liked === 1).length;
//       setWishlistCount(likedCount);
//       if (likedCount > 0) {
//         setWishlistBadgeAnimation('scale-in');
//         setTimeout(() => setWishlistBadgeAnimation(''), 500);
//       }
//     } catch (err) {
//       console.error("Failed to fetch wishlist count:", err);
//       setWishlistCount(0);
//     }
//   };

//   useEffect(() => {
//     fetchWishlistCount();
//   }, [customerId]);

//   useEffect(() => {
//     const handlePageShow = (event) => {
//       if (event.persisted) {
//         const token = localStorage.getItem("customerToken");
//         if (!token) {
//           window.location.href = "/";
//         } else {
//           fetchWishlistCount();
//         }
//       }
//     };
//     window.addEventListener("pageshow", handlePageShow);
//     return () => window.removeEventListener("pageshow", handlePageShow);
//   }, []);

//   useEffect(() => {
//     const handleResize = () => setIsMobile(window.innerWidth < 768);
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) setShowUserDropdown(false);
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   useEffect(() => {
//     let lastScrollY = window.scrollY, ticking = false;
//     const updateHeader = () => {
//       const currentScrollY = window.scrollY;
//       if (currentScrollY > lastScrollY && currentScrollY > 50) setHeaderTranslateY(-100);
//       else setHeaderTranslateY(0);
//       lastScrollY = currentScrollY > 0 ? currentScrollY : 0;
//       ticking = false;
//     };
//     const handleScroll = () => { if (!ticking) { requestAnimationFrame(updateHeader); ticking = true; } };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const handleUserClick = () => {
//     if (customerData) setShowUserDropdown(!showUserDropdown);
//     else { setShowLoginPanel(true); if (onLoginClick) onLoginClick(); }
//   };

//   const handleCartClick = () => { setShowCartPanel(true); if (onCartClick) onCartClick(); };

//   const handleWishlistClick = () => {
//     if (!customerId) {
//       setShowLoginPanel(true);
//       if (onLoginClick) onLoginClick();
//       return;
//     }
//     setShowWishlistPanel(true);
//   };

//   const handleCloseWishlist = () => {
//     setShowWishlistPanel(false);
//   };

//   const handleWishlistCountUpdate = (count) => {
//     setWishlistCount(count);
//     if (count > 0) {
//       setWishlistBadgeAnimation('scale-in');
//       setTimeout(() => setWishlistBadgeAnimation(''), 500);
//     }
//   };

//   const handleOrdersClick = () => { setShowCartPanel(false); setShowLoginPanel(false); if (onOrdersClick) onOrdersClick(); };

//   const handleLogout = () => {
//     localStorage.removeItem("customerToken");
//     localStorage.removeItem("customerId");
//     setShowUserDropdown(false);
//     window.location.href = "/";
//   };

//   const closePanels = () => {
//     setShowCartPanel(false);
//     setShowLoginPanel(false);
//     setShowWishlistPanel(false);
//     setShowUserDropdown(false);
//     setShowSearchPanel(false);
//   };

//   const handleOverlayClick = (e) => { if (e.target === e.currentTarget) { closePanels(); } };

//   const closeMobileMenu = () => {
//     setShowMobileMenu(false);
//   };

//   const toggleMobileMenu = () => {
//     setShowMobileMenu(!showMobileMenu);
//   };

//   const handleScrollToBanner = () => {
//     if (location.pathname === '/' || location.pathname === '/customer') {
//       const bannerElement = document.getElementById('banner');
//       if (bannerElement) bannerElement.scrollIntoView({ behavior: 'smooth' });
//       else window.scrollTo({ top: 0, behavior: 'smooth' });
//       if (onResetCategory) onResetCategory();
//     } else {
//       navigate("/");
//     }
//     closeMobileMenu();
//     closePanels();
//   };

//   const handleShopClick = (isMobileVersion = false) => {
//     const productId = searchParams.get('productId');
//     if ((location.pathname === '/' || location.pathname === '/customer') && !productId) {
//       const section = document.getElementById('shop-by-category');
//       if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
//       closeMobileMenu();
//       closePanels();
//       return;
//     } else {
//       sessionStorage.setItem('scrollToShopSection', 'yes');
//       navigate("/");
//       closeMobileMenu();
//       closePanels();
//     }
//   };

//   const isHomePage = location.pathname === '/' || location.pathname === '/customer';
//   const BRAND_PRIMARY = "#3D2F23";
//   const BRAND_SECONDARY = "#B6895B";
//   const BACKGROUND_COLOR = "#FFFFFF";
//   const panelWidth = 'w-full md:w-96 lg:w-[400px]';

//   const cartCount = Array.isArray(cartItems) ? cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
//   const userMenuText = customerData ? 'Account' : 'Login / Register';
//   const welcomeText = customerData ? `Welcome, ${customerData.full_name}!` : 'Welcome!';

//   return (
//     <>
//       <style>{`
//         .nav-link-underline {
//           position: relative;
//           display: inline-block;
//           padding-bottom: 4px;
//           cursor: pointer;
//           font-weight: 600;
//           font-size: 1.1rem;
//         }
//         .nav-link-underline::after {
//           content: "";
//           position: absolute;
//           left: 0;
//           bottom: -4px;
//           width: 0;
//           height: 3px;
//           background: #B6895B;
//           transition: width 0.35s cubic-bezier(.75,.05,.27,1);
//           border-radius: 2px;
//         }
//         .nav-link-underline:hover::after,
//         .nav-link-underline:focus::after {
//           width: 100%;
//         }
//         .marquee-container {
//           width: 100%;
//           overflow: hidden;
//         }
//         .marquee-text {
//           display: inline-block;
//           white-space: nowrap;
//           animation: marquee 25s linear infinite;
//           font-size: 0.675rem;
//           font-weight: 500;
//           letter-spacing: 0.5px;
//         }
//         @keyframes marquee {
//           0% { transform: translateX(100%); }
//           100% { transform: translateX(-100%); }
//         }
//         @media (max-width: 768px) {
//           .marquee-text {
//             animation-duration: 18s;
//             font-size: 0.625rem;
//           }
//         }
//         @media (max-width: 640px) {
//           .marquee-text {
//             font-size: 0.6rem;
//           }
//         }
//         .wishlist-badge {
//           animation: scale-in 0.5s ease-out;
//         }
//         @keyframes scale-in {
//           0% { transform: scale(0.5); opacity: 0; }
//           50% { transform: scale(1.2); opacity: 1; }
//           100% { transform: scale(1); opacity: 1; }
//         }
//       `}</style>
//       <div className="fixed top-0 left-0 right-0 z-50 bg-[#3D2F23] text-white py-3 overflow-hidden">
//         <div className="relative">
//           <div className="flex items-center justify-between px-4 md:px-8">
//             <div className="flex items-center">
//               <div className="hidden sm:flex items-center min-w-[120px]">
//                 <Phone size={16} className="mr-2" />
//                 <span className="text-sm">+91 814-816-2714</span>
//               </div>
//             </div>
//             <div className="flex-1 mx-2 t">
//               <div className="marquee-container text-sm">
//                 <div className="marquee-text">
//                   <div className="text-sm"> Free shipping for orders above 999 | 100% secure payments | Quality packaging |           </div>
//                 </div>
//               </div>
//             </div>
//             <div className="flex items-center min-w-[120px] justify-end">
//               <span className="text-sm truncate pr-2">{welcomeText}</span>
//             </div>
//           </div>
//         </div>
//       </div>
//       <header
//         className="bg-white px-4 md:px-8 py-2 fixed top-[48px] left-0 right-0 z-40 shadow-md flex items-center justify-between transition-transform duration-300 ease-out font-bold"
//         style={{ backgroundColor: BACKGROUND_COLOR, transform: `translateY(${headerTranslateY}%)`}}
//       >
//         {/* Left: Mobile Menu Button or Desktop Logo */}
//         <div className="flex items-center">
//           {isMobile ? (
//             <button
//               className="p-1.5 rounded-md" /* Reduced padding */
//               onClick={toggleMobileMenu}
//               style={{ color: BRAND_PRIMARY }}
//             >
//               {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
//             </button>
//           ) : (
//             <Link to="/" className="flex items-center">
//               <img
//                 src="/Assets/suyambulogo.png"
//                 alt="Suyambu Stores Logo"
//                 className="h-14 object-contain"
//               />
//             </Link>
//           )}
//         </div>
//         {/* Center: Logo on Mobile, Nav on Desktop */}
//         <div className="flex-1 flex justify-center">
//           {isMobile ? (
//             <Link to="/" className="flex items-center">
//               <img
//                 src="/Assets/suyambulogo.png"
//                 alt="Suyambu Stores Logo"
//                 className="h-11 object-contain"
//               />
//             </Link>
//           ) : (
//             <nav className="flex justify-center items-center gap-10 text-lg">
//               <button
//                 onClick={handleScrollToBanner}
//                 className={`nav-link-underline ${!selectedCategory ? 'text-[#B6895B]' : ''}`}
//                 style={{ color: BRAND_PRIMARY }}
//               >
//                 Home
//               </button>
//               <button
//                 onClick={() => handleShopClick(false)}
//                 className="nav-link-underline"
//                 style={{ color: BRAND_PRIMARY }}
//               >
//                 Shop
//               </button>
//               <Link to="/about" className="nav-link-underline" style={{ color: BRAND_PRIMARY }}>
//                 About Us
//               </Link>
//               <Link to="/contact" className="nav-link-underline" style={{ color: BRAND_PRIMARY }}>
//                 Contact
//               </Link>
//             </nav>
//           )}
//         </div>
//         {/* Right: Actions - Reduced gaps and icon sizes */}
//         <div className="flex items-center gap-3 md:gap-4"> {/* Reduced from gap-4 md:gap-8 to gap-3 md:gap-4 */}
//           <button
//             onClick={() => setShowSearchPanel(true)}
//             className="md:hidden p-1.5 hover:opacity-80 transition-opacity" /* Reduced padding */
//             style={{ color: BRAND_PRIMARY }}
//           >
//             <Search size={24} /> {/* Reduced from 28 */}
//           </button>
//           <button
//             onClick={() => setShowSearchPanel(true)}
//             className="hidden lg:block p-1.5 hover:opacity-80 transition-opacity" /* Reduced padding */
//             style={{ color: BRAND_PRIMARY }}
//           >
//             <Search size={24} /> {/* Reduced from 28 */}
//           </button>
//           {/* Desktop Wishlist Icon */}
//           <button
//             onClick={handleWishlistClick}
//             className="hidden md:block relative p-1.5 hover:opacity-80 transition-opacity" /* Reduced padding */
//             style={{ color: BRAND_PRIMARY }}
//           >
//             <Heart size={24} /> {/* Reduced from 28 */}
//             {wishlistCount > 0 && (
//               <span
//                 className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm wishlist-badge ${wishlistBadgeAnimation}`}
//               >
//                 {wishlistCount > 99 ? '99+' : wishlistCount}
//               </span>
//             )}
//           </button>
//           {/* User Button */}
//           <div className="relative">
//             <button 
//               onClick={handleUserClick} 
//               className="hover:opacity-80 transition-opacity p-1.5" /* Reduced padding */
//               style={{ color: BRAND_PRIMARY }}
//             >
//               <User size={24} /> {/* Reduced from 28 */}
//               {customerData && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>}
//             </button>
//             <AnimatePresence>
//               {showUserDropdown && customerData && (
//                 <motion.div
//                   key="user-dropdown"
//                   ref={userDropdownRef}
//                   initial="hidden"
//                   animate="visible"
//                   exit="exit"
//                   variants={dropdownVariants}
//                   className="absolute right-0 top-full mt-2 w-[30vw] min-w-[250px] max-w-[300px] bg-white rounded-lg shadow-xl z-50 overflow-hidden border"
//                 >
//                   <div className="p-5 border-b">
//                     <div className="font-bold text-lg">{customerData.full_name}</div>
//                     <div className="text-sm text-gray-500 mt-1">{customerData.email}</div>
//                   </div>
//                   <div className="p-3">
//                     <button 
//                       onClick={handleOrdersClick}
//                       className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100 text-base font-medium"
//                     >
//                       <Package size={18} /> My Orders
//                     </button>
//                     <button 
//                       onClick={handleLogout}
//                       className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100 text-base font-medium"
//                     >
//                       <LogOut size={18} /> Logout
//                     </button>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>
//           <button 
//             onClick={handleCartClick} 
//             className="hidden md:block relative hover:opacity-80 transition-opacity p-1.5" /* Reduced padding */
//             style={{ color: BRAND_PRIMARY }}
//           >
//             <ShoppingBag size={24} /> {/* Reduced from 28 */}
//             {cartCount > 0 && (
//               <span className="absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
//                 style={{ backgroundColor: BRAND_SECONDARY }}
//               >
//                 {cartCount > 99 ? '99+' : cartCount}
//               </span>
//             )}
//           </button>
//         </div>
//       </header>
//       {/* Mobile Bottom Navigation - Icons reduced */}
//       {isMobile && (
//         <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex justify-around items-center py-3 shadow-lg">
//           <button
//             onClick={toggleMobileMenu}
//             className="flex flex-col items-center p-2 text-gray-600 hover:text-[#3D2F23] transition-colors"
//           >
//             {showMobileMenu ? <X size={22} /> : <Menu size={22} />} {/* Reduced from 24 */}
//             <span className="text-xs mt-1 font-medium">Menu</span>
//           </button>
//           <button
//             onClick={() => handleShopClick(true)}
//             className="flex flex-col items-center p-2 text-gray-600 hover:text-[#3D2F23] transition-colors"
//           >
//             <ShoppingCart size={22} /> {/* Reduced from 24 */}
//             <span className="text-xs mt-1 font-medium">Shop</span>
//           </button>
//           <button
//             onClick={handleCartClick}
//             className="relative flex flex-col items-center p-2 text-gray-600 hover:text-[#3D2F23] transition-colors"
//           >
//             <ShoppingBag size={22} /> {/* Reduced from 24 */}
//             {cartCount > 0 && (
//               <span
//                 className="absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
//                 style={{ backgroundColor: BRAND_SECONDARY }}
//               >
//                 {cartCount > 99 ? '99+' : cartCount}
//               </span>
//             )}
//             <span className="text-xs mt-1 font-medium">Cart</span>
//           </button>
//           <button
//             onClick={handleWishlistClick}
//             className="relative flex flex-col items-center p-2 text-gray-600 hover:text-[#3D2F23] transition-colors"
//           >
//             <Heart size={22} /> {/* Reduced from 24 */}
//             {wishlistCount > 0 && (
//               <span
//                 className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm wishlist-badge ${wishlistBadgeAnimation}`}
//               >
//                 {wishlistCount > 99 ? '99+' : wishlistCount}
//               </span>
//             )}
//             <span className="text-xs mt-1 font-medium">Wish</span>
//           </button>
//         </nav>
//       )}
//       {showSearchPanel && (
//         <SearchPanel
//           onClose={() => setShowSearchPanel(false)}
//           categories={categories}
//           products={products}
//         />
//       )}
//       {/* Wishlist Panel - Right to Left Slide */}
//       <AnimatePresence>
//         {showWishlistPanel && customerId && (
//           <>
//             <motion.div
//               initial="hidden"
//               animate="visible"
//               exit="exit"
//               variants={overlayVariants}
//               className="fixed inset-0 bg-black/30 z-[49]"
//               onClick={handleCloseWishlist}
//             />
//             <motion.div
//               initial="hidden"
//               animate="visible"
//               exit="exit"
//               variants={rightSlideVariants}
//               className="fixed top-0 right-0 h-full w-full md:max-w-lg z-50"
//             >
//               <Wishlist
//                 onClose={handleCloseWishlist}
//                 customerId={customerId}
//                 onWishlistCountUpdate={handleWishlistCountUpdate}
//               />
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>
//       {/* Mobile Menu - Left to Right Slide */}
//       <AnimatePresence>
//         {showMobileMenu && (
//           <>
//             <motion.div
//               initial="hidden"
//               animate="visible"
//               exit="exit"
//               variants={overlayVariants}
//               className="fixed inset-0 bg-black/50 z-45 md:hidden"
//               onClick={closeMobileMenu}
//             />
//             <motion.div
//               initial="hidden"
//               animate="visible"
//               exit="exit"
//               variants={leftSlideVariants}
//               className="fixed top-0 left-0 h-screen w-full bg-white z-50 shadow-2xl overflow-y-auto md:hidden"
//               style={{ backgroundColor: BACKGROUND_COLOR }}
//             >
//               <div className="flex flex-col justify-start h-full relative pt-10">
//                 <button onClick={closeMobileMenu}
//                   className="absolute top-6 right-6 text-gray-600 bg-white rounded-full p-2 shadow-md"
//                   style={{zIndex:10}}
//                 >
//                   <X size={28} />
//                 </button>
//                 <nav className="flex flex-col w-full pt-20">
//                   <button
//                     onClick={() => { navigate("/"); closeMobileMenu(); }}
//                     className="flex items-center gap-4 px-6 py-5 border-b border-gray-200 text-gray-800 hover:bg-gray-50 transition-colors text-lg font-semibold"
//                   >
//                     <Home size={24} className="text-gray-600" />
//                     <span style={{ color: BRAND_PRIMARY }}>Home</span>
//                   </button>
//                   <button
//                     onClick={() => { setShowSearchPanel(true); closeMobileMenu(); }}
//                     className="flex items-center gap-4 px-6 py-5 border-b border-gray-200 text-gray-800 hover:bg-gray-50 transition-colors text-lg font-semibold"
//                   >
//                     <Search size={24} className="text-gray-600" />
//                     <span style={{ color: BRAND_PRIMARY }}>Search</span>
//                   </button>
//                   <button
//                     onClick={() => { handleOrdersClick(); closeMobileMenu(); }}
//                     className="flex items-center gap-4 px-6 py-5 border-b border-gray-200 text-gray-800 hover:bg-gray-50 transition-colors text-lg font-semibold"
//                   >
//                     <Package size={24} className="text-gray-600" />
//                     <span style={{ color: BRAND_PRIMARY }}>Track Your Order</span>
//                   </button>
//                   <Link to="/about" onClick={closeMobileMenu} className="flex items-center gap-4 px-6 py-5 border-b border-gray-200 text-gray-800 hover:bg-gray-50 transition-colors text-lg font-semibold">
//                     <Info size={24} className="text-gray-600" />
//                     <span style={{ color: BRAND_PRIMARY }}>About us</span>
//                   </Link>
//                   <Link to="/contact" onClick={closeMobileMenu} className="flex items-center gap-4 px-6 py-5 text-gray-800 hover:bg-gray-50 transition-colors text-lg font-semibold">
//                     <Phone size={24} className="text-gray-600" />
//                     <span style={{ color: BRAND_PRIMARY }}>Contact us</span>
//                   </Link>
//                 </nav>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>
//       {showCartPanel && (
//         <>
//           <div className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300" onClick={handleOverlayClick} />
//           {/* Note: Cart panel JSX should be added here or in parent; wrap with motion.div using rightSlideVariants for animation */}
//         </>
//       )}
//       {showLoginPanel && (
//         <>
//           <div className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300" onClick={handleOverlayClick} />
//           {/* Note: Login panel JSX should be added here or in parent; wrap with motion.div using rightSlideVariants for animation */}
//         </>
//       )}
//     </>
//   );
// }










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
  ShoppingCart,
  Info,
  Heart,
  Home,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [showWishlistPanel, setShowWishlistPanel] = useState(false);
  const [categories, setCategories] = useState([{ label: "All Categories", value: "all" }]);
  const [headerTranslateY, setHeaderTranslateY] = useState(0);
  const [showCartPanel, setShowCartPanel] = useState(false);
  const [showLoginPanel, setShowLoginPanel] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [products, setProducts] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistBadgeAnimation, setWishlistBadgeAnimation] = useState('');
  const userDropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const encodedCustomerId = searchParams.get('customerId');
  const [customerId, setCustomerId] = useState(null);

  // Animation variants for left-to-right slide (mobile menu)
  const leftSlideVariants = {
    hidden: { x: '-100%' },
    visible: { 
      x: 0,
      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
    },
    exit: { 
      x: '-100%',
      transition: { duration: 0.2, ease: 'easeIn' }
    }
  };

  // Animation variants for right-to-left slide (wishlist, search, cart)
  const rightSlideVariants = {
    hidden: { x: '100%' },
    visible: { 
      x: 0,
      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
    },
    exit: { 
      x: '100%',
      transition: { duration: 0.2, ease: 'easeIn' }
    }
  };

  // Overlay fade variant
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } }
  };

  // Dropdown animation variants
  const dropdownVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] } 
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: -10, 
      transition: { duration: 0.1 } 
    }
  };

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
      const res = await axios.get(`https://suyambufoods.com/api/customer/wishlist/?customerId=${customerId}`, {
        headers: {
          Origin: "http://localhost:5173",
          Authorization: `Bearer ${token}`
        },
      });
      const data = res.data;
      const allWishlist = data.wishlist || [];
      const likedCount = allWishlist.filter(item => item.is_liked === 1).length;
      setWishlistCount(likedCount);
      if (likedCount > 0) {
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

  useEffect(() => {
    const handlePageShow = (event) => {
      if (event.persisted) {
        const token = localStorage.getItem("customerToken");
        if (!token) {
          window.location.href = "/";
        } else {
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
    setShowWishlistPanel(true);
  };

  const handleCloseWishlist = () => {
    setShowWishlistPanel(false);
  };

  const handleWishlistCountUpdate = (count) => {
    setWishlistCount(count);
    if (count > 0) {
      setWishlistBadgeAnimation('scale-in');
      setTimeout(() => setWishlistBadgeAnimation(''), 500);
    }
  };

  const handleOrdersClick = () => { setShowCartPanel(false); setShowLoginPanel(false); if (onOrdersClick) onOrdersClick(); };

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerId");
    setShowUserDropdown(false);
    window.location.href = "/";
  };

  const closePanels = () => {
    setShowCartPanel(false);
    setShowLoginPanel(false);
    setShowWishlistPanel(false);
    setShowUserDropdown(false);
    setShowSearchPanel(false);
  };

  const handleOverlayClick = (e) => { if (e.target === e.currentTarget) { closePanels(); } };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleScrollToBanner = () => {
    if (location.pathname === '/' || location.pathname === '/customer') {
      const bannerElement = document.getElementById('banner');
      if (bannerElement) bannerElement.scrollIntoView({ behavior: 'smooth' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
      if (onResetCategory) onResetCategory();
    } else {
      navigate("/");
    }
    closeMobileMenu();
    closePanels();
  };

  const handleShopClick = (isMobileVersion = false) => {
    const productId = searchParams.get('productId');
    if ((location.pathname === '/' || location.pathname === '/customer') && !productId) {
      const section = document.getElementById('shop-by-category');
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
      closeMobileMenu();
      closePanels();
      return;
    } else {
      sessionStorage.setItem('scrollToShopSection', 'yes');
      navigate("/");
      closeMobileMenu();
      closePanels();
    }
  };

  const isHomePage = location.pathname === '/' || location.pathname === '/customer';
  const BRAND_PRIMARY = "#3D2F23";
  const BRAND_SECONDARY = "#B6895B";
  const BACKGROUND_COLOR = "#FFFFFF";

  const cartCount = Array.isArray(cartItems) ? cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
  const userMenuText = customerData ? 'Account' : 'Login / Register';
  const welcomeText = customerData ? `Welcome, ${customerData.full_name}!` : 'Welcome!';

  return (
    <>
      <style>{`
        .nav-link-underline {
          position: relative;
          display: inline-block;
          padding-bottom: 4px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1.1rem;
        }
        .nav-link-underline::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -4px;
          width: 0;
          height: 3px;
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
          animation: marquee 25s linear infinite;
          font-size: 0.675rem;
          font-weight: 500;
          letter-spacing: 0.5px;
        }
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @media (max-width: 768px) {
          .marquee-text {
            animation-duration: 18s;
            font-size: 0.625rem;
          }
        }
        @media (max-width: 640px) {
          .marquee-text {
            font-size: 0.6rem;
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
                <span className="text-sm">+91 814-816-2714</span>
              </div>
            </div>
            <div className="flex-1 mx-2 t">
              <div className="marquee-container text-sm">
                <div className="marquee-text">
                  <div className="text-sm"> Free shipping for orders above ₹ 999 | 100% secure payments | Quality packaging | Bulk Orders available      </div>
                </div>
              </div>
            </div>
            <div className="flex items-center min-w-[120px] justify-end">
              <span className="text-sm truncate pr-2">{welcomeText}</span>
            </div>
          </div>
        </div>
      </div>
     <header
  className="bg-white px-4 md:px-8 py-4 md:py-2 fixed top-[48px] left-0 right-0 z-40 shadow-md flex items-center justify-between transition-transform duration-300 ease-out font-bold"
  style={{ backgroundColor: BACKGROUND_COLOR, transform: `translateY(${headerTranslateY}%)`}}
>
        {/* Left: Mobile Menu Button or Desktop Logo */}
        <div className="flex items-center">
          {isMobile ? (
            <button
              className="p-1.5 rounded-md"
              onClick={toggleMobileMenu}
              style={{ color: BRAND_PRIMARY }}
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          ) : (
            <Link to="/" className="flex items-center">
              <img
                src="/Assets/suyambulogo.png"
                alt="Suyambu Stores Logo"
                className="h-14 object-contain"
              />
            </Link>
          )}
        </div>
        {/* Center: Logo on Mobile, Nav on Desktop */}
        <div className="flex-1 flex justify-center">
          {isMobile ? (
            <Link to="/" className="flex items-center">
              <img
                src="/Assets/suyambulogo.png"
                alt="Suyambu Stores Logo"
                className="h-11 object-contain"
              />
            </Link>
          ) : (
            <nav className="flex justify-center items-center gap-10 text-lg">
              <button
                onClick={handleScrollToBanner}
                className={`nav-link-underline ${!selectedCategory ? 'text-[#B6895B]' : ''}`}
                style={{ color: BRAND_PRIMARY }}
              >
                Home
              </button>
              <button
                onClick={() => handleShopClick(false)}
                className="nav-link-underline"
                style={{ color: BRAND_PRIMARY }}
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
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() => setShowSearchPanel(true)}
            className="md:hidden p-1.5 hover:opacity-80 transition-opacity"
            style={{ color: BRAND_PRIMARY }}
          >
            <Search size={24} />
          </button>
          <button
            onClick={() => setShowSearchPanel(true)}
            className="hidden lg:block p-1.5 hover:opacity-80 transition-opacity"
            style={{ color: BRAND_PRIMARY }}
          >
            <Search size={24} />
          </button>
          <button
            onClick={handleWishlistClick}
            className="hidden md:block relative p-1.5 hover:opacity-80 transition-opacity"
            style={{ color: BRAND_PRIMARY }}
          >
            <Heart size={24} />
            {wishlistCount > 0 && (
              <span
                className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm wishlist-badge ${wishlistBadgeAnimation}`}
              >
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
          </button>
          <div className="relative">
            <button 
              onClick={handleUserClick} 
              className="hover:opacity-80 transition-opacity p-1.5"
              style={{ color: BRAND_PRIMARY }}
            >
              <User size={24} />
              {customerData && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>}
            </button>
            <AnimatePresence>
              {showUserDropdown && customerData && (
                <motion.div
                  key="user-dropdown"
                  ref={userDropdownRef}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={dropdownVariants}
                  className="absolute right-0 top-full mt-2 w-[30vw] min-w-[250px] max-w-[300px] bg-white rounded-lg shadow-xl z-50 overflow-hidden border"
                >
                  <div className="p-5 border-b">
                    <div className="font-bold text-lg">{customerData.full_name}</div>
                    <div className="text-sm text-gray-500 mt-1">{customerData.email}</div>
                  </div>
                  <div className="p-3">
                    <button 
                      onClick={handleOrdersClick}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100 text-base font-medium"
                    >
                      <Package size={18} /> My Orders
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100 text-base font-medium"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button 
            onClick={handleCartClick} 
            className="hidden md:block relative hover:opacity-80 transition-opacity p-1.5"
            style={{ color: BRAND_PRIMARY }}
          >
            <ShoppingBag size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
                style={{ backgroundColor: BRAND_SECONDARY }}
              >
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </header>
      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex justify-around items-center py-3 shadow-lg">
          <button
            onClick={toggleMobileMenu}
            className="flex flex-col items-center p-2 text-gray-600 hover:text-[#3D2F23] transition-colors"
          >
            {showMobileMenu ? <X size={22} /> : <Menu size={22} />}
            <span className="text-xs mt-1 font-medium">Menu</span>
          </button>
          <button
            onClick={() => handleShopClick(true)}
            className="flex flex-col items-center p-2 text-gray-600 hover:text-[#3D2F23] transition-colors"
          >
            <ShoppingCart size={22} />
            <span className="text-xs mt-1 font-medium">Shop</span>
          </button>
          <button
            onClick={handleCartClick}
            className="relative flex flex-col items-center p-2 text-gray-600 hover:text-[#3D2F23] transition-colors"
          >
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span
                className="absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
                style={{ backgroundColor: BRAND_SECONDARY }}
              >
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
            <span className="text-xs mt-1 font-medium">Cart</span>
          </button>
          <button
            onClick={handleWishlistClick}
            className="relative flex flex-col items-center p-2 text-gray-600 hover:text-[#3D2F23] transition-colors"
          >
            <Heart size={22} />
            {wishlistCount > 0 && (
              <span
                className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm wishlist-badge ${wishlistBadgeAnimation}`}
              >
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
            <span className="text-xs mt-1 font-medium">Wish</span>
          </button>
        </nav>
      )}
      {showSearchPanel && (
        <SearchPanel
          onClose={() => setShowSearchPanel(false)}
          categories={categories}
          products={products}
        />
      )}
      {/* Wishlist Panel - Right Slide with mobile spacing */}
      <AnimatePresence>
        {showWishlistPanel && customerId && (
          <>
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={overlayVariants}
              className="fixed inset-0 bg-black/30 z-[49]"
              onClick={handleCloseWishlist}
            />
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={rightSlideVariants}
              className="fixed top-0 right-0 h-full w-full md:max-w-lg z-50 bg-white shadow-2xl overflow-y-auto"
              style={{ width: isMobile ? '90%' : undefined }}
            >
              <Wishlist
                onClose={handleCloseWishlist}
                customerId={customerId}
                onWishlistCountUpdate={handleWishlistCountUpdate}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Mobile Menu - Left Slide with reduced width on mobile */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={overlayVariants}
              className="fixed inset-0 bg-black/50 z-45 md:hidden"
              onClick={closeMobileMenu}
            />
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={leftSlideVariants}
              className="fixed top-0 left-0 h-screen bg-white z-50 shadow-2xl overflow-y-auto md:hidden"
              style={{ 
                backgroundColor: BACKGROUND_COLOR,
                width: isMobile ? '85%' : '100%'  // ← Key change: reduced width on mobile, leaves space on right
              }}
            >
              <div className="flex flex-col justify-start h-full relative pt-10">
                <button onClick={closeMobileMenu}
                  className="absolute top-6 right-6 text-gray-600 bg-white rounded-full p-2 shadow-md"
                  style={{zIndex:10}}
                >
                  <X size={28} />
                </button>
                <nav className="flex flex-col w-full pt-20">
                  <button
                    onClick={() => { navigate("/"); closeMobileMenu(); }}
                    className="flex items-center gap-4 px-6 py-5 border-b border-gray-200 text-gray-800 hover:bg-gray-50 transition-colors text-lg font-semibold"
                  >
                    <Home size={24} className="text-gray-600" />
                    <span style={{ color: BRAND_PRIMARY }}>Home</span>
                  </button>
                  <button
                    onClick={() => { setShowSearchPanel(true); closeMobileMenu(); }}
                    className="flex items-center gap-4 px-6 py-5 border-b border-gray-200 text-gray-800 hover:bg-gray-50 transition-colors text-lg font-semibold"
                  >
                    <Search size={24} className="text-gray-600" />
                    <span style={{ color: BRAND_PRIMARY }}>Search</span>
                  </button>
                  <button
                    onClick={() => { handleOrdersClick(); closeMobileMenu(); }}
                    className="flex items-center gap-4 px-6 py-5 border-b border-gray-200 text-gray-800 hover:bg-gray-50 transition-colors text-lg font-semibold"
                  >
                    <Package size={24} className="text-gray-600" />
                    <span style={{ color: BRAND_PRIMARY }}>Track Your Order</span>
                  </button>
                  <Link to="/about" onClick={closeMobileMenu} className="flex items-center gap-4 px-6 py-5 border-b border-gray-200 text-gray-800 hover:bg-gray-50 transition-colors text-lg font-semibold">
                    <Info size={24} className="text-gray-600" />
                    <span style={{ color: BRAND_PRIMARY }}>About us</span>
                  </Link>
                  <Link to="/contact" onClick={closeMobileMenu} className="flex items-center gap-4 px-6 py-5 text-gray-800 hover:bg-gray-50 transition-colors text-lg font-semibold">
                    <Phone size={24} className="text-gray-600" />
                    <span style={{ color: BRAND_PRIMARY }}>Contact us</span>
                  </Link>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {showCartPanel && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300" onClick={handleOverlayClick} />
          {/* Cart panel rendered in CustomerPage */}
        </>
      )}
      {showLoginPanel && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300" onClick={handleOverlayClick} />
          {/* Login panel rendered in CustomerPage */}
        </>
      )}
    </>
  );
}