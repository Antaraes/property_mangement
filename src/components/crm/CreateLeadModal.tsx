"use client";

import { FC, useState, useEffect } from "react";
import { trpc } from "@/server/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Search } from "lucide-react";
import toast from "react-hot-toast";

interface CreateLeadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateLeadModal: FC<CreateLeadModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    customerId: "",
    propertyId: "",
    message: "",
    phone: "",
    preferredContactMethod: "",
  });

  const [customerSearch, setCustomerSearch] = useState("");
  const [propertySearch, setPropertySearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);

  // Fetch all properties
  const { data: properties } = trpc.property.list.useQuery({});

  // We'll need a customer list - for now using employee router as reference
  // You might need to add a customer list endpoint to your backend
  const [customers, setCustomers] = useState<any[]>([]);

  const createMutation = trpc.lead.create.useMutation({
    onSuccess: () => {
      toast.success("Lead created successfully!");
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerId || !formData.propertyId) {
      toast.error("Please select both customer and property");
      return;
    }

    createMutation.mutate(formData);
  };

  // Filter properties based on search
  const filteredProperties = properties?.filter((property: any) =>
    property.name.toLowerCase().includes(propertySearch.toLowerCase()) ||
    property.location.toLowerCase().includes(propertySearch.toLowerCase())
  ) || [];

  // Filter customers based on search
  const filteredCustomers = customers.filter((customer) =>
    customer.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.email?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const selectedProperty = properties?.find((p: any) => p.id === formData.propertyId);
  const selectedCustomer = customers.find((c) => c.id === formData.customerId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Create New Lead</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Customer Selection */}
          <div className="relative">
            <Label htmlFor="customer">
              Customer <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="customer"
                value={selectedCustomer?.name || customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setShowCustomerDropdown(true);
                  setFormData({ ...formData, customerId: "" });
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                placeholder="Search customer by name or email..."
                className="pr-8"
              />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            {showCustomerDropdown && filteredCustomers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredCustomers.slice(0, 5).map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, customerId: customer.id });
                      setCustomerSearch(customer.name || customer.email);
                      setShowCustomerDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b last:border-b-0"
                  >
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.email}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Property Selection */}
          <div className="relative">
            <Label htmlFor="property">
              Property <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="property"
                value={selectedProperty?.name || propertySearch}
                onChange={(e) => {
                  setPropertySearch(e.target.value);
                  setShowPropertyDropdown(true);
                  setFormData({ ...formData, propertyId: "" });
                }}
                onFocus={() => setShowPropertyDropdown(true)}
                placeholder="Search property by name or location..."
                className="pr-8"
              />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            {showPropertyDropdown && filteredProperties.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredProperties.slice(0, 5).map((property: any) => (
                  <button
                    key={property.id}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, propertyId: property.id });
                      setPropertySearch(property.name);
                      setShowPropertyDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b last:border-b-0"
                  >
                    <p className="font-medium">{property.name}</p>
                    <p className="text-sm text-gray-600">{property.location}</p>
                    <p className="text-sm font-semibold text-blue-600">
                      ${property.price.toLocaleString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 234 567 8900"
            />
          </div>

          {/* Preferred Contact Method */}
          <div>
            <Label htmlFor="contactMethod">Preferred Contact Method</Label>
            <select
              id="contactMethod"
              className="w-full p-2 border rounded-md"
              value={formData.preferredContactMethod}
              onChange={(e) =>
                setFormData({ ...formData, preferredContactMethod: e.target.value })
              }
            >
              <option value="">Select method...</option>
              <option value="Phone">Phone</option>
              <option value="Email">Email</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="SMS">SMS</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              className="w-full p-2 border rounded-md min-h-[100px]"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Enter customer's inquiry or notes..."
            />
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
              {createMutation.isLoading ? "Creating..." : "Create Lead"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLeadModal;
