// import React, { useEffect, useMemo, useState, useCallback } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import useEmblaCarousel from "embla-carousel-react";
// import Autoplay from "embla-carousel-autoplay";
// import {
//   CookingPot,
//   ShieldCheck,
//   Heart,
//   Leaf,
//   PackageCheck,
//   Box,
//   Cookie,
//   Cake,
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

// const IconMap = {
//   Box,
//   Cookie,
//   Cake,
//   CookingPot,
//   Grape,
// };

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
//       const catKey = p.category_name?.toLowerCase().trim();
//       if (catKey) {
//         counts[catKey] = (counts[catKey] || 0) + 1;
//       }
//     });
//     return counts;
//   }, [products]);

//   const bannerProducts = useMemo(() => products.slice(0, 4), [products]);

//   const autoplayPlugin = useMemo(() => {
//     if (bannerProducts.length <= 1) return undefined;
//     return Autoplay({
//       delay: 4000,
//       stopOnInteraction: true,
//       stopOnMouseEnter: true,
//     });
//   }, [bannerProducts.length]);

//   const [emblaRef, emblaApi] = useEmblaCarousel(
//     {
//       loop: bannerProducts.length > 1,
//       align: "start",
//       containScroll: "trimSnaps",
//       dragFree: false,
//     },
//     bannerProducts.length > 0 ? [autoplayPlugin].filter(Boolean) : []
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
//         {/* Navigation Arrows */}
//         {bannerProducts.length > 1 && (
//           <>
//             <button
//               onClick={scrollPrev}
//               className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 size-10 md:size-12 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
//               aria-label="Previous slide"
//             >
//               <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 mx-auto text-gray-800" />
//             </button>

//             <button
//               onClick={scrollNext}
//               className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 size-10 md:size-12 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
//               aria-label="Next slide"
//             >
//               <ChevronRight className="h-5 w-5 md:h-6 md:w-6 mx-auto text-gray-800" />
//             </button>
//           </>
//         )}

//         {/* Carousel */}
//         <div className="overflow-hidden" ref={emblaRef}>
//           <div className="flex">
//             {bannerProducts.length === 0 ? (
//               <div className="flex-none w-full h-[70vh] md:h-[80vh] lg:h-[85vh] bg-gray-200 animate-pulse" />
//             ) : (
//               bannerProducts.map((product) => (
//                 <div
//                   key={product.id}
//                   className="relative flex-none w-full h-[70vh] md:h-[80vh] lg:h-[85vh] cursor-pointer"
//                   onClick={() => handleViewProduct(product.id)}
//                 >
//                   <img
//                     src={product.image}
//                     alt={product.name}
//                     className="absolute inset-0 w-full h-full object-cover"
//                     onError={(e) => {
//                       e.target.src = "https://via.placeholder.com/1920x1080";
//                     }}
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         {/* Dots */}
//         {bannerProducts.length > 1 && (
//           <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5 z-20 pointer-events-none">
//             {bannerProducts.map((_, i) => (
//               <div
//                 key={i}
//                 className={`size-2.5 md:size-3 rounded-full transition-all duration-300 ${
//                   i === selectedIndex ? "bg-white scale-125" : "bg-white/50"
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

//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
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

//     </>
//   );
// }

























import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  CookingPot,
  ShieldCheck,
  Heart,
  Leaf,
  PackageCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Static Banner Imports
import AthirisamDesktop from "../../Assets/BannerImages/AthirasamDesktopVersion.webp";
import AthirisamMobile from "../../Assets/BannerImages/AthirasamMobileVersion.webp";
import GroundnutOilDesktop from "../../Assets/BannerImages/GroundnutOilDesktopVersion.webp";
import GroundnutOilMobile from "../../Assets/BannerImages/GroundnutOilMobileVersion.webp";
import MurukkuDesktop from "../../Assets/BannerImages/MurukkuDesktopVersion.webp";
import MurukkuMobile from "../../Assets/BannerImages/MurukkuMobileVersion.webp";
import SesameLadduDesktop from "../../Assets/BannerImages/SesameLadduDesktopVersion.png";
import SesameLadduMobile from "../../Assets/BannerImages/SesameLadduMobileVersion.png";

