import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BRAND_SECONDARY = "#B6895B";

export default function SearchPanel({ onClose, categories, products }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let filtered = products || [];
    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.category_name && p.category_name.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (searchTerm.trim()) {
      filtered = filtered.filter(p => p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    setFilteredProducts(filtered.slice(0, 10)); // Limit to 10 for panel
  }, [selectedCategory, searchTerm, products]);

  const handleProductClick = (product) => {
    const encodedProductId = btoa(product.id.toString());
    navigate(`/customer?productId=${encodedProductId}`);
    onClose();
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-md lg:max-w-lg h-full p-6 overflow-y-auto relative">
        {/* Header with X close */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h2 className="text-xl font-semibold" style={{ color: BRAND_SECONDARY }}>Search Our Site</h2>
          <button onClick={onClose} className="p-1 hover:opacity-80 transition-opacity" style={{ color: BRAND_SECONDARY }}>
            <X size={24} />
          </button>
        </div>

        {/* Category Dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full mb-4 p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B6895B]/30"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg mb-6 text-sm focus:outline-none focus:ring-2 focus:ring-[#B6895B]/30"
        />

        {/* Quick Search Tags */}
        <div className="mb-6 text-xs text-gray-500">
          Quick search: Rice, Millets, Ghee, Honey, Spices, Oil, Snacks
        </div>

        {/* Products List */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="flex gap-4 p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors rounded-lg"
              >
                <img
                  src={product.thumbnail_url}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                  onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/64"; }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-gray-900 leading-tight line-clamp-2 mb-1">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-1">{product.category_name}</p>
                  <p className="text-sm font-semibold" style={{ color: BRAND_SECONDARY }}>₹{Number(product.price).toFixed(2)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No products found for "{searchTerm}" in "{categories.find(c => c.value === selectedCategory)?.label}".</p>
          )}
        </div>
      </div>
    </div>
  );
}