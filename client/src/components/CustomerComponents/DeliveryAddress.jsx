// import React, { useState, useEffect } from "react";
// import { Truck, Plus, Edit2, Trash2 } from "lucide-react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import Select from "react-select";

// const DeliveryAddress = ({ customerId, selectedAddressId, setSelectedAddressId }) => {
//   const navigate = useNavigate();
//   const [addresses, setAddresses] = useState([]);
//   const [customerDetails, setCustomerDetails] = useState({
//     full_name: "",
//     email: "",
//     phone: "",
//   });
//   const [showAddAddress, setShowAddAddress] = useState(false);
//   const [editingAddressId, setEditingAddressId] = useState(null);
//   const [formData, setFormData] = useState({
//     street: "",
//     city: "",
//     state: "",
//     zip_code: "",
//     country: "India",
//     is_default: false,
//   });
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [statesOptions, setStatesOptions] = useState([]);
//   const [citiesOptions, setCitiesOptions] = useState([]);
//   const [selectedState, setSelectedState] = useState(null);
//   const [selectedCity, setSelectedCity] = useState(null);

//   // Check authentication
//   useEffect(() => {
//     const token = localStorage.getItem("customerToken");
//     const storedCustomerId = localStorage.getItem("customerId");

//     if (!token || !storedCustomerId || !customerId) {
//       navigate("/customerlogin");
//     }
//   }, [navigate, customerId]);

//   // Fetch states once
//   useEffect(() => {
//     const fetchStates = async () => {
//       try {
//         const res = await axios.get("https://suyambuoils.com/api/customer/states");
//         setStatesOptions(res.data.map((s) => ({ value: s.id, label: s.name })));
//       } catch (err) {
//         console.error("Failed to fetch states:", err);
//       }
//     };
//     fetchStates();
//   }, []);

//   // Fetch addresses + customer info + handle initial auto-select
//   useEffect(() => {
//     let isMounted = true;

//     const fetchData = async () => {
//       if (!customerId) {
//         setLoading(false);
//         return;
//       }

//       const token = localStorage.getItem("customerToken");
//       if (!token) {
//         setError("Authentication required");
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);

//         // Fetch addresses
//         const addressRes = await axios.get(
//           "https://suyambuoils.com/api/customer/addresses",
//           {
//             params: { customerId },
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         const fetchedAddresses = addressRes.data || [];

//         if (isMounted) {
//           setAddresses(fetchedAddresses);

//           // Initial auto-select logic (only on first load)
//           if (fetchedAddresses.length === 1 && !selectedAddressId) {
//             setSelectedAddressId(fetchedAddresses[0].id);
//           } else if (!selectedAddressId) {
//             const defaultAddr = fetchedAddresses.find((a) => a.is_default);
//             if (defaultAddr) {
//               setSelectedAddressId(defaultAddr.id);
//             }
//           }
//         }

//         // Fetch profile
//         const profileRes = await axios.get(
//           "https://suyambuoils.com/api/customer/profile",
//           {
//             params: { customerId },
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );

//         // Fetch phone
//         const detailsRes = await axios.get(
//           "https://suyambuoils.com/api/customer/customer-details",
//           {
//             params: { customerId },
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );

//         if (isMounted) {
//           setCustomerDetails({
//             full_name: profileRes.data?.full_name || "",
//             email: profileRes.data?.email || "",
//             phone: detailsRes.data?.phone || "",
//           });
//         }

//         setLoading(false);
//       } catch (err) {
//         console.error("Fetch error:", err);
//         if (err.response?.status === 401) {
//           localStorage.removeItem("customerToken");
//           localStorage.removeItem("customerId");
//           navigate("/customerlogin");
//         }
//         if (isMounted) {
//           setError(err.response?.data?.message || "Failed to load data");
//           setLoading(false);
//         }
//       }
//     };

//     fetchData();

//     return () => {
//       isMounted = false;
//     };
//   }, [customerId, navigate, selectedAddressId, setSelectedAddressId]);

