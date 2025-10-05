// import React, { useState, useEffect } from "react";
// import { Filter, Search, ArrowUpAZ, ArrowDownZA, Clock, MapPin, Package, DollarSign, X } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// const ManageCustomers = () => {
//   const [customers, setCustomers] = useState([]);
//   const [filteredCustomers, setFilteredCustomers] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [sortOrder, setSortOrder] = useState("desc");
//   const [filterType, setFilterType] = useState("all");
//   const [customMonth, setCustomMonth] = useState("");
//   const [showFilterOptions, setShowFilterOptions] = useState(false);
//   const [selectedCustomerId, setSelectedCustomerId] = useState(null);
//   const [orders, setOrders] = useState([]);
//   const [loadingOrders, setLoadingOrders] = useState(false);
//   const [errorOrders, setErrorOrders] = useState(null);

//   // Fetch customers from API
//   useEffect(() => {
//     const fetchCustomers = async () => {
//       try {
//         const response = await fetch("http://localhost:5000/api/admin/customers");
//         if (!response.ok) throw new Error("Failed to fetch customers");
//         const data = await response.json();
//         setCustomers(data);
//         setFilteredCustomers(data);
//       } catch (error) {
//         console.error("Error fetching customers:", error);
//       }
//     };
//     fetchCustomers();
//   }, []);

//   // Handle search and filtering
//   useEffect(() => {
//     let result = [...customers];

//     // Apply search filter
//     if (searchTerm) {
//       result = result.filter(customer =>
//         customer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         customer.phone.includes(searchTerm)
//       );
//     }

//     // Apply date filter
//     const now = new Date();
//     if (filterType === "week") {
//       const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
//       result = result.filter(customer => new Date(customer.created_at) >= oneWeekAgo);
//     } else if (filterType === "month") {
//       const currentMonth = now.getMonth();
//       const currentYear = now.getFullYear();
//       result = result.filter(customer => {
//         const date = new Date(customer.created_at);
//         return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
//       });
//     } else if (filterType === "custom" && customMonth) {
//       const [year, month] = customMonth.split("-").map(Number);
//       result = result.filter(customer => {
//         const date = new Date(customer.created_at);
//         return date.getMonth() === month - 1 && date.getFullYear() === year;
//       });
//     }

//     // Apply sorting
//     result.sort((a, b) => {
//       const nameA = a.username.toLowerCase();
//       const nameB = b.username.toLowerCase();
//       return sortOrder === "asc" ? (nameA < nameB ? -1 : 1) : (nameA > nameB ? -1 : 1);
//     });

//     setFilteredCustomers(result);
//   }, [searchTerm, sortOrder, filterType, customMonth, customers]);

//   // Fetch orders for selected customer
//   const fetchOrders = async (customerId) => {
//     setLoadingOrders(true);
//     setErrorOrders(null);
//     try {
//       const response = await fetch(`http://localhost:5000/api/customer/orders?customerId=${customerId}`);
//       if (!response.ok) throw new Error("Failed to fetch orders");
//       const data = await response.json();
//       setOrders(data);
//       setLoadingOrders(false);
//     } catch (error) {
//       setErrorOrders(error.message);
//       setLoadingOrders(false);
//     }
//   };

//   // Toggle filter options
//   const toggleFilterOptions = () => {
//     setShowFilterOptions(!showFilterOptions);
//   };

//   // Handle sort change
//   const handleSortChange = (order) => {
//     setSortOrder(order);
//     setShowFilterOptions(false);
//   };

//   // Handle filter type change
//   const handleFilterTypeChange = (type) => {
//     setFilterType(type);
//     if (type !== "custom") {
//       setCustomMonth("");
//     }
//     setShowFilterOptions(false);
//   };

//   // Handle view order history
//   const handleViewOrderHistory = (customerId) => {
//     setSelectedCustomerId(customerId);
//     fetchOrders(customerId);
//   };

//   // Close side panel
//   const closeSidePanel = () => {
//     setSelectedCustomerId(null);
//     setOrders([]);
//   };

