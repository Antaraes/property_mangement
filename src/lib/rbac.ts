import { prisma } from "./prisma";

export type UserRole = "CUSTOMER" | "EMPLOYEE" | "ADMIN" | "SUPERADMIN";

export type Permission = "canView" | "canEdit" | "canDelete";

// Role hierarchy: SUPERADMIN > ADMIN > EMPLOYEE > CUSTOMER
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  CUSTOMER: 0,
  EMPLOYEE: 1,
  ADMIN: 2,
  SUPERADMIN: 3,
};

// Check if a user has a specific role or higher
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// Check if a user can manage employees (create/assign to areas)
export function canManageEmployees(role: UserRole): boolean {
  return hasRole(role, "ADMIN");
}

// Legacy alias for backward compatibility
export function canManageAgents(role: UserRole): boolean {
  return canManageEmployees(role);
}

// Check if a user can access all properties
export function canAccessAllProperties(role: UserRole): boolean {
  return hasRole(role, "ADMIN");
}

// Check if an employee has access to a specific property
export async function checkEmployeePropertyAccess(
  userId: string,
  propertyId: string
): Promise<boolean> {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      assignedToId: true,
      areaId: true,
    },
  });

  if (!property) {
    return false;
  }

  // Check if employee is directly assigned to this property
  if (property.assignedToId === userId) {
    return true;
  }

  // Check if employee has access to the property's area
  if (property.areaId) {
    const employeeArea = await prisma.employeeArea.findUnique({
      where: {
        employeeId_areaId: {
          employeeId: userId,
          areaId: property.areaId,
        },
      },
    });

    if (employeeArea && employeeArea.canManage) {
      return true;
    }
  }

  return false;
}

// Get all properties accessible by an employee
export async function getEmployeeAccessibleProperties(
  userId: string
): Promise<string[]> {
  // Get directly assigned properties
  const assignedProperties = await prisma.property.findMany({
    where: { assignedToId: userId },
    select: { id: true },
  });

  // Get properties in areas the employee manages
  const employeeAreas = await prisma.employeeArea.findMany({
    where: {
      employeeId: userId,
      canManage: true,
    },
    select: { areaId: true },
  });

  const areaIds = employeeAreas.map((ea) => ea.areaId);

  const areaProperties = await prisma.property.findMany({
    where: {
      areaId: { in: areaIds },
    },
    select: { id: true },
  });

  // Combine and deduplicate
  const allPropertyIds = [
    ...assignedProperties.map((p) => p.id),
    ...areaProperties.map((p) => p.id),
  ];

  return Array.from(new Set(allPropertyIds));
}

// Legacy function for backward compatibility
export async function getAgentAccessibleProperties(
  userId: string,
  permission: Permission = "canView"
): Promise<string[]> {
  return getEmployeeAccessibleProperties(userId);
}

// Check if user can perform action on property
export async function canAccessProperty(
  userId: string,
  userRole: UserRole,
  propertyId: string,
  permission: Permission = "canView"
): Promise<boolean> {
  // SUPERADMIN and ADMIN can access all properties
  if (canAccessAllProperties(userRole)) {
    return true;
  }

  // For employees, check area/property assignments
  if (userRole === "EMPLOYEE") {
    return await checkEmployeePropertyAccess(userId, propertyId);
  }

  // Customers can only view properties (not edit/delete)
  if (userRole === "CUSTOMER" && permission === "canView") {
    return true; // All customers can view properties
  }

  return false;
}

// Check if user can manage a specific area
export async function canManageArea(
  userId: string,
  userRole: UserRole,
  areaId: string
): Promise<boolean> {
  // Admins can manage all areas
  if (hasRole(userRole, "ADMIN")) {
    return true;
  }

  // Check if employee is assigned to this area with manage permissions
  if (userRole === "EMPLOYEE") {
    const employeeArea = await prisma.employeeArea.findUnique({
      where: {
        employeeId_areaId: {
          employeeId: userId,
          areaId: areaId,
        },
      },
    });

    return employeeArea?.canManage === true;
  }

  return false;
}

// Role-based feature access
export const FEATURE_ACCESS = {
  viewEmployeeTab: ["ADMIN", "SUPERADMIN"],
  viewAgentTab: ["ADMIN", "SUPERADMIN"], // Legacy alias
  createEmployees: ["ADMIN", "SUPERADMIN"],
  createAgents: ["ADMIN", "SUPERADMIN"], // Legacy alias
  assignEmployeesToAreas: ["ADMIN", "SUPERADMIN"],
  assignPermissions: ["ADMIN", "SUPERADMIN"], // Legacy alias
  createProperties: ["EMPLOYEE", "ADMIN", "SUPERADMIN"],
  viewAllProperties: ["ADMIN", "SUPERADMIN"],
  manageSettings: ["ADMIN", "SUPERADMIN"],
  viewDocuments: ["EMPLOYEE", "ADMIN", "SUPERADMIN"],
  manageLeads: ["EMPLOYEE", "ADMIN", "SUPERADMIN"],
  viewTransactions: ["EMPLOYEE", "ADMIN", "SUPERADMIN"],
  manageCompany: ["ADMIN", "SUPERADMIN"],
  manageAreas: ["ADMIN", "SUPERADMIN"],
  sendMessages: ["EMPLOYEE", "ADMIN", "SUPERADMIN"],
} as const;

export function hasFeatureAccess(
  userRole: UserRole,
  feature: keyof typeof FEATURE_ACCESS
): boolean {
  return FEATURE_ACCESS[feature].includes(userRole);
}

// Get employee's assigned areas
export async function getEmployeeAreas(userId: string) {
  return await prisma.employeeArea.findMany({
    where: { employeeId: userId },
    include: {
      area: {
        include: {
          country: true,
        },
      },
    },
  });
}

// Check if employee is area lead
export async function isAreaLead(userId: string, areaId: string): Promise<boolean> {
  const employeeArea = await prisma.employeeArea.findUnique({
    where: {
      employeeId_areaId: {
        employeeId: userId,
        areaId: areaId,
      },
    },
  });

  return employeeArea?.isLead === true;
}
