import React from 'react';

const Invoice = ({ invoiceData }) => {
  const { 
    items, 
    subtotal, 
    shipping, 
    tax, 
    totalAmount, 
    paymentMethod, 
    paymentStatus, 
    transactionDate, 
    trackingNumber, 
    full_name, 
    phone, 
    email, 
    street, 
    city, 
    state, 
    zip_code, 
    country, 
    orderId, 
    orderDate, 
    orderStatus,
    invoice_number // Added invoice_number
  } = invoiceData || {};

  // Debugging: Log invoiceData to verify props
  console.log('Invoice.jsx - invoiceData:', invoiceData);

  // Use dynamic ID based on orderId
  const invoiceId = orderId ? `invoice-content-${orderId}` : 'invoice-content';

  return (
    <div
      id={invoiceId}
      style={{
        maxWidth: '800px',
        margin: '20px auto',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
        lineHeight: 1.6,
        color: '#3C2F2F',
        fontSize: '14px',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #FDFCFA 0%, #F0EAD6 100%)',
          color: '#2E7D32',
          padding: '20px 25px',
          textAlign: 'center',
          position: 'relative',
          borderBottom: '2px solid #4A3728',
        }}
      >
        <div
          style={{
            content: '',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,<svg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 100 100\\"><defs><pattern id=\\"grid\\" width=\\"10\\" height=\\"10\\" patternUnits=\\"userSpaceOnUse\\"><path d=\\"M 10 0 L 0 0 0 10\\" fill=\\"none\\" stroke=\\"rgba(74,55,40,0.1)\\" stroke-width=\\"1\\"/></pattern></defs><rect width=\\"100\\" height=\\"100\\" fill=\\"url(%23grid)\\"/></svg>")',
            opacity: 0.2,
          }}
        />
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
          }}
        >
          <img
            src="/Assets/Suyambu_Eng_logo.png"
            alt="Suyambu Food Products Logo"
            style={{
              height: '60px',
              filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))',
            }}
          />
          <div>
            <h1
              style={{
                fontSize: '26px',
                fontWeight: 700,
                margin: 0,
                color: '#2E7D32',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              Suyambu Food Products
            </h1>
            <h2
              style={{
                fontSize: '22px',
                fontWeight: 600,
                letterSpacing: '1px',
                color: '#4A3728',
                margin: 0,
              }}
            >
              INVOICE
            </h2>
          </div>
        </div>
      </div>

      {/* Invoice Information */}
      <div
        style={{
          padding: '25px 30px',
          background: 'linear-gradient(135deg, #E8F5E9 0%, #F0EAD6 100%)',
          borderBottom: '2px solid #2E7D32',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '30px',
            marginBottom: '20px',
          }}
        >
          <div>
            <h3
              style={{
                color: '#2E7D32',
                fontSize: '16px',
                marginBottom: '10px',
                borderBottom: '1px solid #d1fae5',
                paddingBottom: '6px',
                fontWeight: 600,
              }}
            >
              📧 Bill To:
            </h3>
            <p style={{ margin: '6px 0', fontSize: '13px', lineHeight: 1.5 }}>
              <strong style={{ color: '#4A3728', fontWeight: 600 }}>{full_name || 'N/A'}</strong>
            </p>
            <p style={{ margin: '6px 0', fontSize: '13px', lineHeight: 1.5 }}>{email || 'N/A'}</p>
            <p style={{ margin: '6px 0', fontSize: '13px', lineHeight: 1.5 }}>{phone || 'N/A'}</p>
            <p style={{ margin: '6px 0', fontSize: '13px', lineHeight: 1.5 }}>
              {street || 'N/A'}, {city || 'N/A'}, {state || 'N/A'} {zip_code || 'N/A'}, {country || 'N/A'}
            </p>
          </div>
          <div>
            <h3
              style={{
                color: '#2E7D32',
                fontSize: '16px',
                marginBottom: '10px',
                borderBottom: '1px solid #d1fae5',
                paddingBottom: '6px',
                fontWeight: 600,
              }}
            >
              📄 Invoice Details:
            </h3>
            <p style={{ margin: '6px 0', fontSize: '13px', lineHeight: 1.5 }}>
              <strong style={{ color: '#4A3728', fontWeight: 600 }}>Invoice Number:</strong> {invoice_number || 'N/A'}
            </p>
            <p style={{ margin: '6px 0', fontSize: '13px', lineHeight: 1.5 }}>
              <strong style={{ color: '#4A3728', fontWeight: 600 }}>Order Date:</strong> {orderDate || 'N/A'}
            </p>
            <p style={{ margin: '6px 0', fontSize: '13px', lineHeight: 1.5 }}>
              <strong style={{ color: '#4A3728', fontWeight: 600 }}>Payment Method:</strong> {paymentMethod || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div style={{ padding: '30px' }}>
        <h2
          style={{
            color: '#2E7D32',
            fontSize: '20px',
            marginBottom: '20px',
            textAlign: 'center',
            borderBottom: '2px solid #d1fae5',
            paddingBottom: '10px',
            fontWeight: 600,
          }}
        >
          📦 Order Items
        </h2>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '25px',
            borderRadius: '6px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                  color: 'white',
                  padding: '12px 15px',
                  textAlign: 'left',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  width: '50%',
                }}
              >
                Item Details
              </th>
              <th
                style={{
                  background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                  color: 'white',
                  padding: '12px 15px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  width: '15%',
                }}
              >
                Quantity
              </th>
              <th
                style={{
                  background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                  color: 'white',
                  padding: '12px 15px',
                  textAlign: 'right',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  width: '17.5%',
                }}
              >
                Unit Price
              </th>
              <th
                style={{
                  background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                  color: 'white',
                  padding: '12px 15px',
                  textAlign: 'right',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  width: '17.5%',
                }}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items && items.length > 0 ? (
              items.map((item, index) => (
                <tr
                  key={index}
                  style={index % 2 === 0 ? { backgroundColor: '#F7FAF2' } : { backgroundColor: '#FDFCFA' }}
                >
                  <td
                    style={{
                      padding: '12px 15px',
                      borderBottom: '1px solid #E8ECEF',
                      fontSize: '13px',
                      verticalAlign: 'top',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        color: '#3C2F2F',
                        marginBottom: '4px',
                      }}
                    >
                      {item.name || 'N/A'}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: '12px 15px',
                      borderBottom: '1px solid #E8ECEF',
                      fontSize: '13px',
                      textAlign: 'center',
                      verticalAlign: 'top',
                    }}
                  >
                    {item.quantity || 'N/A'}
                  </td>
                  <td
                    style={{
                      padding: '12px 15px',
                      borderBottom: '1px solid #E8ECEF',
                      fontSize: '13px',
                      textAlign: 'right',
                      verticalAlign: 'top',
                    }}
                  >
                    ₹{(item.unitPrice || 0).toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: '12px 15px',
                      borderBottom: '1px solid #E8ECEF',
                      fontSize: '13px',
                      textAlign: 'right',
                      verticalAlign: 'top',
                    }}
                  >
                    <strong>₹{(item.subtotal || 0).toFixed(2)}</strong>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ padding: '12px 15px', textAlign: 'center', fontSize: '13px' }}>
                  No items available
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Total Section */}
        <div
          style={{
            background: 'linear-gradient(135deg, #E8F5E9 0%, #F0EAD6 100%)',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '20px',
            border: '1px solid #2E7D32',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              margin: '8px 0',
              fontSize: '14px',
              padding: '6px 0',
            }}
          >
            <span style={{ color: '#4A3728', fontWeight: 500 }}>💰 Subtotal:</span>
            <span style={{ fontWeight: 600, color: '#3C2F2F' }}>₹{(subtotal || 0).toFixed(2)}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              margin: '8px 0',
              fontSize: '14px',
              padding: '6px 0',
            }}
          >
            <span style={{ color: '#4A3728', fontWeight: 500 }}>🚚 Shipping:</span>
            <span style={{ fontWeight: 600, color: '#3C2F2F' }}>
              {shipping === 0 ? 'FREE 🎉' : `₹${(shipping || 0).toFixed(2)}`}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              margin: '8px 0',
              fontSize: '14px',
              padding: '6px 0',
            }}
          >
            <span style={{ color: '#4A3728', fontWeight: 500 }}>📊 Tax (GST 18%):</span>
            <span style={{ fontWeight: 600, color: '#3C2F2F' }}>₹{(tax || 0).toFixed(2)}</span>
          </div>
          <div
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, #2E7D32, transparent)',
              margin: '15px 0',
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              margin: '10px 0',
              padding: '6px 0',
              borderTop: '2px solid #2E7D32',
              paddingTop: '12px',
              fontSize: '16px',
              fontWeight: 700,
              color: '#2E7D32',
            }}
          >
            <span>💎 Total Amount:</span>
            <span>₹{(totalAmount || 0).toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Information */}
        <div
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '20px',
            borderLeft: '3px solid #2E7D32',
            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.1)',
          }}
        >
          <h3
            style={{
              color: '#2E7D32',
              marginBottom: '12px',
              fontSize: '16px',
              fontWeight: 600,
            }}
          >
            💳 Payment Information
          </h3>
          <p style={{ margin: '6px 0', fontSize: '13px' }}>
            <strong style={{ color: '#3C2F2F' }}>Payment Method:</strong> {paymentMethod || 'N/A'}
          </p>
          <p style={{ margin: '6px 0', fontSize: '13px' }}>
            <strong style={{ color: '#3C2F2F' }}>Payment Status:</strong> {paymentStatus || 'N/A'} ✅
          </p>
          {trackingNumber && (
            <p style={{ margin: '6px 0', fontSize: '13px' }}>
              <strong style={{ color: '#3C2F2F' }}>Tracking Number:</strong> {trackingNumber} 📦
            </p>
          )}
          <p style={{ margin: '6px 0', fontSize: '13px' }}>
            <strong style={{ color: '#3C2F2F' }}>Transaction Date:</strong> {transactionDate || 'N/A'}
          </p>
        </div>

        {/* Return Policy */}
        <div
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '20px',
            borderLeft: '3px solid #2E7D32',
            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.1)',
          }}
        >
          <h3
            style={{
              color: '#2E7D32',
              marginBottom: '12px',
              fontSize: '16px',
              fontWeight: 600,
            }}
          >
            🔄 Return Policy
          </h3>
          <p style={{ margin: '6px 0', fontSize: '13px' }}>
            ✅ 7-day hassle-free returns on unused items in original condition.
          </p>
          <p style={{ margin: '6px 0', fontSize: '13px' }}>
            🆓 Free returns for defective products with full refund or replacement.
          </p>
          <p style={{ margin: '6px 0', fontSize: '13px' }}>
            💯 Your satisfaction is our priority!
          </p>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          background: 'linear-gradient(135deg, #4A3728 0%, #3C2F2F 100%)',
          color: 'white',
          padding: '25px 30px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '15px',
          }}
        >
          <div>
            <h4
              style={{
                color: '#E8F5E9',
                marginBottom: '10px',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              📞 Contact Us
            </h4>
            <p style={{ fontSize: '12px', opacity: '0.9', margin: '4px 0', lineHeight: '1.4' }}>
              Email: suyambufoodstores@gmail.com
            </p>
            <p style={{ fontSize: '12px', opacity: '0.9', margin: '4px 0', lineHeight: '1.4' }}>
              Phone: +91 9965162714 | +91 9345872342
            </p>
            <p style={{ fontSize: '12px', opacity: '0.9', margin: '4px 0', lineHeight: '1.4' }}>
              Address: Sirumugai, Mettupalayam Taluk, Coimbatore
            </p>
          </div>
          <div>
            <h4
              style={{
                color: '#E8F5E9',
                marginBottom: '10px',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              🔄 Return Policy
            </h4>
            <p style={{ fontSize: '12px', opacity: '0.9', margin: '4px 0', lineHeight: '1.4' }}>
              ✅ 7-day hassle-free returns
            </p>
            <p style={{ fontSize: '12px', opacity: '0.9', margin: '4px 0', lineHeight: '1.4' }}>
              📦 Items must be in original condition
            </p>
            <p style={{ fontSize: '12px', opacity: '0.9', margin: '4px 0', lineHeight: '1.4' }}>
              💯 100% satisfaction guaranteed
            </p>
          </div>
        </div>
        <div
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #2E7D32, transparent)',
            margin: '15px 0',
          }}
        />
        <div
          style={{
            fontSize: '16px',
            color: '#E8F5E9',
            fontWeight: 700,
            marginTop: '15px',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
          }}
        >
          🌿 Thank You for Choosing Suyambu Food Products!
        </div>
        <p
          style={{
            marginTop: '10px',
            fontSize: '11px',
            opacity: '0.7',
          }}
        >
          © 2025 Suyambu Food Products. All rights reserved. | GSTIN: 33DCXPM6228L1ZV
        </p>
      </div>
    </div>
  );
};

export default Invoice;