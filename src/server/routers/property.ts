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
        paidType: z.enum(["YEARLY", "MONTHLY", "WEEKLY", "DAILY"]),
        propertyType: z.enum(["APARTMENT", "HOUSE", "VILLA", "COMMERCIAL"]),
      })
    )
    .mutation(async ({ input, ctx }: { input: any; ctx: any }) => {
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
      if (!["AGENT", "ADMIN"].includes(user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only AGENT or ADMIN can create a property",
        });
      }

      return await prisma.property.create({
        data: {
          ...input,
          ownerType: user.role,
          ownerId: user.id, // Set ownerId from authenticated user
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
          .enum(["APARTMENT", "HOUSE", "VILLA", "COMMERCIAL"])
          .optional(),
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

      // Check if user owns the property or is admin
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, role: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      if (property.ownerId !== user.id && user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this property",
        });
      }

      const { id, ...updateData } = input;

      return await prisma.property.update({
        where: { id },
        data: updateData,
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

      // Check if user owns the property or is admin
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, role: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      if (property.ownerId !== user.id && user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this property",
        });
      }

      await prisma.property.delete({
        where: { id: input.id },
      });

      return { success: true, message: "Property deleted successfully" };
    }),

  getMyProperties: t.procedure.query(async () => {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
    }

    return await prisma.property.findMany({
      where: { ownerId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
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
            paidType: z.enum(["YEARLY", "MONTHLY", "WEEKLY", "DAILY"]),
            propertyType: z.enum(["APARTMENT", "HOUSE", "VILLA", "COMMERCIAL"]),
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
        select: { id: true, role: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      if (!["AGENT", "ADMIN"].includes(user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only AGENT or ADMIN can import properties",
        });
      }

      // Bulk create properties
      const createdProperties = await prisma.$transaction(
        input.properties.map((property) =>
          prisma.property.create({
            data: {
              ...property,
              ownerType: user.role,
              ownerId: user.id,
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
