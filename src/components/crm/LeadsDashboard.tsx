"use client";

import { FC, useState } from "react";
import { trpc } from "@/server/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Filter } from "lucide-react";
import LeadCard from "./LeadCard";
import CreateLeadModal from "./CreateLeadModal";
import LeadDetailModal from "./LeadDetailModal";

type LeadStatus =
  | "PENDING"
  | "CONTACTED"
  | "SCHEDULED"
  | "NEGOTIATING"
  | "CLOSED_WON"
  | "CLOSED_LOST"
  | "CANCELLED";

interface LeadsDashboardProps {
  title?: string;
  description?: string;
  showCreateButton?: boolean;
  useMyLeads?: boolean;
}

const LeadsDashboard: FC<LeadsDashboardProps> = ({
  title = "All Leads",
  description = "Manage and track all customer leads",
  showCreateButton = true,
  useMyLeads = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "" as LeadStatus | "",
    assignedToId: "",
    propertyId: "",
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const utils = trpc.useUtils();

  // Fetch leads based on mode
  const { data: leads, isLoading } = useMyLeads
    ? trpc.lead.getMyLeads.useQuery()
    : trpc.lead.list.useQuery({
        status: filters.status || undefined,
        assignedToId: filters.assignedToId || undefined,
        propertyId: filters.propertyId || undefined,
      });

  // Fetch employees for filter dropdown
  const { data: employees } = trpc.employee.list.useQuery();

  const handleViewDetails = (leadId: string) => {
    setSelectedLeadId(leadId);
  };

  const handleCloseDetail = () => {
    setSelectedLeadId(null);
  };

  const handleSuccess = () => {
    utils.lead.list.invalidate();
    utils.lead.getMyLeads.invalidate();
  };

  // Filter leads based on search
  const filteredLeads = leads?.filter((lead: any) => {
    const matchesSearch =
      searchTerm === "" ||
      lead.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.property?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.property?.location?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Group leads by status for stats
  const leadStats = {
    total: leads?.length || 0,
    pending: leads?.filter((l: any) => l.status === "PENDING").length || 0,
    contacted: leads?.filter((l: any) => l.status === "CONTACTED").length || 0,
    scheduled: leads?.filter((l: any) => l.status === "SCHEDULED").length || 0,
    negotiating: leads?.filter((l: any) => l.status === "NEGOTIATING").length || 0,
    closedWon: leads?.filter((l: any) => l.status === "CLOSED_WON").length || 0,
    closedLost: leads?.filter((l: any) => l.status === "CLOSED_LOST").length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
        {showCreateButton && (
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Lead
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600">Total</p>
          <p className="text-2xl font-bold">{leadStats.total}</p>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <p className="text-xs text-yellow-700">Pending</p>
          <p className="text-2xl font-bold text-yellow-700">{leadStats.pending}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">Contacted</p>
          <p className="text-2xl font-bold text-blue-700">{leadStats.contacted}</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
          <p className="text-xs text-purple-700">Scheduled</p>
          <p className="text-2xl font-bold text-purple-700">{leadStats.scheduled}</p>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
          <p className="text-xs text-orange-700">Negotiating</p>
          <p className="text-2xl font-bold text-orange-700">{leadStats.negotiating}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <p className="text-xs text-green-700">Won</p>
          <p className="text-2xl font-bold text-green-700">{leadStats.closedWon}</p>
        </div>
        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
          <p className="text-xs text-red-700">Lost</p>
          <p className="text-2xl font-bold text-red-700">{leadStats.closedLost}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold">Search & Filter</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div>
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Input
                id="search"
                placeholder="Search customer or property..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1 pr-8"
              />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Status Filter */}
          {!useMyLeads && (
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="w-full p-2 border rounded-md mt-1"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value as LeadStatus | "" })
                }
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONTACTED">Contacted</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="NEGOTIATING">Negotiating</option>
                <option value="CLOSED_WON">Closed Won</option>
                <option value="CLOSED_LOST">Closed Lost</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          )}

          {/* Assigned To Filter */}
          {!useMyLeads && (
            <div>
              <Label htmlFor="assignedTo">Assigned To</Label>
              <select
                id="assignedTo"
                className="w-full p-2 border rounded-md mt-1"
                value={filters.assignedToId}
                onChange={(e) =>
                  setFilters({ ...filters, assignedToId: e.target.value })
                }
              >
                <option value="">All Employees</option>
                {employees?.map((employee: any) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name || employee.email}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Clear Filters */}
        {(searchTerm || filters.status || filters.assignedToId) && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setFilters({ status: "", assignedToId: "", propertyId: "" });
            }}
          >
            Clear All Filters
          </Button>
        )}
      </div>

      {/* Leads Grid */}
      {filteredLeads && filteredLeads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((lead: any) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onViewDetails={handleViewDetails}
              onAssign={(leadId) => {
                setSelectedLeadId(leadId);
              }}
              onUpdateStatus={(leadId) => {
                setSelectedLeadId(leadId);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No leads found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filters.status || filters.assignedToId
              ? "Try adjusting your search or filters"
              : "Get started by creating your first lead"}
          </p>
          {showCreateButton && !searchTerm && !filters.status && !filters.assignedToId && (
            <Button onClick={() => setShowCreateModal(true)}>
              Create Your First Lead
            </Button>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateLeadModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            handleSuccess();
          }}
        />
      )}

      {selectedLeadId && (
        <LeadDetailModal
          leadId={selectedLeadId}
          onClose={handleCloseDetail}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default LeadsDashboard;
