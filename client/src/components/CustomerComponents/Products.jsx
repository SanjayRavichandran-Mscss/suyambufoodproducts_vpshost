// import React, { useEffect, useState, useMemo } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { Heart, Plus, Minus, Box } from "lucide-react";

// const IMAGE_BASE = "https://suyambuoils.com/api";
// const BRAND = "#B6895B";

// const IconMap = {
//   Box,
//   // Add more mappings if needed in future
// };

// const normalizeImage = (img) => {
//   if (!img) return "https://via.placeholder.com/600x400";
//   if (img.startsWith("http://") || img.startsWith("https://")) return img;
//   if (img.startsWith("/")) return `${IMAGE_BASE}${img}`;
//   return `${IMAGE_BASE}/${img}`;
// };

// export default function Products({
//   isLoggedIn,
//   customerId,
//   cartItems,
//   setCartItems,
//   fetchCart,
//   wishlist,
//   handleToggleWishlist,
//   showMessage,
//   headerSearchTerm,
// }) {
//   const [products, setProducts] = useState([]);
//   const [uoms, setUoms] = useState([]);
//   const [selectedUoms, setSelectedUoms] = useState({});
//   const [selectedVariants, setSelectedVariants] = useState({});
//   const [err, setErr] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [category, setCategory] = useState("all");
//   const [categories, setCategories] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [visibleCount, setVisibleCount] = useState(20);
//   const [wishlistIds, setWishlistIds] = useState([]);
//   const [categoryCounts, setCategoryCounts] = useState({ all: 0 });

//   const navigate = useNavigate();

//   // Fetch wishlist
//   const fetchWishlist = async () => {
//     if (!isLoggedIn || !customerId) {
//       setWishlistIds([]);
//       return;
//     }
//     try {
//       const response = await axios.get(
//         `https://suyambuoils.com/api/customer/wishlist/?customerId=${customerId}`,
//         {  }
//       );
//       const likedIds = response.data.wishlist
//         ? response.data.wishlist
//             .filter((item) => item.is_liked === 1)
//             .map((item) => item.product_id)
//         : [];
//       setWishlistIds(likedIds);
//     } catch (err) {
//       console.error("Failed to fetch wishlist:", err);
//       setWishlistIds([]);
//     }
//   };

//   useEffect(() => {
//     fetchWishlist();
//   }, [isLoggedIn, customerId]);

//   // Handle sessionStorage + custom event from banner/footer
//   useEffect(() => {
//     const storedCategory = sessionStorage.getItem("selectedCategory");
//     if (storedCategory) {
//       setCategory(storedCategory);
//       sessionStorage.removeItem("selectedCategory");
//     }

//     const scrollToShop = sessionStorage.getItem("scrollToShopSection");
//     if (scrollToShop === "yes") {
//       const section = document.getElementById("shop-by-category");
//       if (section) {
//         section.scrollIntoView({ behavior: "smooth", block: "start" });
//       }
//       sessionStorage.removeItem("scrollToShopSection");
//     }
//   }, []);

//   useEffect(() => {
//     const onSetCategory = (e) => {
//       const next = String(e.detail?.value || "all");
//       setCategory(next);
//       const section = document.getElementById("shop-by-category");
//       if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
//     };
//     window.addEventListener("setCategory", onSetCategory);
//     return () => window.removeEventListener("setCategory", onSetCategory);
//   }, []);

//   // Fetch products + uoms + prepare categories & counts
//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);

//       try {
//         // 1. Fetch UOMs
//         const uomRes = await axios.get("https://suyambuoils.com/api/admin/uoms", {
//           ,
//         });
//         setUoms(uomRes.data || []);

//         // 2. Fetch Products
//         const prodRes = await axios.get("https://suyambuoils.com/api/admin/products", {
//           ,
//         });

//         const raw = prodRes.data || [];
//         const productsWithImages = raw.map((p) => {
//           const seen = new Set();
//           const variants = Array.isArray(p.variants)
//             ? p.variants
//                 .map((v) => ({
//                   ...v,
//                   id: v.id,
//                   uom_id: v.uom_id != null ? String(v.uom_id) : undefined,
//                   price: v.price != null ? Number(v.price) : undefined,
//                   variant_quantity: v.quantity != null ? v.quantity : v.variant_quantity || "",
//                   uom_name: v.uom_name || "",
//                 }))
//                 .filter((v) => {
//                   const key = `${v.uom_id}::${v.variant_quantity}::${v.price}`;
//                   if (seen.has(key)) return false;
//                   seen.add(key);
//                   return true;
//                 })
//             : [];

//           return {
//             ...p,
//             thumbnail_url: p.thumbnail_url ? normalizeImage(p.thumbnail_url) : "https://via.placeholder.com/600x400",
//             additional_images: Array.isArray(p.additional_images)
//               ? p.additional_images.map(normalizeImage)
//               : [],
//             variants,
//           };
//         });

//         setProducts(productsWithImages);

//         // Category counts
//         const counts = { all: productsWithImages.length };
//         productsWithImages.forEach((p) => {
//           const cat = p.category_name?.toLowerCase().trim();
//           if (cat) counts[cat] = (counts[cat] || 0) + 1;
//         });
//         setCategoryCounts(counts);

//         // Categories list for chips
//         const uniqueCats = [
//           ...new Set(productsWithImages.map((p) => p.category_name).filter(Boolean)),
//         ];

