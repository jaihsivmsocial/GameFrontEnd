// File: SubscribeButton.jsx (renamed)
"use client";
import Link from 'next/link';
import { useState } from 'react';

const SubscribeButton = () => {
  const [hover, setHover] = useState(false);
  return (
    <Link
      href="/subscribe"
      passHref
   className="btn text-white d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: "#000",
        border: `0.5px solid #FFFFFF`,
        width: "143px", // Matches design
        height: "37px", // Matches design
        fontWeight: "bold",
        letterSpacing: "1px",
        boxShadow: hover ? "0 0 10px rgba(13, 202, 240, 0.8)" : "0 0 5px rgba(13, 202, 240, 0.5)",
        transition: "all 0.3s ease-in-out", // Matches the "Ease in and out" curve with 300ms duration
        padding: "0",
        overflow: "hidden",
        gap: "8px",
        borderRadius: "8px",
        position: "relative",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <img
        src="/assets/img/iconImage/fi_3180028.png"
        alt="icon"
        width="20"
        height="20"
        style={{ marginRight: "4px" }}
      />
      SUBSCRIBE
    </Link>
  );
};

export default SubscribeButton;