// import React, { useState } from "react";
// import { ShoppingBag } from "lucide-react";
// import Cart from "./Cart";

// const OrderSummary = ({
//   items,
//   subtotal,
//   tax: totalTax,
//   shipping,
//   total,
//   orderMethod,
//   selectedPaymentMethodId,
//   showEditButtons = false,
//   customerId,
//   fetchCart,
//   updateQuantity,
//   handleRemoveItem,
//   isSidebar = false, // Optional prop from CheckoutPage
// }) => {
//   const baseUrl = "https://suyambuoils.com/api/";
//   const [showCartModal, setShowCartModal] = useState(false);
//   const [cartAnimation, setCartAnimation] = useState("");

//   const paymentMethodDisplay =
//     selectedPaymentMethodId === 1
//       ? "Cash on Delivery"
//       : selectedPaymentMethodId === 2
//       ? "Online Payment"
//       : "Not selected";

//   const handleEditCart = () => {
//     setCartAnimation("slide-in");
//     setShowCartModal(true);
//   };

//   const handleCloseCart = () => {
//     setCartAnimation("slide-out");
//     setTimeout(() => {
//       setShowCartModal(false);
//       setCartAnimation("");
//       if (orderMethod === "cart") fetchCart();
//     }, 300);
//   };

//   const getImageUrl = (thumbnailUrl) => {
//     if (!thumbnailUrl) return "/fallback-image.png";
//     if (thumbnailUrl.startsWith("http://") || thumbnailUrl.startsWith("https://")) {
//       return thumbnailUrl;
//     }
//     return `${baseUrl}${thumbnailUrl.startsWith("/") ? "" : "/"}${thumbnailUrl}`;
//   };

//   return (
//     <div className={`bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100 ${isSidebar ? 'sticky top-6' : ''}`}>
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
//           <ShoppingBag size={24} className="text-green-600" />
//           Order Summary
//         </h2>
//         {showEditButtons && orderMethod === "cart" && (
//           <button
//             className="text-green-600 hover:text-green-800 font-medium text-sm px-3 py-1 rounded-md bg-green-50 hover:bg-green-100 transition-colors cursor-pointer"
//             onClick={handleEditCart}
//           >
//             Edit Cart
//           </button>
//         )}
//       </div>

//       <div className="space-y-4">
//         {items.length === 0 ? (
//           <p className="text-gray-500 text-center">No items in order</p>
//         ) : (
//           items.map((item) => {
//             const price = parseFloat(item.price) || 0;
//             const quantity = item.quantity || 1;
//             const productName = item.product_name || "Unknown Product";
//             const unit = item.uom_name || item.unit || "item";
//             const variantQuantity = item.variant_quantity || "";
//             const taxPerc = parseFloat(item.tax_percentage || 0);
//             const taxAmount = (price * quantity * taxPerc / 100).toFixed(2);
//             const itemSubtotal = (price * quantity).toFixed(2);
//             const isOutOfStock = item.stock_status_id === 2;

//             return (
//               <div
//                 key={item.product_variant_id || item.variant_id || Math.random()}
//                 className="flex items-start gap-4 border-b border-gray-100 pb-4"
//               >
//                 <div className="relative">
//                   <img
//                     src={getImageUrl(item.thumbnail_url)}
//                     alt={productName}
//                     className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm"
//                     onError={(e) => {
//                       e.target.src = "/fallback-image.png";
//                     }}
//                   />
//                   {isOutOfStock && (
//                     <span className="absolute top-0 left-0 bg-gray-100 text-gray-700 text-xs font-medium px-2 py-0.5 rounded">
//                       Out of Stock
//                     </span>
//                   )}
//                 </div>
//                 <div className="flex-1">
//                   <p className="font-medium text-gray-900">
//                     {productName} {variantQuantity && `- ${variantQuantity} ${unit}`}
//                   </p>
//                   <div className="text-sm text-gray-600 mt-1 space-y-1">
//                     <p>
//                       <span className="font-medium">Price:</span> ₹{price.toFixed(2)} per {unit}
//                     </p>
//                     <p>
//                       <span className="font-medium">Quantity:</span> {quantity}
//                     </p>
//                     <p>
//                       <span className="font-medium">Tax ({taxPerc.toFixed(2)}%):</span> ₹{taxAmount}
//                     </p>
//                     {isOutOfStock && (
//                       <p className="text-red-600 font-medium">
//                         Not included in total (Out of Stock)
//                       </p>
//                     )}
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <p className="font-semibold text-[#B6895B]">₹{itemSubtotal}</p>
//                   {taxAmount !== "0.00" && (
//                     <p className="text-xs text-gray-500">+ Tax: ₹{taxAmount}</p>
//                   )}
//                 </div>
//               </div>
//             );
//           })
//         )}

