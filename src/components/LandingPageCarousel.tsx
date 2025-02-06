"use client";

import { Carousel } from "./ui/carousel";

export function LandingPageCarousel() {
  const slideData = [
    {
      title: "Delalie",
      location: "Yogyakarta, Indonesia",
      button: "View Property",
      src: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Permata Indah Residence",
      location: "Sisman, Yogyakarta",
      button: "View Property",
      src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=3456&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Griya Asri Tamansari",
      location: "Taman Sari, Yogyakarta",
      button: "View Property",
      src: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Harmon Village",
      location: "Sisman, Yogyakarta",
      button: "View Property",
      src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=3453&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

  return (
    <div className="relative overflow-hidden w-full h-full py-20 ">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Explore Our Property Listings</h2>
        <p className="text-lg text-gray-600 text-center mb-12">
          From cozy apartments to spacious family homes, our diverse listings cater to various needs
          and preferences.
        </p>
        <Carousel slides={slideData} />
      </div>
    </div>
  );
}
