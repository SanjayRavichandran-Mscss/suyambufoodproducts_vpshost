import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Youtube } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleCategoryClick = (category) => {
    const lowerCategory = category.toLowerCase();
    if (location.pathname === '/' || location.pathname === '/customer') {
      sessionStorage.setItem('selectedCategory', lowerCategory);
      const section = document.getElementById('shop-by-category');
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      // Assuming there's a way to trigger filter, e.g., via event or context; here using sessionStorage
      window.dispatchEvent(new CustomEvent('setCategory', { detail: { value: lowerCategory } }));
      return;
    } else {
      sessionStorage.setItem('selectedCategory', lowerCategory);
      sessionStorage.setItem('scrollToShopSection', 'yes');
      navigate("/customer");
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-0 pt-0 bg-[#4E7E37] text-white">
      <div className="container mx-auto px-4 py-10">
        {/* Top grid */}
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

          {/* Categories */}
          {/* <div>
            <h4 className="text-lg font-semibold">Categories</h4>
            <ul className="mt-4 space-y-3">
              <li>
                <button onClick={() => handleCategoryClick('Oils')} className="hover:underline">
                  Oil Items
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('Snacks')} className="hover:underline">
                  Snacks
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('Sweets')} className="hover:underline">
                  Sweets
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('Masala Powders')} className="hover:underline">
                  Masala Powders
                </button>
              </li>
            </ul>
          </div> */}

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold">Contact Us</h4>
            <ul className="mt-4 space-y-3 text-white/90">
              <li>82C5+97M, Mettupalayam, Tamil Nadu 641302</li>
              <li>Email: suyambufoodstores@gmail.com</li>
              <li>Phone: +91 9345872342</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-8 h-px w-full bg-white/20" />

        {/* Copyright */}
        <p className="text-center text-white/90 mt-6">
          © {currentYear} Suyambu. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}