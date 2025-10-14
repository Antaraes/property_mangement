"use client";

import { FC, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, User, Home, Calendar, Eye } from "lucide-react";
import TransactionStatusBadge from "./TransactionStatusBadge";

interface TransactionCardProps {
  transaction: {
    id: string;
    type: "RENT" | "PURCHASE";
    status: "PENDING" | "APPROVED" | "COMPLETED" | "CANCELLED" | "REFUNDED";
    amount: number;
    currency: string;
    customer: {
      id: string;
      name: string;
      email: string;
    };
    property: {
      id: string;
      name: string;
      location: string;
    };
    paymentDate?: string | null;
    contractStartDate?: string | null;
    contractEndDate?: string | null;
    createdAt: string;
  };
  onViewDetails: (id: string) => void;
}

const TransactionCard: FC<TransactionCardProps> = ({ transaction, onViewDetails }) => {
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
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-2xl font-bold text-green-600">
              {formatCurrency(transaction.amount, transaction.currency)}
            </span>
          </div>
          <TransactionStatusBadge status={transaction.status} />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span
            className={`text-xs px-2 py-1 rounded ${
              transaction.type === "RENT"
                ? "bg-blue-100 text-blue-700"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            {transaction.type}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-start gap-2">
          <User className="h-4 w-4 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">{transaction.customer.name}</p>
            <p className="text-xs text-gray-500">{transaction.customer.email}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Home className="h-4 w-4 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">{transaction.property.name}</p>
            <p className="text-xs text-gray-500">{transaction.property.location}</p>
          </div>
        </div>

        {transaction.type === "RENT" && (transaction.contractStartDate || transaction.contractEndDate) && (
          <div className="flex items-start gap-2 pt-2 border-t">
            <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">Contract Period</p>
              <p className="text-sm">
                {formatDate(transaction.contractStartDate)} - {formatDate(transaction.contractEndDate)}
              </p>
            </div>
          </div>
        )}

        {transaction.paymentDate && (
          <div className="text-xs text-gray-500">
            Payment Date: {formatDate(transaction.paymentDate)}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4 border-t">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onViewDetails(transaction.id)}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TransactionCard;
