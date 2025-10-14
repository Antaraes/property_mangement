"use client";

import { FC, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, Settings, Home } from "lucide-react";
import AssignPermissionModal from "./AssignPermissionModal";

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    first_name: string | null;
    last_name: string | null;
    assignedProperties?: {
      id: string;
      name: string;
      location: string;
    }[];
    assignedAreas?: any[];
  };
  onDelete: (id: string) => void;
}

const AgentCard: FC<AgentCardProps> = ({ agent, onDelete }) => {
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={agent.image || undefined} alt={agent.name} />
              <AvatarFallback>{getInitials(agent.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{agent.name}</h3>
              <p className="text-sm text-gray-600 truncate">{agent.email}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Assigned Properties:</span>
            <span className="font-semibold flex items-center gap-1">
              <Home className="h-4 w-4" />
              {agent.assignedProperties?.length || 0}
            </span>
          </div>

          {agent.assignedProperties && agent.assignedProperties.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-gray-500 mb-2">Recent Properties:</p>
              <div className="space-y-1">
                {agent.assignedProperties.slice(0, 2).map((property) => (
                  <div
                    key={property.id}
                    className="text-xs bg-gray-50 p-2 rounded"
                  >
                    <p className="font-medium truncate">{property.name}</p>
                    <p className="text-gray-500 truncate">
                      {property.location}
                    </p>
                  </div>
                ))}
                {agent.assignedProperties.length > 2 && (
                  <p className="text-xs text-gray-500 text-center py-1">
                    +{agent.assignedProperties.length - 2} more
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setShowPermissionModal(true)}
          >
            <Settings className="h-4 w-4 mr-1" />
            Permissions
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(agent.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      {showPermissionModal && (
        <AssignPermissionModal
          agent={agent}
          onClose={() => setShowPermissionModal(false)}
        />
      )}
    </>
  );
};

export default AgentCard;
