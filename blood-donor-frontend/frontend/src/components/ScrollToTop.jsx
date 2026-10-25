import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Separate .html files always opened scrolled to the top; a single-page app
// needs to do that explicitly when the route changes.
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
