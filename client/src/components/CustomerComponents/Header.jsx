// import React, { useState, useEffect, useRef } from "react";
// import { Link } from "react-router-dom";
// import {
//   LogOut,
//   ShoppingCart,
//   Package,
//   Menu,
//   X,
//   ChevronDown,
//   Search,
// } from "lucide-react";

// export default function Header({
//   customerData,
//   onLoginClick,
//   onRegisterClick,
//   cartItems,
//   customerId,
//   fetchCart,
//   onCartClick,
//   onOrdersClick,
//   onSearch,
// }) {
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [showMobileMenu, setShowMobileMenu] = useState(false);
//   const [query, setQuery] = useState("");
//   const dropdownRef = useRef(null);

//   useEffect(() => {
//     console.log("Header cartItems:", cartItems);
//   }, [cartItems]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setShowDropdown(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem("customerToken");
//     localStorage.removeItem("customerId");
//     setShowDropdown(false);
//     window.location.reload();
//   };

//   const handleSearchSubmit = (e) => {
//     e.preventDefault();
//     if (query.trim() && onSearch) {
//       onSearch(query.trim());
//     }
//   };

//   // Brand colors matched to the banner "View Product" button
//   const BRAND = "#B6895B";
//   const BRAND_HOVER = "#A7784D";

//   return (
//     <header className="bg-white py-3 px-4 md:px-6 shadow-sm flex items-center justify-between fixed top-0 left-0 right-0 z-40">
//       <div className="flex items-center">
//         <button
//           className="md:hidden mr-3 p-1 rounded-md text-gray-600 hover:text-green-600 hover:bg-gray-100 cursor-pointer"
//           onClick={() => setShowMobileMenu(!showMobileMenu)}
//         >
//           {/* {showMobileMenu ? <X size={24} /> : <Menu size={24} />} */}
//         </button>
//         <Link to="/" className="flex items-center cursor-pointer">
//           <img
//             src="/Assets/Suyambu_Eng_logo.png"
//             alt="Suyambu Stores Logo"
//             className="h-10 w-auto object-contain"
//           />
//         </Link>
//       </div>

//       <form
//         onSubmit={handleSearchSubmit}
//         className="hidden md:flex flex-1 justify-center mx-6"
//       >
//         <div className="flex w-full max-w-lg">
//           <input
//             type="text"
//             placeholder="Search for fresh products..."
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             className="w-full px-4 py-2 border border-gray-300 rounded-l-full focus:outline-none focus:ring-2 focus:ring-green-500"
//           />
//           <button
//             type="submit"
//             className={`bg-[${BRAND}] hover:bg-[${BRAND_HOVER}] text-white px-4 py-2 rounded-r-full flex items-center justify-center transition-colors`}
//           >
//             <Search size={18} />
//           </button>
//         </div>
//       </form>

//       <div className="flex items-center gap-2 md:gap-4">
//         {customerData && (
//           <button
//             onClick={onOrdersClick}
//             className={`bg-[${BRAND}] hover:bg-[${BRAND_HOVER}] text-white p-2 md:px-4 md:py-2 rounded-full flex items-center gap-1 md:gap-2 transition-colors cursor-pointer`}
//           >
//             <Package size={18} />
//             <span className="hidden md:inline text-sm font-medium">
//               My Orders
//             </span>
//           </button>
//         )}
//         <div className="relative">
//           <button
//             onClick={onCartClick}
//             className={`bg-[${BRAND}] hover:bg-[${BRAND_HOVER}] text-white p-2 md:px-4 md:py-2 rounded-full flex items-center gap-1 md:gap-2 transition-colors relative cursor-pointer`}
//           >
//             <ShoppingCart size={18} />
//             {Array.isArray(cartItems) && cartItems.length > 0 && (
//               <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//                 {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
//               </span>
//             )}
//           </button>
//         </div>

