"use client";

import { FC, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, MapPin, Building2, Users, Eye, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import EditAreaModal from "./EditAreaModal";

interface AreaCardProps {
  area: {
    id: string;
    name: string;
    description: string | null;
    country: {
      id: string;
      name: string;
      code: string | null;
    };
    properties?: { id: string }[];
    employeeAssignments?: { id: string }[];
  };
  onDelete: (id: string) => void;
}

const AreaCard: FC<AreaCardProps> = ({ area, onDelete }) => {
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);

  const propertiesCount = area.properties?.length || 0;
  const employeesCount = area.employeeAssignments?.length || 0;

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg flex items-center gap-2 truncate">
                <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0" />
                {area.name}
              </h3>
              <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                <Globe className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">
                  {area.country.name}
                  {area.country.code && ` (${area.country.code})`}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Description */}
          {area.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {area.description}
            </p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-blue-600">
                <Building2 className="h-4 w-4" />
                <span className="text-xs font-medium">Properties</span>
              </div>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {propertiesCount}
              </p>
            </div>

            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-green-600">
                <Users className="h-4 w-4" />
                <span className="text-xs font-medium">Employees</span>
              </div>
              <p className="text-2xl font-bold text-green-700 mt-1">
                {employeesCount}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => router.push(`/dashboard/properties?areaId=${area.id}`)}
              disabled={propertiesCount === 0}
            >
              <Eye className="h-3 w-3 mr-1" />
              View Properties
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => router.push(`/dashboard/agents?areaId=${area.id}`)}
              disabled={employeesCount === 0}
            >
              <Eye className="h-3 w-3 mr-1" />
              View Employees
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setShowEditModal(true)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(area.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      {/* Edit Modal */}
      {showEditModal && (
        <EditAreaModal
          area={area}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
};

export default AreaCard;
