import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { router, t } from "../trpc";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TRPCError } from "@trpc/server";
import { hasRole, UserRole } from "@/lib/rbac";

export const countryRouter = router({
  // List all countries
  list: t.procedure
    .input(z.object({ companyId: z.string().optional() }))
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

      const companyId = input.companyId || user.companyId;

      const where = companyId ? { companyId } : {};

      return await prisma.country.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              areas: true,
            },
          },
        },
        orderBy: { name: "asc" },
      });
    }),

  // Get country by ID
  getById: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      const country = await prisma.country.findUnique({
        where: { id: input.id },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          areas: {
            include: {
              _count: {
                select: {
                  properties: true,
                  employeeAssignments: true,
                },
              },
            },
          },
        },
      });

      if (!country) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Country not found" });
      }

      return country;
    }),

  // Create country (ADMIN and SUPERADMIN)
  create: t.procedure
    .input(
      z.object({
        name: z.string().min(1),
        code: z.string().optional(),
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
        select: { role: true, companyId: true },
      });

      if (!user || !hasRole(user.role as UserRole, "ADMIN")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only ADMIN or SUPERADMIN can create countries",
        });
      }

      // Ensure user can only create countries for their company unless SUPERADMIN
      if (user.role !== "SUPERADMIN" && input.companyId !== user.companyId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only create countries for your own company",
        });
      }

      return await prisma.country.create({
        data: input,
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }),

  // Update country
  update: t.procedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        code: z.string().optional(),
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

      if (!user || !hasRole(user.role as UserRole, "ADMIN")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only ADMIN or SUPERADMIN can update countries",
        });
      }

      const { id, ...updateData } = input;

      return await prisma.country.update({
        where: { id },
        data: updateData,
      });
    }),

  // Delete country
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

      if (!user || !hasRole(user.role as UserRole, "ADMIN")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only ADMIN or SUPERADMIN can delete countries",
        });
      }

      await prisma.country.delete({
        where: { id: input.id },
      });

      return { success: true, message: "Country deleted successfully" };
    }),

  // Get areas in a country
  getAreas: t.procedure
    .input(z.object({ countryId: z.string() }))
    .query(async ({ input }) => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      return await prisma.area.findMany({
        where: { countryId: input.countryId },
        include: {
          _count: {
            select: {
              properties: true,
              employeeAssignments: true,
            },
          },
        },
        orderBy: { name: "asc" },
      });
    }),
});
