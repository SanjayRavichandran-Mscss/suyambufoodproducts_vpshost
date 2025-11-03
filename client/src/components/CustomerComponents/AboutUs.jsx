// // client/src/components/CustomerComponents/Aboutus.jsx
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import Swal from "sweetalert2";
// import Header from "./Header";
// import Footer from "./Footer";
// import CustomerLogin from "../Authentication/CustomerLogin";
// import CustomerRegister from "../Authentication/CustomerRegister";
// import Cart from "./Cart";
// import MyOrders from "./MyOrders";

// function decodeCustomerId(encodedId) {
//   try {
//     return atob(encodedId);
//   } catch {
//     console.error("Error decoding customerId:", encodedId);
//     return null;
//   }
// }

// export default function AboutUs() {
//   const navigate = useNavigate();
//   const [customerData, setCustomerData] = useState(null);
//   const [showAuthModal, setShowAuthModal] = useState(null);
//   const [modalAnimation, setModalAnimation] = useState("");
//   const [cartItems, setCartItems] = useState([]);
//   const [showCartModal, setShowCartModal] = useState(false);
//   const [cartAnimation, setCartAnimation] = useState("");
//   const [showOrdersModal, setShowOrdersModal] = useState(false);
//   const [ordersAnimation, setOrdersAnimation] = useState("");
//   const [loading, setLoading] = useState(true);

//   const customerId = localStorage.getItem("customerId");

//   const showMessage = (msg, icon = "success") => {
//     Swal.fire({
//       text: msg,
//       icon: icon,
//       toast: true,
//       position: "bottom-end",
//       timer: 2000,
//       showConfirmButton: false,
//       timerProgressBar: false,
//       showClass: {
//         popup: "animate__animated animate__slideInUp",
//       },
//     });
//   };

//   useEffect(() => {
//     const token = localStorage.getItem("customerToken");
//     const storedCustomerId = localStorage.getItem("customerId");

//     if (!token || !storedCustomerId) {
//       setLoading(false);
//       return;
//     }

//     const verifyCustomer = async () => {
//       try {
//         const response = await axios.get(
//           `https://suyambufoods.com/api/customer/profile?customerId=${storedCustomerId}`,
//           {
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         setCustomerData(response.data);
//         await fetchCart();
//       } catch (err) {
//         console.error("Failed to verify customer:", err);
//         localStorage.removeItem("customerToken");
//         localStorage.removeItem("customerId");
//         navigate("/", { replace: true });
//       } finally {
//         setLoading(false);
//       }
//     };
//     verifyCustomer();
//   }, [navigate]);

//   const fetchCart = async () => {
//     if (!customerId) return;
//     const token = localStorage.getItem("customerToken");
//     if (!token) return;

//     try {
//       const response = await axios.get(
//         `https://suyambufoods.com/api/customer/cart?customerId=${customerId}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setCartItems(Array.isArray(response.data) ? response.data : []);
//     } catch (err) {
//       console.error("Failed to fetch cart:", err);
//       showMessage(`Failed to fetch cart: ${err.response?.data?.error || err.message}`, "error");
//     }
//   };

//   const handleLoginClick = () => {
//     setModalAnimation("slide-in");
//     setShowAuthModal("login");
//   };

//   const handleRegisterClick = () => {
//     setModalAnimation("slide-in");
//     setShowAuthModal("register");
//   };

//   const handleCloseModal = () => {
//     setModalAnimation("slide-out");
//     setTimeout(() => {
//       setShowAuthModal(null);
//       setModalAnimation("");
//     }, 300);
//   };

//   const handleAuthSwitch = (mode) => {
//     setModalAnimation("fade-out");
//     setTimeout(() => {
//       setShowAuthModal(mode);
//       setModalAnimation("fade-in");
//     }, 300);
//   };

//   const handleCartClick = () => {
//     setCartAnimation("slide-in");
//     setShowCartModal(true);
//   };

//   const handleCloseCart = () => {
//     setCartAnimation("slide-out");
//     setTimeout(() => {
//       setShowCartModal(false);
//       setCartAnimation("");
//     }, 300);
//   };

