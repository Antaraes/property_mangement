"use client";

import { FC } from "react";
import { trpc } from "@/server/client";
import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  AlertCircle,
} from "lucide-react";
import LeadStatusBadge from "@/components/crm/LeadStatusBadge";

interface PageProps {}

const Page: FC<PageProps> = ({}) => {
  const { data: stats, isLoading } = trpc.lead.getStats.useQuery();
  const { data: recentLeads } = trpc.lead.list.useQuery({});

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate conversion rate color
  const conversionRateColor =
    (stats?.conversionRate || 0) >= 50
      ? "text-green-600"
      : (stats?.conversionRate || 0) >= 30
      ? "text-yellow-600"
      : "text-red-600";

  // Get recent activity (last 5 leads)
  const recentActivity = recentLeads?.slice(0, 5) || [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Lead Analytics</h1>
        <p className="text-gray-600 mt-1">
          Track performance and insights for your lead management
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Leads */}
        <Card className="p-6 border-2 border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total Leads</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                {stats?.totalLeads || 0}
              </p>
            </div>
            <Users className="h-12 w-12 text-blue-600 opacity-50" />
          </div>
        </Card>

        {/* Conversion Rate */}
        <Card className="p-6 border-2 border-green-200 bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Conversion Rate</p>
              <p className={`text-3xl font-bold mt-2 ${conversionRateColor}`}>
                {stats?.conversionRate || 0}%
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-600 opacity-50" />
          </div>
        </Card>

        {/* Closed Won */}
        <Card className="p-6 border-2 border-emerald-200 bg-emerald-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">Closed Won</p>
              <p className="text-3xl font-bold text-emerald-900 mt-2">
                {stats?.closedWonCount || 0}
              </p>
            </div>
            <CheckCircle className="h-12 w-12 text-emerald-600 opacity-50" />
          </div>
        </Card>

        {/* Active Leads */}
        <Card className="p-6 border-2 border-orange-200 bg-orange-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700">Active Leads</p>
              <p className="text-3xl font-bold text-orange-900 mt-2">
                {(stats?.totalLeads || 0) - (stats?.closedWonCount || 0)}
              </p>
            </div>
            <Activity className="h-12 w-12 text-orange-600 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Leads by Status */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Leads by Status
        </h2>
        <div className="space-y-3">
          {stats?.leadsByStatus.map((item: any) => {
            const total = stats.totalLeads || 1;
            const percentage = ((item.count / total) * 100).toFixed(1);

            return (
              <div key={item.status} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LeadStatusBadge status={item.status} />
                    <span className="text-sm text-gray-600">
                      {item.count} leads
                    </span>
                  </div>
                  <span className="text-sm font-medium">{percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      item.status === "PENDING"
                        ? "bg-yellow-500"
                        : item.status === "CONTACTED"
                        ? "bg-blue-500"
                        : item.status === "SCHEDULED"
                        ? "bg-purple-500"
                        : item.status === "NEGOTIATING"
                        ? "bg-orange-500"
                        : item.status === "CLOSED_WON"
                        ? "bg-green-500"
                        : item.status === "CLOSED_LOST"
                        ? "bg-red-500"
                        : "bg-gray-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads by Priority */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Leads by Priority
          </h2>
          <div className="space-y-4">
            {stats?.leadsByPriority.map((item: any) => {
              const total = stats.totalLeads || 1;
              const percentage = ((item.count / total) * 100).toFixed(1);
              const priorityConfig = {
                LOW: { color: "text-gray-700", bg: "bg-gray-500" },
                MEDIUM: { color: "text-yellow-700", bg: "bg-yellow-500" },
                HIGH: { color: "text-red-700", bg: "bg-red-500" },
              };
              const config =
                priorityConfig[item.priority as keyof typeof priorityConfig];

              return (
                <div key={item.priority} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${config.color}`}>
                      {item.priority}
                    </span>
                    <div className="text-right">
                      <span className="text-sm text-gray-600">
                        {item.count} leads
                      </span>
                      <span className="text-sm font-medium ml-2">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${config.bg}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Conversion Funnel */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Conversion Funnel
          </h2>
          <div className="space-y-4">
            {[
              { stage: "New Leads", count: stats?.totalLeads || 0, width: "100%" },
              {
                stage: "Contacted",
                count:
                  stats?.leadsByStatus.find((s: any) => s.status === "CONTACTED")
                    ?.count || 0,
                width: "80%",
              },
              {
                stage: "Scheduled",
                count:
                  stats?.leadsByStatus.find((s: any) => s.status === "SCHEDULED")
                    ?.count || 0,
                width: "60%",
              },
              {
                stage: "Negotiating",
                count:
                  stats?.leadsByStatus.find((s: any) => s.status === "NEGOTIATING")
                    ?.count || 0,
                width: "40%",
              },
              {
                stage: "Closed Won",
                count: stats?.closedWonCount || 0,
                width: "20%",
              },
            ].map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.stage}</span>
                  <span className="text-gray-600">{item.count}</span>
                </div>
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-8 rounded flex items-center justify-center text-white font-medium text-sm"
                  style={{ width: item.width }}
                >
                  {item.count > 0 && item.count}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity Timeline */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </h2>
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((lead: any) => (
              <div
                key={lead.id}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">
                      {lead.customer?.name || "Unnamed Customer"}
                    </span>
                    <LeadStatusBadge status={lead.status} />
                  </div>
                  <p className="text-sm text-gray-600">
                    Interested in <span className="font-medium">{lead.property?.name}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(lead.createdAt).toLocaleString()}
                  </p>
                </div>
                {lead.assignedTo && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Assigned to</p>
                    <p className="text-sm font-medium">{lead.assignedTo.name}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No recent activity to display
            </div>
          )}
        </div>
      </Card>

      {/* Performance Insights */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <h2 className="text-xl font-bold mb-4">Performance Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-600">Average Close Rate</p>
            <p className="text-2xl font-bold text-blue-600">
              {stats?.conversionRate || 0}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Based on closed won vs total leads
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-600">Active Pipeline</p>
            <p className="text-2xl font-bold text-purple-600">
              {(stats?.totalLeads || 0) -
                (stats?.closedWonCount || 0) -
                (stats?.leadsByStatus.find((s: any) => s.status === "CLOSED_LOST")
                  ?.count || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Leads currently in progress
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-600">Success Rate</p>
            <p className={`text-2xl font-bold ${conversionRateColor}`}>
              {stats?.closedWonCount || 0} / {stats?.totalLeads || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Total conversions
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Page;
