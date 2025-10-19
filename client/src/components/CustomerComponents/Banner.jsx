// client/src/components/CustomerComponents/Banner.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Sprout,
  CookingPot,
  ShieldCheck,
  Heart,
  Droplet,
  Leaf,
  PackageCheck,
  Box,
  Cookie,
  Cake,
  Grape,
} from "lucide-react";

const IMAGE_BASE = "https://suyambufoods.com";

const normalizeImage = (img) => {
  if (!img) return "https://via.placeholder.com/1920x1080";
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  if (img.startsWith("/")) return `${IMAGE_BASE}${img}`;
  return `${IMAGE_BASE}/${img}`;
};

export default function Banner({ customerId }) {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [idx, setIdx] = useState(0);
  const [activeCategory, setActiveCategory] = useState("all");

  const scrollerRef = useRef(null);
  const timerRef = useRef(null);
  const isUserInteractingRef = useRef(false);

  // Dispatch category change to Products
  const setCategoryFromBanner = (value) => {
    setActiveCategory(value);
    window.dispatchEvent(new CustomEvent("setCategory", { detail: { value } }));
    const el = document.getElementById("shop-by-category");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Fetch slides
  useEffect(() => {
    let mounted = true;
    axios
      .get("https://suyambufoods.com/admin/banner-products", {
        headers: { Origin: "http://localhost:5173" },
      })
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res.data) ? res.data : [];
        const normalized = list.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          image: normalizeImage(p.banner_url),
        }));
        setAllProducts(normalized);
      })
      .catch(() => setAllProducts([]));
    return () => {
      mounted = false;
    };
  }, []);

  const slides = useMemo(() => allProducts.slice(0, 4), [allProducts]);

  // Keep dots in sync while sliding
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const w = el.clientWidth || 1;
      setIdx(Math.round(el.scrollLeft / w));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-advance every 1.5 seconds; pause during user drag
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || slides.length <= 1) return;
    const start = () => {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (isUserInteractingRef.current) return;
        const w = el.clientWidth;
        const next = (idx + 1) % slides.length;
        el.scrollTo({ left: next * w, behavior: "smooth" });
      }, 1500);
    };
    start();
    return () => clearInterval(timerRef.current);
  }, [idx, slides.length]);

  // Track user interaction to pause/resume auto-slide
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const setTrue = () => (isUserInteractingRef.current = true);
    const setFalseSoon = () => setTimeout(() => (isUserInteractingRef.current = false), 1200);
    el.addEventListener("pointerdown", setTrue, { passive: true });
    el.addEventListener("pointerup", setFalseSoon, { passive: true });
    el.addEventListener("pointercancel", setFalseSoon, { passive: true });
    el.addEventListener("touchstart", setTrue, { passive: true });
    el.addEventListener("touchend", setFalseSoon, { passive: true });
    return () => {
      el.removeEventListener("pointerdown", setTrue);
      el.removeEventListener("pointerup", setFalseSoon);
      el.removeEventListener("pointercancel", setFalseSoon);
      el.removeEventListener("touchstart", setTrue);
      el.removeEventListener("touchend", setFalseSoon);
    };
  }, []);

  const handleViewProduct = (productId) => {
    const encodedCustomerId = btoa(customerId || "");
    const encodedProductId = btoa(productId.toString());
    navigate(`/customer?customerId=${encodedCustomerId}&productId=${encodedProductId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Arrow navigation — single handler
  const handleSlide = (dir) => {
    const el = scrollerRef.current;
    if (!el || slides.length <= 1) return;
    const w = el.clientWidth;
    const next = (idx + (dir > 0 ? 1 : -1) + slides.length) % slides.length;
    el.scrollTo({ left: next * w, behavior: "smooth" });
    setIdx(next); // update dots immediately
  };

  // WHY CHOOSE features - Simplified to match reference
  const whyChooseFeatures = [
    { Icon: Sprout, title: "100% Organic", desc: "Certified organic farms." },
    { Icon: CookingPot, title: "Homemade", desc: "Traditional recipes." },
    { Icon: ShieldCheck, title: "No Preservatives", desc: "Pure and natural." },
    { Icon: Heart, title: "Authentic Taste", desc: "Authentic flavors." },
    { Icon: Leaf, title: "Quality Ingredients", desc: "Finest natural ingredients." },
    { Icon: PackageCheck, title: "Hygienically Packed", desc: "Safe and clean packaging." },
  ];

  const categoryTiles = [
    { key: "all", label: "All Products", value: "all", Icon: Box },
    { key: "oils", label: "Oils", value: "oil items", Icon: Droplet },
    { key: "snacks", label: "Snacks", value: "snacks items", Icon: Cookie },
    { key: "sweets", label: "Sweets", value: "sweet items", Icon: Cake },
    { key: "masala", label: "Masala Powders", value: "masala powders", Icon: CookingPot },
    { key: "dry", label: "Dry fruits", value: "dry fruits", Icon: Grape },
  ];

  return (
    <>
      {/* HERO (reduced height, no top margin) */}
      <section className="relative overflow-hidden group mt-[-35px]">
        {/* Arrows - show on hover of section */}
        <button
          type="button"
          onClick={() => handleSlide(-1)}
          className="absolute left-4 md:left-6 top-[50%] -translate-y-1/2 z-20 h-10 w-10 grid place-items-center rounded-full bg-white/90 hover:bg-white shadow ring-1 ring-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label="Previous"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => handleSlide(1)}
          className="absolute right-4 md:right-6 top-[50%] -translate-y-1/2 z-20 h-10 w-10 grid place-items-center rounded-full bg-white/90 hover:bg-white shadow ring-1 ring-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label="Next"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        {/* Snap scroller */}
        <div
          ref={scrollerRef}
          className="relative flex overflow-x-auto snap-x snap-mandatory scroll-smooth h-[52vh] md:h-[60vh] lg:h-[66vh] [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{ scrollBehavior: "smooth" }}
        >
          <style>{`.snap-track::-webkit-scrollbar{display:none}`}</style>

          <div className="snap-track grid grid-flow-col auto-cols-[100%] w-full">
            {(slides.length ? slides : [{ id: 0 }]).map((p, i) => (
              <article key={p.id ?? i} className="relative w-full snap-start">
                {/* Background image */}
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name || "Featured"}
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/1920x1080")}
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#F3F5F7]" />
                )}

                {/* Gradient overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />

                {/* Centered overlay content - removed name and description */}
                <div className="relative z-10 h-full w-full flex items-center justify-center">
                  <div className="text-center px-5 max-w-3xl">
                    <button
                      onClick={() => handleViewProduct(p.id)}
                      className="
                        mt-5 inline-flex items-center gap-2 rounded-full
                        bg-white text-gray-900 hover:bg-white/90
                        px-6 md:px-7 py-3 md:py-3.5 font-semibold shadow transition
                      "
                    >
                      View Product
                      <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-900" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Dots - positioned at bottom */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center justify-center gap-2">
                    {(slides.length ? slides : [0, 1, 2, 3]).map((s, j) => (
                      <span
                        key={(s?.id ?? j) + String(j)}
                        className={`h-2.5 w-2.5 rounded-full transition ${
                          j === idx ? "bg-white" : "bg-white/60"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE Suyambu — Static row matching reference */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#3D2F23] mb-4">
              Why Suyambu?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              At Suyambu, we believe in the power of nature. Our products are a celebration of purity, tradition, and the finest organic ingredients, crafted with love to bring wholesome goodness to your home.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {whyChooseFeatures.map(({ Icon, title, desc }, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <Icon className="text-green-600 w-6 h-6" />
                </div>
                <h3 className="font-semibold text-[#3D2F23] mb-1">{title}</h3>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SHOP BY CATEGORY — horizontal nav bar matching image */}
      <section className="bg-white" id="shop-by-category">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <h2 className="text-center font-extrabold text-gray-900 text-3xl md:text-4xl mb-7">
            Shop by Category
          </h2>

          <div 
            className="flex flex-row overflow-x-auto space-x-3 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] category-scrollbar"
          >
            <style>{`.category-scrollbar::-webkit-scrollbar { display: none; }`}</style>
            {categoryTiles.map((t) => {
              const active = t.value === activeCategory;
              return (
                <button
                  key={t.key}
                  onClick={() => setCategoryFromBanner(t.value)}
                  className={`
                    flex items-center gap-2 px-4 py-3 min-w-max rounded-sm font-semibold transition-all duration-200 whitespace-nowrap
                    ${active 
                      ? "bg-green-600 text-white shadow-md hover:shadow-lg" 
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200 shadow-sm hover:shadow-md border border-gray-200"
                    }
                  `}
                  aria-label={`Filter ${t.label}`}
                  type="button"
                >
                  <t.Icon size={18} className={active ? "text-white" : "text-gray-600"} />
                  <span className="text-sm">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}