//   const handleOrdersClick = () => {
//     setOrdersAnimation("slide-in");
//     setShowOrdersModal(true);
//   };

//   const handleCloseOrders = () => {
//     setOrdersAnimation("slide-out");
//     setTimeout(() => {
//       setShowOrdersModal(false);
//       setOrdersAnimation("");
//     }, 300);
//   };

//   const updateQuantity = async (variantId, change) => {
//     const item = cartItems.find((item) => String(item.product_variant_id) === String(variantId));
//     if (!item) return;
//     const newQuantity = Math.max(1, item.quantity + change);
//     const token = localStorage.getItem("customerToken");
//     try {
//       await axios.put(
//         "https://suyambufoods.com/api/customer/cart",
//         { customerId, variantId, quantity: newQuantity },
//         { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
//       );
//       await fetchCart();
//       showMessage("Cart updated successfully");
//     } catch (err) {
//       console.error("Failed to update quantity:", err);
//       showMessage(`Failed to update quantity: ${err.response?.data?.error || err.message}`, "error");
//     }
//   };

//   const handleRemoveItem = async (variantId) => {
//     if (!customerId) return;
//     const token = localStorage.getItem("customerToken");
//     try {
//       await axios.delete(
//         `https://suyambufoods.com/api/customer/cart?customerId=${customerId}&variantId=${variantId}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       await fetchCart();
//       showMessage("Item removed from cart successfully");
//     } catch (err) {
//       console.error("Failed to remove item:", err);
//       showMessage(`Failed to remove item: ${err.response?.data?.error || err.message}`, "error");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="flex flex-col items-center">
//           <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
//           <p className="mt-4 text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white flex flex-col">
//       <Header
//         customerData={customerData}
//         onLoginClick={handleLoginClick}
//         onRegisterClick={handleRegisterClick}
//         cartItems={cartItems}
//         onCartClick={handleCartClick}
//         onOrdersClick={handleOrdersClick}
//         onSearch={() => {}} // No search functionality on about page
//         selectedCategory=""
//         onCategorySelect={() => {}}
//         onResetCategory={() => {}}
//       />
//       <main className="flex-1 pt-20">
//         {/* Hero Banner Section */}
//         <section className="relative bg-white border-b border-gray-100">
//           <div className="container mx-auto px-4 py-16 md:py-20">
//             <div className="text-center max-w-3xl mx-auto">
//               <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
//                 About Suyambu Food Stores
//               </h1>
//               <p className="text-lg text-gray-600 mb-8">
//                 Committed to providing the purest, most nutritious oils using traditional methods since 2023
//               </p>
//               <nav className="flex justify-center items-center gap-3 text-sm text-gray-500">
//                 <a href="/" className="hover:text-[#B6895B] transition-colors">Home</a>
//                 <span className="text-gray-300">/</span>
//                 <span className="text-[#B6895B] font-medium">About</span>
//               </nav>
//             </div>
//           </div>
//         </section>

