import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false; // Default for SSR or before client-side check
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    // Ensure the state is correct after initial mount, in case `window.innerWidth` changed
    // between the `useState` initializer and `useEffect` running.
    onChange(); 

    window.addEventListener("resize", onChange);
    return () => window.removeEventListener("resize", onChange);
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  return isMobile;
}
