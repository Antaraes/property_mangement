"use client";

import { FC, useState } from "react";
import { trpc } from "@/server/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Search, Plus, TrendingUp } from "lucide-react";
import TransactionCard from "./TransactionCard";
import TransactionDetailModal from "./TransactionDetailModal";
import CreateTransactionModal from "./CreateTransactionModal";
import { useRBAC } from "@/hooks/useRBAC";

const TransactionsDashboard: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const { canViewDocuments } = useRBAC();

  const { data: transactions, isLoading } = trpc.transaction.list.useQuery({});
  const utils = trpc.useUtils();

  const filteredTransactions = transactions?.filter((transaction) => {
    const matchesSearch =
      searchTerm === "" ||
      transaction.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.property.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    totalRevenue: transactions?.reduce((sum, t) => sum + (t.status === "COMPLETED" ? t.amount : 0), 0) || 0,
    pending: transactions?.filter((t) => t.status === "PENDING").length || 0,
    completed: transactions?.filter((t) => t.status === "COMPLETED").length || 0,
    total: transactions?.length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transactions...</p>
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
            <DollarSign className="h-8 w-8" />
            Transaction Management
          </h1>
          <p className="text-gray-600 mt-1">Track sales and rental transactions</p>
        </div>
        {canViewDocuments && (
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Transaction
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold mt-1">
                ${stats.totalRevenue.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-100" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Total Transactions</p>
          <p className="text-3xl font-bold mt-1">{stats.total}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Pending</p>
          <p className="text-3xl font-bold mt-1 text-yellow-600">{stats.pending}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Completed</p>
          <p className="text-3xl font-bold mt-1 text-green-600">{stats.completed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold">Search & Filter</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Customer or property..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          <div>
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Types</option>
              <option value="RENT">Rent</option>
              <option value="PURCHASE">Purchase</option>
            </select>
          </div>
        </div>

        {(searchTerm || statusFilter !== "all" || typeFilter !== "all") && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setTypeFilter("all");
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Transactions Grid */}
      {filteredTransactions && filteredTransactions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onViewDetails={setSelectedTransactionId}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
          <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== "all" || typeFilter !== "all"
              ? "Try adjusting your filters"
              : "Start by creating your first transaction"}
          </p>
          {!searchTerm && statusFilter === "all" && typeFilter === "all" && canViewDocuments && (
            <Button onClick={() => setShowCreateModal(true)}>Create Your First Transaction</Button>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateTransactionModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            utils.transaction.list.invalidate();
          }}
        />
      )}

      {selectedTransactionId && (
        <TransactionDetailModal
          transactionId={selectedTransactionId}
          onClose={() => setSelectedTransactionId(null)}
          onUpdate={() => utils.transaction.list.invalidate()}
        />
      )}
    </div>
  );
};

export default TransactionsDashboard;
