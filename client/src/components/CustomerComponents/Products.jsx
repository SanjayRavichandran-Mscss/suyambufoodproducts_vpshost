// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { Heart, Plus, Minus } from "lucide-react";

// const IMAGE_BASE = "http://localhost:5000";
// const BRAND = "#B6895B";

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

//   // Category from Banner chips
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

//   // Fallback cart fetch
//   const localFetchCart = async () => {
//     if (!customerId) return [];
//     try {
//       const response = await axios.get(
//         `http://localhost:5000/api/customer/cart?customerId=${customerId}`,
//         { headers: { Origin: "http://localhost:5173" } }
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

//   // Sync with header search
//   useEffect(() => {
//     if (headerSearchTerm !== undefined) {
//       setSearchTerm(headerSearchTerm || "");
//     }
//   }, [headerSearchTerm]);

//   const normalizeImage = (img) => {
//     if (!img) return "https://via.placeholder.com/600x400";
//     if (img.startsWith("http://") || img.startsWith("https://")) return img;
//     if (img.startsWith("/")) return `${IMAGE_BASE}${img}`;
//     return `${IMAGE_BASE}/${img}`;
//   };

//   // Fetch products + UOMs
//   useEffect(() => {
//     axios
//       .get("http://localhost:5000/api/admin/uoms", {
//         headers: { Origin: "http://localhost:5173" },
//       })
//       .then((res) => setUoms(res.data || []))
//       .catch(() => {});

//     axios
//       .get("http://localhost:5000/api/admin/products", {
//         headers: { Origin: "http://localhost:5173" },
//       })
//       .then((res) => {
//         const raw = res.data || [];
//         const productsWithImages = raw.map((p) => {
//           const seen = new Set();
//           const variants = Array.isArray(p.variants)
//             ? p.variants
//                 .map((v) => ({
//                   ...v,
//                   id: v.id,
//                   uom_id: v.uom_id != null ? String(v.uom_id) : undefined,
//                   price: v.price != null ? Number(v.price) : undefined,
//                   variant_quantity:
//                     v.quantity != null ? v.quantity : v.variant_quantity || "",
//                   uom_name: v.uom_name || "",
//                 }))
//                 .filter((v) => {
//                   const key = `${v.uom_id}::${v.variant_quantity}::${v.price}`;
//                   if (seen.has(key)) return false;
//                   seen.add(key);
//                   return true;
//                 })
//             : [];

//           const thumbnail_url = p.thumbnail_url
//             ? normalizeImage(p.thumbnail_url)
//             : "https://via.placeholder.com/600x400";

//           const additional_images = Array.isArray(p.additional_images)
//             ? p.additional_images.map((img) => normalizeImage(img))
//             : [];

//           return {
//             ...p,
//             thumbnail_url,
//             additional_images,
//             variants,
//           };
//         });

//         setProducts(productsWithImages);

//         // Default selections
//         setSelectedUoms((prev) => {
//           const next = { ...prev };
//           productsWithImages.forEach((p) => {
//             if (!next[String(p.id)] && p.variants?.length) {
//               next[String(p.id)] = String(p.variants[0].uom_id);
//             }
//           });
//           return next;
//         });

//         setSelectedVariants(() => {
//           const next = {};
//           productsWithImages.forEach((p) => {
//             if (p.variants?.length) next[String(p.id)] = p.variants[0];
//           });
//           return next;
//         });

//         const uniqueCategories = [
//           ...new Set(productsWithImages.map((product) => product.category_name)),
//         ];
//         setCategories([
//           { label: "All Products", value: "all" },
//           ...uniqueCategories.map((cat) => ({
//             label: cat,
//             value: cat ? cat.toLowerCase() : cat,
//           })),
//           { label: "My Wishlist", value: "wishlist" },
//         ]);
//         setLoading(false);
//       })
//       .catch(() => {
//         setErr("Failed to load products");
//         setLoading(false);
//       });
//   }, []);

//   // Keep selections aligned with cart
//   useEffect(() => {
//     if (!products.length) return;
//     setSelectedUoms((prevUoms) => {
//       const nextUoms = { ...prevUoms };
//       setSelectedVariants((prevVariants) => {
//         const nextVariants = { ...prevVariants };
//         products.forEach((p) => {
//           const cartEntry = Array.isArray(cartItems)
//             ? cartItems.find(
//                 (ci) =>
//                   String(ci.product_variant_id) ===
//                   String(nextVariants[String(p.id)]?.id)
//               )
//             : undefined;

