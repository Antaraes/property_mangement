"use client";

import { FC, useState } from "react";
import { trpc } from "@/server/client";
import { Button } from "@/components/ui/button";
import { X, Trash2, Plus, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface AssignAreaModalProps {
  employee: {
    id: string;
    name: string;
    email: string;
    assignedAreas?: Array<{
      id: string;
      areaId: string;
      canManage: boolean;
      isLead: boolean;
      area: {
        id: string;
        name: string;
        country: {
          id: string;
          name: string;
          code: string;
        };
      };
    }>;
  };
  onClose: () => void;
}

const AssignAreaModal: FC<AssignAreaModalProps> = ({
  employee,
  onClose,
}) => {
  const utils = trpc.useUtils();
  const [selectedArea, setSelectedArea] = useState("");
  const [permissions, setPermissions] = useState({
    canManage: true,
    isLead: false,
  });

  // Fetch available areas
  const { data: areas } = trpc.area.list.useQuery();

  // Fetch employee details with area assignments
  const { data: employeeDetails, isLoading } = trpc.employee.getById.useQuery({
    id: employee.id,
  });

  // Assign area mutation
  const assignMutation = trpc.employee.assignToArea.useMutation({
    onSuccess: () => {
      toast.success("Area assigned successfully!");
      utils.employee.getById.invalidate({ id: employee.id });
      utils.employee.list.invalidate();
      setSelectedArea("");
      setPermissions({ canManage: true, isLead: false });
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Remove area mutation
  const removeMutation = trpc.employee.removeFromArea.useMutation({
    onSuccess: () => {
      toast.success("Area removed successfully!");
      utils.employee.getById.invalidate({ id: employee.id });
      utils.employee.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleAssign = () => {
    if (!selectedArea) {
      toast.error("Please select an area");
      return;
    }

    assignMutation.mutate({
      employeeId: employee.id,
      areaId: selectedArea,
      ...permissions,
    });
  };

  const handleRemove = (areaId: string) => {
    if (window.confirm("Are you sure you want to remove this area assignment?")) {
      removeMutation.mutate({
        employeeId: employee.id,
        areaId,
      });
    }
  };

  const assignedAreaIds =
    employeeDetails?.assignedAreas?.map((a) => a.areaId) || [];
  const availableAreas = areas?.filter(
    (a) => !assignedAreaIds.includes(a.id)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Manage Area Assignments</h2>
            <p className="text-sm text-gray-600">
              {employee.name} ({employee.email})
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Assign New Area */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Assign New Area
            </h3>

            <div>
              <Label htmlFor="area">Select Area</Label>
              <select
                id="area"
                className="w-full p-2 border rounded-md mt-1"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
              >
                <option value="">Choose an area...</option>
                {availableAreas?.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name} - {area.country.name} ({area.properties?.length || 0} properties)
                  </option>
                ))}
              </select>
              {availableAreas?.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  All areas have been assigned to this employee
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canManage"
                    checked={permissions.canManage}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, canManage: !!checked })
                    }
                  />
                  <label htmlFor="canManage" className="text-sm cursor-pointer">
                    Can Manage Properties in Area
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isLead"
                    checked={permissions.isLead}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, isLead: !!checked })
                    }
                  />
                  <label htmlFor="isLead" className="text-sm cursor-pointer flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Area Lead (Supervisor role)
                  </label>
                </div>
              </div>
            </div>

            <Button
              onClick={handleAssign}
              disabled={!selectedArea || assignMutation.isLoading}
              className="w-full"
            >
              {assignMutation.isLoading ? "Assigning..." : "Assign Area"}
            </Button>
          </div>

          {/* Current Area Assignments */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold">Current Area Assignments</h3>

            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              </div>
            ) : !employeeDetails?.assignedAreas || employeeDetails.assignedAreas.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No areas assigned yet
              </p>
            ) : (
              <div className="space-y-2">
                {employeeDetails.assignedAreas.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{assignment.area.name}</p>
                        {assignment.isLead && (
                          <Shield className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {assignment.area.country.name} ({assignment.area.country.code})
                      </p>
                      <div className="flex gap-2 mt-1">
                        {assignment.canManage && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            Can Manage
                          </span>
                        )}
                        {assignment.isLead && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                            Area Lead
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemove(assignment.areaId)}
                      disabled={removeMutation.isLoading}
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

export default AssignAreaModal;
