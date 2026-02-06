// import React, { useEffect, useMemo, useState, useCallback } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import useEmblaCarousel from "embla-carousel-react";
// import Autoplay from "embla-carousel-autoplay";
// import {
//   Sprout,
//   CookingPot,
//   ShieldCheck,
//   Heart,
//   Leaf,
//   PackageCheck,
//   Box,
//   Cookie,
//   Cake,
//   CookingPot as CookingPotIcon,
//   Grape,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";

// const IMAGE_BASE = "https://suyambuoils.com/api";

// const normalizeImage = (img) => {
//   if (!img) return "https://via.placeholder.com/1920x1080";
//   if (img.startsWith("http")) return img;
//   return img.startsWith("/") ? `${IMAGE_BASE}${img}` : `${IMAGE_BASE}/${img}`;
// };

// const IconMap = { Box, Cookie, Cake, CookingPot, Grape };

// export default function Banner({ customerId }) {
//   const navigate = useNavigate();
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [activeCategory, setActiveCategory] = useState("all");

//   // Fetch Products
//   useEffect(() => {
//     axios
//       .get("https://suyambuoils.com/api/admin/products")
//       .then((res) => {
//         const data = Array.isArray(res.data) ? res.data : [];
//         setProducts(
//           data.map((p) => ({
//             ...p,
//             image: normalizeImage(p.banner_url || p.thumbnail_url),
//             category_name: p.category_name || "",
//           }))
//         );
//       })
//       .catch(() => setProducts([]));
//   }, []);

//   // Fetch Categories
//   useEffect(() => {
//     axios
//       .get("https://suyambuoils.com/api/admin/categories")
//       .then((res) => {
//         const data = Array.isArray(res.data) ? res.data : [];
//         const mapped = data.map((c) => ({
//           key: String(c.id),
//           label: c.name,
//           value: c.slug || c.name.toLowerCase().replace(/\s+/g, "-"),
//           Icon: IconMap[c.icon] || Box,
//         }));
//         setCategories([
//           { key: "all", label: "All Products", value: "all", Icon: Box },
//           ...mapped,
//         ]);
//       })
//       .catch(() => setCategories([]));
//   }, []);

//   const categoryCounts = useMemo(() => {
//     const counts = { all: products.length };
//     products.forEach((p) => {
//       const cat = p.category_name?.toLowerCase();
//       if (cat) counts[cat] = (counts[cat] || 0) + 1;
//     });
//     return counts;
//   }, [products]);

//   const bannerProducts = useMemo(() => products.slice(0, 4), [products]);

//   // Only enable Autoplay when we have at least 1 product
//   const autoplayPlugin = useMemo(() => {
//     if (bannerProducts.length === 0) return undefined;
//     return Autoplay({
//       delay: 3000,
//       stopOnInteraction: false,
//       stopOnMouseEnter: true,
//     });
//   }, [bannerProducts.length]);

//   const [emblaRef, emblaApi] = useEmblaCarousel(
//     {
//       loop: true,
//       align: "start",
//       containScroll: "trimSnaps",
//     },
//     bannerProducts.length > 0 ? [autoplayPlugin] : [] // Only add plugin if slides exist
//   );

//   const [selectedIndex, setSelectedIndex] = useState(0);

//   const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
//   const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

//   const onSelect = useCallback(() => {
//     if (!emblaApi) return;
//     setSelectedIndex(emblaApi.selectedScrollSnap());
//   }, [emblaApi]);

//   useEffect(() => {
//     if (!emblaApi) return;

//     onSelect();
//     emblaApi.on("select", onSelect);
//     emblaApi.on("reInit", onSelect);

//     return () => {
//       emblaApi.off("select", onSelect);
//       emblaApi.off("reInit", onSelect);
//     };
//   }, [emblaApi, onSelect]);

//   const handleViewProduct = (productId) => {
//     const encodedCustomerId = btoa(customerId || "");
//     const encodedProductId = btoa(String(productId));
//     navigate(
//       `/customer?customerId=${encodedCustomerId}&productId=${encodedProductId}`
//     );
//     setTimeout(() => window.scrollTo(0, 0), 100);
//   };