//   // Status badge component
//   const getStatusBadge = (status) => {
//     const statusText = status.replace(/_/g, " ").toUpperCase();
//     const colorMap = {
//       order_placed: "bg-orange-100 text-orange-800",
//       confirmed: "bg-blue-100 text-blue-800",
//       processing: "bg-yellow-100 text-yellow-800",
//       ready_to_ship: "bg-purple-100 text-purple-800",
//       dispatched: "bg-teal-100 text-teal-800",
//       shipping: "bg-indigo-100 text-indigo-800",
//       out_for_delivery: "bg-cyan-100 text-cyan-800",
//       delivered: "bg-green-100 text-green-800",
//     };
//     const badgeClass = colorMap[status] || "bg-gray-100 text-gray-800";
//     return (
//       <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
//         {statusText}
//       </span>
//     );
//   };

//   // Sort orders by date (most recent first)
//   const sortedOrders = [...orders].sort((a, b) => new Date(b.order_date) - new Date(a.order_date));

//   return (
//     <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
//       <h1 className="text-2xl sm:text-3xl font-bold text-green-800 mb-6 sm:mb-8">Manage Customers</h1>

//       {/* Filter and Search Controls */}
//       <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
//         <div className="relative flex-1 w-full sm:max-w-md">
//           <input
//             type="text"
//             placeholder="Search customers..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
//           />
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//         </div>
        
//         <div className="relative w-full sm:w-auto">
//           <button
//             onClick={toggleFilterOptions}
//             className="flex items-center gap-2 px-4 py-2 border border-green-300 rounded-lg hover:bg-green-50 text-green-700 w-full sm:w-auto text-sm"
//           >
//             <Filter size={20} />
//             <span>Filter</span>
//           </button>
          
//           <AnimatePresence>
//             {showFilterOptions && (
//               <motion.div
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -10 }}
//                 className="absolute z-10 mt-2 w-full sm:w-48 bg-white border border-green-200 rounded-lg shadow-lg p-2"
//               >
//                 <button
//                   onClick={() => handleSortChange("asc")}
//                   className="flex items-center gap-2 w-full px-2 py-1 hover:bg-green-50 text-green-700 text-sm"
//                 >
//                   <ArrowUpAZ size={18} />
//                   Sort A-Z
//                 </button>
//                 <button
//                   onClick={() => handleSortChange("desc")}
//                   className="flex items-center gap-2 w-full px-2 py-1 hover:bg-green-50 text-green-700 text-sm"
//                 >
//                   <ArrowDownZA size={18} />
//                   Sort Z-A
//                 </button>
//                 <button
//                   onClick={() => handleFilterTypeChange("all")}
//                   className="w-full text-left px-2 py-1 hover:bg-green-50 text-green-700 text-sm"
//                 >
//                   All
//                 </button>
//                 <button
//                   onClick={() => handleFilterTypeChange("week")}
//                   className="w-full text-left px-2 py-1 hover:bg-green-50 text-green-700 text-sm"
//                 >
//                   Current Week
//                 </button>
//                 <button
//                   onClick={() => handleFilterTypeChange("month")}
//                   className="w-full text-left px-2 py-1 hover:bg-green-50 text-green-700 text-sm"
//                 >
//                   Current Month
//                 </button>
//                 <div className="px-2 py-1">
//                   <input
//                     type="month"
//                     value={customMonth}
//                     onChange={(e) => {
//                       setCustomMonth(e.target.value);
//                       setFilterType("custom");
//                     }}
//                     className="w-full px-2 py-1 border border-green-300 rounded text-sm"
//                   />
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </div>

