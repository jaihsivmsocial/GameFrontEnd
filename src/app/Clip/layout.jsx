import { Inter } from "next/font/google"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-icons/font/bootstrap-icons.css"
import "../../app/globals.scss"
import { NavigationProvider } from "../../components/clipsorts/context/NavigationContext"
import { AuthProvider } from "../../components/clipsorts/context/AuthContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Video Clip App",
  description: "Share short video clips with the world",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <NavigationProvider>{children}</NavigationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