//   const setCategoryFromBanner = (value) => {
//     setActiveCategory(value);
//     window.dispatchEvent(new CustomEvent("setCategory", { detail: { value } }));
//     document
//       .getElementById("shop-by-category")
//       ?.scrollIntoView({ behavior: "smooth" });
//   };

//   const whyChooseFeatures = [
//     {
//       // updated: use image + new text
//       Icon: () => (
//         <img
//           src="/Assets/no_chemicals_icon.png"
//           alt="No Chemicals"
//           className="w-8 h-8"
//         />
//       ),
//       title: "0 Chemicals added",
//       desc: "No chemicals used in production",
//     },
//     { Icon: CookingPot, title: "Homemade", desc: "Traditional recipes." },
//     { Icon: ShieldCheck, title: "No Preservatives", desc: "Pure and natural." },
//     { Icon: Heart, title: "Authentic Taste", desc: "Real homemade flavor." },
//     { Icon: Leaf, title: "Quality Ingredients", desc: "First Quality ingredients" },
//     { Icon: PackageCheck, title: "Hygienically Packed", desc: "Safe packaging." },
//   ];

//   return (
//     <>
//       {/* HERO BANNER */}
//       <section className="relative overflow-hidden group mt-[-35px]">
//         {/* Prev/Next Buttons */}
//         <button
//           onClick={scrollPrev}
//           className="absolute left-6 top-1/2 -translate-y-1/2 z-30 size-12 rounded-full bg-white/90 shadow-xl hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
//           aria-label="Previous"
//         >
//           <ChevronLeft className="h-6 w-6 mx-auto text-gray-800" />
//         </button>

//         <button
//           onClick={scrollNext}
//           className="absolute right-6 top-1/2 -translate-y-1/2 z-30 size-12 rounded-full bg-white/90 shadow-xl hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
//           aria-label="Next"
//         >
//           <ChevronRight className="h-6 w-6 mx-auto text-gray-800" />
//         </button>

//         {/* Carousel Viewport */}
//         <div className="overflow-hidden" ref={emblaRef}>
//           <div className="flex">
//             {bannerProducts.length === 0 ? (
//               // Fallback while loading
//               <div className="relative flex-none w-full h-[70vh] md:h-[80vh] lg:h-[85vh] bg-gray-200 animate-pulse" />
//             ) : (
//               bannerProducts.map((product) => (
//                 <div
//                   key={product.id}
//                   className="relative flex-none w-full h-[70vh] md:h-[80vh] lg:h-[85vh]"
//                 >
//                   <img
//                     src={product.image}
//                     alt={product.name}
//                     className="absolute inset-0 w-full h-full object-cover"
//                     onError={(e) =>
//                       (e.target.src =
//                         "https://via.placeholder.com/1920x1080")
//                     }
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
//                   <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-6">
//                     <h1 className="text-4xl md:text-6xl font-bold mb-8 drop-shadow-2xl max-w-5xl leading-tight">
//                       {product.name}
//                     </h1>
//                     <button
//                       onClick={() => handleViewProduct(product.id)}
//                       className="px-10 py-4 bg-white text-gray-900 font-bold text-lg rounded-full shadow-2xl hover:scale-105 transition-transform flex items-center gap-3"
//                     >
//                       View Product
//                       <svg
//                         className="w-6 h-6"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M9 5l7 7-7 7"
//                         />
//                       </svg>
//                     </button>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         {/* Simple Dots */}
//         {bannerProducts.length > 1 && (
//           <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
//             {bannerProducts.map((_, i) => (
//               <div
//                 key={i}
//                 className={`w-2 h-2 rounded-full transition-all duration-300 ${
//                   i === selectedIndex ? "bg-white" : "bg-white/50"
//                 }`}
//               />
//             ))}
//           </div>
//         )}
//       </section>

//       {/* WHY CHOOSE SECTION */}
//       <section className="bg-white py-16">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl md:text-4xl font-bold text-[#3D2F23] mb-4">
//               Why Suyambu?
//             </h2>
//             <p className="text-lg text-gray-600 max-w-3xl mx-auto">
//               At Suyambu, we believe in the power of nature. Our products are a
//               celebration of purity, tradition, and the finest organic
//               ingredients.
//             </p>
//           </div>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
//             {whyChooseFeatures.map(({ Icon, title, desc }, i) => (
//               <div key={i} className="text-center">
//                 <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
//                   <Icon className="w-8 h-8 text-green-600" />
//                 </div>
//                 <h3 className="font-semibold text-[#3D2F23] mb-1">{title}</h3>
//                 <p className="text-sm text-gray-600">{desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* SHOP BY CATEGORY */}
//       <section className="bg-gray-50 py-12" id="shop-by-category">
//         <div className="container mx-auto px-4">
//           <h2 className="text-center text-3xl md:text-4xl font-extrabold text-gray-900 mb-10">
//             Shop by Category
//           </h2>
//           <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar">
//             <style jsx>{`
//               .hide-scrollbar::-webkit-scrollbar {
//                 display: none;
//               }
//               .hide-scrollbar {
//                 -ms-overflow-style: none;
//                 scrollbar-width: none;
//               }
//             `}</style>

//             {categories.map((cat) => {
//               const isActive = cat.value === activeCategory;
//               const count =
//                 cat.value === "all"
//                   ? categoryCounts.all || 0
//                   : categoryCounts[cat.label.toLowerCase()] || 0;

//               return (
//                 <button
//                   key={cat.key}
//                   onClick={() => setCategoryFromBanner(cat.value)}
//                   className={`
//                     flex items-center gap-3 px-6 py-4 rounded-lg font-medium whitespace-nowrap shadow-sm transition-all
//                     ${
//                       isActive
//                         ? "bg-green-600 text-white shadow-lg scale-105"
//                         : "bg-white text-gray-700 hover:bg-gray-100 hover:shadow-md"
//                     }
//                   `}
//                 >
//                   <cat.Icon size={22} />
//                   <span className="flex items-center gap-2">
//                     {cat.label}
//                     <span className="font-bold text-lg opacity-90">
//                       ({count})
//                     </span>
//                   </span>
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       </section>
//     </>
//   );
// }



















import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  CookingPot,
  ShieldCheck,
  Heart,
  Leaf,
  PackageCheck,
  Box,
  Cookie,
  Cake,
  Grape,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const IMAGE_BASE = "https://suyambuoils.com/api";

const normalizeImage = (img) => {
  if (!img) return "https://via.placeholder.com/1920x1080";
  if (img.startsWith("http")) return img;
  return img.startsWith("/") ? `${IMAGE_BASE}${img}` : `${IMAGE_BASE}/${img}`;
};

const IconMap = {
  Box,
  Cookie,
  Cake,
  CookingPot,
  Grape,
};

