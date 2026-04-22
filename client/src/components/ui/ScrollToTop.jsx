import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    // If we have an in-page hash, scroll to it after navigation paints.
    if (hash) {
      const id = hash.startsWith("#") ? hash : `#${hash}`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const el = document.querySelector(id);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          else window.scrollTo({ top: 0, behavior: "instant" });
        });
      });
      return;
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);
  return null;
}