//         {/* Our Story Section */}
//         <section className="py-16 md:py-20 bg-white">
//           <div className="container mx-auto px-4">
//             <div className="grid lg:grid-cols-2 gap-12 items-center">
//               <div>
//                 <div className="inline-flex items-center gap-2 text-[#B6895B] font-medium mb-4">
//                   <div className="w-8 h-px bg-[#B6895B]"></div>
//                   OUR STORY
//                 </div>
//                 <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
//                   Tradition Meets Quality
//                 </h2>
//                 <div className="text-gray-600 leading-relaxed space-y-4">
//                   <p>
//                     At Suyambu Food Stores, we believe everyone deserves access to the purest, 
//                     most nutritious oils available. Founded in 2023, our mission is to provide 
//                     customers with the highest quality oils extracted using traditional methods 
//                     that preserve natural goodness.
//                   </p>
//                   <p>
//                     We are passionate about the health benefits of oils and believe they are an 
//                     essential part of a healthy diet. Our oils are cold-pressed, chemical-free, 
//                     and unrefined, ensuring you get the best possible quality in every bottle.
//                   </p>
//                   <p>
//                     From cooking and salad dressings to skincare routines, we offer a wide variety 
//                     of oils to meet your specific needs. Each product is carefully selected and 
//                     processed to maintain its natural nutritional value.
//                   </p>
//                 </div>
//               </div>
//               <div className="relative">
//                 <div className="bg-gray-100 rounded-xl overflow-hidden shadow-lg">
//                   <img
//                     src="https://via.placeholder.com/600x500/FAF9F6/3D2F23?text=Traditional+Oil+Extraction"
//                     alt="Traditional oil extraction process"
//                     className="w-full h-80 object-cover"
//                   />
//                 </div>
//                 <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#B6895B]/10 rounded-full"></div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Who Are We Section */}
//         <section className="py-16 md:py-20 bg-gray-50">
//           <div className="container mx-auto px-4">
//             <div className="grid lg:grid-cols-2 gap-12 items-center">
//               <div className="order-2 lg:order-1">
//                 <div className="bg-gray-100 rounded-xl overflow-hidden shadow-lg">
//                   <img
//                     src="https://via.placeholder.com/600x400/FAF9F6/3D2F23?text=Our+Team+&+Process"
//                     alt="Our team and production process"
//                     className="w-full h-80 object-cover"
//                   />
//                 </div>
//               </div>
//               <div className="order-1 lg:order-2">
//                 <div className="inline-flex items-center gap-2 text-[#B6895B] font-medium mb-4">
//                   <div className="w-8 h-px bg-[#B6895B]"></div>
//                   WHO ARE WE?
//                 </div>
//                 <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
//                   Passionate About Purity
//                 </h2>
//                 <div className="text-gray-600 leading-relaxed space-y-4 mb-8">
//                   <p>
//                     We are a dedicated team of passionate individuals committed to providing 
//                     exceptional quality oils. Our expertise lies in sourcing from sustainable 
//                     farms and using traditional extraction methods that preserve the natural 
//                     essence of each ingredient.
//                   </p>
//                   <p>
//                     Every product we offer is cold-pressed, chemical-free, and unrefined, 
//                     ensuring you receive oils in their purest form. We maintain strict quality 
//                     control at every stage of our process.
//                   </p>
//                 </div>
                
//                 <div className="grid grid-cols-3 gap-4">
//                   <div className="text-center">
//                     <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
//                       <img
//                         src="https://via.placeholder.com/80x80/FAF9F6/3D2F23?text=🌿"
//                         alt="Cold Pressed Oils"
//                         className="w-16 h-16 object-cover rounded-lg mx-auto mb-2"
//                       />
//                       <p className="text-sm font-medium text-gray-900">Cold Pressed</p>
//                     </div>
//                   </div>
//                   <div className="text-center">
//                     <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
//                       <img
//                         src="https://via.placeholder.com/80x80/FAF9F6/3D2F23?text=🌱"
//                         alt="Chemical Free"
//                         className="w-16 h-16 object-cover rounded-lg mx-auto mb-2"
//                       />
//                       <p className="text-sm font-medium text-gray-900">Chemical Free</p>
//                     </div>
//                   </div>
//                   <div className="text-center">
//                     <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
//                       <img
//                         src="https://via.placeholder.com/80x80/FAF9F6/3D2F23?text=🏭"
//                         alt="Traditional Methods"
//                         className="w-16 h-16 object-cover rounded-lg mx-auto mb-2"
//                       />
//                       <p className="text-sm font-medium text-gray-900">Traditional</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Our Mission Section */}
//         <section className="py-16 md:py-20 bg-white">
//           <div className="container mx-auto px-4">
//             <div className="grid lg:grid-cols-2 gap-12 items-center">
//               <div>
//                 <div className="inline-flex items-center gap-2 text-[#B6895B] font-medium mb-4">
//                   <div className="w-8 h-px bg-[#B6895B]"></div>
//                   OUR MISSION
//                 </div>
//                 <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
//                   Quality You Can Trust
//                 </h2>
//                 <div className="text-gray-600 leading-relaxed space-y-4">
//                   <p>
//                     Our mission is to provide customers with the purest, most nutritious oils 
//                     that contribute to their health and well-being. We ensure every product 
//                     meets our stringent quality standards through traditional extraction methods.
//                   </p>
//                   <p>
//                     We offer a diverse range of oils carefully selected for different needs - 
//                     whether for cooking, salad dressings, or skincare. Each product is backed 
//                     by our commitment to purity and quality.
//                   </p>
//                   <p>
//                     Customer satisfaction is at the heart of everything we do. From fast shipping 
//                     to knowledgeable support, we strive to make your experience with us exceptional.
//                   </p>
//                   <p className="font-medium text-gray-900">
//                     We believe everyone deserves access to high-quality, nutritious oils, and 
//                     we are dedicated to making that a reality.
//                   </p>
//                 </div>
                
