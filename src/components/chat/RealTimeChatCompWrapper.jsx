"use client"
import { useEffect, useRef } from "react"
import RealTimeChatComp from "../../components/chat/RightChatComp"

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
    background-color: rgba(0, 0, 0, 0.5) !important;
    backdrop-filter: blur(10px) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 16px !important;
    height: 400px !important;
    max-height: 80vh !important; 
    display: flex !important;
    flex-direction: column !important;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    width: 100%;
    max-width: 400px; /* Limit width on larger screens */
    margin: 0 auto;
  }
  
  /* Hide the chat header */
  .chatHeader {
    display: none !important;
  }
  
  .chatMessages {
    flex: 1 !important;
    background-color: transparent !important;
    overflow-y: auto !important;
    padding: 0 !important;
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
  
  /* Main chat table */
  .chatTable {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    border: none;
  }
  
  /* Chat row */
  .chatRow {
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  }
  
  /* Last row should not have a bottom border */
  .chatRow:last-child {
    border-bottom: none;
  }
  
  /* Profile cell (left column) */
  .profileCell {
    width: 80px;
    vertical-align: middle;
    padding: 10px;
    text-align: center;
    border-right: 1px solid rgba(255, 255, 255, 0.3);
  }
  
  /* Message cell (right column) */
  .messageCell {
    vertical-align: middle;
    padding: 10px 15px;
    text-align: center;
    background: transparent;
  }
  
  .userAvatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    margin: 0 auto 5px;
  }
  
  .avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .originalMessageUsername {
    font-size: 12px;
    font-weight: bold;
    color: white;
    text-align: center;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
    border: none;
    box-shadow: none;
    text-align: center;
  }
  
  .originalMessageUrl {
    color: #4a9eff;
    word-break: break-word;
    margin-bottom: 4px;
    font-size: 0.9rem;
    text-align: center;
  }
  
  .shareButton {
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    padding: 4px;
  }
  
  /* Style the chat input container to match the existing styles */
  .chatInput {
    display: flex;
    align-items: center;
    padding: 10px 15px;
    background: #ffffff;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    height: 60px;
    border-radius: 0 0 16px 16px;
  }
  
  /* Style the input field to match the existing styles */
  .messageInput {
    flex: 1;
    background-color: transparent !important;
    color: #666 !important;
    border: none !important;
    border-radius: 20px !important;
    padding: 8px 15px !important;
    font-size: 14px !important;
    height: 40px !important;
    margin-right: 8px;
  }
  
  /* Style the input placeholder */
  .messageInput::placeholder {
    color: #999 !important;
  }
  
  .messageInput:focus {
    outline: none;
  }
  
  /* Style the send button to match the screenshot */
  .sendButton {
    background-color: #4da6ff !important;
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
    background-color: #3a95ff !important;
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
    background-color: transparent;
    border-left: 2px solid rgba(255, 255, 255, 0.2);
    padding: 4px 8px;
    margin-bottom: 4px;
    border-radius: 0;
    box-shadow: none;
    text-align: center;
  }
  
  .replyUsername {
    font-size: 12px;
    font-weight: bold;
    color: rgba(255, 255, 255, 0.8);
    text-align: center;
  }
  
  /* Rate limit message */
  .rateLimitMessage {
    color: #ffc107;
    padding: 8px;
    text-align: center;
    font-size: 14px;
    background: transparent;
    border: none;
  }
  
  /* Responsive styles for different device sizes */
  @media (max-width: 991px) {
    .chatSection {
      height: 380px !important;
    }
    
    .userAvatar {
      width: 32px;
      height: 32px;
    }
    
    .originalMessageUsername {
      font-size: 11px;
    }
    
    .originalMessageContent {
      font-size: 13px;
    }
  }
  
  @media (max-width: 767px) {
    .chatSection {
      height: 350px !important;
      max-width: 100%;
    }
    
    .profileCell {
      width: 60px;
    }
    
    .userAvatar {
      width: 28px;
      height: 28px;
    }
    
    .chatInput {
      height: 50px;
    }
  }
  
  @media (max-width: 575px) {
    .chatSection {
      height: 400px !important;
      border-radius: 16px !important;
    }
    
    .profileCell {
      width: 45px;
      padding: 6px;
    }
    
    .messageCell {
      padding: 6px 8px;
    }
    
    .userAvatar {
      width: 24px;
      height: 24px;
    }
    
    .originalMessageUsername {
      font-size: 10px;
    }
    
    .originalMessageContent {
      font-size: 11px;
    }
    
    .chatInput {
      height: 45px;
      padding: 6px 10px;
    }
    
    .messageInput {
      height: 35px !important;
      font-size: 12px !important;
    }
    
    .sendButton {
      width: 35px !important;
      height: 35px !important;
    }
    
    .sendButton img {
      width: 16px !important;
      height: 16px !important;
    }
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