const bannerSlides = [
  { desktop: AthirisamDesktop, mobile: AthirisamMobile, alt: "Athirasam Traditional Sweet", productId: null },
  { desktop: GroundnutOilDesktop, mobile: GroundnutOilMobile, alt: "Pure Groundnut Oil", productId: null },
  { desktop: MurukkuDesktop, mobile: MurukkuMobile, alt: "Crispy Murukku", productId: null },
  { desktop: SesameLadduDesktop, mobile: SesameLadduMobile, alt: "Sesame Laddu", productId: null },
];

export default function Banner({ customerId }) {
  const navigate = useNavigate();

  // Autoplay configuration - Enabled for both Mobile & Desktop
  const autoplayPlugin = useMemo(() => {
    return Autoplay({ 
      delay: 4000, 
      stopOnInteraction: false, // Keeps sliding even after user touch/swipe
      stopOnMouseEnter: true    // Pauses only when mouse is hovering (desktop)
    });
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      align: "start", 
      containScroll: "trimSnaps",
      duration: 30 // Smooth transition speed
    },
    [autoplayPlugin]
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
    if (!productId) return;
    const encodedCustomerId = btoa(customerId || "");
    const encodedProductId = btoa(String(productId));
    navigate(`/customer?customerId=${encodedCustomerId}&productId=${encodedProductId}`);
    setTimeout(() => window.scrollTo(0, 0), 100);
  };

  const whyChooseFeatures = [
    {
      Icon: () => <img src="/Assets/no_chemicals_icon.png" alt="No Chemicals" className="w-8 h-8" />,
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
      {/* HERO BANNER 
        - Removed mt-[-35px] to fix header overlap.
        - Background white to maintain professional clean look.
      */}
      <section className="relative w-full bg-white overflow-hidden group">
        
        {/* Navigation Arrows - Hidden on small mobile to keep UI clean, visible on hover for desktop */}
        <button
          onClick={scrollPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 size-10 rounded-full bg-white/90 shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center"
        >
          <ChevronLeft className="h-6 w-6 text-gray-800" />
        </button>

        <button
          onClick={scrollNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 size-10 rounded-full bg-white/90 shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center"
        >
          <ChevronRight className="h-6 w-6 text-gray-800" />
        </button>

        {/* Carousel Container */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {bannerSlides.map((slide, index) => (
              <div
                key={index}
                className="relative flex-[0_0_100%] min-w-0 cursor-pointer"
                onClick={() => handleViewProduct(slide.productId)}
              >
                <picture>
                  {/* Mobile View: High clarity, no stretching */}
                  <source media="(max-width: 767px)" srcSet={slide.mobile} />
                  {/* Desktop View */}
                  <img
                    src={slide.desktop}
                    alt={slide.alt}
                    className="w-full h-auto object-cover md:h-[75vh] lg:h-[85vh]"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </picture>
                
                {/* NO SHADE OR GRADIENT OVERLAY 
                   This ensures 100% original clarity of your banner images.
                */}
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {bannerSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi && emblaApi.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === selectedIndex ? "bg-green-600 w-8" : "bg-gray-300 w-3"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* WHY CHOOSE SECTION */}
      <section className="bg-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-[#3D2F23] mb-4">
              Why Suyambu?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
              At Suyambu, we believe in the power of nature. Our products are a
              celebration of purity, tradition, and the finest organic ingredients.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-10 gap-x-4">
            {whyChooseFeatures.map(({ Icon, title, desc }, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                  <Icon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-[#3D2F23] text-sm md:text-base mb-1">{title}</h3>
                <p className="text-xs text-gray-500 px-2 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}