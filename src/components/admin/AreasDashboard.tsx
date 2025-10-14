"use client";

import { FC, useState } from "react";
import { trpc } from "@/server/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, MapPin, Building2, Users } from "lucide-react";
import toast from "react-hot-toast";
import AreaCard from "./AreaCard";
import CreateAreaModal from "./CreateAreaModal";
import { useRBAC } from "@/hooks/useRBAC";

const AreasDashboard: FC = () => {
  const utils = trpc.useUtils();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { canManageEmployees } = useRBAC();

  // Fetch countries for filter dropdown
  const { data: countries } = trpc.country.list.useQuery({});

  // Fetch areas with optional country filter
  const { data: areas, isLoading } = trpc.area.list.useQuery(
    selectedCountry ? { countryId: selectedCountry } : undefined
  );

  // Delete mutation
  const deleteMutation = trpc.area.delete.useMutation({
    onSuccess: () => {
      utils.area.list.invalidate();
      toast.success("Area deleted successfully!");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this area? This will affect all properties and employee assignments."
      )
    ) {
      deleteMutation.mutate({ id });
    }
  };

  // Filter areas based on search
  const filteredAreas = areas?.filter((area) => {
    const matchesSearch =
      searchTerm === "" ||
      area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.country.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Calculate stats
  const totalProperties = areas?.reduce(
    (sum, area) => sum + (area.properties?.length || 0),
    0
  );
  const totalEmployees = areas?.reduce(
    (sum, area) => sum + (area.employeeAssignments?.length || 0),
    0
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading areas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MapPin className="h-8 w-8" />
            Area Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage geographical areas and their properties
          </p>
        </div>
        {canManageEmployees && (
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Area
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold">Search & Filter</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Input */}
          <div>
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search by area name, description, or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Country Filter */}
          <div>
            <Label htmlFor="country">Filter by Country</Label>
            <select
              id="country"
              className="w-full p-2 border rounded-md mt-1"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
            >
              <option value="">All Countries</option>
              {countries?.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name} {country.code ? `(${country.code})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchTerm || selectedCountry) && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setSelectedCountry("");
            }}
          >
            Clear All Filters
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Total Areas
          </p>
          <p className="text-2xl font-bold">{areas?.length || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Total Properties in Areas
          </p>
          <p className="text-2xl font-bold">{totalProperties || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Total Employees Assigned
          </p>
          <p className="text-2xl font-bold">{totalEmployees || 0}</p>
        </div>
      </div>

      {/* Areas Grid */}
      {filteredAreas && filteredAreas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAreas.map((area) => (
            <AreaCard key={area.id} area={area} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
          <div className="text-gray-400 mb-4">
            <MapPin className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No areas found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCountry
              ? "Try adjusting your search or filters"
              : "Get started by creating your first area"}
          </p>
          {!searchTerm && !selectedCountry && canManageEmployees && (
            <Button onClick={() => setShowCreateModal(true)}>
              Create Your First Area
            </Button>
          )}
        </div>
      )}

      {/* Create Area Modal */}
      {showCreateModal && (
        <CreateAreaModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            utils.area.list.invalidate();
          }}
        />
      )}
    </div>
  );
};

export default AreasDashboard;