//       {/* Customers Table */}
//       <div className="overflow-x-auto rounded-lg shadow-lg">
//         <table className="min-w-full border-collapse border border-green-200">
//           <thead>
//             <tr className="bg-green-50">
//               <th className="border border-green-200 px-2 sm:px-4 py-2 text-left text-green-800 text-xs sm:text-base">ID</th>
//               <th className="border border-green-200 px-2 sm:px-4 py-2 text-left text-green-800 text-xs sm:text-base">Username</th>
//               <th className="border border-green-200 px-2 sm:px-4 py-2 text-left text-green-800 text-xs sm:text-base">Email</th>
//               <th className="border border-green-200 px-2 sm:px-4 py-2 text-left text-green-800 text-xs sm:text-base">Full Name</th>
//               <th className="border border-green-200 px-2 sm:px-4 py-2 text-left text-green-800 text-xs sm:text-base">Phone</th>
//               <th className="border border-green-200 px-2 sm:px-4 py-2 text-left text-green-800 text-xs sm:text-base">Registered At</th>
//               <th className="border border-green-200 px-2 sm:px-4 py-2 text-left text-green-800 text-xs sm:text-base">Order History</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredCustomers.map(customer => (
//               <tr key={customer.id} className="hover:bg-green-50">
//                 <td className="border border-green-200 px-2 sm:px-4 py-2 text-xs sm:text-base">{customer.id}</td>
//                 <td className="border border-green-200 px-2 sm:px-4 py-2 text-xs sm:text-base">{customer.username}</td>
//                 <td className="border border-green-200 px-2 sm:px-4 py-2 text-xs sm:text-base">{customer.email}</td>
//                 <td className="border border-green-200 px-2 sm:px-4 py-2 text-xs sm:text-base">{customer.full_name}</td>
//                 <td className="border border-green-200 px-2 sm:px-4 py-2 text-xs sm:text-base">{customer.phone}</td>
//                 <td className="border border-green-200 px-2 sm:px-4 py-2 text-xs sm:text-base">
//                   {new Date(customer.created_at).toLocaleDateString()}
//                 </td>
//                 <td className="border border-green-200 px-2 sm:px-4 py-2">
//                   <button
//                     onClick={() => handleViewOrderHistory(customer.id)}
//                     className="text-green-600 hover:underline text-xs sm:text-base"
//                   >
//                     View Order History
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Order History Side Panel */}
//       <AnimatePresence>
//         {selectedCustomerId && (
//           <motion.div
//             initial={{ x: "100%" }}
//             animate={{ x: 0 }}
//             exit={{ x: "100%" }}
//             transition={{ type: "spring", stiffness: 100, damping: 20 }}
//             className="fixed top-0 right-0 h-full w-full md:w-[60%] bg-white shadow-2xl p-4 sm:p-6 overflow-y-auto z-50"
//           >
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-xl sm:text-2xl font-bold text-green-800">Order History (Customer #{selectedCustomerId})</h2>
//               <button onClick={closeSidePanel} className="text-green-600 hover:text-green-800">
//                 <X size={24} />
//               </button>
//             </div>

//             {loadingOrders ? (
//               <div className="text-center text-green-700 text-lg sm:text-xl font-semibold">Loading orders...</div>
//             ) : errorOrders ? (
//               <div className="text-center text-red-600 text-lg sm:text-xl font-semibold">Error: {errorOrders}</div>
//             ) : orders.length === 0 ? (
//               <div className="text-center text-gray-600 text-sm sm:text-base">No orders found for this customer.</div>
//             ) : (
//               <div className="space-y-6">
//                 {sortedOrders.map(order => (
//                   <motion.div
//                     key={order.order_id}
//                     initial={{ opacity: 0, scale: 0.98 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     transition={{ duration: 0.3 }}
//                     className="bg-white shadow-lg rounded-lg p-4 sm:p-6 border border-green-200"
//                   >
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
//                       <div>
//                         <h3 className="text-lg sm:text-xl font-semibold text-green-700 mb-4">
//                           Order #{order.order_id}
//                         </h3>
//                         <div className="space-y-2 text-sm sm:text-base">
//                           <p className="flex items-center text-gray-700">
//                             <Clock className="w-5 h-5 mr-2 text-green-600 flex-shrink-0" />
//                             <span>Ordered on: {new Date(order.order_date).toLocaleString()}</span>
//                           </p>
//                           <p className="flex items-center text-gray-700">
//                             <DollarSign className="w-5 h-5 mr-2 text-green-600 flex-shrink-0" />
//                             <span>Total: ₹{parseFloat(order.total_amount).toFixed(2)}</span>
//                           </p>
//                           <p className="flex items-center text-gray-700">
//                             <Package className="w-5 h-5 mr-2 text-green-600 flex-shrink-0" />
//                             <span>Payment: {order.payment_method}</span>
//                           </p>
//                           <p className="flex flex-col sm:flex-row items-start sm:items-center text-gray-700">
//                             <MapPin className="w-5 h-5 mr-2 text-green-600 flex-shrink-0" />
//                             <span className="break-words">
//                               Address: {order.address.street}, {order.address.city}, 
//                               {order.address.state}, {order.address.zip_code}, 
//                               {order.address.country}
//                             </span>
//                           </p>
//                           <div className="flex items-center">
//                             <label className="text-gray-700 font-medium mr-2">Status:</label>
//                             {getStatusBadge(order.order_status)}
//                           </div>
//                         </div>
//                       </div>
//                       <div>
//                         <h4 className="text-base sm:text-lg font-medium text-green-700 mb-3">Items</h4>
//                         <div className="space-y-4">
//                           {order.items.map(item => (
//                             <div key={item.product_id} className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
//                               <img
//                                 src={`http://localhost:5000${item.thumbnail_url}`}
//                                 alt={item.name}
//                                 className="w-16 h-16 object-cover rounded-md flex-shrink-0"
//                                 onError={(e) => {
//                                   e.target.src = "https://via.placeholder.com/64";
//                                 }}
//                               />
//                               <div className="min-w-0 flex-1">
//                                 <p className="font-medium text-gray-800 truncate">{item.name}</p>
//                                 <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
//                                 <p className="text-sm text-gray-600">
//                                   Price: ₹{parseFloat(item.price_at_purchase).toFixed(2)}
//                                 </p>
//                                 <p className="text-sm text-gray-600">
//                                   Subtotal: ₹{parseFloat(item.subtotal).toFixed(2)}
//                                 </p>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   </motion.div>
//                 ))}
//               </div>
//             )}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default ManageCustomers;







