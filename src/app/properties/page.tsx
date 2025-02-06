// pages/properties.js (Results Page)
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";

export default function Properties() {
  const router = useRouter();
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  // Entrance animation
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
          // Animate property cards with stagger
          gsap.fromTo(
            ".property-card",
            { y: 50, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.1,
              ease: "back.out(1.7)",
            }
          );
        },
      }
    );
  }, []);

  const handleBack = () => {
    // Exit animation before navigating back
    gsap.to(contentRef.current, {
      opacity: 0,
      y: 100,
      duration: 0.6,
      ease: "power2.in",
      onComplete: () => router.push("/"),
    });
  };

  return (
    <div ref={containerRef} className="min-h-screen p-8 bg-gray-100">
      <div ref={contentRef} className="max-w-7xl mx-auto">
        {/* Filters Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Looking For</label>
              <select className="w-full p-3 border rounded-lg">
                <option>Residence</option>
                <option>Commercial</option>
                <option>Land</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select className="w-full p-3 border rounded-lg">
                <option>Any Type</option>
                <option>Villa</option>
                <option>Apartment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
              <select className="w-full p-3 border rounded-lg">
                <option>$1000 - $50,000</option>
                <option>$50,000 - $100,000</option>
                <option>$100,000+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select className="w-full p-3 border rounded-lg">
                <option>Indonesia</option>
                <option>Yogyakarta</option>
                <option>Bali</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">We found 242 properties</h2>
          <select className="p-2 border rounded-lg">
            <option>Sort By: Default</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>

        {/* Property Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Serenity Heights Villas",
              location: "Gunungkidu, Yogyakarta",
              price: "$250,000",
              rating: 4.25,
            },
            {
              name: "Emerald Bay Residences",
              location: "Bogor Tengah",
              price: "$250,000",
              rating: 4.25,
            },
            {
              name: "Palm Grove Estate",
              location: "Semanang Selatan",
              price: "$250,000",
              rating: 4.25,
            },
          ].map((property, index) => (
            <div
              key={index}
              className="property-card bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl"
            >
              <div className="h-48 bg-gray-200 animate-pulse"></div>
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{property.name}</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">{property.location}</span>
                  <div className="flex items-center">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1">{property.rating}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-600">{property.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mt-8 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
}
