"use client"

import RealTimeChatCompWrapper from "../../components/chat/RealTimeChatCompWrapper"

export default function ChatPage() {
  const streamId = "default-stream"

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        height: "100vh",
        // backgroundColor: "#000", // optional: dark background for streamer look
        overflow: "hidden",
      }}
    >
      <div className="row g-0" style={{ margin: 0 }}>
        <div className="col-10 p-0">
          {/* Main content area */}
        </div>

        <div
          className="col-2"
          style={{
            height: "340px",
            width: "270px",
            padding: 0,
            margin: 0,
          }}
        >
          <div
            style={{
              width: "270px",
              height: "340px",
              background: "rgba(0, 0, 0, 0.2)",
              boxSizing: "border-box",
              borderRadius: "10px",
              color: "white",
              fontFamily: "Arial, sans-serif",
              overflowY: "auto",
              margin: 0,
            }}
          >
            <RealTimeChatCompWrapper
              streamId={streamId}
              isStandalonePage={false}
              isReadOnly={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
