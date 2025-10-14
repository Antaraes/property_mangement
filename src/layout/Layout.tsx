// components/Layout.js
"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useRef } from "react";
import gsap from "gsap";

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const containerRef = useRef(null);

  return (
    <div ref={containerRef} className="page-container">
      {children}
    </div>
  );
}
