"use client";
import React, { useEffect, useState } from "react";

const BackToTop = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;

      // Toggle back-to-top visibility
      if (scrollTop > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <>
      {/* Back to Top Button */}
      {showBackToTop ? (
        <div className='back-to-top' onClick={scrollToTop}>
          <span className='back-top'>
            <i className='fa fa-angle-up'></i>
          </span>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default BackToTop;
