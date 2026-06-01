import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Route Scroll Restoration helper.
 * Listens to React Router navigation changes and automatically resets scroll positions.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' // Reset immediately to prevent visual stuttering
      });
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
