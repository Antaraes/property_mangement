import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { router, t } from "../trpc";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TRPCError } from "@trpc/server";

export const messageRouter = router({
  // Send a message
  send: t.procedure
    .input(
      z.object({
        receiverId: z.string(),
        subject: z.string().optional(),
        content: z.string().min(1),
        propertyId: z.string().optional(),
        leadId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      // Verify receiver exists
      const receiver = await prisma.user.findUnique({
        where: { id: input.receiverId },
      });

      if (!receiver) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Receiver not found",
        });
      }

      return await prisma.message.create({
        data: {
          senderId: session.user.id,
          receiverId: input.receiverId,
          subject: input.subject,
          content: input.content,
          propertyId: input.propertyId,
          leadId: input.leadId,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });
    }),

  // List messages (inbox)
  list: t.procedure
    .input(
      z.object({
        folder: z.enum(["inbox", "sent"]).default("inbox"),
        read: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      const where =
        input.folder === "inbox"
          ? {
              receiverId: session.user.id,
              ...(input.read !== undefined && { read: input.read }),
            }
          : {
              senderId: session.user.id,
            };

      const [messages, total] = await Promise.all([
        prisma.message.findMany({
          where,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            receiver: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: input.limit,
          skip: input.offset,
        }),
        prisma.message.count({ where }),
      ]);

      return {
        messages,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Get message by ID
  getById: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      const message = await prisma.message.findUnique({
        where: { id: input.id },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      if (!message) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Message not found" });
      }

      // Only sender or receiver can view message
      if (
        message.senderId !== session.user.id &&
        message.receiverId !== session.user.id
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view this message",
        });
      }

      // Mark as read if receiver is viewing
      if (message.receiverId === session.user.id && !message.read) {
        await prisma.message.update({
          where: { id: input.id },
          data: { read: true },
        });
      }

      return message;
    }),

  // Mark message as read
  markAsRead: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      const message = await prisma.message.findUnique({
        where: { id: input.id },
      });

      if (!message) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Message not found" });
      }

      // Only receiver can mark as read
      if (message.receiverId !== session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the receiver can mark message as read",
        });
      }

      return await prisma.message.update({
        where: { id: input.id },
        data: { read: true },
      });
    }),

  // Mark multiple messages as read
  markMultipleAsRead: t.procedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      const result = await prisma.message.updateMany({
        where: {
          id: { in: input.ids },
          receiverId: session.user.id,
        },
        data: { read: true },
      });

      return {
        success: true,
        count: result.count,
        message: `${result.count} message(s) marked as read`,
      };
    }),

  // Delete message
  delete: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      const message = await prisma.message.findUnique({
        where: { id: input.id },
      });

      if (!message) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Message not found" });
      }

      // Only sender or receiver can delete
      if (
        message.senderId !== session.user.id &&
        message.receiverId !== session.user.id
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this message",
        });
      }

      await prisma.message.delete({
        where: { id: input.id },
      });

      return { success: true, message: "Message deleted successfully" };
    }),

  // Get conversation between two users
  getConversation: t.procedure
    .input(
      z.object({
        otherUserId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      const [messages, total] = await Promise.all([
        prisma.message.findMany({
          where: {
            OR: [
              {
                senderId: session.user.id,
                receiverId: input.otherUserId,
              },
              {
                senderId: input.otherUserId,
                receiverId: session.user.id,
              },
            ],
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            receiver: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: input.limit,
          skip: input.offset,
        }),
        prisma.message.count({
          where: {
            OR: [
              {
                senderId: session.user.id,
                receiverId: input.otherUserId,
              },
              {
                senderId: input.otherUserId,
                receiverId: session.user.id,
              },
            ],
          },
        }),
      ]);

      // Mark unread messages from other user as read
      await prisma.message.updateMany({
        where: {
          senderId: input.otherUserId,
          receiverId: session.user.id,
          read: false,
        },
        data: { read: true },
      });

      return {
        messages,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Get unread message count
  getUnreadCount: t.procedure.query(async () => {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
    }

    const count = await prisma.message.count({
      where: {
        receiverId: session.user.id,
        read: false,
      },
    });

    return { count };
  }),

  // Get recent conversations
  getRecentConversations: t.procedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
    .query(async ({ input }) => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      // Get all messages involving the user
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: session.user.id },
            { receiverId: session.user.id },
          ],
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Group by conversation partner and get latest message
      const conversationMap = new Map();

      for (const message of messages) {
        const partnerId =
          message.senderId === session.user.id
            ? message.receiverId
            : message.senderId;

        if (!conversationMap.has(partnerId)) {
          const partner =
            message.senderId === session.user.id
              ? message.receiver
              : message.sender;

          const unreadCount = await prisma.message.count({
            where: {
              senderId: partnerId,
              receiverId: session.user.id,
              read: false,
            },
          });

          conversationMap.set(partnerId, {
            user: partner,
            lastMessage: message,
            unreadCount,
          });
        }
      }

      // Convert to array and limit
      const conversations = Array.from(conversationMap.values()).slice(
        0,
        input.limit
      );

      return conversations;
    }),
});
