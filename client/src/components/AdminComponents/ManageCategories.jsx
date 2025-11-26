import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Edit, Trash2 } from "lucide-react";

const API_BASE = "http://localhost:5000/admin";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: "", description: "" });
  const [loading, setLoading] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories", error);
    }
  };

  // Open modal for adding new category
  const openAddModal = () => {
    setFormData({ id: null, name: "", description: "" });
    setModalOpen(true);
  };

  // Open modal with existing data for editing
  const openEditModal = (category) => {
    setFormData({ id: category.id, name: category.name, description: category.description || "" });
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setFormData({ id: null, name: "", description: "" });
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit form (add or update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { id, name, description } = formData;
    if (!name.trim()) {
      Swal.fire("Validation Error", "Name is required", "warning");
      return;
    }

    setLoading(true);

    try {
      const method = id ? "PUT" : "POST";
      const url = id ? `${API_BASE}/categories/${id}` : `${API_BASE}/categories`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Operation failed");
      }

      const successMsg = id ? "Category updated successfully" : "Category added successfully";
      Swal.fire("Success", successMsg, "success");

      closeModal();
      loadCategories();
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete category with confirmation
  const handleDelete = (category) => {
    Swal.fire({
      title: `Delete Category "${category.name}"?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#69D84F",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API_BASE}/categories/${category.id}`, {
            method: "DELETE",
          });
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || errorData.error || "Failed to delete");
          }
          Swal.fire("Deleted!", "Category has been deleted.", "success");
          loadCategories();
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      }
    });
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl shadow">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Manage Categories</h1>
        <button
          onClick={openAddModal}
          className="bg-[#69D84F] hover:bg-green-600 text-white px-4 py-2 rounded-md font-semibold transition self-start sm:self-auto"
        >
          + Add Category
        </button>
      </div>

      {/* Categories Cards */}
      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No categories found.
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-green-50 transition shadow-sm"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{cat.name}</h3>
                  <p className="text-gray-600 text-sm">{cat.description || "-"}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="text-[#69D84F] hover:text-green-600 p-2 rounded-md hover:bg-green-100 transition"
                    aria-label="Edit"
                    title="Edit"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-100 transition"
                    aria-label="Delete"
                    title="Delete"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm backdrop-blur-2xl bg-opacity-30 flex justify-center items-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">
              {formData.id ? "Edit Category" : "Add Category"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block mb-1 font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#69D84F] focus:border-transparent"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="description" className="block mb-1 font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#69D84F] focus:border-transparent resize-none"
                ></textarea>
              </div>
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition w-full sm:w-auto"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#69D84F] text-white rounded-md hover:bg-green-600 transition w-full sm:w-auto"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCategories;