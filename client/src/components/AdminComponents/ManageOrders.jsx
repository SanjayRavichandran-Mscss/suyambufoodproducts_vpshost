// import React, { useState, useEffect } from "react";
// import { Clock, MapPin, Package, DollarSign, User, Edit3 } from "lucide-react";
// import { motion } from "framer-motion";
// import Swal from 'sweetalert2';

// const statusOptions = [
//   "order_placed",
//   "confirmed",
//   "processing",
//   "ready_to_ship",
//   "dispatched",
//   "shipping",
//   "out_for_delivery",
//   "delivered"
// ];

// const getStatusColor = (status) => {
//   const colors = {
//     order_placed: 'bg-yellow-100 text-yellow-800 border-yellow-200',
//     confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
//     processing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
//     ready_to_ship: 'bg-purple-100 text-purple-800 border-purple-200',
//     dispatched: 'bg-orange-100 text-orange-800 border-orange-200',
//     shipping: 'bg-teal-100 text-teal-800 border-teal-200',
//     out_for_delivery: 'bg-pink-100 text-pink-800 border-pink-200',
//     delivered: 'bg-green-100 text-green-800 border-green-200'
//   };
//   return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
// };

// const getStatusDisplay = (status) => status.replace(/_/g, ' ').toUpperCase();

// const ManageOrders = () => {
//   const [orders, setOrders] = useState([]);
//   const [orderStatuses, setOrderStatuses] = useState({});
//   const [isEditing, setIsEditing] = useState(null);
//   const [originalStatus, setOriginalStatus] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const response = await fetch("http://localhost:5000/api/admin/orders");
//         if (!response.ok) {
//           throw new Error("Failed to fetch orders");
//         }
//         const data = await response.json();
//         setOrders(data);
//         setOrderStatuses(
//           data.reduce((acc, order) => ({
//             ...acc,
//             [order.order_id]: order.order_status
//           }), {})
//         );
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, []);

//   const handleEditStart = (orderId) => {
//     const current = orderStatuses[orderId];
//     setOriginalStatus(prev => ({ ...prev, [orderId]: current }));
//     setIsEditing(orderId);
//   };

//   const handleStatusChange = (orderId, newStatus) => {
//     setOrderStatuses(prev => ({ ...prev, [orderId]: newStatus }));
//   };

//   const isStatusChanged = (orderId) => {
//     return orderStatuses[orderId] !== originalStatus[orderId];
//   };

//   const handleSave = async (orderId) => {
//     if (!isStatusChanged(orderId)) return;

//     const newStatus = orderStatuses[orderId];
//     try {
//       const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ status: newStatus })
//       });
//       if (!response.ok) {
//         throw new Error('Failed to update status');
//       }
//       setIsEditing(null);
//       setOriginalStatus(prev => {
//         const newPrev = { ...prev };
//         delete newPrev[orderId];
//         return newPrev;
//       });
//       // Success toast
//       Swal.fire({
//         toast: true,
//         position: 'bottom-end',
//         showConfirmButton: false,
//         timer: 2000,
//         title: 'Success!',
//         text: `Order ${orderId} status updated to ${getStatusDisplay(newStatus)} successfully.`,
//         icon: 'success',
//         customClass: {
//           popup: 'swal2-popup-enhanced',
//           title: 'swal2-title-enhanced',
//           content: 'swal2-content-enhanced'
//         },
//         background: '#10b981',
//         color: 'white'
//       });
//     } catch (err) {
//       // Revert on error
//       handleCancel(orderId);
//       Swal.fire({
//         icon: 'error',
//         title: 'Oops...',
//         text: 'Failed to update status: ' + err.message,
//         toast: true,
//         position: 'bottom-end',
//         showConfirmButton: false,
//         timer: 3000
//       });
//     }
//   };

//   const handleCancel = (orderId) => {
//     const orig = originalStatus[orderId];
//     if (orig !== undefined) {
//       setOrderStatuses(prev => ({ ...prev, [orderId]: orig }));
//     }
//     setIsEditing(null);
//     setOriginalStatus(prev => {
//       const newPrev = { ...prev };
//       delete newPrev[orderId];
//       return newPrev;
//     });
//   };

