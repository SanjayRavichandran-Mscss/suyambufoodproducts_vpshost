import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BRAND_SECONDARY = "#B6895B";

const WishList = ({ onClose, customerId, onWishlistCountUpdate }) => {
  const [wishlist, setWishlist] = useState([]);
  const [totalWished, setTotalWished] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!customerId) {
        setLoading(false);
        if (onWishlistCountUpdate) {
          onWishlistCountUpdate(0);
        }
        return;
      }
      try {
        const token = localStorage.getItem("customerToken");
        if (!token) {
          throw new Error('No authentication token');
        }
        const response = await fetch(`https://suyambufoods.com/api/customer/wishlist?customerId=${customerId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch wishlist');
        }
        const data = await response.json();
        const allWishlist = data.wishlist || [];
        const likedWishlist = allWishlist.filter(item => item.is_liked === 1);
        setWishlist(likedWishlist);
        const count = likedWishlist.length;
        setTotalWished(count);
        // console.log('Total wishlist count:', count);
        if (onWishlistCountUpdate) {
          onWishlistCountUpdate(count);
        }
      } catch (err) {
        setError(err.message);
        if (onWishlistCountUpdate) {
          onWishlistCountUpdate(0);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [customerId, onWishlistCountUpdate]);

  const handleWishlistItemClick = (item) => {
    const encodedProductId = btoa(item.product_id.toString());
    navigate(`/customer?productId=${encodedProductId}`);
    onClose();
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  };

  if (!customerId) {
    return null; // Should not render if no customerId, as opening is prevented
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div 
        className="bg-white w-full max-w-md lg:max-w-lg h-full p-6 overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with X close */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h2 className="text-xl font-semibold" style={{ color: BRAND_SECONDARY }}>
            Your Wishlist ({totalWished})
          </h2>
          <button onClick={onClose} className="p-1 hover:opacity-80 transition-opacity" style={{ color: BRAND_SECONDARY }}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-gray-500">Loading your wishlist...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Error: {error}</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {wishlist.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Your wishlist is empty. Start adding your favorites!</p>
            ) : (
              wishlist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleWishlistItemClick(item)}
                  className="flex gap-4 p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors rounded-lg"
                >
                  <img
                    src={`https://suyambufoods.com/api${item.thumbnail_url}`}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/64"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-gray-900 leading-tight line-clamp-2 mb-1">{item.name}</h3>
                    <p className="text-xs text-gray-500 mb-1">Category: {item.category_name}</p>
                    <p className="text-xs text-gray-500 mb-1">Stock: {item.stock_status_name}</p>
                    
                    <p className="text-xs text-gray-400">Added: {new Date(item.added_at).toLocaleDateString()}</p>
                  </div>
                  <div
                    className="flex-shrink-0 flex items-center ml-2"
                    style={{ fontSize: '1.5em', color: '#e74c3c' }}
                  >
                    ❤️
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishList;