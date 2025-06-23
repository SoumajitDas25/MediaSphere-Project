import React, { useEffect } from 'react'

const BgFreezer = ({
    children,
    className
}) => {

  useEffect(() => {
    // Disable scrolling on mount
    document.body.style.overflow = "hidden";

    return () => {
      // Enable scrolling on unmount
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className={`fixed inset-0 bg-light-font_color_light dark:bg-dark-btn1_color bg-opacity-60 dark:bg-opacity-60 z-[50] sm:px-4 transition-all duration-500 ${className}`}>
        {children}
    </div>
  )
}

export default BgFreezer