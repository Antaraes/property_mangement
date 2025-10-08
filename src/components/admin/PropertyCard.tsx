"use client";

import { FC, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MapPin, Bed, Bath, Maximize } from "lucide-react";
import EditPropertyModal from "./EditPropertyModal";

interface Property {
  id: string;
  name: string;
  location: string;
  price: number;
  description: string;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  area: number;
  purpose: "RENT" | "BUY";
  paidType: "YEARLY" | "MONTHLY" | "WEEKLY" | "DAILY";
  propertyType: "APARTMENT" | "HOUSE" | "VILLA" | "COMMERCIAL";
  ownerId: string;
  ownerType: "AGENT" | "CUSTOMER" | "ADMIN";
  createdAt: Date;
  updatedAt: Date;
}

interface PropertyCardProps {
  property: Property;
  onDelete: (id: string) => void;
}

const PropertyCard: FC<PropertyCardProps> = ({ property, onDelete }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const formatPrice = (price: number, paidType: string) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);

    const typeMap: { [key: string]: string } = {
      DAILY: "/day",
      WEEKLY: "/week",
      MONTHLY: "/month",
      YEARLY: "/year",
    };

    return `${formatted}${typeMap[paidType] || ""}`;
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
        {/* Image */}
        <div className="relative h-48 bg-gray-200">
          {property.images && property.images.length > 0 ? (
            <Image
              src={property.images[0]}
              alt={property.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No Image
            </div>
          )}
          {/* Purpose Badge */}
          <div className="absolute top-2 right-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                property.purpose === "RENT"
                  ? "bg-blue-500 text-white"
                  : "bg-green-500 text-white"
              }`}
            >
              For {property.purpose === "RENT" ? "Rent" : "Sale"}
            </span>
          </div>
          {/* Property Type Badge */}
          <div className="absolute top-2 left-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white text-gray-700">
              {property.propertyType}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title and Price */}
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">
              {property.name}
            </h3>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {formatPrice(property.price, property.paidType)}
            </p>
          </div>

          {/* Location */}
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">{property.location}</span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2">
            {property.description}
          </p>

          {/* Features */}
          <div className="flex items-center gap-4 text-sm text-gray-600 pt-2 border-t">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{property.bathrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Maximize className="h-4 w-4" />
              <span>{property.area} sq ft</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              className="flex-1 flex items-center justify-center gap-2"
              onClick={() => onDelete(property.id)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditPropertyModal
        property={property}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
};

export default PropertyCard;