import React, { useState, useEffect } from "react";
import { Filter, Search, ArrowUpAZ, ArrowDownZA, Clock, MapPin, Package, DollarSign, X, User, Mail, Phone, Calendar, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ManageCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterType, setFilterType] = useState("all");
  const [customMonth, setCustomMonth] = useState("");
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [errorOrders, setErrorOrders] = useState(null);

  // Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/admin/customers");
        if (!response.ok) throw new Error("Failed to fetch customers");
        const data = await response.json();
        setCustomers(data);
        setFilteredCustomers(data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  // Handle search and filtering
  useEffect(() => {
    let result = [...customers];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(customer =>
        customer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
      );
    }

    // Apply date filter
    const now = new Date();
    if (filterType === "week") {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      result = result.filter(customer => new Date(customer.created_at) >= oneWeekAgo);
    } else if (filterType === "month") {
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      result = result.filter(customer => {
        const date = new Date(customer.created_at);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });
    } else if (filterType === "custom" && customMonth) {
      const [year, month] = customMonth.split("-").map(Number);
      result = result.filter(customer => {
        const date = new Date(customer.created_at);
        return date.getMonth() === month - 1 && date.getFullYear() === year;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      const nameA = a.username.toLowerCase();
      const nameB = b.username.toLowerCase();
      return sortOrder === "asc" ? (nameA < nameB ? -1 : 1) : (nameA > nameB ? -1 : 1);
    });

    setFilteredCustomers(result);
  }, [searchTerm, sortOrder, filterType, customMonth, customers]);

  // Fetch orders for selected customer
  const fetchOrders = async (customerId) => {
    setLoadingOrders(true);
    setErrorOrders(null);
    try {
      const response = await fetch(`http://localhost:5000/api/customer/orders?customerId=${customerId}`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data);
      setLoadingOrders(false);
    } catch (error) {
      setErrorOrders(error.message);
      setLoadingOrders(false);
    }
  };

  // Toggle filter options
  const toggleFilterOptions = () => {
    setShowFilterOptions(!showFilterOptions);
  };

  // Handle sort change
  const handleSortChange = (order) => {
    setSortOrder(order);
    setShowFilterOptions(false);
  };

  // Handle filter type change
  const handleFilterTypeChange = (type) => {
    setFilterType(type);
    if (type !== "custom") {
      setCustomMonth("");
    }
    setShowFilterOptions(false);
  };

  // Handle view order history
  const handleViewOrderHistory = (customerId) => {
    setSelectedCustomerId(customerId);
    fetchOrders(customerId);
  };

  // Close side panel
  const closeSidePanel = () => {
    setSelectedCustomerId(null);
    setOrders([]);
  };

  // Status badge component
  const getStatusBadge = (status) => {
    const statusText = status.replace(/_/g, " ").toUpperCase();
    const colorMap = {
      order_placed: "bg-orange-100 text-orange-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-yellow-100 text-yellow-800",
      ready_to_ship: "bg-purple-100 text-purple-800",
      dispatched: "bg-teal-100 text-teal-800",
      shipping: "bg-indigo-100 text-indigo-800",
      out_for_delivery: "bg-cyan-100 text-cyan-800",
      delivered: "bg-green-100 text-green-800",
    };
    const badgeClass = colorMap[status] || "bg-gray-100 text-gray-800";
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
        {statusText}
      </span>
    );
  };

  // Sort orders by date (most recent first)
  const sortedOrders = [...orders].sort((a, b) => new Date(b.order_date) - new Date(a.order_date));

  return (
    <div className="p-2 sm:p-4 lg:p-6 bg-gray-100 min-h-screen">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800 mb-4 sm:mb-6 lg:mb-8">Manage Customers</h1>

      {/* Filter and Search Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="relative flex-1 w-full lg:max-w-md">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 border border-green-300 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-xs sm:text-sm"
          />
          <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        </div>
        
        <div className="relative w-full lg:w-auto">
          <button
            onClick={toggleFilterOptions}
            className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 border border-green-300 rounded-md sm:rounded-lg hover:bg-green-50 text-green-700 w-full lg:w-auto text-xs sm:text-sm"
          >
            <Filter size={16} />
            <span>Filter</span>
          </button>
          
          <AnimatePresence>
            {showFilterOptions && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-10 mt-1 sm:mt-2 w-full lg:w-48 bg-white border border-green-200 rounded-md sm:rounded-lg shadow-lg p-1 sm:p-2"
              >
                <button
                  onClick={() => handleSortChange("asc")}
                  className="flex items-center gap-1 sm:gap-2 w-full px-2 py-1 hover:bg-green-50 text-green-700 text-xs sm:text-sm"
                >
                  <ArrowUpAZ size={14} />
                  <span className="text-xs">A-Z</span>
                </button>
                <button
                  onClick={() => handleSortChange("desc")}
                  className="flex items-center gap-1 sm:gap-2 w-full px-2 py-1 hover:bg-green-50 text-green-700 text-xs sm:text-sm"
                >
                  <ArrowDownZA size={14} />
                  <span className="text-xs">Z-A</span>
                </button>
                <button
                  onClick={() => handleFilterTypeChange("all")}
                  className="w-full text-left px-2 py-1 hover:bg-green-50 text-green-700 text-xs sm:text-sm truncate"
                >
                  All
                </button>
                <button
                  onClick={() => handleFilterTypeChange("week")}
                  className="w-full text-left px-2 py-1 hover:bg-green-50 text-green-700 text-xs sm:text-sm truncate"
                >
                  This Week
                </button>
                <button
                  onClick={() => handleFilterTypeChange("month")}
                  className="w-full text-left px-2 py-1 hover:bg-green-50 text-green-700 text-xs sm:text-sm truncate"
                >
                  This Month
                </button>
                <div className="px-2 py-1">
                  <input
                    type="month"
                    value={customMonth}
                    onChange={(e) => {
                      setCustomMonth(e.target.value);
                      setFilterType("custom");
                    }}
                    className="w-full px-2 py-1 border border-green-300 rounded text-xs sm:text-sm"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Customers Cards - Mobile */}
      <div className="lg:hidden space-y-4">
        {filteredCustomers.map((customer) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-4 border border-green-200 hover:shadow-lg transition-shadow"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User size={20} className="text-green-600" />
                  <span className="font-semibold text-lg text-green-800">Customer #{customer.id}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar size={14} />
                  <span>{new Date(customer.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2 p-2 bg-green-50 rounded-md">
                  <User size={16} className="text-green-600 flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium block">Username</span>
                    <span className="text-gray-700">{customer.username}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-md">
                  <Mail size={16} className="text-blue-600 flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium block">Email</span>
                    <span className="text-gray-700 break-all">{customer.email}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 bg-purple-50 rounded-md">
                  <User size={16} className="text-purple-600 flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium block">Full Name</span>
                    <span className="text-gray-700 break-words">{customer.full_name}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 bg-indigo-50 rounded-md">
                  <Phone size={16} className="text-indigo-600 flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium block">Phone</span>
                    <span className="text-gray-700">{customer.phone}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleViewOrderHistory(customer.id)}
                className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <FileText size={16} />
                View Order History
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Customers Table - Desktop */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="min-w-full border-collapse border border-green-200">
            <thead>
              <tr className="bg-green-50">
                <th className="border border-green-200 px-4 py-3 text-left text-green-800 text-sm font-semibold">ID</th>
                <th className="border border-green-200 px-4 py-3 text-left text-green-800 text-sm font-semibold">Username</th>
                <th className="border border-green-200 px-4 py-3 text-left text-green-800 text-sm font-semibold">Email</th>
                <th className="border border-green-200 px-4 py-3 text-left text-green-800 text-sm font-semibold">Full Name</th>
                <th className="border border-green-200 px-4 py-3 text-left text-green-800 text-sm font-semibold">Phone</th>
                <th className="border border-green-200 px-4 py-3 text-left text-green-800 text-sm font-semibold">Registered At</th>
                <th className="border border-green-200 px-4 py-3 text-left text-green-800 text-sm font-semibold">Order History</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => (
                <tr key={customer.id} className="hover:bg-green-50 transition-colors">
                  <td className="border border-green-200 px-4 py-3 text-sm font-medium">{customer.id}</td>
                  <td className="border border-green-200 px-4 py-3 text-sm font-medium">{customer.username}</td>
                  <td className="border border-green-200 px-4 py-3 text-sm break-all max-w-xs">{customer.email}</td>
                  <td className="border border-green-200 px-4 py-3 text-sm break-words">{customer.full_name}</td>
                  <td className="border border-green-200 px-4 py-3 text-sm">{customer.phone}</td>
                  <td className="border border-green-200 px-4 py-3 text-sm">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>
                  <td className="border border-green-200 px-4 py-3">
                    <button
                      onClick={() => handleViewOrderHistory(customer.id)}
                      className="text-green-600 hover:underline text-sm font-medium flex items-center gap-1"
                    >
                      <FileText size={16} />
                      View Order History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order History Side Panel */}
      <AnimatePresence>
        {selectedCustomerId && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="fixed top-0 right-0 h-full w-full lg:w-[60%] xl:w-[50%] bg-white shadow-2xl p-2 sm:p-4 lg:p-6 overflow-y-auto z-50"
          >
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-green-800 truncate">Orders (#{selectedCustomerId})</h2>
              <button onClick={closeSidePanel} className="text-green-600 hover:text-green-800 p-1">
                <X size={20} />
              </button>
            </div>

            {loadingOrders ? (
              <div className="text-center text-green-700 text-base sm:text-lg lg:text-xl font-semibold">Loading orders...</div>
            ) : errorOrders ? (
              <div className="text-center text-red-600 text-base sm:text-lg lg:text-xl font-semibold">Error: {errorOrders}</div>
            ) : orders.length === 0 ? (
              <div className="text-center text-gray-600 text-xs sm:text-sm lg:text-base">No orders found.</div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {sortedOrders.map(order => (
                  <motion.div
                    key={order.order_id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white shadow-lg rounded-md sm:rounded-lg p-2 sm:p-4 lg:p-6 border border-green-200"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                      <div>
                        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-green-700 mb-3 sm:mb-4">
                          Order #{order.order_id}
                        </h3>
                        <div className="space-y-2 text-xs sm:text-sm lg:text-base">
                          <p className="flex items-center text-gray-700">
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600 flex-shrink-0" />
                            <span className="truncate">{new Date(order.order_date).toLocaleString()}</span>
                          </p>
                          <p className="flex items-center text-gray-700">
                            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600 flex-shrink-0" />
                            <span>Total: ₹{parseFloat(order.total_amount).toFixed(2)}</span>
                          </p>
                          <p className="flex items-center text-gray-700">
                            <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600 flex-shrink-0" />
                            <span>Payment: {order.payment_method}</span>
                          </p>
                          <p className="flex flex-col sm:flex-row items-start sm:items-center text-gray-700">
                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600 flex-shrink-0" />
                            <span className="break-words text-xs sm:text-sm">
                              {order.address.street}, {order.address.city}, 
                              {order.address.state}, {order.address.zip_code}, 
                              {order.address.country}
                            </span>
                          </p>
                          <div className="flex items-center flex-wrap">
                            <label className="text-gray-700 font-medium mr-2 text-xs sm:text-sm">Status:</label>
                            {getStatusBadge(order.order_status)}
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base lg:text-lg font-medium text-green-700 mb-2 sm:mb-3">Items</h4>
                        <div className="space-y-3 sm:space-y-4">
                          {order.items.map(item => (
                            <div key={item.product_id} className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-4">
                              <img
                                src={`http://localhost:5000${item.thumbnail_url}`}
                                alt={item.name}
                                className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md flex-shrink-0"
                                onError={(e) => {
                                  e.target.src = "https://via.placeholder.com/64";
                                }}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-800 truncate text-xs sm:text-sm">{item.name}</p>
                                <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                                <p className="text-xs text-gray-600">
                                  Price: ₹{parseFloat(item.price_at_purchase).toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Subtotal: ₹{parseFloat(item.subtotal).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageCustomers;