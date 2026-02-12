// client/src/components/CustomerComponents/Footer.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Facebook, Youtube, CreditCard, Lock, Shield } from "lucide-react";

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);

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
    const lowerCategory = "all";
    if (location.pathname === "/" || location.pathname === "/customer") {
      sessionStorage.setItem("selectedCategory", lowerCategory);
      window.dispatchEvent(new CustomEvent("setCategory", { detail: { value: lowerCategory } }));
      const section = document.getElementById("shop-by-category");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }
    sessionStorage.setItem("selectedCategory", lowerCategory);
    sessionStorage.setItem("scrollToShopSection", "yes");
    navigate("/customer");
  };

  const currentYear = new Date().getFullYear();

  const handleLegalLinkClick = (sectionId) => {
    // If already on legal-info page, just scroll smoothly to section
    if (location.pathname === "/legal-info") {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    // Otherwise, navigate to the page with hash
    navigate(`/legal-info#${sectionId}`);

    // After navigation, scroll to the section once the page is ready
    const scrollToSection = () => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // Retry once if element not found immediately
        setTimeout(scrollToSection, 100);
      }
    };

    // Start checking after a short delay to allow page render
    setTimeout(scrollToSection, 150);
  };

  return (
    <>
      {/* Stay Connected Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#3D2F23] mb-4">
            Stay Connected
          </h2>
          <div className="w-24 h-1 bg-[#B6895B] mx-auto mb-10"></div>

          <div className="flex justify-center items-center gap-10">
            <a
              href="https://www.facebook.com/suyambufoodproducts/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:scale-110"
              aria-label="Follow us on Facebook"
            >
              <Facebook size={56} className="text-[#1877F2]" />
            </a>

            <a
              href="https://www.youtube.com/@suyambu-foods"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:scale-110"
              aria-label="Subscribe on YouTube"
            >
              <Youtube size={56} className="text-red-600" />
            </a>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <div className="bg-[#4E7E37] min-h-0 relative mb-[-100px]">
        <footer className="bg-[#4E7E37] text-white">
          <div className="container mx-auto px-4 py-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:justify-between lg:items-start gap-8">
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
                    <button onClick={handleShopClick} className="hover:underline cursor-pointer">
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

              {/* Legal Info */}
              <div>
                <h4 className="text-lg font-semibold">Legal Info</h4>
                <ul className="mt-4 space-y-3">
                  <li>
                    <button
                      onClick={() => handleLegalLinkClick("terms")}
                      className="hover:underline text-left cursor-pointer"
                    >
                      Terms & Conditions
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleLegalLinkClick("shipping")}
                      className="hover:underline text-left cursor-pointer"
                    >
                      Shipping Policy
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleLegalLinkClick("refund")}
                      className="hover:underline text-left cursor-pointer"
                    >
                      Returns & Refund
                    </button>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-lg font-semibold">Contact Us</h4>
                <ul className="mt-4 space-y-3 text-white/90">
                  <li>
                    No.12/486, Sathy Main Road,<br />
                    Theater Road,<br />
                    Sirumugai,<br />
                    Coimbatore – 641302,<br />
                    Tamil Nadu, India.
                  </li>
                  <li>Email: suyambufoodstores@gmail.com</li>
                  <li>Phone: +91 814-816-2714</li>
                </ul>
              </div>
            </div>

            {/* Secure Payment Section */}
            <div className="mt-10 pt-8 border-t border-white/20">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex items-center gap-3">
                  <Lock size={20} className="text-white/90" />
                  <Shield size={20} className="text-white/90" />
                  <CreditCard size={20} className="text-white/90" />
                </div>
                <p className="text-lg font-semibold text-white">
                  100% Secure Payment
                </p>
                <p className="text-sm text-white/80 max-w-md">
                  Your transactions are protected with industry-standard encryption and secure payment gateways.
                </p>
              </div>
            </div>

            <div className="mt-8 h-px w-full bg-white/20" />

            <p className="text-center text-white/90 mt-6">
              © {currentYear} Suyambu. All Rights Reserved.
            </p>

            {/* Developed by - placed at the very bottom */}
            <div className="mt-4 text-center lg:text-right text-sm">
              <p className="text-white/70 italic">
                Crafted with passion by{" "}
                <a
                  href="https://www.linkedin.com/in/sanjayravichandran600/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-white/90 font-[cursive] tracking-wide transition-colors"
                >
                  Sanjay R
                </a>{" "}
                &{" "}
                <a
                  href="https://www.linkedin.com/in/madhans23/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-white/90 font-[cursive] tracking-wide transition-colors"
                >
                  Madhan S
                </a>
              </p>
            </div>
          </div>
        </footer>

        <div className="h-32 w-full bg-[#4E7E37] -mb-1"></div>
      </div>
    </>
  );
}