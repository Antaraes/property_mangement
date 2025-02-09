"use client";
import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/server/client";
import { useParams } from "next/navigation";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import PropertyCard from "../PropertyCard";

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: property, isLoading } = trpc.property.getById.useQuery({ id });
  const { data: properties } = trpc.property.getRelatedProperties.useQuery({ id });
  const imageRef = useRef(null);
  const detailsRef = useRef(null);

  useEffect(() => {
    if (property) {
      gsap.from(imageRef.current, {
        opacity: 0,
        x: -50,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(detailsRef.current, {
        opacity: 0,
        x: 50,
        duration: 1,
        ease: "power3.out",
        delay: 0.5,
      });
    }
  }, [property]);

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!property) {
    return <p className="text-center text-gray-500">Property not found</p>;
  }

  return (
    <div className="px-4">
      <div className="container mx-auto py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Property Images */}
          <div ref={imageRef}>
            <img
              src={property.images[0]}
              alt={property.name}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
            <div className="grid grid-cols-4 gap-2 mt-4">
              {property.images.slice(1, 5).map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt="Property image"
                  className="w-full h-24 object-cover rounded-lg shadow-md"
                />
              ))}
            </div>
          </div>

          {/* Property Details */}
          <div ref={detailsRef} className="bg-white p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-gray-800">{property.name}</h1>
            <p className="text-gray-600 mt-2">{property.location}</p>
            <p className="text-2xl font-semibold text-blue-600 mt-4">
              ${property.price.toLocaleString()}
            </p>
            <p className="mt-4 text-gray-700 leading-relaxed">{property.description}</p>
            <div className="mt-6 grid grid-cols-2 gap-4 text-gray-700">
              <p>
                <strong>Bedrooms:</strong> {property.bedrooms}
              </p>
              <p>
                <strong>Bathrooms:</strong> {property.bathrooms}
              </p>
              <p>
                <strong>Area:</strong> {property.area} sqft
              </p>
              <p>
                <strong>Purpose:</strong> {property.purpose}
              </p>
            </div>
            <a
              href="mailto:agent@example.com?subject=Inquiry about Property&body=Hello, I am interested in this property. Please provide more details."
              className={cn(
                buttonVariants(),
                "mt-8 w-full text-white font-semibold py-3 rounded-lg shadow-md"
              )}
            >
              Contact Agent
            </a>
          </div>
        </div>
      </div>
      <h1 className="text-xl font-bold">Related Properties</h1>
      <div className="grid grid-cols-4 gap-3 mt-3">
        {properties?.map((property, index) => (
          <PropertyCard property={property} key={index} />
        ))}
      </div>
    </div>
  );
}