//   const fetchCities = async (stateId) => {
//     if (!stateId) {
//       setCitiesOptions([]);
//       return;
//     }
//     try {
//       const res = await axios.get(
//         `https://suyambuoils.com/api/customer/cities?stateId=${stateId}`
//       );
//       setCitiesOptions(res.data.map((c) => ({ value: c.id, label: c.name })));
//     } catch (err) {
//       console.error("Failed to fetch cities:", err);
//       setCitiesOptions([]);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleStateChange = (selected) => {
//     setSelectedState(selected);
//     setFormData((prev) => ({ ...prev, state: selected?.label || "" }));
//     setSelectedCity(null);
//     setFormData((prev) => ({ ...prev, city: "" }));
//     if (selected) fetchCities(selected.value);
//   };

//   const handleCityChange = (selected) => {
//     setSelectedCity(selected);
//     setFormData((prev) => ({ ...prev, city: selected?.label || "" }));
//   };

//   const validateForm = () => {
//     if (!formData.street?.trim() || formData.street.length > 255)
//       return "Street address is required (max 255 characters)";
//     if (!formData.city?.trim() || formData.city.length > 100)
//       return "City is required (max 100 characters)";
//     if (!formData.state?.trim() || formData.state.length > 100)
//       return "State is required (max 100 characters)";
//     if (!formData.zip_code?.trim() || formData.zip_code.length > 20)
//       return "Zip code is required (max 20 characters)";
//     return null;
//   };

//   const resetForm = () => {
//     setFormData({
//       street: "",
//       city: "",
//       state: "",
//       zip_code: "",
//       country: "India",
//       is_default: false,
//     });
//     setSelectedState(null);
//     setSelectedCity(null);
//     setShowAddAddress(false);
//     setEditingAddressId(null);
//     setError(null);
//   };

//   const handleAddAddress = async (e) => {
//     e.preventDefault();
//     const validationError = validateForm();
//     if (validationError) {
//       setError(validationError);
//       return;
//     }

//     const token = localStorage.getItem("customerToken");
//     if (!token) {
//       setError("Please login again");
//       return;
//     }

//     try {
//       await axios.post(
//         "https://suyambuoils.com/api/customer/addresses",
//         formData,
//         {
//           params: { customerId },
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       // Refresh addresses
//       const res = await axios.get(
//         "https://suyambuoils.com/api/customer/addresses",
//         {
//           params: { customerId },
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       const newList = res.data || [];
//       setAddresses(newList);

//       // Auto-select the newest address (usually last in list after add)
//       if (newList.length > 0) {
//         const newest = newList[newList.length - 1];
//         setSelectedAddressId(newest.id);
//       }

//       resetForm();
//     } catch (err) {
//       console.error("Add address failed:", err);
//       if (err.response?.status === 401) {
//         localStorage.removeItem("customerToken");
//         localStorage.removeItem("customerId");
//         navigate("/customerlogin");
//       }
//       setError(err.response?.data?.message || "Failed to save address");
//     }
//   };

//   const handleUpdateAddress = async (e) => {
//     e.preventDefault();
//     const validationError = validateForm();
//     if (validationError) {
//       setError(validationError);
//       return;
//     }

//     const token = localStorage.getItem("customerToken");
//     if (!token) return;

