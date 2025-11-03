import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Select from 'react-select';

const API_BASE = "https://suyambufoods.com/api/admin";
const IMAGE_BASE = "https://suyambufoods.com/api";  // Updated: Root domain for static images
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
    additional_images: [], // New uploads
    existing_additional_images: [], // Existing URLs (for preview/remove)
    variants: [{ quantity: "", uom_id: "", price: "" }],
    stock_status_id: "",
    tax_percentage: "", // NEW: Tax field
    isBanner: false,
    banner: null,
    banner_url: "",
    existing_banner_url: "", // NEW: For edit preview
  });
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
      const data = await res.json();
      setCategories(data);
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
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();

      const updatedProducts = data.map((product) => {
        // Normalize additional images
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
          banner_url:
            product.bannerimg && product.bannerimg.startsWith("/")
              ? `${IMAGE_BASE}${product.bannerimg}`
              : product.bannerimg || null,
          additional_images: additionalImages.map((img) =>
            img && img.startsWith("/") ? `${IMAGE_BASE}${img}` : img || FALLBACK_IMAGE
          ),
          selectedImageIndex: 0,
          variants: product.variants || [],
        };
      });

      setProducts(updatedProducts);
    } catch (error) {
      console.error("Error loading products:", error.message);
      Swal.fire("Error", "Failed to load products", "error");
    }
  };

  const categoryOptions = categories.map(cat => ({
    value: cat.id.toString(),
    label: cat.name
  }));

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
      tax_percentage: "", // NEW
      isBanner: false,
      banner: null,
      banner_url: "",
      existing_banner_url: "",
    });
    setVariantCount(1);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    // Normalize additional images for existing
    let existingAdditional = [];
    if (typeof product.additional_images === "string") {
      try {
        existingAdditional = JSON.parse(product.additional_images);
      } catch {
        existingAdditional = product.additional_images.split(",").map(img => img.trim()).filter(Boolean);
      }
    } else if (Array.isArray(product.additional_images)) {
      existingAdditional = product.additional_images;
    }
    // Prefix with IMAGE_BASE for preview
    existingAdditional = existingAdditional.map(img => img.startsWith("/") ? `${IMAGE_BASE}${img}` : img);

    setFormData({
      id: product.id,
      category_id: product.category_id?.toString() || "",
      name: product.name,
      description: product.description || "",
      thumbnail: null,
      thumbnail_url: product.thumbnail_url || "",
      additional_images: [], // New uploads
      existing_additional_images: existingAdditional, // Existing for preview
      variants:
        product.variants && product.variants.length > 0
          ? product.variants.map((v) => ({
              id: v.id,
              quantity: v.quantity?.toString() || "",
              uom_id: v.uom_id?.toString() || "",
              price: v.price?.toString() || "",
            }))
          : [{ quantity: "", uom_id: "", price: "" }],
      stock_status_id: product.stock_status_id?.toString() || "",
      tax_percentage: product.tax_percentage?.toString() || "", // NEW
      isBanner: product.isBanner === 1,
      banner: null,
      banner_url: "",
      existing_banner_url: product.banner_url || "", // NEW: For edit preview
    });
    setVariantCount(product.variants?.length || 1);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (type === "file") {
      if (name === "thumbnail") {
        setFormData((prev) => ({
          ...prev,
          thumbnail: files[0],
          thumbnail_url: files[0] ? URL.createObjectURL(files[0]) : prev.thumbnail_url,
        }));
      } else if (name === "banner") {
        setFormData((prev) => ({
          ...prev,
          banner: files[0],
          banner_url: files[0] ? URL.createObjectURL(files[0]) : prev.banner_url,
        }));
      }
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryChange = (selectedOption) => {
    setFormData((prev) => ({ 
      ...prev, 
      category_id: selectedOption ? selectedOption.value : "" 
    }));
  };

  const handleAdditionalImages = (e, index) => {
    const files = Array.from(e.target.files);
    const newImages = [...formData.additional_images];
    newImages[index] = files[0] || null;
    setFormData((prev) => ({ ...prev, additional_images: newImages }));
  };

  // NEW: Handle remove existing additional image
  const removeExistingAdditionalImage = (index) => {
    const updatedExisting = [...formData.existing_additional_images];
    updatedExisting.splice(index, 1);
    setFormData(prev => ({ ...prev, existing_additional_images: updatedExisting }));
  };

  // NEW: Handle remove banner in edit
  const removeBanner = () => {
    setFormData(prev => ({ ...prev, existing_banner_url: "", banner_url: "", banner: null }));
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

  const handleDeleteVariant = async (index) => {
    if (formData.variants.length <= 1) {
      Swal.fire("Cannot Delete", "At least one variant is required", "warning");
      return;
    }

    const variant = formData.variants[index];
    
    if (variant.id && formData.id) {
      const result = await Swal.fire({
        title: 'Delete Variant?',
        text: `Are you sure you want to delete this variant: ${variant.quantity} ${uoms.find(u => u.id.toString() === variant.uom_id)?.uom_name || ''} - ₹${variant.price}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#4A6572',
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

          const updatedVariants = formData.variants.filter((_, i) => i !== index);
          setFormData((prev) => ({ ...prev, variants: updatedVariants }));
          setVariantCount(variantCount - 1);

          Swal.fire("Deleted!", "Variant has been deleted.", "success");
          loadProducts();
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      }
    } else {
      const updatedVariants = formData.variants.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, variants: updatedVariants }));
      setVariantCount(variantCount - 1);
    }
  };

 const validateForm = () => {
  const { category_id, name, variants, stock_status_id, tax_percentage } = formData;
  if (!category_id) {
    Swal.fire("Validation Error", "Category is required", "warning");
    return false;
  }
  if (!name.trim()) {
    Swal.fire("Validation Error", "Name is required", "warning");
    return false;
  }

  // NEW: Validate tax_percentage
  const taxPerc = parseFloat(tax_percentage);
  if (tax_percentage !== "" && (isNaN(taxPerc) || taxPerc < 0 || taxPerc > 100)) {
    Swal.fire("Validation Error", "Tax percentage must be between 0 and 100", "warning");
    return false;
  }

  let hasValidVariant = false;
  for (const v of variants) {
    const qty = Number(v.quantity);
    const prc = Number(v.price);
    // Check if partially filled (some fields have values but not all valid)
    const hasQuantity = v.quantity && v.quantity.trim() !== '';
    const hasUom = v.uom_id && v.uom_id.trim() !== '';
    const hasPrice = v.price && v.price.trim() !== '';
    if ((hasQuantity || hasUom || hasPrice) && !(hasQuantity && hasUom && hasPrice && !isNaN(qty) && qty > 0 && !isNaN(prc) && prc >= 0)) {
      Swal.fire("Validation Error", "Please complete all fields for each variant or remove incomplete ones", "warning");
      return false;
    }
    // Check if fully valid
    if (hasQuantity && hasUom && hasPrice && !isNaN(qty) && qty > 0 && !isNaN(prc) && prc >= 0) {
      hasValidVariant = true;
    }
  }

  if (!hasValidVariant) {
    Swal.fire("Validation Error", "At least one valid variant is required", "warning");
    return false;
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
      payload.append("tax_percentage", formData.tax_percentage || "0"); // NEW
      payload.append("isBanner", formData.isBanner ? "true" : "false");
      if (formData.thumbnail) payload.append("thumbnail", formData.thumbnail);
      if (formData.banner) payload.append("banner", formData.banner);
      
      // NEW: Send existing_additional_images as JSON (for backend to preserve)
      if (formData.existing_additional_images.length > 0) {
        payload.append(
          "existing_additional_images",
          JSON.stringify(formData.existing_additional_images.map(img => img.replace(IMAGE_BASE, ''))) // Strip base URL for backend
        );
      }

      formData.additional_images.forEach((f) => {
        if (f) payload.append("additional_images", f);
      });

      formData.variants.forEach((v) => {
        payload.append("quantity[]", v.quantity);
        payload.append("uom_id[]", v.uom_id);
        payload.append("price[]", v.price);
      });

      payload.append("stock_status_id", formData.stock_status_id);

      console.log("🟢 Frontend: Submitting to", url, "with method", method);

      const res = await fetch(url, { 
        method, 
        body: payload 
      });

      let errorData;
      if (!res.ok) {
        const text = await res.text();
        console.error("🟢 Frontend: Raw response (first 300 chars):", text.substring(0, 300));
        console.error("🟢 Frontend: Full status:", res.status, res.statusText);

        // Detect common errors
        let errorMsg = `Server error (${res.status}): ${res.statusText}`;
        if (res.status === 413) {
          errorMsg = "413: Upload too large – Try smaller images (<15MB each) or fewer files.";
        } else if (text.trim().startsWith('<')) {
          errorMsg += " (HTML response – check backend/Nginx logs).";
        }

        try {
          if (!text.trim().startsWith('<')) {
            errorData = JSON.parse(text);
            errorMsg = errorData.error || errorData.message || errorMsg;
          }
        } catch (parseErr) {
          // Already handled as HTML
        }

        throw new Error(errorMsg);
      }

      const result = await res.json();
      console.log("✅ Frontend: Success:", result);
      Swal.fire(
        "Success",
        formData.id ? "Product updated successfully" : "Product added successfully",
        "success"
      );
      closeModal();
      loadProducts();
    } catch (error) {
      console.error("❌ Frontend Submit error:", error);
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
      confirmButtonColor: "#4A6572",
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

  const customStyles = {
    control: (base) => ({
      ...base,
      border: '1px solid #D1D5DB',
      borderRadius: '8px',
      padding: '2px 8px',
      minHeight: '44px',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#4A6572'
      }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#4A6572' : state.isFocused ? '#F0F4F8' : 'white',
      color: state.isSelected ? 'white' : '#1F2937',
      padding: '10px 12px',
      '&:active': {
        backgroundColor: '#4A6572',
        color: 'white'
      }
    })
  };

  // NEW: Render additional images grid (mix existing + new slots)
  const renderAdditionalImagesGrid = () => {
    const totalSlots = 5;
    const existingCount = formData.existing_additional_images.length;
    const newSlotsNeeded = totalSlots - existingCount;
    const gridItems = [];

    // Existing images (preview + remove)
    formData.existing_additional_images.forEach((img, index) => {
      gridItems.push(
        <div key={`existing-${index}`} className="relative aspect-square border-2 border-gray-300 rounded-lg overflow-hidden">
          <img
            src={img}
            alt={`Existing additional ${index + 1}`}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => openFullscreen(img)}
          />
          <button
            onClick={() => removeExistingAdditionalImage(index)}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600 transition-colors"
          >
            ×
          </button>
        </div>
      );
    });

    // New upload slots
    for (let i = 0; i < newSlotsNeeded; i++) {
      const newIndex = i + existingCount;
      gridItems.push(
        <div key={`new-${i}`} className="aspect-square border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#4A6572] transition-colors duration-200">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleAdditionalImages(e, newIndex)}
            className="hidden"
            id={`additional-image-${newIndex}`}
          />
          <label htmlFor={`additional-image-${newIndex}`} className="cursor-pointer block w-full h-full flex flex-col items-center justify-center">
            <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs text-gray-500">Add Image</span>
          </label>
          {formData.additional_images[newIndex] && (
            <img
              src={URL.createObjectURL(formData.additional_images[newIndex])}
              alt={`New additional ${newIndex + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>
      );
    }

    return gridItems;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
            <p className="text-gray-600 mt-2">Add, edit, and manage your product inventory</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-[#4A6572] hover:bg-[#344955] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2 mt-4 sm:mt-0"
          >
            <span>+</span>
            <span>Add Product</span>
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <p className="text-gray-500 text-lg">No products found</p>
              <p className="text-gray-400">Add your first product to get started</p>
            </div>
          ) : (
            products.map((prod) => {
              const category = categories.find((c) => c.id === prod.category_id);
              const allImages = getAllProductImages(prod);
              const selectedImageIndex = prod.selectedImageIndex || 0;
              const displayImage = allImages.length > 0 ? allImages[selectedImageIndex] : FALLBACK_IMAGE;
              const stockStatus = stockStatuses.find((s) => s.id === prod.stock_status_id);
              
              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 relative"
                >
                  {/* Banner Badge */}
                  {prod.isBanner === 1 && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium z-10">
                      Banner
                    </div>
                  )}

                  {/* Product Image */}
                  <div className="relative aspect-square">
                    <img
                      src={displayImage}
                      alt={prod.name}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => openFullscreen(displayImage)}
                      onError={(e) => {
                        e.target.src = FALLBACK_IMAGE;
                      }}
                    />
                    
                    {/* Image Thumbnails (Only additional images + thumbnail, exclude banner) */}
                    {allImages.length > 1 && (
                      <div className="absolute bottom-2 left-2 right-2 flex gap-1 overflow-x-auto">
                        {allImages.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`${prod.name} ${idx}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageSelect(prod.id, idx);
                            }}
                            className={`w-8 h-8 object-cover rounded border-2 cursor-pointer flex-shrink-0 ${
                              selectedImageIndex === idx ? 'border-[#4A6572]' : 'border-white'
                            }`}
                            onError={(e) => {
                              e.target.src = FALLBACK_IMAGE;
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Banner Preview (Separate section, neat and distinct) */}
                  {prod.banner_url && (
                    <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border-t border-yellow-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-xs font-medium text-yellow-800 uppercase tracking-wide">Banner Image</span>
                      </div>
                      <img
                        src={prod.banner_url}
                        alt="Banner"
                        className="w-full h-20 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity duration-200"
                        onClick={() => openFullscreen(prod.banner_url)}
                        onError={(e) => {
                          e.target.src = FALLBACK_IMAGE;
                        }}
                      />
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
                      {prod.name}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{category?.name || "N/A"}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Stock:</span>
                        <span className={`font-medium ${
                          stockStatus?.status?.toLowerCase().includes('in stock') 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {stockStatus?.status || "N/A"}
                        </span>
                      </div>
                      
                      {/* NEW: Tax display */}
                      {prod.tax_percentage > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Tax:</span>
                          <span className="font-medium">{prod.tax_percentage}%</span>
                        </div>
                      )}
                    </div>

                    {/* Variants */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Variants:</h4>
                      <div className="space-y-1">
                        {prod.variants && prod.variants.length > 0 ? (
                          prod.variants.map((v) => {
                            const uom = uoms.find((u) => u.id === v.uom_id);
                            return (
                              <div key={v.id || `${v.quantity}-${v.price}`} className="flex justify-between text-sm">
                                <span>{v.quantity} {uom?.uom_name || ""}</span>
                                <span className="font-semibold text-[#4A6572]">₹{Number(v.price).toFixed(2)}</span>
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-gray-400 text-sm">No variants</span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {prod.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {prod.description}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => openEditModal(prod)}
                        className="p-2 text-[#4A6572] hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        title="Edit product"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(prod)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete product"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={closeFullscreen}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={fullscreenImage}
              alt="Fullscreen"
              className="max-w-full max-h-full object-contain"
            />
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors duration-200 bg-opacity-50 rounded-full p-2"
              onClick={closeFullscreen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 backdrop-blur-2xl bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-[#4A6572] text-white">
              <h2 className="text-xl font-semibold">
                {formData.id ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <Select
                        options={categoryOptions}
                        value={categoryOptions.find(opt => opt.value === formData.category_id)}
                        onChange={handleCategoryChange}
                        placeholder="Search and select category..."
                        isSearchable
                        styles={customStyles}
                      />
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A6572] focus:border-transparent transition-colors duration-200"
                        placeholder="Enter product name"
                        required
                      />
                    </div>

                    {/* NEW: Tax Percentage */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tax Percentage (%)
                      </label>
                      <input
                        type="number"
                        name="tax_percentage"
                        value={formData.tax_percentage}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="e.g., 18.00"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A6572] focus:border-transparent transition-colors duration-200"
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter tax rate (0-100). Defaults to 0.</p>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A6572] focus:border-transparent transition-colors duration-200 resize-none"
                        placeholder="Enter product description"
                      />
                    </div>

                    {/* Stock Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Status *
                      </label>
                      <select
                        name="stock_status_id"
                        value={formData.stock_status_id}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A6572] focus:border-transparent transition-colors duration-200"
                        required
                      >
                        <option value="">Select Stock Status</option>
                        {stockStatuses.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Thumbnail Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thumbnail Image *
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#4A6572] transition-colors duration-200">
                        <input
                          type="file"
                          name="thumbnail"
                          accept="image/*"
                          onChange={handleChange}
                          className="hidden"
                          id="thumbnail-upload"
                          required={!formData.thumbnail_url}
                        />
                        <label htmlFor="thumbnail-upload" className="cursor-pointer block">
                          {formData.thumbnail_url ? (
                            <div className="flex flex-col items-center">
                              <img
                                src={formData.thumbnail_url}
                                alt="Thumbnail preview"
                                className="w-32 h-32 object-cover rounded-lg mb-2"
                              />
                              <span className="text-sm text-[#4A6572] font-medium">Change thumbnail</span>
                            </div>
                          ) : (
                            <div className="py-8">
                              <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-sm text-gray-600">Click to upload thumbnail</p>
                              <p className="text-xs text-gray-500 mt-1">Main product image</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Banner Toggle & Upload */}
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="isBanner"
                          checked={formData.isBanner}
                          onChange={handleChange}
                          className="rounded border-gray-300 text-[#4A6572] focus:ring-[#4A6572]"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">Enable as Banner Product</span>
                      </label>
                      {formData.isBanner && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Banner Image
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#4A6572] transition-colors duration-200 relative">
                            <input
                              type="file"
                              name="banner"
                              accept="image/*"
                              onChange={handleChange}
                              className="hidden"
                              id="banner-upload"
                            />
                            <label htmlFor="banner-upload" className="cursor-pointer block">
                              {formData.existing_banner_url ? (
                                <div className="flex flex-col items-center relative">
                                  <img
                                    src={formData.existing_banner_url}
                                    alt="Existing banner preview"
                                    className="w-32 h-32 object-cover rounded-lg mb-2"
                                  />
                                  <button
                                    onClick={removeBanner}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600 transition-colors"
                                  >
                                    ×
                                  </button>
                                  <span className="text-sm text-[#4A6572] font-medium">Change banner</span>
                                </div>
                              ) : formData.banner_url ? (
                                <div className="flex flex-col items-center">
                                  <img
                                    src={formData.banner_url}
                                    alt="Banner preview"
                                    className="w-32 h-32 object-cover rounded-lg mb-2"
                                  />
                                  <span className="text-sm text-[#4A6572] font-medium">Update banner</span>
                                </div>
                              ) : (
                                <div className="py-8">
                                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <p className="text-sm text-gray-600">Click to upload banner</p>
                                  <p className="text-xs text-gray-500 mt-1">Optional banner image</p>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Additional Images - UPDATED: Mix existing + new */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Additional Images (Max 5)
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {renderAdditionalImagesGrid()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Variants Section */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Product Variants (Max 5)
                    </label>
                    <button
                      type="button"
                      onClick={addVariant}
                      disabled={variantCount >= 5}
                      className="text-sm bg-[#4A6572] text-white px-3 py-2 rounded-lg hover:bg-[#344955] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Variant
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.variants.map((v, index) => (
                      <div key={index} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Quantity *</label>
                            <input
                              type="number"
                              value={v.quantity}
                              onChange={(e) => handleVariantChange(index, "quantity", e.target.value)}
                              placeholder="Qty"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4A6572] focus:border-transparent"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Unit *</label>
                            <select
                              value={v.uom_id}
                              onChange={(e) => handleVariantChange(index, "uom_id", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4A6572] focus:border-transparent"
                              required
                            >
                              <option value="">Select UOM</option>
                              {uoms.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.uom_name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Price (₹) *</label>
                            <input
                              type="number"
                              value={v.price}
                              onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                              placeholder="Price"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4A6572] focus:border-transparent"
                              required
                            />
                          </div>
                        </div>
                        {formData.variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteVariant(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 mt-6"
                            title="Delete variant"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-[#4A6572] text-white rounded-lg hover:bg-[#344955] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4m8-10h-4M6 12H2" />
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {formData.id ? "Update Product" : "Create Product"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;