//         <div className="border-t border-gray-200 pt-4">
//           <div className="flex justify-between text-gray-700 mb-2">
//             <span>Subtotal</span>
//             <span className="text-lg font-extrabold text-[#B6895B]">₹{subtotal.toFixed(2)}</span>
//           </div>

//           {/* NEW: total tax amount just below subtotal */}
//           <div className="flex justify-between text-gray-700 mb-2">
//             <span>Total Tax</span>
//             <span className="text-lg font-semibold text-[#B6895B]">₹{totalTax.toFixed(2)}</span>
//           </div>

//           <div className="flex justify-between text-gray-700 mb-2">
//             <span>Shipping</span>
//             <span>{shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}</span>
//           </div>
//           <div className="flex justify-between font-semibold text-gray-900 border-t pt-2">
//             <span>Total</span>
//             <span className="text-2xl text-[#B6895B]">₹{total.toFixed(2)}</span>
//           </div>
//           {typeof orderMethod !== "undefined" && (
//             <>
//               <p className="text-sm text-gray-600 mt-2">
//                 Order Method: {orderMethod === "buy_now" ? "Buy Now" : "Cart"}
//               </p>
//               {typeof selectedPaymentMethodId !== "undefined" && (
//                 <p className="text-sm text-gray-600 mt-2">
//                   Payment Method: {paymentMethodDisplay}
//                 </p>
//               )}
//             </>
//           )}
//         </div>
//       </div>

//       {showCartModal && (
//         <Cart
//           customerId={customerId}
//           cartItems={items}
//           updateQuantity={updateQuantity}
//           handleRemoveItem={handleRemoveItem}
//           fetchCart={fetchCart}
//           handleCloseCart={handleCloseCart}
//           showCartModal={showCartModal}
//           cartAnimation={cartAnimation}
//         />
//       )}
//     </div>
//   );
// };

// export default OrderSummary;










import React, { useState } from "react";
import { ShoppingBag, X, CheckCircle } from "lucide-react";
import Cart from "./Cart";

