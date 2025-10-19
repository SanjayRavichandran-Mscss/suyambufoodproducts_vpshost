// client/src/components/CustomerComponents/ContactUs.jsx
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

function decodeCustomerId(encodedId) {
  try {
    return atob(encodedId);
  } catch {
    console.error("Error decoding customerId:", encodedId);
    return null;
  }
}

export default function ContactUs() {
  const navigate = useNavigate();
  const [customerData, setCustomerData] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(null);
  const [modalAnimation, setModalAnimation] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartAnimation, setCartAnimation] = useState("");
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [ordersAnimation, setOrdersAnimation] = useState("");
  const [loading, setLoading] = useState(true);

  // Contact form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const customerId = localStorage.getItem("customerId");

  const showMessage = (msg, icon = "success") => {
    Swal.fire({
      text: msg,
      icon: icon,
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
          `https://suyambufoods.com/customer/profile?customerId=${storedCustomerId}`,
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
        `https://suyambufoods.com/customer/cart?customerId=${customerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      showMessage(`Failed to fetch cart: ${err.response?.data?.error || err.message}`, "error");
    }
  };

  const handleLoginClick = () => {
    setModalAnimation("slide-in");
    setShowAuthModal("login");
  };

  const handleRegisterClick = () => {
    setModalAnimation("slide-in");
    setShowAuthModal("register");
  };

  const handleCloseModal = () => {
    setModalAnimation("slide-out");
    setTimeout(() => {
      setShowAuthModal(null);
      setModalAnimation("");
    }, 300);
  };

  const handleAuthSwitch = (mode) => {
    setModalAnimation("fade-out");
    setTimeout(() => {
      setShowAuthModal(mode);
      setModalAnimation("fade-in");
    }, 300);
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
    }, 300);
  };

  const handleOrdersClick = () => {
    setOrdersAnimation("slide-in");
    setShowOrdersModal(true);
  };

  const handleCloseOrders = () => {
    setOrdersAnimation("slide-out");
    setTimeout(() => {
      setShowOrdersModal(false);
      setOrdersAnimation("");
    }, 300);
  };

  const updateQuantity = async (variantId, change) => {
    const item = cartItems.find((item) => String(item.product_variant_id) === String(variantId));
    if (!item) return;
    const newQuantity = Math.max(1, item.quantity + change);
    const token = localStorage.getItem("customerToken");
    try {
      await axios.put(
        "https://suyambufoods.com/customer/cart",
        { customerId, variantId, quantity: newQuantity },
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      );
      await fetchCart();
      showMessage("Cart updated successfully");
    } catch (err) {
      console.error("Failed to update quantity:", err);
      showMessage(`Failed to update quantity: ${err.response?.data?.error || err.message}`, "error");
    }
  };

  const handleRemoveItem = async (variantId) => {
    if (!customerId) return;
    const token = localStorage.getItem("customerToken");
    try {
      await axios.delete(
        `https://suyambufoods.com/customer/cart?customerId=${customerId}&variantId=${variantId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCart();
      showMessage("Item removed from cart successfully");
    } catch (err) {
      console.error("Failed to remove item:", err);
      showMessage(`Failed to remove item: ${err.response?.data?.error || err.message}`, "error");
    }
  };

  // Contact form handlers
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(""); // Clear previous messages

    try {
      const response = await axios.post("https://suyambufoods.com/customer/contact", formData, {
        headers: { "Content-Type": "application/json" },
      });
      setSubmitMessage(response.data.message);
      setFormData({ name: "", email: "", message: "" }); // Reset form
    } catch (error) {
      setSubmitMessage(
        error.response?.data?.message || "Failed to send message. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
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
        onCartClick={handleCartClick}
        onOrdersClick={handleOrdersClick}
        onSearch={() => {}} // No search functionality on contact page
        selectedCategory=""
        onCategorySelect={() => {}}
        onResetCategory={() => {}}
      />
      <main className="flex-1 pt-20">
        {/* Hero Banner Section */}
        <section className="relative bg-white overflow-hidden">
          <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-extrabold text-[#3D2F23] mb-4">
                Contact
              </h1>
              <nav className="flex justify-center items-center gap-4 text-sm text-[#B6895B]">
                <a href="/" className="hover:underline">Home</a>
                <span className="text-gray-400">/</span>
                <span className="font-medium">Contact</span>
              </nav>
            </div>
          </div>
        </section>

        {/* Contact Information Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-[#3D2F23] mb-6">
                  CONTACT INFORMATION
                </h2>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="bg-[#B6895B] text-white rounded-full p-2 mt-1">
                        📍
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-900">Address</h3>
                        <p className="text-gray-700">
                          82C5+97M, Mettupalayam<br />
                          Tamil Nadu 641302
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="bg-[#B6895B] text-white rounded-full p-2 mt-1">
                        ✉️
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-900">Email</h3>
                        <p className="text-gray-700">suyambufoodstores@gmail.com</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="bg-[#B6895B] text-white rounded-full p-2 mt-1">
                        📱
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-900">Phone</h3>
                        <p className="text-gray-700">+91 9345872342</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <a
                    href="https://www.instagram.com/suyambufoodstores"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#E4405F] text-white p-3 rounded-full hover:bg-[#D63447] transition-colors"
                    aria-label="Instagram"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4.01-1.801-4.01-4.01 0-2.209 1.801-4.01 4.01-4.01s4.01 1.801 4.01 4.01c0 2.209-1.801 4.01-4.01 4.01zm6.406-11.845c-.796 0-1.44-.644-1.44-1.44s.644-1.44 1.44-1.44 1.44.644 1.44 1.44c0 .796-.644 1.44-1.44 1.44z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.facebook.com/suyambufoodstores"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#1877F2] text-white p-3 rounded-full hover:bg-[#166FE5] transition-colors"
                    aria-label="Facebook"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-11.999-12-12s-12 5.372-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                </div>
              </div>
              {/* Google Map Embed */}
              <div className="rounded-xl overflow-hidden shadow-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3909.5!2d77.008161!3d11.3209746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba8ef002198fd89%3A0xb8321f0e9af0aeac!2sSuyambu%20Food%20Store!5e0!3m2!1sen!2sin!4v1729347200000!5m2!1sen!2sin"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Suyambu Food Store Location"
                ></iframe>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-[#3D2F23] text-center mb-12">
                CONTACT FORM
              </h2>
              {submitMessage && (
                <div className={`mb-4 p-4 rounded-lg text-center ${
                  submitMessage.includes('Thank you') || submitMessage.includes('successfully')
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {submitMessage}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B6895B] focus:border-transparent disabled:bg-gray-100"
                      placeholder="Your Name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B6895B] focus:border-transparent disabled:bg-gray-100"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B6895B] focus:border-transparent resize-none disabled:bg-gray-100"
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#3D2F23] text-white py-4 px-8 rounded-lg font-semibold hover:bg-[#2C241A] transition-colors ease-in-out duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "SUBMIT"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {showAuthModal && (
        <div
          className={`fixed inset-0 backdrop-blur-2xl flex z-50 transition-opacity duration-300 ${
            modalAnimation.includes("in") ? "opacity-100" : "opacity-0"
          }`}
          onClick={handleCloseModal}
        >
          <div
            className={`ml-auto h-full w-full sm:w-96 bg-white shadow-xl transform transition-transform duration-300 custom-scrollbar ${
              modalAnimation === "slide-in"
                ? "translate-x-0"
                : modalAnimation === "slide-out"
                ? "translate-x-full"
                : "translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div
              className={`transition-opacity duration-300 ${
                modalAnimation === "fade-in"
                  ? "opacity-100"
                  : modalAnimation === "fade-out"
                  ? "opacity-0"
                  : "opacity-100"
              }`}
            >
              {showAuthModal === "login" ? (
                <CustomerLogin
                  onRegisterClick={() => handleAuthSwitch("register")}
                  onClose={handleCloseModal}
                />
              ) : (
                <CustomerRegister
                  onLoginClick={() => handleAuthSwitch("login")}
                  onClose={handleCloseModal}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {showCartModal && (
        <div className="fixed inset-0 backdrop-blur-2xl z-50 flex items-center justify-end p-4">
          <Cart
            customerId={customerId}
            cartItems={cartItems}
            updateQuantity={updateQuantity}
            handleRemoveItem={handleRemoveItem}
            handleCloseCart={handleCloseCart}
            showCartModal={showCartModal}
            cartAnimation={cartAnimation}
          />
        </div>
      )}

      {showOrdersModal && (
        <div className="fixed inset-0 backdrop-blur-2xl z-50 flex items-center justify-end p-4">
          <MyOrders
            customerId={customerId}
            handleCloseOrders={handleCloseOrders}
            showOrdersModal={showOrdersModal}
            ordersAnimation={ordersAnimation}
          />
        </div>
      )}

      <Footer />
    </div>
  );
}