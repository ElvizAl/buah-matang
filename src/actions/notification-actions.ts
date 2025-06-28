"use server"

import { auth } from "@/auth"
import { prisma } from "@/db/prisma"

export async function getOrderNotifications() {
  try {
    const session = await auth()
    if (!session || session.user?.role !== "admin") {
      return { error: "Unauthorized" }
    }

    // Get recent orders (last 24 hours) that are pending or new
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    const notifications = await prisma.order.findMany({
      where: {
        OR: [
          {
            status: "PROCESSING",
            createdAt: {
              gte: twentyFourHoursAgo,
            },
          },
          {
            status: "PROCESSING",
            updatedAt: {
              gte: twentyFourHoursAgo,
            },
          },
        ],
      },
      include: {
        customer: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    })

    // Get count of unread notifications (orders created in last 24h)
    const unreadCount = await prisma.order.count({
      where: {
        status: "PROCESSING",
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
    })

    return {
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    }
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return { error: "Failed to fetch notifications" }
  }
}

export async function markNotificationAsRead(orderId: string) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== "admin") {
      return { error: "Unauthorized" }
    }

    // This could be extended to have a separate notifications table
    // For now, we'll just update the order status if it's still pending
    await prisma.order.update({
      where: { id: orderId },
      data: { updatedAt: new Date() },
    })

    return { success: true }
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return { error: "Failed to mark notification as read" }
  }
}