//         const catList = [
//           { key: "all", label: "All Products", value: "all", Icon: Box },
//           ...uniqueCats.map((name) => ({
//             key: name,
//             label: name,
//             value: name.toLowerCase().trim(),
//             Icon: IconMap[name] || Box,
//           })),
//           { key: "wishlist", label: "My Wishlist", value: "wishlist", Icon: Heart },
//         ];

//         setCategories(catList);

//         // Default variant selections
//         const initUom = {};
//         const initVar = {};
//         productsWithImages.forEach((p) => {
//           if (p.variants?.length) {
//             const first = p.variants[0];
//             initUom[String(p.id)] = String(first.uom_id);
//             initVar[String(p.id)] = first;
//           }
//         });
//         setSelectedUoms((prev) => ({ ...prev, ...initUom }));
//         setSelectedVariants((prev) => ({ ...prev, ...initVar }));

//       } catch (err) {
//         setErr("Failed to load products");
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // Sync search from header
//   useEffect(() => {
//     if (headerSearchTerm !== undefined) {
//       setSearchTerm(headerSearchTerm || "");
//     }
//   }, [headerSearchTerm]);

//   // Reset visible count when filters change
//   useEffect(() => {
//     setVisibleCount(20);
//   }, [category, searchTerm]);

//   // Filter products
//   const filteredProducts = useMemo(() => {
//     let result = products;

//     if (searchTerm.trim()) {
//       const term = searchTerm.toLowerCase();
//       result = result.filter((p) => p.name.toLowerCase().includes(term));
//     } else if (category !== "all") {
//       if (category === "wishlist") {
//         result = result.filter((p) => wishlistIds.includes(p.id));
//       } else {
//         result = result.filter(
//           (p) => p.category_name?.toLowerCase().trim() === category
//         );
//       }
//     }

//     return result;
//   }, [products, searchTerm, category, wishlistIds]);

//   const visibleProducts = filteredProducts.slice(0, visibleCount);

//   // Category chip click handler
//   const handleCategoryClick = (value) => {
//     setCategory(value);
//     const section = document.getElementById("shop-by-category");
//     if (section) {
//       section.scrollIntoView({ behavior: "smooth", block: "start" });
//     }
//   };

//   // ────────────────────────────────────────────────
//   // Cart & Wishlist actions
//   // ────────────────────────────────────────────────
//   const localFetchCart = async () => {
//     if (!customerId) return [];
//     try {
//       const response = await axios.get(
//         `https://suyambuoils.com/api/customer/cart?customerId=${customerId}`,
//         {  }
//       );
//       return Array.isArray(response.data) ? response.data : [];
//     } catch (err) {
//       showMessage(
//         `Failed to fetch cart: ${err.response?.data?.error || err.message}`,
//         "error"
//       );
//       return [];
//     }
//   };

//   const handleAddToCart = async (productId, quantity = 1) => {
//     if (!isLoggedIn) return;
//     if (!customerId) {
//       showMessage("Error: No customer ID found", "error");
//       return;
//     }
//     const variantId = selectedVariants[String(productId)]?.id;
//     if (!variantId) {
//       showMessage("Please select a product variant", "warning");
//       return;
//     }
//     try {
//       await axios.post(
//         "https://suyambuoils.com/api/customer/cart",
//         { customerId, variantId, quantity },
//         {  }
//       );
//       const fetchCartFunction = typeof fetchCart === "function" ? fetchCart : localFetchCart;
//       const updatedCart = await fetchCartFunction();
//       setCartItems(updatedCart || []);
//       showMessage("Item added to cart successfully");
//     } catch (err) {
//       showMessage(
//         `Failed to add to cart: ${err.response?.data?.error || err.message}`,
//         "error"
//       );
//     }
//   };

//   const updateQuantity = async (variantId, change) => {
//     const item = Array.isArray(cartItems)
//       ? cartItems.find((item) => String(item.product_variant_id) === String(variantId))
//       : undefined;
//     if (!item) {
//       showMessage("Item not found in cart", "error");
//       return;
//     }
//     const newQuantity = Math.max(1, item.quantity + change);
//     try {
//       await axios.put(
//         "https://suyambuoils.com/api/customer/cart",
//         { customerId, variantId, quantity: newQuantity },
//         {  }
//       );
//       const fetchCartFunction = typeof fetchCart === "function" ? fetchCart : localFetchCart;
//       const updatedCart = await fetchCartFunction();
//       setCartItems(updatedCart || []);
//       showMessage("Cart updated successfully");
//     } catch (err) {
//       showMessage(
//         `Failed to update quantity: ${err.response?.data?.error || err.message}`,
//         "error"
//       );
//     }
//   };

//   const handleUomChange = (productId, composite, variants) => {
//     const [uomId, qty, price] = String(composite).split("::");
//     const variant = variants.find(
//       (v) =>
//         String(v.uom_id) === String(uomId) &&
//         String(v.variant_quantity ?? v.quantity ?? "") === String(qty) &&
//         String(v.price ?? "") === String(price)
//     );
//     setSelectedUoms((prev) => ({ ...prev, [String(productId)]: String(uomId) }));
//     setSelectedVariants((prev) => ({ ...prev, [String(productId)]: variant || null }));
//   };

//   const handleWishlistToggle = async (productId) => {
//     const currentLiked = wishlistIds.includes(productId);
//     // Optimistic update
//     setWishlistIds((prev) =>
//       currentLiked ? prev.filter((id) => id !== productId) : [...prev, productId]
//     );
//     try {
//       await handleToggleWishlist(productId);
//       await fetchWishlist();
//     } catch (err) {
//       // Revert on error
//       setWishlistIds((prev) =>
//         currentLiked ? [...prev, productId] : prev.filter((id) => id !== productId)
//       );
//       showMessage("Failed to update wishlist", "error");
//     }
//   };