//         {!customerData ? (
//           <div className="flex items-center gap-2">
//             <button
//               onClick={onLoginClick}
//               className={`bg-[${BRAND}] hover:bg-[${BRAND_HOVER}] text-white px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer`}
//             >
//               Login
//             </button>
//             <button
//               onClick={onRegisterClick}
//               className={`bg-[${BRAND}] hover:bg-[${BRAND_HOVER}] text-white px-3 py-1.5 rounded-full text-sm font-medium transition-colors hidden sm:block cursor-pointer`}
//             >
//               Register
//             </button>
//           </div>
//         ) : (
//           <div className="relative" ref={dropdownRef}>
//             <button
//               onClick={() => setShowDropdown(!showDropdown)}
//               className="flex items-center gap-2 p-1 md:px-3 md:py-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
//             >
//               <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-medium">
//                 {customerData.full_name.charAt(0).toUpperCase()}
//               </div>
//               <span className="hidden md:block text-sm font-medium text-gray-700">
//                 Hi, {customerData.full_name.split(" ")[0]}
//               </span>
//               <ChevronDown size={16} className="text-gray-500" />
//             </button>

//             {showDropdown && (
//               <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-50 overflow-hidden border border-gray-200">
//                 <div className="p-4 border-b border-gray-100">
//                   <div className="font-medium text-gray-900">
//                     {customerData.full_name}
//                   </div>
//                   <div className="text-xs text-gray-500 mt-1">
//                     {customerData.email}
//                   </div>
//                 </div>
//                 <div className="p-2 border-t border-gray-100">
//                   <button
//                     onClick={handleLogout}
//                     className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 text-sm cursor-pointer"
//                   >
//                     <LogOut size={16} />
//                     Logout
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {showMobileMenu && (
//         <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 md:hidden">
//           <div className="p-4">
//             <form onSubmit={handleSearchSubmit} className="flex mb-4">
//               <input
//                 type="text"
//                 placeholder="Search products..."
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-l-full focus:outline-none focus:ring-2 focus:ring-green-500"
//               />
//               <button
//                 type="submit"
//                 className={`bg-[${BRAND}] hover:bg-[${BRAND_HOVER}] text-white px-4 py-2 rounded-r-full flex items-center justify-center transition-colors`}
//               >
//                 <Search size={18} />
//               </button>
//             </form>

//             {!customerData ? (
//               <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
//                 <button
//                   onClick={onLoginClick}
//                   className={`w-full bg-[${BRAND}] hover:bg-[${BRAND_HOVER}] text-white px-4 py-2 rounded-full font-medium cursor-pointer`}
//                 >
//                   Login
//                 </button>
//                 <button
//                   onClick={onRegisterClick}
//                   className={`w-full bg-[${BRAND}] hover:bg-[${BRAND_HOVER}] text-white px-4 py-2 rounded-full font-medium cursor-pointer`}
//                 >
//                   Register
//                 </button>
//               </div>
//             ) : (
//               <div className="pt-2 border-t border-gray-200">
//                 <div className="mb-3">
//                   <div className="font-medium text-gray-900">
//                     {customerData.full_name}
//                   </div>
//                   <div className="text-xs text-gray-500">
//                     {customerData.email}
//                   </div>
//                 </div>
//                 <div className="flex flex-col gap-2">
//                   <button
//                     onClick={onOrdersClick}
//                     className={`text-center block px-4 py-2 rounded-md bg-[${BRAND}] hover:bg-[${BRAND_HOVER}] text-white font-medium cursor-pointer`}
//                   >
//                     My Orders
//                   </button>
//                   <button
//                     onClick={handleLogout}
//                     className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer"
//                   >
//                     <LogOut size={16} />
//                     Logout
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </header>
//   );
// }










import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  LogOut,
  ShoppingCart,
  Package,
  Menu,
  X,
  ChevronDown,
  Search,
} from "lucide-react";

export default function Header({
  customerData,
  onLoginClick,
  onRegisterClick,
  cartItems,
  customerId,
  fetchCart,
  onCartClick,
  onOrdersClick,
  onSearch,
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    console.log("Header cartItems:", cartItems);
  }, [cartItems]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerId");
    setShowDropdown(false);
    window.location.reload();
  };

  const handleSearchChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    if (onSearch) {
      onSearch(newQuery.trim());
    }
  };

  const BRAND = "#B6895B";
  const BRAND_HOVER = "#A7784D";

  return (
    <header className="bg-white py-3 px-4 md:px-6 shadow-sm flex items-center justify-between fixed top-0 left-0 right-0 z-40">
      <div className="flex items-center">
        <Link to="/" className="flex items-center cursor-pointer">
          <img
            src="/Assets/Suyambu_Eng_logo.png"
            alt="Suyambu Stores Logo"
            className="h-12 md:h-14 lg:h-16 w-auto object-contain"
          />
        </Link>
      </div>

      <div className="hidden md:flex flex-1 justify-center mx-6">
        <div className="flex w-full max-w-lg">
          <input
            type="text"
            placeholder="Search for fresh products..."
            value={query}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-l-full focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <div
            className={`bg-[${BRAND}] hover:bg-[${BRAND_HOVER}] text-white px-4 py-2 rounded-r-full flex items-center justify-center transition-colors`}
          >
            <Search size={18} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {customerData && (
          <button
            onClick={onOrdersClick}
            className={`bg-[${BRAND}] hover:bg-[${BRAND_HOVER}] text-white p-2 md:px-4 md:py-2 rounded-full flex items-center gap-1 md:gap-2 transition-colors cursor-pointer`}
          >
            <Package size={18} />
            <span className="hidden md:inline text-sm font-medium">
              My Orders
            </span>
          </button>
        )}
        <div className="relative">
          <button
            onClick={onCartClick}
            className={`bg-[${BRAND}] hover:bg-[${BRAND_HOVER}] text-white p-2 md:px-4 md:py-2 rounded-full flex items-center gap-1 md:gap-2 transition-colors relative cursor-pointer`}
          >
            <ShoppingCart size={18} />
            {Array.isArray(cartItems) && cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>

        {!customerData ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onLoginClick}
              className={`bg-[${BRAND}] hover:bg-[${BRAND_HOVER}] text-white px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer`}
            >
              Login
            </button>
            <button
              onClick={onRegisterClick}
              className={`bg-[${BRAND}] hover:bg-[${BRAND_HOVER}] text-white px-3 py-1.5 rounded-full text-sm font-medium transition-colors hidden sm:block cursor-pointer`}
            >
              Register
            </button>
          </div>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-1 md:px-3 md:py-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-medium">
                {customerData.full_name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                Hi, {customerData.full_name.split(" ")[0]}
              </span>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-50 overflow-hidden border border-gray-200">
                <div className="p-4 border-b border-gray-100">
                  <div className="font-medium text-gray-900">
                    {customerData.full_name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {customerData.email}
                  </div>
                </div>
                <div className="p-2 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 text-sm cursor-pointer"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {showMobileMenu && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 md:hidden">
          <div className="p-4">
            {!customerData ? (
              <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
                <button
                  onClick={onLoginClick}
                  className={`w-full bg-[${BRAND}] hover:bg-[${BRAND_HOVER}] text-white px-4 py-2 rounded-full font-medium cursor-pointer`}
                >
                  Login
                </button>
                <button
                  onClick={onRegisterClick}
                  className={`w-full bg-[${BRAND}] hover:bg-[${BRAND_HOVER}] text-white px-4 py-2 rounded-full font-medium cursor-pointer`}
                >
                  Register
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-gray-200">
                <div className="mb-3">
                  <div className="font-medium text-gray-900">
                    {customerData.full_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {customerData.email}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={onOrdersClick}
                    className={`text-center block px-4 py-2 rounded-md bg-[${BRAND}] hover:bg-[${BRAND_HOVER}] text-white font-medium cursor-pointer`}
                  >
                    My Orders
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}