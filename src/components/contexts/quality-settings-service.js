// Quality settings API service
const qualitySettingsService = {
    // Get quality settings for a user and stream
    getQualitySettings: async (userId, streamId) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/quality-settings/${userId}/${streamId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        )
  
        return await response.json()
      } catch (error) {
        console.error("Error fetching quality settings:", error)
        return {
          success: false,
          error: "Failed to fetch quality settings",
          // Default settings
          settings: {
            quality: "auto",
            frameRate: "60",
          },
        }
      }
    },
  
    // Update quality settings
    updateQualitySettings: async (userId, streamId, settings) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/quality-settings/${userId}/${streamId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(settings),
          },
        )
  
        return await response.json()
      } catch (error) {
        console.error("Error updating quality settings:", error)
        return { success: false, error: "Failed to update quality settings" }
      }
    },
  }
  
  export default qualitySettingsService
  
  