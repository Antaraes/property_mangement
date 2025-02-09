"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";

const NotFound = () => {
  const circle1Ref = useRef(null);
  const circle2Ref = useRef(null);
  const circle3Ref = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    gsap.from([circle1Ref.current, circle2Ref.current, circle3Ref.current], {
      duration: 1.5,
      scale: 0,
      opacity: 0,
      stagger: 0.2,
      ease: "elastic.out(1, 0.3)",
    });

    gsap.from(textRef.current, {
      duration: 1,
      y: 50,
      opacity: 0,
      delay: 1,
      ease: "power3.out",
    });
  }, []);

  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <div className="relative w-64 h-64">
        <div
          ref={circle1Ref}
          className="absolute w-24 h-24 bg-blue-500 rounded-full top-0 left-0"
        ></div>
        <div
          ref={circle2Ref}
          className="absolute w-24 h-24 bg-green-500 rounded-full top-0 right-0"
        ></div>
        <div
          ref={circle3Ref}
          className="absolute w-24 h-24 bg-purple-500 rounded-full bottom-0 left-1/2 transform -translate-x-1/2"
        ></div>
      </div>
      <div ref={textRef} className="mt-8 text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <h2 className="text-2xl mt-4">Page Not Found</h2>
        <p className="mt-2">
          This site is maintainable. Please check back later or go to the{" "}
          <button onClick={() => router.back()} className="text-blue-400 hover:text-blue-300">
            back
          </button>
          .
        </p>
      </div>
    </div>
  );
};

export default NotFound;
