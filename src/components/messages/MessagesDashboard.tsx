"use client";

import { FC, useState } from "react";
import { trpc } from "@/server/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Plus, Search, Inbox, Send as SendIcon } from "lucide-react";
import MessageCard from "./MessageCard";
import MessageDetailModal from "./MessageDetailModal";
import ComposeMessageModal from "./ComposeMessageModal";
import toast from "react-hot-toast";

interface MessagesDashboardProps {
  folder?: "inbox" | "sent";
}

const MessagesDashboard: FC<MessagesDashboardProps> = ({ folder = "inbox" }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const { data: messagesData, isLoading } = trpc.message.list.useQuery({ folder });
  const { data: unreadData } = trpc.message.getUnreadCount.useQuery();
  const utils = trpc.useUtils();

  const deleteMutation = trpc.message.delete.useMutation({
    onSuccess: () => {
      toast.success("Message deleted successfully!");
      utils.message.list.invalidate();
      utils.message.getUnreadCount.invalidate();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const messages = messagesData?.messages || [];
  const unreadCount = unreadData?.count || 0;

  const filteredMessages = messages.filter((message) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      message.sender.name.toLowerCase().includes(searchLower) ||
      message.receiver.name.toLowerCase().includes(searchLower) ||
      (message.subject && message.subject.toLowerCase().includes(searchLower)) ||
      message.content.toLowerCase().includes(searchLower)
    );
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      deleteMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
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
            <MessageSquare className="h-8 w-8" />
            {folder === "inbox" ? "Inbox" : "Sent Messages"}
          </h1>
          <p className="text-gray-600 mt-1">
            {folder === "inbox" ? `${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}` : "Messages you've sent"}
          </p>
        </div>
        <Button onClick={() => setShowComposeModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Compose Message
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant={folder === "inbox" ? "default" : "ghost"}
          onClick={() => window.location.href = "/dashboard/messages"}
          className="flex items-center gap-2"
        >
          <Inbox className="h-4 w-4" />
          Inbox
          {folder === "inbox" && unreadCount > 0 && (
            <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
              {unreadCount}
            </span>
          )}
        </Button>
        <Button
          variant={folder === "sent" ? "default" : "ghost"}
          onClick={() => window.location.href = "/dashboard/messages/sent"}
          className="flex items-center gap-2"
        >
          <SendIcon className="h-4 w-4" />
          Sent
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Messages List */}
      {filteredMessages.length > 0 ? (
        <div className="space-y-2">
          {filteredMessages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              folder={folder}
              onView={setSelectedMessageId}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? "Try adjusting your search"
              : folder === "inbox"
              ? "Your inbox is empty"
              : "You haven't sent any messages yet"}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowComposeModal(true)}>Compose Message</Button>
          )}
        </div>
      )}

      {/* Modals */}
      {showComposeModal && (
        <ComposeMessageModal
          onClose={() => setShowComposeModal(false)}
          onSuccess={() => {
            setShowComposeModal(false);
            utils.message.list.invalidate();
          }}
        />
      )}

      {selectedMessageId && (
        <MessageDetailModal
          messageId={selectedMessageId}
          onClose={() => {
            setSelectedMessageId(null);
            utils.message.list.invalidate();
            utils.message.getUnreadCount.invalidate();
          }}
          onReply={(receiverId) => {
            setSelectedMessageId(null);
            setShowComposeModal(true);
          }}
        />
      )}
    </div>
  );
};

export default MessagesDashboard;
