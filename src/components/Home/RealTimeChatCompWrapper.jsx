"use client"
import { useEffect, useRef } from "react"
import RealTimeChatComp from "../RightChatComp"

// This is a wrapper component to adjust the styling of the chat component
const RealTimeChatCompWrapper = ({ streamId = "default-stream" }) => {
  const wrapperRef = useRef(null)

  // Apply global styles to override the chat component's default styles
  useEffect(() => {
    // Add a style tag to the document head
    const styleTag = document.createElement("style")
    styleTag.innerHTML = `
      /* Override chat component styles to fit in the overlay */
      .chatSection {
        background-color: rgba(255, 255, 255, 0.15) !important;
        backdrop-filter: blur(10px) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        border-radius: 16px !important;
        height: 100% !important;
        display: flex !important;
        flex-direction: column !important;
        position: relative;
        overflow: hidden;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      }
      
      /* Hide the chat header */
      .chatHeader {
        display: none !important;
      }
      
      .chatMessages {
        flex: 1 !important;
        background-color: transparent !important;
        overflow-y: auto !important;
        padding: 8px !important;
        margin-bottom: 60px; /* Make room for the input at bottom */
      }
      
      .chatMessages::-webkit-scrollbar {
        width: 4px;
      }
      
      .chatMessages::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
      }
      
      .chatMessages::-webkit-scrollbar-track {
        background-color: transparent;
      }
      
      .chatMessage {
        margin-bottom: 12px;
        padding: 0;
        border-radius: 8px;
        background: transparent;
        position: relative;
        display: flex;
      }
      
      .timestamp {
        font-size: 0.7rem;
        color: rgba(255, 255, 255, 0.6);
        position: absolute;
        top: 8px;
        right: 12px;
      }
      
      .userAvatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 10px;
        flex-shrink: 0;
      }
      
      .avatar {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .messageContent {
        display: flex;
        flex-direction: column;
        flex: 1;
      }
      
      .originalMessageUsername {
        font-size: 14px;
        font-weight: bold;
        color: white;
        margin-bottom: 2px;
      }
      
      .originalMessageContent {
        font-size: 14px;
        color: white;
        background-color: transparent;
        padding: 0;
        border-radius: 0;
        display: inline-block;
        max-width: 100%;
        word-break: break-word;
      }
      
      .originalMessageUrl {
        color: #4a9eff;
        word-break: break-word;
        margin-bottom: 4px;
        font-size: 0.9rem;
      }
      
      .messageUser {
        display: flex;
        align-items: center;
        margin-top: 8px;
        position: relative;
      }
      
      .shareButton {
        background: none;
        border: none;
        color: #fff;
        cursor: pointer;
        padding: 4px;
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
      }
      
      /* Style the chat input container to match the existing styles */
      .chatInput {
        display: flex;
        align-items: center;
        padding: 10px 15px;
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px);
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        height: 60px;
      }
      
      /* Style the input field to match the existing styles */
      .messageInput {
        flex: 1;
        background-color: rgba(255, 255, 255, 0.1) !important;
        color: white !important;
        border: none !important;
        border-radius: 20px !important;
        padding: 8px 15px !important;
        font-size: 14px !important;
        height: 40px !important;
        margin-right: 8px;
      }
      
      /* Style the input placeholder */
      .messageInput::placeholder {
        color: rgba(255, 255, 255, 0.6) !important;
      }
      
      .messageInput:focus {
        outline: none;
        background-color: rgba(255, 255, 255, 0.15) !important;
      }
      
      /* Style the emoji button */
      .emojiButton {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 8px;
        margin-right: 8px;
        color: rgba(255, 255, 255, 0.6);
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      /* Style the send button to match the existing styles */
      .sendButton {
        background-color: #0095ff !important;
        border: none !important;
        border-radius: 50% !important;
        cursor: pointer !important;
        padding: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        height: 40px !important;
        width: 40px !important;
        transition: transform 0.2s !important;
      }
      
      .sendButton:hover {
        background-color: #00a0e9 !important;
        transform: scale(1.05) !important;
      }
      
      .sendButton img {
        filter: brightness(0) invert(1);
        width: 20px !important;
        height: 20px !important;
      }
      
      .sendButton:disabled {
        opacity: 0.5 !important;
        cursor: not-allowed !important;
      }
      
      .icon {
        opacity: 1 !important;
      }
      
      /* System message */
      .systemMessage {
        text-align: center;
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        padding: 10px;
      }
      
      /* Reply message */
      .replyMessage {
        background-color: rgba(0, 0, 0, 0.2);
        border-left: 2px solid rgba(255, 255, 255, 0.2);
        padding: 4px 8px;
        margin-bottom: 4px;
        border-radius: 4px;
      }
      
      /* Rate limit message */
      .rateLimitMessage {
        background-color: rgba(255, 193, 7, 0.2);
        color: #ffc107;
        padding: 8px;
        border-radius: 4px;
        margin-top: 8px;
        text-align: center;
        font-size: 14px;
      }
      
      /* Message reactions */
      .messageReactions {
        display: flex;
        gap: 5px;
        margin-top: 4px;
      }
      
      .reaction {
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 2px 6px;
        font-size: 12px;
        display: inline-flex;
        align-items: center;
      }
      
      /* Verified badge */
      .verifiedBadge {
        color: #00c853;
        font-size: 12px;
        margin-left: 5px;
      }
    `
    document.head.appendChild(styleTag)

    // Clean up the style tag when the component unmounts
    return () => {
      document.head.removeChild(styleTag)
    }
  }, [])

  return (
    <div ref={wrapperRef} style={{ height: "100%", overflow: "hidden", position: "relative" }}>
      <RealTimeChatComp streamId={streamId} />
    </div>
  )
}

export default RealTimeChatCompWrapper

