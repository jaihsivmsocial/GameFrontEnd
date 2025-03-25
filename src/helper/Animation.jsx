"use client";

import Aos from "aos";
import { useEffect } from "react";

const Animation = () => {
  useEffect(() => {
    // Initialize AOS
    Aos.init({
      offset: 0,
      easing: "ease",
      once: true,
      duration: 1200,
    });
    Aos.refresh();
  }, []);

  return null;
};

export default Animation;