//                 <div className="flex flex-wrap gap-4 mt-8">
//                   <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2">
//                     <div className="w-2 h-2 bg-[#B6895B] rounded-full"></div>
//                     <span className="text-sm font-medium text-gray-700">Quality Guarantee</span>
//                   </div>
//                   <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2">
//                     <div className="w-2 h-2 bg-[#B6895B] rounded-full"></div>
//                     <span className="text-sm font-medium text-gray-700">Sustainable Sourcing</span>
//                   </div>
//                   <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2">
//                     <div className="w-2 h-2 bg-[#B6895B] rounded-full"></div>
//                     <span className="text-sm font-medium text-gray-700">Traditional Methods</span>
//                   </div>
//                 </div>
//               </div>
//               <div className="relative">
//                 <div className="bg-gray-100 rounded-xl overflow-hidden shadow-lg">
//                   <img
//                     src="https://via.placeholder.com/600x500/FAF9F6/3D2F23?text=Quality+Products"
//                     alt="Our quality products collection"
//                     className="w-full h-80 object-cover"
//                   />
//                 </div>
//                 <div className="absolute -top-6 -right-6 w-20 h-20 bg-[#B6895B]/10 rounded-full"></div>
//                 <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-[#B6895B]/5 rounded-full"></div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Values Section */}
//         <section className="py-16 md:py-20 bg-gray-50">
//           <div className="container mx-auto px-4">
//             <div className="text-center max-w-2xl mx-auto mb-12">
//               <div className="inline-flex items-center gap-2 text-[#B6895B] font-medium mb-4">
//                 <div className="w-8 h-px bg-[#B6895B]"></div>
//                 OUR VALUES
//                 <div className="w-8 h-px bg-[#B6895B]"></div>
//               </div>
//               <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
//                 What Drives Us
//               </h2>
//               <p className="text-gray-600">
//                 Core principles that guide everything we do at Suyambu Food Stores
//               </p>
//             </div>
            
//             <div className="grid md:grid-cols-3 gap-8">
//               <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
//                 <div className="w-12 h-12 bg-[#B6895B]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
//                   <svg className="w-6 h-6 text-[#B6895B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//                   </svg>
//                 </div>
//                 <h3 className="font-semibold text-gray-900 mb-2">Quality Assurance</h3>
//                 <p className="text-gray-600 text-sm">
//                   Every product undergoes strict quality checks to ensure purity and nutritional value.
//                 </p>
//               </div>
              
//               <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
//                 <div className="w-12 h-12 bg-[#B6895B]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
//                   <svg className="w-6 h-6 text-[#B6895B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
//                   </svg>
//                 </div>
//                 <h3 className="font-semibold text-gray-900 mb-2">Customer Care</h3>
//                 <p className="text-gray-600 text-sm">
//                   Dedicated support and satisfaction guarantee on all our products and services.
//                 </p>
//               </div>
              
//               <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
//                 <div className="w-12 h-12 bg-[#B6895B]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
//                   <svg className="w-6 h-6 text-[#B6895B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
//                   </svg>
//                 </div>
//                 <h3 className="font-semibold text-gray-900 mb-2">Sustainability</h3>
//                 <p className="text-gray-600 text-sm">
//                   Committed to sustainable farming practices and environmentally responsible production.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </section>
//       </main>

