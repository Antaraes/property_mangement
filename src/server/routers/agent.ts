import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { router, t } from "../trpc";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TRPCError } from "@trpc/server";
import { canManageAgents, UserRole } from "@/lib/rbac";
import bcrypt from "bcrypt";

export const agentRouter = router({
  // List all agents (Admin/Superadmin only)
  list: t.procedure.query(async () => {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !canManageAgents(user.role as UserRole)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only ADMIN or SUPERADMIN can view agents",
      });
    }

    return await prisma.user.findMany({
      where: { role: "AGENT" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        first_name: true,
        last_name: true,
        createdAt: true,
        agentPermissions: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
                location: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Get agent by ID with permissions
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

      if (!user || !canManageAgents(user.role as UserRole)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only ADMIN or SUPERADMIN can view agent details",
        });
      }

      const agent = await prisma.user.findUnique({
        where: { id: input.id, role: "AGENT" },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          first_name: true,
          last_name: true,
          createdAt: true,
          agentPermissions: {
            include: {
              property: true,
              createdBy: {
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

      if (!agent) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
      }

      return agent;
    }),

  // Create a new agent (Admin/Superadmin only)
  create: t.procedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
        first_name: z.string().optional(),
        last_name: z.string().optional(),
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

      if (!user || !canManageAgents(user.role as UserRole)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only ADMIN or SUPERADMIN can create agents",
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
          role: "AGENT",
        },
        select: {
          id: true,
          name: true,
          email: true,
          first_name: true,
          last_name: true,
          role: true,
          createdAt: true,
        },
      });
    }),

  // Update agent information
  update: t.procedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        first_name: z.string().optional(),
        last_name: z.string().optional(),
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

      if (!user || !canManageAgents(user.role as UserRole)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only ADMIN or SUPERADMIN can update agents",
        });
      }

      const { id, ...updateData } = input;

      return await prisma.user.update({
        where: { id, role: "AGENT" },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          first_name: true,
          last_name: true,
        },
      });
    }),

  // Delete an agent
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

      if (!user || !canManageAgents(user.role as UserRole)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only ADMIN or SUPERADMIN can delete agents",
        });
      }

      // Check if agent exists
      const agent = await prisma.user.findUnique({
        where: { id: input.id, role: "AGENT" },
      });

      if (!agent) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
      }

      // Delete agent (permissions will be cascade deleted)
      await prisma.user.delete({
        where: { id: input.id },
      });

      return { success: true, message: "Agent deleted successfully" };
    }),

  // Assign property permissions to an agent
  assignPermission: t.procedure
    .input(
      z.object({
        agentId: z.string(),
        propertyId: z.string(),
        canView: z.boolean().default(true),
        canEdit: z.boolean().default(false),
        canDelete: z.boolean().default(false),
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

      if (!user || !canManageAgents(user.role as UserRole)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only ADMIN or SUPERADMIN can assign permissions",
        });
      }

      // Verify agent exists
      const agent = await prisma.user.findUnique({
        where: { id: input.agentId, role: "AGENT" },
      });

      if (!agent) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
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

      // Create or update permission
      return await prisma.agentPermission.upsert({
        where: {
          agentId_propertyId: {
            agentId: input.agentId,
            propertyId: input.propertyId,
          },
        },
        create: {
          agentId: input.agentId,
          propertyId: input.propertyId,
          canView: input.canView,
          canEdit: input.canEdit,
          canDelete: input.canDelete,
          createdById: session.user.id,
        },
        update: {
          canView: input.canView,
          canEdit: input.canEdit,
          canDelete: input.canDelete,
        },
      });
    }),

  // Remove permission
  removePermission: t.procedure
    .input(
      z.object({
        agentId: z.string(),
        propertyId: z.string(),
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

      if (!user || !canManageAgents(user.role as UserRole)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only ADMIN or SUPERADMIN can remove permissions",
        });
      }

      await prisma.agentPermission.delete({
        where: {
          agentId_propertyId: {
            agentId: input.agentId,
            propertyId: input.propertyId,
          },
        },
      });

      return { success: true, message: "Permission removed successfully" };
    }),

  // Get all available properties for assignment
  getAvailableProperties: t.procedure.query(async () => {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !canManageAgents(user.role as UserRole)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only ADMIN or SUPERADMIN can view properties",
      });
    }

    return await prisma.property.findMany({
      select: {
        id: true,
        name: true,
        location: true,
        propertyType: true,
        purpose: true,
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),
});
