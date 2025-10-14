"use client";

import { FC, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, MapPin, Home, Shield } from "lucide-react";
import AssignAreaModal from "./AssignAreaModal";

interface EmployeeCardProps {
  employee: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    company?: {
      id: string;
      name: string;
    } | null;
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
    assignedProperties?: Array<{
      id: string;
      name: string;
      location: string;
    }>;
  };
  onDelete: (id: string) => void;
}

const EmployeeCard: FC<EmployeeCardProps> = ({ employee, onDelete }) => {
  const [showAssignAreaModal, setShowAssignAreaModal] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const assignedAreasCount = employee.assignedAreas?.length || 0;
  const assignedPropertiesCount = employee.assignedProperties?.length || 0;
  const isLead = employee.assignedAreas?.some(area => area.isLead);

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={employee.image || undefined} alt={employee.name} />
              <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg truncate">{employee.name}</h3>
                {isLead && (
                  <Shield className="h-4 w-4 text-yellow-500" title="Area Lead" />
                )}
              </div>
              <p className="text-sm text-gray-600 truncate">{employee.email}</p>
              {employee.phone && (
                <p className="text-xs text-gray-500">{employee.phone}</p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {employee.company && (
            <div className="text-sm">
              <span className="text-gray-600">Company:</span>
              <span className="ml-2 font-medium">{employee.company.name}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Assigned Areas:</span>
            <span className="font-semibold flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {assignedAreasCount}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Assigned Properties:</span>
            <span className="font-semibold flex items-center gap-1">
              <Home className="h-4 w-4" />
              {assignedPropertiesCount}
            </span>
          </div>

          {employee.assignedAreas && employee.assignedAreas.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-gray-500 mb-2">Recent Areas:</p>
              <div className="space-y-1">
                {employee.assignedAreas.slice(0, 2).map((assignment) => (
                  <div
                    key={assignment.id}
                    className="text-xs bg-gray-50 p-2 rounded"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{assignment.area.name}</p>
                      {assignment.isLead && (
                        <Shield className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-gray-500 truncate">
                      {assignment.area.country.name}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {assignment.canManage && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                          Can Manage
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {employee.assignedAreas.length > 2 && (
                  <p className="text-xs text-gray-500 text-center py-1">
                    +{employee.assignedAreas.length - 2} more
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
            onClick={() => setShowAssignAreaModal(true)}
          >
            <MapPin className="h-4 w-4 mr-1" />
            Assign Areas
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(employee.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      {showAssignAreaModal && (
        <AssignAreaModal
          employee={employee}
          onClose={() => setShowAssignAreaModal(false)}
        />
      )}
    </>
  );
};

export default EmployeeCard;