//           if (cartEntry && cartEntry.uom_id != null) {
//             nextUoms[String(p.id)] = String(cartEntry.uom_id);
//             const matchingVariant = p.variants?.find(
//               (v) => String(v.uom_id) === String(cartEntry.uom_id)
//             );
//             if (matchingVariant) nextVariants[String(p.id)] = matchingVariant;
//           } else if (!nextUoms[String(p.id)] && p.variants?.length) {
//             nextUoms[String(p.id)] = String(p.variants[0].uom_id);
//             if (!nextVariants[String(p.id)]) nextVariants[String(p.id)] = p.variants[0];
//           }
//         });
//         return nextVariants;
//       });
//       return nextUoms;
//     });
//   }, [cartItems, products]);

//   // Actions
//   const handleAddToCart = async (productId, quantity = 1) => {
//     if (!isLoggedIn) {
//       showMessage("Please login to add items to your cart", "warning");
//       return;
//     }
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
//         "http://localhost:5000/api/customer/cart",
//         { customerId, variantId, quantity },
//         { headers: { Origin: "http://localhost:5173" } }
//       );
//       const fetchCartFunction =
//         typeof fetchCart === "function" ? fetchCart : localFetchCart;
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
//       ? cartItems.find(
//           (item) => String(item.product_variant_id) === String(variantId)
//         )
//       : undefined;
//     if (!item) {
//       showMessage("Item not found in cart", "error");
//       return;
//     }
//     const newQuantity = Math.max(1, item.quantity + change);
//     try {
//       await axios.put(
//         "http://localhost:5000/api/customer/cart",
//         { customerId, variantId, quantity: newQuantity },
//         { headers: { Origin: "http://localhost:5173" } }
//       );
//       const fetchCartFunction =
//         typeof fetchCart === "function" ? fetchCart : localFetchCart;
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

//   // ✅ Correct filter logic
//   const filteredProducts =
//     searchTerm && searchTerm.trim() !== ""
//       ? products.filter((product) =>
//           product.name.toLowerCase().includes(searchTerm.toLowerCase())
//         )
//       : products.filter(
//           (product) =>
//             category === "all" ||
//             (category === "wishlist"
//               ? wishlist.includes(product.id)
//               : product.category_name &&
//                 product.category_name.toLowerCase() === category)
//         );

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center py-8">
//         <div className="text-gray-600">Loading products...</div>
//       </div>
//     );
//   }

//   return (
//     <div
//       className="container mx-auto px-4 md:px-6 lg:px-10"
//       style={{
//         fontFamily:
//           "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
//         WebkitFontSmoothing: "antialiased",
//         MozOsxFontSmoothing: "grayscale",
//       }}
//     >
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
//         .variant-select option:hover { background-color: #22c55e33; color: #14532d; }
//         .variant-select option:checked { background-color: #22c55e !important; color: #ffffff !important; }
//       `}</style>

//       <section id="shop-by-category" className="pt-2 pb-4">
//         <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-5 gap-6 md:gap-8 xl:gap-10 mt-4">
//           {filteredProducts.length > 0 ? (
//             filteredProducts.map((product) => (
//               <ProductCard
//                 key={product.id}
//                 product={product}
//                 isLoggedIn={isLoggedIn}
//                 customerId={customerId}
//                 cartItems={cartItems}
//                 updateQuantity={updateQuantity}
//                 handleToggleWishlist={handleToggleWishlist}
//                 wishlist={wishlist}
//                 selectedUom={selectedUoms[String(product.id)]}
//                 selectedVariant={selectedVariants[String(product.id)]}
//                 handleUomChange={(id, value) =>
//                   handleUomChange(id, value, product.variants)
//                 }
//                 handleAddToCart={handleAddToCart}
//               />
//             ))
//           ) : (
//             <div className="text-center py-8 text-gray-600 col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-3 xl:col-span-5 2xl:col-span-5">
//               {category === "wishlist"
//                 ? "No products in your wishlist."
//                 : "No products available in this category or search."}
//             </div>
//           )}
//         </div>
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
// }) {
//   const navigate = useNavigate();

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

