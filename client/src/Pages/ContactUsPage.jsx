// // client/src/pages/ContactUsPage.jsx
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import Swal from "sweetalert2";

// import Header from "../components/CustomerComponents/Header";
// import Footer from "../components/CustomerComponents/Footer";
// import CustomerLogin from "../components/Authentication/CustomerLogin";
// import CustomerRegister from "../components/Authentication/CustomerRegister";
// import Cart from "../components/CustomerComponents/Cart";
// import MyOrders from "../components/CustomerComponents/MyOrders";

// function decodeCustomerId(encodedId) {
//   try {
//     return atob(encodedId);
//   } catch {
//     console.error("Error decoding customerId:", encodedId);
//     return null;
//   }
// }

// export default function ContactUsPage() {
//   const navigate = useNavigate();

//   const [customerData, setCustomerData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showAuthModal, setShowAuthModal] = useState(null);
//   const [modalAnimation, setModalAnimation] = useState("");
//   const [cartItems, setCartItems] = useState([]);
//   const [showCartModal, setShowCartModal] = useState(false);
//   const [cartAnimation, setCartAnimation] = useState("");
//   const [showOrdersModal, setShowOrdersModal] = useState(false);
//   const [ordersAnimation, setOrdersAnimation] = useState("");

//   // Contact form state
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     whatsapp: "",
//     message: "",
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submitMessage, setSubmitMessage] = useState("");

//   const customerId = localStorage.getItem("customerId");

//   // Expose global login/register functions (consistent with other pages)
//   useEffect(() => {
//     window.openLoginPanel = () => {
//       setModalAnimation("slide-in");
//       setShowAuthModal("login");
//     };

//     window.openRegisterPanel = () => {
//       setModalAnimation("slide-in");
//       setShowAuthModal("register");
//     };

//     return () => {
//       delete window.openLoginPanel;
//       delete window.openRegisterPanel;
//     };
//   }, []);

//   const showMessage = (msg, icon = "success") => {
//     Swal.fire({
//       text: msg,
//       icon,
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
//           `https://suyambuoils.com/api/customer/profile?customerId=${storedCustomerId}`,
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
//         `https://suyambuoils.com/api/customer/cart?customerId=${customerId}`,
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
//     if (!customerData) {
//       handleLoginClick();
//       return;
//     }
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
//     if (!customerData) {
//       handleLoginClick();
//       return;
//     }
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
//         "https://suyambuoils.com/api/customer/cart",
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
//         `https://suyambuoils.com/api/customer/cart?customerId=${customerId}&variantId=${variantId}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       await fetchCart();
//       showMessage("Item removed from cart successfully");
//     } catch (err) {
//       console.error("Failed to remove item:", err);
//       showMessage(`Failed to remove item: ${err.response?.data?.error || err.message}`, "error");
//     }
//   };

//   // Contact form handlers
//   const handleInputChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setSubmitMessage("");

//     try {
//       const response = await axios.post("https://suyambuoils.com/api/customer/contact", formData, {
//         headers: { "Content-Type": "application/json" },
//       });

//       setSubmitMessage(response.data.message || "Thank you! Your message has been sent successfully.");
//       setFormData({ name: "", email: "", whatsapp: "", message: "" });
//       showMessage("Message sent successfully!", "success");
//     } catch (error) {
//       const errorMsg = error.response?.data?.message || "Failed to send message. Please try again.";
//       setSubmitMessage(errorMsg);
//       showMessage(errorMsg, "error");
//     } finally {
//       setIsSubmitting(false);
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
//     <div className="min-h-screen bg-gray-50 flex flex-col custom-scrollbar">
//       <Header
//         customerData={customerData}
//         onLoginClick={handleLoginClick}
//         onRegisterClick={handleRegisterClick}
//         cartItems={cartItems}
//         customerId={customerId}
//         fetchCart={fetchCart}
//         onCartClick={handleCartClick}
//         onOrdersClick={handleOrdersClick}
//         onSearch={() => {}}
//         selectedCategory=""
//         onCategorySelect={() => {}}
//         onResetCategory={() => {}}
//       />

