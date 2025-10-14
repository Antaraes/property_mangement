"use client";

import { FC } from "react";

type LeadStatus =
  | "PENDING"
  | "CONTACTED"
  | "SCHEDULED"
  | "NEGOTIATING"
  | "CLOSED_WON"
  | "CLOSED_LOST"
  | "CANCELLED";

interface LeadStatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

const statusConfig = {
  PENDING: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  CONTACTED: {
    label: "Contacted",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  SCHEDULED: {
    label: "Scheduled",
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
  NEGOTIATING: {
    label: "Negotiating",
    className: "bg-orange-100 text-orange-700 border-orange-200",
  },
  CLOSED_WON: {
    label: "Closed Won",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  CLOSED_LOST: {
    label: "Closed Lost",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
};

const LeadStatusBadge: FC<LeadStatusBadgeProps> = ({ status, className = "" }) => {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
};

export default LeadStatusBadge;
