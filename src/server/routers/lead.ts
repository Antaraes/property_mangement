import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { router, t } from "../trpc";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TRPCError } from "@trpc/server";
import { hasFeatureAccess, UserRole } from "@/lib/rbac";

export const leadRouter = router({
  // Create a new lead (Customers can create, Employees/Admin can create on behalf)
  create: t.procedure
    .input(
      z.object({
        customerId: z.string().optional(), // Optional if employee creates on behalf
        propertyId: z.string(),
        message: z.string().optional(),
        phone: z.string().optional(),
        preferredContactMethod: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, role: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // Verify property exists
      const property = await prisma.property.findUnique({
        where: { id: input.propertyId },
      });

      if (!property) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Property not found",
        });
      }

      // Determine customerId based on role
      let customerId = input.customerId;
      if (user.role === "CUSTOMER") {
        customerId = user.id; // Customers create leads for themselves
      } else if (!customerId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "customerId is required when creating lead on behalf of customer",
        });
      }

      // Verify customer exists
      const customer = await prisma.user.findUnique({
        where: { id: customerId, role: "CUSTOMER" },
      });

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found",
        });
      }

      return await prisma.lead.create({
        data: {
          customerId,
          propertyId: input.propertyId,
          message: input.message,
          phone: input.phone,
          preferredContactMethod: input.preferredContactMethod,
          status: "PENDING",
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          property: {
            select: {
              id: true,
              name: true,
              location: true,
              price: true,
            },
          },
        },
      });
    }),

  // List leads with filters (Employee/Admin only)
  list: t.procedure
    .input(
      z
        .object({
          status: z.enum(["PENDING", "CONTACTED", "SCHEDULED", "NEGOTIATING", "CLOSED_WON", "CLOSED_LOST", "CANCELLED"]).optional(),
          assignedToId: z.string().optional(),
          propertyId: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (!user || !hasFeatureAccess(user.role as UserRole, "manageLeads")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only EMPLOYEE, ADMIN, or SUPERADMIN can view leads",
        });
      }

      const where: any = {};

      if (input?.status) {
        where.status = input.status;
      }

      if (input?.assignedToId) {
        where.assignedToId = input.assignedToId;
      }

      if (input?.propertyId) {
        where.propertyId = input.propertyId;
      }

      return await prisma.lead.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          property: {
            select: {
              id: true,
              name: true,
              location: true,
              price: true,
              status: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Get lead by ID
  getById: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      const lead = await prisma.lead.findUnique({
        where: { id: input.id },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              first_name: true,
              last_name: true,
            },
          },
          property: {
            select: {
              id: true,
              name: true,
              location: true,
              price: true,
              status: true,
              images: true,
              description: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      if (!lead) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lead not found" });
      }

      return lead;
    }),

  // Update lead (Employee/Admin only)
  update: t.procedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["PENDING", "CONTACTED", "SCHEDULED", "NEGOTIATING", "CLOSED_WON", "CLOSED_LOST", "CANCELLED"]).optional(),
        notes: z.string().optional(),
        followUpDate: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (!user || !hasFeatureAccess(user.role as UserRole, "manageLeads")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only EMPLOYEE, ADMIN, or SUPERADMIN can update leads",
        });
      }

      // Check if lead exists
      const lead = await prisma.lead.findUnique({
        where: { id: input.id },
      });

      if (!lead) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lead not found" });
      }

      const { id, ...updateData } = input;

      return await prisma.lead.update({
        where: { id },
        data: updateData,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          property: {
            select: {
              id: true,
              name: true,
              location: true,
            },
          },
        },
      });
    }),

  // Assign lead to employee (Admin only)
  assign: t.procedure
    .input(
      z.object({
        leadId: z.string(),
        employeeId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (!user || !hasFeatureAccess(user.role as UserRole, "manageLeads")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only EMPLOYEE, ADMIN, or SUPERADMIN can assign leads",
        });
      }

      // Verify lead exists
      const lead = await prisma.lead.findUnique({
        where: { id: input.leadId },
      });

      if (!lead) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lead not found" });
      }

      // Verify employee exists
      const employee = await prisma.user.findUnique({
        where: { id: input.employeeId, role: "EMPLOYEE" },
      });

      if (!employee) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Employee not found",
        });
      }

      return await prisma.lead.update({
        where: { id: input.leadId },
        data: { assignedToId: input.employeeId },
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }),

  // Update lead status (Employee/Admin only)
  updateStatus: t.procedure
    .input(
      z.object({
        leadId: z.string(),
        status: z.enum(["PENDING", "CONTACTED", "SCHEDULED", "NEGOTIATING", "CLOSED_WON", "CLOSED_LOST", "CANCELLED"]),
      })
    )
    .mutation(async ({ input }) => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (!user || !hasFeatureAccess(user.role as UserRole, "manageLeads")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only EMPLOYEE, ADMIN, or SUPERADMIN can update lead status",
        });
      }

      // Check if lead exists
      const lead = await prisma.lead.findUnique({
        where: { id: input.leadId },
      });

      if (!lead) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lead not found" });
      }

      return await prisma.lead.update({
        where: { id: input.leadId },
        data: { status: input.status },
      });
    }),

  // Get leads assigned to current employee
  getMyLeads: t.procedure.query(async () => {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    if (user.role === "CUSTOMER") {
      // Customers see their own leads
      return await prisma.lead.findMany({
        where: { customerId: user.id },
        include: {
          property: {
            select: {
              id: true,
              name: true,
              location: true,
              price: true,
              images: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    if (user.role === "EMPLOYEE") {
      // Employees see leads assigned to them
      return await prisma.lead.findMany({
        where: { assignedToId: user.id },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          property: {
            select: {
              id: true,
              name: true,
              location: true,
              price: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // Admin/Superadmin see all leads
    return await prisma.lead.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
            location: true,
            price: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Get lead statistics (Employee/Admin only)
  getStats: t.procedure.query(async () => {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !hasFeatureAccess(user.role as UserRole, "manageLeads")) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only EMPLOYEE, ADMIN, or SUPERADMIN can view lead statistics",
      });
    }

    // Get total leads count
    const totalLeads = await prisma.lead.count();

    // Get leads by status
    const leadsByStatus = await prisma.lead.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    // Get conversion rate
    const closedWonCount = await prisma.lead.count({
      where: { status: "CLOSED_WON" },
    });

    const conversionRate = totalLeads > 0 ? (closedWonCount / totalLeads) * 100 : 0;

    // Get leads by priority
    const leadsByPriority = await prisma.lead.groupBy({
      by: ["priority"],
      _count: {
        id: true,
      },
    });

    return {
      totalLeads,
      closedWonCount,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      leadsByStatus: leadsByStatus.map((item) => ({
        status: item.status,
        count: item._count.id,
      })),
      leadsByPriority: leadsByPriority.map((item) => ({
        priority: item.priority,
        count: item._count.id,
      })),
    };
  }),
});
