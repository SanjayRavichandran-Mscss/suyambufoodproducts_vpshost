// client/src/components/CustomerComponents/Footer.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Youtube } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Show button only when scrolled down
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleShopClick = () => {
    const lowerCategory = 'all';
    if (location.pathname === '/' || location.pathname === '/customer') {
      sessionStorage.setItem('selectedCategory', lowerCategory);
      window.dispatchEvent(new CustomEvent('setCategory', { detail: { value: lowerCategory } }));
      const section = document.getElementById('shop-by-category');
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    } else {
      sessionStorage.setItem('selectedCategory', lowerCategory);
      sessionStorage.setItem('scrollToShopSection', 'yes');
      navigate("/customer");
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Stay Connected Section */}
      <section className="bg-[#FFF8F0] py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#3D2F23] mb-4">
            Stay Connected
          </h2>
          <div className="w-24 h-1 bg-[#B6895B] mx-auto mb-10"></div>

          <div className="flex justify-center items-center gap-10">
            {/* Facebook Icon */}
            <a
              href="https://www.facebook.com/suyambufoodproducts/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:scale-110"
              aria-label="Follow us on Facebook"
            >
              <svg className="w-12 h-12" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-11.999-12-12s-12 5.372-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>

            {/* Instagram Icon */}
            <a
              href="https://www.instagram.com/suyambufoodstores"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:scale-110"
              aria-label="Follow us on Instagram"
            >
              <svg className="w-12 h-12" viewBox="0 0 24 24" fill="url(#instagramGradient)">
                <defs>
                  <linearGradient id="instagramGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F56040" />
                    <stop offset="30%" stopColor="#C13584" />
                    <stop offset="70%" stopColor="#833AB4" />
                    <stop offset="100%" stopColor="#405DE6" />
                  </linearGradient>
                </defs>
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4.01-1.801-4.01-4.01 0-2.209 1.801-4.01 4.01-4.01s4.01 1.801 4.01 4.01c0 2.209-1.801 4.01-4.01 4.01zm6.406-11.845c-.796 0-1.44-.644-1.44-1.44s.644-1.44 1.44-1.44 1.44.644 1.44 1.44c0 .796-.644 1.44-1.44 1.44z" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Main Footer + Full Green Background Extension */}
      <div className="bg-[#4E7E37] min-h-0 relative">
        <footer className="bg-[#4E7E37] text-white">
          <div className="container mx-auto px-4 py-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:justify-between lg:items-start gap-8">
              {/* Brand */}
              <div>
                <h3 className="text-2xl font-extrabold">Suyambu</h3>
                <p className="mt-2 text-white/90">
                  Pure, Handmade, Organic.
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <a
                    href="https://www.facebook.com/suyambufoodproducts/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="h-9 w-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/20 transition"
                  >
                    <Facebook size={18} />
                  </a>
                  <a
                    href="https://www.youtube.com/@suyambu-foods"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="h-9 w-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/20 transition"
                  >
                    <Youtube size={18} />
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-lg font-semibold">Quick Links</h4>
                <ul className="mt-4 space-y-3">
                  <li>
                    <button onClick={handleShopClick} className="hover:underline">
                      Shop
                    </button>
                  </li>
                  <li>
                    <Link to="/about" className="hover:underline">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="hover:underline">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-lg font-semibold">Contact Us</h4>
                <ul className="mt-4 space-y-3 text-white/90">
                  <li>No.12/486, Sathy Main Road,
                    Theater Road,
                    Sirumugai,
                    Coimbatore – 641302,
                    Tamil Nadu, India.</li>
                  <li>Email: suyambufoodstores@gmail.com</li>
                  <li>Phone: +91 9345872342</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 h-px w-full bg-white/20" />

            <p className="text-center text-white/90 mt-6">
              © {currentYear} Suyambu. All Rights Reserved.
            </p>
          </div>
        </footer>

        {/* Invisible full-height green filler */}
        <div className="h-32 w-full bg-[#4E7E37] -mb-1"></div>

        {/* SCROLL TO TOP BUTTON - Floating Arrow */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-20 right-4 md:right-8 z-50 w-14 h-14 bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-green-700 transition-all duration-300 hover:scale-110 animate-bounce"
            aria-label="Scroll to top"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        )}
      </div>
    </>
  );
}