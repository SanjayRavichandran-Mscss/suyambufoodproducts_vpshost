import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import DeliveryAddress from "../components/CustomerComponents/DeliveryAddress";
import OrderSummary from "../components/CustomerComponents/OrderSummary";
import Header from "../components/CustomerComponents/Header";
import Cart from "../components/CustomerComponents/Cart";

// --- RAZORPAY INTEGRATION: START ---
const RAZORPAY_KEY_ID = 'rzp_live_RWp6XBrY1vkSS5';
// --- RAZORPAY INTEGRATION: END ---

function decodeCustomerId(encodedId) {
  try {
    return atob(encodedId);
  } catch {
    console.error("Error decoding customerId:", encodedId);
    return null;
  }
}

const CheckOutPage = () => {
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const encodedCustomerId = searchParams.get("customerId");
  const identifier = searchParams.get("identifier");
  const customerId = decodeCustomerId(encodedCustomerId);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartAnimation, setCartAnimation] = useState("");
  const [showOrderSummary, setShowOrderSummary] = useState(false); // Step 2
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [buyNowItem, setBuyNowItem] = useState(state?.product || null); // Make mutable for updates

  const isBuyNow = identifier === "buy_now";
  const isCartFlow = identifier === "cart";

  // NEW: Fetch product details if tax_percentage is missing (for Buy Now fallback)
  const fetchProductIfNeeded = async () => {
    if (!isBuyNow || !buyNowItem || (buyNowItem.tax_percentage && buyNowItem.tax_percentage > 0)) return; // Already have tax
    try {
      console.log("Fetching product details for tax_percentage:", buyNowItem.product_id || buyNowItem.id);
      const token = localStorage.getItem("customerToken");
      const productId = buyNowItem.product_id || buyNowItem.id;
      const response = await fetch(`https://suyambufoods.com/api/customer/product/${productId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Origin: "http://localhost:5173",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch product");
      const fetchedProduct = await response.json();
      console.log("Fetched product with tax:", fetchedProduct.tax_percentage);
      
      // Update buyNowItem with fetched data (merge variants if multiple, but assume single for Buy Now)
      const variant = fetchedProduct.variants.find(v => v.variant_id === buyNowItem.variant_id || v.id === buyNowItem.variant_id) || fetchedProduct.variants[0];
      setBuyNowItem({
        ...buyNowItem,
        tax_percentage: fetchedProduct.tax_percentage,
        price: variant?.price || buyNowItem.price,
        variant_quantity: variant?.variant_quantity || buyNowItem.variant_quantity,
        uom_name: variant?.uom_name || buyNowItem.uom_name,
      });
    } catch (error) {
      console.error("Error fetching product for tax:", error);
      Swal.fire({
        icon: "error",
        text: "Failed to load product tax details. Please go back and try again.",
        toast: true,
        position: "bottom-end",
        timer: 3000,
        showConfirmButton: false,
      });
    }
  };

  const items = isBuyNow
    ? buyNowItem
      ? [
          {
            variant_id: buyNowItem.variant_id || buyNowItem.variantId,
            product_id: buyNowItem.product_id || buyNowItem.id,
            product_name: buyNowItem.product_name || buyNowItem.name,
            price: parseFloat(buyNowItem.price),
            quantity: buyNowItem.quantity || 1,
            thumbnail_url: buyNowItem.thumbnail_url,
            stock_quantity: buyNowItem.stock_quantity,
            unit: buyNowItem.uom_name || buyNowItem.unit || "item",
            variant_quantity: buyNowItem.variant_quantity || "",
            uom_name: buyNowItem.uom_name || "",
            uom_id: buyNowItem.uom_id || 0,
            tax_percentage: parseFloat(buyNowItem.tax_percentage || 0), // Now ensured via fetch or pass
          },
        ]
      : []
    : cartItems;

  const orderMethod = isBuyNow ? "buy_now" : "cart";

  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  const totalTax = items.reduce((sum, item) => {
    const taxPerc = parseFloat(item.tax_percentage || 0);
    return sum + (parseFloat(item.price) * item.quantity * taxPerc / 100);
  }, 0);
  const total = subtotal + totalTax + deliveryFee;

  // NEW: Function to compute delivery fee via API
  const computeDeliveryFee = async () => {
    if (!selectedAddressId || items.length === 0) {
      setDeliveryFee(0);
      return;
    }
    try {
      const token = localStorage.getItem("customerToken");
      const body = {
        customerId,
        addressId: selectedAddressId,
      };
      if (isBuyNow) {
        // For buy now, pass items (single item array)
        body.items = items.map((item) => ({
          variantId: item.variant_id || item.product_variant_id,
          quantity: item.quantity,
        }));
      }
      // For cart, omit items to fetch from backend
      const response = await fetch(`https://suyambufoods.com/api/customer/calculate-delivery`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Origin: "http://localhost:5173",
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("Failed to compute delivery fee");
      const data = await response.json();
      setDeliveryFee(data.delivery_fee || 0);
    } catch (error) {
      console.error("Error computing delivery fee:", error);
      setDeliveryFee(0);
      Swal.fire({
        icon: "error",
        text: "Failed to compute delivery fee. Please try again.",
        toast: true,
        position: "bottom-end",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  // Compute delivery fee when selectedAddressId or items change
  useEffect(() => {
    computeDeliveryFee();
  }, [selectedAddressId, items, isBuyNow, isCartFlow]);

  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    const storedCustomerId = localStorage.getItem("customerId");

    if (!token || !storedCustomerId || !customerId || !["buy_now", "cart"].includes(identifier)) {
      console.log("Invalid token, customerId, or identifier, redirecting to root");
      navigate("/", { replace: true });
      return;
    }

    if (customerId !== storedCustomerId) {
      console.log("CustomerId mismatch, updating URL");
      const correctEncodedId = btoa(storedCustomerId);
      navigate(`/checkout?customerId=${correctEncodedId}&identifier=${identifier}`, { replace: true });
      return;
    }

    if (isBuyNow && (!buyNowItem || !buyNowItem.variant_id)) {
      console.error("No product data or variant_id provided for buy_now flow");
      navigate("/", { replace: true });
      return;
    }

    const verifyCustomer = async () => {
      try {
        const response = await fetch(
          `https://suyambufoods.com/api/customer/profile?customerId=${storedCustomerId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              Origin: "http://localhost:5173",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setCustomerData(data);
          if (isBuyNow) {
            // NEW: Fetch tax if missing in state
            await fetchProductIfNeeded();
          }
          if (!isBuyNow) {
            await fetchCart();
          }
        } else {
          console.error("Token verification failed, clearing storage");
          localStorage.removeItem("customerToken");
          localStorage.removeItem("customerId");
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.error("Verification error:", error);
        localStorage.removeItem("customerToken");
        localStorage.removeItem("customerId");
        navigate("/", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    verifyCustomer();
  }, [customerId, identifier, navigate, isBuyNow, buyNowItem]);

  const fetchCart = async () => {
    if (!customerId) return;
    try {
      const token = localStorage.getItem("customerToken");
      const response = await fetch(`https://suyambufoods.com/api/customer/cart?customerId=${customerId}`, {
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:5173",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch cart");
      const data = await response.json();
      // Ensure tax_percentage is included (backend should join with products)
      const updatedData = data.map(item => ({
        ...item,
        tax_percentage: parseFloat(item.tax_percentage || 0), // Fallback to 0 if missing
      }));
      console.log("Cart items with tax:", updatedData); // Debug: Check tax in console
      setCartItems(Array.isArray(updatedData) ? updatedData : []);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setCartItems([]);
    }
  };

  const updateQuantity = async (variantId, change) => {
    const item = cartItems.find((item) => item.product_variant_id === variantId);
    if (!item) return;
    const newQuantity = Math.max(1, item.quantity + change);
    try {
      const token = localStorage.getItem("customerToken");
      const response = await fetch(`https://suyambufoods.com/api/customer/cart`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:5173",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ customerId, variantId, quantity: newQuantity }),
      });
      if (response.ok) {
        await fetchCart();
        // Recompute delivery fee after cart update (if in summary view)
        if (showOrderSummary && isCartFlow) {
          computeDeliveryFee();
        }
        Swal.fire({
          icon: "success",
          text: "Cart updated successfully",
          toast: true,
          position: "bottom-end",
          timer: 2000,
          showConfirmButton: false,
          showClass: { popup: "animate__animated animate__slideInUp" },
        });
      }
    } catch (err) {
      console.error("Failed to update quantity:", err);
    }
  };

  const handleRemoveItem = async (variantId) => {
    if (!customerId) return;
    try {
      const token = localStorage.getItem("customerToken");
      const response = await fetch(
        `https://suyambufoods.com/api/customer/cart?customerId=${customerId}&variantId=${variantId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Origin: "http://localhost:5173",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        await fetchCart();
        // Recompute delivery fee after removal (if in summary view)
        if (showOrderSummary && isCartFlow) {
          computeDeliveryFee();
        }
        Swal.fire({
          icon: "success",
          text: "Item removed from cart successfully",
          toast: true,
          position: "bottom-end",
          timer: 2000,
          showConfirmButton: false,
          showClass: { popup: "animate__animated animate__slideInUp" },
        });
      }
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  const handleCartClick = () => {
    setCartAnimation("slide-in");
    setShowCartModal(true);
  };

  const handleCloseCart = () => {
    setCartAnimation("slide-out");
    setTimeout(() => {
      setShowCartModal(false);
      setCartAnimation("");
      fetchCart();
    }, 300);
  };

  const handleLoginClick = () => {
    navigate("/?auth=login");
  };

  const handleRegisterClick = () => {
    navigate("/?auth=register");
  };

  const handleContinueFromAddress = () => {
    if (!selectedAddressId) {
      Swal.fire({
        icon: "warning",
        text: "Please select a delivery address",
        toast: true,
        position: "bottom-end",
        timer: 2000,
        showConfirmButton: false,
        showClass: { popup: "animate__animated animate__slideInUp" },
      });
      return;
    }
    setShowOrderSummary(true);
  };

  const handleContinueToPayment = async () => {
    if (!hasAgreedToTerms) {
      Swal.fire({
        icon: "warning",
        text: "Please agree to the Terms & Conditions",
        toast: true,
        position: "bottom-end",
        timer: 2000,
        showConfirmButton: false,
        showClass: { popup: "animate__animated animate__slideInUp" },
      });
      return;
    }
    await initiateRazorpayPayment();
  };

  // NEW: Dedicated handler for Buy Now
  const handleBuyNowPayment = async () => {
    if (!selectedAddressId) {
      Swal.fire({
        icon: "warning",
        text: "Please select a delivery address",
        toast: true,
        position: "bottom-end",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }
    if (!hasAgreedToTerms) {
      Swal.fire({
        icon: "warning",
        text: "Please agree to the Terms & Conditions",
        toast: true,
        position: "bottom-end",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }
    await initiateRazorpayPayment();
  };

  const initiateRazorpayPayment = async () => {
    if (items.length === 0) {
      Swal.fire({
        icon: "error",
        title: "No Items",
        text: "No items to place order.",
        toast: true,
        position: "bottom-end",
        timer: 2000,
        showConfirmButton: false,
        showClass: { popup: "animate__animated animate__slideInUp" },
      });
      return;
    }

    const token = localStorage.getItem("customerToken");

    try {
      const createOrderResponse = await fetch(`https://suyambufoods.com/api/customer/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Origin: "http://localhost:5173",
        },
        body: JSON.stringify({ amount: total }),
      });

      if (!createOrderResponse.ok) throw new Error("Could not create payment order.");
      const order = await createOrderResponse.json();

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "SS Food Products",
        description: "Order Payment",
        order_id: order.id,
        handler: async function (response) {
          const verifyResponse = await fetch(`https://suyambufoods.com/api/customer/payment/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              Origin: "http://localhost:5173",
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verification = await verifyResponse.json();
          if (verification.success) {
            const orderPayload = {
              customerId,
              addressId: selectedAddressId,
              paymentMethodId: 2,
              orderMethod,
              items: items.map((item) => ({
                variantId: item.variant_id || item.product_variant_id,
                quantity: item.quantity,
              })),
              totalAmount: total,
              paymentDetails: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              },
            };

            const placeOrderResponse = await fetch(`https://suyambufoods.com/api/customer/orders`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                Origin: "http://localhost:5173",
              },
              body: JSON.stringify(orderPayload),
            });

            if (!placeOrderResponse.ok) throw new Error("Failed to save order.");

            if (!isBuyNow) await fetchCart();

            Swal.fire({
              icon: "success",
              title: "Payment Successful!",
              text: "Your order has been placed.",
            }).then(() => {
              navigate(`/customer?customerId=${btoa(customerId)}`);
            });
          } else {
            Swal.fire({ icon: "error", title: "Payment Failed", text: "Verification failed." });
          }
        },
        prefill: {
          name: customerData?.full_name || customerData?.name || "",
          email: customerData?.email || "",
          contact: customerData?.phone || "",
        },
        theme: { color: "#B6895B" },
      };

      if (!window.Razorpay) {
        Swal.fire({
          icon: "error",
          title: "Payment Gateway Error",
          text: "Razorpay script not loaded. Please try again.",
        });
        return;
      }

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

      paymentObject.on("payment.failed", function (response) {
        Swal.fire({
          icon: "error",
          title: "Payment Failed",
          text: response.error.description || "Something went wrong.",
        });
      });
    } catch (error) {
      console.error("Razorpay flow error:", error);
      Swal.fire({ icon: "error", text: `Error: ${error.message}` });
    }
  };

  const handleBack = () => {
    navigate(`/customer?customerId=${btoa(customerId)}`);
  };

  const handleOrdersClick = () => {
    navigate(`/customer?customerId=${btoa(customerId)}&showOrders=true`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        customerData={customerData}
        onLoginClick={handleLoginClick}
        onRegisterClick={handleRegisterClick}
        cartItems={cartItems}
        customerId={customerId}
        fetchCart={fetchCart}
        onCartClick={handleCartClick}
        onOrdersClick={handleOrdersClick}
      />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl pt-24">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>

        {/* CART FLOW: STEP 1 - ONLY ADDRESS */}
        {isCartFlow && !showOrderSummary && (
          <div className="max-w-2xl mx-auto">
            <DeliveryAddress
              customerId={customerId}
              setSelectedAddressId={setSelectedAddressId}
              selectedAddressId={selectedAddressId}
            />
            <div className="mt-6 bg-gray-50 rounded-lg p-6">
              <div className="flex justify-end">
                <button
                  onClick={handleContinueFromAddress}
                  disabled={!selectedAddressId}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${
                    !selectedAddressId
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[#B6895B] text-white hover:bg-[#16A34A]"
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CART FLOW: STEP 2 - ORDER SUMMARY + T&C */}
        {isCartFlow && showOrderSummary && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              <OrderSummary
                items={items}
                subtotal={subtotal}
                tax={totalTax}
                shipping={deliveryFee}
                total={total}
                updateQuantity={updateQuantity}
                handleRemoveItem={handleRemoveItem}
                isSidebar={false}
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasAgreedToTerms}
                  onChange={(e) => setHasAgreedToTerms(e.target.checked)}
                  className="w-5 h-5 text-[#B6895B] border-gray-300 rounded focus:ring-[#B6895B]"
                />
                <span className="text-sm text-gray-700">
                  I have read and agree to the{" "}
                  <a
                    href="/about#terms-and-conditions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#B6895B] font-medium hover:underline"
                  >
                    Terms & Conditions
                  </a>
                  .
                </span>
              </label>

              <div className="flex justify-between pt-4">
                <button
                  onClick={handleBack}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleContinueToPayment}
                  disabled={!hasAgreedToTerms}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${
                    !hasAgreedToTerms
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[#B6895B] text-white hover:bg-[#16A34A]"
                  }`}
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BUY NOW: ALL AT ONCE */}
        {isBuyNow && (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-6">
              <DeliveryAddress
                customerId={customerId}
                setSelectedAddressId={setSelectedAddressId}
                selectedAddressId={selectedAddressId}
              />
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasAgreedToTerms}
                    onChange={(e) => setHasAgreedToTerms(e.target.checked)}
                    className="w-5 h-5 text-[#B6895B] border-gray-300 rounded focus:ring-[#B6895B]"
                  />
                  <span className="text-sm text-gray-700">
                    I have read and agree to the{" "}
                    <a
                      href="/about#terms-and-conditions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#B6895B] font-medium hover:underline"
                    >
                      Terms & Conditions
                    </a>
                    .
                  </span>
                </label>
                <div className="flex justify-between pt-4">
                  <button
                    onClick={handleBack}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleBuyNowPayment}
                    disabled={!selectedAddressId || !hasAgreedToTerms}
                    className={`px-6 py-2 rounded-md font-medium transition-colors ${
                      !selectedAddressId || !hasAgreedToTerms
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-[#B6895B] text-white hover:bg-[#16A34A]"
                    }`}
                  >
                    Place Order
                  </button>
                </div>
              </div>
            </div>
            <div className="lg:w-1/3">
              <OrderSummary
                items={items}
                subtotal={subtotal}
                tax={totalTax}
                shipping={deliveryFee}
                total={total}
                updateQuantity={updateQuantity}
                handleRemoveItem={handleRemoveItem}
                isSidebar={true}
              />
            </div>
          </div>
        )}
      </main>

      {showCartModal && (
        <Cart
          customerId={customerId}
          cartItems={cartItems}
          updateQuantity={updateQuantity}
          handleRemoveItem={handleRemoveItem}
          handleCloseCart={handleCloseCart}
          showCartModal={showCartModal}
          cartAnimation={cartAnimation}
        />
      )}
    </div>
  );
};

export default CheckOutPage;