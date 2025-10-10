import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component that automatically scrolls the window to the top
 * whenever the route changes. This improves UX by ensuring users always
 * start at the top of a new page.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top smoothly when route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // Use "instant" for immediate scroll, "smooth" for animated
    });
  }, [pathname]);

  // This component doesn't render anything
  return null;
};

export default ScrollToTop;