//     try {
//       await axios.put(
//         "https://suyambuoils.com/api/customer/addresses",
//         { id: editingAddressId, ...formData },
//         {
//           params: { customerId },
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       const res = await axios.get(
//         "https://suyambuoils.com/api/customer/addresses",
//         {
//           params: { customerId },
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setAddresses(res.data || []);
//       resetForm();
//     } catch (err) {
//       if (err.response?.status === 401) {
//         localStorage.removeItem("customerToken");
//         localStorage.removeItem("customerId");
//         navigate("/customerlogin");
//       }
//       setError(err.response?.data?.message || "Failed to update address");
//     }
//   };

//   const handleDeleteAddress = async (id) => {
//     if (!window.confirm("Delete this address?")) return;

//     const token = localStorage.getItem("customerToken");
//     if (!token) return;

//     try {
//       await axios.delete("https://suyambuoils.com/api/customer/addresses", {
//         params: { id, customerId },
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const res = await axios.get(
//         "https://suyambuoils.com/api/customer/addresses",
//         {
//           params: { customerId },
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       const updated = res.data || [];
//       setAddresses(updated);

//       if (selectedAddressId === id) {
//         setSelectedAddressId(null);
//       }
//     } catch (err) {
//       if (err.response?.status === 401) {
//         localStorage.removeItem("customerToken");
//         localStorage.removeItem("customerId");
//         navigate("/customerlogin");
//       }
//       setError(err.response?.data?.message || "Failed to delete address");
//     }
//   };

//   // ... (handleEditAddress, handleSetDefault, handleSelectAddress remain the same)

//   const handleEditAddress = async (address) => {
//     setFormData({
//       street: address.street || "",
//       city: address.city || "",
//       state: address.state || "",
//       zip_code: address.zip_code || "",
//       country: "India",
//       is_default: !!address.is_default,
//     });

//     setEditingAddressId(address.id);
//     setShowAddAddress(true);

//     const stateOpt = statesOptions.find((opt) => opt.label === address.state);
//     if (stateOpt) {
//       setSelectedState(stateOpt);
//       await fetchCities(stateOpt.value);
//       const cityOpt = citiesOptions.find((opt) => opt.label === address.city);
//       if (cityOpt) {
//         setSelectedCity(cityOpt);
//       }
//     } else {
//       setSelectedState(null);
//       setSelectedCity(null);
//     }
//   };

//   const handleSetDefault = async (id) => {
//     const token = localStorage.getItem("customerToken");
//     if (!token) return;

//     const addr = addresses.find((a) => a.id === id);
//     if (!addr) return;

//     try {
//       await axios.put(
//         "https://suyambuoils.com/api/customer/addresses",
//         {
//           id,
//           street: addr.street,
//           city: addr.city,
//           state: addr.state,
//           zip_code: addr.zip_code,
//           country: "India",
//           is_default: true,
//         },
//         {
//           params: { customerId },
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       const res = await axios.get(
//         "https://suyambuoils.com/api/customer/addresses",
//         {
//           params: { customerId },
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setAddresses(res.data || []);
//     } catch (err) {
//       if (err.response?.status === 401) {
//         localStorage.removeItem("customerToken");
//         localStorage.removeItem("customerId");
//         navigate("/customerlogin");
//       }
//       setError(err.response?.data?.message || "Failed to set default");
//     }
//   };

//   const handleSelectAddress = (id) => {
//     setSelectedAddressId(id);
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-[200px]">
//         <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-white rounded-xl shadow-md p-6 mb-6">
//         <p className="text-red-600">{error}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
//       <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
//         <Truck size={24} className="text-green-600" />
//         Delivery Address
//       </h2>

//       <div className="mb-4">
//         <p className="font-medium text-gray-900">{customerDetails.full_name}</p>
//         <p className="text-sm text-gray-600">{customerDetails.phone}</p>
//       </div>

//       <div className="space-y-4">
//         {addresses.length === 0 ? (
//           <p className="text-gray-600">No addresses found. Add one below.</p>
//         ) : (
//           addresses.map((address) => (
//             <div
//               key={address.id}
//               className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
//                 selectedAddressId === address.id
//                   ? "border-green-500 bg-green-50"
//                   : "border-gray-200 hover:bg-gray-50"
//               }`}
//               onClick={() => handleSelectAddress(address.id)}
//             >
//               <div className="flex justify-between items-start">
//                 <div>
//                   <p className="text-sm text-gray-600">{address.street}</p>
//                   <p className="text-sm text-gray-600">
//                     {address.city}, {address.state} {address.zip_code},{" "}
//                     {address.country}
//                   </p>
//                   {address.is_default ? (
//                     <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mt-1 inline-block">
//                       Default
//                     </span>
//                   ) : (
//                     <button
//                       className="text-xs text-green-600 hover:text-green-800 mt-1 transition-colors"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleSetDefault(address.id);
//                       }}
//                     >
//                       Set as Default
//                     </button>
//                   )}
//                 </div>

//                 <div className="flex gap-2">
//                   <button
//                     className="text-green-600 hover:text-green-800 transition-colors"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleEditAddress(address);
//                     }}
//                   >
//                     <Edit2 size={16} />
//                   </button>
//                   <button
//                     className="text-red-600 hover:text-red-800 transition-colors"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleDeleteAddress(address.id);
//                     }}
//                   >
//                     <Trash2 size={16} />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))
//         )}

//         <button
//           className="w-full py-3 text-green-600 hover:text-green-800 font-medium flex items-center justify-center gap-2 transition-all hover:bg-gray-50 rounded-lg"
//           onClick={() => {
//             setShowAddAddress((prev) => !prev);
//             if (showAddAddress) resetForm();
//           }}
//         >
//           <Plus size={16} />
//           {showAddAddress ? "Cancel" : "Add New Address"}
//         </button>

//         {showAddAddress && (
//           <div className="p-4 border border-gray-200 rounded-lg">
//             <h3 className="font-semibold text-gray-900 mb-3">
//               {editingAddressId ? "Edit Address" : "Add New Address"}
//             </h3>

//             {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

//             <form
//               onSubmit={editingAddressId ? handleUpdateAddress : handleAddAddress}
//             >
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <input
//                   type="text"
//                   name="street"
//                   placeholder="Street Address"
//                   value={formData.street}
//                   onChange={handleInputChange}
//                   className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//                   required
//                 />

//                 <Select
//                   options={statesOptions}
//                   value={selectedState}
//                   onChange={handleStateChange}
//                   placeholder="Select State"
//                   isSearchable
//                   className="basic-single"
//                   classNamePrefix="select"
//                 />

//                 <Select
//                   options={citiesOptions}
//                   value={selectedCity}
//                   onChange={handleCityChange}
//                   placeholder="Select City"
//                   isSearchable
//                   isDisabled={!selectedState}
//                   className="basic-single"
//                   classNamePrefix="select"
//                 />

//                 <input
//                   type="text"
//                   name="zip_code"
//                   placeholder="Zip Code"
//                   value={formData.zip_code}
//                   onChange={handleInputChange}
//                   className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//                   required
//                 />

//                 <div className="col-span-1 sm:col-span-2">
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Country
//                   </label>
//                   <input
//                     type="text"
//                     name="country"
//                     value="India"
//                     readOnly
//                     className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed text-gray-700 font-medium"
//                   />
//                 </div>

//                 <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
//                   <input
//                     type="checkbox"
//                     name="is_default"
//                     checked={formData.is_default}
//                     onChange={handleInputChange}
//                     className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
//                   />
//                   <label className="text-sm text-gray-600">
//                     Set as default address
//                   </label>
//                 </div>
//               </div>

//               <div className="mt-5 flex gap-3">
//                 <button
//                   type="submit"
//                   className="px-5 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
//                 >
//                   {editingAddressId ? "Update" : "Save"}
//                 </button>

//                 <button
//                   type="button"
//                   className="px-5 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 transition"
//                   onClick={resetForm}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DeliveryAddress;














import React, { useState, useEffect } from "react";
import { Truck, Plus, Edit2, Trash2 } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

const DeliveryAddress = ({ customerId, selectedAddressId, setSelectedAddressId }) => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [customerDetails, setCustomerDetails] = useState({
    full_name: "",
    email: "",
    phone: "",
  });
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    zip_code: "",
    country: "India",
    is_default: false,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statesOptions, setStatesOptions] = useState([]);
  const [citiesOptions, setCitiesOptions] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    const storedCustomerId = localStorage.getItem("customerId");

    if (!token || !storedCustomerId || !customerId) {
      navigate("/customerlogin");
    }
  }, [navigate, customerId]);

  // Fetch states once
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await axios.get("https://suyambuoils.com/api/customer/states");
        setStatesOptions(res.data.map((s) => ({ value: s.id, label: s.name })));
      } catch (err) {
        console.error("Failed to fetch states:", err);
      }
    };
    fetchStates();
  }, []);

  // Fetch addresses + customer info + handle initial auto-select
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!customerId) {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("customerToken");
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch addresses
        const addressRes = await axios.get(
          "https://suyambuoils.com/api/customer/addresses",
          {
            params: { customerId },
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const fetchedAddresses = addressRes.data || [];

        if (isMounted) {
          setAddresses(fetchedAddresses);

          // Initial auto-select logic (only on first load)
          if (fetchedAddresses.length === 1 && !selectedAddressId) {
            setSelectedAddressId(fetchedAddresses[0].id);
          } else if (!selectedAddressId) {
            const defaultAddr = fetchedAddresses.find((a) => a.is_default);
            if (defaultAddr) {
              setSelectedAddressId(defaultAddr.id);
            }
          }
        }

        // Fetch profile
        const profileRes = await axios.get(
          "https://suyambuoils.com/api/customer/profile",
          {
            params: { customerId },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch phone
        const detailsRes = await axios.get(
          "https://suyambuoils.com/api/customer/customer-details",
          {
            params: { customerId },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (isMounted) {
          setCustomerDetails({
            full_name: profileRes.data?.full_name || "",
            email: profileRes.data?.email || "",
            phone: detailsRes.data?.phone || "",
          });
        }

        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("customerToken");
          localStorage.removeItem("customerId");
          navigate("/customerlogin");
        }
        if (isMounted) {
          setError(err.response?.data?.message || "Failed to load data");
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [customerId, navigate, selectedAddressId, setSelectedAddressId]);

  const fetchCities = async (stateId) => {
    if (!stateId) {
      setCitiesOptions([]);
      return;
    }
    try {
      const res = await axios.get(
        `https://suyambuoils.com/api/customer/cities?stateId=${stateId}`
      );
      setCitiesOptions(res.data.map((c) => ({ value: c.id, label: c.name })));
    } catch (err) {
      console.error("Failed to fetch cities:", err);
      setCitiesOptions([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleStateChange = (selected) => {
    setSelectedState(selected);
    setFormData((prev) => ({ ...prev, state: selected?.label || "" }));
    setSelectedCity(null);
    setFormData((prev) => ({ ...prev, city: "" }));
    if (selected) fetchCities(selected.value);
  };

  const handleCityChange = (selected) => {
    setSelectedCity(selected);
    setFormData((prev) => ({ ...prev, city: selected?.label || "" }));
  };

  const validateForm = () => {
    if (!formData.street?.trim() || formData.street.length > 255)
      return "Street address is required (max 255 characters)";
    if (!formData.city?.trim() || formData.city.length > 100)
      return "City is required (max 100 characters)";
    if (!formData.state?.trim() || formData.state.length > 100)
      return "State is required (max 100 characters)";
    if (!formData.zip_code?.trim() || formData.zip_code.length > 20)
      return "Zip code is required (max 20 characters)";
    return null;
  };

  const resetForm = () => {
    setFormData({
      street: "",
      city: "",
      state: "",
      zip_code: "",
      country: "India",
      is_default: false,
    });
    setSelectedState(null);
    setSelectedCity(null);
    setShowAddAddress(false);
    setEditingAddressId(null);
    setError(null);
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const token = localStorage.getItem("customerToken");
    if (!token) {
      setError("Please login again");
      return;
    }

    try {
      await axios.post(
        "https://suyambuoils.com/api/customer/addresses",
        formData,
        {
          params: { customerId },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Refresh addresses
      const res = await axios.get(
        "https://suyambuoils.com/api/customer/addresses",
        {
          params: { customerId },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newList = res.data || [];
      setAddresses(newList);

      // Auto-select the newest address
      if (newList.length > 0) {
        const newest = newList[newList.length - 1];
        setSelectedAddressId(newest.id);
      }

      resetForm();
    } catch (err) {
      console.error("Add address failed:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("customerToken");
        localStorage.removeItem("customerId");
        navigate("/customerlogin");
      }
      setError(err.response?.data?.message || "Failed to save address");
    }
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const token = localStorage.getItem("customerToken");
    if (!token) return;

    try {
      await axios.put(
        "https://suyambuoils.com/api/customer/addresses",
        { id: editingAddressId, ...formData },
        {
          params: { customerId },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const res = await axios.get(
        "https://suyambuoils.com/api/customer/addresses",
        {
          params: { customerId },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAddresses(res.data || []);
      resetForm();
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("customerToken");
        localStorage.removeItem("customerId");
        navigate("/customerlogin");
      }
      setError(err.response?.data?.message || "Failed to update address");
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;

    const token = localStorage.getItem("customerToken");
    if (!token) return;

    try {
      await axios.delete("https://suyambuoils.com/api/customer/addresses", {
        params: { id, customerId },
        headers: { Authorization: `Bearer ${token}` },
      });

      const res = await axios.get(
        "https://suyambuoils.com/api/customer/addresses",
        {
          params: { customerId },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updated = res.data || [];
      setAddresses(updated);

      if (selectedAddressId === id) {
        setSelectedAddressId(null);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("customerToken");
        localStorage.removeItem("customerId");
        navigate("/customerlogin");
      }
      setError(err.response?.data?.message || "Failed to delete address");
    }
  };

  const handleEditAddress = async (address) => {
    setFormData({
      street: address.street || "",
      city: address.city || "",
      state: address.state || "",
      zip_code: address.zip_code || "",
      country: "India",
      is_default: !!address.is_default,
    });

    setEditingAddressId(address.id);
    setShowAddAddress(true);

    const stateOpt = statesOptions.find((opt) => opt.label === address.state);
    if (stateOpt) {
      setSelectedState(stateOpt);
      await fetchCities(stateOpt.value);
      const cityOpt = citiesOptions.find((opt) => opt.label === address.city);
      if (cityOpt) {
        setSelectedCity(cityOpt);
      }
    } else {
      setSelectedState(null);
      setSelectedCity(null);
    }
  };

  const handleSetDefault = async (id) => {
    const token = localStorage.getItem("customerToken");
    if (!token) return;

    const addr = addresses.find((a) => a.id === id);
    if (!addr) return;

    try {
      await axios.put(
        "https://suyambuoils.com/api/customer/addresses",
        {
          id,
          street: addr.street,
          city: addr.city,
          state: addr.state,
          zip_code: addr.zip_code,
          country: "India",
          is_default: true,
        },
        {
          params: { customerId },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const res = await axios.get(
        "https://suyambuoils.com/api/customer/addresses",
        {
          params: { customerId },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAddresses(res.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("customerToken");
        localStorage.removeItem("customerId");
        navigate("/customerlogin");
      }
      setError(err.response?.data?.message || "Failed to set default");
    }
  };

  const handleSelectAddress = (id) => {
    setSelectedAddressId(id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Truck size={24} className="text-green-600" />
        Delivery Address
      </h2>

      <div className="mb-4">
        <p className="font-medium text-gray-900">{customerDetails.full_name}</p>
        <p className="text-sm text-gray-600">{customerDetails.phone}</p>
      </div>

      <div className="space-y-4">
        {addresses.length === 0 ? (
          <p className="text-gray-600">No addresses found. Add one below.</p>
        ) : (
          addresses.map((address) => (
            <div
              key={address.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                selectedAddressId === address.id
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => handleSelectAddress(address.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">{address.street}</p>
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.state} {address.zip_code},{" "}
                    {address.country}
                  </p>
                  {address.is_default ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mt-1 inline-block">
                      Default
                    </span>
                  ) : (
                    <button
                      className="text-xs text-green-600 hover:text-green-800 mt-1 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(address.id);
                      }}
                    >
                      Set as Default
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    className="text-green-600 hover:text-green-800 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditAddress(address);
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAddress(address.id);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        <button
          className="w-full py-3 text-green-600 hover:text-green-800 font-medium flex items-center justify-center gap-2 transition-all hover:bg-gray-50 rounded-lg"
          onClick={() => {
            setShowAddAddress((prev) => !prev);
            if (showAddAddress) resetForm();
          }}
        >
          <Plus size={16} />
          {showAddAddress ? "Cancel" : "Add New Address"}
        </button>

        {showAddAddress && (
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">
              {editingAddressId ? "Edit Address" : "Add New Address"}
            </h3>

            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

            <form
              onSubmit={editingAddressId ? handleUpdateAddress : handleAddAddress}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. State */}
                <Select
                  options={statesOptions}
                  value={selectedState}
                  onChange={handleStateChange}
                  placeholder="Select State"
                  isSearchable
                  className="basic-single"
                  classNamePrefix="select"
                />

                {/* 2. City */}
                <Select
                  options={citiesOptions}
                  value={selectedCity}
                  onChange={handleCityChange}
                  placeholder="Select City"
                  isSearchable
                  isDisabled={!selectedState}
                  className="basic-single"
                  classNamePrefix="select"
                />

                {/* 3. Street Address */}
                <input
                  type="text"
                  name="street"
                  placeholder="Street Address"
                  value={formData.street}
                  onChange={handleInputChange}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all sm:col-span-2"
                  required
                />

                {/* 4. Pin Code */}
                <input
                  type="text"
                  name="zip_code"
                  placeholder="Pin Code"
                  value={formData.zip_code}
                  onChange={handleInputChange}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  required
                />

                {/* 5. Country (readonly) */}
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value="India"
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed text-gray-700 font-medium"
                  />
                </div>

                {/* 6. Checkbox */}
                <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
                  <input
                    type="checkbox"
                    name="is_default"
                    checked={formData.is_default}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-600">
                    Set as default address
                  </label>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  {editingAddressId ? "Update" : "Save"}
                </button>

                <button
                  type="button"
                  className="px-5 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryAddress;