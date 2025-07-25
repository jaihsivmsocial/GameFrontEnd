"use client"
import Image from "next/image"
import { Play, ArrowRight } from "lucide-react"

export default function StreamBottomHighlights({ currentQuestion, countdown }) {
  // Function to render the question text with "ERIC" highlighted
  const renderQuestionText = (questionText) => {
    if (!questionText) return "No active question"
    // Split by text inside quotes, keeping the quotes for splitting logic
    const parts = questionText.split(/(".*?")/)
    return (
      <>
        {parts.map((part, index) => {
          // If the part starts and ends with a quote, it's the highlighted text
          if (part.startsWith('"') && part.endsWith('"')) {
            return (
              <span key={index} style={{ color: "#06b6d4" }}>
                {part.slice(1, -1)} {/* Remove quotes for display */}
              </span>
            )
          }
          // Otherwise, it's regular text
          return <span key={index}>{part}</span>
        })}
      </>
    )
  }

  // Calculate progress bar width based on countdown (assuming max 36 seconds for full bar)
  const progressBarWidth = currentQuestion && countdown > 0 ? (countdown / 36) * 100 : 0

  return (
    <div
      style={{
        background: "#071323", // Dark background from screenshot
        color: "white",
        padding: "10px 20px", // Adjusted padding
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "100%", // Take full height of its parent (15% row)
        width: "80%",
        boxSizing: "border-box", // Include padding in height calculation
        position: "relative", // For pagination dots positioning
      }}
    >
      {/* Highlight Cards Container (80% width) */}
      <div
        style={{
          display: "flex",
          gap: "15px", // Spacing between highlight cards
          flex: "8", // Takes 80% of the available space
          flexShrink: 1, // Allow shrinking if needed, but prefer to maintain size
          overflowX: "auto", // Enable horizontal scrolling if needed
          paddingBottom: "5px", // For scrollbar if present
          scrollbarWidth: "none", // Hide scrollbar for Firefox
          msOverflowStyle: "none", // Hide scrollbar for IE/Edge
          "&::-webkit-scrollbar": {
            display: "none", // Hide scrollbar for Chrome/Safari
          },
        }}
      >
        {/* Highlight Card 1 */}
        <div
          style={{
            backgroundColor: "#0e1a2b",
            border: "1px solid #06b6d4",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            padding: "8px",
            minWidth: "250px", // Fixed width for highlight cards to ensure they don't collapse too much
            flexShrink: 0, // Prevent shrinking below minWidth
          }}
        >
          <div
            style={{
              position: "relative",
              width: "60px",
              height: "40px",
              borderRadius: "4px",
              overflow: "hidden",
              marginRight: "10px",
            }}
          >
            <Image
              src="/placeholder.svg?height=40&width=60&text=Highlight 1"
              alt="Highlight Thumbnail"
              width={60}
              height={40}
              style={{ objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "2px",
                left: "2px",
                backgroundColor: "rgba(0,0,0,0.7)",
                color: "white",
                fontSize: "10px",
                padding: "1px 4px",
                borderRadius: "2px",
              }}
            >
              0:05
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "10px", color: "#9ca3af", marginBottom: "2px" }}>24-07-2025</div>
            <div style={{ fontSize: "14px", fontWeight: "bold", color: "white", lineHeight: "1.2" }}>
              MojoOnPC killed ExWhyZed
            </div>
            <div style={{ fontSize: "10px", color: "#9ca3af" }}>Quick Highlight</div>
          </div>
          <button
            style={{
              backgroundColor: "#0ea5e9",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: "pointer",
              marginLeft: "10px",
            }}
          >
            <Play size={16} color="white" fill="white" />
          </button>
        </div>

        {/* Highlight Card 2 */}
        <div
          style={{
            backgroundColor: "#0e1a2b",
            border: "1px solid #06b6d4",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            padding: "8px",
            minWidth: "250px", // Fixed width for highlight cards
            flexShrink: 0, // Prevent shrinking below minWidth
          }}
        >
          <div
            style={{
              position: "relative",
              width: "60px",
              height: "40px",
              borderRadius: "4px",
              overflow: "hidden",
              marginRight: "10px",
            }}
          >
            <Image
              src="/placeholder.svg?height=40&width=60&text=Highlight 2"
              alt="Highlight Thumbnail"
              width={60}
              height={40}
              style={{ objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "2px",
                left: "2px",
                backgroundColor: "rgba(0,0,0,0.7)",
                color: "white",
                fontSize: "10px",
                padding: "1px 4px",
                borderRadius: "2px",
              }}
            >
              0:05
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "10px", color: "#9ca3af", marginBottom: "2px" }}>24-07-2025</div>
            <div style={{ fontSize: "14px", fontWeight: "bold", color: "white", lineHeight: "1.2" }}>
              Craziest Play of the Day
            </div>
            <div style={{ fontSize: "10px", color: "#9ca3af" }}>Quick Highlight</div>
          </div>
          <button
            style={{
              backgroundColor: "#0ea5e9",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: "pointer",
              marginLeft: "10px",
            }}
          >
            <Play size={16} color="white" fill="white" />
          </button>
        </div>
      </div>

      {/* Question Card (20% width) */}
      <div
        style={{
          backgroundColor: "#1a2b3c", // Darker background for the question card
          borderRadius: "8px",
          padding: "10px 15px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flex: "2", // Takes 20% of the available space
          minWidth: "300px", // Minimum width to prevent content from squishing too much
          flexShrink: 0, // Prevent shrinking below minWidth
          marginLeft: "15px", // Add some space between highlights and question card
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1, marginRight: "15px" }}>
          <div style={{ fontSize: "16px", color: "white", fontWeight: "bold", marginBottom: "5px" }}>
            {renderQuestionText(currentQuestion?.question || 'Will "ERIC" survive for 60 seconds?')}
          </div>
          <div style={{ width: "100%", height: "3px", backgroundColor: "#0e1a2b", borderRadius: "2px" }}>
            <div
              style={{
                width: `${progressBarWidth}%`,
                height: "100%",
                backgroundColor: "#06b6d4",
                borderRadius: "2px",
                transition: "width 1s linear",
              }}
            ></div>
          </div>
        </div>
        <button
          style={{
            backgroundColor: "#0ea5e9",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            cursor: "pointer",
          }}
        >
          <ArrowRight size={20} color="white" />
        </button>
      </div>

      {/* Pagination Dots */}
      <div
        style={{
          position: "absolute",
          bottom: "5px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "5px",
        }}
      >
        <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#9ca3af" }}></div>
        <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#9ca3af" }}></div>
        <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#9ca3af" }}></div>
      </div>
    </div>
  )
}