//   return (
//     <div
//       className="
//         group bg-white rounded-xl border border-gray-200
//         shadow-[0_4px_12px_rgba(0,0,0,0.1)]
//         transition-all duration-300 ease-out
//         hover:shadow-[0_12px_24px_rgba(0,0,0,0.18)]
//         hover:-translate-y-1 hover:border-[#B6895B]/30
//         transform-gpu overflow-hidden flex flex-col h-full w-full max-w-[220px]
//       "
//     >
//       <div className="relative w-full h-[220px] overflow-hidden bg-gray-100">
//         <img
//           src={product.thumbnail_url}
//           alt={product.name}
//           className="
//             absolute inset-0 w-full h-full object-cover cursor-pointer
//             transition-transform duration-500 ease-out
//             group-hover:scale-[1.05] will-change-transform
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
//             absolute top-2 right-2 p-1 bg-white rounded-full shadow-md
//             hover:bg-gray-100 transition-colors
//             duration-300 ease-out transform-gpu
//             group-hover:-translate-y-0.5 group-hover:scale-105
//           "
//           title="Toggle wishlist"
//         >
//           <Heart
//             size={18}
//             className={isLiked ? "text-red-500 fill-red-500" : "text-gray-600"}
//           />
//         </button>

//         {isOutOfStock && (
//           <span className="absolute top-2 left-2 bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full shadow z-10">
//             Out of Stock
//           </span>
//         )}
//       </div>

//       <div className="p-4 flex flex-col gap-2">
//         <span className="inline-flex w-fit items-center px-2 py-1 rounded-md bg-gray-100 text-gray-600 uppercase text-[10px] font-medium">
//           {product.category_name || "Category"}
//         </span>

//         <h3
//           className="text-[14px] font-medium text-gray-900 cursor-pointer leading-tight line-clamp-2 transition-colors duration-200 group-hover:text-gray-800"
//           onClick={() => {
//             const encodedCustomerId = btoa(customerId || "");
//             const encodedProductId = btoa(product.id.toString());
//             const selectedParams = effectiveVariant ? `&variantId=${effectiveVariant.id}` : "";
//             navigate(
//               `/customer?customerId=${encodedCustomerId}&productId=${encodedProductId}${selectedParams}`
//             );
//           }}
//         >
//           {product.name}
//         </h3>

//         <div className="relative w-full">
//           <select
//             value={currentValue}
//             onChange={(e) => handleUomChange(product.id, e.target.value)}
//             className="
//               w-full appearance-none rounded-md px-3 py-2
//               bg-gray-50 text-[12px] text-gray-700
//               border border-gray-200 shadow-inner
//               focus:outline-none focus:ring-2 focus:ring-[#B6895B]/40 focus:border-[#B6895B]/50
//               transition-colors duration-200
//               hover:border-[#B6895B]/30
//             "
//             style={{
//               WebkitAppearance: "none",
//               MozAppearance: "none",
//             }}
//           >
//             {Array.isArray(product.variants) &&
//               product.variants.map((variant) => (
//                 <option key={variant.id} value={variantKey(variant)}>
//                   {`${variant.variant_quantity || variant.quantity} ${variant.uom_name || ""} - ₹${Number(variant.price).toFixed(2)}`}
//                 </option>
//               ))}
//           </select>
//           <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
//             <svg
//               className="h-4 w-4 text-gray-400"
//               xmlns="http://www.w3.org/2000/svg"
//               viewBox="0 0 20 20"
//               fill="currentColor"
//               aria-hidden="true"
//             >
//               <path
//                 fillRule="evenodd"
//                 d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
//                 clipRule="evenodd"
//               />
//             </svg>
//           </div>
//         </div>

//         <div className="mt-2 flex items-center justify-between">
//           <div className="text-[16px] font-semibold" style={{ color: BRAND }}>
//             ₹
//             {effectiveVariant?.price != null
//               ? Number(effectiveVariant.price).toFixed(2)
//               : "0.00"}
//           </div>

//           {!isLoggedIn || isOutOfStock || !effectiveVariant ? (
//             <button
//               disabled
//               className="h-7 w-7 rounded-full border border-gray-300 text-gray-400 grid place-items-center cursor-not-allowed"
//               title={!isLoggedIn ? "Login to add" : "Out of stock"}
//             >
//               <Plus size={12} />
//             </button>
//           ) : quantity > 0 ? (
//             <div className="flex items-center gap-1">
//               <button
//                 onClick={() => updateQuantity(effectiveVariant.id, -1)}
//                 disabled={quantity <= 1}
//                 className={`h-7 w-7 rounded-full border grid place-items-center ${
//                   quantity <= 1
//                     ? "border-gray-200 text-gray-300 cursor-not-allowed"
//                     : "border-gray-300 text-gray-700 hover:bg-gray-100"
//                 } transition-transform duration-200 ease-out hover:-translate-y-0.5`}
//                 title="Decrease"
//               >
//                 <Minus size={12} />
//               </button>
//               <span className="w-5 text-center text-xs font-medium text-gray-700">
//                 {quantity}
//               </span>
//               <button
//                 onClick={() => updateQuantity(effectiveVariant.id, 1)}
//                 className="h-7 w-7 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 grid place-items-center transition-transform duration-200 ease-out hover:-translate-y-0.5"
//                 title="Increase"
//               >
//                 <Plus size={12} />
//               </button>
//             </div>
//           ) : (
//             <button
//               onClick={() => handleAddToCart(product.id)}
//               className="h-7 w-7 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 grid place-items-center transition-transform duration-200 ease-out hover:-translate-y-0.5"
//               title="Add to cart"
//             >
//               <Plus size={12} />
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }






