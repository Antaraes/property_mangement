import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { router, t } from "../trpc";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TRPCError } from "@trpc/server";
import { hasRole, UserRole } from "@/lib/rbac";

export const companyRouter = router({
  // Get company details
  get: t.procedure
    .input(z.object({ id: z.string().optional() }))
    .query(async ({ input }) => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, companyId: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // If no ID provided, use user's company
      const companyId = input.id || user.companyId;

      if (!companyId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No company specified and user has no company",
        });
      }

      // Only allow viewing own company unless SUPERADMIN
      if (user.role !== "SUPERADMIN" && companyId !== user.companyId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only view your own company",
        });
      }

      const company = await prisma.company.findUnique({
        where: { id: companyId },
        include: {
          employees: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          properties: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          countries: {
            include: {
              areas: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!company) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Company not found" });
      }

      return company;
    }),

  // List all companies (SUPERADMIN only)
  list: t.procedure.query(async () => {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !hasRole(user.role as UserRole, "SUPERADMIN")) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only SUPERADMIN can view all companies",
      });
    }

    return await prisma.company.findMany({
      include: {
        _count: {
          select: {
            employees: true,
            properties: true,
            countries: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Create company (SUPERADMIN only)
  create: t.procedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        logo: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        website: z.string().optional(),
        address: z.string().optional(),
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

      if (!user || !hasRole(user.role as UserRole, "SUPERADMIN")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only SUPERADMIN can create companies",
        });
      }

      return await prisma.company.create({
        data: input,
      });
    }),

  // Update company (ADMIN and SUPERADMIN)
  update: t.procedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        logo: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        website: z.string().optional(),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, companyId: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // Only allow updating own company unless SUPERADMIN
      if (user.role !== "SUPERADMIN" && input.id !== user.companyId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only update your own company",
        });
      }

      if (!hasRole(user.role as UserRole, "ADMIN")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only ADMIN or SUPERADMIN can update companies",
        });
      }

      const { id, ...updateData } = input;

      return await prisma.company.update({
        where: { id },
        data: updateData,
      });
    }),

  // Delete company (SUPERADMIN only)
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

      if (!user || !hasRole(user.role as UserRole, "SUPERADMIN")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only SUPERADMIN can delete companies",
        });
      }

      await prisma.company.delete({
        where: { id: input.id },
      });

      return { success: true, message: "Company deleted successfully" };
    }),

  // Get company statistics
  getStats: t.procedure
    .input(z.object({ id: z.string().optional() }))
    .query(async ({ input }) => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, companyId: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const companyId = input.id || user.companyId;

      if (!companyId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No company specified",
        });
      }

      // Only allow viewing own company stats unless SUPERADMIN
      if (user.role !== "SUPERADMIN" && companyId !== user.companyId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only view your own company statistics",
        });
      }

      const [
        totalEmployees,
        totalProperties,
        availableProperties,
        totalLeads,
        activeLeads,
        totalTransactions,
        completedTransactions,
        totalCountries,
        totalAreas,
      ] = await Promise.all([
        prisma.user.count({ where: { companyId, role: "EMPLOYEE" } }),
        prisma.property.count({ where: { companyId } }),
        prisma.property.count({ where: { companyId, status: "AVAILABLE" } }),
        prisma.lead.count({
          where: {
            property: {
              companyId,
            },
          },
        }),
        prisma.lead.count({
          where: {
            property: {
              companyId,
            },
            status: {
              in: ["PENDING", "CONTACTED", "SCHEDULED", "NEGOTIATING"],
            },
          },
        }),
        prisma.transaction.count({
          where: {
            property: {
              companyId,
            },
          },
        }),
        prisma.transaction.count({
          where: {
            property: {
              companyId,
            },
            status: "COMPLETED",
          },
        }),
        prisma.country.count({ where: { companyId } }),
        prisma.area.count({
          where: {
            country: {
              companyId,
            },
          },
        }),
      ]);

      return {
        employees: {
          total: totalEmployees,
        },
        properties: {
          total: totalProperties,
          available: availableProperties,
          occupied: totalProperties - availableProperties,
        },
        leads: {
          total: totalLeads,
          active: activeLeads,
          closed: totalLeads - activeLeads,
        },
        transactions: {
          total: totalTransactions,
          completed: completedTransactions,
          pending: totalTransactions - completedTransactions,
        },
        geography: {
          countries: totalCountries,
          areas: totalAreas,
        },
      };
    }),
});
