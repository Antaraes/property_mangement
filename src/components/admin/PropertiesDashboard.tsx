"use client";

import { FC, useState } from "react";
import { trpc } from "@/server/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import PropertyCard from "./PropertyCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Shield } from "lucide-react";
import BulkImportExport from "./BulkImportExport";
import { useRBAC } from "@/hooks/useRBAC";

interface PropertiesDashboardProps {}

const PropertiesDashboard: FC<PropertiesDashboardProps> = ({}) => {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { isAgent, canViewAllProperties } = useRBAC();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    purpose: "",
    propertyType: "",
    location: "",
  });

  // Fetch user's properties
  const { data: properties, isLoading } = trpc.property.getMyProperties.useQuery();

  // Delete mutation
  const deleteMutation = trpc.property.delete.useMutation({
    onSuccess: () => {
      utils.property.getMyProperties.invalidate();
      toast.success("Property deleted successfully!");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      deleteMutation.mutate({ id });
    }
  };

  // Filter properties based on search and filters
  const filteredProperties = properties?.filter((property) => {
    const matchesSearch =
      searchTerm === "" ||
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPurpose =
      filters.purpose === "" || property.purpose === filters.purpose;

    const matchesType =
      filters.propertyType === "" || property.propertyType === filters.propertyType;

    const matchesLocation =
      filters.location === "" ||
      property.location.toLowerCase().includes(filters.location.toLowerCase());

    return matchesSearch && matchesPurpose && matchesType && matchesLocation;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">
              {canViewAllProperties ? "All Properties" : "My Properties"}
            </h1>
            {isAgent && (
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Agent View
              </span>
            )}
          </div>
          <p className="text-gray-600 mt-1">
            {canViewAllProperties
              ? "Manage and view all property listings"
              : isAgent
              ? "View and manage your assigned properties"
              : "Manage and view your property listings"}
          </p>
        </div>
        <div className="flex gap-2">
          <BulkImportExport
            properties={properties}
            onImportSuccess={() => utils.property.getMyProperties.invalidate()}
          />
          <Link href="/dashboard/properties/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Property
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold">Search & Filter</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div>
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Purpose Filter */}
          <div>
            <Label htmlFor="purpose">Purpose</Label>
            <select
              id="purpose"
              className="w-full p-2 border rounded-md mt-1"
              value={filters.purpose}
              onChange={(e) => setFilters({ ...filters, purpose: e.target.value })}
            >
              <option value="">All</option>
              <option value="RENT">Rent</option>
              <option value="BUY">Buy</option>
            </select>
          </div>

          {/* Property Type Filter */}
          <div>
            <Label htmlFor="propertyType">Property Type</Label>
            <select
              id="propertyType"
              className="w-full p-2 border rounded-md mt-1"
              value={filters.propertyType}
              onChange={(e) =>
                setFilters({ ...filters, propertyType: e.target.value })
              }
            >
              <option value="">All</option>
              <option value="APARTMENT">Apartment</option>
              <option value="HOUSE">House</option>
              <option value="VILLA">Villa</option>
              <option value="COMMERCIAL">Commercial</option>
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Filter by location..."
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>

        {/* Clear Filters */}
        {(searchTerm || filters.purpose || filters.propertyType || filters.location) && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setFilters({ purpose: "", propertyType: "", location: "" });
            }}
          >
            Clear All Filters
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Properties</p>
          <p className="text-2xl font-bold">{properties?.length || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">For Rent</p>
          <p className="text-2xl font-bold">
            {properties?.filter((p) => p.purpose === "RENT").length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">For Sale</p>
          <p className="text-2xl font-bold">
            {properties?.filter((p) => p.purpose === "BUY").length || 0}
          </p>
        </div>
      </div>

      {/* Properties Grid */}
      {filteredProperties && filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No properties found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filters.purpose || filters.propertyType || filters.location
              ? "Try adjusting your search or filters"
              : "Get started by adding your first property"}
          </p>
          {!searchTerm && !filters.purpose && !filters.propertyType && !filters.location && (
            <Link href="/dashboard/properties/create">
              <Button>Add Your First Property</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertiesDashboard;