//   // ────────────────────────────────────────────────
//   // Render
//   // ────────────────────────────────────────────────
//   if (loading) {
//     return (
//       <div className="flex justify-center items-center py-20">
//         <div className="text-gray-600">Loading products...</div>
//       </div>
//     );
//   }

//   return (
//     <div
//       className="container mx-auto px-4 md:px-6 lg:px-10"
//       style={{
//         fontFamily: "Inter, system-ui, sans-serif",
//         WebkitFontSmoothing: "antialiased",
//         MozOsxFontSmoothing: "grayscale",
//       }}
//     >
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
//         .hide-scrollbar::-webkit-scrollbar { display: none; }
//         .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//         .variant-select option:hover { background-color: #22c55e33; color: #14532d; }
//       `}</style>

// {/* ─── SHOP BY CATEGORY  ─── */}
// <section id="shop-by-category" className="pt-8 pb-12 bg-white">
//   <div className="container mx-auto px-4">
//     <h2 className="text-center text-3xl md:text-4xl font-bold text-[#3D2F23] mb-8 md:mb-10">
//       Shop by Category
//     </h2>

//     <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 hide-scrollbar snap-x snap-mandatory">
//       {categories.map((cat) => {
//         const isActive = cat.value === category;
//         const count =
//           cat.value === "all"
//             ? categoryCounts.all || 0
//             : cat.value === "wishlist"
//             ? wishlistIds.length
//             : categoryCounts[cat.value] || 0;

//         return (
//           <button
//             key={cat.key}
//             onClick={() => handleCategoryClick(cat.value)}
//             className={`
//               flex items-center gap-3 px-6 md:px-8 py-4 md:py-5 
//               rounded-2xl font-semibold whitespace-nowrap shadow-sm transition-all duration-300 snap-center
//               border border-transparent
//               ${
//                 isActive
//                   ? "bg-[#B6895B] text-white shadow-lg scale-105 border-[#B6895B]"
//                   : "bg-white text-[#3D2F23] hover:bg-[#B6895B]/10 hover:shadow-md hover:border-[#B6895B]/30"
//               }
//             `}
//           >
//             <cat.Icon 
//               size={22} 
//               className={`md:size-6 ${isActive ? "text-white" : "text-[#B6895B]"}`}
//             />
//             <span className="flex items-center gap-2">
//               {cat.label}
//               <span className={`font-bold text-base md:text-lg ${isActive ? "opacity-100" : "opacity-80"}`}>
//                 ({count})
//               </span>
//             </span>
//           </button>
//         );
//       })}
//     </div>
//   </div>
// </section>
//       {/* Product Grid */}
//       <section className="pb-12">
//         <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5 xl:gap-8">
//           {visibleProducts.length > 0 ? (
//             visibleProducts.map((product) => (
//               <ProductCard
//                 key={product.id}
//                 product={product}
//                 isLoggedIn={isLoggedIn}
//                 customerId={customerId}
//                 cartItems={cartItems}
//                 updateQuantity={updateQuantity}
//                 handleToggleWishlist={handleWishlistToggle}
//                 wishlist={wishlistIds}
//                 selectedUom={selectedUoms[String(product.id)]}
//                 selectedVariant={selectedVariants[String(product.id)]}
//                 handleUomChange={(id, value) =>
//                   handleUomChange(id, value, product.variants)
//                 }
//                 handleAddToCart={handleAddToCart}
//                 navigate={navigate}
//                 showMessage={showMessage}
//                 uoms={uoms}
//               />
//             ))
//           ) : (
//             <div className="text-center py-12 text-gray-600 col-span-full">
//               {category === "wishlist"
//                 ? "No products in your wishlist."
//                 : searchTerm.trim()
//                 ? "No products match your search."
//                 : "No products available in this category."}
//             </div>
//           )}
//         </div>

//         {visibleCount < filteredProducts.length && filteredProducts.length > 0 && (
//           <div className="text-center py-10">
//             <button
//               onClick={() => setVisibleCount((prev) => prev + 20)}
//               className="bg-[#B6895B] hover:bg-[#a0784a] text-white font-medium px-10 py-3.5 rounded-full transition-all shadow-md hover:shadow-lg"
//             >
//               View More
//             </button>
//           </div>
//         )}
//       </section>

//       {err && <p className="text-red-500 text-center mt-8 mb-4">{err}</p>}
//     </div>
//   );
// }

// function ProductCard({
//   product,
//   isLoggedIn,
//   customerId,
//   cartItems,
//   updateQuantity,
//   handleToggleWishlist,
//   wishlist,
//   selectedUom,
//   selectedVariant,
//   handleUomChange,
//   handleAddToCart,
//   navigate,
//   showMessage,
//   uoms,
// }) {
//   const cartItem = Array.isArray(cartItems)
//     ? cartItems.find(
//         (item) => String(item.product_variant_id) === String(selectedVariant?.id)
//       )
//     : undefined;

//   const quantity = cartItem ? cartItem.quantity : 0;
//   const isLiked = Array.isArray(wishlist) && wishlist.includes(product.id);
//   const isOutOfStock = product.stock_status_id === 2;

//   const displayVariants = Array.isArray(product.variants) ? product.variants : [];