//   const sortedOrders = [...orders].sort((a, b) => 
//     new Date(b.order_date) - new Date(a.order_date)
//   );

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           className="text-green-700 text-xl font-semibold flex items-center space-x-2"
//         >
//           <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-700"></div>
//           <span>Loading orders...</span>
//         </motion.div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           className="text-red-600 text-xl font-semibold bg-red-50 p-4 rounded-lg border border-red-200"
//         >
//           Error: {error}
//         </motion.div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="max-w-7xl mx-auto"
//       >
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
//           <h1 className="text-3xl font-bold text-green-800">
//             Manage Orders
//           </h1>
//           <p className="text-gray-600 mt-2 sm:mt-0">Total Orders: {sortedOrders.length}</p>
//         </div>
//         {sortedOrders.length === 0 ? (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="text-center text-gray-600 py-12"
//           >
//             <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
//             <p>No orders found.</p>
//           </motion.div>
//         ) : (
//           <div className="space-y-6">
//             {sortedOrders.map(order => (
//               <motion.div
//                 key={order.order_id}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.3 }}
//                 className="bg-white shadow-xl rounded-xl p-6 border border-green-100 overflow-hidden"
//               >
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                   <div className="space-y-6">
//                     {/* Customer Details Section */}
//                     <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
//                       <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
//                         <User className="w-5 h-5 mr-2 text-green-600" />
//                         Customer Details
//                       </h3>
//                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
//                         <div className="space-y-2">
//                           <p className="flex items-center text-gray-700">
//                             <span className="font-medium text-gray-500 w-20">Name:</span>
//                             <span className="ml-auto">{order.customer.full_name}</span>
//                           </p>
//                           <p className="flex items-center text-gray-700">
//                             <span className="font-medium text-gray-500 w-20">Username:</span>
//                             <span className="ml-auto">{order.customer.username}</span>
//                           </p>
//                         </div>
//                         <div className="space-y-2">
//                           <p className="flex items-center text-gray-700">
//                             <span className="font-medium text-gray-500 w-20">Email:</span>
//                             <span className="ml-auto">{order.customer.email}</span>
//                           </p>
//                           <p className="flex items-center text-gray-700">
//                             <span className="font-medium text-gray-500 w-20">Phone:</span>
//                             <span className="ml-auto">{order.customer.phone}</span>
//                           </p>
//                           <p className="flex items-center text-gray-700">
//                             <span className="font-medium text-gray-500 w-20">Registered:</span>
//                             <span className="ml-auto text-xs">{new Date(order.customer.created_at).toLocaleDateString()}</span>
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Order Details Section */}
//                     <div className="space-y-4">
//                       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//                         <h2 className="text-xl font-bold text-green-800 flex items-center">
//                           Order #{order.order_id}
//                         </h2>
//                         <div className="flex items-center space-x-2 mt-2 sm:mt-0">
//                           <Clock className="w-4 h-4 text-green-600" />
//                           <span className="text-sm text-gray-600">
//                             {new Date(order.order_date).toLocaleDateString()}
//                           </span>
//                         </div>
//                       </div>
//                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
//                         <p className="flex items-center text-gray-700">
//                           <DollarSign className="w-4 h-4 mr-2 text-green-600" />
//                           Total: ₹{parseFloat(order.total_amount).toFixed(2)}
//                         </p>
//                         <p className="flex items-center text-gray-700">
//                           <Package className="w-4 h-4 mr-2 text-green-600" />
//                           Payment: {order.payment_method}
//                         </p>
//                       </div>
//                       <div className="bg-gray-50 p-4 rounded-lg">
//                         <p className="flex items-start text-gray-700 mb-3">
//                           <MapPin className="w-4 h-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
//                           <span className="text-sm leading-relaxed">
//                             {order.address.street}, {order.address.city}, {order.address.state} - {order.address.zip_code}, {order.address.country}
//                           </span>
//                         </p>
//                       </div>
//                       <div className="space-y-2">
//                         {!isEditing || isEditing !== order.order_id ? (
//                           <div className="flex items-center justify-between">
//                             <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(orderStatuses[order.order_id])}`}>
//                               {getStatusDisplay(orderStatuses[order.order_id])}
//                             </div>
//                             <button
//                               onClick={() => handleEditStart(order.order_id)}
//                               className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
//                             >
//                               <Edit3 className="w-4 h-4" />
//                               <span>Update Status</span>
//                             </button>
//                           </div>
//                         ) : (
//                           <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
//                             <div className="flex items-center space-x-2 flex-1">
//                               <label className="text-gray-700 font-medium text-sm">Status:</label>
//                               <select
//                                 value={orderStatuses[order.order_id]}
//                                 onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
//                                 className="flex-1 p-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
//                               >
//                                 {statusOptions.map(status => (
//                                   <option key={status} value={status}>
//                                     {getStatusDisplay(status)}
//                                   </option>
//                                 ))}
//                               </select>
//                             </div>
//                             <div className="flex space-x-2">
//                               <button
//                                 onClick={() => handleSave(order.order_id)}
//                                 disabled={!isStatusChanged(order.order_id)}
//                                 className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
//                               >
//                                 <span>Save</span>
//                               </button>
//                               <button
//                                 onClick={() => handleCancel(order.order_id)}
//                                 className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors flex items-center space-x-1"
//                               >
//                                 <span>Cancel</span>
//                               </button>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                   <div className="space-y-4">
//                     <h3 className="text-lg font-semibold text-green-800 flex items-center">
//                       Order Items
//                     </h3>
//                     <div className="space-y-3 max-h-96 overflow-y-auto">
//                       {order.items.map(item => (
//                         <div key={item.product_variant_id} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
//                           <img
//                             src={`http://localhost:5000${item.thumbnail_url}`}
//                             alt={item.name}
//                             className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
//                             onError={(e) => {
//                               e.target.src = "https://via.placeholder.com/64?text=No+Image";
//                             }}
//                           />
//                           <div className="flex-1 min-w-0">
//                             <p className="font-medium text-gray-900 truncate">{item.name}</p>
//                             <p className="text-sm text-gray-600 mt-1">Qty: {item.quantity} {item.uom_name || ''}</p>
//                             <div className="flex justify-between items-end mt-2">
//                               <div className="text-sm text-gray-500">
//                                 ₹{parseFloat(item.price_at_purchase).toFixed(2)} x {item.quantity}
//                               </div>
//                               <div className="font-medium text-green-600">
//                                 ₹{parseFloat(item.subtotal).toFixed(2)}
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                     {order.items.length === 0 && (
//                       <p className="text-center text-gray-500 py-4">No items in this order.</p>
//                     )}
//                   </div>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         )}
//       </motion.div>
//     </div>
//   );
// };

// export default ManageOrders;




import React, { useState, useEffect } from "react";
import { Clock, MapPin, Package, DollarSign, User, Edit3 } from "lucide-react";
import { motion } from "framer-motion";
import Swal from 'sweetalert2';

const getStatusColor = (status) => {
  const key = status.toLowerCase().replace(/\s+/g, '_');
  const colors = {
    order_placed: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    processing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    ready_to_ship: 'bg-purple-100 text-purple-800 border-purple-200',
    dispatched: 'bg-orange-100 text-orange-800 border-orange-200',
    shipping: 'bg-teal-100 text-teal-800 border-teal-200',
    out_of_delivery: 'bg-pink-100 text-pink-800 border-pink-200',
    out_for_delivery: 'bg-pink-100 text-pink-800 border-pink-200',
    delivered: 'bg-green-100 text-green-800 border-green-200'
  };
  return colors[key] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [orderStatuses, setOrderStatuses] = useState({});
  const [statusOptions, setStatusOptions] = useState([
    "Order Placed",
    "confirmed",
    "processing",
    "Ready to Ship",
    "dispatched",
    "shipping",
    "Out of Delivery",
    "delivered"
  ]);
  const [isEditing, setIsEditing] = useState(null);
  const [originalStatus, setOriginalStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/admin/orders");
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        const { orders: data, statuses } = await response.json();
        setOrders(data);
        setStatusOptions(statuses || statusOptions);
        setOrderStatuses(
          data.reduce((acc, order) => ({
            ...acc,
            [order.order_id]: order.order_status
          }), {})
        );
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleEditStart = (orderId) => {
    const current = orderStatuses[orderId];
    setOriginalStatus(prev => ({ ...prev, [orderId]: current }));
    setIsEditing(orderId);
  };

  const handleStatusChange = (orderId, newStatus) => {
    setOrderStatuses(prev => ({ ...prev, [orderId]: newStatus }));
  };

  const isStatusChanged = (orderId) => {
    return orderStatuses[orderId] !== originalStatus[orderId];
  };

  const handleSave = async (orderId) => {
    if (!isStatusChanged(orderId)) return;

    const newStatus = orderStatuses[orderId];
    try {
      const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      setIsEditing(null);
      setOriginalStatus(prev => {
        const newPrev = { ...prev };
        delete newPrev[orderId];
        return newPrev;
      });
      // Success toast
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 2000,
        title: 'Success!',
        text: `Order ${orderId} status updated to ${newStatus} successfully.`,
        icon: 'success',
        customClass: {
          popup: 'swal2-popup-enhanced',
          title: 'swal2-title-enhanced',
          content: 'swal2-content-enhanced'
        },
        background: '#10b981',
        color: 'white'
      });
    } catch (err) {
      // Revert on error
      handleCancel(orderId);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to update status: ' + err.message,
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  };

  const handleCancel = (orderId) => {
    const orig = originalStatus[orderId];
    if (orig !== undefined) {
      setOrderStatuses(prev => ({ ...prev, [orderId]: orig }));
    }
    setIsEditing(null);
    setOriginalStatus(prev => {
      const newPrev = { ...prev };
      delete newPrev[orderId];
      return newPrev;
    });
  };

  const sortedOrders = [...orders].sort((a, b) => 
    new Date(b.order_date) - new Date(a.order_date)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-green-700 text-xl font-semibold flex items-center space-x-2"
        >
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-700"></div>
          <span>Loading orders...</span>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-600 text-xl font-semibold bg-red-50 p-4 rounded-lg border border-red-200"
        >
          Error: {error}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-bold text-green-800">
            Manage Orders
          </h1>
          <p className="text-gray-600 mt-2 sm:mt-0">Total Orders: {sortedOrders.length}</p>
        </div>
        {sortedOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center text-gray-600 py-12"
          >
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p>No orders found.</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {sortedOrders.map(order => (
              <motion.div
                key={order.order_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white shadow-xl rounded-xl p-6 border border-green-100 overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    {/* Customer Details Section */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                      <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2 text-green-600" />
                        Customer Details
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <p className="flex items-center text-gray-700">
                            <span className="font-medium text-gray-500 w-20">Name:</span>
                            <span className="ml-auto">{order.customer.full_name}</span>
                          </p>
                          <p className="flex items-center text-gray-700">
                            <span className="font-medium text-gray-500 w-20">Username:</span>
                            <span className="ml-auto">{order.customer.username}</span>
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="flex items-center text-gray-700">
                            <span className="font-medium text-gray-500 w-20">Email:</span>
                            <span className="ml-auto">{order.customer.email}</span>
                          </p>
                          <p className="flex items-center text-gray-700">
                            <span className="font-medium text-gray-500 w-20">Phone:</span>
                            <span className="ml-auto">{order.customer.phone}</span>
                          </p>
                          <p className="flex items-center text-gray-700">
                            <span className="font-medium text-gray-500 w-20">Registered:</span>
                            <span className="ml-auto text-xs">{new Date(order.customer.created_at).toLocaleDateString()}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Details Section */}
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-xl font-bold text-green-800 flex items-center">
                          Order #{order.order_id}
                        </h2>
                        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                          <Clock className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">
                            {new Date(order.order_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <p className="flex items-center text-gray-700">
                          <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                          Total: ₹{parseFloat(order.total_amount).toFixed(2)}
                        </p>
                        <p className="flex items-center text-gray-700">
                          <Package className="w-4 h-4 mr-2 text-green-600" />
                          Payment: {order.payment_method}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="flex items-start text-gray-700 mb-3">
                          <MapPin className="w-4 h-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm leading-relaxed">
                            {order.address.street}, {order.address.city}, {order.address.state} - {order.address.zip_code}, {order.address.country}
                          </span>
                        </p>
                      </div>
                      <div className="space-y-2">
                        {!isEditing || isEditing !== order.order_id ? (
                          <div className="flex items-center justify-between">
                            <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(orderStatuses[order.order_id])}`}>
                              {orderStatuses[order.order_id]}
                            </div>
                            <button
                              onClick={() => handleEditStart(order.order_id)}
                              className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                              <Edit3 className="w-4 h-4" />
                              <span>Update Status</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <div className="flex items-center space-x-2 flex-1">
                              <label className="text-gray-700 font-medium text-sm">Status:</label>
                              <select
                                value={orderStatuses[order.order_id]}
                                onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                                className="flex-1 p-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                              >
                                {statusOptions.map(status => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSave(order.order_id)}
                                disabled={!isStatusChanged(order.order_id)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                              >
                                <span>Save</span>
                              </button>
                              <button
                                onClick={() => handleCancel(order.order_id)}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors flex items-center space-x-1"
                              >
                                <span>Cancel</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-green-800 flex items-center">
                      Order Items
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {order.items.map(item => (
                        <div key={item.product_variant_id} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
                          <img
                            src={`http://localhost:5000${item.thumbnail_url}`}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/64?text=No+Image";
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{item.name}</p>
                            <p className="text-sm text-gray-600 mt-1">Qty: {item.quantity} {item.uom_name || ''}</p>
                            <div className="flex justify-between items-end mt-2">
                              <div className="text-sm text-gray-500">
                                ₹{parseFloat(item.price_at_purchase).toFixed(2)} x {item.quantity}
                              </div>
                              <div className="font-medium text-green-600">
                                ₹{parseFloat(item.subtotal).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {order.items.length === 0 && (
                      <p className="text-center text-gray-500 py-4">No items in this order.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ManageOrders;