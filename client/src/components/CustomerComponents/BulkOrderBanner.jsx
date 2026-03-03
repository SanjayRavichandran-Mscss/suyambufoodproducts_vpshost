import React from "react";
import { Link } from "react-router-dom";

// Bulk Order Image Imports
import BulkOrderDesktop from "../../Assets/BulkOrderImage/bulkorder_desktop.png";
import BulkOrderMobile from "../../Assets/BulkOrderImage/bulkorder_mobile.png";

const BulkOrderBanner = () => {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 md:py-8">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/contact"
          className="block w-full transition-opacity hover:opacity-95"
        >
          <picture>
            <source media="(max-width: 767px)" srcSet={BulkOrderMobile} />
            <img
              src={BulkOrderDesktop}
              alt="Bulk Orders - Click to Contact Us"
              className="w-full h-auto object-cover rounded-lg shadow-md"
            />
          </picture>
        </Link>
      </div>
    </section>
  );
};

export default BulkOrderBanner;