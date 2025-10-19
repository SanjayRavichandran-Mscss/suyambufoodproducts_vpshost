// src/components/CustomerComponents/PaymentMethod.jsx
import React from "react";

const PaymentMethod = ({
  selectedPaymentMethodId,
  setSelectedPaymentMethodId,
}) => {
  const options = [
    // {
    //   id: 1,
    //   title: "Cash on Delivery",
    //   description: "Pay with cash when the order is delivered.",
    // },
    {
      id: 2,
      title: "Online Payment",
      description:
        "Pay securely (cards, UPI, wallets, netbanking).",
    },
  ];

  const handleSelect = (id) => {
    if (typeof setSelectedPaymentMethodId === "function") {
      setSelectedPaymentMethodId(id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Payment Method
      </h2>

      <div className="space-y-4">
        {options.map((opt) => {
          const active = selectedPaymentMethodId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt.id)}
              className={`w-full text-left border rounded-lg p-4 transition-colors ${
                active
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-green-300"
              }`}
              aria-pressed={active}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{opt.title}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {opt.description}
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    active
                      ? "border-green-600 bg-green-600"
                      : "border-gray-300 bg-white"
                  }`}
                  aria-hidden="true"
                >
                  {active && <span className="block w-2 h-2 bg-white rounded-full" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Note: Card fields removed intentionally because Razorpay Checkout collects payment details securely */}
      <div className="flex items-center gap-2 mt-6 text-sm text-gray-600">
        <span className="inline-block w-3 h-3 rounded-full border border-green-600" />
        <span>Secure payment processing</span>
      </div>
    </div>
  );
};

export default PaymentMethod;
