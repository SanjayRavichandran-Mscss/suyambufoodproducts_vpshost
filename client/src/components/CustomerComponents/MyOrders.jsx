import React, { useState, useEffect } from "react";
import { Package, SquareX, ChevronLeft, Download } from "lucide-react";
import Invoice from "./Invoice"; // Adjust the path as needed
import html2pdf from "html2pdf.js";
import Swal from "sweetalert2";
import { createRoot } from "react-dom/client";

const MyOrders = ({
  customerId,
  handleCloseOrders,
  showOrdersModal,
  ordersAnimation,
}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const baseUrl = "http://localhost:5000";

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
    const fetchOrders = async () => {
      if (!customerId) {
        setError("No customer ID provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${baseUrl}/api/customer/orders?customerId=${customerId}`,
          {
            headers: {
              "Content-Type": "application/json",
              "Origin": "http://localhost:5173",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch orders");
        }

        const data = await response.json();
        console.log("MyOrders.jsx - Fetched orders:", data);
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (showOrdersModal) {
      fetchOrders();
    }
  }, [customerId, showOrdersModal, baseUrl]);

  const renderInvoiceData = (order) => {
    const orderSubtotal = order.items.reduce(
      (acc, item) => acc + parseFloat(item.subtotal),
      0
    );
    const shipping = 100.00; // Adjust based on your logic
    const tax = parseFloat(order.total_amount) - orderSubtotal - shipping;
    const invoiceData = {
      items: order.items.map((item) => ({
        name: item.name || "N/A",
        product_id: item.product_variant_id || "N/A",
        quantity: item.quantity || 0,
        unitPrice: parseFloat(item.price_at_purchase) || 0,
        subtotal: parseFloat(item.subtotal) || 0,
      })),
      subtotal: orderSubtotal || 0,
      shipping: shipping || 0,
      tax: tax || 0,
      totalAmount: parseFloat(order.total_amount) || 0,
      paymentMethod: order.payment_method || "N/A",
      paymentStatus: order.order_status === "order_placed" ? "Completed" : order.order_status || "N/A",
      transactionDate:
        new Date(order.order_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }) || "N/A",
      trackingNumber: order.tracking_number || null,
      full_name: order.customer?.full_name || "N/A",
      phone: order.customer?.phone || "N/A",
      email: order.customer?.email || "N/A",
      street: order.address?.street || "N/A",
      city: order.address?.city || "N/A",
      state: order.address?.state || "N/A",
      zip_code: order.address?.zip_code || "N/A",
      country: order.address?.country || "N/A",
      orderId: order.order_id || "N/A",
      orderDate:
        new Date(order.order_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }) || "N/A",
      orderStatus: order.order_status || "N/A",
      invoice_number: order.invoice_number || "N/A" // Added invoice_number
    };
    console.log("MyOrders.jsx - renderInvoiceData:", invoiceData);
    return invoiceData;
  };

  const downloadInvoiceAsPDF = (order) => {
    // Render the Invoice component off-screen for PDF generation
    const invoiceData = renderInvoiceData(order);
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px"; // Move off-screen
    document.body.appendChild(tempContainer);

    // Create a unique ID for the invoice
    const invoiceId = `invoice-content-${order.order_id}`;
    tempContainer.innerHTML = `<div id="${invoiceId}"></div>`;

    try {
      // Use createRoot for React 18+
      const root = createRoot(tempContainer.querySelector(`#${invoiceId}`));
      root.render(<Invoice invoiceData={invoiceData} />);

      setTimeout(() => {
        const element = document.getElementById(invoiceId);
        if (!element) {
          console.error(`Element with ID "${invoiceId}" not found`);
          showMessage("Failed to generate PDF: Invoice content not found", "error");
          document.body.removeChild(tempContainer);
          return;
        }

        const opt = {
          margin: [0.5, 0.5, 1, 0.5],
          filename: `Invoice_${order.invoice_number || 'Order_' + order.order_id}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        };

        html2pdf()
          .set(opt)
          .from(element)
          .save()
          .then(() => {
            console.log("PDF generation complete for order:", order.order_id);
            showMessage("Invoice downloaded successfully", "success");
            document.body.removeChild(tempContainer);
            root.unmount(); // Clean up the root
          })
          .catch((err) => {
            console.error("PDF generation failed:", err);
            showMessage("Failed to generate PDF: " + err.message, "error");
            document.body.removeChild(tempContainer);
            root.unmount(); // Clean up the root
          });
      }, 500); // Delay to ensure rendering
    } catch (err) {
      console.error("Failed to render invoice for PDF:", err);
      showMessage("Failed to generate PDF: Unable to render invoice", "error");
      document.body.removeChild(tempContainer);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black/30 flex z-50 transition-opacity duration-300 ${
        ordersAnimation.includes("in") ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleCloseOrders}
    >
      <div
        className="ml-auto h-full w-full sm:w-1/2 bg-white shadow-xl relative transition-transform duration-300 p-0 pt-0 overflow-y-auto custom-scrollbar"
        style={{
          transform: ordersAnimation === "slide-in" ? "translateX(0)" : "translateX(100%)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-100 pt-6 pb-4 px-6 flex justify-between items-center">
          {selectedOrder ? (
            <div className="flex items-center">
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-500 hover:text-gray-700 mr-3"
                aria-label="Back to Orders"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="flex flex-col">
                <h2 className="font-bold text-xl text-gray-900">Invoice</h2>
                <span className="text-gray-500 text-sm mt-1">#{selectedOrder.invoice_number || 'N/A'}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <Package size={24} className="text-green-600 mr-3" />
              <div className="flex flex-col">
                <h2 className="font-bold text-xl text-gray-900">My Orders</h2>
                <span className="text-gray-500 text-sm mt-1">
                  {orders.length} {orders.length === 1 ? "order" : "orders"}
                </span>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            {selectedOrder && (
              <button
                onClick={() => downloadInvoiceAsPDF(selectedOrder)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-500 hover:text-gray-700"
                style={{ cursor: "pointer" }}
                aria-label="Download Invoice"
              >
                <Download size={22} />
              </button>
            )}
            <button
              onClick={handleCloseOrders}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-500 hover:text-gray-700 cursor-pointer"
              aria-label="Close Orders"
            >
              <SquareX size={22} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="pt-1 pb-0">
          {selectedOrder ? (
            <div className="p-6">
              <Invoice invoiceData={renderInvoiceData(selectedOrder)} />
            </div>
          ) : loading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your orders...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 px-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <SquareX size={32} className="text-red-500" />
              </div>
              <p className="text-red-600 text-base mb-4">{error}</p>
              <button
                className="text-sm text-green-600 hover:text-green-700 font-medium cursor-pointer"
                onClick={handleCloseOrders}
              >
                Close
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Package size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-base mb-2">No orders yet</p>
              <p className="text-gray-400 text-sm mb-4">Start shopping to see your orders here</p>
              <button
                className="text-sm text-green-600 hover:text-green-700 font-medium cursor-pointer"
                onClick={handleCloseOrders}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4 px-6 pb-6">
              {orders.map((order) => (
                <div
                  key={order.order_id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-base">
                        Invoice #{order.invoice_number || 'N/A'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.order_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.order_status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order.order_status === "shipped"
                            ? "bg-blue-100 text-blue-800"
                            : order.order_status === "processing"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.order_status}
                      </span>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 text-sm font-medium hover:underline px-2 py-1 rounded"
                        style={{ cursor: "pointer" }}
                      >
                        View Invoice
                      </button>
                      <button
                        onClick={() => downloadInvoiceAsPDF(order)}
                        className="text-blue-600 text-sm font-medium hover:underline px-2 py-1 rounded"
                        style={{ cursor: "pointer" }}
                      >
                        Download Invoice
                      </button>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <p className="text-gray-600">
                        Payment: <span className="font-medium">{order.payment_method}</span>
                      </p>
                      <p className="text-gray-600">
                        Method: <span className="font-medium">{order.order_method}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">
                        Total: <span className="font-semibold text-green-600">
                          ₹{parseFloat(order.total_amount).toFixed(2)}
                        </span>
                      </p>
                      {order.tracking_number && (
                        <p className="text-gray-600">
                          Tracking: <span className="font-medium">{order.tracking_number}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t border-gray-200 pt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Items:</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div
                          key={`${item.product_variant_id}-${index}`}
                          className="flex items-center gap-3"
                        >
                          <img
                            src={item.thumbnail_url ? `${baseUrl}${item.thumbnail_url}` : "/fallback-image.png"}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-md border border-gray-200"
                            onError={(e) => {
                              e.target.src = "/fallback-image.png";
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-gray-500">
                                {parseFloat(item.variant_quantity).toFixed(2)} {item.uom_name} @ ₹
                                {parseFloat(item.price_at_purchase).toFixed(2)}
                              </p>
                              <p className="text-sm font-medium text-gray-700">
                                ₹{parseFloat(item.subtotal).toFixed(2)}
                              </p>
                            </div>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Delivery Address:</h4>
                    <p className="text-xs text-gray-600">
                      {order.address.street}, {order.address.city}, {order.address.state}{" "}
                      {order.address.zip_code}, {order.address.country}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;