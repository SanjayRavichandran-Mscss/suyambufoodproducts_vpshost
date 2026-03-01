import React from "react";
import { Link } from "react-router-dom";

// Bulk Order Image Imports
import BulkOrderDesktop from "../../Assets/BulkOrderImage/bulkorder_desktop.png";
import BulkOrderMobile from "../../Assets/BulkOrderImage/bulkorder_mobile.png";

const BulkOrderBanner = () => {
  return (
    <section className="w-full overflow-hidden">
      <Link to="/contact" className="block w-full transition-opacity hover:opacity-95">
        <picture>
          <source media="(max-width: 767px)" srcSet={BulkOrderMobile} />
          <img
            src={BulkOrderDesktop}
            alt="Bulk Orders - Click to Contact Us"
            className="w-full h-auto object-cover cursor-pointer"
          />
        </picture>
      </Link>
    </section>
  );
};

export default BulkOrderBanner;