//       <main className="flex-1 bg-gray-50 pt-20 pb-12">
//         {/* Hero Banner Section */}
//         <section className="relative bg-white overflow-hidden border-b border-gray-100">
//           <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
//             <div className="text-center">
//               <h1 className="text-4xl md:text-6xl font-extrabold text-[#3D2F23] mb-4">
//                 Contact Us
//               </h1>
//               <nav className="flex items-center justify-center gap-4 text-sm text-[#B6895B]">
//                 <a href="/" className="hover:underline">Home</a>
//                 <span className="text-gray-400">/</span>
//                 <span className="font-medium">Contact</span>
//               </nav>
//             </div>
//           </div>
//         </section>

//         {/* Contact Information + Map */}
//         <section className="py-16 md:py-24 bg-white">
//           <div className="container mx-auto px-4">
//             <div className="grid md:grid-cols-2 gap-12 items-start">
//               <div className="space-y-8">
//                 <h2 className="text-3xl md:text-4xl font-bold text-[#3D2F23] mb-6">
//                   CONTACT INFORMATION
//                 </h2>

//                 <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
//                   <div className="space-y-6">
//                     <div className="flex items-start gap-4">
//                       <span className="bg-[#B6895B] text-white rounded-full p-3 flex-shrink-0">
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//                         </svg>
//                       </span>
//                       <div>
//                         <h3 className="font-semibold text-gray-900">Address</h3>
//                         <p className="text-gray-700 mt-1">
//                           No.12/486, Sathy Main Road,<br />
//                           Theater Road,<br />
//                           Sirumugai,<br />
//                           Coimbatore – 641302,<br />
//                           Tamil Nadu, India.
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex items-start gap-4">
//                       <span className="bg-[#B6895B] text-white rounded-full p-3 flex-shrink-0">
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                         </svg>
//                       </span>
//                       <div>
//                         <h3 className="font-semibold text-gray-900">Email</h3>
//                         <p className="text-gray-700 mt-1">suyambufoodstores@gmail.com</p>
//                       </div>
//                     </div>

//                     <div className="flex items-start gap-4">
//                       <span className="bg-[#B6895B] text-white rounded-full p-3 flex-shrink-0">
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
//                         </svg>
//                       </span>
//                       <div>
//                         <h3 className="font-semibold text-gray-900">Phone</h3>
//                         <p className="text-gray-700 mt-1">+91 9345872342</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Social Media */}
//                 <div className="flex gap-5">
//                   <a
//                     href="https://www.instagram.com/suyambufoodstores"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="bg-[#E4405F] text-white p-3 rounded-full hover:bg-[#D63447] transition-colors shadow-sm"
//                     aria-label="Instagram"
//                   >
//                     <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
//                       <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
//                       <circle cx="12" cy="12" r="3.5" fill="none" stroke="white" strokeWidth="1.5" />
//                     </svg>
//                   </a>

//                   <a
//                     href="https://www.facebook.com/suyambufoodstores"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="bg-[#1877F2] text-white p-3 rounded-full hover:bg-[#166FE5] transition-colors shadow-sm"
//                     aria-label="Facebook"
//                   >
//                     <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
//                       <path d="M24 12.073c0-6.627-5.373-11.999-12-12s-12 5.372-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
//                     </svg>
//                   </a>
//                 </div>
//               </div>

//               {/* Google Map */}
//               <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
//                 <iframe
//                   src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3909.5!2d77.008161!3d11.3209746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba8ef002198fd89%3A0xb8321f0e9af0aeac!2sSuyambu%20Food%20Store!5e0!3m2!1sen!2sin!4v1729347200000!5m2!1sen!2sin"
//                   width="100%"
//                   height="450"
//                   style={{ border: 0 }}
//                   allowFullScreen=""
//                   loading="lazy"
//                   referrerPolicy="no-referrer-when-downgrade"
//                   title="Suyambu Food Store Location"
//                 ></iframe>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Contact Form */}
//         <section className="py-16 md:py-24 bg-gray-50">
//           <div className="container mx-auto px-4">
//             <div className="max-w-3xl mx-auto">
//               <h2 className="text-3xl md:text-4xl font-bold text-[#3D2F23] text-center mb-10">
//                 Get in Touch
//               </h2>

//               {submitMessage && (
//                 <div
//                   className={`mb-8 p-5 rounded-xl text-center font-medium ${
//                     submitMessage.includes("Thank you") || submitMessage.includes("successfully")
//                       ? "bg-green-50 text-green-800 border border-green-200"
//                       : "bg-red-50 text-red-800 border border-red-200"
//                   }`}
//                 >
//                   {submitMessage}
//                 </div>
//               )}

//               <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
//                 <div className="grid md:grid-cols-2 gap-6">
//                   <div>
//                     <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
//                       Name *
//                     </label>
//                     <input
//                       type="text"
//                       id="name"
//                       name="name"
//                       value={formData.name}
//                       onChange={handleInputChange}
//                       required
//                       disabled={isSubmitting}
//                       className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B6895B]/40 focus:border-[#B6895B] disabled:bg-gray-100 transition-all"
//                       placeholder="Your full name"
//                     />
//                   </div>

//                   <div>
//                     <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                       Email Address *
//                     </label>
//                     <input
//                       type="email"
//                       id="email"
//                       name="email"
//                       value={formData.email}
//                       onChange={handleInputChange}
//                       required
//                       disabled={isSubmitting}
//                       className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B6895B]/40 focus:border-[#B6895B] disabled:bg-gray-100 transition-all"
//                       placeholder="your.email@example.com"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
//                     WhatsApp Number
//                   </label>
//                   <div className="relative">
//                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                       <svg className="w-7 h-7 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
//                         <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.265c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
//                       </svg>
//                     </div>
//                     <input
//                       type="tel"
//                       id="whatsapp"
//                       name="whatsapp"
//                       value={formData.whatsapp}
//                       onChange={handleInputChange}
//                       disabled={isSubmitting}
//                       placeholder="+91 98765 43210"
//                       className="w-full pl-14 pr-5 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B6895B]/40 focus:border-[#B6895B] disabled:bg-gray-100 transition-all"
//                     />
//                   </div>
//                   <p className="mt-1.5 text-xs text-gray-500">We usually reply faster on WhatsApp</p>
//                 </div>

//                 <div>
//                   <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
//                     Your Message *
//                   </label>
//                   <textarea
//                     id="message"
//                     name="message"
//                     rows={6}
//                     value={formData.message}
//                     onChange={handleInputChange}
//                     required
//                     disabled={isSubmitting}
//                     className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B6895B]/40 focus:border-[#B6895B] resize-none disabled:bg-gray-100 transition-all"
//                     placeholder="How can we assist you today?"
//                   />
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={isSubmitting}
//                   className="w-full bg-[#3D2F23] text-white py-4 px-8 rounded-lg font-semibold hover:bg-[#2C241A] transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
//                 >
//                   {isSubmitting ? (
//                     <span className="flex items-center justify-center">
//                       <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       Sending...
//                     </span>
//                   ) : (
//                     "SUBMIT MESSAGE"
//                   )}
//                 </button>
//               </form>
//             </div>
//           </div>
//         </section>
//       </main>

//       {/* ─── Side Panels ──────────────────────────────────────────────── */}

//       {/* Auth Modal (Login/Register) */}
//       {showAuthModal && (
//         <div
//           className={`fixed inset-0 z-50 transition-opacity duration-300 ${
//             modalAnimation.includes("in") ? "bg-black/30 backdrop-blur-sm" : "bg-transparent"
//           } ${modalAnimation.includes("in") ? "opacity-100" : "opacity-0 pointer-events-none"}`}
//           onClick={handleCloseModal}
//         >
//           <div
//             className={`absolute right-0 top-0 h-full w-full sm:w-96 md:w-[460px] lg:w-[480px] xl:w-[500px] bg-white shadow-2xl transform transition-transform duration-300 ${
//               modalAnimation === "slide-in" ? "translate-x-0" : "translate-x-full"
//             } overflow-y-auto custom-scrollbar`}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="h-full bg-gray-50 flex flex-col">
//               <div
//                 className={`transition-opacity duration-300 ${
//                   modalAnimation.includes("fade") ? (modalAnimation === "fade-in" ? "opacity-100" : "opacity-0") : "opacity-100"
//                 }`}
//               >
//                 {showAuthModal === "login" ? (
//                   <CustomerLogin onRegisterClick={() => handleAuthSwitch("register")} onClose={handleCloseModal} />
//                 ) : (
//                   <CustomerRegister onLoginClick={() => handleAuthSwitch("login")} onClose={handleCloseModal} />
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Cart Side Panel */}
//       {showCartModal && customerData && (
//         <div
//           className={`fixed inset-0 z-50 transition-opacity duration-300 ${
//             cartAnimation === "slide-in" ? "bg-black/30 backdrop-blur-sm" : "bg-transparent"
//           } ${cartAnimation === "slide-in" ? "opacity-100" : "opacity-0 pointer-events-none"}`}
//           onClick={handleCloseCart}
//         >
//           <div
//             className={`absolute right-0 top-0 h-full w-full sm:w-96 md:w-[460px] lg:w-[480px] xl:w-[500px] bg-white shadow-2xl transform transition-transform duration-300 ${
//               cartAnimation === "slide-in" ? "translate-x-0" : "translate-x-full"
//             } overflow-y-auto custom-scrollbar`}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <Cart
//               customerId={customerId}
//               cartItems={cartItems}
//               updateQuantity={updateQuantity}
//               handleRemoveItem={handleRemoveItem}
//               handleCloseCart={handleCloseCart}
//               showCartModal={showCartModal}
//               cartAnimation={cartAnimation}
//             />
//           </div>
//         </div>
//       )}