//   const effectiveVariant =
//     selectedVariant ||
//     displayVariants.find((v) => String(v.uom_id) === String(selectedUom)) ||
//     displayVariants[0] ||
//     null;

//   const variantKey = (v) =>
//     `${v.uom_id}::${v.variant_quantity ?? v.quantity ?? ""}::${v.price ?? ""}`;

//   const currentValue = effectiveVariant
//     ? variantKey(effectiveVariant)
//     : displayVariants[0]
//     ? variantKey(displayVariants[0])
//     : "";

//   const getDisplayQuantity = (variant) => {
//     const qty = variant.variant_quantity || variant.quantity || "";
//     let uomName = variant.uom_name || "";
//     if (uoms && variant.uom_id) {
//       const uomObj = uoms.find((u) => String(u.id) === String(variant.uom_id));
//       if (uomObj && uomObj.name) uomName = uomObj.name;
//     }
//     return `${qty} ${uomName}`;
//   };

//   const handlePlusClick = () => {
//     if (!isLoggedIn) {
//       if (typeof window.openLoginPanel === "function") {
//         window.openLoginPanel();
//       }
//       return;
//     }
//     if (isOutOfStock || !effectiveVariant) return;
//     if (quantity > 0) {
//       updateQuantity(effectiveVariant.id, 1);
//     } else {
//       handleAddToCart(product.id);
//     }
//   };

//   return (
//     <div
//       className="
//         group bg-white rounded-[20px] border border-gray-200/50
//         shadow-[0_4px_12px_rgba(0,0,0,0.08)]
//         transition-all duration-300 ease-out
//         hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)]
//         hover:-translate-y-1 hover:border-[#B6895B]/20
//         overflow-hidden flex flex-col h-full w-full
//       "
//     >
//       <div className="relative w-full h-[200px] overflow-hidden bg-gray-50">
//         <img
//           src={product.thumbnail_url}
//           alt={product.name}
//           className="
//             w-full h-full object-cover cursor-pointer
//             transition-transform duration-500 ease-out
//             group-hover:scale-105
//           "
//           onClick={() => {
//             const encodedCustomerId = btoa(customerId || "");
//             const encodedProductId = btoa(product.id.toString());
//             const selectedParams = effectiveVariant ? `&variantId=${effectiveVariant.id}` : "";
//             navigate(
//               `/customer?customerId=${encodedCustomerId}&productId=${encodedProductId}${selectedParams}`
//             );
//             window.scrollTo({ top: 0, behavior: "smooth" });
//           }}
//           onError={(e) => {
//             e.currentTarget.src = "https://via.placeholder.com/600x400";
//           }}
//         />

//         <button
//           onClick={() => handleToggleWishlist(product.id)}
//           className="
//             absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg
//             hover:bg-white transition-all duration-300
//             opacity-0 group-hover:opacity-100
//             transform scale-0 group-hover:scale-100
//           "
//           title="Toggle wishlist"
//         >
//           <Heart
//             size={16}
//             className={isLiked ? "text-red-500 fill-red-500" : "text-gray-600"}
//           />
//         </button>

//         <span
//           className={`
//             absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full shadow-lg backdrop-blur-sm z-10
//             ${product.stock_status_id === 1 ? 'bg-green-100/90 text-green-700' : 'bg-red-100/90 text-red-700'}
//           `}
//         >
//           {product.stock_status}
//         </span>
//       </div>

//       <div className="p-4 flex flex-col gap-3 flex-1 justify-between">
//         <div>
//           <h3
//             className="text-base font-semibold text-gray-900 cursor-pointer leading-tight line-clamp-2 transition-colors duration-200 group-hover:text-[#B6895B]"
//             onClick={() => {
//               const encodedCustomerId = btoa(customerId || "");
//               const encodedProductId = btoa(product.id.toString());
//               const selectedParams = effectiveVariant ? `&variantId=${effectiveVariant.id}` : "";
//               navigate(
//                 `/customer?customerId=${encodedCustomerId}&productId=${encodedProductId}${selectedParams}`
//               );
//             }}
//           >
//             {product.name}
//           </h3>
//           <p className="text-xs text-gray-500 mt-1">{product.category_name}</p>

//           {displayVariants.length > 1 && (
//             <div className="relative w-full mt-2">
//               <select
//                 value={currentValue}
//                 onChange={(e) => handleUomChange(product.id, e.target.value, displayVariants)}
//                 className="
//                   variant-select w-full appearance-none rounded-lg px-3 py-1.5
//                   bg-gray-50/50 text-xs text-gray-700
//                   border border-gray-200/50 shadow-sm
//                   focus:outline-none focus:ring-1 focus:ring-[#B6895B]/30 focus:border-[#B6895B]/40
//                   transition-all duration-200
//                   hover:border-[#B6895B]/30
//                 "
//                 style={{
//                   WebkitAppearance: "none",
//                   MozAppearance: "none",
//                 }}
//               >
//                 {displayVariants.map((variant) => (
//                   <option key={variant.id} value={variantKey(variant)}>
//                     {`${getDisplayQuantity(variant)} - ₹${Number(variant.price).toFixed(2)}`}
//                   </option>
//                 ))}
//               </select>
//               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
//                 <svg
//                   className="h-3 w-3"
//                   xmlns="http://www.w3.org/2000/svg"
//                   viewBox="0 0 20 20"
//                   fill="currentColor"
//                   aria-hidden="true"
//                 >
//                   <path
//                     fillRule="evenodd"
//                     d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="flex items-start justify-between pt-1 flex-wrap gap-4">
//           <div className="flex flex-col items-start flex-shrink-0">
//             <div className="text-base sm:text-lg font-bold" style={{ color: BRAND }}>
//               ₹
//               {effectiveVariant?.price != null
//                 ? Number(effectiveVariant.price).toFixed(2)
//                 : "0.00"}
//             </div>
//             {quantity > 0 && (
//               <div className="text-sm font-medium mt-1" style={{ color: BRAND }}>
//                 Total: ₹{(effectiveVariant?.price ? Number(effectiveVariant.price) * quantity : 0).toFixed(2)}
//               </div>
//             )}
//           </div>

