import Image from "next/image"
import { Play, ArrowRight } from "lucide-react"

export default function StreamBottomHighlights({ currentQuestion, countdown }) {
  const highlights = [
    {
      id: 1,
      thumbnail: "/placeholder.svg?height=40&width=60",
      time: "0:05",
      date: "24-07-2025",
      title: "MojoOnPC killed ExWhyZed",
      type: "Quick Highlight",
    },
    {
      id: 2,
      thumbnail: "/placeholder.svg?height=40&width=60",
      time: "0:05",
      date: "24-07-2025",
      title: "Craziest Play of the Day",
      type: "Quick Highlight",
    },
  ]

  const progress = currentQuestion && currentQuestion.duration > 0 ? (countdown / currentQuestion.duration) * 100 : 0

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 0",
        backgroundColor: "#071323", // Dark background for the entire highlights section
        height: "100%",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Highlights Section (approx 80% width) */}
      <div
        style={{
          flex: "8", // 80% of the width of this container
          display: "flex",
          gap: "15px",
          alignItems: "center",
          paddingLeft: "20px", // Padding to align with video content
          boxSizing: "border-box",
        }}
      >
        {highlights.map((highlight) => (
          <div
            key={highlight.id}
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#0e1a2b", // Slightly lighter dark for highlight cards
              borderRadius: "8px",
              border: "1px solid #06b6d4", // Light blue border
              padding: "8px",
              gap: "10px",
              minWidth: "250px", // Ensure cards have a minimum width
              boxSizing: "border-box",
            }}
          >
            <div style={{ position: "relative", flexShrink: 0 }}>
              <Image
                src={highlight.thumbnail || "/placeholder.svg"}
                alt="Highlight Thumbnail"
                width={60}
                height={40}
                style={{ borderRadius: "4px", objectFit: "cover" }}
              />
              <span
                style={{
                  position: "absolute",
                  bottom: "2px",
                  left: "2px",
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  color: "#fff",
                  fontSize: "10px",
                  padding: "2px 4px",
                  borderRadius: "3px",
                }}
              >
                {highlight.time}
              </span>
            </div>
            <div style={{ flexGrow: 1 }}>
              <div style={{ color: "#9ca3af", fontSize: "10px", marginBottom: "2px" }}>
                {highlight.date}
                <span
                  style={{
                    marginLeft: "5px",
                    display: "inline-block",
                    width: "15px",
                    height: "1px",
                    backgroundColor: "#9ca3af",
                    verticalAlign: "middle",
                  }}
                ></span>
              </div>
              <div style={{ color: "#fff", fontSize: "14px", fontWeight: "bold", lineHeight: "1.2" }}>
                {highlight.title}
              </div>
              <div style={{ color: "#9ca3af", fontSize: "10px" }}>{highlight.type}</div>
            </div>
            <button
              style={{
                backgroundColor: "#0ea5e9", // Bright blue for play button
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <Play size={16} color="#fff" fill="#fff" />
            </button>
          </div>
        ))}
        {/* Pagination dots */}
        <div style={{ display: "flex", gap: "5px", marginLeft: "10px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#9ca3af" }}></span>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#9ca3af" }}></span>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#9ca3af" }}></span>
        </div>
      </div>

      {/* Question Card Section (approx 20% width) */}
      <div
        style={{
          flex: "2", // 20% of the width of this container
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#1a2b3c", // Darker background for question card
          borderRadius: "8px",
          padding: "10px 15px",
          marginRight: "20px", // Margin to align with chat section
          height: "calc(100% - 20px)", // Adjust height to fit within parent with padding
          boxSizing: "border-box",
          minWidth: "280px", // Ensure question card has a minimum width
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
          <div style={{ color: "#fff", fontSize: "16px", fontWeight: "normal" }}>
            {currentQuestion ? (
              <>
                Will <span style={{ color: "#06b6d4", fontWeight: "bold" }}>{currentQuestion.text.split('"')[1]}</span>{" "}
                {currentQuestion.text.split('"')[2]}
              </>
            ) : (
              "No active question"
            )}
          </div>
          <div
            style={{
              width: "100%",
              height: "4px",
              backgroundColor: "#0e1a2b", // Darker background for progress bar track
              borderRadius: "2px",
              marginTop: "8px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                backgroundColor: "#06b6d4", // Light blue for progress bar fill
                borderRadius: "2px",
                transition: "width 1s linear",
              }}
            ></div>
          </div>
        </div>
        <button
          style={{
            backgroundColor: "#0ea5e9", // Bright blue for arrow button
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            cursor: "pointer",
            marginLeft: "15px",
            flexShrink: 0,
          }}
        >
          <ArrowRight size={20} color="#fff" />
        </button>
      </div>
    </div>
  )
}
