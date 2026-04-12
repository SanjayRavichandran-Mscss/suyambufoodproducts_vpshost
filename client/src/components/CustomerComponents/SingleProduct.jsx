import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  ShoppingCart,
  Heart,
  Plus,
  Minus,
  Truck,
  Shield,
  RotateCcw,
  ChevronsLeft,
  ChevronsRight,
  X,
  ZoomIn,
} from "lucide-react";
import { useGesture } from "@use-gesture/react";
import { animated, useSpring } from "@react-spring/web";

import "react-quill-new/dist/quill.snow.css";

const IMAGE_BASE = "https://suyambuoils.com/api/";

const magnifierStyles = `
.single-product-magnifier-container {
  position: relative;
  overflow: hidden;
  border-radius: 1rem;
  background: #ffffff;
}
.single-product-magnifier-inner {
  width: 100%;
  height: 28rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.single-product-magnifier-main-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
  cursor: zoom-in;
  user-select: none;
}
@media (max-width: 768px) {
  .single-product-magnifier-inner {
    height: 20rem;
  }
}

/* Modal Styles */
.image-modal {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
}
.image-modal-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.zoom-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
  z-index: 60;
}
.zoom-btn {
  padding: 8px;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(8px);
  border-radius: 9999px;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}
.zoom-btn:hover {
  background: rgba(255,255,255,0.25);
}
`;

