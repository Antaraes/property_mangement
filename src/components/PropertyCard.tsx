"use client";
import { FC } from "react";
import { Heart } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface PropertyCardProps {
  property: {
    id: string;
    name: string;
    location: string;
    price: number;
    images: string[];
    bedrooms: number;
    bathrooms: number;
    area: number;
  };
}

const PropertyCard: FC<PropertyCardProps> = ({ property }) => {
  const router = useRouter();
  return (
    <div className="group">
      {/* Property Image */}
      <div className="relative h-[240px] sm:h-[300px]">
        <Image
          src={property.images[0]}
          alt={property.name}
          fill
          className="absolute inset-0 h-full w-full object-cover rounded-lg"
        />

        {/* Render second image only if there are at least two images */}
        {property.images.length > 1 && (
          <Image
            src={property.images[1]}
            alt={property.name}
            fill
            className="absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-100 rounded-lg"
          />
        )}

        <button className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md">
          <Heart className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Property Details */}
      <div className="p-4">
        <div className="md:flex justify-between">
          <div>
            <h3
              onClick={() => router.push(`/properties/${property.id}`)}
              className="text-lg font-semibold group-hover:underline cursor-pointer"
            >
              {property.name}
            </h3>
            <span className="text-gray-500 text-sm">{property.location}</span>
          </div>

          {/* Price */}
          <div className="text-xl font-bold text-black mt-2">{formatPrice(property.price)}</div>
        </div>

        {/* Icons for Bedrooms, Bathrooms, and Area */}
        <div className=" hidden md:flex justify-start items-center text-gray-600 md:gap-5 text-sm mt-4">
          <div className="flex items-center gap-1 border border-black/60 p-2 rounded-lg">
            🛏 {property.bedrooms}
          </div>
          <div className="flex items-center gap-1 border border-black/60 p-2 rounded-lg">
            🛁 {property.bathrooms}
          </div>
          <div className="flex items-center gap-1 border border-black/60 p-2 rounded-lg">
            📏 {property.area} m²
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
