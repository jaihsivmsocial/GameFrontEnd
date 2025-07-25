'use client';
import React from 'react';

export default function  MobileModel() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-evenly",
        alignItems: "center",
        width: "100%",
        padding: "12px 16px",
        minHeight: "80px",
      }}
    >
        
      <button
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "none",
          border: "none",
          color: "#94a3b8", // Gray text color like your current buttons
          padding: "8px 4px",
          cursor: "pointer",
          minWidth: "60px",
          transition: "color 0.2s",
          
        }}
        onMouseEnter={(e) => e.target.style.color = "#ffffff"}
        onMouseLeave={(e) => e.target.style.color = "#94a3b8"}
      >
        <img 
          src="/assets/img/mobile/shop.png" 
          alt="Shop" 
          width={24} 
          height={24}
          style={{ marginBottom: "4px", opacity: "0.8" }}
        />
        <span style={{ 
          fontSize: "12px", 
          fontWeight: "400", 
          textAlign: "center",
          lineHeight: "1"
        }}>
          Shop
        </span>
      </button>
   <button
          onClick={() => setActiveMobileSection("donate")}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "none",
            border: "none",
            color: "white",
            padding: "5px 0",
            width: "20%",
          }}
        >
          <img src="/assets/img/mobile/donate.png" alt="donate" width={24} height={24} />
          <span style={{ fontSize: "12px", marginTop: "2px" }}>Donate</span>
        </button>
      <button
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "none",
          border: "none",
          color: "#94a3b8", // Gray text color like your current buttons
          padding: "8px 4px",
          cursor: "pointer",
          minWidth: "60px",
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) => e.target.style.color = "#ffffff"}
        onMouseLeave={(e) => e.target.style.color = "#94a3b8"}
      >
        <img 
          src="/assets/img/mobile/video-play.png" 
          alt="Clips" 
          width={24} 
          height={24}
          style={{ marginBottom: "4px", opacity: "0.8" }}
        />
        <span style={{ 
          fontSize: "12px", 
          fontWeight: "400", 
          textAlign: "center",
          lineHeight: "1"
        }}>
          Clips
        </span>
      </button>

      <button
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "none",
          border: "none",
          color: "#94a3b8", // Gray text color like your current buttons
          padding: "8px 4px",
          cursor: "pointer",
          minWidth: "60px",
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) => e.target.style.color = "#ffffff"}
        onMouseLeave={(e) => e.target.style.color = "#94a3b8"}
      >
        <img
          src="/assets/img/mobile/iconImage/settings 1.png"
          alt="Settings"
          style={{ 
            width: "24px", 
            height: "24px", 
            marginBottom: "4px", 
            opacity: "0.8" 
          }}
        />
        <span style={{ 
          fontSize: "12px", 
          fontWeight: "400", 
          textAlign: "center",
          lineHeight: "1"
        }}>
          Settings
        </span>
      </button>
    </div>
  );
};