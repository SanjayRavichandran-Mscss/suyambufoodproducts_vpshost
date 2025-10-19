import React, { useState } from "react";
import { ShoppingBag } from "lucide-react";
import Cart from "./Cart";

const OrderSummary = ({
  items,
  orderMethod,
  selectedPaymentMethodId,
  showEditButtons = false,
  customerId,
  fetchCart,
  updateQuantity,
  handleRemoveItem,
}) => {
  const baseUrl = "http://localhost:5000";
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartAnimation, setCartAnimation] = useState("");

  const subtotal = items.reduce((sum, item) => {
    if (item.stock_status_id !== 2) {
      return sum + (parseFloat(item.price) || 0) * (item.quantity || 1);
    }
    return sum;
  }, 0);
  const shipping = subtotal > 999 ? 0 : 100;
  const total = subtotal + shipping;

  const paymentMethodDisplay =
    selectedPaymentMethodId === 1
      ? "Cash on Delivery"
      : selectedPaymentMethodId === 2
      ? "Online Payment"
      : "Not selected";

  const handleEditCart = () => {
    setCartAnimation("slide-in");
    setShowCartModal(true);
  };

  const handleCloseCart = () => {
    setCartAnimation("slide-out");
    setTimeout(() => {
      setShowCartModal(false);
      setCartAnimation("");
      if (orderMethod === "cart") fetchCart();
    }, 300);
  };

  const getImageUrl = (thumbnailUrl) => {
    if (!thumbnailUrl) return "/fallback-image.png";
    if (thumbnailUrl.startsWith("http://") || thumbnailUrl.startsWith("https://")) {
      return thumbnailUrl;
    }
    return `${baseUrl}${thumbnailUrl.startsWith("/") ? "" : "/"}${thumbnailUrl}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShoppingBag size={24} className="text-green-600" />
          Order Summary
        </h2>
        {showEditButtons && orderMethod === "cart" && (
          <button
            className="text-green-600 hover:text-green-800 font-medium text-sm px-3 py-1 rounded-md bg-green-50 hover:bg-green-100 transition-colors cursor-pointer"
            onClick={handleEditCart}
          >
            Edit Cart
          </button>
        )}
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <p className="text-gray-500 text-center">No items in order</p>
        ) : (
          items.map((item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = item.quantity || 1;
            const productName = item.product_name || "Unknown Product";
            const unit = item.uom_name || item.unit || "item";
            const variantQuantity = item.variant_quantity || "";
            const isOutOfStock = item.stock_status_id === 2;

            return (
              <div
                key={item.product_variant_id || item.variant_id || Math.random()}
                className="flex items-start gap-4 border-b border-gray-100 pb-4"
              >
                <div className="relative">
                  <img
                    src={getImageUrl(item.thumbnail_url)}
                    alt={productName}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm"
                    onError={(e) => {
                      e.target.src = "/fallback-image.png";
                    }}
                  />
                  {isOutOfStock && (
                    <span className="absolute top-0 left-0 bg-gray-100 text-gray-700 text-xs font-medium px-2 py-0.5 rounded">
                      Out of Stock
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {productName} {variantQuantity && `- ${variantQuantity} ${unit}`}
                  </p>
                  <div className="text-sm text-gray-600 mt-1">
                    <p>
                      <span className="font-medium">Price:</span> ₹{price.toFixed(2)} per {unit}
                    </p>
                    <p>
                      <span className="font-medium">Quantity:</span> {quantity}
                    </p>
                    {isOutOfStock && (
                      <p className="text-red-600 font-medium">
                        Not included in total (Out of Stock)
                      </p>
                    )}
                  </div>
                </div>
                <p className="font-semibold text-[#B6895B]">
                  ₹{(price * quantity).toFixed(2)}
                </p>
              </div>
            );
          })
        )}

        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between text-gray-700 mb-2">
            <span>Subtotal</span>
            <span className="text-lg font-extrabold text-[#B6895B]">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-700 mb-2">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between font-semibold text-gray-900">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          {typeof orderMethod !== "undefined" && (
            <>
              <p className="text-sm text-gray-600 mt-2">
                Order Method: {orderMethod === "buy_now" ? "Buy Now" : "Cart"}
              </p>
              {typeof selectedPaymentMethodId !== "undefined" && (
                <p className="text-sm text-gray-600 mt-2">
                  Payment Method: {paymentMethodDisplay}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {showCartModal && (
        <Cart
          customerId={customerId}
          cartItems={items}
          updateQuantity={updateQuantity}
          handleRemoveItem={handleRemoveItem}
          fetchCart={fetchCart}
          handleCloseCart={handleCloseCart}
          showCartModal={showCartModal}
          cartAnimation={cartAnimation}
        />
      )}
    </div>
  );
};

export default OrderSummary;
