// client/src/components/CustomerComponents/Aboutus.jsx
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

export default function AboutUs() {
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
        onSearch={() => {}} // No search functionality on about page
        selectedCategory=""
        onCategorySelect={() => {}}
        onResetCategory={() => {}}
      />
      <main className="flex-1 pt-20">
        {/* Hero Banner Section */}
        <section className="relative bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 py-16 md:py-20">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                About Suyambu Food Stores
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Committed to providing the purest, most nutritious oils using traditional methods since 2023
              </p>
              <nav className="flex justify-center items-center gap-3 text-sm text-gray-500">
                <a href="/" className="hover:text-[#B6895B] transition-colors">Home</a>
                <span className="text-gray-300">/</span>
                <span className="text-[#B6895B] font-medium">About</span>
              </nav>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-[#B6895B] font-medium mb-4">
                  <div className="w-8 h-px bg-[#B6895B]"></div>
                  OUR STORY
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                  Tradition Meets Quality
                </h2>
                <div className="text-gray-600 leading-relaxed space-y-4">
                  <p>
                    At Suyambu Food Stores, we believe everyone deserves access to the purest, 
                    most nutritious oils available. Founded in 2023, our mission is to provide 
                    customers with the highest quality oils extracted using traditional methods 
                    that preserve natural goodness.
                  </p>
                  <p>
                    We are passionate about the health benefits of oils and believe they are an 
                    essential part of a healthy diet. Our oils are cold-pressed, chemical-free, 
                    and unrefined, ensuring you get the best possible quality in every bottle.
                  </p>
                  <p>
                    From cooking and salad dressings to skincare routines, we offer a wide variety 
                    of oils to meet your specific needs. Each product is carefully selected and 
                    processed to maintain its natural nutritional value.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gray-100 rounded-xl overflow-hidden shadow-lg">
                  <img
                    src="https://via.placeholder.com/600x500/FAF9F6/3D2F23?text=Traditional+Oil+Extraction"
                    alt="Traditional oil extraction process"
                    className="w-full h-80 object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#B6895B]/10 rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Who Are We Section */}
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="bg-gray-100 rounded-xl overflow-hidden shadow-lg">
                  <img
                    src="https://via.placeholder.com/600x400/FAF9F6/3D2F23?text=Our+Team+&+Process"
                    alt="Our team and production process"
                    className="w-full h-80 object-cover"
                  />
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 text-[#B6895B] font-medium mb-4">
                  <div className="w-8 h-px bg-[#B6895B]"></div>
                  WHO ARE WE?
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                  Passionate About Purity
                </h2>
                <div className="text-gray-600 leading-relaxed space-y-4 mb-8">
                  <p>
                    We are a dedicated team of passionate individuals committed to providing 
                    exceptional quality oils. Our expertise lies in sourcing from sustainable 
                    farms and using traditional extraction methods that preserve the natural 
                    essence of each ingredient.
                  </p>
                  <p>
                    Every product we offer is cold-pressed, chemical-free, and unrefined, 
                    ensuring you receive oils in their purest form. We maintain strict quality 
                    control at every stage of our process.
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      <img
                        src="https://via.placeholder.com/80x80/FAF9F6/3D2F23?text=🌿"
                        alt="Cold Pressed Oils"
                        className="w-16 h-16 object-cover rounded-lg mx-auto mb-2"
                      />
                      <p className="text-sm font-medium text-gray-900">Cold Pressed</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      <img
                        src="https://via.placeholder.com/80x80/FAF9F6/3D2F23?text=🌱"
                        alt="Chemical Free"
                        className="w-16 h-16 object-cover rounded-lg mx-auto mb-2"
                      />
                      <p className="text-sm font-medium text-gray-900">Chemical Free</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      <img
                        src="https://via.placeholder.com/80x80/FAF9F6/3D2F23?text=🏭"
                        alt="Traditional Methods"
                        className="w-16 h-16 object-cover rounded-lg mx-auto mb-2"
                      />
                      <p className="text-sm font-medium text-gray-900">Traditional</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission Section */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-[#B6895B] font-medium mb-4">
                  <div className="w-8 h-px bg-[#B6895B]"></div>
                  OUR MISSION
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                  Quality You Can Trust
                </h2>
                <div className="text-gray-600 leading-relaxed space-y-4">
                  <p>
                    Our mission is to provide customers with the purest, most nutritious oils 
                    that contribute to their health and well-being. We ensure every product 
                    meets our stringent quality standards through traditional extraction methods.
                  </p>
                  <p>
                    We offer a diverse range of oils carefully selected for different needs - 
                    whether for cooking, salad dressings, or skincare. Each product is backed 
                    by our commitment to purity and quality.
                  </p>
                  <p>
                    Customer satisfaction is at the heart of everything we do. From fast shipping 
                    to knowledgeable support, we strive to make your experience with us exceptional.
                  </p>
                  <p className="font-medium text-gray-900">
                    We believe everyone deserves access to high-quality, nutritious oils, and 
                    we are dedicated to making that a reality.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-4 mt-8">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2">
                    <div className="w-2 h-2 bg-[#B6895B] rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Quality Guarantee</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2">
                    <div className="w-2 h-2 bg-[#B6895B] rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Sustainable Sourcing</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2">
                    <div className="w-2 h-2 bg-[#B6895B] rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Traditional Methods</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gray-100 rounded-xl overflow-hidden shadow-lg">
                  <img
                    src="https://via.placeholder.com/600x500/FAF9F6/3D2F23?text=Quality+Products"
                    alt="Our quality products collection"
                    className="w-full h-80 object-cover"
                  />
                </div>
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-[#B6895B]/10 rounded-full"></div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-[#B6895B]/5 rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 text-[#B6895B] font-medium mb-4">
                <div className="w-8 h-px bg-[#B6895B]"></div>
                OUR VALUES
                <div className="w-8 h-px bg-[#B6895B]"></div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                What Drives Us
              </h2>
              <p className="text-gray-600">
                Core principles that guide everything we do at Suyambu Food Stores
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                <div className="w-12 h-12 bg-[#B6895B]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-[#B6895B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Quality Assurance</h3>
                <p className="text-gray-600 text-sm">
                  Every product undergoes strict quality checks to ensure purity and nutritional value.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                <div className="w-12 h-12 bg-[#B6895B]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-[#B6895B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Customer Care</h3>
                <p className="text-gray-600 text-sm">
                  Dedicated support and satisfaction guarantee on all our products and services.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                <div className="w-12 h-12 bg-[#B6895B]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-[#B6895B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Sustainability</h3>
                <p className="text-gray-600 text-sm">
                  Committed to sustainable farming practices and environmentally responsible production.
                </p>
              </div>
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