//       {showAuthModal && (
//         <div
//           className={`fixed inset-0 backdrop-blur-2xl flex z-50 transition-opacity duration-300 ${
//             modalAnimation.includes("in") ? "opacity-100" : "opacity-0"
//           }`}
//           onClick={handleCloseModal}
//         >
//           <div
//             className={`ml-auto h-full w-full sm:w-96 bg-white shadow-xl transform transition-transform duration-300 custom-scrollbar ${
//               modalAnimation === "slide-in"
//                 ? "translate-x-0"
//                 : modalAnimation === "slide-out"
//                 ? "translate-x-full"
//                 : "translate-x-full"
//             }`}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <button
//               onClick={handleCloseModal}
//               className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
//             >
//               <svg
//                 className="w-6 h-6"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M6 18L18 6M6 6l12 12"
//                 />
//               </svg>
//             </button>

//             <div
//               className={`transition-opacity duration-300 ${
//                 modalAnimation === "fade-in"
//                   ? "opacity-100"
//                   : modalAnimation === "fade-out"
//                   ? "opacity-0"
//                   : "opacity-100"
//               }`}
//             >
//               {showAuthModal === "login" ? (
//                 <CustomerLogin
//                   onRegisterClick={() => handleAuthSwitch("register")}
//                   onClose={handleCloseModal}
//                 />
//               ) : (
//                 <CustomerRegister
//                   onLoginClick={() => handleAuthSwitch("login")}
//                   onClose={handleCloseModal}
//                 />
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {showCartModal && (
//         <div className="fixed inset-0 backdrop-blur-2xl z-50 flex items-center justify-end p-4">
//           <Cart
//             customerId={customerId}
//             cartItems={cartItems}
//             updateQuantity={updateQuantity}
//             handleRemoveItem={handleRemoveItem}
//             handleCloseCart={handleCloseCart}
//             showCartModal={showCartModal}
//             cartAnimation={cartAnimation}
//           />
//         </div>
//       )}

//       {showOrdersModal && (
//         <div className="fixed inset-0 backdrop-blur-2xl z-50 flex items-center justify-end p-4">
//           <MyOrders
//             customerId={customerId}
//             handleCloseOrders={handleCloseOrders}
//             showOrdersModal={showOrdersModal}
//             ordersAnimation={ordersAnimation}
//           />
//         </div>
//       )}

//       <Footer />
//     </div>
//   );
// }










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
        "https://suyambufoods.com/api/customer/cart",
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
        `https://suyambufoods.com/api/customer/cart?customerId=${customerId}&variantId=${variantId}`,
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
        onSearch={() => {}}
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
                About Suyambu Food Products
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Pure, traditional, and trusted since 2014
              </p>
              <nav className="flex justify-center items-center gap-3 text-sm text-gray-500">
                <a href="/" className="hover:text-[#B6895B] transition-colors">Home</a>
                <span className="text-gray-300">/</span>
                <span className="text-[#B6895B] font-medium">About</span>
              </nav>
            </div>
          </div>
        </section>

        {/* WHO ARE WE? */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-[#B6895B] font-medium mb-4">
                  <div className="w-8 h-px bg-[#B6895B]"></div>
                  WHO ARE WE?
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                  Welcome to Suyambu Food Products
                </h2>
                <div className="text-gray-600 leading-relaxed space-y-4">
                  <p>
                    Welcome to Suyambu Food Products, where good health meets great taste. With over 11 years of experience since starting in 2014, we’ve been committed to offering pure and traditional food that families can trust. Our focus is on keeping your meals natural, healthy, and full of goodness.
                  </p>
                  <p>
                    We produce and sell a wide range of essentials like cold-pressed Groundnut, Coconut, Sesame, and Castor Oils, along with traditional sweets, millet laddus, rice snacks, and health mixes. Every product is made with care to preserve its natural taste and nutrition.
                  </p>
                  <p>
                    At Suyambu Food Products, we believe that eating right starts with pure ingredients. We’re grateful for the love and trust our customers have shown and promise to keep delivering honest, wholesome food — just the way it should be.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gray-100 rounded-xl overflow-hidden shadow-lg">
                  <img
                    src="https://via.placeholder.com/600x500/FAF9F6/3D2F23?text=Pure+Traditional+Food"
                    alt="Pure traditional food products"
                    className="w-full h-80 object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#B6895B]/10 rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        {/* OUR STORY */}
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="bg-gray-100 rounded-xl overflow-hidden shadow-lg">
                  <img
                    src="https://via.placeholder.com/600x400/FAF9F6/3D2F23?text=Our+Journey+Since+2014"
                    alt="Our journey since 2014"
                    className="w-full h-80 object-cover"
                  />
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 text-[#B6895B] font-medium mb-4">
                  <div className="w-8 h-px bg-[#B6895B]"></div>
                  OUR STORY
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                  From a YouTube Video to Your Kitchen
                </h2>
                <div className="text-gray-600 leading-relaxed space-y-4">
                  <p>
                    Our journey began back in 2014, when my father came across a YouTube video that completely changed his perspective on food and health. It inspired him to start small — retailing pure and natural food essentials like cold-pressed oils, nattu sakkarai, and indu salt right from our home.
                  </p>
                  <p>
                    At first, we bought oils from other trusted manufacturers and sold them locally. But as people began to appreciate the difference that pure food makes, we decided to take things further — manufacturing our own oils using a rented cold-pressed machine. That marked the beginning of Suyambu Food Products.
                  </p>
                  <p>
                    Over time, we grew from a humble home setup into a small shop in our town, gaining the love and trust of our customers. Today, Suyambu Food Products proudly manufactures and sells products that we genuinely believe in — made with care, honesty, and a deep respect for our customers’ health.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* OUR MISSION */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-[#B6895B] font-medium mb-4">
                  <div className="w-8 h-px bg-[#B6895B]"></div>
                  OUR MISSION
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                  Reconnect with Real Food
                </h2>
                <div className="text-gray-600 leading-relaxed space-y-4">
                  <p>
                    Our mission is to help every household return to healthy, authentic eating.
                  </p>
                  <p>
                    We want to make pure, traditional foods accessible to everyone — free from adulteration, full of natural goodness, and made the way our ancestors did.
                  </p>
                  <p>
                    Through our products, we aim to reconnect people with real taste and real health. We believe that every bottle of oil, every laddu, and every snack we make should contribute to a healthier lifestyle. That’s why we carefully craft our products using traditional methods, without chemicals or shortcuts, ensuring they retain their natural taste and nutrients.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gray-100 rounded-xl overflow-hidden shadow-lg">
                  <img
                    src="https://via.placeholder.com/600x500/FAF9F6/3D2F23?text=Traditional+Craftsmanship"
                    alt="Traditional craftsmanship"
                    className="w-full h-80 object-cover"
                  />
                </div>
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-[#B6895B]/10 rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        {/* WHY EATING HEALTHY MATTERS */}
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 text-[#B6895B] font-medium mb-4">
                <div className="w-8 h-px bg-[#B6895B]"></div>
                WHY EATING HEALTHY MATTERS
                <div className="w-8 h-px bg-[#B6895B]"></div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Real Food for Real Health
              </h2>
            </div>
            <div className="max-w-4xl mx-auto text-gray-600 leading-relaxed space-y-4 text-center">
              <p>
                In today’s fast-paced world, convenience often takes the front seat — but real health comes from real food.
              </p>
              <p>
                Eating healthy isn’t just about avoiding junk; it’s about nourishing your body with pure, natural ingredients that help you stay energetic, balanced, and strong in the long run.
              </p>
              <p>
                We believe that long-term health awareness starts with simple, everyday choices — like using pure oils in cooking, choosing traditional snacks over processed ones, and including nutrient-rich foods in your diet.
              </p>
              <p className="font-medium text-gray-900">
                At Suyambu Food Products, every product we make is a small step toward helping you and your family build a healthier, happier future — one meal at a time.
              </p>
            </div>
          </div>
        </section>

        {/* WHAT DRIVES US */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 text-[#B6895B] font-medium mb-4">
                <div className="w-8 h-px bg-[#B6895B]"></div>
                WHAT DRIVES US
                <div className="w-8 h-px bg-[#B6895B]"></div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Our Core Values
              </h2>
              <p className="text-gray-600">
                The principles that guide everything we do
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
                  Quality products is the primary objective of our Brand
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                <div className="w-12 h-12 bg-[#B6895B]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-[#B6895B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Care for Customers</h3>
                <p className="text-gray-600 text-sm">
                  We truly care about your long term health. You deserve to be healthy
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                <div className="w-12 h-12 bg-[#B6895B]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  4
                  <svg className="w-6 h-6 text-[#B6895B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Value for Tradition</h3>
                <p className="text-gray-600 text-sm">
                  Our aim is to bring our traditional foods back to diet!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PRIVACY POLICY */}
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">Privacy Policy</h2>
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-200 text-gray-600 space-y-6 leading-relaxed">
              <p>
                Suyambu Food Products is committed to safeguarding your privacy and ensuring that your personal information remains protected. This Privacy Policy outlines how we collect, store, and use your data when you interact with our website or make a purchase.
              </p>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">1. Information We Collect</h3>
                <p>We may collect the following information from you:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Personal details such as name, email address, phone number, and delivery address.</li>
                  <li>Payment information during transactions, processed securely through Razorpay.</li>
                  <li>Usage data including browser type, device information, and pages visited (collected via analytics tools).</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2. Use of Information</h3>
                <p>Your information is used for the following purposes:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>To process, confirm, and deliver your orders efficiently.</li>
                  <li>To communicate with you regarding your order status or support inquiries.</li>
                  <li>To improve our website, services, and user experience.</li>
                  <li>To send you promotional offers or product updates (only if you opt in).</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3. Data Protection and Security</h3>
                <p>
                  We employ industry-standard security measures to ensure the safety of your personal data. All payment transactions are encrypted and processed via Razorpay’s secure gateway. We do not store or access your full payment card information.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">4. Disclosure of Information</h3>
                <p>
                  We do not sell, trade, or rent customer information to third parties. Information may only be shared with trusted partners or courier agencies for order fulfillment purposes.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">5. Your Consent</h3>
                <p>
                  By using our website, you consent to the collection and use of your information as described in this policy.
                </p>
              </div>
              <p className="font-medium text-gray-900">
                For any privacy-related concerns, please contact us at <a href="mailto:suyambufoodcare@gmail.com" className="text-[#B6895B] hover:underline">suyambufoodcare@gmail.com</a>
              </p>
            </div>
          </div>
        </section>

        {/* REFUND POLICY */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">Refund & Replacement Policy</h2>
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-200 text-gray-600 space-y-6 leading-relaxed">
              <p>
                At Suyambu Food Products, we strive to maintain the highest standards of quality, hygiene, and customer satisfaction. Every product that leaves our facility undergoes multiple quality checks to ensure it reaches you in the best possible condition.
              </p>
              <p>
                However, due to the nature of our products, returns are not accepted once the items are delivered. This policy is in place to maintain food safety and hygiene standards for all our customers.
              </p>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">1. Replacement Eligibility</h3>
                <p>In the unlikely event that a product reaches you in a damaged, defective, or incorrect condition, you may request a replacement.</p>
                <p className="mt-2">To qualify for a replacement:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>You must raise a request within 7 days of receiving the product.</li>
                  <li>The item must be in its original packaging, unused, and accompanied by proof of purchase.</li>
                  <li>Supporting images or videos showing the product issue must be shared via email at <a href="mailto:suyambufoodcare@gmail.com" className="text-[#B6895B] hover:underline">suyambufoodcare@gmail.com</a>.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2. Replacement Process</h3>
                <p>
                  Once your replacement request is received, our quality team will review the evidence and verify the claim. If approved, a replacement product will be dispatched within 3–5 working days, subject to availability. If the item is out of stock, we may issue a store credit or alternative product based on your preference.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3. Non-Eligibility</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Products damaged due to misuse, improper handling, or storage after delivery.</li>
                  <li>Items reported after the 7-day period.</li>
                  <li>Edible products that have been opened or used.</li>
                </ul>
              </div>
              <p className="font-medium text-gray-900">
                For all replacement-related concerns, please contact:<br />
                Email: <a href="mailto:suyambufoodcare@gmail.com" className="text-[#B6895B] hover:underline">suyambufoodcare@gmail.com</a><br />
                Phone: 9345872342 (Available 10 AM – 6 PM, every day)
              </p>
            </div>
          </div>
        </section>

        {/* SHIPPING POLICY */}
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">Shipping Policy</h2>
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-200 text-gray-600 space-y-6 leading-relaxed">
              <p>
                At Suyambu Food Products, we ensure that your orders are processed and delivered safely, promptly, and efficiently. This Shipping Policy explains our dispatch, delivery, and handling process.
              </p>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">1. Service Coverage</h3>
                <p>We currently deliver to all locations across India through reliable courier and logistics partners.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2. Order Processing Time</h3>
                <p>Orders are processed within 1–2 business days after confirmation of payment. Orders placed on Sundays or public holidays will be processed the next working day.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3. Delivery Timeline</h3>
                <p>Delivery usually takes 3–7 business days, depending on your location and courier service availability. Remote areas may experience slightly longer delivery times.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">4. Shipping Charges</h3>
                <p>Shipping costs are calculated during checkout based on the order weight and delivery location. We occasionally offer free shipping on eligible promotional orders.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">5. Order Tracking</h3>
                <p>Once your order is shipped, a tracking ID and courier link will be shared via email or SMS. Customers are encouraged to monitor shipment progress using the provided details.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">6. Damaged or Missing Products</h3>
                <p>If your package is damaged, tampered with, or missing items upon delivery:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Please contact our support team within 48 hours of receiving the order.</li>
                  <li>Provide clear photos or unboxing videos to support your claim.</li>
                  <li>After verification, we will issue a replacement or store credit as applicable.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">7. Undeliverable Orders</h3>
                <p>If a delivery attempt fails due to an incorrect address or unavailability of the recipient, the order may be returned to us. In such cases, customers may bear additional re-shipping costs.</p>
              </div>
              <p className="font-medium text-gray-900">
                For shipping-related queries, reach us at:<br />
                Email: <a href="mailto:suyambufoodcare@gmail.com" className="text-[#B6895B] hover:underline">suyambufoodcare@gmail.com</a><br />
                Phone: 9345872342 (10 AM – 6 PM, all days)
              </p>
            </div>
          </div>
        </section>

        {/* TERMS AND CONDITIONS */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">Terms and Conditions</h2>
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-200 text-gray-600 space-y-6 leading-relaxed">
              <p>
                Welcome to Suyambu Food Products. These Terms and Conditions govern your use of our website and the purchase of our products. By accessing or placing an order through our website, you agree to comply with the following terms:
              </p>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">1. General</h3>
                <p>
                  This website is owned and operated by Suyambu Food Products, located in Sirumugai, Mettupalayam Taluk, Coimbatore, Tamil Nadu (PIN – 641302). We reserve the right to modify or update these Terms at any time without prior notice.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2. Product Information</h3>
                <p>
                  We make every effort to ensure the accuracy of product descriptions, pricing, and images. However, minor variations in packaging or appearance may occur due to product updates or availability.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3. Order and Payment</h3>
                <p>
                  All orders are confirmed only upon successful payment through Razorpay. Cash on Delivery (COD) is not accepted. We reserve the right to cancel any order in case of technical errors, pricing issues, or non-availability.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">4. Shipping and Delivery</h3>
                <p>
                  We ship all over India using trusted courier partners. Delivery timelines vary by location and are provided at checkout.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">5. Replacement Policy</h3>
                <p>
                  Replacements are accepted within 7 days only for defective or damaged items. Please refer to our Refund and Replacement Policy for details.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">6. Intellectual Property</h3>
                <p>
                  All trademarks, logos, text, and content on this website are the property of Suyambu Food Products. Unauthorized reproduction or use of any material is strictly prohibited.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">7. Limitation of Liability</h3>
                <p>
                  Suyambu Food Products shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">8. Governing Law</h3>
                <p>
                  These Terms are governed by the laws of India and subject to the jurisdiction of courts in Coimbatore, Tamil Nadu.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* MODALS */}
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
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className={`transition-opacity duration-300 ${modalAnimation === "fade-in" ? "opacity-100" : modalAnimation === "fade-out" ? "opacity-0" : "opacity-100"}`}>
              {showAuthModal === "login" ? (
                <CustomerLogin onRegisterClick={() => handleAuthSwitch("register")} onClose={handleCloseModal} />
              ) : (
                <CustomerRegister onLoginClick={() => handleAuthSwitch("login")} onClose={handleCloseModal} />
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