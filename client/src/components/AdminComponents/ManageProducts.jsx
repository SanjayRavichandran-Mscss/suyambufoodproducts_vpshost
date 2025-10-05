import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

const API_BASE = "http://localhost:5000/api/admin";
const IMAGE_BASE = "http://localhost:5000";
const FALLBACK_IMAGE = `${IMAGE_BASE}/fallback-image.png`;

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [stockStatuses, setStockStatuses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    category_id: "",
    name: "",
    description: "",
    thumbnail: null,
    thumbnail_url: "",
    additional_images: [],
    existing_additional_images: [],
    variants: [{ quantity: "", uom_id: "", price: "" }],
    stock_status_id: "",
  });
  const [categorySearch, setCategorySearch] = useState("");
  const [variantCount, setVariantCount] = useState(1);

  useEffect(() => {
    loadCategories();
    loadUoms();
    loadStockStatuses();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      setCategories(await res.json());
    } catch (error) {
      console.error("Failed to load categories", error);
    }
  };

  const loadUoms = async () => {
    try {
      const res = await fetch(`${API_BASE}/uoms`);
      setUoms(await res.json());
    } catch (error) {
      console.error("Failed to load UOMs", error);
    }
  };

  const loadStockStatuses = async () => {
    try {
      const res = await fetch(`${API_BASE}/stock-statuses`);
      setStockStatuses(await res.json());
    } catch (error) {
      console.error("Failed to load stock statuses", error);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      const updatedProducts = data.map((product) => {
        let additionalImages = [];
        if (typeof product.additional_images === "string") {
          try {
            additionalImages = JSON.parse(product.additional_images);
          } catch {
            additionalImages = product.additional_images
              .split(",")
              .map((img) => img.trim())
              .filter(Boolean);
          }
        } else if (Array.isArray(product.additional_images)) {
          additionalImages = product.additional_images;
        }
        return {
          ...product,
          thumbnail_url:
            product.thumbnail_url && product.thumbnail_url.startsWith("/")
              ? `${IMAGE_BASE}${product.thumbnail_url}`
              : product.thumbnail_url || FALLBACK_IMAGE,
          additional_images: additionalImages.map((img) =>
            img && img.startsWith("/") ? `${IMAGE_BASE}${img}` : img || FALLBACK_IMAGE
          ),
          selectedImageIndex: 0,
          variants: product.variants || [],
        };
      });
      setProducts(updatedProducts);
    } catch (error) {
      console.error("Failed to load products", error);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const openAddModal = () => {
    setFormData({
      id: null,
      category_id: "",
      name: "",
      description: "",
      thumbnail: null,
      thumbnail_url: "",
      additional_images: [],
      existing_additional_images: [],
      variants: [{ quantity: "", uom_id: "", price: "" }],
      stock_status_id: "",
    });
    setCategorySearch("");
    setVariantCount(1);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setFormData({
      id: product.id,
      category_id: product.category_id?.toString() || "",
      name: product.name,
      description: product.description || "",
      thumbnail: null,
      thumbnail_url: product.thumbnail_url,
      additional_images: [],
      existing_additional_images: product.additional_images || [],
      variants:
        product.variants && product.variants.length > 0
          ? product.variants.map((v) => ({
              id: v.id, // Include variant ID for deletion / update
              quantity: v.quantity?.toString() || "",
              uom_id: v.uom_id?.toString() || "",
              price: v.price?.toString() || "",
            }))
          : [{ quantity: "", uom_id: "", price: "" }],
      stock_status_id: product.stock_status_id?.toString() || "",
    });
    setCategorySearch("");
    setVariantCount(product.variants?.length || 1);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;
    if (type === "file") {
      if (name === "thumbnail") {
        setFormData((prev) => ({
          ...prev,
          thumbnail: files[0],
          thumbnail_url: files[0] ? URL.createObjectURL(files[0]) : prev.thumbnail_url,
        }));
      } else if (name === "additional_images") {
        const newImages = Array.from(files).slice(
          0,
          5 - formData.existing_additional_images.length
        );
        setFormData((prev) => ({ ...prev, additional_images: newImages }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index][field] = value;
    setFormData((prev) => ({ ...prev, variants: updatedVariants }));
  };

  const addVariant = () => {
    if (variantCount < 5) {
      setFormData((prev) => ({
        ...prev,
        variants: [...prev.variants, { quantity: "", uom_id: "", price: "" }],
      }));
      setVariantCount(variantCount + 1);
    }
  };

  // NEW: Delete variant function
  const handleDeleteVariant = async (index) => {
    // Don't allow deletion if only one variant remains
    if (formData.variants.length <= 1) {
      Swal.fire("Cannot Delete", "At least one variant is required", "warning");
      return;
    }

    const variant = formData.variants[index];
    
    // If variant has an ID (existing variant), delete from backend
    if (variant.id && formData.id) {
      const result = await Swal.fire({
        title: 'Delete Variant?',
        text: `Are you sure you want to delete this variant: ${variant.quantity} ${uoms.find(u => u.id.toString() === variant.uom_id)?.uom_name || ''} - ₹${variant.price}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#69D84F',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API_BASE}/products/${formData.id}/variants/${variant.id}`, {
            method: "DELETE",
          });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Failed to delete variant");
          }

          // Remove from frontend state
          const updatedVariants = formData.variants.filter((_, i) => i !== index);
          setFormData((prev) => ({ ...prev, variants: updatedVariants }));
          setVariantCount(variantCount - 1);

          Swal.fire("Deleted!", "Variant has been deleted.", "success");
          
          // Reload products to get updated data
          loadProducts();
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      }
    } else {
      // For new variants (no ID), just remove from state
      const updatedVariants = formData.variants.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, variants: updatedVariants }));
      setVariantCount(variantCount - 1);
    }
  };

  const validateForm = () => {
    const { category_id, name, variants, stock_status_id } = formData;
    if (!category_id) {
      Swal.fire("Validation Error", "Category is required", "warning");
      return false;
    }
    if (!name.trim()) {
      Swal.fire("Validation Error", "Name is required", "warning");
      return false;
    }
    for (const v of variants) {
      if (!v.quantity || Number(v.quantity) <= 0) {
        Swal.fire("Validation Error", "All quantities must be > 0", "warning");
        return false;
      }
      if (!v.uom_id) {
        Swal.fire("Validation Error", "All UOMs are required", "warning");
        return false;
      }
      if (!v.price || Number(v.price) < 0) {
        Swal.fire("Validation Error", "All prices must be non-negative", "warning");
        return false;
      }
    }
    if (!stock_status_id) {
      Swal.fire("Validation Error", "Stock status is required", "warning");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      let url = `${API_BASE}/products`;
      let method = "POST";
      if (formData.id) {
        url += `/${formData.id}`;
        method = "PATCH";
      }
      const payload = new FormData();
      payload.append("category_id", formData.category_id);
      payload.append("name", formData.name);
      payload.append("description", formData.description);
      if (formData.thumbnail) payload.append("thumbnail", formData.thumbnail);
      formData.additional_images.forEach((f) =>
        payload.append("additional_images", f)
      );
      if (formData.existing_additional_images.length > 0) {
        payload.append(
          "existing_additional_images",
          JSON.stringify(formData.existing_additional_images)
        );
      }

      // IMPORTANT: send variant IDs so backend can update existing variants instead of deleting them
      // Keep index alignment by appending id[] for each variant (empty string for new ones)
      formData.variants.forEach((v) => {
        // Append id[] for backend to identify existing variants (send empty string when creating new variant)
        payload.append("id[]", v.id ? String(v.id) : "");
        payload.append("quantity[]", v.quantity);
        payload.append("uom_id[]", v.uom_id);
        payload.append("price[]", v.price);
      });

      payload.append("stock_status_id", formData.stock_status_id);

      const res = await fetch(url, { method, body: payload });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Operation failed");
      }
      Swal.fire(
        "Success",
        formData.id ? "Product updated successfully" : "Product added successfully",
        "success"
      );
      closeModal();
      loadProducts();
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (product) => {
    Swal.fire({
      title: `Delete Product "${product.name}"?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#69D84F",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API_BASE}/products/${product.id}`, {
            method: "DELETE",
          });
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Failed to delete");
          }
          Swal.fire("Deleted!", "Product has been deleted.", "success");
          loadProducts();
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      }
    });
  };

  const openFullscreen = (image) => setFullscreenImage(image);
  const closeFullscreen = () => setFullscreenImage(null);

  const handleImageSelect = (productId, imageIndex) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? { ...product, selectedImageIndex: imageIndex }
          : product
      )
    );
  };

  const getAllProductImages = (product) => {
    const images = [];
    if (product.thumbnail_url) images.push(product.thumbnail_url);
    if (product.additional_images && product.additional_images.length > 0) {
      images.push(...product.additional_images);
    }
    return images;
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
        <button
          onClick={openAddModal}
          className="bg-[#69D84F] hover:bg-green-600 text-white px-4 py-2 rounded-md font-semibold transition"
        >
          + Add Product
        </button>
      </div>

      {/* Product cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full text-center py-6 text-gray-500">
            No products found.
          </div>
        ) : (
          products.map((prod) => {
            const category = categories.find((c) => c.id === prod.category_id);
            const allImages = getAllProductImages(prod);
            const selectedImageIndex = prod.selectedImageIndex || 0;
            const displayImage =
              allImages.length > 0 ? allImages[selectedImageIndex] : FALLBACK_IMAGE;
            const stockStatus = stockStatuses.find(
              (s) => s.id === prod.stock_status_id
            );
            return (
              <div
                key={prod.id}
                className="bg-white rounded-xl shadow-lg p-6 flex flex-col hover:shadow-xl transition"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                  {prod.name}
                </h3>
                <div className="relative mb-4">
                  <img
                    src={displayImage}
                    alt={prod.name}
                    className="w-full h-48 object-cover rounded-xl border border-gray-200 cursor-pointer transition duration-200 hover:scale-105"
                    onClick={() => openFullscreen(displayImage)}
                    onError={(e) => {
                      e.target.src = FALLBACK_IMAGE;
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-2">
                  {allImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${prod.name} ${idx}`}
                      onClick={() => handleImageSelect(prod.id, idx)}
                      className={`w-14 h-14 object-cover rounded-md cursor-pointer border-2 ${
                        selectedImageIndex === idx ? "border-green-500" : "border-gray-300"
                      }`}
                      onError={(e) => {
                        e.target.src = FALLBACK_IMAGE;
                      }}
                    />
                  ))}
                </div>
                <div className="mb-1 text-gray-700">
                  <span className="font-medium">Category:</span>{" "}
                  {category?.name || "N/A"}
                </div>
                <div className="mb-1 text-gray-700">
                  <span className="font-medium">Stock Status:</span>{" "}
                  {stockStatus?.status || "N/A"}
                </div>
                <div className="mb-1 text-gray-700">
                  <span className="font-medium">Variants:</span>
                  <ul className="ml-4 list-disc">
                    {prod.variants && prod.variants.length > 0 ? (
                      prod.variants.map((v) => {
                        const uom = uoms.find((u) => u.id === v.uom_id);
                        return (
                          <li key={v.id || `${v.quantity}-${v.price}`}>
                            {v.quantity} {uom?.uom_name || ""} - ₹
                            {Number(v.price).toFixed(2)}
                          </li>
                        );
                      })
                    ) : (
                      <li>No variants</li>
                    )}
                  </ul>
                </div>
                <div className="mb-2 text-gray-600">
                  <span className="font-medium">Description:</span>{" "}
                  {prod.description || "No description"}
                </div>
                <div className="flex justify-end gap-3 mt-auto">
                  <button
                    onClick={() => openEditModal(prod)}
                    className="text-[#69D84F] hover:text-green-600 transition"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(prod)}
                    className="text-red-600 hover:text-red-800 transition"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Fullscreen image */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
          onClick={closeFullscreen}
        >
          <img
            src={fullscreenImage}
            alt="Fullscreen"
            className="max-w-[90%] max-h-[90%] object-contain"
          />
          <button
            className="absolute top-4 right-4 text-white text-2xl"
            onClick={closeFullscreen}
          >
            &times;
          </button>
        </div>
      )}

      {/* Modal Form */}
      {modalOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-opacity-30 flex justify-center items-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-full max-h-[98vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {formData.id ? "Edit Product" : "Add Product"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    value={
                      categories.find((c) => c.id.toString() === formData.category_id)
                        ?.name || categorySearch
                    }
                    onChange={(e) => {
                      setCategorySearch(e.target.value);
                      setFormData((prev) => ({ ...prev, category_id: "" }));
                    }}
                    placeholder="Search or select category"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  {categorySearch && (
                    <ul className="bg-white border rounded-lg w-full mt-1 max-h-40 overflow-auto">
                      {filteredCategories.length === 0 ? (
                        <li className="p-2 text-gray-500">No categories found</li>
                      ) : (
                        filteredCategories.map((cat) => (
                          <li
                            key={cat.id}
                            className="p-2 cursor-pointer hover:bg-green-50"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                category_id: cat.id.toString(),
                              }));
                              setCategorySearch("");
                            }}
                          >
                            {cat.name}
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                {/* Stock Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Status *
                  </label>
                  <select
                    name="stock_status_id"
                    value={formData.stock_status_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Select Stock Status</option>
                    {stockStatuses.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Variants - UPDATED with delete functionality */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Variants (Min 1, Max 5)
                  </label>
                  {formData.variants.map((v, index) => (
                    <div key={index} className="flex gap-2 mb-2 relative items-center">
                      <input
                        type="number"
                        value={v.quantity}
                        onChange={(e) =>
                          handleVariantChange(index, "quantity", e.target.value)
                        }
                        placeholder="Quantity"
                        className="w-1/4 px-2 py-2 border rounded-lg"
                        required
                      />
                      <select
                        value={v.uom_id}
                        onChange={(e) =>
                          handleVariantChange(index, "uom_id", e.target.value)
                        }
                        className="w-1/4 px-2 py-2 border rounded-lg"
                        required
                      >
                        <option value="">Select UOM</option>
                        {uoms.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.uom_name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={v.price}
                        onChange={(e) =>
                          handleVariantChange(index, "price", e.target.value)
                        }
                        placeholder="Price ₹"
                        className="w-1/4 px-2 py-2 border rounded-lg"
                        required
                      />
                      <div className="flex items-center gap-1">
                        {/* Add variant button */}
                        {index === formData.variants.length - 1 && variantCount < 5 && (
                          <button
                            type="button"
                            onClick={addVariant}
                            className="text-green-600 hover:text-green-800 text-xl font-bold"
                            title="Add variant"
                          >
                            +
                          </button>
                        )}
                        {/* Delete variant button - only show if more than 1 variant */}
                        {formData.variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteVariant(index)}
                            className="text-red-600 hover:text-red-800 text-lg font-bold ml-1"
                            title="Delete variant"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Thumbnail */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thumbnail Image *
                  </label>
                  <input
                    type="file"
                    name="thumbnail"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full border p-2 rounded-lg"
                  />
                </div>

                {/* Additional Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Images (Max 5)
                  </label>
                  <input
                    type="file"
                    name="additional_images"
                    accept="image/*"
                    multiple
                    onChange={handleChange}
                    className="w-full border p-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6 gap-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg"
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

export default ManageProducts;







