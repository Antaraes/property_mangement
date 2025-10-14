"use client";

import { FC } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LeadStatusBadge from "./LeadStatusBadge";
import { User, Phone, MapPin, Calendar, Eye, UserCheck, AlertCircle } from "lucide-react";

type LeadStatus =
  | "PENDING"
  | "CONTACTED"
  | "SCHEDULED"
  | "NEGOTIATING"
  | "CLOSED_WON"
  | "CLOSED_LOST"
  | "CANCELLED";

type LeadPriority = "LOW" | "MEDIUM" | "HIGH";

interface LeadCardProps {
  lead: {
    id: string;
    status: LeadStatus;
    priority: LeadPriority;
    message?: string | null;
    phone?: string | null;
    preferredContactMethod?: string | null;
    createdAt: Date | string;
    followUpDate?: Date | string | null;
    customer: {
      id: string;
      name: string | null;
      email: string | null;
      phone?: string | null;
    };
    property: {
      id: string;
      name: string;
      location: string;
      price: number;
    };
    assignedTo?: {
      id: string;
      name: string | null;
      email: string | null;
    } | null;
  };
  onViewDetails: (leadId: string) => void;
  onAssign?: (leadId: string) => void;
  onUpdateStatus?: (leadId: string) => void;
}

const priorityConfig = {
  LOW: { label: "Low", color: "text-gray-500" },
  MEDIUM: { label: "Medium", color: "text-yellow-600" },
  HIGH: { label: "High", color: "text-red-600" },
};

const LeadCard: FC<LeadCardProps> = ({
  lead,
  onViewDetails,
  onAssign,
  onUpdateStatus,
}) => {
  const priorityInfo = priorityConfig[lead.priority];

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow border border-gray-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg text-gray-900">
              {lead.customer.name || "Unnamed Customer"}
            </h3>
            <div className="flex items-center gap-1">
              <AlertCircle className={`h-4 w-4 ${priorityInfo.color}`} />
              <span className={`text-xs font-medium ${priorityInfo.color}`}>
                {priorityInfo.label}
              </span>
            </div>
          </div>
          <LeadStatusBadge status={lead.status} />
        </div>
      </div>

      {/* Property Info */}
      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-start gap-2 mb-1">
          <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-900">{lead.property.name}</p>
            <p className="text-sm text-gray-600">{lead.property.location}</p>
            <p className="text-sm font-semibold text-blue-600 mt-1">
              ${lead.property.price.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600">{lead.customer.email}</span>
        </div>
        {(lead.phone || lead.customer.phone) && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">{lead.phone || lead.customer.phone}</span>
          </div>
        )}
        {lead.preferredContactMethod && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">
              Prefers: {lead.preferredContactMethod}
            </span>
          </div>
        )}
      </div>

      {/* Message Preview */}
      {lead.message && (
        <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-100">
          <p className="text-sm text-gray-700 line-clamp-2">{lead.message}</p>
        </div>
      )}

      {/* Assigned To */}
      {lead.assignedTo && (
        <div className="flex items-center gap-2 text-sm mb-3 p-2 bg-green-50 rounded border border-green-100">
          <UserCheck className="h-4 w-4 text-green-600" />
          <span className="text-gray-700">
            Assigned to: <span className="font-medium">{lead.assignedTo.name}</span>
          </span>
        </div>
      )}

      {/* Follow-up Date */}
      {lead.followUpDate && (
        <div className="flex items-center gap-2 text-sm mb-3 text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>
            Follow-up:{" "}
            {new Date(lead.followUpDate).toLocaleDateString()}
          </span>
        </div>
      )}

      {/* Date */}
      <div className="text-xs text-gray-500 mb-3">
        Created: {new Date(lead.createdAt).toLocaleDateString()}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={() => onViewDetails(lead.id)}
          className="flex-1 text-sm"
          variant="outline"
        >
          <Eye className="h-4 w-4 mr-1" />
          View Details
        </Button>
        {onAssign && !lead.assignedTo && (
          <Button
            onClick={() => onAssign(lead.id)}
            className="text-sm"
            variant="default"
          >
            Assign
          </Button>
        )}
        {onUpdateStatus && (
          <Button
            onClick={() => onUpdateStatus(lead.id)}
            className="text-sm"
            variant="default"
          >
            Update
          </Button>
        )}
      </div>
    </Card>
  );
};

export default LeadCard;
