import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Sprout, CookingPot, ShieldCheck, Heart, Droplet, Leaf,
  PackageCheck, Box, Cookie, Cake, Grape,
} from "lucide-react";

const IMAGE_BASE = "https://suyambufoods.com/api";
const normalizeImage = (img) => {
  if (!img) return "https://via.placeholder.com/1920x1080";
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  if (img.startsWith("/")) return `${IMAGE_BASE}${img}`;
  return `${IMAGE_BASE}/${img}`;
};

const IconMap = { Box, Droplet, Cookie, Cake, CookingPot, Grape };

export default function Banner({ customerId }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [idx, setIdx] = useState(0);
  const [activeCategory, setActiveCategory] = useState("all");

  // Slider logic refs
  const scrollerRef = useRef(null);
  const timerRef = useRef(null);
  const isUserInteractingRef = useRef(false);
  const restartTimerRef = useRef(null);


  // 1. Get all products from the main endpoint
  useEffect(() => {
    let mounted = true;
    axios.get("https://suyambufoods.com/api/admin/products", {
      headers: { Origin: "http://localhost:5173" },
    }).then(res => {
      if (!mounted) return;
      const raw = Array.isArray(res.data) ? res.data : [];
      setProducts(
        raw.map(p => ({
          ...p,
          image: normalizeImage(p.banner_url || p.thumbnail_url),
          category_name: p.category_name || "",
        }))
      );
    }).catch(() => setProducts([]));
    return () => { mounted = false; };
  }, []);

  // 2. Get categories as before
  useEffect(() => {
    let mounted = true;
    axios.get("https://suyambufoods.com/api/admin/categories", {
      headers: { Origin: "http://localhost:5173" },
    }).then(res => {
      if (!mounted) return;
      const raw = Array.isArray(res.data) ? res.data : [];
      const mapped = raw.map(c => ({
        key: String(c.id),
        label: c.name,
        value: c.slug || c.name.toLowerCase(),
        Icon: IconMap[c.icon] || Box,
      }));
      const all = { key: "all", label: "All Products", value: "all", Icon: Box };
      setCategories([all, ...mapped]);
    }).catch(() => setCategories([]));
    return () => { mounted = false; };
  }, []);

  const setCategoryFromBanner = (value) => {
    setActiveCategory(value);
    window.dispatchEvent(new CustomEvent("setCategory", { detail: { value } }));
    const el = document.getElementById("shop-by-category");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // 3. Correct category-wise product counts using products
  const categoryCounts = useMemo(() => {
    const counts = {};
    counts["all"] = products.length;
    // Count for each actual category
    products.forEach(p => {
      const cat = (p.category_name || "").toLowerCase();
      if (!cat) return;
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Banner products and slides setup
  const bannerProducts = useMemo(() => products.filter((_, i) => i < 4), [products]);
  const totalSlides = bannerProducts.length;

  // Create infinite slides for seamless looping by cloning the first slide to the end
  const slides = useMemo(() => {
    if (totalSlides === 0) return [];
    return [...bannerProducts, bannerProducts[0]];
  }, [bannerProducts, totalSlides]);

  // Consolidated Slider Logic: Auto-scroll, seamless loop, and user interaction
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || totalSlides <= 1) return;

    const startAutoSlide = () => {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (isUserInteractingRef.current) return;
        const w = scroller.clientWidth;
        const nextIndex = Math.round(scroller.scrollLeft / w) + 1;
        scroller.scrollTo({ left: nextIndex * w, behavior: 'smooth' });
      }, 2000);
    };

    const handleScroll = () => {
      const w = scroller.clientWidth;
      const scrollPos = scroller.scrollLeft;
      const currentIndex = Math.round(scrollPos / w);

      // Update the indicator dots, looping back to 0 for the cloned slide
      setIdx(currentIndex % totalSlides);

      // When the smooth scroll to the cloned slide is complete, this detects it.
      if (currentIndex >= totalSlides) {
        // Instantly jump back to the real first slide without animation.
        scroller.style.scrollBehavior = 'auto';
        scroller.scrollTo({ left: 0, behavior: 'auto' });
        // Restore smooth scrolling for the next transition in the next frame.
        requestAnimationFrame(() => {
            if (scrollerRef.current) {
                scrollerRef.current.style.scrollBehavior = 'smooth';
            }
        });
      }
    };

    const onInteractionStart = () => {
      isUserInteractingRef.current = true;
      clearInterval(timerRef.current);
      clearTimeout(restartTimerRef.current);
    };

    const onInteractionEnd = () => {
      // Use a timeout to wait for a moment before restarting auto-play
      restartTimerRef.current = setTimeout(() => {
        isUserInteractingRef.current = false;
        startAutoSlide();
      }, 2500); // Wait 2.5s before restarting
    };

    scroller.addEventListener('scroll', handleScroll, { passive: true });
    scroller.addEventListener("pointerdown", onInteractionStart);
    scroller.addEventListener("pointerup", onInteractionEnd);
    scroller.addEventListener("touchstart", onInteractionStart, { passive: true });
    scroller.addEventListener("touchend", onInteractionEnd);

    startAutoSlide(); // Initial start

    return () => {
      clearInterval(timerRef.current);
      clearTimeout(restartTimerRef.current);
      if (scroller) {
        scroller.removeEventListener('scroll', handleScroll);
        scroller.removeEventListener("pointerdown", onInteractionStart);
        scroller.removeEventListener("pointerup", onInteractionEnd);
        scroller.removeEventListener("touchstart", onInteractionStart);
        scroller.removeEventListener("touchend", onInteractionEnd);
      }
    };
  }, [totalSlides]); // This effect re-runs only when the number of slides changes.

  const handleViewProduct = (productId) => {
    const encodedCustomerId = btoa(customerId || "");
    const encodedProductId = btoa(productId.toString());
    navigate(`/customer?customerId=${encodedCustomerId}&productId=${encodedProductId}`);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  };

  // Updated manual slide handler to work with the new loop logic
  const handleSlide = (dir) => {
    const el = scrollerRef.current;
    if (!el || totalSlides <= 1) return;

    const w = el.clientWidth;
    const currentIndex = Math.round(el.scrollLeft / w);
    const targetIndex = currentIndex + dir;

    if (dir === -1 && targetIndex < 0) {
      // When clicking "prev" on the first slide, we create a seamless wrap-around.
      // 1. Instantly jump to the cloned last slide.
      el.style.scrollBehavior = 'auto';
      el.scrollTo({ left: totalSlides * w, behavior: 'auto' });
      // 2. In the next frame, smoothly scroll back to the last *real* slide.
      requestAnimationFrame(() => {
          if (scrollerRef.current) {
              scrollerRef.current.style.scrollBehavior = 'smooth';
              scrollerRef.current.scrollTo({ left: (totalSlides - 1) * w, behavior: 'smooth' });
          }
      });
    } else {
      // For "next" and other "prev" clicks, just scroll normally.
      // The `onScroll` handler will automatically manage the loop at the end.
      el.scrollTo({ left: targetIndex * w, behavior: 'smooth' });
    }
  };

  const whyChooseFeatures = [
    { Icon: Sprout, title: "100% Organic", desc: "Certified organic farms." },
    { Icon: CookingPot, title: "Homemade", desc: "Traditional recipes." },
    { Icon: ShieldCheck, title: "No Preservatives", desc: "Pure and natural." },
    { Icon: Heart, title: "Authentic Taste", desc: "Authentic flavors." },
    { Icon: Leaf, title: "Quality Ingredients", desc: "Finest natural ingredients." },
    { Icon: PackageCheck, title: "Hygienically Packed", desc: "Safe and clean packaging." },
  ];

  return (
    <>
      {/* HERO SLIDER */}
      <section className="relative overflow-hidden group mt-[-35px]">
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
        <div
          ref={scrollerRef}
          className="relative flex overflow-x-auto snap-x snap-mandatory scroll-smooth h-[52vh] md:h-[60vh] lg:h-[66vh] [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{ scrollBehavior: "smooth" }}
        >
          <style>{`.snap-track::-webkit-scrollbar{display:none}`}</style>
          <div className="snap-track grid grid-flow-col auto-cols-[100%] w-full">
            {slides.map((p, i) => (
              <article key={`${p.id ?? i}-${i}`} className="relative w-full snap-start">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
                <div className="relative z-10 h-full w-full flex items-center justify-center">
                  <div className="text-center px-5 max-w-3xl">
                    <button
                      onClick={() => handleViewProduct(p.id)}
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-white text-gray-900 hover:bg-white/90 px-6 md:px-7 py-3 md:py-3.5 font-semibold shadow transition"
                    >
                      View Product
                      <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-900" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {Array.from({ length: totalSlides }, (_, j) => (
                      <span
                        key={j}
                        className={`h-2.5 w-2.5 rounded-full transition ${j === idx ? "bg-white" : "bg-white/60"}`}
                      />
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE & SHOP BY CATEGORY */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#3D2F23] mb-4">Why Suyambu?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              At Suyambu, we believe in the power of nature. Our products are a celebration of purity, tradition, and the finest organic ingredients, crafted with love to bring wholesome goodness to your home.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {whyChooseFeatures.map(({ Icon, title, desc }, i) => (
              <div key={i} className="text-center">
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

      <section className="bg-white" id="shop-by-category">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <h2 className="text-center font-extrabold text-gray-900 text-3xl md:text-4xl mb-7">
            Shop by Category
          </h2>
          <div className="flex flex-row overflow-x-auto space-x-3 pb-3 category-scrollbar">
            <style>{`.category-scrollbar::-webkit-scrollbar { display: none; }`}</style>
            {categories.map((t) => {
              const active = t.value === activeCategory;
              let count = categoryCounts["all"];
              if (t.value !== "all") {
                count = categoryCounts[t.label?.toLowerCase()] || 0;
              }
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
                  type="button"
                >
                  <t.Icon size={18} className={active ? "text-white" : "text-gray-600"} />
                  <span className="text-sm">
                    {t.label}
                    <span className="ml-1 text-xs font-semibold text-gray-500">
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
