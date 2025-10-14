"use client";

import { FC } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, Mail, MailOpen } from "lucide-react";

interface MessageCardProps {
  message: {
    id: string;
    subject?: string | null;
    content: string;
    read: boolean;
    sender: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
    };
    receiver: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
    };
    createdAt: string;
  };
  folder: "inbox" | "sent";
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

const MessageCard: FC<MessageCardProps> = ({ message, folder, onView, onDelete }) => {
  const otherUser = folder === "inbox" ? message.sender : message.receiver;
  const isUnread = folder === "inbox" && !message.read;

  const formatDate = (date: string) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    }
    return messageDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div
      className={`bg-white p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
        isUnread ? "border-l-4 border-l-blue-500 bg-blue-50" : "border-gray-200"
      }`}
      onClick={() => onView(message.id)}
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={otherUser.image || undefined} />
          <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {isUnread && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                {isUnread ? <MailOpen className="h-4 w-4 text-blue-500" /> : <Mail className="h-4 w-4 text-gray-400" />}
                <p className={`font-medium ${isUnread ? "font-bold" : ""}`}>{otherUser.name}</p>
              </div>
              <p className="text-sm text-gray-500">{otherUser.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{formatDate(message.createdAt)}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(message.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {message.subject && (
            <p className={`text-sm mt-2 ${isUnread ? "font-semibold" : "font-medium"}`}>
              {message.subject}
            </p>
          )}
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{message.content}</p>
        </div>
      </div>
    </div>
  );
};

export default MessageCard;
