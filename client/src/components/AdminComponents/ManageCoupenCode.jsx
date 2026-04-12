import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Plus, Edit, Trash2, X, Save, Tag, Percent, ToggleLeft, ToggleRight } from 'lucide-react';

const ManageCoupenCode = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    discount_percentage: '',
    is_active: true,
  });

  // Fetch all coupons
  const fetchCoupons = async () => {
    try {
      const res = await fetch('https://suyambuoils.com/api/admin/coupons');
      const data = await res.json();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
      Swal.fire('Error', 'Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Open modal
  const openModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        discount_percentage: coupon.discount_percentage,
        is_active: coupon.is_active,
      });
    } else {
      setEditingCoupon(null);
      setFormData({ code: '', discount_percentage: '', is_active: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
    setFormData({ code: '', discount_percentage: '', is_active: true });
  };

  // Handle form input - automatically convert coupon code to uppercase
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'code') {
      // Convert to uppercase as user types
      setFormData(prev => ({
        ...prev,
        [name]: value.toUpperCase()
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Trim and ensure uppercase
    const trimmedCode = formData.code.trim().toUpperCase();

    if (!trimmedCode) {
      Swal.fire('Error', 'Coupon code is required', 'error');
      return;
    }

    if (
      !formData.discount_percentage ||
      isNaN(formData.discount_percentage) ||
      formData.discount_percentage < 0 ||
      formData.discount_percentage > 100
    ) {
      Swal.fire('Error', 'Discount must be between 0 and 100', 'error');
      return;
    }

    try {
      const url = editingCoupon
        ? `https://suyambuoils.com/api/admin/coupons/${editingCoupon.id}`
        : 'https://suyambuoils.com/api/admin/coupons';

      const method = editingCoupon ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: trimmedCode,
          discount_percentage: parseFloat(formData.discount_percentage),
          is_active: formData.is_active,
        }),
      });

      if (res.ok) {
        Swal.fire({
          title: 'Success',
          text: editingCoupon ? 'Coupon updated successfully!' : 'Coupon created successfully!',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
        closeModal();
        fetchCoupons();
      } else {
        const errorData = await res.json();
        Swal.fire('Error', errorData.error || 'Something went wrong', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to save coupon', 'error');
    }
  };

  // Toggle Status with Switch
  const toggleStatus = async (id, currentStatus) => {
    try {
      const res = await fetch(`https://suyambuoils.com/api/admin/coupons/${id}/toggle`, {
        method: 'PATCH',
      });

      if (res.ok) {
        Swal.fire({
          title: 'Success',
          text: `Coupon ${currentStatus ? 'disabled' : 'enabled'} successfully!`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
        fetchCoupons();
      } else {
        Swal.fire('Error', 'Failed to update status', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to update status', 'error');
    }
  };

  // Delete coupon
  const deleteCoupon = async (id, code) => {
    const result = await Swal.fire({
      title: 'Delete Coupon?',
      text: `Are you sure you want to delete "${code}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`https://suyambuoils.com/api/admin/coupons/${id}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          Swal.fire('Deleted!', 'Coupon has been deleted.', 'success');
          fetchCoupons();
        } else {
          Swal.fire('Error', 'Failed to delete coupon', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to delete coupon', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#4A6572] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading coupons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Tag className="w-8 h-8 text-[#4A6572]" />
                <h1 className="text-4xl font-bold text-gray-900">Manage Coupons</h1>
              </div>
              <p className="text-gray-600 text-lg ml-11">
                Create and manage discount coupons for your customers
              </p>
              <div className="ml-11 mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#4A6572]/10 text-[#4A6572]">
                  {coupons.length} {coupons.length === 1 ? 'Coupon' : 'Coupons'} Total
                </span>
              </div>
            </div>

            <button
              onClick={() => openModal()}
              className="group bg-gradient-to-r from-[#4A6572] to-[#344955] hover:from-[#344955] hover:to-[#2A3A44] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              Add New Coupon
            </button>
          </div>
        </div>

        {/* Coupons Grid */}
        {coupons.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Tag className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-500 text-xl mb-4">No coupons yet</p>
              <p className="text-gray-400 mb-6">Get started by creating your first discount coupon</p>
              <button
                onClick={() => openModal()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#4A6572] text-white rounded-xl hover:bg-[#344955] transition-colors cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                Create your first coupon
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Percent className="w-5 h-5 text-[#4A6572]" />
                        <span className="text-xs font-mono font-semibold text-gray-500 uppercase tracking-wider">
                          Coupon Code
                        </span>
                      </div>
                      <div className="text-2xl font-bold font-mono tracking-wider text-gray-900">
                        {coupon.code}
                      </div>
                    </div>
                    
                    {/* Status Toggle Switch */}
                    <button
                      onClick={() => toggleStatus(coupon.id, coupon.is_active)}
                      className="cursor-pointer focus:outline-none"
                    >
                      {coupon.is_active ? (
                        <div className="flex items-center gap-2">
                          <ToggleRight className="w-8 h-8 text-green-600" />
                          <span className="text-xs font-semibold text-green-600">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <ToggleLeft className="w-8 h-8 text-gray-400" />
                          <span className="text-xs font-semibold text-gray-400">Inactive</span>
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Discount */}
                  <div className="mb-6">
                    <div className="text-sm text-gray-500 mb-1">Discount</div>
                    <div className="text-5xl font-extrabold text-[#4A6572]">
                      {coupon.discount_percentage}%
                      <span className="text-lg font-normal text-gray-400 ml-1">OFF</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => openModal(coupon)}
                      className="flex-1 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer group"
                    >
                      <Edit className="w-4 h-4 text-[#4A6572] group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium text-gray-700">Edit</span>
                    </button>

                    <button
                      onClick={() => deleteCoupon(coupon.id, coupon.code)}
                      className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer group"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium text-red-600">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slideUp">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div className="flex items-center gap-2">
                {editingCoupon ? (
                  <>
                    <Edit className="w-5 h-5 text-[#4A6572]" />
                    <h2 className="text-xl font-semibold text-gray-900">Edit Coupon</h2>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-[#4A6572]" />
                    <h2 className="text-xl font-semibold text-gray-900">Create New Coupon</h2>
                  </>
                )}
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="e.g., SUMMER2024"
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A6572] focus:border-transparent outline-none transition-all uppercase"
                    required
                    autoComplete="off"
                  />
                </div>
               
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Percentage
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="discount_percentage"
                    value={formData.discount_percentage}
                    onChange={handleChange}
                    placeholder="0 - 100"
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A6572] focus:border-transparent outline-none transition-all"
                    required
                    min="0"
                    max="100"
                    step="1"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Enter a value between 0 and 100</p>
              </div>

              <div className="flex items-center justify-between py-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                  className="cursor-pointer focus:outline-none"
                >
                  {formData.is_active ? (
                    <div className="flex items-center gap-2">
                      <ToggleRight className="w-7 h-7 text-green-600" />
                      <span className="text-sm font-medium text-green-600">Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ToggleLeft className="w-7 h-7 text-gray-400" />
                      <span className="text-sm font-medium text-gray-400">Inactive</span>
                    </div>
                  )}
                </button>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#4A6572] to-[#344955] hover:from-[#344955] hover:to-[#2A3A44] text-white rounded-xl font-medium py-2.5 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ManageCoupenCode;