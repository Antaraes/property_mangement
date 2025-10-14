"use client";

import { FC, useState } from "react";
import { trpc } from "@/server/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import toast from "react-hot-toast";

interface CreateAreaModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateAreaModal: FC<CreateAreaModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    countryId: "",
  });

  // Fetch countries for dropdown
  const { data: countries, isLoading: countriesLoading } = trpc.country.list.useQuery({});

  const createMutation = trpc.area.create.useMutation({
    onSuccess: () => {
      toast.success("Area created successfully!");
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.countryId) {
      toast.error("Please fill in all required fields");
      return;
    }

    createMutation.mutate({
      name: formData.name,
      description: formData.description || undefined,
      countryId: formData.countryId,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Create New Area</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="name">
              Area Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Dubai Marina, Bangkok Downtown"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of the area..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="countryId">
              Country <span className="text-red-500">*</span>
            </Label>
            <select
              id="countryId"
              className="w-full p-2 border rounded-md mt-1"
              value={formData.countryId}
              onChange={(e) =>
                setFormData({ ...formData, countryId: e.target.value })
              }
              required
              disabled={countriesLoading}
            >
              <option value="">
                {countriesLoading ? "Loading countries..." : "Select a country"}
              </option>
              {countries?.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name} {country.code ? `(${country.code})` : ""}
                </option>
              ))}
            </select>
            {!countriesLoading && countries?.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                No countries available. Please create a country first.
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
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
              disabled={createMutation.isLoading || countries?.length === 0}
            >
              {createMutation.isLoading ? "Creating..." : "Create Area"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAreaModal;
