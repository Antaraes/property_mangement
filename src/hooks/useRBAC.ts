"use client";

import { useSession } from "next-auth/react";
import { UserRole, FEATURE_ACCESS, hasRole } from "@/lib/rbac";

export function useRBAC() {
  const { data: session } = useSession();

  const userRole = (session?.user?.role as UserRole) || "CUSTOMER";

  return {
    role: userRole,
    isCustomer: userRole === "CUSTOMER",
    isAgent: userRole === "AGENT",
    isAdmin: userRole === "ADMIN",
    isSuperAdmin: userRole === "SUPERADMIN",

    // Check if user has a specific role or higher
    hasRole: (requiredRole: UserRole) => hasRole(userRole, requiredRole),

    // Feature access checks
    canViewAgentTab: FEATURE_ACCESS.viewAgentTab.includes(userRole),
    canCreateAgents: FEATURE_ACCESS.createAgents.includes(userRole),
    canAssignPermissions: FEATURE_ACCESS.assignPermissions.includes(userRole),
    canCreateProperties: FEATURE_ACCESS.createProperties.includes(userRole),
    canViewAllProperties: FEATURE_ACCESS.viewAllProperties.includes(userRole),
    canManageSettings: FEATURE_ACCESS.manageSettings.includes(userRole),
    canViewDocuments: FEATURE_ACCESS.viewDocuments.includes(userRole),
  };
}
