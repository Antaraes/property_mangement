"use client";

import { FC, useState, useEffect } from "react";
import { trpc } from "@/server/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

interface CreateCountryModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateCountryModal: FC<CreateCountryModalProps> = ({ onClose, onSuccess }) => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    companyId: "",
  });

  // Fetch companies for dropdown (for SUPERADMIN only)
  const { data: companies, isLoading: companiesLoading } = trpc.company.list.useQuery();

  // Set default companyId from session when available
  useEffect(() => {
    if (session?.user?.companyId && !formData.companyId) {
      setFormData((prev) => ({
        ...prev,
        companyId: session.user.companyId,
      }));
    }
  }, [session, formData.companyId]);

  const createMutation = trpc.country.create.useMutation({
    onSuccess: () => {
      toast.success("Country created successfully!");
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.companyId) {
      toast.error("Please fill in all required fields");
      return;
    }

    createMutation.mutate({
      name: formData.name,
      code: formData.code || undefined,
      companyId: formData.companyId,
    });
  };

  const isSuperAdmin = session?.user?.role === "SUPERADMIN";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Create New Country</h2>
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

          {isSuperAdmin && (
            <div>
              <Label htmlFor="companyId">
                Company <span className="text-red-500">*</span>
              </Label>
              <select
                id="companyId"
                className="w-full p-2 border rounded-md mt-1"
                value={formData.companyId}
                onChange={(e) =>
                  setFormData({ ...formData, companyId: e.target.value })
                }
                required
                disabled={companiesLoading}
              >
                <option value="">
                  {companiesLoading ? "Loading companies..." : "Select a company"}
                </option>
                {companies?.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!isSuperAdmin && session?.user?.companyId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Company:</span>{" "}
                {companies?.find((c) => c.id === session.user.companyId)?.name ||
                  "Your Company"}
              </p>
            </div>
          )}

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
              disabled={createMutation.isLoading || !formData.companyId}
            >
              {createMutation.isLoading ? "Creating..." : "Create Country"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCountryModal;