import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Heart, Plus, Minus, Search } from "lucide-react";

const IMAGE_BASE = "http://localhost:5000";
const BRAND = "#B6895B";

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

  // Category from Banner chips
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

  // Fallback cart fetch
  const localFetchCart = async () => {
    if (!customerId) return [];
    try {
      const response = await axios.get(
        `http://localhost:5000/api/customer/cart?customerId=${customerId}`,
        { headers: { Origin: "http://localhost:5173" } }
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

  // Sync with header search
  useEffect(() => {
    if (headerSearchTerm !== undefined) {
      setSearchTerm(headerSearchTerm || "");
    }
  }, [headerSearchTerm]);

  const normalizeImage = (img) => {
    if (!img) return "https://via.placeholder.com/600x400";
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    if (img.startsWith("/")) return `${IMAGE_BASE}${img}`;
    return `${IMAGE_BASE}/${img}`;
  };

  // Fetch products + UOMs
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/admin/uoms", {
        headers: { Origin: "http://localhost:5173" },
      })
      .then((res) => setUoms(res.data || []))
      .catch(() => {});

    axios
      .get("http://localhost:5000/api/admin/products", {
        headers: { Origin: "http://localhost:5173" },
      })
      .then((res) => {
        const raw = res.data || [];
        const productsWithImages = raw.map((p) => {
          const seen = new Set();
          const variants = Array.isArray(p.variants)
            ? p.variants
                .map((v) => ({
                  ...v,
                  id: v.id,
                  uom_id: v.uom_id != null ? String(v.uom_id) : undefined,
                  price: v.price != null ? Number(v.price) : undefined,
                  variant_quantity:
                    v.quantity != null ? v.quantity : v.variant_quantity || "",
                  uom_name: v.uom_name || "",
                }))
                .filter((v) => {
                  const key = `${v.uom_id}::${v.variant_quantity}::${v.price}`;
                  if (seen.has(key)) return false;
                  seen.add(key);
                  return true;
                })
            : [];

          const thumbnail_url = p.thumbnail_url
            ? normalizeImage(p.thumbnail_url)
            : "https://via.placeholder.com/600x400";

          const additional_images = Array.isArray(p.additional_images)
            ? p.additional_images.map((img) => normalizeImage(img))
            : [];

          return {
            ...p,
            thumbnail_url,
            additional_images,
            variants,
          };
        });

        setProducts(productsWithImages);

        // Default selections
        setSelectedUoms((prev) => {
          const next = { ...prev };
          productsWithImages.forEach((p) => {
            if (!next[String(p.id)] && p.variants?.length) {
              next[String(p.id)] = String(p.variants[0].uom_id);
            }
          });
          return next;
        });

        setSelectedVariants(() => {
          const next = {};
          productsWithImages.forEach((p) => {
            if (p.variants?.length) next[String(p.id)] = p.variants[0];
          });
          return next;
        });

        const uniqueCategories = [
          ...new Set(productsWithImages.map((product) => product.category_name)),
        ];
        setCategories([
          { label: "All Products", value: "all" },
          ...uniqueCategories.map((cat) => ({
            label: cat,
            value: cat ? cat.toLowerCase() : cat,
          })),
          { label: "My Wishlist", value: "wishlist" },
        ]);
        setLoading(false);
      })
      .catch(() => {
        setErr("Failed to load products");
        setLoading(false);
      });
  }, []);

  // Keep selections aligned with cart
  useEffect(() => {
    if (!products.length) return;
    setSelectedUoms((prevUoms) => {
      const nextUoms = { ...prevUoms };
      setSelectedVariants((prevVariants) => {
        const nextVariants = { ...prevVariants };
        products.forEach((p) => {
          const cartEntry = Array.isArray(cartItems)
            ? cartItems.find(
                (ci) =>
                  String(ci.product_variant_id) ===
                  String(nextVariants[String(p.id)]?.id)
              )
            : undefined;

          if (cartEntry && cartEntry.uom_id != null) {
            nextUoms[String(p.id)] = String(cartEntry.uom_id);
            const matchingVariant = p.variants?.find(
              (v) => String(v.uom_id) === String(cartEntry.uom_id)
            );
            if (matchingVariant) nextVariants[String(p.id)] = matchingVariant;
          } else if (!nextUoms[String(p.id)] && p.variants?.length) {
            nextUoms[String(p.id)] = String(p.variants[0].uom_id);
            if (!nextVariants[String(p.id)]) nextVariants[String(p.id)] = p.variants[0];
          }
        });
        return nextVariants;
      });
      return nextUoms;
    });
  }, [cartItems, products]);

  // Actions
  const handleAddToCart = async (productId, quantity = 1) => {
    if (!isLoggedIn) {
      showMessage("Please login to add items to your cart", "warning");
      return;
    }
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
        "http://localhost:5000/api/customer/cart",
        { customerId, variantId, quantity },
        { headers: { Origin: "http://localhost:5173" } }
      );
      const fetchCartFunction =
        typeof fetchCart === "function" ? fetchCart : localFetchCart;
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
      ? cartItems.find(
          (item) => String(item.product_variant_id) === String(variantId)
        )
      : undefined;
    if (!item) {
      showMessage("Item not found in cart", "error");
      return;
    }
    const newQuantity = Math.max(1, item.quantity + change);
    try {
      await axios.put(
        "http://localhost:5000/api/customer/cart",
        { customerId, variantId, quantity: newQuantity },
        { headers: { Origin: "http://localhost:5173" } }
      );
      const fetchCartFunction =
        typeof fetchCart === "function" ? fetchCart : localFetchCart;
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

  // ✅ Correct filter logic
  const filteredProducts =
    searchTerm && searchTerm.trim() !== ""
      ? products.filter((product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : products.filter(
          (product) =>
            category === "all" ||
            (category === "wishlist"
              ? wishlist.includes(product.id)
              : product.category_name &&
                product.category_name.toLowerCase() === category)
        );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-600">Loading products...</div>
      </div>
    );
  }

  return (
    <div
      className="container mx-auto px-4 md:px-6 lg:px-10"
      style={{
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .variant-select option:hover { background-color: #22c55e33; color: #14532d; }
        .variant-select option:checked { background-color: #22c55e !important; color: #ffffff !important; }
      `}</style>

      {/* Mobile Search Bar */}
      <div className="md:hidden mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="
              w-full py-2 pl-10 pr-4 rounded-full
              bg-gray-100 text-sm text-gray-700
              border border-gray-200 focus:outline-none
              focus:ring-2 focus:ring-[#B6895B]/40 focus:border-[#B6895B]/50
              transition-colors duration-200
            "
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search size={18} className="text-gray-400" />
          </div>
        </div>
      </div>

      <section id="shop-by-category" className="pt-2 pb-4">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-5 gap-6 md:gap-8 xl:gap-10 mt-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isLoggedIn={isLoggedIn}
                customerId={customerId}
                cartItems={cartItems}
                updateQuantity={updateQuantity}
                handleToggleWishlist={handleToggleWishlist}
                wishlist={wishlist}
                selectedUom={selectedUoms[String(product.id)]}
                selectedVariant={selectedVariants[String(product.id)]}
                handleUomChange={(id, value) =>
                  handleUomChange(id, value, product.variants)
                }
                handleAddToCart={handleAddToCart}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-600 col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-3 xl:col-span-5 2xl:col-span-5">
              {category === "wishlist"
                ? "No products in your wishlist."
                : "No products available in this category or search."}
            </div>
          )}
        </div>
      </section>

      {err && <p className="text-red-500 text-center mt-8 mb-4">{err}</p>}
    </div>
  );
}

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
}) {
  const navigate = useNavigate();

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

  const handleProductClick = () => {
    const encodedProductId = btoa(product.id.toString());
    const selectedParams = effectiveVariant ? `&variantId=${effectiveVariant.id}` : "";
    
    // Construct URL based on login status
    const queryString = isLoggedIn && customerId
      ? `/customer?customerId=${btoa(customerId)}&productId=${encodedProductId}${selectedParams}`
      : `/customer?productId=${encodedProductId}${selectedParams}`;
    
    navigate(queryString);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className="
        group bg-white rounded-xl border border-gray-200
        shadow-[0_4px_12px_rgba(0,0,0,0.1)]
        transition-all duration-300 ease-out
        hover:shadow-[0_12px_24px_rgba(0,0,0,0.18)]
        hover:-translate-y-1 hover:border-[#B6895B]/30
        transform-gpu overflow-hidden flex flex-col h-full w-full max-w-[220px]
      "
    >
      <div className="relative w-full h-[220px] overflow-hidden bg-gray-100">
        <img
          src={product.thumbnail_url}
          alt={product.name}
          className="
            absolute inset-0 w-full h-full object-cover cursor-pointer
            transition-transform duration-500 ease-out
            group-hover:scale-[1.05] will-change-transform
          "
          onClick={handleProductClick}
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/600x400";
          }}
        />

        <button
          onClick={() => handleToggleWishlist(product.id)}
          className="
            absolute top-2 right-2 p-1 bg-white rounded-full shadow-md
            hover:bg-gray-100 transition-colors
            duration-300 ease-out transform-gpu
            group-hover:-translate-y-0.5 group-hover:scale-105
          "
          title="Toggle wishlist"
        >
          <Heart
            size={18}
            className={isLiked ? "text-red-500 fill-red-500" : "text-gray-600"}
          />
        </button>

        {isOutOfStock && (
          <span className="absolute top-2 left-2 bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full shadow z-10">
            Out of Stock
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2">
        <span className="inline-flex w-fit items-center px-2 py-1 rounded-md bg-gray-100 text-gray-600 uppercase text-[10px] font-medium">
          {product.category_name || "Category"}
        </span>

        <h3
          className="text-[14px] font-medium text-gray-900 cursor-pointer leading-tight line-clamp-2 transition-colors duration-200 group-hover:text-gray-800"
          onClick={handleProductClick}
        >
          {product.name}
        </h3>

        <div className="relative w-full">
          <select
            value={currentValue}
            onChange={(e) => handleUomChange(product.id, e.target.value)}
            className="
              w-full appearance-none rounded-md px-3 py-2
              bg-gray-50 text-[12px] text-gray-700
              border border-gray-200 shadow-inner
              focus:outline-none focus:ring-2 focus:ring-[#B6895B]/40 focus:border-[#B6895B]/50
              transition-colors duration-200
              hover:border-[#B6895B]/30
            "
            style={{
              WebkitAppearance: "none",
              MozAppearance: "none",
            }}
          >
            {Array.isArray(product.variants) &&
              product.variants.map((variant) => (
                <option key={variant.id} value={variantKey(variant)}>
                  {`${variant.variant_quantity || variant.quantity} ${variant.uom_name || ""} - ₹${Number(variant.price).toFixed(2)}`}
                </option>
              ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="h-4 w-4 text-gray-400"
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

        <div className="mt-2 flex items-center justify-between">
          <div className="text-[16px] font-semibold" style={{ color: BRAND }}>
            ₹
            {effectiveVariant?.price != null
              ? Number(effectiveVariant.price).toFixed(2)
              : "0.00"}
          </div>

          {!isLoggedIn || isOutOfStock || !effectiveVariant ? (
            <button
              disabled
              className="h-7 w-7 rounded-full border border-gray-300 text-gray-400 grid place-items-center cursor-not-allowed"
              title={!isLoggedIn ? "Login to add" : "Out of stock"}
            >
              <Plus size={12} />
            </button>
          ) : quantity > 0 ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => updateQuantity(effectiveVariant.id, -1)}
                disabled={quantity <= 1}
                className={`h-7 w-7 rounded-full border grid place-items-center ${
                  quantity <= 1
                    ? "border-gray-200 text-gray-300 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                } transition-transform duration-200 ease-out hover:-translate-y-0.5`}
                title="Decrease"
              >
                <Minus size={12} />
              </button>
              <span className="w-5 text-center text-xs font-medium text-gray-700">
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(effectiveVariant.id, 1)}
                className="h-7 w-7 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 grid place-items-center transition-transform duration-200 ease-out hover:-translate-y-0.5"
                title="Increase"
              >
                <Plus size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleAddToCart(product.id)}
              className="h-7 w-7 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 grid place-items-center transition-transform duration-200 ease-out hover:-translate-y-0.5"
              title="Add to cart"
            >
              <Plus size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}