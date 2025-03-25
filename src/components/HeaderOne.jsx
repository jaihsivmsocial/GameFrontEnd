"use client";
import React, { useEffect, useRef, useState } from "react";

import { usePathname } from "next/navigation";
import Link from "next/link";
import SpectateButton from "./SpectateButton";
//  import Shope from './Shope'
import { Login } from "./Login";
import { Signup } from "./Signup";
import { Shope } from "../components/cloths/Shope";
import { PlayButton } from "./play";
import SucribeButton from "./SubcribeButton";
import Profile from "./profile";
import AuthHeaderButtons from "./SignupLogin";

const HeaderOne = () => {
  const [scroll, setScroll] = useState(false);
  const location = usePathname();
  useEffect(() => {
    window.onscroll = () => {
      if (window.pageYOffset < 150) {
        setScroll(false);
      } else if (window.pageYOffset > 150) {
        setScroll(true);
      }
      return () => (window.onscroll = null);
    };
  }, []);

  const bodyOverlayRef = useRef(null);
  const searchPopupRef = useRef(null);
  const sidebarMenuRef = useRef(null);

  useEffect(() => {
    const handleOverlayClick = (e) => {
      e.preventDefault();
      bodyOverlayRef.current.classList.remove("active");
      searchPopupRef.current.classList.remove("active");
      sidebarMenuRef.current.classList.remove("active");
    };

    // Handle search button click
    const handleSearchBarClick = (e) => {
      e.preventDefault();
      searchPopupRef.current.classList.add("active");
      bodyOverlayRef.current.classList.add("active");
    };

    // Attach event listeners
    const bodyOverlayElement = bodyOverlayRef.current;
    const searchBarButton = document.querySelector(".search-bar-btn");

    if (bodyOverlayElement) {
      bodyOverlayElement.addEventListener("click", handleOverlayClick);
    }

    if (searchBarButton) {
      searchBarButton.addEventListener("click", handleSearchBarClick);
    }

    // Cleanup event listeners on unmount
    return () => {
      if (bodyOverlayElement) {
        bodyOverlayElement.removeEventListener("click", handleOverlayClick);
      }
      if (searchBarButton) {
        searchBarButton.removeEventListener("click", handleSearchBarClick);
      }
    };
  }, []);

  const [activeMenu, setActiveMenu] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toggle mobile menu
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Toggle sub-menu
  const handleSubMenuToggle = (index) => {
    setActiveMenu(activeMenu === index ? null : index);
  };

  return (
    <>
      {/* search popup start*/}
      <div
        className="td-search-popup"
        id="td-search-popup"
        ref={searchPopupRef}
      >
        <form action="index" className="search-form">
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search....."
            />
          </div>
          <button type="submit" className="submit-btn">
            <i className="fa fa-search" />
          </button>
        </form>
      </div>
      {/* search popup end*/}
      <div className="body-overlay" id="body-overlay" ref={bodyOverlayRef} />
      {/* navbar start */}
      <nav
        className={`navbar  main navbar-area navbar-area-1 navbar-border navbar-expand-lg ${scroll ? "sticky-active" : ""
          }`}
        style={{ backgroundColor: "#070b11" }}
      >
        <div className="container nav-container px-lg-0">

          <div className="logo">
            <div className="d-flex items-center gap-5">
              <Link href="/">
                <img src="assets/fonts/logo.png" alt="img" />
              </Link>
            </div>
          </div>
          <div>
            <SucribeButton />
          </div>

          <div>
            <SpectateButton />
          </div>
          <div>
            <PlayButton />
          </div>
          <div>
            <Shope />
          </div>
          <AuthHeaderButtons />
          {/* <div>

            <Login/>
            <Profile/>
          </div> */}
          {/* <div>
       <Signup/>

       </div> */}
        </div>
      </nav>
      {/* navbar end */}
      {/* off canvas */}

      {/* off canvas end */}

      {/* Mobile Menu */}
      <nav
        className={`navbar mobile navbar-area navbar-area-1 navbar-border navbar-expand-lg ${scroll ? "sticky-active" : ""
          }`}
      >
        <div className="container nav-container px-lg-0">
          {/* Mobile Menu Toggle Button */}
          <div className="responsive-mobile-menu">
            <button
              className={`menu toggle-btn d-block d-lg-none ${isMobileMenuOpen ? "open" : ""
                }`}
              onClick={handleMobileMenuToggle}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation"
            >
              <span className="icon-left"></span>
              <span className="icon-right"></span>
            </button>
          </div>

          {/* Logo */}
          <div className="logo">
            {/* <Link href='/'>
              <img src='assets/img/logo.png' alt='Logo' />
            </Link> */}
            <Link href="/">
              <img src="assets/fonts/logo.png" alt="img" />
            </Link>
          </div>

          {/* Navbar Links */}
          <div
            className={`collapse navbar-collapse ${isMobileMenuOpen ? "sopen" : ""
              }`}
            id="xdyat_main_menu"
          >
            <ul className="navbar-nav menu-open ps-lg-5 pe-xl-4 text-end ">
              <li
              // className={`menu-item-has-children ${activeMenu === 0 ? "show" : ""
              //   }`}
              >
                <Link
                  href="#"
                >
                  <SpectateButton />
                </Link>
                <Link href="#">
                  <PlayButton />
                </Link>
              </li>

              <li>
                <Link
                  href="/about"
                  className={location === "/about" ? "active" : ""}
                >
                  <Shope />
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className={location === "/about" ? "active" : ""}
                >
                  <Login />
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className={location === "/about" ? "active" : ""}
                >
                  <Signup />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default HeaderOne;
