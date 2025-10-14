"use client";

import { FC, useState } from "react";
import { trpc } from "@/server/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import toast from "react-hot-toast";

interface EditCountryModalProps {
  country: {
    id: string;
    name: string;
    code: string | null;
  };
  onClose: () => void;
}

const EditCountryModal: FC<EditCountryModalProps> = ({ country, onClose }) => {
  const utils = trpc.useUtils();
  const [formData, setFormData] = useState({
    name: country.name,
    code: country.code || "",
  });

  const updateMutation = trpc.country.update.useMutation({
    onSuccess: () => {
      toast.success("Country updated successfully!");
      utils.country.list.invalidate();
      onClose();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Country name is required");
      return;
    }

    updateMutation.mutate({
      id: country.id,
      name: formData.name,
      code: formData.code || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Edit Country</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="name">
              Country Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., United Arab Emirates"
              required
            />
          </div>

          <div>
            <Label htmlFor="code">ISO Country Code</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
              placeholder="e.g., AE, US, TH"
              maxLength={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional 2-3 letter ISO country code
            </p>
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
              disabled={updateMutation.isLoading}
            >
              {updateMutation.isLoading ? "Updating..." : "Update Country"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCountryModal;
