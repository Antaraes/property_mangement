import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { router, t } from "../trpc";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TRPCError } from "@trpc/server";
import { canManageEmployees, UserRole } from "@/lib/rbac";
import bcrypt from "bcrypt";

export const employeeRouter = router({
  // List all employees (Admin/Superadmin only)
  list: t.procedure.query(async () => {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, companyId: true },
    });

    if (!user || !canManageEmployees(user.role as UserRole)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only ADMIN or SUPERADMIN can view employees",
      });
    }

    const where = user.companyId ? { role: "EMPLOYEE", companyId: user.companyId } : { role: "EMPLOYEE" };

    return await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        first_name: true,
        last_name: true,
        phone: true,
        companyId: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedAreas: {
          include: {
            area: {
              include: {
                country: true,
              },
            },
          },
        },
        assignedProperties: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Get employee by ID with details
  getById: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (!user || !canManageEmployees(user.role as UserRole)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only ADMIN or SUPERADMIN can view employee details",
        });
      }

      const employee = await prisma.user.findUnique({
        where: { id: input.id, role: "EMPLOYEE" },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          first_name: true,
          last_name: true,
          phone: true,
          companyId: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          assignedAreas: {
            include: {
              area: {
                include: {
                  country: true,
                },
              },
            },
          },
          assignedProperties: {
            include: {
              areaLocation: {
                include: {
                  country: true,
                },
              },
            },
          },
          managedLeads: {
            select: {
              id: true,
              status: true,
              createdAt: true,
            },
          },
          createdAt: true,
        },
      });

      if (!employee) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found" });
      }

      return employee;
    }),

  // Create a new employee (Admin/Superadmin only)
  create: t.procedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        phone: z.string().optional(),
        companyId: z.string(),
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

      if (!user || !canManageEmployees(user.role as UserRole)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only ADMIN or SUPERADMIN can create employees",
        });
      }

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(input.password, 10);

      return await prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          first_name: input.first_name,
          last_name: input.last_name,
          phone: input.phone,
          role: "EMPLOYEE",
          companyId: input.companyId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          first_name: true,
          last_name: true,
          phone: true,
          role: true,
          companyId: true,
          createdAt: true,
        },
      });
    }),

  // Update employee information
  update: t.procedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        phone: z.string().optional(),
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

      if (!user || !canManageEmployees(user.role as UserRole)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only ADMIN or SUPERADMIN can update employees",
        });
      }

      const { id, ...updateData } = input;

      return await prisma.user.update({
        where: { id, role: "EMPLOYEE" },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          first_name: true,
          last_name: true,
          phone: true,
        },
      });
    }),

  // Delete an employee
  delete: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (!user || !canManageEmployees(user.role as UserRole)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only ADMIN or SUPERADMIN can delete employees",
        });
      }

      // Check if employee exists
      const employee = await prisma.user.findUnique({
        where: { id: input.id, role: "EMPLOYEE" },
      });

      if (!employee) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found" });
      }

      // Delete employee (area assignments will be cascade deleted)
      await prisma.user.delete({
        where: { id: input.id },
      });

      return { success: true, message: "Employee deleted successfully" };
    }),

  // Assign employee to area
  assignToArea: t.procedure
    .input(
      z.object({
        employeeId: z.string(),
        areaId: z.string(),
        canManage: z.boolean().default(true),
        isLead: z.boolean().default(false),
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

      if (!user || !canManageEmployees(user.role as UserRole)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only ADMIN or SUPERADMIN can assign employees to areas",
        });
      }

      // Verify employee exists
      const employee = await prisma.user.findUnique({
        where: { id: input.employeeId, role: "EMPLOYEE" },
      });

      if (!employee) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found" });
      }

      // Verify area exists
      const area = await prisma.area.findUnique({
        where: { id: input.areaId },
      });

      if (!area) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Area not found",
        });
      }

      // Create or update assignment
      return await prisma.employeeArea.upsert({
        where: {
          employeeId_areaId: {
            employeeId: input.employeeId,
            areaId: input.areaId,
          },
        },
        create: {
          employeeId: input.employeeId,
          areaId: input.areaId,
          canManage: input.canManage,
          isLead: input.isLead,
        },
        update: {
          canManage: input.canManage,
          isLead: input.isLead,
        },
        include: {
          area: {
            include: {
              country: true,
            },
          },
        },
      });
    }),

  // Remove employee from area
  removeFromArea: t.procedure
    .input(
      z.object({
        employeeId: z.string(),
        areaId: z.string(),
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

      if (!user || !canManageEmployees(user.role as UserRole)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only ADMIN or SUPERADMIN can remove employees from areas",
        });
      }

      await prisma.employeeArea.delete({
        where: {
          employeeId_areaId: {
            employeeId: input.employeeId,
            areaId: input.areaId,
          },
        },
      });

      return { success: true, message: "Employee removed from area successfully" };
    }),

  // Get employee's assigned areas
  getEmployeeAreas: t.procedure
    .input(z.object({ employeeId: z.string() }))
    .query(async ({ input }) => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      return await prisma.employeeArea.findMany({
        where: { employeeId: input.employeeId },
        include: {
          area: {
            include: {
              country: true,
              properties: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    }),

  // Get all available areas for assignment
  getAvailableAreas: t.procedure.query(async () => {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !canManageEmployees(user.role as UserRole)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only ADMIN or SUPERADMIN can view areas",
      });
    }

    return await prisma.area.findMany({
      include: {
        country: true,
        properties: {
          select: {
            id: true,
          },
        },
        employeeAssignments: {
          include: {
            employee: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),
});
