"use client";

import { FC, useState } from "react";
import { trpc } from "@/server/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Users, MapPin, Home } from "lucide-react";
import toast from "react-hot-toast";
import EmployeeCard from "./EmployeeCard";
import CreateEmployeeModal from "./CreateEmployeeModal";
import { useRBAC } from "@/hooks/useRBAC";

const EmployeesDashboard: FC = () => {
  const utils = trpc.useUtils();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { isAdmin, isSuperAdmin } = useRBAC();

  const canManageEmployees = isAdmin || isSuperAdmin;

  // Fetch all employees
  const { data: employees, isLoading } = trpc.employee.list.useQuery();

  // Delete mutation
  const deleteMutation = trpc.employee.delete.useMutation({
    onSuccess: () => {
      utils.employee.list.invalidate();
      toast.success("Employee deleted successfully!");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this employee? All their area assignments will be removed.")) {
      deleteMutation.mutate({ id });
    }
  };

  // Filter employees based on search
  const filteredEmployees = employees?.filter((employee) => {
    const matchesSearch =
      searchTerm === "" ||
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Calculate stats
  const totalEmployees = employees?.length || 0;
  const activeEmployees = employees?.length || 0;
  const totalAssignedAreas = employees?.reduce((sum, emp) => sum + (emp.assignedAreas?.length || 0), 0) || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Employee Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage employees and their area assignments
          </p>
        </div>
        {canManageEmployees && (
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Employee
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold">Search Employees</h2>
        </div>

        <div>
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-1"
          />
        </div>

        {searchTerm && (
          <Button variant="outline" onClick={() => setSearchTerm("")}>
            Clear Search
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold">{totalEmployees}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500 opacity-50" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Employees</p>
              <p className="text-2xl font-bold">{activeEmployees}</p>
            </div>
            <Users className="h-8 w-8 text-green-500 opacity-50" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Assigned Areas</p>
              <p className="text-2xl font-bold">{totalAssignedAreas}</p>
            </div>
            <MapPin className="h-8 w-8 text-purple-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Employees Grid */}
      {filteredEmployees && filteredEmployees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
          <div className="text-gray-400 mb-4">
            <Users className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No employees found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? "Try adjusting your search"
              : "Get started by creating your first employee"}
          </p>
          {!searchTerm && canManageEmployees && (
            <Button onClick={() => setShowCreateModal(true)}>
              Create Your First Employee
            </Button>
          )}
        </div>
      )}

      {/* Create Employee Modal */}
      {showCreateModal && (
        <CreateEmployeeModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            utils.employee.list.invalidate();
          }}
        />
      )}
    </div>
  );
};

export default EmployeesDashboard;
