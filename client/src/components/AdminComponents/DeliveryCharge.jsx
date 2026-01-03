// Updated Frontend: DeliveryCharge.jsx (with fixed overlap check to allow touching ranges)
import React, { useState, useEffect, useMemo } from "react";
import { Plus, Edit2, Trash2, Search, Package, Save, X, MapPin, Weight, IndianRupee } from "lucide-react";
import axios from "axios";
import Select from "react-select";

const DeliveryCharge = () => {
  const [deliveryCharges, setDeliveryCharges] = useState([]);
  const [statesOptions, setStatesOptions] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingCharge, setEditingCharge] = useState(null);
  const [formMode, setFormMode] = useState(""); // 'new-state', 'add-range', 'edit'
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState(null);

  const token = localStorage.getItem("adminToken");

  // Fetch initial data
  useEffect(() => {
    fetchDeliveryCharges();
    fetchStates();
  }, []);

  const fetchDeliveryCharges = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://suyambuoils.com/api/admin/delivery-charges", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeliveryCharges(res.data);
    } catch (err) {
      console.error("Fetch delivery charges error:", err);
      setError("Failed to fetch delivery charges");
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async () => {
    try {
      const res = await axios.get("https://suyambuoils.com/api/customer/states");
      setStatesOptions(res.data.map(s => ({ value: s.id, label: s.name })));
    } catch (err) {
      console.error("Fetch states error:", err);
    }
  };

  // Grouped charges by state
  const groupedCharges = useMemo(() => {
    const grouped = {};
    deliveryCharges.forEach(charge => {
      if (!grouped[charge.state_id]) {
        grouped[charge.state_id] = {
          state_id: charge.state_id,
          state_name: charge.state_name,
          ranges: []
        };
      }
      grouped[charge.state_id].ranges.push(charge);
    });
    // Sort ranges by min_quantity
    Object.values(grouped).forEach(group => {
      group.ranges.sort((a, b) => parseFloat(a.min_quantity) - parseFloat(b.min_quantity));
    });
    return Object.values(grouped);
  }, [deliveryCharges]);

  // Unused states for new state addition
  const unusedStatesOptions = useMemo(() => {
    const usedStateIds = new Set(deliveryCharges.map(c => c.state_id));
    return statesOptions.filter(opt => !usedStateIds.has(opt.value));
  }, [statesOptions, deliveryCharges]);

  // Filtered grouped by search
  const filteredGrouped = useMemo(() => {
    return groupedCharges.filter(g => 
      g.state_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [groupedCharges, searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingCharge) {
      setEditingCharge(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleStateChange = (selected) => {
    setSelectedState(selected);
    if (formMode === "new-state" && editingCharge) {
      setEditingCharge(prev => ({ ...prev, state_id: selected ? selected.value : "" }));
    }
  };

  const validateForm = (data) => {
    if (!data.state_id) return "State is required";
    if (!data.min_quantity || isNaN(data.min_quantity) || parseFloat(data.min_quantity) < 0) return "Valid min quantity is required";
    if (!data.max_quantity || isNaN(data.max_quantity) || parseFloat(data.max_quantity) < 0) return "Valid max quantity is required";
    if (parseFloat(data.min_quantity) > parseFloat(data.max_quantity)) return "Min quantity cannot exceed max quantity";
    if (!data.delivery_charge || isNaN(data.delivery_charge) || parseFloat(data.delivery_charge) < 0) return "Valid delivery charge is required";
    return null;
  };

  // Updated check for range overlap (allows touching boundaries without considering as overlap)
  const checkOverlap = (data, id = null) => {
    const stateId = data.state_id;
    const newMin = parseFloat(data.min_quantity);
    const newMax = parseFloat(data.max_quantity);
    const existingForState = deliveryCharges.filter(c => 
      c.state_id === stateId && (id ? c.id !== id : true)
    );
    for (const existing of existingForState) {
      const exMin = parseFloat(existing.min_quantity);
      const exMax = parseFloat(existing.max_quantity);
      // Overlap only if strictly overlapping interiors: newMax > exMin && newMin < exMax
      if (newMax > exMin && newMin < exMax) {
        return "New range overlaps with an existing range for this state";
      }
    }
    return null;
  };

  const handleSave = async (data, id = null) => {
    const validationError = validateForm(data);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Check overlap for add/update
    const overlapError = checkOverlap(data, id);
    if (overlapError) {
      setError(overlapError);
      return;
    }

    try {
      if (id) {
        await axios.put(`https://suyambuoils.com/api/admin/delivery-charges/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("https://suyambuoils.com/api/admin/delivery-charges", data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      handleCancelEdit();
      fetchDeliveryCharges();
    } catch (err) {
      console.error("Save error:", err);
      setError(err.response?.data?.error || "Failed to save");
    }
  };

  const handleEdit = (charge) => {
    const opt = statesOptions.find(o => o.value === charge.state_id);
    setSelectedState(opt);
    setFormMode("edit");
    setEditingCharge({
      state_id: charge.state_id,
      min_quantity: charge.min_quantity,
      max_quantity: charge.max_quantity,
      delivery_charge: charge.delivery_charge,
    });
    setEditingId(charge.id);
    setIsAdding(true);
    setError(null);
  };

  const handleCancelEdit = () => {
    setIsAdding(false);
    setEditingId(null);
    setEditingCharge(null);
    setFormMode("");
    setSelectedState(null);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this delivery range?")) return;
    try {
      await axios.delete(`https://suyambuoils.com/api/admin/delivery-charges/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDeliveryCharges();
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete");
    }
  };

  const startAddingNewState = () => {
    setFormMode("new-state");
    setEditingCharge({
      state_id: "",
      min_quantity: "",
      max_quantity: "",
      delivery_charge: "",
    });
    setSelectedState(null);
    setEditingId(null);
    setIsAdding(true);
    setError(null);
  };

  const addRangeForState = (stateId) => {
    const opt = statesOptions.find(o => o.value === stateId);
    setSelectedState(opt);
    setFormMode("add-range");
    setEditingCharge({
      state_id: stateId,
      min_quantity: "",
      max_quantity: "",
      delivery_charge: "",
    });
    setEditingId(null);
    setIsAdding(true);
    setError(null);
  };

  // Custom styles for react-select
  const customSelectStyles = {
    control: (base) => ({
      ...base,
      minHeight: '42px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#3b82f6',
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    }),
    menuPortal: base => ({ ...base, zIndex: 9999 }),
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="text-blue-600" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Delivery Charges</h1>
                <p className="text-gray-600">Manage delivery charges across states and quantity ranges</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by state..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              {!isAdding && !editingId && unusedStatesOptions.length > 0 && (
                <button
                  onClick={startAddingNewState}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors font-medium"
                >
                  <Plus size={20} />
                  Add New State
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <div className="w-2 h-8 bg-red-500 rounded-full"></div>
            <p className="text-red-700 font-medium">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Add/Edit Form */}
        {(isAdding || editingId) && editingCharge && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {formMode === "edit" ? "Edit Delivery Range" : formMode === "add-range" ? "Add New Range" : "Add New State Delivery Charge"}
              </h2>
              <button 
                onClick={handleCancelEdit}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {formMode === "new-state" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin size={16} />
                    State
                  </label>
                  <Select
                    options={unusedStatesOptions}
                    value={selectedState}
                    onChange={handleStateChange}
                    placeholder="Select a new state"
                    isSearchable
                    styles={customSelectStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin size={16} />
                    State
                  </label>
                  <input
                    type="text"
                    value={selectedState?.label || ""}
                    readOnly
                    className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Min Quantity</label>
                <input
                  type="number"
                  name="min_quantity"
                  value={editingCharge.min_quantity}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Max Quantity</label>
                <input
                  type="number"
                  name="max_quantity"
                  value={editingCharge.max_quantity}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <IndianRupee size={16} />
                  Delivery Charge
                </label>
                <input
                  type="number"
                  name="delivery_charge"
                  value={editingCharge.delivery_charge}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleSave(editingCharge, editingId)}
                className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors font-medium"
              >
                <Save size={18} />
                {formMode === "edit" ? "Update Range" : "Add Range"}
              </button>
              <button
                onClick={handleCancelEdit}
                className="bg-gray-300 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-400 flex items-center gap-2 transition-colors font-medium"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Delivery Charges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredGrouped.map((group) => (
            <div 
              key={group.state_id} 
              className="bg-white rounded-xl shadow-sm border transition-all hover:shadow-md border-gray-100"
            >
              <div className="p-6">
                {/* Header with State and Add Button */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <MapPin className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{group.state_name}</h3>
                    </div>
                  </div>
                  <button 
                    onClick={() => addRangeForState(group.state_id)}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1 transition-colors text-sm font-medium"
                    title="Add new range"
                  >
                    <Plus size={14} />
                    Add Range
                  </button>
                </div>

                {/* Ranges List */}
                <div className="space-y-4">
                  {group.ranges.map((charge) => (
                    <div key={charge.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      {/* Quantity Range */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Quantity Range</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-center">
                            <div className="text-xl font-bold text-blue-600">{charge.min_quantity}</div>
                            <div className="text-xs text-gray-500 mt-1">Min</div>
                          </div>
                          <div className="flex-1 mx-4">
                            <div className="h-1 bg-gray-200 rounded-full relative">
                              <div className="absolute inset-0 bg-blue-500 rounded-full"></div>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-blue-600">{charge.max_quantity}</div>
                            <div className="text-xs text-gray-500 mt-1">Max</div>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Charge */}
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Delivery Charge</p>
                          <p className="text-xs text-gray-500">Per unit in range</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900 flex items-center">
                            <IndianRupee size={16} className="mr-1" />
                            {charge.delivery_charge}
                          </div>
                        </div>
                      </div>

                      {/* Actions for Range */}
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                        <button 
                          onClick={() => handleEdit(charge)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors text-sm"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(charge.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors text-sm"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {group.ranges.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-4">No ranges defined yet</p>
                    <button
                      onClick={() => addRangeForState(group.state_id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto transition-colors"
                    >
                      <Plus size={16} />
                      Add First Range
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredGrouped.length === 0 && !loading && !isAdding && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Package className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No delivery charges found</h3>
            <p className="text-gray-500 mb-6">Get started by adding delivery charges for states.</p>
            {unusedStatesOptions.length > 0 ? (
              <button
                onClick={startAddingNewState}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors font-medium mx-auto"
              >
                <Plus size={20} />
                Add First State
              </button>
            ) : (
              <p className="text-gray-400">All states already have delivery charges configured.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryCharge;