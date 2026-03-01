// import React, { useEffect, useMemo, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import useEmblaCarousel from "embla-carousel-react";
// import Autoplay from "embla-carousel-autoplay";
// import {
//   CookingPot,
//   ShieldCheck,
//   Heart,
//   Leaf,
//   PackageCheck,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";

// // Static Banner Imports
// import AthirisamDesktop from "../../Assets/BannerImages/AthirasamDesktopVersion.webp";
// import AthirisamMobile from "../../Assets/BannerImages/AthirasamMobileVersion.webp";
// import GroundnutOilDesktop from "../../Assets/BannerImages/GroundnutOilDesktopVersion.webp";
// import GroundnutOilMobile from "../../Assets/BannerImages/GroundnutOilMobileVersion.webp";
// import MurukkuDesktop from "../../Assets/BannerImages/MurukkuDesktopVersion.webp";
// import MurukkuMobile from "../../Assets/BannerImages/MurukkuMobileVersion.webp";
// import SesameLadduDesktop from "../../Assets/BannerImages/SesameLadduDesktopVersion.png";
// import SesameLadduMobile from "../../Assets/BannerImages/SesameLadduMobileVersion.png";

// const bannerSlides = [
//   { 
//     desktop: AthirisamDesktop, 
//     mobile: AthirisamMobile, 
//     alt: "Athirasam Traditional Sweet", 
//     productId: "OA==", 
//     variantId: "264" 
//   },
//   { 
//     desktop: GroundnutOilDesktop, 
//     mobile: GroundnutOilMobile, 
//     alt: "Pure Groundnut Oil", 
//     productId: "MQ==", 
//     variantId: "259" 
//   },
//   { 
//     desktop: MurukkuDesktop, 
//     mobile: MurukkuMobile, 
//     alt: "Crispy Murukku", 
//     productId: "OQ==", 
//     variantId: "237" 
//   },
//   { 
//     desktop: SesameLadduDesktop, 
//     mobile: SesameLadduMobile, 
//     alt: "Thinai Laddu", 
//     productId: "Ng==", 
//     variantId: "222" 
//   },
// ];

// export default function Banner({ customerId }) {
//   const navigate = useNavigate();

//   const autoplayPlugin = useMemo(() => {
//     return Autoplay({
//       delay: 4000,
//       stopOnInteraction: false,
//       stopOnMouseEnter: true
//     });
//   }, []);

//   const [emblaRef, emblaApi] = useEmblaCarousel(
//     {
//       loop: true,
//       align: "start",
//       containScroll: "trimSnaps",
//       duration: 30
//     },
//     [autoplayPlugin]
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

//   const handleViewProduct = (productId, variantId) => {
//     if (!productId) return;
    
//     // Encoding customerId if it exists
//     const encodedCustomerId = customerId ? btoa(customerId) : "";
    
//     // Constructing the navigation URL to match your provided links
//     // Note: The productId is already base64 encoded in your provided links (e.g., 'OA==')
//     navigate(`/customer?customerId=${encodedCustomerId}&productId=${productId}&variantId=${variantId}`);
    
//     setTimeout(() => window.scrollTo(0, 0), 100);
//   };

//   const whyChooseFeatures = [
//     {
//       Icon: () => <img src="/Assets/no_chemicals_icon.png" alt="No Chemicals" className="w-8 h-8" />,
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
//       <section className="relative w-full bg-white overflow-hidden group">
        
//         {/* Navigation Arrows */}
//         <button
//           onClick={scrollPrev}
//           className="absolute left-4 top-1/2 -translate-y-1/2 z-30 size-10 rounded-full bg-white/90 shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center"
//         >
//           <ChevronLeft className="h-6 w-6 text-gray-800" />
//         </button>
//         <button
//           onClick={scrollNext}
//           className="absolute right-4 top-1/2 -translate-y-1/2 z-30 size-10 rounded-full bg-white/90 shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center"
//         >
//           <ChevronRight className="h-6 w-6 text-gray-800" />
//         </button>

//         {/* Carousel Container */}
//         <div className="overflow-hidden" ref={emblaRef}>
//           <div className="flex">
//             {bannerSlides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="relative flex-[0_0_100%] min-w-0 cursor-pointer"
//                 onClick={() => handleViewProduct(slide.productId, slide.variantId)}
//               >
//                 <picture>
//                   <source media="(max-width: 767px)" srcSet={slide.mobile} />
//                   <img
//                     src={slide.desktop}
//                     alt={slide.alt}
//                     className="w-full h-auto object-cover md:h-[75vh] lg:h-[85vh]"
//                     loading={index === 0 ? "eager" : "lazy"}
//                   />
//                 </picture>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Pagination Dots */}
//         <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
//           {bannerSlides.map((_, i) => (
//             <button
//               key={i}
//               onClick={() => emblaApi && emblaApi.scrollTo(i)}
//               className={`h-1.5 rounded-full transition-all duration-300 ${
//                 i === selectedIndex ? "bg-green-600 w-8" : "bg-gray-300 w-3"
//               }`}
//               aria-label={`Go to slide ${i + 1}`}
//             />
//           ))}
//         </div>
//       </section>

//       {/* WHY CHOOSE SECTION */}
//       <section className="bg-white py-12 md:py-20">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-12">
//             <h2 className="text-2xl md:text-4xl font-bold text-[#3D2F23] mb-4">
//               Why Suyambu?
//             </h2>
//             <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
//               At Suyambu, we believe in the power of nature. Our products are a
//               celebration of purity, tradition, and the finest organic ingredients.
//             </p>
//           </div>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-10 gap-x-4">
//             {whyChooseFeatures.map(({ Icon, title, desc }, i) => (
//               <div key={i} className="flex flex-col items-center text-center group">
//                 <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
//                   <Icon className="w-8 h-8 text-green-600" />
//                 </div>
//                 <h3 className="font-bold text-[#3D2F23] text-sm md:text-base mb-1">{title}</h3>
//                 <p className="text-xs text-gray-500 px-2 leading-relaxed">{desc}</p>
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

// Why Choose section images
import GheeImage from "../../Assets/BannerImages/ghee.png";
import MaltsImage from "../../Assets/BannerImages/malts.png";

const bannerSlides = [
  { 
    desktop: AthirisamDesktop, 
    mobile: AthirisamMobile, 
    alt: "Athirasam Traditional Sweet", 
    productId: "OA==", 
    variantId: "264" 
  },
  { 
    desktop: GroundnutOilDesktop, 
    mobile: GroundnutOilMobile, 
    alt: "Pure Groundnut Oil", 
    productId: "MQ==", 
    variantId: "259" 
  },
  { 
    desktop: MurukkuDesktop, 
    mobile: MurukkuMobile, 
    alt: "Crispy Murukku", 
    productId: "OQ==", 
    variantId: "237" 
  },
  { 
    desktop: SesameLadduDesktop, 
    mobile: SesameLadduMobile, 
    alt: "Thinai Laddu", 
    productId: "Ng==", 
    variantId: "222" 
  },
];

export default function Banner({ customerId }) {
  const navigate = useNavigate();

  const autoplayPlugin = useMemo(() => {
    return Autoplay({
      delay: 4000,
      stopOnInteraction: false,
      stopOnMouseEnter: true
    });
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      containScroll: "trimSnaps",
      duration: 30
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

  const handleViewProduct = (productId, variantId) => {
    if (!productId) return;
    const encodedCustomerId = customerId ? btoa(customerId) : "";
    navigate(`/customer?customerId=${encodedCustomerId}&productId=${productId}&variantId=${variantId}`);
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
      <section className="relative w-full bg-white overflow-hidden group">
        
        {/* Navigation Arrows */}
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
                onClick={() => handleViewProduct(slide.productId, slide.variantId)}
              >
                <picture>
                  <source media="(max-width: 767px)" srcSet={slide.mobile} />
                  <img
                    src={slide.desktop}
                    alt={slide.alt}
                    className="w-full h-auto object-cover md:h-[75vh] lg:h-[85vh]"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </picture>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-10 gap-x-4 mb-16">
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

          {/* Bottom Images Section: Responsive Layout */}
          <div className="flex flex-col md:flex-row w-full gap-4">
            <div className="w-full md:w-1/2">
              <img 
                src={GheeImage} 
                alt="Pure Ghee" 
                className="w-full h-auto object-cover rounded-lg shadow-sm"
              />
            </div>
            <div className="w-full md:w-1/2">
              <img 
                src={MaltsImage} 
                alt="Healthy Malts" 
                className="w-full h-auto object-cover rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}