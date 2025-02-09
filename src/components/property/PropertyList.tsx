import React from "react";
import PropertyCard from "@/components/PropertyCard";

export default function PropertyList({
  properties,
  isLoading,
  error,
}: {
  properties: any[];
  isLoading: boolean;
  error: any;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <PropertySkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) return <p>Error loading properties: {error.message}</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
      {properties.length > 0 ? (
        properties.map((property, index) => <PropertyCard property={property} key={index} />)
      ) : (
        <p>No properties available.</p>
      )}
    </div>
  );
}

function PropertySkeleton() {
  return (
    <div className="animate-pulse">
      {/* Skeleton Image */}
      <div className="relative h-[240px] sm:h-[300px] bg-gray-300 rounded-lg"></div>

      {/* Skeleton Details */}
      <div className="p-4">
        <div className="h-4 w-3/4 bg-gray-300 rounded mb-2"></div>
        <div className="h-3 w-1/2 bg-gray-300 rounded mb-4"></div>

        {/* Icons Skeleton */}
        <div className="flex justify-start items-center gap-5 text-sm mt-4">
          <div className="h-8 w-12 bg-gray-300 rounded-lg"></div>
          <div className="h-8 w-12 bg-gray-300 rounded-lg"></div>
          <div className="h-8 w-16 bg-gray-300 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}
