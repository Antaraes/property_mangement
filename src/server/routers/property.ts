import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { router, t } from "../trpc";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Property Router
export const propertyRouter = router({
  list: t.procedure.input(z.any()).query(async ({ input }) => {
    const {
      purpose,
      propertyType,
      paidType,
      location,
      priceRange,
      bedrooms,
      bathrooms,
      area,
      name,
    } = input;
    console.log(typeof input["priceRange.max"]);

    console.log("Received Price Range:", priceRange); // Debugging

    // Ensure numbers are correctly formatted before querying
    const minPrice =
      input["priceRange.min"] !== undefined
        ? Number(input["priceRange.min"])
        : undefined;
    const maxPrice =
      input["priceRange.max"] !== undefined
        ? Number(input["priceRange.max"])
        : undefined;

    console.log("Filtered Price Min:", minPrice, "Max:", maxPrice); // Debugging

    const properties = await prisma.property.findMany({
      where: {
        AND: [
          name ? { name } : {},
          purpose ? { purpose } : {},
          propertyType ? { propertyType } : {},
          paidType ? { paidType } : {},
          location
            ? { location: { contains: location, mode: "insensitive" } }
            : {},
          minPrice !== undefined ? { price: { gte: minPrice } } : {},
          maxPrice !== undefined ? { price: { lte: maxPrice } } : {},
          bedrooms !== undefined && bathrooms !== "" ? { bedrooms } : {},
          bathrooms !== undefined && bathrooms !== "" ? { bathrooms } : {},
          area?.min !== undefined ? { area: { gte: area.min } } : {},
          area?.max !== undefined ? { area: { lte: area.max } } : {},
        ],
      },
    });

    return properties;
  }),
  getRelatedProperties: t.procedure
    .input(z.object({ id: z.string() })) // Ensure ID is a string
    .query(async ({ input }) => {
      const mainProperty = await prisma.property.findUnique({
        where: { id: input.id },
      });

      if (!mainProperty) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Property not found",
        });
      }

      const relatedProperties = await prisma.property.findMany({
        where: {
          AND: [
            // { location: { contains: mainProperty.location, mode: "insensitive" } },
            // { propertyType: mainProperty.propertyType },
            { purpose: mainProperty.purpose },
            { id: { not: input.id } },
          ],
        },
        take: 4,
      });

      return relatedProperties;
    }),

  getById: t.procedure
    .input(z.object({ id: z.string() })) // Ensure ID is a string
    .query(async ({ input }) => {
      const property = await prisma.property.findUnique({
        where: { id: input.id },
      });

      if (!property) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Property not found",
        });
      }

      return property;
    }),

  create: t.procedure
    .input(
      z.object({
        name: z.string(),
        location: z.string(),
        price: z.number().positive(),
        description: z.string(),
        images: z.array(z.string().url()),
        bedrooms: z.number().min(1),
        bathrooms: z.number().min(1),
        area: z.number().positive(),
        purpose: z.enum(["RENT", "BUY"]),
        paidType: z.enum(["YEARLY", "MONTHLY", "WEEKLY", "DAILY", "ONCE"]),
        propertyType: z.enum(["APARTMENT", "HOUSE", "VILLA", "COMMERCIAL", "LAND", "OFFICE"]),
      })
    )
    .mutation(async ({ input }) => {
      console.log(input);
      const session = await getServerSession(authOptions);
      console.log(session);

      // Ensure user is authenticated
      if (!session || !session.user?.id) {
        if (!session || !session.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Unauthorized",
          });
        }
      }

      // Fetch user from the database
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, role: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // Restrict property creation based on role
      if (!["EMPLOYEE", "ADMIN", "SUPERADMIN"].includes(user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only EMPLOYEE, ADMIN, or SUPERADMIN can create a property",
        });
      }

      // Get user's company
      const userWithCompany = await prisma.user.findUnique({
        where: { id: user.id },
        select: { companyId: true },
      });

      if (!userWithCompany?.companyId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User must be assigned to a company to create properties",
        });
      }

      return await prisma.property.create({
        data: {
          ...input,
          companyId: userWithCompany.companyId,
          assignedToId: user.role === "EMPLOYEE" ? user.id : null,
          status: "AVAILABLE",
        },
      });
    }),

  update: t.procedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        location: z.string().optional(),
        price: z.number().positive().optional(),
        description: z.string().optional(),
        images: z.array(z.string().url()).optional(),
        bedrooms: z.number().min(1).optional(),
        bathrooms: z.number().min(1).optional(),
        area: z.number().positive().optional(),
        purpose: z.enum(["RENT", "BUY"]).optional(),
        paidType: z.enum(["YEARLY", "MONTHLY", "WEEKLY", "DAILY"]).optional(),
        propertyType: z
          .enum(["APARTMENT", "HOUSE", "VILLA", "COMMERCIAL", "LAND", "OFFICE"])
          .optional(),
        status: z.enum(["AVAILABLE", "RESERVED", "SOLD", "RENTED", "MAINTENANCE", "UNAVAILABLE"]).optional(),
        assignedToId: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      // Check if property exists
      const property = await prisma.property.findUnique({
        where: { id: input.id },
      });

      if (!property) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Property not found",
        });
      }

      // Get user info
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, role: true, companyId: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // ADMIN and SUPERADMIN can update all properties
      if (user.role === "ADMIN" || user.role === "SUPERADMIN") {
        const { id, ...updateData } = input;
        return await prisma.property.update({
          where: { id },
          data: updateData,
        });
      }

      // For employees, check if they have access via area or direct assignment
      if (user.role === "EMPLOYEE") {
        // Check if assigned directly to property
        if (property.assignedToId === user.id) {
          const { id, ...updateData } = input;
          return await prisma.property.update({
            where: { id },
            data: updateData,
          });
        }

        // Check if employee has access via area assignment
        if (property.areaId) {
          const employeeArea = await prisma.employeeArea.findUnique({
            where: {
              employeeId_areaId: {
                employeeId: user.id,
                areaId: property.areaId,
              },
            },
          });

          if (employeeArea && employeeArea.canManage) {
            const { id, ...updateData } = input;
            return await prisma.property.update({
              where: { id },
              data: updateData,
            });
          }
        }
      }

      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to update this property",
      });
    }),

  delete: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      // Check if property exists
      const property = await prisma.property.findUnique({
        where: { id: input.id },
      });

      if (!property) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Property not found",
        });
      }

      // Get user info
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, role: true, companyId: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // ADMIN and SUPERADMIN can delete all properties
      if (user.role === "ADMIN" || user.role === "SUPERADMIN") {
        await prisma.property.delete({
          where: { id: input.id },
        });
        return { success: true, message: "Property deleted successfully" };
      }

      // For employees, check if they have access via area or direct assignment
      if (user.role === "EMPLOYEE") {
        // Check if assigned directly to property
        if (property.assignedToId === user.id) {
          await prisma.property.delete({
            where: { id: input.id },
          });
          return { success: true, message: "Property deleted successfully" };
        }

        // Check if employee has access via area assignment
        if (property.areaId) {
          const employeeArea = await prisma.employeeArea.findUnique({
            where: {
              employeeId_areaId: {
                employeeId: user.id,
                areaId: property.areaId,
              },
            },
          });

          if (employeeArea && employeeArea.canManage) {
            await prisma.property.delete({
              where: { id: input.id },
            });
            return { success: true, message: "Property deleted successfully" };
          }
        }
      }

      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to delete this property",
      });
    }),

  getMyProperties: t.procedure.query(async () => {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, companyId: true },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    // ADMIN and SUPERADMIN can see all properties in their company
    if (["ADMIN", "SUPERADMIN"].includes(user.role)) {
      const where = user.companyId ? { companyId: user.companyId } : {};

      return await prisma.property.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          areaLocation: {
            select: {
              id: true,
              name: true,
              country: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });
    }

    // EMPLOYEE can see properties they're assigned to or in their areas
    if (user.role === "EMPLOYEE") {
      // Get employee's assigned areas
      const employeeAreas = await prisma.employeeArea.findMany({
        where: {
          employeeId: user.id,
          canManage: true,
        },
        select: {
          areaId: true,
        },
      });

      const areaIds = employeeAreas.map((ea) => ea.areaId);

      return await prisma.property.findMany({
        where: {
          OR: [
            { assignedToId: user.id }, // Directly assigned properties
            { areaId: { in: areaIds } }, // Properties in managed areas
          ],
        },
        orderBy: { createdAt: "desc" },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          areaLocation: {
            select: {
              id: true,
              name: true,
              country: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });
    }

    // CUSTOMER - return empty array or could return properties they're interested in
    return [];
  }),
  bulkImport: t.procedure
    .input(
      z.object({
        properties: z.array(
          z.object({
            name: z.string(),
            location: z.string(),
            price: z.number().positive(),
            description: z.string(),
            images: z.array(z.string().url()),
            bedrooms: z.number().min(1),
            bathrooms: z.number().min(1),
            area: z.number().positive(),
            purpose: z.enum(["RENT", "BUY"]),
            paidType: z.enum(["YEARLY", "MONTHLY", "WEEKLY", "DAILY", "ONCE"]),
            propertyType: z.enum(["APARTMENT", "HOUSE", "VILLA", "COMMERCIAL", "LAND", "OFFICE"]),
            areaId: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, role: true, companyId: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      if (!["EMPLOYEE", "ADMIN", "SUPERADMIN"].includes(user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only EMPLOYEE, ADMIN, or SUPERADMIN can import properties",
        });
      }

      if (!user.companyId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User must be assigned to a company to import properties",
        });
      }

      // Bulk create properties
      const createdProperties = await prisma.$transaction(
        input.properties.map((property) =>
          prisma.property.create({
            data: {
              ...property,
              companyId: user.companyId!,
              assignedToId: user.role === "EMPLOYEE" ? user.id : null,
              status: "AVAILABLE",
            },
          })
        )
      );

      return {
        success: true,
        count: createdProperties.length,
        properties: createdProperties,
      };
    }),
});

import { inferAsyncReturnType, TRPCError } from "@trpc/server";
import type { NextApiRequest, NextApiResponse } from "next";

export async function createContext({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) {
  const session = await getServerSession(req, res, authOptions);
  return { req, res, session, prisma };
}

export type Context = inferAsyncReturnType<typeof createContext>;
