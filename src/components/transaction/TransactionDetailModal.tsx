"use client";

import { FC, useState } from "react";
import { trpc } from "@/server/client";
import { Button } from "@/components/ui/button";
import { X, User, Home, DollarSign, Calendar, FileText } from "lucide-react";
import toast from "react-hot-toast";
import TransactionStatusBadge from "./TransactionStatusBadge";

interface TransactionDetailModalProps {
  transactionId: string;
  onClose: () => void;
  onUpdate: () => void;
}

const TransactionDetailModal: FC<TransactionDetailModalProps> = ({
  transactionId,
  onClose,
  onUpdate,
}) => {
  const [newStatus, setNewStatus] = useState<string>("");

  const { data: transaction, isLoading } = trpc.transaction.getById.useQuery({
    id: transactionId,
  });

  const updateStatusMutation = trpc.transaction.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated successfully!");
      onUpdate();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleUpdateStatus = () => {
    if (!newStatus) return;
    updateStatusMutation.mutate({
      id: transactionId,
      status: newStatus as any,
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transaction...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Transaction Details</h2>
            <p className="text-sm text-gray-500">ID: {transaction.id}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Amount & Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Amount</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(transaction.amount, transaction.currency)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-2">Status</p>
              <TransactionStatusBadge status={transaction.status} />
            </div>
          </div>

          {/* Transaction Type */}
          <div>
            <p className="text-sm text-gray-600 mb-1">Transaction Type</p>
            <span
              className={`inline-block px-3 py-1 rounded ${
                transaction.type === "RENT"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-purple-100 text-purple-700"
              }`}
            >
              {transaction.type}
            </span>
          </div>

          {/* Customer Info */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-5 w-5 text-gray-400" />
              <h3 className="font-semibold">Customer Information</h3>
            </div>
            <div className="pl-7 space-y-1">
              <p className="font-medium">{transaction.customer.name}</p>
              <p className="text-sm text-gray-600">{transaction.customer.email}</p>
            </div>
          </div>

          {/* Property Info */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Home className="h-5 w-5 text-gray-400" />
              <h3 className="font-semibold">Property Information</h3>
            </div>
            <div className="pl-7 space-y-1">
              <p className="font-medium">{transaction.property.name}</p>
              <p className="text-sm text-gray-600">{transaction.property.location}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <h3 className="font-semibold">Payment Information</h3>
            </div>
            <div className="pl-7 space-y-2">
              {transaction.paymentMethod && (
                <p className="text-sm">
                  <span className="text-gray-600">Method:</span> {transaction.paymentMethod}
                </p>
              )}
              {transaction.paymentDate && (
                <p className="text-sm">
                  <span className="text-gray-600">Payment Date:</span> {formatDate(transaction.paymentDate)}
                </p>
              )}
            </div>
          </div>

          {/* Contract Dates (for Rent) */}
          {transaction.type === "RENT" && (transaction.contractStartDate || transaction.contractEndDate) && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <h3 className="font-semibold">Contract Period</h3>
              </div>
              <div className="pl-7 space-y-2">
                <p className="text-sm">
                  <span className="text-gray-600">Start:</span> {formatDate(transaction.contractStartDate)}
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">End:</span> {formatDate(transaction.contractEndDate)}
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          {transaction.notes && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <h3 className="font-semibold">Notes</h3>
              </div>
              <p className="pl-7 text-sm text-gray-600">{transaction.notes}</p>
            </div>
          )}

          {/* Timeline */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Timeline</h3>
            <div className="pl-4 space-y-2 text-sm text-gray-600">
              <p>Created: {formatDate(transaction.createdAt)}</p>
              <p>Last Updated: {formatDate(transaction.updatedAt)}</p>
            </div>
          </div>

          {/* Update Status */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Update Status</h3>
            <div className="flex gap-2">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select new status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REFUNDED">Refunded</option>
              </select>
              <Button
                onClick={handleUpdateStatus}
                disabled={!newStatus || updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? "Updating..." : "Update"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailModal;
