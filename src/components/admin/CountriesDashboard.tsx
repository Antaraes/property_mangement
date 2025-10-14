"use client";

import { FC, useState } from "react";
import { trpc } from "@/server/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Globe, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import CountryCard from "./CountryCard";
import CreateCountryModal from "./CreateCountryModal";
import { useRBAC } from "@/hooks/useRBAC";

const CountriesDashboard: FC = () => {
  const utils = trpc.useUtils();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { canManageEmployees } = useRBAC();

  // Fetch countries
  const { data: countries, isLoading } = trpc.country.list.useQuery({});

  // Delete mutation
  const deleteMutation = trpc.country.delete.useMutation({
    onSuccess: () => {
      utils.country.list.invalidate();
      toast.success("Country deleted successfully!");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this country? This will also delete all areas and affect properties."
      )
    ) {
      deleteMutation.mutate({ id });
    }
  };

  // Filter countries based on search
  const filteredCountries = countries?.filter((country) => {
    const matchesSearch =
      searchTerm === "" ||
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Calculate total areas
  const totalAreas = countries?.reduce(
    (sum, country) => sum + (country._count?.areas || 0),
    0
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading countries...</p>
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
            <Globe className="h-8 w-8" />
            Country Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage countries and their geographical areas
          </p>
        </div>
        {canManageEmployees && (
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Country
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold">Search Countries</h2>
        </div>

        <div>
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search by country name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-1"
          />
        </div>

        {searchTerm && (
          <Button variant="outline" onClick={() => setSearchTerm("")}>
            Clear Search
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Total Countries
          </p>
          <p className="text-2xl font-bold">{countries?.length || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Total Areas
          </p>
          <p className="text-2xl font-bold">{totalAreas || 0}</p>
        </div>
      </div>

      {/* Countries Grid */}
      {filteredCountries && filteredCountries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCountries.map((country) => (
            <CountryCard
              key={country.id}
              country={country}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
          <div className="text-gray-400 mb-4">
            <Globe className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No countries found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? "Try adjusting your search"
              : "Get started by creating your first country"}
          </p>
          {!searchTerm && canManageEmployees && (
            <Button onClick={() => setShowCreateModal(true)}>
              Create Your First Country
            </Button>
          )}
        </div>
      )}

      {/* Create Country Modal */}
      {showCreateModal && (
        <CreateCountryModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            utils.country.list.invalidate();
          }}
        />
      )}
    </div>
  );
};

export default CountriesDashboard;
