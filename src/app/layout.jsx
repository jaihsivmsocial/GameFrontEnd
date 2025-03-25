// import "./font.css";
// import "swiper/css";
// import "swiper/css/navigation";
// import "swiper/css/thumbs";
// import "aos/dist/aos.css";
// import "./globals.scss";
// import BootstrapInit from "@/helper/BootstrapInit";
// import RouteScrollToTop from "@/helper/RouteScrollToTop";
// import LoadPhosphorIcons from "@/helper/LoadPhosphorIcons";

// import CustomCursor from "@/helper/CustomCursor";
// import BackToTop from "@/helper/BackToTop";

// export default function RootLayout({ children }) {
//   return (
//     <html lang='en'>
//       <body suppressHydrationWarning={true}>
//         <BootstrapInit />
//         <CustomCursor />
//         <BackToTop />
//         <LoadPhosphorIcons />

//         <RouteScrollToTop />
//         {children}
//       </body>
//     </html>
//   );
// }
"use client"
import "./font.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "aos/dist/aos.css";
import "./globals.scss";
import BootstrapInit from "@/helper/BootstrapInit";
import RouteScrollToTop from "@/helper/RouteScrollToTop";
import LoadPhosphorIcons from "@/helper/LoadPhosphorIcons";
import styles from "../custonCss/home.module.css";
import React,{useState} from 'react'
import Image from "next/image";

import CustomCursor from "@/helper/CustomCursor";
import BackToTop from "@/helper/BackToTop";
import HeaderOne from "@/components/HeaderOne";
import RightChatComp from "@/components/RightChatComp";

export default function RootLayout({ children }) {

  const [isChatOpen, setIsChatOpen] = useState(true);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };
  return (
    <html lang='en'>
      <body suppressHydrationWarning={true}>
        <BootstrapInit />
        <CustomCursor />
        <BackToTop />
        <LoadPhosphorIcons />
        <RouteScrollToTop />

        <HeaderOne />
        <div className={styles.container}>
          <div className={styles.contentWrapper}>
            {children}
            <button
              className={`${styles.chatToggleBtn} ${!isChatOpen ? styles.chatToggleBtnClosed : ""
                }`}
              onClick={toggleChat}
            >
              <Image
                src="/assets/img/iconImage/arrow.png?height=16&width=16"
                width={16}
                height={16}
                alt="Chat"
                className={styles.icon}
              />
            </button>

                  {isChatOpen && (
                  <RightChatComp />
                )}
          </div>
        </div>
      </body>
    </html>
  );
}
