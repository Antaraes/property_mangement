import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { router, t } from "../trpc";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TRPCError } from "@trpc/server";
import { canManageEmployees, UserRole } from "@/lib/rbac";

export const areaRouter = router({
  // List all areas with optional country filter
  list: t.procedure
    .input(
      z
        .object({
          countryId: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      const where = input?.countryId ? { countryId: input.countryId } : {};

      return await prisma.area.findMany({
        where,
        include: {
          country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          properties: {
            select: {
              id: true,
            },
          },
          employeeAssignments: {
            select: {
              id: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Get area by ID
  getById: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      const area = await prisma.area.findUnique({
        where: { id: input.id },
        include: {
          country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          properties: {
            include: {
              assignedTo: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          employeeAssignments: {
            include: {
              employee: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!area) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Area not found" });
      }

      return area;
    }),

  // Create a new area (Admin/Superadmin only)
  create: t.procedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        countryId: z.string(),
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
          message: "Only ADMIN or SUPERADMIN can create areas",
        });
      }

      // Verify country exists
      const country = await prisma.country.findUnique({
        where: { id: input.countryId },
      });

      if (!country) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Country not found",
        });
      }

      return await prisma.area.create({
        data: {
          name: input.name,
          description: input.description,
          countryId: input.countryId,
        },
        include: {
          country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });
    }),

  // Update area (Admin/Superadmin only)
  update: t.procedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        countryId: z.string().optional(),
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
          message: "Only ADMIN or SUPERADMIN can update areas",
        });
      }

      // Check if area exists
      const area = await prisma.area.findUnique({
        where: { id: input.id },
      });

      if (!area) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Area not found" });
      }

      // If updating country, verify it exists
      if (input.countryId) {
        const country = await prisma.country.findUnique({
          where: { id: input.countryId },
        });

        if (!country) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Country not found",
          });
        }
      }

      const { id, ...updateData } = input;

      return await prisma.area.update({
        where: { id },
        data: updateData,
        include: {
          country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });
    }),

  // Delete area (Admin/Superadmin only)
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
          message: "Only ADMIN or SUPERADMIN can delete areas",
        });
      }

      // Check if area exists
      const area = await prisma.area.findUnique({
        where: { id: input.id },
      });

      if (!area) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Area not found" });
      }

      // Delete area (cascade will handle employee assignments)
      await prisma.area.delete({
        where: { id: input.id },
      });

      return { success: true, message: "Area deleted successfully" };
    }),

  // Get properties in area
  getProperties: t.procedure
    .input(z.object({ areaId: z.string() }))
    .query(async ({ input }) => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      // Verify area exists
      const area = await prisma.area.findUnique({
        where: { id: input.areaId },
      });

      if (!area) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Area not found" });
      }

      return await prisma.property.findMany({
        where: { areaId: input.areaId },
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Get employees assigned to area
  getEmployees: t.procedure
    .input(z.object({ areaId: z.string() }))
    .query(async ({ input }) => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      // Verify area exists
      const area = await prisma.area.findUnique({
        where: { id: input.areaId },
      });

      if (!area) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Area not found" });
      }

      return await prisma.employeeArea.findMany({
        where: { areaId: input.areaId },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              first_name: true,
              last_name: true,
              image: true,
              assignedProperties: {
                where: { areaId: input.areaId },
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { assignedAt: "desc" },
      });
    }),
});
