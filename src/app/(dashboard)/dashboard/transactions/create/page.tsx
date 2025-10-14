"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/server/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, DollarSign } from "lucide-react";
import toast from "react-hot-toast";

export default function CreateTransactionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    customerId: "",
    propertyId: "",
    type: "RENT" as "RENT" | "PURCHASE",
    amount: "",
    currency: "USD",
    paymentMethod: "",
    contractStartDate: "",
    contractEndDate: "",
  });

  const createMutation = trpc.transaction.create.useMutation({
    onSuccess: () => {
      toast.success("Transaction created successfully!");
      router.push("/dashboard/transactions");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const { data: customers } = trpc.employee.list.useQuery();
  const { data: properties } = trpc.property.list.useQuery({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerId || !formData.propertyId || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    createMutation.mutate({
      customerId: formData.customerId,
      propertyId: formData.propertyId,
      type: formData.type,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      paymentMethod: formData.paymentMethod || undefined,
      contractStartDate: formData.contractStartDate ? new Date(formData.contractStartDate) : undefined,
      contractEndDate: formData.contractEndDate ? new Date(formData.contractEndDate) : undefined,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-8 w-8" />
            Create Transaction
          </h1>
          <p className="text-gray-600 mt-1">Create a new sales or rental transaction</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Transaction Details</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="customerId">Customer *</Label>
              <select
                id="customerId"
                required
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Customer</option>
                {customers?.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="propertyId">Property *</Label>
              <select
                id="propertyId"
                required
                value={formData.propertyId}
                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Property</option>
                {properties?.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name} - {property.location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="type">Transaction Type *</Label>
              <select
                id="type"
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as "RENT" | "PURCHASE" })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="RENT">Rent</option>
                <option value="PURCHASE">Purchase</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  required
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="currency">Currency *</Label>
                <select
                  id="currency"
                  required
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="AED">AED</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Input
                id="paymentMethod"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                placeholder="e.g., Bank Transfer, Credit Card"
                className="mt-1"
              />
            </div>

            {formData.type === "RENT" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contractStartDate">Contract Start Date</Label>
                  <Input
                    id="contractStartDate"
                    type="date"
                    value={formData.contractStartDate}
                    onChange={(e) => setFormData({ ...formData, contractStartDate: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="contractEndDate">Contract End Date</Label>
                  <Input
                    id="contractEndDate"
                    type="date"
                    value={formData.contractEndDate}
                    onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t">
              <Button type="submit" disabled={createMutation.isPending} className="flex-1">
                {createMutation.isPending ? "Creating..." : "Create Transaction"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
