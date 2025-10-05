import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Header from "../components/CustomerComponents/Header";
import Banner from "../components/CustomerComponents/Banner";
import Products from "../components/CustomerComponents/Products";
import SingleProduct from "../components/CustomerComponents/SingleProduct";
import Footer from "../components/CustomerComponents/Footer";
import CustomerLogin from "../components/Authentication/CustomerLogin";
import CustomerRegister from "../components/Authentication/CustomerRegister";
import Cart from "../components/CustomerComponents/Cart";
import MyOrders from "../components/CustomerComponents/MyOrders";

function decodeCustomerId(encodedId) {
  try {
    return atob(encodedId);
  } catch {
    console.error("Error decoding customerId:", encodedId);
    return null;
  }
}

function decodeProductId(encodedId) {
  try {
    const decoded = atob(encodedId);
    const idNum = parseInt(decoded, 10);
    if (isNaN(idNum)) {
      throw new Error("Invalid product ID");
    }
    return idNum.toString();
  } catch {
    console.error("Error decoding productId:", encodedId);
    return null;
  }
}

export default function CustomerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const encodedCustomerId = searchParams.get("customerId");
  const encodedProductId = searchParams.get("productId");
  const customerId = encodedCustomerId ? decodeCustomerId(encodedCustomerId) : null;
  const productId = encodedProductId ? decodeProductId(encodedProductId) : null;

  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(null);
  const [modalAnimation, setModalAnimation] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartAnimation, setCartAnimation] = useState("");
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [ordersAnimation, setOrdersAnimation] = useState("");
  const [headerSearch, setHeaderSearch] = useState("");

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

    // --- MODIFICATION START ---
    // If there's no token or customer ID, the user is a guest.
    // Allow them to view the page without any redirects and stop loading.
    if (!token || !storedCustomerId) {
      setVerified(true);
      setLoading(false);
      return; // Stop further execution for guests.
    }
    // --- MODIFICATION END ---

    // The rest of this effect only runs for LOGGED-IN users
    // First, ensure the customerId in the URL matches the one in storage
    if (encodedCustomerId) {
      const decodedId = decodeCustomerId(encodedCustomerId);
      if (decodedId !== storedCustomerId) {
        const params = new URLSearchParams(location.search);
        params.set("customerId", btoa(storedCustomerId));
        navigate(`${location.pathname}?${params.toString()}`, { replace: true });
        return;
      }
    } else {
      const params = new URLSearchParams(location.search);
      params.set("customerId", btoa(storedCustomerId));
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
      return;
    }

    // Once the URL is correct, verify the user and fetch their data
    const verifyCustomer = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/customer/profile?customerId=${storedCustomerId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              Origin: "http://localhost:5173",
            },
          }
        );
        setCustomerData(response.data);
        setVerified(true);
        await fetchCart();
        await fetchWishlist();
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
  }, [encodedCustomerId, navigate, location.pathname, location.search]);

  const fetchCart = async () => {
    if (!customerId) return [];
    try {
      const response = await axios.get(
        `http://localhost:5000/api/customer/cart?customerId=${customerId}`,
        { headers: { Origin: "http://localhost:5173" } }
      );
      setCartItems(Array.isArray(response.data) ? response.data : []);
      return response.data || [];
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      showMessage(`Failed to fetch cart: ${err.response?.data?.error || err.message}`, "error");
      return [];
    }
  };

  const fetchWishlist = async () => {
    if (!customerId) return;
    try {
      const response = await axios.get(
        `http://localhost:5000/api/customer/wishlist?customerId=${customerId}`,
        { headers: { Origin: "http://localhost:5173" } }
      );
      setWishlist(
        Array.isArray(response.data)
          ? response.data.filter((item) => item.is_liked === 1).map((item) => item.product_id)
          : []
      );
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    }
  };

  const handleToggleWishlist = async (productId) => {
    if (!customerData) {
        showMessage("Please login to manage your wishlist", "warning");
        return;
    }
    try {
      const response = await axios.post(
        "http://localhost:5000/api/customer/wishlist",
        { customerId, productId },
        { headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" } }
      );
      if (response.data.is_liked === 1) {
        setWishlist((prev) => [...prev, productId]);
      } else {
        setWishlist((prev) => prev.filter((id) => id !== productId));
      }
      showMessage(response.data.message);
    } catch (err) {
      console.error("Failed to toggle wishlist:", err);
      showMessage(`Failed to toggle wishlist: ${err.response?.data?.error || err.message}`, "error");
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
    try {
      await axios.put(
        "http://localhost:5000/api/customer/cart",
        { customerId, variantId, quantity: newQuantity },
        { headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" } }
      );
      const updatedCart = await fetchCart();
      setCartItems(updatedCart);
      showMessage("Cart updated successfully");
    } catch (err) {
      console.error("Failed to update quantity:", err);
      showMessage(`Failed to update quantity: ${err.response?.data?.error || err.message}`, "error");
    }
  };

  const handleRemoveItem = async (variantId) => {
    if (!customerId) return;
    try {
      await axios.delete(
        `http://localhost:5000/api/customer/cart?customerId=${customerId}&variantId=${variantId}`,
        { headers: { Origin: "http://localhost:5173" } }
      );
      const updatedCart = await fetchCart();
      setCartItems(updatedCart);
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
          <p className="mt-4 text-gray-600">Loading fresh groceries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col custom-scrollbar">
      <Header
        customerData={customerData}
        onLoginClick={handleLoginClick}
        onRegisterClick={handleRegisterClick}
        cartItems={cartItems}
        customerId={customerId}
        fetchCart={fetchCart}
        onCartClick={handleCartClick}
        onOrdersClick={handleOrdersClick}
        onSearch={(query) => setHeaderSearch(query)}
      />
      <main className="flex-1 bg-gray-50 pt-20">
        {productId ? (
          <div className="md:px-8">
            <SingleProduct
              productId={productId}
              isLoggedIn={!!customerData}
              customerId={customerId}
              cartItems={cartItems}
              fetchCart={fetchCart}
              wishlist={wishlist}
              handleToggleWishlist={handleToggleWishlist}
              showMessage={showMessage}
            />
          </div>
        ) : (
          <>
            <Banner />
            <div className="md:px-8">
              <Products
                isLoggedIn={!!customerData}
                customerId={customerId}
                cartItems={cartItems}
                setCartItems={setCartItems}
                fetchCart={fetchCart}
                wishlist={wishlist}
                handleToggleWishlist={handleToggleWishlist}
                showMessage={showMessage}
                headerSearchTerm={headerSearch}
              />
            </div>
          </>
        )}
      </main>

      {showAuthModal && (
        <div
          className={`fixed inset-0 bg-opacity-50 flex z-50 transition-opacity duration-300 ${
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

      {showOrdersModal && (
        <MyOrders
          customerId={customerId}
          handleCloseOrders={handleCloseOrders}
          showOrdersModal={showOrdersModal}
          ordersAnimation={ordersAnimation}
        />
      )}

      <Footer />
    </div>
  );
}