//       {/* Orders Side Panel */}
//       {showOrdersModal && customerData && (
//         <div
//           className={`fixed inset-0 z-50 transition-opacity duration-300 ${
//             ordersAnimation === "slide-in" ? "bg-black/30 backdrop-blur-sm" : "bg-transparent"
//           } ${ordersAnimation === "slide-in" ? "opacity-100" : "opacity-0 pointer-events-none"}`}
//           onClick={handleCloseOrders}
//         >
//           <div
//             className={`absolute right-0 top-0 h-full w-full sm:w-96 md:w-[460px] lg:w-[480px] xl:w-[500px] bg-white shadow-2xl transform transition-transform duration-300 ${
//               ordersAnimation === "slide-in" ? "translate-x-0" : "translate-x-full"
//             } overflow-y-auto custom-scrollbar`}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <MyOrders
//               customerId={customerId}
//               handleCloseOrders={handleCloseOrders}
//               showOrdersModal={showOrdersModal}
//               ordersAnimation={ordersAnimation}
//             />
//           </div>
//         </div>
//       )}

//       <Footer />
//     </div>
//   );
// }



// client/src/pages/ContactUsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import Header from "../components/CustomerComponents/Header";
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

export default function ContactUsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(null);
  const [modalAnimation, setModalAnimation] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartAnimation, setCartAnimation] = useState("");
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [ordersAnimation, setOrdersAnimation] = useState("");

  // Contact form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  // ─── Customer ID handling ───────────────────────────────────────────
  const storedCustomerId = localStorage.getItem("customerId");
  const searchParams = new URLSearchParams(location.search);
  const encodedCustomerIdFromUrl = searchParams.get("customerId");
  const customerIdFromUrl = encodedCustomerIdFromUrl ? decodeCustomerId(encodedCustomerIdFromUrl) : null;
  const customerId = customerIdFromUrl || storedCustomerId;

  // Global login/register panel triggers
  useEffect(() => {
    window.openLoginPanel = () => {
      setModalAnimation("slide-in");
      setShowAuthModal("login");
    };
    window.openRegisterPanel = () => {
      setModalAnimation("slide-in");
      setShowAuthModal("register");
    };
    return () => {
      delete window.openLoginPanel;
      delete window.openRegisterPanel;
    };
  }, []);

  const showMessage = (msg, icon = "success") => {
    Swal.fire({
      text: msg,
      icon,
      toast: true,
      position: "bottom-end",
      timer: 2000,
      showConfirmButton: false,
      timerProgressBar: false,
      showClass: { popup: "animate__animated animate__slideInUp" },
    });
  };

  // ─── Auth + URL sync logic ──────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("customerToken");

    if (!token || !storedCustomerId) {
      setLoading(false);
      return;
    }

    // If URL is missing customerId or doesn't match → fix it
    if (!encodedCustomerIdFromUrl || customerIdFromUrl !== storedCustomerId) {
      const params = new URLSearchParams(location.search);
      params.set("customerId", btoa(storedCustomerId));
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
      return;
    }

    const verifyCustomer = async () => {
      try {
        const response = await axios.get(
          `https://suyambuoils.com/api/customer/profile?customerId=${storedCustomerId}`,
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
  }, [navigate, location.pathname, location.search, encodedCustomerIdFromUrl, storedCustomerId]);

  const fetchCart = async () => {
    if (!customerId) return;
    const token = localStorage.getItem("customerToken");
    if (!token) return;

    try {
      const res = await axios.get(
        `https://suyambuoils.com/api/customer/cart?customerId=${customerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      showMessage(`Failed to fetch cart: ${err.response?.data?.error || err.message}`, "error");
    }
  };

  // ─── UI Handlers ────────────────────────────────────────────────────
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
    if (!customerData) return handleLoginClick();
    setCartAnimation("slide-in");
    setShowCartModal(true);
  };

  const handleCloseCart = () => {
    setCartAnimation("slide-out");
    setTimeout(() => setShowCartModal(false), 300);
  };

  const handleOrdersClick = () => {
    if (!customerData) return handleLoginClick();
    setOrdersAnimation("slide-in");
    setShowOrdersModal(true);
  };

  const handleCloseOrders = () => {
    setOrdersAnimation("slide-out");
    setTimeout(() => setShowOrdersModal(false), 300);
  };

  const updateQuantity = async (variantId, change) => {
    const item = cartItems.find((i) => String(i.product_variant_id) === String(variantId));
    if (!item) return;
    const newQty = Math.max(1, item.quantity + change);
    const token = localStorage.getItem("customerToken");

    try {
      await axios.put(
        "https://suyambuoils.com/api/customer/cart",
        { customerId, variantId, quantity: newQty },
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      );
      await fetchCart();
      showMessage("Cart updated");
    } catch (err) {
      showMessage("Update failed", "error");
    }
  };

  const handleRemoveItem = async (variantId) => {
    if (!customerId) return;
    const token = localStorage.getItem("customerToken");

    try {
      await axios.delete(
        `https://suyambuoils.com/api/customer/cart?customerId=${customerId}&variantId=${variantId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCart();
      showMessage("Item removed");
    } catch (err) {
      showMessage("Remove failed", "error");
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
    setSubmitMessage("");

    try {
      const response = await axios.post("https://suyambuoils.com/api/customer/contact", formData, {
        headers: { "Content-Type": "application/json" },
      });

      setSubmitMessage(response.data.message || "Thank you! Your message has been sent successfully.");
      setFormData({ name: "", email: "", whatsapp: "", message: "" });
      showMessage("Message sent successfully!", "success");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to send message. Please try again.";
      setSubmitMessage(errorMsg);
      showMessage(errorMsg, "error");
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
        onSearch={() => {}}
        selectedCategory=""
        onCategorySelect={() => {}}
        onResetCategory={() => {}}
      />

      <main className="flex-1 pt-20 pb-16 bg-white">
        {/* Hero Banner */}
        <section className="relative bg-white overflow-hidden border-b border-gray-100">
          <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-extrabold text-[#3D2F23] mb-4">
                Contact Us
              </h1>
              <nav className="flex items-center justify-center gap-4 text-sm text-[#B6895B]">
                <a href="/" className="hover:underline">Home</a>
                <span className="text-gray-400">/</span>
                <span className="font-medium">Contact</span>
              </nav>
            </div>
          </div>
        </section>

        {/* Contact Information + Map */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div className="space-y-8">
                <h2 className="text-3xl md:text-4xl font-bold text-[#3D2F23] mb-6">
                  CONTACT INFORMATION
                </h2>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <span className="bg-[#B6895B] text-white rounded-full p-3 flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-900">Address</h3>
                        <p className="text-gray-700 mt-1">
                          No.12/486, Sathy Main Road,<br />
                          Theater Road,<br />
                          Sirumugai,<br />
                          Coimbatore – 641302,<br />
                          Tamil Nadu, India.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <span className="bg-[#B6895B] text-white rounded-full p-3 flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-900">Email</h3>
                        <p className="text-gray-700 mt-1">suyambufoodstores@gmail.com</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <span className="bg-[#B6895B] text-white rounded-full p-3 flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-900">Phone</h3>
                        <p className="text-gray-700 mt-1">+91 9345872342</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="flex gap-5 mt-8">
                  <a
                    href="https://www.instagram.com/suyambufoodstores"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#E4405F] text-white p-3 rounded-full hover:bg-[#D63447] transition-colors shadow-sm"
                    aria-label="Instagram"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
                      <circle cx="12" cy="12" r="3.5" fill="none" stroke="white" strokeWidth="1.5" />
                    </svg>
                  </a>

                  <a
                    href="https://www.facebook.com/suyambufoodstores"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#1877F2] text-white p-3 rounded-full hover:bg-[#166FE5] transition-colors shadow-sm"
                    aria-label="Facebook"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-11.999-12-12s-12 5.372-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Google Map */}
              <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3909.5!2d77.008161!3d11.3209746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba8ef002198fd89%3A0xb8321f0e9af0aeac!2sSuyambu%20Food%20Store!5e0!3m2!1sen!2sin!4v1729347200000!5m2!1sen!2sin"
                  width="100%"
                  height="450"
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

        {/* Contact Form */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-[#3D2F23] text-center mb-10">
                Get in Touch
              </h2>

              {submitMessage && (
                <div
                  className={`mb-8 p-5 rounded-xl text-center font-medium ${
                    submitMessage.toLowerCase().includes("thank you") || submitMessage.toLowerCase().includes("success")
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {submitMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
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
                      className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B6895B]/40 focus:border-[#B6895B] disabled:bg-gray-100 transition-all"
                      placeholder="Your full name"
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
                      className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B6895B]/40 focus:border-[#B6895B] disabled:bg-gray-100 transition-all"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-7 h-7 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.265c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      id="whatsapp"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      placeholder="+91 98765 43210"
                      className="w-full pl-14 pr-5 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B6895B]/40 focus:border-[#B6895B] disabled:bg-gray-100 transition-all"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">We usually reply faster on WhatsApp</p>
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
                    className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B6895B]/40 focus:border-[#B6895B] resize-none disabled:bg-gray-100 transition-all"
                    placeholder="How can we assist you today?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#3D2F23] text-white py-4 px-8 rounded-lg font-semibold hover:bg-[#2C241A] transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    "SUBMIT MESSAGE"
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* ─── Side Panels ──────────────────────────────────────────────── */}

      {showAuthModal && (
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-300 ${
            modalAnimation.includes("in") ? "bg-black/30 backdrop-blur-sm" : "bg-transparent"
          } ${modalAnimation.includes("in") ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={handleCloseModal}
        >
          <div
            className={`absolute right-0 top-0 h-full w-full sm:w-96 md:w-[460px] lg:w-[480px] xl:w-[500px] bg-white shadow-2xl transform transition-transform duration-300 ${
              modalAnimation === "slide-in" ? "translate-x-0" : "translate-x-full"
            } overflow-y-auto custom-scrollbar`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full bg-gray-50 flex flex-col">
              <div
                className={`transition-opacity duration-300 ${
                  modalAnimation.includes("fade") ? (modalAnimation === "fade-in" ? "opacity-100" : "opacity-0") : "opacity-100"
                }`}
              >
                {showAuthModal === "login" ? (
                  <CustomerLogin onRegisterClick={() => handleAuthSwitch("register")} onClose={handleCloseModal} />
                ) : (
                  <CustomerRegister onLoginClick={() => handleAuthSwitch("login")} onClose={handleCloseModal} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showCartModal && customerData && (
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-300 ${
            cartAnimation === "slide-in" ? "bg-black/30 backdrop-blur-sm" : "bg-transparent"
          } ${cartAnimation === "slide-in" ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={handleCloseCart}
        >
          <div
            className={`absolute right-0 top-0 h-full w-full sm:w-96 md:w-[460px] lg:w-[480px] xl:w-[500px] bg-white shadow-2xl transform transition-transform duration-300 ${
              cartAnimation === "slide-in" ? "translate-x-0" : "translate-x-full"
            } overflow-y-auto custom-scrollbar`}
            onClick={(e) => e.stopPropagation()}
          >
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
        </div>
      )}

      {showOrdersModal && customerData && (
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-300 ${
            ordersAnimation === "slide-in" ? "bg-black/30 backdrop-blur-sm" : "bg-transparent"
          } ${ordersAnimation === "slide-in" ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={handleCloseOrders}
        >
          <div
            className={`absolute right-0 top-0 h-full w-full sm:w-96 md:w-[460px] lg:w-[480px] xl:w-[500px] bg-white shadow-2xl transform transition-transform duration-300 ${
              ordersAnimation === "slide-in" ? "translate-x-0" : "translate-x-full"
            } overflow-y-auto custom-scrollbar`}
            onClick={(e) => e.stopPropagation()}
          >
            <MyOrders
              customerId={customerId}
              handleCloseOrders={handleCloseOrders}
              showOrdersModal={showOrdersModal}
              ordersAnimation={ordersAnimation}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}