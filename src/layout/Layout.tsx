// components/Layout.js
"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useRef } from "react";
import gsap from "gsap";

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const containerRef = useRef(null);

  useEffect(() => {
    // Global page load animation
    gsap.from(containerRef.current, {
      opacity: 0,
      y: 50,
      duration: 0.6,
      ease: "power3.out",
    });
  }, [pathname]);

  return (
    <div ref={containerRef} className="page-container">
      {children}
    </div>
  );
}
