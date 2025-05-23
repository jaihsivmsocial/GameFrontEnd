"use client"
import Image from "next/image"
import styles from "../../custonCss/home.module.css"

const ReplyMessage = ({ username, onSend, onCancel, message, setMessage, streamId, replyTo, socket }) => {
  // Function to handle sending reply using socket
  const handleSendReply = () => {
    if (!message.trim() || !socket) return

    try {
      // CHANGE: Store message content in a variable for reuse
      const messageContent = message.trim()
      
      console.log("Sending reply via socket:", {
        content: messageContent,
        streamId,
        replyTo: {
          messageId: replyTo.id,
          username: replyTo.sender.username,
          content: replyTo.content,
        },
      })

      // Send message via socket
      socket.emit("send_message", {
        content: messageContent,
        streamId,
        replyTo: {
          messageId: replyTo.id,
          username: replyTo.sender.username,
          content: replyTo.content,
        },
      })

      // Clear the message input
      setMessage("")

      // Call the parent's onSend callback to update UI
      onSend()
    } catch (error) {
      console.error("Error sending reply:", error)
    }
  }

  // Check if the content is a URL
  const isUrl = (text) => {
    try {
      new URL(text)
      return true
    } catch {
      return false
    }
  }

  // Format the message content
  const formatContent = (content) => {
    if (!content) return null

    // Split content by lines
    const lines = content.split("\n")

    return lines.map((line, index) => {
      if (isUrl(line.trim())) {
        return (
          <div key={index} className={styles.originalMessageUrl}>
            {line}
          </div>
        )
      }
      return (
        <div key={index} className={styles.originalMessageContent}>
          {line}
        </div>
      )
    })
  }

  return (
    <div className={styles.replyContainer}>
      <div className={styles.replyHeader}>
        <div className={styles.replyingTo}>
          <span className={styles.replyArrow}>↩</span>
          <span>Replying to @{username}</span>
        </div>
        <button onClick={onCancel} className={styles.cancelReplyButton}>
          ×
        </button>
      </div>

      {/* Show the original message with the same styling as in the screenshot */}
      <div className={styles.originalMessage}>
        <div className={styles.originalMessageUsername}>{replyTo.sender.username}</div>
        {formatContent(replyTo.content)}
      </div>

      <div className={styles.replyInputContainer}>
        <input
          type="text"
          placeholder="Type your reply..."
          className={styles.replyInput}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && message.trim()) {
              handleSendReply()
            }
          }}
          autoFocus
        />
        <button onClick={handleSendReply} className={styles.sendReplyButton} disabled={!message.trim()}>
          <Image
            src="/assets/img/chat/send-message.png?height=20&width=20"
            width={20}
            height={20}
            alt="Send"
            className={styles.icon}
          />
        </button>
      </div>
    </div>
  )
}

export default ReplyMessage