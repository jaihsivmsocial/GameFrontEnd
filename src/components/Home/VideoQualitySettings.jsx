"use client"

import { useState, useEffect, useRef } from "react"
import styles from "../../viewscreen/screen.module.css"
import qualitySettingsService from "../contexts/quality-settings-service"

const VideoQualitySettings = ({
  streamId,
  onQualityChange,
  onPreviewChange,
  initialQuality = "auto",
  initialFrameRate = "60",
}) => {
  const [showSettings, setShowSettings] = useState(false)
  const [showQualityOptions, setShowQualityOptions] = useState(false)
  const [showFrameRateOptions, setShowFrameRateOptions] = useState(false)
  const [quality, setQuality] = useState(initialQuality)
  const [frameRate, setFrameRate] = useState(initialFrameRate)
  const [userId, setUserId] = useState(null)
  const settingsRef = useRef(null)
  const qualityChangeTimeoutRef = useRef(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  // Get user ID from local storage
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId") || `anonymous-${Math.random().toString(36).substring(2, 10)}`
    setUserId(storedUserId)

    // Save anonymous ID if not already saved
    if (!localStorage.getItem("userId")) {
      localStorage.setItem("userId", storedUserId)
    }

    // Fetch initial settings
    fetchQualitySettings(storedUserId, streamId)

    // Close settings when clicking outside
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false)
        setShowQualityOptions(false)
        setShowFrameRateOptions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      if (qualityChangeTimeoutRef.current) {
        clearTimeout(qualityChangeTimeoutRef.current)
      }
    }
  }, [streamId])

  // Fetch quality settings from API
  const fetchQualitySettings = async (userId, streamId) => {
    try {
      const response = await qualitySettingsService.getQualitySettings(userId, streamId)
      if (response.success && response.settings) {
        setQuality(response.settings.quality)
        setFrameRate(response.settings.frameRate)

        // Notify parent component
        if (onQualityChange) {
          onQualityChange(response.settings.quality, response.settings.frameRate)
        }
      } else {
        // Use initial values
        setQuality(initialQuality)
        setFrameRate(initialFrameRate)
      }
    } catch (error) {
      console.error("Error fetching quality settings:", error)
    }
  }

  // Update quality settings with debounce to prevent too many updates
  const updateQualitySettings = async (newQuality, newFrameRate) => {
    if (!userId || !streamId) return

    try {
      const settings = {
        quality: newQuality || quality,
        frameRate: newFrameRate || frameRate,
      }

      // Clear any existing timeout
      if (qualityChangeTimeoutRef.current) {
        clearTimeout(qualityChangeTimeoutRef.current)
      }

      // Set a timeout to update after a short delay
      qualityChangeTimeoutRef.current = setTimeout(() => {
        // Save to API
        qualitySettingsService
          .updateQualitySettings(userId, streamId, settings)
          .then(() => {
            console.log(`Quality settings updated: ${settings.quality}, ${settings.frameRate}fps`)
          })
          .catch((error) => {
            console.error("Error updating quality settings:", error)
          })

        // Notify parent component immediately
        if (onQualityChange) {
          onQualityChange(settings.quality, settings.frameRate)
        }
      }, 300) // 300ms debounce
    } catch (error) {
      console.error("Error updating quality settings:", error)
    }
  }

  // Handle quality change
  const handleQualityChange = (newQuality) => {
    setQuality(newQuality)
    updateQualitySettings(newQuality, frameRate)
    setShowQualityOptions(false)
  }

  // Handle frame rate change
  const handleFrameRateChange = (newFrameRate) => {
    setFrameRate(newFrameRate)
    updateQualitySettings(quality, newFrameRate)
    setShowFrameRateOptions(false)
  }

  // Get display text for current quality
  const getQualityDisplayText = () => {
    if (quality === "auto") return "Auto (1080p)"
    return quality
  }

  // Toggle quality options
  const toggleQualityOptions = (e) => {
    e.stopPropagation()
    setShowQualityOptions(!showQualityOptions)
    setShowFrameRateOptions(false)
  }

  // Toggle frame rate options
  const toggleFrameRateOptions = (e) => {
    e.stopPropagation()
    setShowFrameRateOptions(!showFrameRateOptions)
    setShowQualityOptions(false)
  }

  // Handle preview button click
  const handlePreviewClick = () => {
    setIsPreviewMode(!isPreviewMode)
    // You can add additional logic here to handle the preview mode
    // For example, notify parent component about preview mode change
    if (onPreviewChange) {
      onPreviewChange(!isPreviewMode)
    }
  }

  return (
    <div
      className={styles.videoQualitySettings}
      ref={settingsRef}
      style={{ display: "flex", flexDirection: "row", gap: "8px" }}
    >
      {/* Settings button */}
      <button
        className={styles.settingsButton}
        onClick={() => setShowSettings(!showSettings)}
        aria-label="Video settings"
      >
        <img
          src="/assets/img/iconImage/settings 1.png"
          alt="Settings"
          style={{ width: "24px", height: "24px", strokeL: "white" }}
        />
      </button>

      {/* Preview button */}
      <button className={styles.settingsButtons} onClick={handlePreviewClick} aria-label="Preview video">
        <img
          src="/assets/img/preview/preview 1 (4).png"
          alt="Preview"
          style={{ width: "24px", height: "24px", strokeL: "white",}}
        />
      </button>

      {/* Settings menu */}
      {showSettings && (
        <div className={styles.horizontalSettingsMenu}>
          {/* Quality row */}
          <div className={styles.settingRow} onClick={toggleQualityOptions}>
            <div className={styles.settingIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.5 6H15.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 10H18" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8.5 14H15.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 18H18" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className={styles.settingLabel}>Resolution</div>
            <div className={styles.settingValue}>{getQualityDisplayText()}</div>
            <div className={styles.settingArrow}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Frame Rate row */}
          <div className={styles.settingRow} onClick={toggleFrameRateOptions}>
            <div className={styles.settingIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2V6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 18V22" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path
                  d="M4.93 4.93L7.76 7.76"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16.24 16.24L19.07 19.07"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M2 12H6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18 12H22" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path
                  d="M4.93 19.07L7.76 16.24"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16.24 7.76L19.07 4.93"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className={styles.settingLabel}>Frame Rate</div>
            <div className={styles.settingValue}>{frameRate} FPS</div>
            <div className={styles.settingArrow}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Keyboard Shortcuts row */}
          <div className={styles.settingRow}>
            <div className={styles.settingIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect
                  x="2"
                  y="4"
                  width="20"
                  height="16"
                  rx="2"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M6 8V8.01" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 8V8.01" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 8V8.01" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18 8V8.01" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 12V12.01" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 12V12.01" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 12V12.01" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18 12V12.01" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 16V16.01" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18 16V16.01" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 16H14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className={styles.settingLabel}>Keyboard Shortcuts</div>
            <div className={styles.settingValue}>View</div>
            <div className={styles.settingArrow}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Quality options dropdown */}
          {showQualityOptions && (
            <div className={styles.optionsDropdown}>
              {/* <div className={styles.optionsHeader}>
                <span>Video resolution will change, but player size will remain the same</span>
              </div> */}
              <div
                className={`${styles.optionItem} ${quality === "auto" ? styles.activeOption : ""}`}
                onClick={() => handleQualityChange("auto")}
              >
                Auto (1080p)
              </div>
              <div
                className={`${styles.optionItem} ${quality === "1080p" ? styles.activeOption : ""}`}
                onClick={() => handleQualityChange("1080p")}
              >
                1080p HD
              </div>
              <div
                className={`${styles.optionItem} ${quality === "720p" ? styles.activeOption : ""}`}
                onClick={() => handleQualityChange("720p")}
              >
                720p HD
              </div>
              <div
                className={`${styles.optionItem} ${quality === "480p" ? styles.activeOption : ""}`}
                onClick={() => handleQualityChange("480p")}
              >
                480p
              </div>
              <div
                className={`${styles.optionItem} ${quality === "360p" ? styles.activeOption : ""}`}
                onClick={() => handleQualityChange("360p")}
              >
                360p
              </div>
              <div
                className={`${styles.optionItem} ${quality === "240p" ? styles.activeOption : ""}`}
                onClick={() => handleQualityChange("240p")}
              >
                240p
              </div>
              <div
                className={`${styles.optionItem} ${quality === "144p" ? styles.activeOption : ""}`}
                onClick={() => handleQualityChange("144p")}
              >
                144p
              </div>
            </div>
          )}

          {/* Frame Rate options dropdown */}
          {showFrameRateOptions && (
            <div className={styles.optionsDropdown}>
              <div className={styles.optionsHeader}>
                <span>Higher frame rate provides smoother video playback</span>
              </div>
              <div
                className={`${styles.optionItem} ${frameRate === "60" ? styles.activeOption : ""}`}
                onClick={() => handleFrameRateChange("60")}
              >
                60 FPS
              </div>
              <div
                className={`${styles.optionItem} ${frameRate === "30" ? styles.activeOption : ""}`}
                onClick={() => handleFrameRateChange("30")}
              >
                30 FPS
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default VideoQualitySettings
