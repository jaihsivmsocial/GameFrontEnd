"use client";
import React, { useEffect, useRef } from "react";

const CustomCursor = () => {
  // Using refs to store mutable values
  const cursorRef = useRef(null);
  const followerRef = useRef(null);
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const posX = useRef(0);
  const posY = useRef(0);

  useEffect(() => {
    // Function to animate the cursor and follower
    const animateCursor = () => {
      // Smoothly update the position using refs
      posX.current += (mouseX.current - posX.current) / 9;
      posY.current += (mouseY.current - posY.current) / 9;

      if (followerRef.current) {
        followerRef.current.style.left = `${posX.current - 12}px`;
        followerRef.current.style.top = `${posY.current - 12}px`;
      }

      if (cursorRef.current) {
        cursorRef.current.style.left = `${mouseX.current}px`;
        cursorRef.current.style.top = `${mouseY.current}px`;
      }

      requestAnimationFrame(animateCursor);
    };

    // Start the animation
    animateCursor();

    // Track mouse movement
    const handleMouseMove = (e) => {
      mouseX.current = e.clientX;
      mouseY.current = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []); // Empty dependency array means this effect runs only once when the component mounts

  return (
    <>
      <div className='cursor' ref={cursorRef}></div>
      <div className='cursor-follower' ref={followerRef}></div>
    </>
  );
};

export default CustomCursor;
