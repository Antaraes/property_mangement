"use client";

import { FC, useState } from "react";
import { trpc } from "@/server/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

interface CreateEmployeeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateEmployeeModal: FC<CreateEmployeeModalProps> = ({ onClose, onSuccess }) => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
  });

  // Get companies list (for SUPERADMIN)
  const { data: companies } = trpc.company.list.useQuery(undefined, {
    enabled: session?.user?.role === "SUPERADMIN",
  });

  // Get current user's company (for ADMIN)
  const { data: currentUserCompany } = trpc.company.get.useQuery(
    { id: undefined },
    {
      enabled: session?.user?.role === "ADMIN",
    }
  );

  const [selectedCompanyId, setSelectedCompanyId] = useState("");

  const createMutation = trpc.employee.create.useMutation({
    onSuccess: () => {
      toast.success("Employee created successfully!");
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    // Determine companyId
    let companyId = "";
    if (session?.user?.role === "SUPERADMIN") {
      if (!selectedCompanyId) {
        toast.error("Please select a company");
        return;
      }
      companyId = selectedCompanyId;
    } else if (session?.user?.role === "ADMIN") {
      if (!currentUserCompany?.id) {
        toast.error("No company associated with your account");
        return;
      }
      companyId = currentUserCompany.id;
    } else {
      toast.error("You don't have permission to create employees");
      return;
    }

    createMutation.mutate({
      ...formData,
      companyId,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Create New Employee</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Company selection for SUPERADMIN */}
          {session?.user?.role === "SUPERADMIN" && companies && (
            <div>
              <Label htmlFor="company">
                Company <span className="text-red-500">*</span>
              </Label>
              <select
                id="company"
                className="w-full p-2 border rounded-md mt-1"
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                required
              >
                <option value="">Select a company...</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Company info for ADMIN */}
          {session?.user?.role === "ADMIN" && currentUserCompany && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <Label className="text-sm text-gray-600">Company</Label>
              <p className="font-medium">{currentUserCompany.name}</p>
            </div>
          )}

          <div>
            <Label htmlFor="name">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                placeholder="John"
              />
            </div>

            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="employee@example.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <Label htmlFor="password">
              Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Min. 6 characters"
              required
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 6 characters required
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
              disabled={createMutation.isLoading}
            >
              {createMutation.isLoading ? "Creating..." : "Create Employee"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEmployeeModal;
