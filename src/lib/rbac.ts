import { prisma } from "./prisma";

export type UserRole = "CUSTOMER" | "AGENT" | "ADMIN" | "SUPERADMIN";

export type Permission = "canView" | "canEdit" | "canDelete";

// Role hierarchy: SUPERADMIN > ADMIN > AGENT > CUSTOMER
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  CUSTOMER: 0,
  AGENT: 1,
  ADMIN: 2,
  SUPERADMIN: 3,
};

// Check if a user has a specific role or higher
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// Check if a user can manage agents (create/assign permissions)
export function canManageAgents(role: UserRole): boolean {
  return hasRole(role, "ADMIN");
}

// Check if a user can access all properties
export function canAccessAllProperties(role: UserRole): boolean {
  return hasRole(role, "ADMIN");
}

// Check if an agent has permission for a specific property
export async function checkAgentPermission(
  userId: string,
  propertyId: string,
  permission: Permission = "canView"
): Promise<boolean> {
  const agentPermission = await prisma.agentPermission.findUnique({
    where: {
      agentId_propertyId: {
        agentId: userId,
        propertyId: propertyId,
      },
    },
  });

  if (!agentPermission) {
    return false;
  }

  return agentPermission[permission] === true;
}

// Get all properties accessible by an agent
export async function getAgentAccessibleProperties(
  userId: string,
  permission: Permission = "canView"
): Promise<string[]> {
  const permissions = await prisma.agentPermission.findMany({
    where: {
      agentId: userId,
      [permission]: true,
    },
    select: {
      propertyId: true,
    },
  });

  return permissions.map((p) => p.propertyId);
}

// Check if user can perform action on property
export async function canAccessProperty(
  userId: string,
  userRole: UserRole,
  propertyId: string,
  ownerId: string,
  permission: Permission = "canView"
): Promise<boolean> {
  // SUPERADMIN and ADMIN can access all properties
  if (canAccessAllProperties(userRole)) {
    return true;
  }

  // Owner can access their own property
  if (userId === ownerId) {
    return true;
  }

  // For agents, check permissions
  if (userRole === "AGENT") {
    return await checkAgentPermission(userId, propertyId, permission);
  }

  // Customers cannot access properties they don't own
  return false;
}

// Role-based feature access
export const FEATURE_ACCESS = {
  viewAgentTab: ["ADMIN", "SUPERADMIN"],
  createAgents: ["ADMIN", "SUPERADMIN"],
  assignPermissions: ["ADMIN", "SUPERADMIN"],
  createProperties: ["AGENT", "ADMIN", "SUPERADMIN"],
  viewAllProperties: ["ADMIN", "SUPERADMIN"],
  manageSettings: ["ADMIN", "SUPERADMIN"],
  viewDocuments: ["AGENT", "ADMIN", "SUPERADMIN"],
} as const;

export function hasFeatureAccess(
  userRole: UserRole,
  feature: keyof typeof FEATURE_ACCESS
): boolean {
  return FEATURE_ACCESS[feature].includes(userRole);
}
