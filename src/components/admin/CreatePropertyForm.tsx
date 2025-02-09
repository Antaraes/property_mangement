"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { trpc } from "@/server/client";
import { Textarea } from "../ui/textarea";

const propertySchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  price: z.number().positive("Price must be positive"),
  images: z.array(z.string().url("Invalid URL")).min(2, "At least one image is required"),
  description: z.string().min(1, "Decription must be required"),
  bedrooms: z.number().min(1, "Minimum 1 bedroom"),
  bathrooms: z.number().min(1, "Minimum 1 bathroom"),
  area: z.number().positive("Area must be positive"),
  purpose: z.enum(["RENT", "BUY"]),
  paidType: z.enum(["YEARLY", "MONTHLY", "WEEKLY", "DAILY"]),
  propertyType: z.enum(["APARTMENT", "HOUSE", "VILLA", "COMMERCIAL"]),
});

type FormValues = z.infer<typeof propertySchema>;

export function CreatePropertyForm() {
  const utils = trpc.useUtils();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    reset,
    watch,
    getValues,
  } = useForm<FormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      images: [""],
      purpose: "RENT",
      propertyType: "APARTMENT",
      paidType: "MONTHLY",
    },
  });

  const createPropertyMutation = trpc.property.create.useMutation({
    onSuccess: () => {
      utils.property.list.invalidate();
      reset();
      toast.success("Property created successfully!");
    },
    onError: (error) => {
      toast.error(`Error creating property: ${error.message}`);
    },
  });

  const images = watch("images");
  const onSubmit = (data: FormValues) => {
    console.log(data);
    createPropertyMutation.mutate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-full mx-auto space-y-8 p-6 bg-white rounded-lg border border-gray-200"
    >
      {/* Property Details Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold border-b pb-2">Property Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name">Property Name *</Label>
            <Input {...register("name")} id="name" className="mt-1" />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
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
        <h2 className="text-xl font-semibold border-b pb-2">Specifications</h2>
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
            {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area.message}</p>}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold border-b pb-2">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="price">Price *</Label>
            <Input
              {...register("price", { valueAsNumber: true })}
              type="number"
              id="price"
              className="mt-1"
            />

            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
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
              <p className="text-red-500 text-sm mt-1">{errors.propertyType.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Media Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold border-b pb-2">Media</h2>
        <div className="space-y-4">
          {images.map((_, index) => (
            <div key={index}>
              <Input
                {...register(`images.${index}`)}
                type="url"
                placeholder={`Image URL #${index + 1}`}
              />
              {errors.images?.[index] && (
                <p className="text-red-500 text-sm mt-1">{errors.images[index]?.message}</p>
              )}
            </div>
          ))}
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
          {errors.images?.root && (
            <p className="text-red-500 text-sm mt-1">{errors.images.root.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="price">Description *</Label>
          <Textarea
            value={watch("description") ?? ""}
            onChange={(e) => setValue("description", e.target.value)}
            id="description"
            className="mt-3"
          />

          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full " disabled={createPropertyMutation.isLoading}>
        {createPropertyMutation.isLoading ? "Creating..." : "Create Property"}
      </Button>
    </form>
  );
}
