"use client";

import { FC, useState, useEffect } from "react";
import { trpc } from "@/server/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, User, Phone, Mail, MapPin, Calendar, Clock, Edit, Save } from "lucide-react";
import toast from "react-hot-toast";
import LeadStatusBadge from "./LeadStatusBadge";

type LeadStatus =
  | "PENDING"
  | "CONTACTED"
  | "SCHEDULED"
  | "NEGOTIATING"
  | "CLOSED_WON"
  | "CLOSED_LOST"
  | "CANCELLED";

interface LeadDetailModalProps {
  leadId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const LeadDetailModal: FC<LeadDetailModalProps> = ({
  leadId,
  onClose,
  onSuccess,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    notes: "",
    followUpDate: "",
  });
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | "">("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const utils = trpc.useUtils();

  // Fetch lead details
  const { data: lead, isLoading } = trpc.lead.getById.useQuery({ id: leadId });

  // Fetch employees for assignment
  const { data: employees } = trpc.employee.list.useQuery();

  // Update mutation
  const updateMutation = trpc.lead.update.useMutation({
    onSuccess: () => {
      toast.success("Lead updated successfully!");
      setIsEditing(false);
      utils.lead.getById.invalidate({ id: leadId });
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Update status mutation
  const updateStatusMutation = trpc.lead.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated successfully!");
      utils.lead.getById.invalidate({ id: leadId });
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Assign mutation
  const assignMutation = trpc.lead.assign.useMutation({
    onSuccess: () => {
      toast.success("Lead assigned successfully!");
      utils.lead.getById.invalidate({ id: leadId });
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  useEffect(() => {
    if (lead) {
      setEditData({
        notes: lead.notes || "",
        followUpDate: lead.followUpDate
          ? new Date(lead.followUpDate).toISOString().split("T")[0]
          : "",
      });
      setSelectedStatus(lead.status);
      setSelectedEmployeeId(lead.assignedTo?.id || "");
    }
  }, [lead]);

  const handleUpdate = () => {
    const updatePayload: any = {
      id: leadId,
    };

    if (editData.notes !== (lead?.notes || "")) {
      updatePayload.notes = editData.notes;
    }

    if (editData.followUpDate) {
      updatePayload.followUpDate = new Date(editData.followUpDate);
    }

    updateMutation.mutate(updatePayload);
  };

  const handleStatusUpdate = () => {
    if (selectedStatus && selectedStatus !== lead?.status) {
      updateStatusMutation.mutate({
        leadId,
        status: selectedStatus as LeadStatus,
      });
    }
  };

  const handleAssign = () => {
    if (selectedEmployeeId && selectedEmployeeId !== lead?.assignedTo?.id) {
      assignMutation.mutate({
        leadId,
        employeeId: selectedEmployeeId,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">Lead Details</h2>
            <LeadStatusBadge status={lead.status} />
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{lead.customer.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  {lead.customer.email}
                </p>
              </div>
              {(lead.phone || lead.customer.phone) && (
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    {lead.phone || lead.customer.phone}
                  </p>
                </div>
              )}
              {lead.preferredContactMethod && (
                <div>
                  <p className="text-sm text-gray-600">Preferred Contact</p>
                  <p className="font-medium">{lead.preferredContactMethod}</p>
                </div>
              )}
            </div>
          </div>

          {/* Property Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Property Information
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Property Name</p>
                <p className="font-medium text-lg">{lead.property.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">{lead.property.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <p className="font-semibold text-blue-600 text-lg">
                  ${lead.property.price.toLocaleString()}
                </p>
              </div>
              {lead.property.status && (
                <div>
                  <p className="text-sm text-gray-600">Property Status</p>
                  <p className="font-medium">{lead.property.status}</p>
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          {lead.message && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-semibold mb-2">Customer Message</h3>
              <p className="text-gray-700">{lead.message}</p>
            </div>
          )}

          {/* Status Management */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-lg mb-3">Status Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Update Status</Label>
                <select
                  id="status"
                  className="w-full p-2 border rounded-md"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as LeadStatus)}
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="NEGOTIATING">Negotiating</option>
                  <option value="CLOSED_WON">Closed Won</option>
                  <option value="CLOSED_LOST">Closed Lost</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                {selectedStatus !== lead.status && (
                  <Button
                    onClick={handleStatusUpdate}
                    className="mt-2 w-full"
                    disabled={updateStatusMutation.isLoading}
                  >
                    {updateStatusMutation.isLoading ? "Updating..." : "Update Status"}
                  </Button>
                )}
              </div>

              <div>
                <Label htmlFor="assignTo">Assign To Employee</Label>
                <select
                  id="assignTo"
                  className="w-full p-2 border rounded-md"
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                >
                  <option value="">Select employee...</option>
                  {employees?.map((employee: any) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name || employee.email}
                    </option>
                  ))}
                </select>
                {selectedEmployeeId !== (lead.assignedTo?.id || "") && selectedEmployeeId && (
                  <Button
                    onClick={handleAssign}
                    className="mt-2 w-full"
                    disabled={assignMutation.isLoading}
                  >
                    {assignMutation.isLoading ? "Assigning..." : "Assign Lead"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Notes and Follow-up */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">Notes & Follow-up</h3>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  className="w-full p-2 border rounded-md min-h-[100px]"
                  value={editData.notes}
                  onChange={(e) =>
                    setEditData({ ...editData, notes: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder="Add notes about this lead..."
                />
              </div>

              <div>
                <Label htmlFor="followUpDate">Follow-up Date</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <Input
                    id="followUpDate"
                    type="date"
                    value={editData.followUpDate}
                    onChange={(e) =>
                      setEditData({ ...editData, followUpDate: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdate}
                    className="flex-1"
                    disabled={updateMutation.isLoading}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {updateMutation.isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timeline
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">
                  {new Date(lead.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Last Updated:</span>
                <span className="font-medium">
                  {new Date(lead.updatedAt).toLocaleString()}
                </span>
              </div>
              {lead.followUpDate && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-600">Follow-up Scheduled:</span>
                  <span className="font-medium">
                    {new Date(lead.followUpDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal;