//           <div className="flex items-center gap-1 shrink-0 self-end">
//             {quantity > 0 ? (
//               <>
//                 <button
//                   onClick={() => updateQuantity(effectiveVariant.id, -1)}
//                   disabled={quantity <= 1}
//                   className={`h-6 w-6 rounded-full border-2 grid place-items-center transition-all duration-200 text-xs flex-shrink-0 ${
//                     quantity <= 1
//                       ? "border-gray-200 text-gray-300 cursor-not-allowed"
//                       : "border-[#B6895B] text-[#B6895B] hover:bg-[#B6895B]/10 cursor-pointer"
//                   }`}
//                   title="Decrease"
//                 >
//                   <Minus size={10} />
//                 </button>
//                 <span className="w-6 text-center text-sm font-semibold text-gray-700 min-w-[1.5rem] flex-shrink-0">
//                   {quantity}
//                 </span>
//                 <button
//                   onClick={handlePlusClick}
//                   className="h-6 w-6 rounded-full border-2 border-[#B6895B] text-[#B6895B] hover:bg-[#B6895B]/10 grid place-items-center transition-all duration-200 text-xs flex-shrink-0 cursor-pointer"
//                   title="Increase"
//                 >
//                   <Plus size={10} />
//                 </button>
//               </>
//             ) : (
//               <button
//                 onClick={handlePlusClick}
//                 className="h-6 w-6 rounded-full border-2 border-[#B6895B] text-[#B6895B] hover:bg-[#B6895B]/10 grid place-items-center transition-all duration-200 flex-shrink-0 cursor-pointer"
//                 title="Add to cart"
//               >
//                 <Plus size={10} />
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }











import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Heart, Plus, Minus, Box } from "lucide-react";

const IMAGE_BASE = "https://suyambuoils.com/api";
const BRAND = "#B6895B";

const IconMap = {
  Box,
  // Add more mappings if needed in future
};

const normalizeImage = (img) => {
  if (!img) return "https://via.placeholder.com/600x400";
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  if (img.startsWith("/")) return `${IMAGE_BASE}${img}`;
  return `${IMAGE_BASE}/${img}`;
};

export default function Products({
  isLoggedIn,
  customerId,
  cartItems,
  setCartItems,
  fetchCart,
  wishlist,
  handleToggleWishlist,
  showMessage,
  headerSearchTerm,
}) {
  const [products, setProducts] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [selectedUoms, setSelectedUoms] = useState({});
  const [selectedVariants, setSelectedVariants] = useState({});
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({ all: 0 });

  const navigate = useNavigate();

  // Fetch wishlist
  const fetchWishlist = async () => {
    if (!isLoggedIn || !customerId) {
      setWishlistIds([]);
      return;
    }
    try {
      const response = await axios.get(
        `https://suyambuoils.com/api/customer/wishlist/?customerId=${customerId}`
      );
      const likedIds = response.data.wishlist
        ? response.data.wishlist
            .filter((item) => item.is_liked === 1)
            .map((item) => item.product_id)
        : [];
      setWishlistIds(likedIds);
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
      setWishlistIds([]);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isLoggedIn, customerId]);

  // Handle sessionStorage + custom event from banner/footer
  useEffect(() => {
    const storedCategory = sessionStorage.getItem("selectedCategory");
    if (storedCategory) {
      setCategory(storedCategory);
      sessionStorage.removeItem("selectedCategory");
    }

    const scrollToShop = sessionStorage.getItem("scrollToShopSection");
    if (scrollToShop === "yes") {
      const section = document.getElementById("shop-by-category");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      sessionStorage.removeItem("scrollToShopSection");
    }
  }, []);

  useEffect(() => {
    const onSetCategory = (e) => {
      const next = String(e.detail?.value || "all");
      setCategory(next);
      const section = document.getElementById("shop-by-category");
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener("setCategory", onSetCategory);
    return () => window.removeEventListener("setCategory", onSetCategory);
  }, []);

  // Fetch products + uoms + prepare categories & counts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // 1. Fetch UOMs
        const uomRes = await axios.get("https://suyambuoils.com/api/admin/uoms");
        setUoms(uomRes.data || []);

        // 2. Fetch Products
        const prodRes = await axios.get("https://suyambuoils.com/api/admin/products");

        const raw = prodRes.data || [];
        const productsWithImages = raw.map((p) => {
          const seen = new Set();
          const variants = Array.isArray(p.variants)
            ? p.variants
                .map((v) => ({
                  ...v,
                  id: v.id,
                  uom_id: v.uom_id != null ? String(v.uom_id) : undefined,
                  price: v.price != null ? Number(v.price) : undefined,
                  variant_quantity: v.quantity != null ? v.quantity : v.variant_quantity || "",
                  uom_name: v.uom_name || "",
                }))
                .filter((v) => {
                  const key = `${v.uom_id}::${v.variant_quantity}::${v.price}`;
                  if (seen.has(key)) return false;
                  seen.add(key);
                  return true;
                })
            : [];

          return {
            ...p,
            thumbnail_url: p.thumbnail_url ? normalizeImage(p.thumbnail_url) : "https://via.placeholder.com/600x400",
            additional_images: Array.isArray(p.additional_images)
              ? p.additional_images.map(normalizeImage)
              : [],
            variants,
          };
        });

        setProducts(productsWithImages);

        // Category counts
        const counts = { all: productsWithImages.length };
        productsWithImages.forEach((p) => {
          const cat = p.category_name?.toLowerCase().trim();
          if (cat) counts[cat] = (counts[cat] || 0) + 1;
        });
        setCategoryCounts(counts);

        // Categories list for chips
        const uniqueCats = [
          ...new Set(productsWithImages.map((p) => p.category_name).filter(Boolean)),
        ];

        const catList = [
          { key: "all", label: "All Products", value: "all", Icon: Box },
          ...uniqueCats.map((name) => ({
            key: name,
            label: name,
            value: name.toLowerCase().trim(),
            Icon: IconMap[name] || Box,
          })),
          { key: "wishlist", label: "My Wishlist", value: "wishlist", Icon: Heart },
        ];

        setCategories(catList);

        // Default variant selections
        const initUom = {};
        const initVar = {};
        productsWithImages.forEach((p) => {
          if (p.variants?.length) {
            const first = p.variants[0];
            initUom[String(p.id)] = String(first.uom_id);
            initVar[String(p.id)] = first;
          }
        });
        setSelectedUoms((prev) => ({ ...prev, ...initUom }));
        setSelectedVariants((prev) => ({ ...prev, ...initVar }));

      } catch (err) {
        setErr("Failed to load products");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sync search from header
  useEffect(() => {
    if (headerSearchTerm !== undefined) {
      setSearchTerm(headerSearchTerm || "");
    }
  }, [headerSearchTerm]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(20);
  }, [category, searchTerm]);

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = products;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(term));
    } else if (category !== "all") {
      if (category === "wishlist") {
        result = result.filter((p) => wishlistIds.includes(p.id));
      } else {
        result = result.filter(
          (p) => p.category_name?.toLowerCase().trim() === category
        );
      }
    }

    return result;
  }, [products, searchTerm, category, wishlistIds]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  // Category chip click handler
  const handleCategoryClick = (value) => {
    setCategory(value);
    const section = document.getElementById("shop-by-category");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // ────────────────────────────────────────────────
  // Cart & Wishlist actions
  // ────────────────────────────────────────────────
  const localFetchCart = async () => {
    if (!customerId) return [];
    try {
      const response = await axios.get(
        `https://suyambuoils.com/api/customer/cart?customerId=${customerId}`
      );
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      showMessage(
        `Failed to fetch cart: ${err.response?.data?.error || err.message}`,
        "error"
      );
      return [];
    }
  };

  const handleAddToCart = async (productId, quantity = 1) => {
    if (!isLoggedIn) return;
    if (!customerId) {
      showMessage("Error: No customer ID found", "error");
      return;
    }
    const variantId = selectedVariants[String(productId)]?.id;
    if (!variantId) {
      showMessage("Please select a product variant", "warning");
      return;
    }
    try {
      await axios.post(
        "https://suyambuoils.com/api/customer/cart",
        { customerId, variantId, quantity }
      );
      const fetchCartFunction = typeof fetchCart === "function" ? fetchCart : localFetchCart;
      const updatedCart = await fetchCartFunction();
      setCartItems(updatedCart || []);
      showMessage("Item added to cart successfully");
    } catch (err) {
      showMessage(
        `Failed to add to cart: ${err.response?.data?.error || err.message}`,
        "error"
      );
    }
  };

  const updateQuantity = async (variantId, change) => {
    const item = Array.isArray(cartItems)
      ? cartItems.find((item) => String(item.product_variant_id) === String(variantId))
      : undefined;
    if (!item) {
      showMessage("Item not found in cart", "error");
      return;
    }
    const newQuantity = Math.max(1, item.quantity + change);
    try {
      await axios.put(
        "https://suyambuoils.com/api/customer/cart",
        { customerId, variantId, quantity: newQuantity }
      );
      const fetchCartFunction = typeof fetchCart === "function" ? fetchCart : localFetchCart;
      const updatedCart = await fetchCartFunction();
      setCartItems(updatedCart || []);
      showMessage("Cart updated successfully");
    } catch (err) {
      showMessage(
        `Failed to update quantity: ${err.response?.data?.error || err.message}`,
        "error"
      );
    }
  };

  const handleUomChange = (productId, composite, variants) => {
    const [uomId, qty, price] = String(composite).split("::");
    const variant = variants.find(
      (v) =>
        String(v.uom_id) === String(uomId) &&
        String(v.variant_quantity ?? v.quantity ?? "") === String(qty) &&
        String(v.price ?? "") === String(price)
    );
    setSelectedUoms((prev) => ({ ...prev, [String(productId)]: String(uomId) }));
    setSelectedVariants((prev) => ({ ...prev, [String(productId)]: variant || null }));
  };

  const handleWishlistToggle = async (productId) => {
    const currentLiked = wishlistIds.includes(productId);
    // Optimistic update
    setWishlistIds((prev) =>
      currentLiked ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
    try {
      await handleToggleWishlist(productId);
      await fetchWishlist();
    } catch (err) {
      // Revert on error
      setWishlistIds((prev) =>
        currentLiked ? [...prev, productId] : prev.filter((id) => id !== productId)
      );
      showMessage("Failed to update wishlist", "error");
    }
  };

  // ────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-gray-600">Loading products...</div>
      </div>
    );
  }

  return (
    <div
      className="container mx-auto px-4 md:px-6 lg:px-10"
      style={{
        fontFamily: "Inter, system-ui, sans-serif",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .variant-select option:hover { background-color: #22c55e33; color: #14532d; }
      `}</style>

      {/* ─── SHOP BY CATEGORY ─── */}
      <section id="shop-by-category" className="pt-8 pb-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-[#3D2F23] mb-8 md:mb-10">
            Shop by Category
          </h2>

          <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 hide-scrollbar snap-x snap-mandatory">
            {categories.map((cat) => {
              const isActive = cat.value === category;
              const count =
                cat.value === "all"
                  ? categoryCounts.all || 0
                  : cat.value === "wishlist"
                  ? wishlistIds.length
                  : categoryCounts[cat.value] || 0;

              return (
                <button
                  key={cat.key}
                  onClick={() => handleCategoryClick(cat.value)}
                  className={`
                    flex items-center gap-3 px-6 md:px-8 py-4 md:py-5 
                    rounded-2xl font-semibold whitespace-nowrap shadow-sm transition-all duration-300 snap-center
                    border border-transparent
                    ${
                      isActive
                        ? "bg-[#B6895B] text-white shadow-lg scale-105 border-[#B6895B]"
                        : "bg-white text-[#3D2F23] hover:bg-[#B6895B]/10 hover:shadow-md hover:border-[#B6895B]/30"
                    }
                  `}
                >
                  <cat.Icon 
                    size={22} 
                    className={`md:size-6 ${isActive ? "text-white" : "text-[#B6895B]"}`}
                  />
                  <span className="flex items-center gap-2">
                    {cat.label}
                    <span className={`font-bold text-base md:text-lg ${isActive ? "opacity-100" : "opacity-80"}`}>
                      ({count})
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="pb-12">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5 xl:gap-8">
          {visibleProducts.length > 0 ? (
            visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isLoggedIn={isLoggedIn}
                customerId={customerId}
                cartItems={cartItems}
                updateQuantity={updateQuantity}
                handleToggleWishlist={handleWishlistToggle}
                wishlist={wishlistIds}
                selectedUom={selectedUoms[String(product.id)]}
                selectedVariant={selectedVariants[String(product.id)]}
                handleUomChange={(id, value) =>
                  handleUomChange(id, value, product.variants)
                }
                handleAddToCart={handleAddToCart}
                navigate={navigate}
                showMessage={showMessage}
                uoms={uoms}
              />
            ))
          ) : (
            <div className="text-center py-12 text-gray-600 col-span-full">
              {category === "wishlist"
                ? "No products in your wishlist."
                : searchTerm.trim()
                ? "No products match your search."
                : "No products available in this category."}
            </div>
          )}
        </div>

        {visibleCount < filteredProducts.length && filteredProducts.length > 0 && (
          <div className="text-center py-10">
            <button
              onClick={() => setVisibleCount((prev) => prev + 20)}
              className="bg-[#B6895B] hover:bg-[#a0784a] text-white font-medium px-10 py-3.5 rounded-full transition-all shadow-md hover:shadow-lg"
            >
              View More
            </button>
          </div>
        )}
      </section>

      {err && <p className="text-red-500 text-center mt-8 mb-4">{err}</p>}
    </div>
  );
}

// ────────────────────────────────────────────────
// ProductCard Component (unchanged)
// ────────────────────────────────────────────────
function ProductCard({
  product,
  isLoggedIn,
  customerId,
  cartItems,
  updateQuantity,
  handleToggleWishlist,
  wishlist,
  selectedUom,
  selectedVariant,
  handleUomChange,
  handleAddToCart,
  navigate,
  showMessage,
  uoms,
}) {
  const cartItem = Array.isArray(cartItems)
    ? cartItems.find(
        (item) => String(item.product_variant_id) === String(selectedVariant?.id)
      )
    : undefined;

  const quantity = cartItem ? cartItem.quantity : 0;
  const isLiked = Array.isArray(wishlist) && wishlist.includes(product.id);
  const isOutOfStock = product.stock_status_id === 2;

  const displayVariants = Array.isArray(product.variants) ? product.variants : [];

  const effectiveVariant =
    selectedVariant ||
    displayVariants.find((v) => String(v.uom_id) === String(selectedUom)) ||
    displayVariants[0] ||
    null;

  const variantKey = (v) =>
    `${v.uom_id}::${v.variant_quantity ?? v.quantity ?? ""}::${v.price ?? ""}`;

  const currentValue = effectiveVariant
    ? variantKey(effectiveVariant)
    : displayVariants[0]
    ? variantKey(displayVariants[0])
    : "";

  const getDisplayQuantity = (variant) => {
    const qty = variant.variant_quantity || variant.quantity || "";
    let uomName = variant.uom_name || "";
    if (uoms && variant.uom_id) {
      const uomObj = uoms.find((u) => String(u.id) === String(variant.uom_id));
      if (uomObj && uomObj.name) uomName = uomObj.name;
    }
    return `${qty} ${uomName}`;
  };

  const handlePlusClick = () => {
    if (!isLoggedIn) {
      if (typeof window.openLoginPanel === "function") {
        window.openLoginPanel();
      }
      return;
    }
    if (isOutOfStock || !effectiveVariant) return;
    if (quantity > 0) {
      updateQuantity(effectiveVariant.id, 1);
    } else {
      handleAddToCart(product.id);
    }
  };

  return (
    <div
      className="
        group bg-white rounded-[20px] border border-gray-200/50
        shadow-[0_4px_12px_rgba(0,0,0,0.08)]
        transition-all duration-300 ease-out
        hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)]
        hover:-translate-y-1 hover:border-[#B6895B]/20
        overflow-hidden flex flex-col h-full w-full
      "
    >
      <div className="relative w-full h-[200px] overflow-hidden bg-gray-50">
        <img
          src={product.thumbnail_url}
          alt={product.name}
          className="
            w-full h-full object-cover cursor-pointer
            transition-transform duration-500 ease-out
            group-hover:scale-105
          "
          onClick={() => {
            const encodedCustomerId = btoa(customerId || "");
            const encodedProductId = btoa(product.id.toString());
            const selectedParams = effectiveVariant ? `&variantId=${effectiveVariant.id}` : "";
            navigate(
              `/customer?customerId=${encodedCustomerId}&productId=${encodedProductId}${selectedParams}`
            );
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/600x400";
          }}
        />

        <button
          onClick={() => handleToggleWishlist(product.id)}
          className="
            absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg
            hover:bg-white transition-all duration-300
            opacity-0 group-hover:opacity-100
            transform scale-0 group-hover:scale-100
          "
          title="Toggle wishlist"
        >
          <Heart
            size={16}
            className={isLiked ? "text-red-500 fill-red-500" : "text-gray-600"}
          />
        </button>

        <span
          className={`
            absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full shadow-lg backdrop-blur-sm z-10
            ${product.stock_status_id === 1 ? 'bg-green-100/90 text-green-700' : 'bg-red-100/90 text-red-700'}
          `}
        >
          {product.stock_status}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1 justify-between">
        <div>
          <h3
            className="text-base font-semibold text-gray-900 cursor-pointer leading-tight line-clamp-2 transition-colors duration-200 group-hover:text-[#B6895B]"
            onClick={() => {
              const encodedCustomerId = btoa(customerId || "");
              const encodedProductId = btoa(product.id.toString());
              const selectedParams = effectiveVariant ? `&variantId=${effectiveVariant.id}` : "";
              navigate(
                `/customer?customerId=${encodedCustomerId}&productId=${encodedProductId}${selectedParams}`
              );
            }}
          >
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1">{product.category_name}</p>

          {displayVariants.length > 1 && (
            <div className="relative w-full mt-2">
              <select
                value={currentValue}
                onChange={(e) => handleUomChange(product.id, e.target.value, displayVariants)}
                className="
                  variant-select w-full appearance-none rounded-lg px-3 py-1.5
                  bg-gray-50/50 text-xs text-gray-700
                  border border-gray-200/50 shadow-sm
                  focus:outline-none focus:ring-1 focus:ring-[#B6895B]/30 focus:border-[#B6895B]/40
                  transition-all duration-200
                  hover:border-[#B6895B]/30
                "
                style={{
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                }}
              >
                {displayVariants.map((variant) => (
                  <option key={variant.id} value={variantKey(variant)}>
                    {`${getDisplayQuantity(variant)} - ₹${Number(variant.price).toFixed(2)}`}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                <svg
                  className="h-3 w-3"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-start justify-between pt-1 flex-wrap gap-4">
          <div className="flex flex-col items-start flex-shrink-0">
            <div className="text-base sm:text-lg font-bold" style={{ color: BRAND }}>
              ₹
              {effectiveVariant?.price != null
                ? Number(effectiveVariant.price).toFixed(2)
                : "0.00"}
            </div>
            {quantity > 0 && (
              <div className="text-sm font-medium mt-1" style={{ color: BRAND }}>
                Total: ₹{(effectiveVariant?.price ? Number(effectiveVariant.price) * quantity : 0).toFixed(2)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 self-end">
            {quantity > 0 ? (
              <>
                <button
                  onClick={() => updateQuantity(effectiveVariant.id, -1)}
                  disabled={quantity <= 1}
                  className={`h-6 w-6 rounded-full border-2 grid place-items-center transition-all duration-200 text-xs flex-shrink-0 ${
                    quantity <= 1
                      ? "border-gray-200 text-gray-300 cursor-not-allowed"
                      : "border-[#B6895B] text-[#B6895B] hover:bg-[#B6895B]/10 cursor-pointer"
                  }`}
                  title="Decrease"
                >
                  <Minus size={10} />
                </button>
                <span className="w-6 text-center text-sm font-semibold text-gray-700 min-w-[1.5rem] flex-shrink-0">
                  {quantity}
                </span>
                <button
                  onClick={handlePlusClick}
                  className="h-6 w-6 rounded-full border-2 border-[#B6895B] text-[#B6895B] hover:bg-[#B6895B]/10 grid place-items-center transition-all duration-200 text-xs flex-shrink-0 cursor-pointer"
                  title="Increase"
                >
                  <Plus size={10} />
                </button>
              </>
            ) : (
              <button
                onClick={handlePlusClick}
                className="h-6 w-6 rounded-full border-2 border-[#B6895B] text-[#B6895B] hover:bg-[#B6895B]/10 grid place-items-center transition-all duration-200 flex-shrink-0 cursor-pointer"
                title="Add to cart"
              >
                <Plus size={10} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}