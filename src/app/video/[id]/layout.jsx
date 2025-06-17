// This layout will now act as the root layout for the /video/[id] route,
// preventing higher-level layouts (like app/layout.jsx or app/clip/layout.jsx)
// from wrapping it. This ensures the video page is full-screen and isolated.
export default function VideoLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Ensure viewport meta tag is present for responsiveness */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* You can add any other global meta tags specific to video pages here if needed */}
      </head>
      {/* Apply aggressive styling to the body to ensure it's a clean slate */}
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#000",
          overflow: "hidden",
          width: "100vw",
          height: "100vh",
          position: "fixed", // Use fixed to ensure it covers the entire viewport
          top: 0,
          left: 0,
          zIndex: 9998, // Slightly lower than the client component's z-index
        }}
      >
        {/* The children (VideoPageClient) will be rendered here */}
        {children}
      </body>
    </html>
  )
}
