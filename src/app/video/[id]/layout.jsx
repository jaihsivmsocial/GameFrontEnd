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
      <body style={{ margin: 0, padding: 0, backgroundColor: "#000", overflow: "hidden" }}>
        {/* The children (VideoPageClient) will be rendered here */}
        {children}
      </body>
    </html>
  )
}