export default function Banner({ customerId }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");

  // Fetch Products
  useEffect(() => {
    axios
      .get("https://suyambuoils.com/api/admin/products")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setProducts(
          data.map((p) => ({
            ...p,
            image: normalizeImage(p.banner_url || p.thumbnail_url),
            category_name: p.category_name || "",
          }))
        );
      })
      .catch(() => setProducts([]));
  }, []);

  // Fetch Categories
  useEffect(() => {
    axios
      .get("https://suyambuoils.com/api/admin/categories")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        const mapped = data.map((c) => ({
          key: String(c.id),
          label: c.name,
          value: c.slug || c.name.toLowerCase().replace(/\s+/g, "-"),
          Icon: IconMap[c.icon] || Box,
        }));

        setCategories([
          { key: "all", label: "All Products", value: "all", Icon: Box },
          ...mapped,
        ]);
      })
      .catch(() => setCategories([]));
  }, []);

  const categoryCounts = useMemo(() => {
    const counts = { all: products.length };
    products.forEach((p) => {
      const catKey = p.category_name?.toLowerCase().trim();
      if (catKey) {
        counts[catKey] = (counts[catKey] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  const bannerProducts = useMemo(() => products.slice(0, 4), [products]);

  const autoplayPlugin = useMemo(() => {
    if (bannerProducts.length <= 1) return undefined;
    return Autoplay({
      delay: 4000,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
    });
  }, [bannerProducts.length]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: bannerProducts.length > 1,
      align: "start",
      containScroll: "trimSnaps",
      dragFree: false,
    },
    bannerProducts.length > 0 ? [autoplayPlugin].filter(Boolean) : []
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleViewProduct = (productId) => {
    const encodedCustomerId = btoa(customerId || "");
    const encodedProductId = btoa(String(productId));
    navigate(
      `/customer?customerId=${encodedCustomerId}&productId=${encodedProductId}`
    );
    setTimeout(() => window.scrollTo(0, 0), 100);
  };

  const setCategoryFromBanner = (value) => {
    setActiveCategory(value);
    window.dispatchEvent(new CustomEvent("setCategory", { detail: { value } }));
    document
      .getElementById("shop-by-category")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const whyChooseFeatures = [
    {
      Icon: () => (
        <img
          src="/Assets/no_chemicals_icon.png"
          alt="No Chemicals"
          className="w-8 h-8"
        />
      ),
      title: "0 Chemicals added",
      desc: "No chemicals used in production",
    },
    { Icon: CookingPot, title: "Homemade", desc: "Traditional recipes." },
    { Icon: ShieldCheck, title: "No Preservatives", desc: "Pure and natural." },
    { Icon: Heart, title: "Authentic Taste", desc: "Real homemade flavor." },
    { Icon: Leaf, title: "Quality Ingredients", desc: "First Quality ingredients" },
    { Icon: PackageCheck, title: "Hygienically Packed", desc: "Safe packaging." },
  ];

  return (
    <>
      {/* HERO BANNER */}
      <section className="relative overflow-hidden group mt-[-35px]">
        {/* Navigation Arrows */}
        {bannerProducts.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 size-10 md:size-12 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 mx-auto text-gray-800" />
            </button>

            <button
              onClick={scrollNext}
              className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 size-10 md:size-12 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6 mx-auto text-gray-800" />
            </button>
          </>
        )}

        {/* Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {bannerProducts.length === 0 ? (
              <div className="flex-none w-full h-[70vh] md:h-[80vh] lg:h-[85vh] bg-gray-200 animate-pulse" />
            ) : (
              bannerProducts.map((product) => (
                <div
                  key={product.id}
                  className="relative flex-none w-full h-[70vh] md:h-[80vh] lg:h-[85vh] cursor-pointer"
                  onClick={() => handleViewProduct(product.id)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/1920x1080";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dots */}
        {bannerProducts.length > 1 && (
          <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5 z-20 pointer-events-none">
            {bannerProducts.map((_, i) => (
              <div
                key={i}
                className={`size-2.5 md:size-3 rounded-full transition-all duration-300 ${
                  i === selectedIndex ? "bg-white scale-125" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* WHY CHOOSE SECTION */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#3D2F23] mb-4">
              Why Suyambu?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              At Suyambu, we believe in the power of nature. Our products are a
              celebration of purity, tradition, and the finest organic
              ingredients.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
            {whyChooseFeatures.map(({ Icon, title, desc }, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <Icon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-[#3D2F23] mb-1">{title}</h3>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SHOP BY CATEGORY */}
      <section className="bg-gray-50 py-12" id="shop-by-category">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl md:text-4xl font-extrabold text-gray-900 mb-10">
            Shop by Category
          </h2>

          <div className="flex overflow-x-auto gap-3 md:gap-4 pb-4 hide-scrollbar snap-x snap-mandatory">
            <style jsx>{`
              .hide-scrollbar::-webkit-scrollbar {
                display: none;
              }
              .hide-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>

            {categories.map((cat) => {
              const isActive = cat.value === activeCategory;
              const count =
                cat.value === "all"
                  ? categoryCounts.all || 0
                  : categoryCounts[cat.label.toLowerCase().trim()] || 0;

              return (
                <button
                  key={cat.key}
                  onClick={() => setCategoryFromBanner(cat.value)}
                  className={`
                    flex items-center gap-2 md:gap-3 px-5 md:px-6 py-3 md:py-4 
                    rounded-xl font-medium whitespace-nowrap shadow-sm transition-all snap-center
                    ${
                      isActive
                        ? "bg-green-600 text-white shadow-lg scale-105"
                        : "bg-white text-gray-700 hover:bg-gray-100 hover:shadow-md"
                    }
                  `}
                >
                  <cat.Icon size={20} className="md:size-[22px]" />
                  <span className="flex items-center gap-1.5 md:gap-2">
                    {cat.label}
                    <span className="font-bold text-base md:text-lg opacity-90">
                      ({count})
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}