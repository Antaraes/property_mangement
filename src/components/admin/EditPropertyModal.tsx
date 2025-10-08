"use client";

import { FC, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { trpc } from "@/server/client";
import { X } from "lucide-react";

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
}

interface EditPropertyModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

const propertySchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  price: z.number().positive("Price must be positive"),
  images: z.array(z.string().url("Invalid URL")).min(1, "At least one image is required"),
  description: z.string().min(1, "Description is required"),
  bedrooms: z.number().min(1, "Minimum 1 bedroom"),
  bathrooms: z.number().min(1, "Minimum 1 bathroom"),
  area: z.number().positive("Area must be positive"),
  purpose: z.enum(["RENT", "BUY"]),
  paidType: z.enum(["YEARLY", "MONTHLY", "WEEKLY", "DAILY"]),
  propertyType: z.enum(["APARTMENT", "HOUSE", "VILLA", "COMMERCIAL"]),
});

type FormValues = z.infer<typeof propertySchema>;

const EditPropertyModal: FC<EditPropertyModalProps> = ({
  property,
  isOpen,
  onClose,
}) => {
  const utils = trpc.useUtils();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    getValues,
  } = useForm<FormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: property.name,
      location: property.location,
      price: property.price,
      description: property.description,
      images: property.images,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      purpose: property.purpose,
      paidType: property.paidType,
      propertyType: property.propertyType,
    },
  });

  // Reset form when property changes
  useEffect(() => {
    reset({
      name: property.name,
      location: property.location,
      price: property.price,
      description: property.description,
      images: property.images,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      purpose: property.purpose,
      paidType: property.paidType,
      propertyType: property.propertyType,
    });
  }, [property, reset]);

  const updatePropertyMutation = trpc.property.update.useMutation({
    onSuccess: () => {
      utils.property.getMyProperties.invalidate();
      toast.success("Property updated successfully!");
      onClose();
    },
    onError: (error) => {
      toast.error(`Error updating property: ${error.message}`);
    },
  });

  const images = watch("images");

  const onSubmit = (data: FormValues) => {
    updatePropertyMutation.mutate({
      id: property.id,
      ...data,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Edit Property</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
          {/* Property Details Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold border-b pb-2">Property Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Property Name *</Label>
                <Input {...register("name")} id="name" className="mt-1" />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input {...register("location")} id="location" className="mt-1" />
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Specifications Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold border-b pb-2">Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="bedrooms">Bedrooms *</Label>
                <Input
                  {...register("bedrooms", { valueAsNumber: true })}
                  type="number"
                  id="bedrooms"
                  className="mt-1"
                />
                {errors.bedrooms && (
                  <p className="text-red-500 text-sm mt-1">{errors.bedrooms.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="bathrooms">Bathrooms *</Label>
                <Input
                  {...register("bathrooms", { valueAsNumber: true })}
                  type="number"
                  id="bathrooms"
                  className="mt-1"
                />
                {errors.bathrooms && (
                  <p className="text-red-500 text-sm mt-1">{errors.bathrooms.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="area">Area (sq ft) *</Label>
                <Input
                  {...register("area", { valueAsNumber: true })}
                  type="number"
                  id="area"
                  className="mt-1"
                />
                {errors.area && (
                  <p className="text-red-500 text-sm mt-1">{errors.area.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold border-b pb-2">Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  {...register("price", { valueAsNumber: true })}
                  type="number"
                  id="price"
                  className="mt-1"
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="purpose">Purpose *</Label>
                <select
                  {...register("purpose")}
                  className="w-full p-2 border rounded-md mt-1"
                  id="purpose"
                >
                  <option value="RENT">Rent</option>
                  <option value="BUY">Buy</option>
                </select>
                {errors.purpose && (
                  <p className="text-red-500 text-sm mt-1">{errors.purpose.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="paidType">Payment Frequency *</Label>
                <select
                  {...register("paidType")}
                  className="w-full p-2 border rounded-md mt-1"
                  id="paidType"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
                {errors.paidType && (
                  <p className="text-red-500 text-sm mt-1">{errors.paidType.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="propertyType">Property Type *</Label>
                <select
                  {...register("propertyType")}
                  className="w-full p-2 border rounded-md mt-1"
                  id="propertyType"
                >
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOUSE">House</option>
                  <option value="VILLA">Villa</option>
                  <option value="COMMERCIAL">Commercial</option>
                </select>
                {errors.propertyType && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.propertyType.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Media Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold border-b pb-2">Media</h3>
            <div className="space-y-4">
              {images.map((_, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    {...register(`images.${index}`)}
                    type="url"
                    placeholder={`Image URL #${index + 1}`}
                    className="flex-1"
                  />
                  {images.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const currentImages = getValues("images");
                        setValue(
                          "images",
                          currentImages.filter((_, i) => i !== index)
                        );
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              {errors.images?.[0] && (
                <p className="text-red-500 text-sm">{errors.images[0]?.message}</p>
              )}
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => {
                  const currentImages = getValues("images");
                  setValue("images", [...currentImages, ""]);
                }}
              >
                Add Image URL
              </Button>
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                {...register("description")}
                id="description"
                className="mt-3"
                rows={4}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={updatePropertyMutation.isLoading}
            >
              {updatePropertyMutation.isLoading ? "Updating..." : "Update Property"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPropertyModal;
