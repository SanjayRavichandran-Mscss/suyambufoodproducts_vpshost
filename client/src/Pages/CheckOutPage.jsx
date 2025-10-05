import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import DeliveryAddress from "../components/CustomerComponents/DeliveryAddress";
import PaymentMethod from "../components/CustomerComponents/PaymentMethod";
import OrderSummary from "../components/CustomerComponents/OrderSummary";
import Header from "../components/CustomerComponents/Header";
import Cart from "../components/CustomerComponents/Cart";

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
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [customerData, setCustomerData] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartAnimation, setCartAnimation] = useState("");

  const isBuyNow = identifier === "buy_now";
  const buyNowItem = state?.product;
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
          },
        ]
      : []
    : cartItems;
  const orderMethod = isBuyNow ? "buy_now" : "cart";

  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  const shipping = subtotal > 999 ? 0 : 100;
  const total = subtotal + shipping;

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
          `http://localhost:5000/api/customer/profile?customerId=${storedCustomerId}`,
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
      const response = await fetch(`http://localhost:5000/api/customer/cart?customerId=${customerId}`, {
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:5173",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }
      const data = await response.json();
      setCartItems(Array.isArray(data) ? data : []);
      if (!isBuyNow) {
        navigate(`/checkout?customerId=${btoa(customerId)}&identifier=cart`, {
          state: { cartItems: data || [], orderMethod: "cart" },
          replace: true,
        });
      }
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
      const response = await fetch(`http://localhost:5000/api/customer/cart`, {
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
        Swal.fire({
          icon: "success",
          text: "Cart updated successfully",
          toast: true,
          position: "bottom-end",
          timer: 2000,
          showConfirmButton: false,
          showClass: {
            popup: "animate__animated animate__slideInUp",
          },
        });
      } else {
        console.error("Failed to update quantity:", response.statusText);
        Swal.fire({
          icon: "error",
          text: "Failed to update quantity",
          toast: true,
          position: "bottom-end",
          timer: 2000,
          showConfirmButton: false,
          showClass: {
            popup: "animate__animated animate__slideInUp",
          },
        });
      }
    } catch (err) {
      console.error("Failed to update quantity:", err);
      Swal.fire({
        icon: "error",
        text: `Failed to update quantity: ${err.message}`,
        toast: true,
        position: "bottom-end",
        timer: 2000,
        showConfirmButton: false,
        showClass: {
          popup: "animate__animated animate__slideInUp",
        },
      });
    }
  };

  const handleRemoveItem = async (variantId) => {
    if (!customerId) {
      console.error("No customerId available");
      return;
    }
    try {
      const token = localStorage.getItem("customerToken");
      const response = await fetch(
        `http://localhost:5000/api/customer/cart?customerId=${customerId}&variantId=${variantId}`,
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
        Swal.fire({
          icon: "success",
          text: "Item removed from cart successfully",
          toast: true,
          position: "bottom-end",
          timer: 2000,
          showConfirmButton: false,
          showClass: {
            popup: "animate__animated animate__slideInUp",
          },
        });
      } else {
        console.error("Delete request failed:", response.statusText);
        Swal.fire({
          icon: "error",
          text: "Failed to remove item",
          toast: true,
          position: "bottom-end",
          timer: 2000,
          showConfirmButton: false,
          showClass: {
            popup: "animate__animated animate__slideInUp",
          },
        });
      }
    } catch (err) {
      console.error("Failed to remove item:", err);
      Swal.fire({
        icon: "error",
        text: `Failed to remove item: ${err.message}`,
        toast: true,
        position: "bottom-end",
        timer: 2000,
        showConfirmButton: false,
        showClass: {
          popup: "animate__animated animate__slideInUp",
        },
      });
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

  const handleContinue = () => {
    if (currentStep === 1 && !selectedAddressId) {
      Swal.fire({
        icon: "warning",
        text: "Please select a delivery address",
        toast: true,
        position: "bottom-end",
        timer: 2000,
        showConfirmButton: false,
        showClass: {
          popup: "animate__animated animate__slideInUp",
        },
      });
      return;
    }
    if (currentStep === 1 && selectedAddressId) {
      setCurrentStep(2);
    } else if (currentStep === 2 && !isBuyNow) {
      setCurrentStep(3);
    } else if (currentStep === 2 && isBuyNow && selectedPaymentMethodId) {
      handlePlaceOrder();
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId || !selectedPaymentMethodId) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Information",
        text: "Please select a delivery address and payment method.",
        toast: true,
        position: "bottom-end",
        timer: 2000,
        showConfirmButton: false,
        showClass: {
          popup: "animate__animated animate__slideInUp",
        },
      });
      return;
    }

    if (items.length === 0) {
      Swal.fire({
        icon: "error",
        title: "No Items",
        text: "No items to place order. Please add items to your cart or select a product.",
        toast: true,
        position: "bottom-end",
        timer: 2000,
        showConfirmButton: false,
        showClass: {
          popup: "animate__animated animate__slideInUp",
        },
      });
      return;
    }

    try {
      const token = localStorage.getItem("customerToken");
      const response = await fetch(`http://localhost:5000/api/customer/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Origin: "http://localhost:5173",
        },
        body: JSON.stringify({
          customerId,
          addressId: selectedAddressId,
          paymentMethodId: selectedPaymentMethodId,
          orderMethod,
          items: items.map((item) => ({
            variantId: item.variant_id || item.product_variant_id,
            quantity: item.quantity,
          })),
          totalAmount: subtotal,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to place order");
      }

      if (!isBuyNow) {
        await fetchCart();
      }

      if (selectedPaymentMethodId === 1) {
        Swal.fire({
          icon: "success",
          title: "Order Placed",
          text: "Your order has been placed and an invoice has been sent to your mail.",
        }).then(() => {
          navigate(`/customer?customerId=${btoa(customerId)}`);
        });
      } else if (selectedPaymentMethodId === 2) {
        Swal.fire({
          icon: "warning",
          title: "Payment Required",
          text: "Please complete the online payment to place your order.",
        });
      }
    } catch (error) {
      console.error("Place order error:", error);
      Swal.fire({
        icon: "error",
        text: `Failed to place order: ${error.message}`,
        toast: true,
        position: "bottom-end",
        timer: 2000,
        showConfirmButton: false,
        showClass: {
          popup: "animate__animated animate__slideInUp",
        },
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate(`/customer?customerId=${btoa(customerId)}`);
    }
  };

  const handleOrdersClick = () => {
    navigate(`/customer?customerId=${btoa(customerId)}&showOrders=true`);
  };

  const showOrderSummarySidebar = currentStep === 2 && isBuyNow;

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
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl pt-20">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>

        <div className="mb-8 overflow-x-auto">
          <div className="flex justify-between items-center mb-4 min-w-max">
            <div
              className={`flex flex-col items-center ${
                currentStep >= 1 ? "text-green-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  currentStep >= 1
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                1
              </div>
              <span className="text-sm mt-2 font-medium">Delivery</span>
            </div>
            <div
              className={`flex-1 h-1 mx-4 ${
                currentStep >= 2 ? "bg-green-600" : "bg-gray-300"
              }`}
            ></div>
            <div
              className={`flex flex-col items-center ${
                currentStep >= 2 ? "text-green-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  currentStep >= 2
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                2
              </div>
              <span className="text-sm mt-2 font-medium">
                {isBuyNow ? "Payment" : "Order Summary"}
              </span>
            </div>
            {!isBuyNow && (
              <>
                <div
                  className={`flex-1 h-1 mx-4 ${
                    currentStep >= 3 ? "bg-green-600" : "bg-gray-300"
                  }`}
                ></div>
                <div
                  className={`flex flex-col items-center ${
                    currentStep >= 3 ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                      currentStep >= 3
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    3
                  </div>
                  <span className="text-sm mt-2 font-medium">Payment</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            {currentStep === 1 && (
              <DeliveryAddress
                customerId={customerId}
                setSelectedAddressId={setSelectedAddressId}
                selectedAddressId={selectedAddressId}
              />
            )}
            {currentStep === 2 && !isBuyNow && (
              <OrderSummary
                items={items}
                subtotal={subtotal}
                shipping={shipping}
                total={total}
                updateQuantity={updateQuantity}
                handleRemoveItem={handleRemoveItem}
              />
            )}
            {(currentStep === 3 || (isBuyNow && currentStep === 2)) && (
              <PaymentMethod
                setSelectedPaymentMethodId={setSelectedPaymentMethodId}
                selectedPaymentMethodId={selectedPaymentMethodId}
              />
            )}
            <div className="flex justify-between mt-6">
              <button
                onClick={handleBack}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Back
              </button>
              <button
                onClick={currentStep === 3 || (isBuyNow && currentStep === 2) ? handlePlaceOrder : handleContinue}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  (!selectedAddressId && currentStep === 1) ||
                  (!selectedPaymentMethodId && currentStep === (isBuyNow ? 2 : 3))
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#B6895B] text-white hover:bg-[#16A34A]"
                }`}
                disabled={
                  (!selectedAddressId && currentStep === 1) ||
                  (!selectedPaymentMethodId && currentStep === (isBuyNow ? 2 : 3))
                }
              >
                {currentStep === 3 || (isBuyNow && currentStep === 2) ? "Place Order" : "Continue"}
              </button>
            </div>
          </div>
          <div className="lg:w-1/3">
            {(currentStep === 1 || (currentStep === 2 && !isBuyNow) || currentStep === 3) && (
              <OrderSummary
                items={items}
                subtotal={subtotal}
                shipping={shipping}
                total={total}
                updateQuantity={updateQuantity}
                handleRemoveItem={handleRemoveItem}
                isSidebar={true}
              />
            )}
            {showOrderSummarySidebar && (
              <OrderSummary
                items={items}
                subtotal={subtotal}
                shipping={shipping}
                total={total}
                isSidebar={true}
              />
            )}
          </div>
        </div>
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
