import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  Plus,
  Minus,
  Star,
  Truck,
  Shield,
  RotateCcw,
  ChevronsLeft,
  ChevronsRight,
  Maximize2,
  Minimize2,
} from "lucide-react";

const IMAGE_BASE = "https://suyambufoods.com/api";

const magnifierStyles = `
.single-product-magnifier-container { position: relative; overflow: hidden; border-radius: 1rem; background: #ffffff; }
.single-product-magnifier-main-img { width: 100%; height: 28rem; object-fit: contain; display: block; }
@media (max-width: 768px) {
  .single-product-magnifier-main-img { height: 18rem; }
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
  const [touchStartX, setTouchStartX] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const normalizeImage = (img) => {
    if (!img) return "https://via.placeholder.com/600";
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    if (img.startsWith("/")) return `${IMAGE_BASE}${img}`;
    return `${IMAGE_BASE}/${img}`;
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!product || allImages.length <= 1) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    const threshold = 50;
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        setSelectedImage((i) => (i + 1) % allImages.length);
      } else if (diff < 0) {
        setSelectedImage((i) => (i - 1 + allImages.length) % allImages.length);
      }
    }
  };

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
      .get(`https://suyambufoods.com/api/admin/products/${idNum}`, {
        headers: { Origin: "http://localhost:5173" },
      })
      .then((res) => {
        const data = res.data || {};
        const variants = Array.isArray(data.variants)
          ? data.variants.map((v) => ({
              ...v,
              id: v.id,
              uom_id: v.uom_id != null ? String(v.uom_id) : undefined,
              price: v.price != null ? Number(v.price) : undefined,
              variant_quantity:
                v.quantity != null ? v.quantity : v.variant_quantity || "",
              uom_name: v.uom_name || v.uom_name,
            }))
          : [];

        let chosenVariant = null;
        if (variants.length > 0) {
          if (selectedVariantId) {
            chosenVariant =
              variants.find((v) => String(v.id) === String(selectedVariantId)) ||
              variants[0];
          } else {
            chosenVariant = variants[0];
          }
        }

        const normalized = {
          ...data,
          price:
            data?.price != null ? Number(data.price) : chosenVariant?.price ?? 0,
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
    const ci = cartItems.find(
      (item) => String(item.variant_id) === String(selectedVariant?.id)
    );
    setQuantity(ci ? ci.quantity : 1);
  }, [cartItems, product, selectedVariant]);

  const handleUpdateQuantity = (change) => {
    if (!isLoggedIn) {
      if (typeof window.openLoginPanel === "function") {
        window.openLoginPanel();
      }
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

    const body = {
      customerId,
      variantId: selectedVariant.id,
      quantity: newQuantity,
    };

    const item = cartItems.find(
      (it) => String(it.variant_id) === String(selectedVariant.id)
    );

    if (item) {
      axios
        .put("https://suyambufoods.com/api/customer/cart", body, {
          headers: { Origin: "http://localhost:5173" },
        })
        .then(() => {
          fetchCart();
          showMessage("Cart updated successfully");
        })
        .catch((err) => {
          console.error("Error updating cart:", err);
          showMessage("Failed to update cart", "error");
        });
    } else {
      axios
        .post("https://suyambufoods.com/api/customer/cart", body, {
          headers: { Origin: "http://localhost:5173" },
        })
        .then(() => {
          fetchCart();
          showMessage("Product added to cart");
        })
        .catch((err) => {
          console.error("Error adding to cart:", err);
          showMessage("Failed to add to cart", "error");
        });
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
      if (typeof window.openLoginPanel === "function") {
        window.openLoginPanel();
      }
      return;
    }

    if (!selectedVariant?.id) {
      showMessage("Please select a variant");
      return;
    }

    const encodedCustomerId = btoa(customerId);
    const body = {
      customerId,
      variantId: selectedVariant.id,
      quantity,
    };

    const item = cartItems.find(
      (it) => String(it.variant_id) === String(selectedVariant.id)
    );

    if (!item) {
      axios
        .post("https://suyambufoods.com/api/customer/cart", body, {
          headers: { Origin: "http://localhost:5173" },
        })
        .then(() => {
          fetchCart();
          navigate(
            `/checkout?customerId=${encodedCustomerId}&identifier=buy_now`,
            {
              state: {
                product: { ...product, quantity, variant_id: selectedVariant.id },
                orderMethod: "buy_now",
              },
            }
          );
        })
        .catch((err) => {
          console.error("Error proceeding with purchase:", err);
          showMessage("Failed to proceed with purchase", "error");
        });
    } else {
      navigate(`/checkout?customerId=${encodedCustomerId}&identifier=buy_now`, {
        state: {
          product: { ...product, quantity, variant_id: selectedVariant.id },
          orderMethod: "buy_now",
        },
      });
    }
  };

  const handleBack = () => {
    const encodedCustomerId = btoa(customerId || "");
    navigate(`/customer?customerId=${encodedCustomerId}`);
  };

  const handleUomChange = (productId, composite, variants) => {
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

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

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
        <button
          onClick={handleBack}
          className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Back to Products
        </button>
      </div>
    );
  }

  const allImages = [product.thumbnail_url, ...(product.additional_images || [])];
  const imgSrc = allImages[selectedImage] || "https://via.placeholder.com/600";
  const isLiked = wishlist.some(item => item.product_id === product.id);
  const isOutOfStock = product.stock_status_id === 2;
  const displayPrice =
    selectedVariant?.price != null
      ? Number(selectedVariant.price)
      : typeof product.price === "number"
      ? product.price
      : 0;

  const cartItem = cartItems.find(
    (item) => String(item.variant_id) === String(selectedVariant?.id)
  );
  const inCart = Boolean(cartItem);

  const variantKey = (v) =>
    `${v.uom_id}::${v.variant_quantity ?? v.quantity ?? ""}::${v.price ?? ""}`;

  const currentValue = selectedVariant
    ? variantKey(selectedVariant)
    : product.variants[0]
    ? variantKey(product.variants[0])
    : "";

  return (
    <>
      <div className="container mx-auto px-4 py-2 max-w-6xl">
        <style>{magnifierStyles}</style>
        
        <div className="mt-8 mb-10">
          <button
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1 transition-colors"
            aria-label="Back to products"
          >
            <span
              className="text-2xl font-extrabold text-black mr-1"
              style={{ lineHeight: "1" }}
            >
              ←
            </span>
            Back to Products
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 bg-white rounded-xl shadow-sm p-4 md:p-6">
          {/* Product Images Section */}
          <div className="flex flex-col gap-4">
            <div
              className="single-product-magnifier-container group relative touch-pan-y"
              onTouchStart={allImages.length > 1 ? handleTouchStart : undefined}
              onTouchEnd={allImages.length > 1 ? handleTouchEnd : undefined}
            >
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
                </div>
              )}
              <img
                src={imgSrc}
                alt={product.name}
                className={`single-product-magnifier-main-img ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              
              {allImages.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-2 md:px-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <button
                    onClick={() =>
                      setSelectedImage((i) => (i - 1 + allImages.length) % allImages.length)
                    }
                    className="p-2 md:p-3 bg-white/80 md:bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors pointer-events-auto"
                  >
                    <ChevronsLeft size={20} className="md:size-6 text-gray-700" />
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={() =>
                      setSelectedImage((i) => (i + 1) % allImages.length)
                    }
                    className="p-2 md:p-3 bg-white/80 md:bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors pointer-events-auto"
                  >
                    <ChevronsRight size={20} className="md:size-6 text-gray-700" />
                  </button>
                </div>
              )}

              <button
                onClick={() => setIsExpanded(true)}
                className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:transform md:scale-0 md:group-hover:scale-100 z-10"
                aria-label="View full-screen"
              >
                <Maximize2 size={18} className="text-gray-700" />
              </button>
            </div>

            {/* Thumbnail Images */}
            <div className="flex gap-2 md:gap-3 overflow-x-auto pb-1 px-2 md:px-0">
              {allImages.map((img, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  aria-label={`View image ${index + 1}`}
                  className={`h-14 w-14 md:h-16 md:w-16 rounded-md overflow-hidden border-2 transition flex-shrink-0 ${
                    selectedImage === index
                      ? "border-[#B6895B]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={img || "https://via.placeholder.com/150"}
                    alt={`${product.name} view ${index + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) =>
                      (e.currentTarget.src = "https://via.placeholder.com/150")
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details Section */}
          <div className="flex flex-col mt-4 md:mt-0">
            <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              {product.category_name}
            </span>
            
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 mt-2 leading-tight">
              {product.name}
            </h1>
            
            <p className="text-sm md:text-base text-gray-600 mt-2 leading-relaxed">
              {product.short_description || product.description || ""}
            </p>

            <div className="mt-4 flex items-center gap-3">
              <span className={`text-sm md:text-base ml-4 font-medium ${
                isOutOfStock ? "text-red-700" : "text-green-700"
              }`}>
                {isOutOfStock ? "Out of Stock" : "In Stock"}
              </span>
            </div>

            <div className="mt-5 text-3xl md:text-4xl font-extrabold text-[#B6895B]">
              ₹
              {Number(displayPrice).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>

            {/* Variant Selection */}
            {product.variants && product.variants.length > 0 && (
              <div className="mt-6">
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Select Variant
                </label>
                <select
                  value={currentValue}
                  onChange={(e) =>
                    handleUomChange(product.id, e.target.value, product.variants)
                  }
                  className="
                    w-full appearance-none rounded-lg border border-gray-200
                    bg-[#F3F5F7] text-gray-800 px-4 py-3 pr-10 shadow-inner text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#B6895B]/40 focus:border-[#B6895B]/50
                  "
                  style={{
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    backgroundImage:
                      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none'><path d='M6 9l6 6 6-6' stroke='%23667788' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>\")",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 12px center",
                    backgroundSize: "18px",
                  }}
                >
                  {product.variants.map((variant) => (
                    <option key={variant.id} value={variantKey(variant)}>
                      {variant.variant_quantity || variant.quantity}{" "}
                      {variant.uom_name || ""}
                      {variant.price != null
                        ? ` - ₹${Number(variant.price).toFixed(2)}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quantity Selection */}
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">Quantity</h3>
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex items-center rounded-md border border-gray-300 bg-white">
                  <button
                    onClick={() => handleUpdateQuantity(-1)}
                    disabled={quantity <= 1 || isOutOfStock}
                    aria-label="Decrease quantity"
                    className={`px-3 py-2 text-gray-700 hover:bg-gray-100 ${
                      quantity <= 1 || isOutOfStock
                        ? "cursor-not-allowed opacity-50"
                        : ""
                    }`}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 md:w-12 text-center py-2 text-base md:text-lg font-semibold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleUpdateQuantity(1)}
                    disabled={
                      isOutOfStock ||
                      (product.stock_quantity != null &&
                        quantity >= product.stock_quantity)
                    }
                    aria-label="Increase quantity"
                    className={`px-3 py-2 text-gray-700 hover:bg-gray-100 ${
                      isOutOfStock ||
                      (product.stock_quantity != null &&
                        quantity >= product.stock_quantity)
                        ? "cursor-not-allowed opacity-50"
                        : ""
                    }`}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {product.stock_quantity != null && (
                  <span className="text-xs md:text-sm text-gray-500">
                    {product.stock_quantity} available
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col gap-3 md:gap-4">
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`w-full py-3 px-6 rounded-md font-semibold transition-colors text-sm md:text-base ${
                  isOutOfStock
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-[#B6895B] text-white hover:bg-[#A7784D]"
                }`}
              >
                Buy Now
              </button>
              
              <button
                onClick={handleAddToCart}
                disabled={inCart || isOutOfStock}
                className={`w-full py-3 px-6 rounded-md font-semibold transition-colors flex items-center justify-center gap-2 border text-sm md:text-base ${
                  inCart
                    ? "bg-green-50 text-green-700 border-green-600 hover:bg-green-100 cursor-default"
                    : isOutOfStock
                    ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                    : "bg-white text-green-700 border-green-600 hover:bg-green-50"
                }`}
              >
                <ShoppingCart size={18} />
                {inCart ? "Added to Cart" : "Add to Cart"}
              </button>
      <button
  onClick={() => handleToggleWishlist(product.id)}
  disabled={isOutOfStock}
  className={`
    w-full py-3 px-6 rounded-md font-semibold transition-colors 
    flex items-center justify-center gap-2 border text-sm md:text-base
    ${isLiked
      ? "bg-red-50 text-red-700 border-red-600 hover:bg-red-100"
      : isOutOfStock
      ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
    }
  `}
>
  <Heart
    size={18}
    className={`
      ${isLiked 
        ? "fill-current text-red-500" 
        : isOutOfStock 
          ? "text-gray-400" 
          : "text-gray-500"
      }
    `}
  />
  {isLiked ? "Added to wishlist" : "Add to wishlist"}
</button>
            </div>

            {/* Features */}
            <div className="mt-8 grid grid-cols-3 gap-4 md:gap-6">
              <div className="text-center">
                <Truck className="mx-auto text-green-700 mb-2" size={20} />
                <p className="text-xs text-gray-600">Free Shipping</p>
              </div>
              <div className="text-center">
                <Shield className="mx-auto text-green-700 mb-2" size={20} />
                <p className="text-xs text-gray-600">Secure Payment</p>
              </div>
              <div className="text-center">
                <RotateCcw className="mx-auto text-green-700 mb-2" size={20} />
                <p className="text-xs text-gray-600">Easy Returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="mt-8 md:mt-12 bg-white rounded-xl shadow-sm p-4 md:p-6">
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-4 md:mb-6">
            Product Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm md:text-base">
                Specifications
              </h3>
              <table className="w-full text-xs md:text-sm text-gray-700">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-medium">Category</td>
                    <td className="py-2">{product.category_name || "N/A"}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-medium">SKU</td>
                    <td className="py-2">
                      PRD-{String(product.id).padStart(4, "0")}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-medium">Weight</td>
                    <td className="py-2">0.5 kg</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-medium">Dimensions</td>
                    <td className="py-2">10 × 5 × 3 cm</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm md:text-base">
                Shipping & Returns
              </h3>
              <ul className="text-xs md:text-sm text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <Truck size={14} className="text-green-700 mt-0.5 flex-shrink-0" />
                  <span>Free standard shipping on orders over ₹999</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-700 font-bold flex-shrink-0">•</span>
                  <span>Estimated delivery: 3-5 business days</span>
                </li>
                <li className="flex items-start gap-2">
                  <RotateCcw size={14} className="text-green-700 mt-0.5 flex-shrink-0" />
                  <span>30-day easy returns policy</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Image Modal */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
        >
          <div
            className="relative w-full h-full max-w-6xl max-h-full p-2 md:p-4 flex items-center justify-center group touch-pan-y"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={allImages.length > 1 ? handleTouchStart : undefined}
            onTouchEnd={allImages.length > 1 ? handleTouchEnd : undefined}
          >
            <img
              src={allImages[selectedImage] || "https://via.placeholder.com/600"}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
              onError={(e) =>
                (e.currentTarget.src = "https://via.placeholder.com/600")
              }
            />
            
            {allImages.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between px-2 md:px-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <button
                  onClick={() =>
                    setSelectedImage((i) => (i - 1 + allImages.length) % allImages.length)
                  }
                  className="p-3 md:p-4 bg-white/20 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/30 transition-colors text-white pointer-events-auto"
                >
                  <ChevronsLeft size={24} className="md:size-8" />
                </button>
                <div className="flex-1" />
                <button
                  onClick={() =>
                    setSelectedImage((i) => (i + 1) % allImages.length)
                  }
                  className="p-3 md:p-4 bg-white/20 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/30 transition-colors text-white pointer-events-auto"
                >
                  <ChevronsRight size={24} className="md:size-8" />
                </button>
              </div>
            )}
            
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-4 p-3 bg-white/20 md:bg-white/20 md:hover:bg-white/30 backdrop-blur-sm rounded-full shadow-lg text-white transition-colors"
              aria-label="Close full-screen"
            >
              <Minimize2 size={24} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}