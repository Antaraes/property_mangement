"use client";

import { FC, useState } from "react";
import { trpc } from "@/server/client";
import { Button } from "@/components/ui/button";
import { X, Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface AssignPermissionModalProps {
  agent: {
    id: string;
    name: string;
    email: string;
    agentPermissions: Array<{
      property: {
        id: string;
        name: string;
        location: string;
      };
    }>;
  };
  onClose: () => void;
}

const AssignPermissionModal: FC<AssignPermissionModalProps> = ({
  agent,
  onClose,
}) => {
  const utils = trpc.useUtils();
  const [selectedProperty, setSelectedProperty] = useState("");
  const [permissions, setPermissions] = useState({
    canView: true,
    canEdit: false,
    canDelete: false,
  });

  // Fetch available properties
  const { data: properties } = trpc.agent.getAvailableProperties.useQuery();

  // Fetch agent details with permissions
  const { data: agentDetails, isLoading } = trpc.agent.getById.useQuery({
    id: agent.id,
  });

  // Assign permission mutation
  const assignMutation = trpc.agent.assignPermission.useMutation({
    onSuccess: () => {
      toast.success("Permission assigned successfully!");
      utils.agent.getById.invalidate({ id: agent.id });
      utils.agent.list.invalidate();
      setSelectedProperty("");
      setPermissions({ canView: true, canEdit: false, canDelete: false });
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Remove permission mutation
  const removeMutation = trpc.agent.removePermission.useMutation({
    onSuccess: () => {
      toast.success("Permission removed successfully!");
      utils.agent.getById.invalidate({ id: agent.id });
      utils.agent.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleAssign = () => {
    if (!selectedProperty) {
      toast.error("Please select a property");
      return;
    }

    assignMutation.mutate({
      agentId: agent.id,
      propertyId: selectedProperty,
      ...permissions,
    });
  };

  const handleRemove = (propertyId: string) => {
    if (window.confirm("Are you sure you want to remove this permission?")) {
      removeMutation.mutate({
        agentId: agent.id,
        propertyId,
      });
    }
  };

  const assignedPropertyIds =
    agentDetails?.agentPermissions.map((p) => p.property.id) || [];
  const availableProperties = properties?.filter(
    (p) => !assignedPropertyIds.includes(p.id)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Manage Permissions</h2>
            <p className="text-sm text-gray-600">
              {agent.name} ({agent.email})
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Assign New Permission */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Assign New Property
            </h3>

            <div>
              <Label htmlFor="property">Select Property</Label>
              <select
                id="property"
                className="w-full p-2 border rounded-md mt-1"
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
              >
                <option value="">Choose a property...</option>
                {availableProperties?.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name} - {property.location}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canView"
                    checked={permissions.canView}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, canView: !!checked })
                    }
                  />
                  <label htmlFor="canView" className="text-sm cursor-pointer">
                    Can View
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canEdit"
                    checked={permissions.canEdit}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, canEdit: !!checked })
                    }
                  />
                  <label htmlFor="canEdit" className="text-sm cursor-pointer">
                    Can Edit
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canDelete"
                    checked={permissions.canDelete}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, canDelete: !!checked })
                    }
                  />
                  <label htmlFor="canDelete" className="text-sm cursor-pointer">
                    Can Delete
                  </label>
                </div>
              </div>
            </div>

            <Button
              onClick={handleAssign}
              disabled={!selectedProperty || assignMutation.isLoading}
              className="w-full"
            >
              {assignMutation.isLoading ? "Assigning..." : "Assign Permission"}
            </Button>
          </div>

          {/* Current Permissions */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold">Current Permissions</h3>

            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              </div>
            ) : agentDetails?.agentPermissions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No permissions assigned yet
              </p>
            ) : (
              <div className="space-y-2">
                {agentDetails?.agentPermissions.map((perm) => (
                  <div
                    key={perm.property.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{perm.property.name}</p>
                      <p className="text-sm text-gray-600">
                        {perm.property.location}
                      </p>
                      <div className="flex gap-3 mt-1">
                        {perm.canView && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            View
                          </span>
                        )}
                        {perm.canEdit && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            Edit
                          </span>
                        )}
                        {perm.canDelete && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                            Delete
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemove(perm.property.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4">
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssignPermissionModal;