export default function SingleProduct({
  productId,
  isLoggedIn,
  customerId,
  cartItems,
  fetchCart,
  wishlist,
  handleToggleWishlist,
  showMessage,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [imageLoading, setImageLoading] = useState(true);

  // Zoom & Pan Animation
  const [{ scale, x, y }, api] = useSpring(() => ({
    scale: 1,
    x: 0,
    y: 0,
    config: { tension: 280, friction: 26 },
  }));

  const normalizeImage = (img) => {
    if (!img) return "https://via.placeholder.com/600";
    if (img.startsWith("http")) return img;
    if (img.startsWith("/")) return `${IMAGE_BASE}${img}`;
    return `${IMAGE_BASE}/${img}`;
  };

  // Reset zoom when image changes
  useEffect(() => {
    api.start({ scale: 1, x: 0, y: 0 });
  }, [selectedImage, api]);

  // Double Tap Handler - Only for Modal Zoom
  const [lastTap, setLastTap] = useState(0);
  const handleDoubleTap = (e) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 280;

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // Only zoom if we are inside modal
      if (isExpanded || isMobileModalOpen) {
        const currentScale = scale.get();
        api.start({ scale: currentScale > 1.5 ? 1 : 2.8 });
      }
    }
    setLastTap(now);
  };

  // Gesture Handler - Applied ONLY in Modal on Mobile
  const bind = useGesture(
    {
      onDrag: ({ offset: [dx, dy], pinching }) => {
        if (pinching || scale.get() <= 1.1) return;
        api.start({ x: dx, y: dy });
      },
      onPinch: ({ offset: [d] }) => {
        const newScale = Math.max(0.8, Math.min(5, 1 + d / 80));
        api.start({ scale: newScale });
      },
      onDoubleTap: handleDoubleTap,
    },
    {
      drag: { filterTaps: true },
      pinch: { scaleBounds: { min: 0.8, max: 5 } },
    }
  );

  // Resize Handler
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileModalOpen(false);
        setIsExpanded(false);
        api.start({ scale: 1, x: 0, y: 0 });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [api]);

  // Product Fetching Logic (unchanged)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const variantId = searchParams.get("variantId");
    setSelectedVariantId(variantId ? String(variantId) : null);
  }, [location.search]);

  useEffect(() => {
    if (!productId) {
      setError("Invalid product ID");
      setLoading(false);
      return;
    }

    const idNum = parseInt(productId, 10);
    if (isNaN(idNum)) {
      setError("Invalid product ID");
      setLoading(false);
      return;
    }

    axios
      .get(`https://suyambuoils.com/api/admin/products/${idNum}`)
      .then((res) => {
        const data = res.data || {};
        const variants = Array.isArray(data.variants)
          ? data.variants.map((v) => ({
              ...v,
              id: v.id,
              uom_id: v.uom_id != null ? String(v.uom_id) : undefined,
              price: v.price != null ? Number(v.price) : undefined,
              variant_quantity: v.quantity != null ? v.quantity : v.variant_quantity || "",
              uom_name: v.uom_name || v.uom_name,
            }))
          : [];

        let chosenVariant = null;
        if (variants.length > 0) {
          chosenVariant = selectedVariantId
            ? variants.find((v) => String(v.id) === String(selectedVariantId)) || variants[0]
            : variants[0];
        }

        const normalized = {
          ...data,
          price: data?.price != null ? Number(data.price) : chosenVariant?.price ?? 0,
          thumbnail_url: normalizeImage(data.thumbnail_url),
          additional_images: Array.isArray(data.additional_images)
            ? data.additional_images.map((img) => normalizeImage(img))
            : [],
          variants,
        };

        setProduct(normalized);
        setSelectedVariant(chosenVariant || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching product:", err);
        setError("Product not found");
        setLoading(false);
      });
  }, [productId, selectedVariantId]);

  useEffect(() => {
    if (!product) return;
    const ci = cartItems.find((item) => String(item.variant_id) === String(selectedVariant?.id));
    setQuantity(ci ? ci.quantity : 1);
  }, [cartItems, product, selectedVariant]);

  const handleUpdateQuantity = (change) => {
    if (!isLoggedIn) {
      if (typeof window.openLoginPanel === "function") window.openLoginPanel();
      return;
    }
    if (!selectedVariant?.id) {
      showMessage("Please select a variant");
      return;
    }

    const isFromAddToCart = change === 0;
    const newQuantity = isFromAddToCart ? 1 : Math.max(1, quantity + change);

    if (product.stock_quantity != null && newQuantity > product.stock_quantity) {
      showMessage(`Only ${product.stock_quantity} items available in stock`);
      return;
    }

    setQuantity(newQuantity);

    const body = { customerId, variantId: selectedVariant.id, quantity: newQuantity };
    const item = cartItems.find((it) => String(it.variant_id) === String(selectedVariant.id));

    if (item) {
      axios.put("https://suyambuoils.com/api/customer/cart", body)
        .then(() => { fetchCart(); showMessage("Cart updated successfully"); })
        .catch(() => showMessage("Failed to update cart", "error"));
    } else {
      axios.post("https://suyambuoils.com/api/customer/cart", body)
        .then(() => { fetchCart(); showMessage("Product added to cart"); })
        .catch(() => showMessage("Failed to add to cart", "error"));
    }
  };

  const handleAddToCart = () => {
    if (inCart) {
      showMessage("Item already in cart");
      return;
    }
    handleUpdateQuantity(0);
  };

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      if (typeof window.openLoginPanel === "function") window.openLoginPanel();
      return;
    }
    if (!selectedVariant?.id) {
      showMessage("Please select a variant");
      return;
    }

    const encodedCustomerId = btoa(customerId);
    const body = { customerId, variantId: selectedVariant.id, quantity };

    const item = cartItems.find((it) => String(it.variant_id) === String(selectedVariant.id));

    if (!item) {
      axios.post("https://suyambuoils.com/api/customer/cart", body)
        .then(() => {
          fetchCart();
          navigate(`/checkout?customerId=${encodedCustomerId}&identifier=buy_now`, {
            state: { product: { ...product, quantity, variant_id: selectedVariant.id }, orderMethod: "buy_now" },
          });
        })
        .catch(() => showMessage("Failed to proceed with purchase", "error"));
    } else {
      navigate(`/checkout?customerId=${encodedCustomerId}&identifier=buy_now`, {
        state: { product: { ...product, quantity, variant_id: selectedVariant.id }, orderMethod: "buy_now" },
      });
    }
  };

  const handleUomChange = (composite, variants) => {
    const [uomId, qty, price] = String(composite).split("::");
    const variant = variants.find(
      (v) =>
        String(v.uom_id) === String(uomId) &&
        String(v.variant_quantity ?? v.quantity ?? "") === String(qty) &&
        String(v.price ?? "") === String(price)
    );
    setSelectedVariant(variant || null);
    setQuantity(1);
  };

  const handleImageLoad = () => setImageLoading(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg max-w-md mx-auto">
          {error || "Product not found"}
        </div>
        <button onClick={() => navigate(-1)} className="mt-4 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700">
          Back to Products
        </button>
      </div>
    );
  }

  const allImages = [product.thumbnail_url, ...(product.additional_images || [])];
  const imgSrc = allImages[selectedImage] || "https://via.placeholder.com/600";
  const isLiked = wishlist.some((item) => item.product_id === product.id);
  const isOutOfStock = product.stock_status_id === 2;
  const displayPrice = selectedVariant?.price != null ? Number(selectedVariant.price) : Number(product.price) || 0;

  const cartItem = cartItems.find((item) => String(item.variant_id) === String(selectedVariant?.id));
  const inCart = Boolean(cartItem);

  const variantKey = (v) => `${v.uom_id}::${v.variant_quantity ?? v.quantity ?? ""}::${v.price ?? ""}`;
  const currentValue = selectedVariant ? variantKey(selectedVariant) : product.variants?.[0] ? variantKey(product.variants[0]) : "";

  return (
    <>
      <style>{magnifierStyles}</style>

      <div className="container mx-auto px-4 py-2 max-w-6xl">
        <div className="mt-5 mb-4">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1">
            ← Back to Products
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 bg-white rounded-xl shadow-sm p-4 md:p-6">
          {/* Image Section */}
          <div className="flex flex-col gap-4">
            <div className="single-product-magnifier-container group relative rounded-xl overflow-hidden">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
                </div>
              )}

              <div className="single-product-magnifier-inner">
                <img
                  src={imgSrc}
                  alt={product.name}
                  className="single-product-magnifier-main-img transition-all duration-300"
                  onLoad={handleImageLoad}
                  onClick={() => isMobile && setIsMobileModalOpen(true)}   // Single tap opens modal on mobile
                  onDoubleClick={() => !isMobile && setIsExpanded(true)}   // Double tap opens modal on desktop
                  draggable={false}
                />
              </div>

           {/* Zoom Icon - Top Right (Desktop only) */}
{!isMobile && (
  <button
    onClick={(e) => {
      e.stopPropagation();
      setIsExpanded(true);
    }}
    className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white shadow rounded-full text-gray-700 hover:text-gray-900 transition-all z-20 cursor-pointer"
    title="Zoom Image"
  >
    <ZoomIn size={18} />
  </button>
)}

           {/* Desktop Navigation Arrows */}
{!isMobile && allImages.length > 1 && (
  <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
    <button
      onClick={() => setSelectedImage((i) => (i - 1 + allImages.length) % allImages.length)}
      className="p-2.5 bg-white/80 backdrop-blur-sm rounded-full shadow hover:bg-white pointer-events-auto cursor-pointer"
    >
      <ChevronsLeft size={20} />
    </button>
    <button
      onClick={() => setSelectedImage((i) => (i + 1) % allImages.length)}
      className="p-2.5 bg-white/80 backdrop-blur-sm rounded-full shadow hover:bg-white pointer-events-auto cursor-pointer"
    >
      <ChevronsRight size={20} />
    </button>
  </div>
)}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 md:gap-3 overflow-x-auto pb-1">
              {allImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedImage(index);
                    api.start({ scale: 1, x: 0, y: 0 });
                  }}
                  className={`h-14 w-14 md:h-16 md:w-16 rounded-md overflow-hidden border-2 flex-shrink-0 transition ${
                    selectedImage === index ? "border-[#B6895B] shadow-sm" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img src={img} alt={`Thumb ${index + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details Section - Unchanged */}
          <div className="flex flex-col mt-4 md:mt-0">
            <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">{product.category_name}</span>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 mt-2 leading-tight">{product.name}</h1>

            <div className="mt-4 prose prose-sm max-w-none text-gray-700 leading-relaxed">
              <div className="ql-editor p-0" dangerouslySetInnerHTML={{ __html: product.description || product.short_description || "No description available." }} />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <span className={`text-sm md:text-base font-medium ${isOutOfStock ? "text-red-700" : "text-green-700"}`}>
                {isOutOfStock ? "Out of Stock" : "In Stock"}
              </span>
            </div>

            {/* Price, Variant, Quantity, Buttons, Trust Badges - Same as your code */}
            <div className="mt-5">
              <div className="flex items-baseline gap-3">
                <div className="text-3xl md:text-4xl font-extrabold text-[#B6895B]">
                  ₹{Number(displayPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                {selectedVariant?.actual_price && Number(selectedVariant.actual_price) > Number(displayPrice) && (
                  <div className="flex flex-col">
                    <span className="text-lg md:text-xl text-gray-400 line-through">
                      ₹{Number(selectedVariant.actual_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    {selectedVariant.discount_percentage > 0 && (
                      <span className="text-sm font-semibold text-green-600">
                        {Number(selectedVariant.discount_percentage).toFixed(0)}% OFF
                      </span>
                    )}
                  </div>
                )}
              </div>
              {selectedVariant?.actual_price && Number(selectedVariant.actual_price) > Number(displayPrice) && (
                <p className="text-sm text-green-600 mt-1">
                  You save ₹{(Number(selectedVariant.actual_price) - Number(displayPrice)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              )}
            </div>

            {product.variants?.length > 0 && (
              <div className="mt-6">
                <label className="text-sm font-semibold text-gray-700 block mb-2">Select Variant</label>
                <select
                  value={currentValue}
                  onChange={(e) => handleUomChange(e.target.value, product.variants)}
                  className="w-full rounded-lg border border-gray-200 bg-[#F3F5F7] text-gray-800 px-4 py-3 pr-10 shadow-inner text-sm focus:outline-none focus:ring-2 focus:ring-[#B6895B]/40"
                >
                  {product.variants.map((v) => (
                    <option key={v.id} value={variantKey(v)}>
                      {v.variant_quantity || v.quantity} {v.uom_name || ""} - ₹{Number(v.price).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">Quantity</h3>
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex items-center rounded-md border border-gray-300 bg-white">
                  <button onClick={() => handleUpdateQuantity(-1)} disabled={quantity <= 1 || isOutOfStock} className="px-3 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50">
                    <Minus size={16} />
                  </button>
                  <span className="w-10 md:w-12 text-center py-2 text-base md:text-lg font-semibold">{quantity}</span>
                  <button onClick={() => handleUpdateQuantity(1)} disabled={isOutOfStock || (product.stock_quantity != null && quantity >= product.stock_quantity)} className="px-3 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50">
                    <Plus size={16} />
                  </button>
                </div>
                {product.stock_quantity != null && <span className="text-xs md:text-sm text-gray-500">{product.stock_quantity} available</span>}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 md:gap-4">
              <button onClick={handleBuyNow} disabled={isOutOfStock} className={`w-full py-3 px-6 rounded-md font-semibold text-sm md:text-base transition-colors ${isOutOfStock ? "bg-gray-400 text-gray-200 cursor-not-allowed" : "bg-[#B6895B] text-white hover:bg-[#A7784D]"}`}>
                Buy Now
              </button>
              <button onClick={handleAddToCart} disabled={inCart || isOutOfStock} className={`w-full py-3 px-6 rounded-md font-semibold flex items-center justify-center gap-2 border text-sm md:text-base transition-colors ${inCart ? "bg-green-50 text-green-700 border-green-600" : isOutOfStock ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed" : "bg-white text-green-700 border-green-600 hover:bg-green-50"}`}>
                <ShoppingCart size={18} />
                {inCart ? "Added to Cart" : "Add to Cart"}
              </button>
              <button onClick={() => handleToggleWishlist(product.id)} disabled={isOutOfStock} className={`w-full py-3 px-6 rounded-md font-semibold flex items-center justify-center gap-2 border text-sm md:text-base transition-colors ${isLiked ? "bg-red-50 text-red-700 border-red-600" : isOutOfStock ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}>
                <Heart size={18} className={isLiked ? "fill-current text-red-500" : "text-gray-500"} />
                {isLiked ? "Added to wishlist" : "Add to wishlist"}
              </button>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 md:gap-6 text-center">
              <div><Truck className="mx-auto text-green-700 mb-2" size={20} /><p className="text-xs text-gray-600">Free Shipping</p></div>
              <div><Shield className="mx-auto text-green-700 mb-2" size={20} /><p className="text-xs text-gray-600">Secure Payment</p></div>
              <div><RotateCcw className="mx-auto text-green-700 mb-2" size={20} /><p className="text-xs text-gray-600">Easy Returns</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== MOBILE FULL-SCREEN MODAL ==================== */}
      {isMobile && isMobileModalOpen && (
        <div className="image-modal" onClick={() => { setIsMobileModalOpen(false); api.start({ scale: 1, x: 0, y: 0 }); }}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <animated.img
              {...bind()}
              src={allImages[selectedImage]}
              alt={product.name}
              className="max-w-[95%] max-h-[92%] object-contain"
              style={{ scale, x, y }}
              onDoubleClick={handleDoubleTap}
            />

            <div className="zoom-controls">
              <button onClick={() => { setIsMobileModalOpen(false); api.start({ scale: 1, x: 0, y: 0 }); }} className="zoom-btn">
                <X size={20} />
              </button>
            </div>

            {allImages.length > 1 && (
              <>
                <button onClick={() => setSelectedImage((i) => (i - 1 + allImages.length) % allImages.length)} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30">
                  <ChevronsLeft size={26} />
                </button>
                <button onClick={() => setSelectedImage((i) => (i + 1) % allImages.length)} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30">
                  <ChevronsRight size={26} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ==================== DESKTOP FULL-SCREEN MODAL ==================== */}
      {!isMobile && isExpanded && (
        <div className="image-modal" onClick={() => setIsExpanded(false)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <animated.img
              src={allImages[selectedImage]}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
              style={{ scale, x, y }}
              onDoubleClick={handleDoubleTap}
            />

            <div className="zoom-controls">
              <button onClick={() => setIsExpanded(false)} className="zoom-btn">
                <X size={20} />
              </button>
            </div>

            {allImages.length > 1 && (
              <>
                <button onClick={() => setSelectedImage((i) => (i - 1 + allImages.length) % allImages.length)} className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30">
                  <ChevronsLeft size={28} />
                </button>
                <button onClick={() => setSelectedImage((i) => (i + 1) % allImages.length)} className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30">
                  <ChevronsRight size={28} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}