"use client";

import { FC } from "react";
import { trpc } from "@/server/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  Home,
  ClipboardList,
  DollarSign,
  Globe,
  MapPin,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const CompanyStats: FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as any;

  const { data: stats, isLoading } = trpc.company.getStats.useQuery(
    { id: user?.companyId },
    { enabled: !!user?.companyId }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center p-12">
        <p className="text-gray-600">No statistics available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TrendingUp className="h-8 w-8" />
          Company Statistics
        </h1>
        <p className="text-gray-600 mt-1">Overview of your company&apos;s performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Employees</p>
                <p className="text-4xl font-bold mt-2">{stats.employees.total}</p>
              </div>
              <Users className="h-12 w-12 text-blue-100" />
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4 text-white hover:bg-blue-400"
              onClick={() => router.push("/dashboard/employees")}
            >
              View Employees <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Properties</p>
                <p className="text-4xl font-bold mt-2">{stats.properties.total}</p>
                <p className="text-green-100 text-xs mt-1">
                  {stats.properties.available} available
                </p>
              </div>
              <Home className="h-12 w-12 text-green-100" />
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4 text-white hover:bg-green-400"
              onClick={() => router.push("/dashboard/properties")}
            >
              View Properties <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Leads</p>
                <p className="text-4xl font-bold mt-2">{stats.leads.total}</p>
                <p className="text-purple-100 text-xs mt-1">
                  {stats.leads.active} active
                </p>
              </div>
              <ClipboardList className="h-12 w-12 text-purple-100" />
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4 text-white hover:bg-purple-400"
              onClick={() => router.push("/dashboard/leads")}
            >
              View Leads <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Transactions</p>
                <p className="text-4xl font-bold mt-2">{stats.transactions.total}</p>
                <p className="text-orange-100 text-xs mt-1">
                  {stats.transactions.completed} completed
                </p>
              </div>
              <DollarSign className="h-12 w-12 text-orange-100" />
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4 text-white hover:bg-orange-400"
              onClick={() => router.push("/dashboard/transactions")}
            >
              View Transactions <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Home className="h-5 w-5 text-gray-400" />
              <h3 className="font-semibold text-lg">Property Breakdown</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Available</span>
                <span className="font-semibold text-green-600">{stats.properties.available}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Occupied</span>
                <span className="font-semibold text-blue-600">{stats.properties.occupied}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${(stats.properties.available / stats.properties.total) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="h-5 w-5 text-gray-400" />
              <h3 className="font-semibold text-lg">Leads Status</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active</span>
                <span className="font-semibold text-orange-600">{stats.leads.active}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Closed</span>
                <span className="font-semibold text-gray-600">{stats.leads.closed}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div
                  className="bg-orange-600 h-2 rounded-full"
                  style={{
                    width: `${(stats.leads.active / stats.leads.total) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <h3 className="font-semibold text-lg">Transactions</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed</span>
                <span className="font-semibold text-green-600">{stats.transactions.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending</span>
                <span className="font-semibold text-yellow-600">{stats.transactions.pending}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${(stats.transactions.completed / stats.transactions.total) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-gray-400" />
              <h3 className="font-semibold text-lg">Geographic Coverage</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-600">Countries</span>
                </div>
                <span className="font-semibold">{stats.geography.countries}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-500" />
                  <span className="text-gray-600">Areas</span>
                </div>
                <span className="font-semibold">{stats.geography.areas}</span>
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => router.push("/dashboard/areas")}
              >
                View Locations <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyStats;
