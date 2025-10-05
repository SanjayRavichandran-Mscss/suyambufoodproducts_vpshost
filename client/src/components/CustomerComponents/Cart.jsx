import React from "react";
import { Minus, Plus, SquareX, X, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Cart = ({
  customerId,
  cartItems,
  updateQuantity,
  handleRemoveItem,
  handleCloseCart,
  showCartModal,
  cartAnimation,
}) => {
  const baseUrl = "http://localhost:5000";
  const navigate = useNavigate();

  const totalItems = Array.isArray(cartItems)
    ? cartItems.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  const inStockItems = Array.isArray(cartItems)
    ? cartItems.filter((item) => item.stock_status !== "Out of Stock")
    : [];
  const outOfStockItems = Array.isArray(cartItems)
    ? cartItems.filter((item) => item.stock_status === "Out of Stock")
    : [];

  const subtotal = inStockItems
    .reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0)
    .toFixed(2);

  React.useEffect(() => {
    console.log("Cart.jsx cartItems:", cartItems);
  }, [cartItems]);

  const handleProceedToCheckout = () => {
    if (inStockItems.length === 0) {
      Swal.fire({
        icon: "warning",
        text:
          "No in-stock items in your cart. Please add in-stock products to proceed.",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }
    console.log("order method: cart");
    const encodedCustomerId = btoa(customerId);
    navigate(`/checkout?customerId=${encodedCustomerId}&identifier=cart`, {
      state: { cartItems: inStockItems, orderMethod: "cart" },
    });
  };

  return (
    <div
      className={`fixed inset-0 bg-black/30 flex z-50 transition-opacity duration-300 ${
        cartAnimation.includes("in") ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleCloseCart}
    >
      <div
        className="ml-auto h-full w-full sm:w-[460px] bg-white shadow-xl relative transition-transform duration-300 p-0 overflow-y-auto"
        style={{
          transform:
            cartAnimation === "slide-in" ? "translateX(0)" : "translateX(100%)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart size={22} className="text-gray-900" />
            <h2 className="text-2xl font-extrabold text-gray-900">
              Shopping Cart
            </h2>
          </div>
          <button
            onClick={handleCloseCart}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            aria-label="Close cart"
          >
            <SquareX size={22} />
          </button>
        </div>

        {/* Scrollable content (everything including buttons) */}
        <div className="pb-8">
          {Array.isArray(cartItems) && cartItems.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="text-gray-400" size={28} />
              </div>
              <p className="text-gray-600">Your cart is empty</p>
              <button
                className="mt-4 text-sm text-gray-700 hover:text-gray-900 font-medium"
                onClick={handleCloseCart}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Items */}
              <div className="divide-y divide-gray-100">
                {Array.isArray(cartItems) &&
                  cartItems.map((item) => {
                    const isOutOfStock = item.stock_status === "Out of Stock";
                    return (
                      <div
                        key={item.product_variant_id}
                        className="flex items-start px-6 py-5"
                      >
                        {/* Thumbnail */}
                        <div className="relative shrink-0">
                          <img
                            src={`${baseUrl}${item.thumbnail_url}`}
                            alt={item.product_name}
                            className="w-16 h-16 rounded-md object-cover border border-gray-100"
                            onError={(e) => {
                              e.currentTarget.src = "/fallback-image.png";
                            }}
                          />
                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-gray-200/70 rounded-md grid place-items-center">
                              <span className="text-[10px] font-semibold text-gray-700 bg-white/95 px-1.5 py-0.5 rounded">
                                Out of stock
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 pl-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="text-[15px] font-semibold text-gray-900 truncate">
                                {item.product_name}
                              </h3>
                              <p className="text-[12px] text-gray-500 mt-0.5">
                                {parseFloat(item.variant_quantity).toFixed(0)}{" "}
                                {item.uom_name}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                handleRemoveItem(item.product_variant_id)
                              }
                              className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50"
                              aria-label="Remove item"
                            >
                              <X size={16} />
                            </button>
                          </div>

                          {/* Quantity + line price */}
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  updateQuantity(item.product_variant_id, -1)
                                }
                                className={`h-8 w-8 grid place-items-center rounded-md bg-gray-50 text-gray-700 hover:bg-gray-100 transition ${
                                  item.quantity <= 1 || isOutOfStock
                                    ? "opacity-40 cursor-not-allowed"
                                    : "cursor-pointer"
                                }`}
                                disabled={item.quantity <= 1 || isOutOfStock}
                                aria-label="Decrease quantity"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="w-6 text-center text-sm font-medium text-gray-800">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.product_variant_id, 1)
                                }
                                className={`h-8 w-8 grid place-items-center rounded-md bg-gray-50 text-gray-700 hover:bg-gray-100 transition ${
                                  isOutOfStock
                                    ? "opacity-40 cursor-not-allowed"
                                    : "cursor-pointer"
                                }`}
                                disabled={isOutOfStock}
                                aria-label="Increase quantity"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                            <span className="text-base font-extrabold text-[#B6895B]">
                              ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                            </span>
                          </div>

                          {/* Stock state */}
                          <p
                            className={`text-[11px] mt-2 font-medium ${
                              item.stock_status === "In Stock"
                                ? "text-green-600"
                                : item.stock_status === "Low Stock"
                                ? "text-amber-600"
                                : "text-red-600"
                            }`}
                          >
                            {item.stock_status}
                            {isOutOfStock && " (not in subtotal)"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Order summary */}
              <div className="px-6 pt-5">
                <div className="border-t border-gray-100 pt-4 pb-2 flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Subtotal</span>
                  <span className="text-lg font-extrabold text-[#B6895B]">
                    ₹{subtotal}
                  </span>
                </div>
                <div className="py-2 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Taxes & Shipping</span>
                  <span className="text-gray-500">Calculated at checkout</span>
                </div>
                <div className="py-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-gray-900 font-extrabold">Order Total</span>
                  <span className="text-2xl font-extrabold text-gray-900">
                    ₹{subtotal}
                  </span>
                </div>

                {/* Actions positioned directly below Order Total */}
                {outOfStockItems.length > 0 && (
                  <p className="text-xs text-red-600 mt-2 mb-3">
                    {outOfStockItems.length} out-of-stock item(s) not included in subtotal.
                  </p>
                )}
                <button
                  type="button"
                  className={`w-full py-3 rounded-lg text-white text-base font-semibold transition
                    ${
                      inStockItems.length === 0
                        ? "bg-[#B6895B]/50 cursor-not-allowed"
                        : "bg-[#B6895B] hover:bg-[#A7784D] cursor-pointer"
                    }`}
                  onClick={handleProceedToCheckout}
                  disabled={inStockItems.length === 0}
                >
                  Proceed to Checkout
                </button>
                <button
                  className="w-full mt-3 py-2.5 rounded-lg text-gray-700 hover:text-gray-900 font-medium"
                  onClick={handleCloseCart}
                >
                  Continue Shopping
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
