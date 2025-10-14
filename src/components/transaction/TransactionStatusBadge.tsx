import { FC } from "react";

type TransactionStatus = "PENDING" | "APPROVED" | "COMPLETED" | "CANCELLED" | "REFUNDED";

interface TransactionStatusBadgeProps {
  status: TransactionStatus;
}

const TransactionStatusBadge: FC<TransactionStatusBadgeProps> = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "APPROVED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      case "REFUNDED":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles()}`}
    >
      {status}
    </span>
  );
};

export default TransactionStatusBadge;