const OrderSummary = ({
  items,
  subtotal,
  tax: totalTax,
  shipping,
  total,
  discountAmount = 0,
  appliedCoupon = null,
  couponCode,
  setCouponCode,
  validateAndApplyCoupon,
  removeCoupon,
  couponError,
  orderMethod,
  selectedPaymentMethodId,
  showEditButtons = false,
  customerId,
  fetchCart,
  updateQuantity,
  handleRemoveItem,
  isSidebar = false,
}) => {
  const baseUrl = "https://suyambuoils.com/api/";
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartAnimation, setCartAnimation] = useState("");

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
      if (orderMethod === "cart" && fetchCart) fetchCart();
    }, 300);
  };

  const getImageUrl = (thumbnailUrl) => {
    if (!thumbnailUrl) return "/fallback-image.png";
    if (thumbnailUrl.startsWith("http://") || thumbnailUrl.startsWith("https://")) {
      return thumbnailUrl;
    }
    return `${baseUrl}${thumbnailUrl.startsWith("/") ? "" : "/"}${thumbnailUrl}`;
  };

  // Helper to format amount nicely (removes .00 when whole number)
  const formatAmount = (amount) => {
    const num = parseFloat(amount);
    return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2);
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 border border-gray-100 ${isSidebar ? 'sticky top-6' : ''}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
          <ShoppingBag size={22} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
      </div>

      {/* Items List */}
      <div className="space-y-5 mb-8">
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No items in order</p>
        ) : (
          items.map((item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = item.quantity || 1;
            const productName = item.product_name || "Unknown Product";
            const unit = item.uom_name || item.unit || "item";
            const variantQuantity = item.variant_quantity || "";
            const taxPerc = parseFloat(item.tax_percentage || 0);
            const taxAmount = (price * quantity * taxPerc) / 100;
            const itemSubtotal = price * quantity;
            const isOutOfStock = item.stock_status_id === 2;

            return (
              <div
                key={item.product_variant_id || item.variant_id || Math.random()}
                className="flex gap-4 border-b border-gray-100 pb-5 last:border-b-0"
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={getImageUrl(item.thumbnail_url)}
                    alt={productName}
                    className="w-20 h-20 object-cover rounded-xl border border-gray-200 shadow-sm"
                    onError={(e) => (e.target.src = "/fallback-image.png")}
                  />
                  {isOutOfStock && (
                    <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[10px] font-medium px-2 py-0.5 rounded">
                      Out of Stock
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-[17px] leading-tight">
                    {productName} {variantQuantity && `- ${variantQuantity} ${unit}`}
                  </p>
                  <div className="mt-2 text-sm text-gray-600 space-y-1">
                    <p>Price: ₹{price.toFixed(2)} per {unit}</p>
                    <p>Quantity: {quantity}</p>
                    {taxPerc > 0 && (
                      <p>Tax ({taxPerc.toFixed(1)}%): ₹{taxAmount.toFixed(2)}</p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-[#B6895B] text-lg">₹{formatAmount(itemSubtotal)}</p>
                  {taxAmount > 0 && (
                    <p className="text-xs text-gray-500 mt-1">+ Tax: ₹{taxAmount.toFixed(2)}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pricing Breakdown */}
      <div className="border-t border-gray-200 pt-5 space-y-3 text-[15px]">
        <div className="flex justify-between text-gray-700">
          <span>Subtotal</span>
          <span className="font-medium">₹{formatAmount(subtotal)}</span>
        </div>

        {/* Coupon Discount */}
        {appliedCoupon && discountAmount > 0 && (
          <div className="flex justify-between text-green-600 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle size={17} />
              Coupon ({appliedCoupon.code}) — {appliedCoupon.discount_percentage}%
            </span>
            <span>- ₹{formatAmount(discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-gray-700">
          <span>Total Tax</span>
          <span className="font-medium">₹{formatAmount(totalTax)}</span>
        </div>

        <div className="flex justify-between text-gray-700">
          <span>Shipping</span>
          <span className="font-medium">
            {shipping === 0 ? "Free" : `₹${formatAmount(shipping)}`}
          </span>
        </div>

        {/* Total Amount */}
        <div className="flex justify-between border-t border-gray-300 pt-4 font-bold text-lg text-gray-900">
          <span>Total Amount</span>
          <span className="text-[#B6895B]">₹{formatAmount(total)}</span>
        </div>

        {/* Order Info */}
        {orderMethod && (
          <div className="pt-3 text-sm text-gray-600">
            <p>Order Method: {orderMethod === "buy_now" ? "Buy Now" : "Cart"}</p>
            {selectedPaymentMethodId && (
              <p>Payment Method: {paymentMethodDisplay}</p>
            )}
          </div>
        )}
      </div>

      {/* Coupon Section */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-3">Have a coupon code?</p>

        {!appliedCoupon ? (
          <div className="flex gap-3">
            <input
              type="text"
              value={couponCode || ""}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code (e.g. SAVE10)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#B6895B] focus:ring-1 text-sm"
              maxLength={20}
            />
            <button
              onClick={validateAndApplyCoupon}
              disabled={!couponCode?.trim()}
              className="px-8 py-3 bg-[#B6895B] hover:bg-[#A67C52] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors text-sm whitespace-nowrap"
            >
              Apply
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 px-5 py-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <CheckCircle size={22} className="text-green-600" />
              <div>
                <p className="font-medium text-green-800">{appliedCoupon.code} applied</p>
                <p className="text-xs text-green-600">
                  {appliedCoupon.discount_percentage}% off on subtotal
                </p>
              </div>
            </div>
            <button
              onClick={removeCoupon}
              className="text-red-500 hover:text-red-600 p-1"
            >
              <X size={22} />
            </button>
          </div>
        )}

        {couponError && <p className="text-red-500 text-sm mt-2">{couponError}</p>}
      </div>

      {/* Cart Modal */}
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