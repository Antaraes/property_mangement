"use client";

import { FC } from "react";
import { trpc } from "@/server/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Reply, Trash2, User, Calendar } from "lucide-react";
import toast from "react-hot-toast";

interface MessageDetailModalProps {
  messageId: string;
  onClose: () => void;
  onReply: (receiverId: string) => void;
}

const MessageDetailModal: FC<MessageDetailModalProps> = ({ messageId, onClose, onReply }) => {
  const { data: message, isLoading } = trpc.message.getById.useQuery({ id: messageId });

  const deleteMutation = trpc.message.delete.useMutation({
    onSuccess: () => {
      toast.success("Message deleted successfully!");
      onClose();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      deleteMutation.mutate({ id: messageId });
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading message...</p>
        </div>
      </div>
    );
  }

  if (!message) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Message Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* From */}
          <div className="flex items-start gap-3 pb-4 border-b">
            <Avatar className="h-12 w-12">
              <AvatarImage src={message.sender.image || undefined} />
              <AvatarFallback>{message.sender.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{message.sender.name}</p>
              <p className="text-sm text-gray-600">{message.sender.email}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                {formatDate(message.createdAt)}
              </div>
            </div>
          </div>

          {/* To */}
          <div className="flex items-start gap-3 pb-4 border-b">
            <User className="h-5 w-5 text-gray-400 mt-1" />
            <div>
              <p className="text-sm text-gray-600">To:</p>
              <p className="font-medium">{message.receiver.name}</p>
              <p className="text-sm text-gray-600">{message.receiver.email}</p>
            </div>
          </div>

          {/* Subject */}
          {message.subject && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Subject:</p>
              <p className="text-lg font-semibold">{message.subject}</p>
            </div>
          )}

          {/* Content */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={() => onReply(message.sender.id)} className="flex items-center gap-2">
              <Reply className="h-4 w-4" />
              Reply
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageDetailModal;
