import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [currentChildren, setCurrentChildren] = useState(children);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    // Only trigger transition if path actually changed
    if (previousPathRef.current !== location.pathname) {
      previousPathRef.current = location.pathname;
      
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Quick fade out
      setIsVisible(false);
      
      // After fade out, update children and fade in
      timeoutRef.current = setTimeout(() => {
        setCurrentChildren(children);
        setIsVisible(true);
      }, 100);
    } else {
      // Same path, just update children without animation
      setCurrentChildren(children);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [location.pathname, children]);

  return (
    <div
      className="page-transition-container"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(4px)',
        transition: 'opacity 0.15s ease-out, transform 0.15s ease-out',
        width: '100%',
        minHeight: '100%',
      }}
    >
      {currentChildren}
    </div>
  );
};

export default PageTransition;
