import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { router, t } from "../trpc";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TRPCError } from "@trpc/server";
import { hasFeatureAccess, UserRole } from "@/lib/rbac";

export const transactionRouter = router({
  // Create a new transaction (Employee/Admin only)
  create: t.procedure
    .input(
      z.object({
        customerId: z.string(),
        propertyId: z.string(),
        type: z.enum(["RENT", "PURCHASE"]),
        amount: z.number().positive(),
        currency: z.string().default("USD"),
        paymentMethod: z.string().optional(),
        contractStartDate: z.date().optional(),
        contractEndDate: z.date().optional(),
        notes: z.string().optional(),
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

      if (!user || !hasFeatureAccess(user.role as UserRole, "viewTransactions")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only EMPLOYEE, ADMIN, or SUPERADMIN can create transactions",
        });
      }

      // Verify customer exists
      const customer = await prisma.user.findUnique({
        where: { id: input.customerId, role: "CUSTOMER" },
      });

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found",
        });
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

      return await prisma.transaction.create({
        data: {
          customerId: input.customerId,
          propertyId: input.propertyId,
          type: input.type,
          amount: input.amount,
          currency: input.currency,
          paymentMethod: input.paymentMethod,
          contractStartDate: input.contractStartDate,
          contractEndDate: input.contractEndDate,
          notes: input.notes,
          status: "PENDING",
          documents: [],
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

  // List transactions with filters (Employee/Admin only)
  list: t.procedure
    .input(
      z
        .object({
          status: z.enum(["PENDING", "APPROVED", "COMPLETED", "CANCELLED", "REFUNDED"]).optional(),
          type: z.enum(["RENT", "PURCHASE"]).optional(),
          customerId: z.string().optional(),
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

      if (!user || !hasFeatureAccess(user.role as UserRole, "viewTransactions")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only EMPLOYEE, ADMIN, or SUPERADMIN can view transactions",
        });
      }

      const where: any = {};

      if (input?.status) {
        where.status = input.status;
      }

      if (input?.type) {
        where.type = input.type;
      }

      if (input?.customerId) {
        where.customerId = input.customerId;
      }

      if (input?.propertyId) {
        where.propertyId = input.propertyId;
      }

      return await prisma.transaction.findMany({
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
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Get transaction by ID
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

      if (!user || !hasFeatureAccess(user.role as UserRole, "viewTransactions")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only EMPLOYEE, ADMIN, or SUPERADMIN can view transaction details",
        });
      }

      const transaction = await prisma.transaction.findUnique({
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
              bedrooms: true,
              bathrooms: true,
              area: true,
            },
          },
        },
      });

      if (!transaction) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transaction not found",
        });
      }

      return transaction;
    }),

  // Update transaction (Employee/Admin only)
  update: t.procedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["PENDING", "APPROVED", "COMPLETED", "CANCELLED", "REFUNDED"]).optional(),
        paymentDate: z.date().optional(),
        documents: z.array(z.string().url()).optional(),
        paymentMethod: z.string().optional(),
        notes: z.string().optional(),
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

      if (!user || !hasFeatureAccess(user.role as UserRole, "viewTransactions")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only EMPLOYEE, ADMIN, or SUPERADMIN can update transactions",
        });
      }

      // Check if transaction exists
      const transaction = await prisma.transaction.findUnique({
        where: { id: input.id },
      });

      if (!transaction) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transaction not found",
        });
      }

      const { id, ...updateData } = input;

      return await prisma.transaction.update({
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

  // Update transaction status (Employee/Admin only)
  updateStatus: t.procedure
    .input(
      z.object({
        transactionId: z.string(),
        status: z.enum(["PENDING", "APPROVED", "COMPLETED", "CANCELLED", "REFUNDED"]),
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

      if (!user || !hasFeatureAccess(user.role as UserRole, "viewTransactions")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only EMPLOYEE, ADMIN, or SUPERADMIN can update transaction status",
        });
      }

      // Check if transaction exists
      const transaction = await prisma.transaction.findUnique({
        where: { id: input.transactionId },
      });

      if (!transaction) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transaction not found",
        });
      }

      return await prisma.transaction.update({
        where: { id: input.transactionId },
        data: { status: input.status },
      });
    }),

  // Get transactions by property
  getByProperty: t.procedure
    .input(z.object({ propertyId: z.string() }))
    .query(async ({ input }) => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (!user || !hasFeatureAccess(user.role as UserRole, "viewTransactions")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only EMPLOYEE, ADMIN, or SUPERADMIN can view transactions",
        });
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

      return await prisma.transaction.findMany({
        where: { propertyId: input.propertyId },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Get transactions by customer
  getByCustomer: t.procedure
    .input(z.object({ customerId: z.string() }))
    .query(async ({ input }) => {
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

      // Customers can only view their own transactions
      if (user.role === "CUSTOMER" && user.id !== input.customerId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only view your own transactions",
        });
      }

      // Employees/Admin need proper permissions
      if (user.role !== "CUSTOMER" && !hasFeatureAccess(user.role as UserRole, "viewTransactions")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient permissions",
        });
      }

      // Verify customer exists
      const customer = await prisma.user.findUnique({
        where: { id: input.customerId },
      });

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found",
        });
      }

      return await prisma.transaction.findMany({
        where: { customerId: input.customerId },
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
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Get transaction statistics (Employee/Admin only)
  getStats: t.procedure.query(async () => {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !hasFeatureAccess(user.role as UserRole, "viewTransactions")) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only EMPLOYEE, ADMIN, or SUPERADMIN can view transaction statistics",
      });
    }

    // Get total transactions count
    const totalTransactions = await prisma.transaction.count();

    // Get transactions by status
    const transactionsByStatus = await prisma.transaction.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    // Get transactions by type
    const transactionsByType = await prisma.transaction.groupBy({
      by: ["type"],
      _count: {
        id: true,
      },
    });

    // Calculate total revenue
    const completedTransactions = await prisma.transaction.findMany({
      where: { status: "COMPLETED" },
      select: { amount: true },
    });

    const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Get average transaction amount
    const averageAmount = totalTransactions > 0 ? totalRevenue / completedTransactions.length : 0;

    return {
      totalTransactions,
      totalRevenue,
      averageAmount: parseFloat(averageAmount.toFixed(2)),
      completedCount: completedTransactions.length,
      transactionsByStatus: transactionsByStatus.map((item) => ({
        status: item.status,
        count: item._count.id,
      })),
      transactionsByType: transactionsByType.map((item) => ({
        type: item.type,
        count: item._count.id,
      })),
    };
  }),
});
