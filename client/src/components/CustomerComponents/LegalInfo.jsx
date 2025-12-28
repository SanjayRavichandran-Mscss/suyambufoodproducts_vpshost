// client/src/components/CustomerComponents/PrivacyPolicy.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Header from "./Header";
import Footer from "./Footer";
import CustomerLogin from "../Authentication/CustomerLogin";
import CustomerRegister from "../Authentication/CustomerRegister";
import Cart from "./Cart";
import MyOrders from "./MyOrders";

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const [customerData, setCustomerData] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states for side panels
  const [showAuthModal, setShowAuthModal] = useState(null); // "login" | "register" | null
  const [modalAnimation, setModalAnimation] = useState("");
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartAnimation, setCartAnimation] = useState("");
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [ordersAnimation, setOrdersAnimation] = useState("");

  const customerId = localStorage.getItem("customerId");

  const showMessage = (msg, icon = "success") => {
    Swal.fire({
      text: msg,
      icon,
      toast: true,
      position: "bottom-end",
      timer: 2000,
      showConfirmButton: false,
      timerProgressBar: false,
      showClass: {
        popup: "animate__animated animate__slideInUp",
      },
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    const storedCustomerId = localStorage.getItem("customerId");

    if (!token || !storedCustomerId) {
      setLoading(false);
      return;
    }

    const verifyCustomer = async () => {
      try {
        const response = await axios.get(
          `https://suyambufoods.com/api/customer/profile?customerId=${storedCustomerId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCustomerData(response.data);
        await fetchCart();
      } catch (err) {
        console.error("Failed to verify customer:", err);
        localStorage.removeItem("customerToken");
        localStorage.removeItem("customerId");
        navigate("/", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    verifyCustomer();
  }, [navigate]);

  const fetchCart = async () => {
    if (!customerId) return;
    const token = localStorage.getItem("customerToken");
    if (!token) return;

    try {
      const response = await axios.get(
        `https://suyambufoods.com/api/customer/cart?customerId=${customerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      showMessage(`Failed to fetch cart: ${err.response?.data?.error || err.message}`, "error");
    }
  };

  // Header button handlers
  const handleLoginClick = () => {
    setModalAnimation("slide-in");
    setShowAuthModal("login");
  };

  const handleRegisterClick = () => {
    setModalAnimation("slide-in");
    setShowAuthModal("register");
  };

  const handleCartClick = () => {
    if (!customerData) {
      handleLoginClick();
      return;
    }
    setCartAnimation("slide-in");
    setShowCartModal(true);
  };

  const handleOrdersClick = () => {
    if (!customerData) {
      handleLoginClick();
      return;
    }
    setOrdersAnimation("slide-in");
    setShowOrdersModal(true);
  };

  // Close handlers
  const closeAuthModal = () => {
    setModalAnimation("slide-out");
    setTimeout(() => {
      setShowAuthModal(null);
      setModalAnimation("");
    }, 300);
  };

  const closeCartModal = () => {
    setCartAnimation("slide-out");
    setTimeout(() => {
      setShowCartModal(false);
      setCartAnimation("");
    }, 300);
  };

  const closeOrdersModal = () => {
    setOrdersAnimation("slide-out");
    setTimeout(() => {
      setShowOrdersModal(false);
      setOrdersAnimation("");
    }, 300);
  };

  const switchToRegister = () => {
    setModalAnimation("fade-out");
    setTimeout(() => {
      setShowAuthModal("register");
      setModalAnimation("fade-in");
    }, 300);
  };

  const switchToLogin = () => {
    setModalAnimation("fade-out");
    setTimeout(() => {
      setShowAuthModal("login");
      setModalAnimation("fade-in");
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header
        customerData={customerData}
        onLoginClick={handleLoginClick}
        onRegisterClick={handleRegisterClick}
        cartItems={cartItems}
        customerId={customerId}
        fetchCart={fetchCart}
        onCartClick={handleCartClick}
        onOrdersClick={handleOrdersClick}
        onSearch={() => {}}
        selectedCategory=""
        onCategorySelect={() => {}}
        onResetCategory={() => {}}
      />

      <main className="flex-1 pt-20">
        {/* Hero Banner */}
        <section className="relative bg-white overflow-hidden">
          <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-extrabold text-[#3D2F23] mb-4">
                Legal Informations
              </h1>
              <nav className="flex items-center justify-center gap-4 text-sm text-[#B6895B]">
                <a href="/" className="hover:underline">Home</a>
                <span className="text-gray-400">/</span>
                <span className="font-medium">Legal Informations</span>
              </nav>
            </div>
          </div>
        </section>

        {/* Privacy Policy */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-gray-700 space-y-10 leading-relaxed">
              <p className="text-center text-gray-600 italic">
                Last updated: December 28, 2025
              </p>

              <p>
                Suyambu Food Products is committed to safeguarding your privacy and ensuring that your personal information remains protected. This Privacy Policy outlines how we collect, store, and use your data when you interact with our website or make a purchase.
              </p>

              <div>
                <h2 className="text-2xl font-bold text-[#4E7E37] mb-4">1. Information We Collect</h2>
                <p>We may collect the following information from you:</p>
                <ul className="list-disc pl-8 mt-4 space-y-2">
                  <li>Personal details such as name, email address, phone number, and delivery address.</li>
                  <li>Payment information during transactions, processed securely through Razorpay.</li>
                  <li>Usage data including browser type, device information, and pages visited (collected via analytics tools).</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-[#4E7E37] mb-4">2. Use of Information</h2>
                <p>Your information is used for the following purposes:</p>
                <ul className="list-disc pl-8 mt-4 space-y-2">
                  <li>To process, confirm, and deliver your orders efficiently.</li>
                  <li>To communicate with you regarding your order status or support inquiries.</li>
                  <li>To improve our website, services, and user experience.</li>
                  <li>To send you promotional offers or product updates (only if you opt in).</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-[#4E7E37] mb-4">3. Data Protection and Security</h2>
                <p>
                  We employ industry-standard security measures to ensure the safety of your personal data. All payment transactions are encrypted and processed via Razorpay’s secure gateway. We do not store or access your full payment card information.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-[#4E7E37] mb-4">4. Disclosure of Information</h2>
                <p>
                  We do not sell, trade, or rent customer information to third parties. Information may only be shared with trusted partners or courier agencies for order fulfillment purposes.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-[#4E7E37] mb-4">5. Your Consent</h2>
                <p>
                  By using our website, you consent to the collection and use of your information as described in this policy.
                </p>
              </div>

              <p className="font-medium text-gray-900 text-center pt-6 border-t border-gray-200">
                For any privacy-related concerns, please contact us at{" "}
                <a href="mailto:suyambufoodcare@gmail.com" className="text-[#B6895B] hover:underline">
                  suyambufoodcare@gmail.com
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Refund & Replacement Policy */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-[#3D2F23] text-center mb-12">
              Refund & Replacement Policy
            </h2>
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-gray-700 space-y-10 leading-relaxed">
              <p>
                At Suyambu Food Products, we strive to maintain the highest standards of quality, hygiene, and customer satisfaction. Every product that leaves our facility undergoes multiple quality checks to ensure it reaches you in the best possible condition.
              </p>
              <p>
                However, due to the nature of our products, returns are not accepted once the items are delivered. This policy is in place to maintain food safety and hygiene standards for all our customers.
              </p>

              <div>
                <h3 className="text-2xl font-bold text-[#4E7E37] mb-4">1. Replacement Eligibility</h3>
                <p>In the unlikely event that a product reaches you in a damaged, defective, or incorrect condition, you may request a replacement.</p>
                <p className="mt-3">To qualify for a replacement:</p>
                <ul className="list-disc pl-8 mt-3 space-y-2">
                  <li>You must raise a request within 7 days of receiving the product.</li>
                  <li>The item must be in its original packaging, unused, and accompanied by proof of purchase.</li>
                  <li>Supporting images or videos showing the product issue must be shared via email at <a href="mailto:suyambufoodcare@gmail.com" className="text-[#B6895B] hover:underline">suyambufoodcare@gmail.com</a>.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-[#4E7E37] mb-4">2. Replacement Process</h3>
                <p>
                  Once your replacement request is received, our quality team will review the evidence and verify the claim. If approved, a replacement product will be dispatched within 3–5 working days, subject to availability. If the item is out of stock, we may issue a store credit or alternative product based on your preference.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-[#4E7E37] mb-4">3. Non-Eligibility</h3>
                <ul className="list-disc pl-8 space-y-2">
                  <li>Products damaged due to misuse, improper handling, or storage after delivery.</li>
                  <li>Items reported after the 7-day period.</li>
                  <li>Edible products that have been opened or used.</li>
                </ul>
              </div>

              <p className="font-medium text-gray-900 pt-6 border-t border-gray-200">
                For all replacement-related concerns, please contact:<br />
                Email: <a href="mailto:suyambufoodcare@gmail.com" className="text-[#B6895B] hover:underline">suyambufoodcare@gmail.com</a><br />
                Phone: 9345872342 (Available 10 AM – 6 PM, every day)
              </p>
            </div>
          </div>
        </section>

        {/* Shipping Policy */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-[#3D2F23] text-center mb-12">
              Shipping Policy
            </h2>
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-gray-700 space-y-10 leading-relaxed">
              <p>
                At Suyambu Food Products, we ensure that your orders are processed and delivered safely, promptly, and efficiently. This Shipping Policy explains our dispatch, delivery, and handling process.
              </p>

              {[
                { title: "1. Service Coverage", content: "We currently deliver to all locations across India through reliable courier and logistics partners." },
                { title: "2. Order Processing Time", content: "Orders are processed within 1–2 business days after confirmation of payment. Orders placed on Sundays or public holidays will be processed the next working day." },
                { title: "3. Delivery Timeline", content: "Delivery usually takes 3–7 business days, depending on your location and courier service availability. Remote areas may experience slightly longer delivery times." },
                { title: "4. Shipping Charges", content: "Shipping costs are calculated during checkout based on the order weight and delivery location. We occasionally offer free shipping on eligible promotional orders." },
                { title: "5. Order Tracking", content: "Once your order is shipped, a tracking ID and courier link will be shared via email or SMS. Customers are encouraged to monitor shipment progress using the provided details." },
                { title: "6. Damaged or Missing Products", content: (
                  <>
                    If your package is damaged, tampered with, or missing items upon delivery:
                    <ul className="list-disc pl-8 mt-3 space-y-2">
                      <li>Please contact our support team within 48 hours of receiving the order.</li>
                      <li>Provide clear photos or unboxing videos to support your claim.</li>
                      <li>After verification, we will issue a replacement or store credit as applicable.</li>
                    </ul>
                  </>
                )},
                { title: "7. Undeliverable Orders", content: "If a delivery attempt fails due to an incorrect address or unavailability of the recipient, the order may be returned to us. In such cases, customers may bear additional re-shipping costs." },
              ].map((item, idx) => (
                <div key={idx}>
                  <h3 className="text-2xl font-bold text-[#4E7E37] mb-4">{item.title}</h3>
                  <p>{item.content}</p>
                </div>
              ))}

              <p className="font-medium text-gray-900 pt-6 border-t border-gray-200">
                For shipping-related queries, reach us at:<br />
                Email: <a href="mailto:suyambufoodcare@gmail.com" className="text-[#B6895B] hover:underline">suyambufoodcare@gmail.com</a><br />
                Phone: 9345872342 (10 AM – 6 PM, all days)
              </p>
            </div>
          </div>
        </section>

        {/* Terms and Conditions */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-[#3D2F23] text-center mb-12">
              Terms and Conditions
            </h2>
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-gray-700 space-y-10 leading-relaxed">
              <p>
                Welcome to Suyambu Food Products. These Terms and Conditions govern your use of our website and the purchase of our products. By accessing or placing an order through our website, you agree to comply with the following terms:
              </p>

              {[
                { title: "1. General", content: "This website is owned and operated by Suyambu Food Products, located in Sirumugai, Mettupalayam Taluk, Coimbatore, Tamil Nadu (PIN – 641302). We reserve the right to modify or update these Terms at any time without prior notice." },
                { title: "2. Product Information", content: "We make every effort to ensure the accuracy of product descriptions, pricing, and images. However, minor variations in packaging or appearance may occur due to product updates or availability." },
                { title: "3. Order and Payment", content: "All orders are confirmed only upon successful payment through Razorpay. Cash on Delivery (COD) is not accepted. We reserve the right to cancel any order in case of technical errors, pricing issues, or non-availability." },
                { title: "4. Shipping and Delivery", content: "We ship all over India using trusted courier partners. Delivery timelines vary by location and are provided at checkout." },
                { title: "5. Replacement Policy", content: "Replacements are accepted within 7 days only for defective or damaged items. Please refer to our Refund and Replacement Policy for details." },
                { title: "6. Intellectual Property", content: "All trademarks, logos, text, and content on this website are the property of Suyambu Food Products. Unauthorized reproduction or use of any material is strictly prohibited." },
                { title: "7. Limitation of Liability", content: "Suyambu Food Products shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services." },
                { title: "8. Governing Law", content: "These Terms are governed by the laws of India and subject to the jurisdiction of courts in Coimbatore, Tamil Nadu." },
              ].map((item, idx) => (
                <div key={idx}>
                  <h3 className="text-2xl font-bold text-[#4E7E37] mb-4">{item.title}</h3>
                  <p>{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Authentication Side Panel */}
      {showAuthModal && (
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-300 ${
            modalAnimation.includes("in") ? "bg-black/30 backdrop-blur-sm" : "bg-transparent"
          } ${modalAnimation.includes("in") ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={closeAuthModal}
        >
          <div
            className={`absolute right-0 top-0 h-full w-full sm:w-96 md:w-4/5 lg:w-3/5 xl:w-2/5 bg-white shadow-2xl transform transition-transform duration-300 ${
              modalAnimation === "slide-in" || modalAnimation === "fade-in" ? "translate-x-0" : "translate-x-full"
            } overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full flex flex-col">
              <div className={`transition-opacity duration-300 ${modalAnimation.includes("fade") ? (modalAnimation === "fade-in" ? "opacity-100" : "opacity-0") : "opacity-100"}`}>
                {showAuthModal === "login" ? (
                  <CustomerLogin onRegisterClick={switchToRegister} onClose={closeAuthModal} />
                ) : (
                  <CustomerRegister onLoginClick={switchToLogin} onClose={closeAuthModal} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Side Panel */}
      {showCartModal && customerData && (
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-300 ${
            cartAnimation === "slide-in" ? "bg-black/30 backdrop-blur-sm" : "bg-transparent"
          } ${cartAnimation === "slide-in" ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={closeCartModal}
        >
          <div
            className={`absolute right-0 top-0 h-full w-full sm:w-96 md:w-4/5 lg:w-3/5 xl:w-2/5 bg-white shadow-2xl transform transition-transform duration-300 ${
              cartAnimation === "slide-in" ? "translate-x-0" : "translate-x-full"
            } overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <Cart
              customerId={customerId}
              cartItems={cartItems}
              updateQuantity={() => fetchCart()}
              handleRemoveItem={() => fetchCart()}
              handleCloseCart={closeCartModal}
            />
          </div>
        </div>
      )}

      {/* Orders Side Panel */}
      {showOrdersModal && customerData && (
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-300 ${
            ordersAnimation === "slide-in" ? "bg-black/30 backdrop-blur-sm" : "bg-transparent"
          } ${ordersAnimation === "slide-in" ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={closeOrdersModal}
        >
          <div
            className={`absolute right-0 top-0 h-full w-full sm:w-96 md:w-4/5 lg:w-3/5 xl:w-2/5 bg-white shadow-2xl transform transition-transform duration-300 ${
              ordersAnimation === "slide-in" ? "translate-x-0" : "translate-x-full"
            } overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <MyOrders
              customerId={customerId}
              handleCloseOrders={closeOrdersModal}
            />
          </div>
        </div>
      )}
    </div>
  );
}