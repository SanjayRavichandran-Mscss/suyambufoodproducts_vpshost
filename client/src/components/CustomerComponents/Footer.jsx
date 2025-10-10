import React from "react";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-12 bg-[#4E7E37] text-white">
      <div className="container mx-auto px-4 py-10">
        {/* Top grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-extrabold">Suyambu</h3>
            <p className="mt-2 text-white/90">
              Pure, Handmade, Organic.
            </p>

            <div className="mt-4 flex items-center gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="h-9 w-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="h-9 w-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="h-9 w-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="mt-4 space-y-3">
              <li><a href="#" className="hover:underline">Shop</a></li>
              <li><a href="#" className="hover:underline">About Us</a></li>
              <li><a href="#" className="hover:underline">Contact</a></li>
              <li><a href="#" className="hover:underline">FAQs</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold">Categories</h4>
            <ul className="mt-4 space-y-3">
              <li><a href="#" className="hover:underline">Oils</a></li>
              <li><a href="#" className="hover:underline">Snacks</a></li>
              <li><a href="#" className="hover:underline">Sweets</a></li>
              <li><a href="#" className="hover:underline">Masala Powders</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold">Contact Us</h4>
            <ul className="mt-4 space-y-3 text-white/90">
              <li>123 Organic Lane, Coimbatore, India</li>
              <li>Email: contact@suyambu.com</li>
              <li>Phone: +91 12345 67890</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-8 h-px w-full bg-white/20" />

        {/* Copyright */}
        <p className="text-center text-white/90 mt-6">
          © 2025 Suyambu. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
