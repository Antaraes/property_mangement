"use client";

import { FC, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Globe, MapPin, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import EditCountryModal from "./EditCountryModal";

interface CountryCardProps {
  country: {
    id: string;
    name: string;
    code: string | null;
    company: {
      id: string;
      name: string;
    };
    _count?: {
      areas: number;
    };
  };
  onDelete: (id: string) => void;
}

const CountryCard: FC<CountryCardProps> = ({ country, onDelete }) => {
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);

  const areasCount = country._count?.areas || 0;

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-xl flex items-center gap-2 truncate">
                <Globe className="h-6 w-6 text-blue-600 flex-shrink-0" />
                {country.name}
              </h3>
              {country.code && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {country.code}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Company Info */}
          <div className="text-sm text-gray-600">
            <span className="font-medium">Company:</span> {country.company.name}
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-600">
                <MapPin className="h-5 w-5" />
                <span className="text-sm font-medium">Areas</span>
              </div>
              <p className="text-3xl font-bold text-blue-700">{areasCount}</p>
            </div>
          </div>

          {/* View Areas Button */}
          {areasCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => router.push(`/dashboard/areas?countryId=${country.id}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Areas in {country.name}
            </Button>
          )}
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
            onClick={() => onDelete(country.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      {/* Edit Modal */}
      {showEditModal && (
        <EditCountryModal
          country={country}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
};

export default CountryCard;
