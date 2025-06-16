// Create a specific layout for video pages that doesn't include the main site navigation
export default function VideoLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#000" }}>{children}</body>
    </html>
  )
}
