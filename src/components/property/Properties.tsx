"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import PropertyFilter from "./PropertyFilter";
import SortDropdown from "./SortDown";
import PropertyList from "./PropertyList";
import { trpc } from "@/server/client";

export default function Properties() {
  const contentRef = useRef(null);
  const [filters, setFilters] = useState({});
  const { data: properties, isLoading, error } = trpc.property.list.useQuery(filters);

  useEffect(() => {
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 100 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        onComplete: () => {
          gsap.fromTo(
            ".property-card",
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.7)" }
          );
        },
      }
    );
  }, []);

  return (
    <div className="p-8 bg-gray-100">
      <div ref={contentRef} className="max-w-9xl mx-auto">
        <PropertyFilter onFilter={setFilters} />

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="md:text-2xl text-lg font-bold">
            We found {properties?.length} properties
          </h2>
          <SortDropdown />
        </div>

        <PropertyList properties={properties!} isLoading={isLoading} error={error} />
      </div>
    </div>
  );
}
