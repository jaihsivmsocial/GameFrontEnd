"use client"

import RealTimeChatCompWrapper from "../../components/chat/RealTimeChatCompWrapper"

export default function ChatPage() {
  // You can pass a specific streamId if needed, or use the default
  const streamId = "default-stream"

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        width: "100vw", // Ensure it takes full width
        backgroundColor: "rgba(255, 255, 255, 0.1)", // Match the chat's background for a seamless look
        padding: "20px",
        boxSizing: "border-box", // Include padding in width/height
      }}
    >
      <RealTimeChatCompWrapper streamId={streamId} />
    </div>
  )
}
