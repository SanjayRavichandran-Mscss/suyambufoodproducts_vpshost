
import React, { useEffect, useState, useRef } from "react";
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
} from "lucide-react";

const IMAGE_BASE = "http://localhost:5000";

// Keep the same magnifier CSS (unchanged logic)
const magnifierStyles = `
.single-product-magnifier-container { position: relative; overflow: hidden; border-radius: 1rem; background: #f3f5f7; }
.single-product-magnifier-main-img { width: 100%; height: 28rem; object-fit: contain; display: block; }
.single-product-magnifier-lens { pointer-events: none; position: absolute; z-index: 20; border-radius: 50%; box-shadow: 0 2px 12px 2px #0003; width: 160px; height: 160px; background-repeat: no-repeat; background-size: 200% 200%; display: none; }
.single-product-magnifier-container:hover .single-product-magnifier-lens { display: block; }
@media (max-width: 768px) {
  .single-product-magnifier-main-img { height: 18rem; }
  .single-product-magnifier-lens { width: 110px; height: 110px; }
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
  const [magnifierVisible, setMagnifierVisible] = useState(false);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  const normalizeImage = (img) => {
    if (!img) return "https://via.placeholder.com/600";
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    if (img.startsWith("/")) return `${IMAGE_BASE}${img}`;
    return `${IMAGE_BASE}/${img}`;
  };

  // Keep variantId from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const variantId = searchParams.get("variantId");
    setSelectedVariantId(variantId ? String(variantId) : null);
  }, [location.search]);

  // Fetch product (logic unchanged, but allow display without login check)
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
      .get(`http://localhost:5000/api/admin/products/${idNum}`, {
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
      .catch(() => {
        setError("Product not found");
        setLoading(false);
      });
  }, [productId, selectedVariantId]);

  // Sync quantity with cart for selected variant
  useEffect(() => {
    if (!product) return;
    const ci = cartItems.find(
      (item) => String(item.variant_id) === String(selectedVariant?.id)
    );
    setQuantity(ci ? ci.quantity : 1);
  }, [cartItems, product, selectedVariant]);

  const handleUpdateQuantity = (change) => {
    if (!isLoggedIn) {
      showMessage("Please login to manage your cart");
      return;
    }
    if (!selectedVariant?.id) {
      showMessage("Please select a variant");
      return;
    }
    const newQuantity = Math.max(1, quantity + change);
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
        .put("http://localhost:5000/api/customer/cart", body, {
          headers: { Origin: "http://localhost:5173" },
        })
        .then(() => {
          fetchCart();
          showMessage("Cart updated successfully");
        })
        .catch(() => showMessage("Failed to update cart"));
    } else {
      axios
        .post("http://localhost:5000/api/customer/cart", body, {
          headers: { Origin: "http://localhost:5173" },
        })
        .then(() => {
          fetchCart();
          showMessage("Product added to cart");
        })
        .catch(() => showMessage("Failed to add to cart"));
    }
  };

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      showMessage("Please login to proceed with purchase");
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
        .post("http://localhost:5000/api/customer/cart", body, {
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
        .catch(() => showMessage("Failed to proceed with purchase"));
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

  // Magnifier events (logic unchanged)
  const handleImageMouseEnter = (e) => {
    setMagnifierVisible(true);
    handleImageMouseMove(e);
  };
  const handleImageMouseMove = (e) => {
    if (!imageRef.current) return;
    const { left, top, width, height } =
      imageRef.current.getBoundingClientRect();
    let x = e.clientX - left;
    let y = e.clientY - top;
    const lensRadius = 80;
    x = Math.max(lensRadius, Math.min(x, width - lensRadius));
    y = Math.max(lensRadius, Math.min(y, height - lensRadius));
    setMagnifierPos({ x, y });
  };
  const handleImageMouseLeave = () => {
    setMagnifierVisible(false);
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
  const isLiked = wishlist.includes(product.id);
  const isOutOfStock = product.stock_status_id === 2;

  const displayPrice =
    selectedVariant?.price != null
      ? Number(selectedVariant.price)
      : typeof product.price === "number"
      ? product.price
      : 0;

  const lensSize = 160;
  const lensRadius = lensSize / 2;
  const backgroundSize = 2;
  let bgX = 0,
    bgY = 0;
  if (imageRef.current) {
    const { width, height } = imageRef.current.getBoundingClientRect();
    bgX = (magnifierPos.x / width) * 100;
    bgY = (magnifierPos.y / height) * 100;
  }

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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <style>{magnifierStyles}</style>

      {/* Back link */}
      <button
        onClick={handleBack}
        className="mb-6 text-gray-600 hover:text-gray-900 font-medium"
        aria-label="Back to products"
      >
        &larr; Back to Products
      </button>

      {/* Card */}
      <div className="grid md:grid-cols-2 gap-10 bg-white rounded-xl shadow-sm p-6">
        {/* Left: gallery with magnifier */}
        <div className="flex flex-col gap-4">
          <div
            className="single-product-magnifier-container"
            ref={imageRef}
            onMouseEnter={handleImageMouseEnter}
            onMouseMove={handleImageMouseMove}
            onMouseLeave={handleImageMouseLeave}
          >
            <img
              src={imgSrc}
              alt={product.name}
              className="single-product-magnifier-main-img"
              onError={(e) =>
                (e.currentTarget.src = "https://via.placeholder.com/600")
              }
            />
            {magnifierVisible && (
              <div
                className="single-product-magnifier-lens"
                style={{
                  top: magnifierPos.y - lensRadius,
                  left: magnifierPos.x - lensRadius,
                  backgroundImage: `url(${imgSrc})`,
                  backgroundSize: `${backgroundSize * 100}% ${
                    backgroundSize * 100
                  }%`,
                  backgroundPosition: `${bgX}% ${bgY}%`,
                }}
              />
            )}
          </div>

          {/* Thumbs */}
          <div className="flex gap-3">
            {allImages.map((img, index) => (
              <button
                type="button"
                key={index}
                onClick={() => setSelectedImage(index)}
                aria-label={`View image ${index + 1}`}
                className={`h-16 w-16 rounded-md overflow-hidden border-2 transition ${
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

        {/* Right: info */}
        <div className="flex flex-col">
          <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
            {product.category_name}
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">
            {product.name}
          </h1>
          <p className="text-base text-gray-600 mt-2">
            {product.short_description || product.description || ""}
          </p>

          {/* Rating + stock */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex text-yellow-400" aria-label="Rating">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className={i < 4 ? "fill-current" : ""} />
              ))}
            </div>
            <span className="text-sm text-gray-600">(42 reviews)</span>
            <span className="text-sm ml-4 font-medium text-green-700">
              {isOutOfStock ? "Out of Stock" : "In Stock"}
            </span>
          </div>

          {/* Price */}
          <div className="mt-5 text-4xl font-extrabold text-[#B6895B]">
            ₹
            {Number(displayPrice).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>

          {/* Variant select (custom arrow) */}
          <div className="mt-6">
            <label className="text-sm font-semibold text-gray-700">
              Select Quantity
            </label>
            <select
              value={currentValue}
              onChange={(e) =>
                handleUomChange(product.id, e.target.value, product.variants)
              }
              className="
                mt-2 w-full appearance-none rounded-lg border border-gray-200
                bg-[#F3F5F7] text-gray-800 px-4 py-2 pr-10 shadow-inner
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
                  {variant.variant_quantity || variant.quantity} {variant.uom_name || ""}
                  {variant.price != null
                    ? ` - ₹${Number(variant.price).toFixed(2)}`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity controls */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Quantity</h3>
            <div className="flex items-center gap-4">
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
                <span className="w-12 text-center py-2 text-lg font-semibold">
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
              <span className="text-sm text-gray-500">
                {product.stock_quantity} available
              </span>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            {/* Left button: Buy Now (unchanged) */}
            <button
              onClick={handleBuyNow}
              disabled={!isLoggedIn || isOutOfStock}
              className={`flex-1 py-3 px-6 rounded-md font-semibold transition-colors
                ${
                  !isLoggedIn || isOutOfStock
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#B6895B] text-white hover:bg-[#A7784D]"
                }`}
            >
              Buy Now
            </button>

            {/* Right button: label changed to Add to Cart, logic preserved */}
            <button
              onClick={() => handleUpdateQuantity(inCart ? 0 : 1)}
              disabled={!isLoggedIn || isOutOfStock}
              className={`flex-1 py-3 px-6 rounded-md font-semibold transition-colors flex items-center justify-center gap-2 border
                ${
                  !isLoggedIn || isOutOfStock
                    ? "text-gray-500 border-gray-300 cursor-not-allowed"
                    : inCart
                    ? "bg-green-50 text-green-700 border-green-600 hover:bg-green-100"
                    : "bg-white text-green-700 border-green-600 hover:bg-green-50"
                }`}
            >
              <ShoppingCart size={20} />
              {inCart ? "Added to Cart" : isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>

            <button
              onClick={() => handleToggleWishlist(product.id)}
              aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
              className="p-3 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
              title={isLiked ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                size={20}
                className={isLiked ? "text-red-500 fill-red-500" : "text-gray-600"}
              />
            </button>
          </div>

          {/* Badges row */}
          <div className="mt-8 grid grid-cols-3 gap-6">
            <div className="text-center">
              <Truck className="mx-auto text-green-700 mb-2" size={24} />
              <p className="text-xs text-gray-600">Free Shipping</p>
            </div>
            <div className="text-center">
              <Shield className="mx-auto text-green-700 mb-2" size={24} />
              <p className="text-xs text-gray-600">Secure Payment</p>
            </div>
            <div className="text-center">
              <RotateCcw className="mx-auto text-green-700 mb-2" size={24} />
              <p className="text-xs text-gray-600">Easy Returns</p>
            </div>
          </div>
        </div>
      </div>

      {/* Details card */}
      <div className="mt-12 bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6">
          Product Details
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Specifications</h3>
            <table className="w-full text-sm text-gray-700">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-2 font-medium">Category</td>
                  <td className="py-2">{product.category_name}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 font-medium">SKU</td>
                  <td className="py-2">PRD-{String(product.id).padStart(4, "0")}</td>
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
            <h3 className="font-semibold text-gray-900 mb-3">
              Shipping & Returns
            </h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start gap-2">
                <Truck size={16} className="text-green-700 mt-0.5" />
                <span>Free standard shipping on orders over ₹999</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-700 font-bold">•</span>
                <span>Estimated delivery: 3-5 business days</span>
              </li>
              <li className="flex items-start gap-2">
                <RotateCcw size={16} className="text-green-700 mt-0.5" />
                <span>30-day easy returns policy</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
