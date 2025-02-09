"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LandingPageCarousel } from "@/components/LandingPageCarousel";
import { trpc } from "@/server/client";
import PropertyFilterUI from "@/components/property/PropertyFilterUI";

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const contentRef = useRef(null);
  const searchRef = useRef(null);
  const containerRef = useRef(null);

  const [filters, setFilters] = useState({});
  const [searchTriggered, setSearchTriggered] = useState(false);
  const {
    data: properties,
    isLoading,
    error,
    status,
  } = trpc.property.list.useQuery(filters, {
    enabled: searchTriggered, // 🔥 Prevents fetching on mount
  });

  gsap.registerPlugin(ScrollTrigger);

  useEffect(() => {
    if (searchTriggered && status === "success" && properties.length > 0 && !isLoading) {
      gsap.to(".search-button", {
        scale: 0.9,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
      });

      gsap.to([contentRef.current, searchRef.current], {
        opacity: 0,
        y: -50,
        duration: 0.6,
        ease: "power2.in",
        stagger: 0.1,
        onComplete: () => router.push("/properties"),
      });
    }
  }, [searchTriggered, status]);

  const animateEntrance = () => {
    gsap.killTweensOf([contentRef.current, searchRef.current]);
    gsap.set([contentRef.current, searchRef.current], {
      opacity: 0,
      y: 50,
    });

    gsap.to([contentRef.current, searchRef.current], {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "power3.out",
    });
  };

  useEffect(() => {
    if (pathname === "/") {
      animateEntrance();
    }
  }, [pathname]);

  useEffect(() => {
    // Scale down and fade out text as it moves behind the image
    gsap.to(contentRef.current, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom center",
        scrub: true,
      },
      scale: 0.5, // Shrink the text
      y: -100, // Move up slightly

      ease: "none",
    });

    // Reset text when scrolling up
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom center",
      onUpdate: (self) => {
        if (self.direction === -1) {
          gsap.to(contentRef.current, {
            scale: 1,
            y: 0,

            duration: 0.5,
            ease: "power2.out",
          });
        }
      },
    });
  }, []);

  return (
    <>
      <div ref={contentRef} className="relative z-10 max-w-[95%] mx-auto  pt-5 ">
        <div className=" mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Guiding your path to <br /> a new home in
            <span className="text-4xl md:text-7xl ms-3">UAE</span>
          </h1>
          <p className="text-lg md:text-xl mt-8 mb-12">
            With expert guidance and a deep understanding of the real estate landscape, we make your
            journey to a new home seamless and stress-free.
          </p>
        </div>
      </div>

      <div ref={containerRef} className="min-h-[300px] relative max-w-[95%] mx-auto">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=1892&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Background"
            fill
            className="object-cover rounded-3xl"
          />
        </div>

        {/* Search Filters */}
        <div ref={searchRef} className="absolute bottom-28 w-full px-4">
          <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-xl p-6">
            <PropertyFilterUI
              onFilter={(newFilters) => {
                setFilters(newFilters);
                setSearchTriggered(true); // ✅ Trigger search only when the button is clicked
              }}
            />
          </div>
        </div>

        {/* Copyright Text */}
        <div className="absolute bottom-4 w-full text-center text-gray-400 text-sm">
          @2024 ARUNA RESIDENCE. ALL RIGHTS RESERVED.
        </div>
      </div>
      <LandingPageCarousel />
    </>
  );
}
