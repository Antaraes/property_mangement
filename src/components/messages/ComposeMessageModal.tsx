"use client";

import { FC, useState } from "react";
import { trpc } from "@/server/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import toast from "react-hot-toast";

interface ComposeMessageModalProps {
  onClose: () => void;
  onSuccess: () => void;
  defaultReceiverId?: string;
}

const ComposeMessageModal: FC<ComposeMessageModalProps> = ({ onClose, onSuccess, defaultReceiverId }) => {
  const [formData, setFormData] = useState({
    receiverId: defaultReceiverId || "",
    subject: "",
    content: "",
  });

  const { data: users } = trpc.employee.list.useQuery();

  const sendMutation = trpc.message.send.useMutation({
    onSuccess: () => {
      toast.success("Message sent successfully!");
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.receiverId || !formData.content) {
      toast.error("Please fill in all required fields");
      return;
    }

    sendMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Compose Message</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="receiverId">To *</Label>
            <select
              id="receiverId"
              required
              value={formData.receiverId}
              onChange={(e) => setFormData({ ...formData, receiverId: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select recipient</option>
              {users?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Message subject"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="content">Message *</Label>
            <textarea
              id="content"
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Type your message here..."
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md min-h-[200px]"
            />
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button type="submit" disabled={sendMutation.isPending} className="flex-1">
              {sendMutation.isPending ? "Sending..." : "Send Message"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComposeMessageModal;
