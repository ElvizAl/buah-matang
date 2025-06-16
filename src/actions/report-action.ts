"use server"

import { prisma } from "@/db/prisma"

// Sales Report Actions
export async function getSalesSummary(startDate?: Date, endDate?: Date) {
  try {
    let dateFilter = {}
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      }
    }

    // Get total sales, order count, and average order value
    const [totalSales, orderCount, previousPeriodSales] = await Promise.all([
      // Current period sales
      prisma.order.aggregate({
        where: {
          ...dateFilter,
          status: { not: "CANCELLED" },
        },
        _sum: {
          total: true,
        },
        _count: {
          id: true,
        },
      }),

      // Total order count
      prisma.order.count({
        where: {
          ...dateFilter,
          status: { not: "CANCELLED" },
        },
      }),

      // Previous period sales (for comparison)
      // This is a simplified version - in real app, calculate previous period properly
      prisma.order.aggregate({
        where: {
          createdAt: {
            lt: startDate || new Date(),
          },
          status: { not: "CANCELLED" },
        },
        _sum: {
          total: true,
        },
      }),
    ])

    // Calculate average order value
    const averageOrderValue = totalSales._sum.total && orderCount > 0 ? totalSales._sum.total / orderCount : 0

    // Calculate growth percentage
    const previousTotal = previousPeriodSales._sum.total || 0
    const currentTotal = totalSales._sum.total || 0
    const growthPercentage = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0

    return {
      success: true,
      data: {
        totalSales: totalSales._sum.total || 0,
        orderCount: totalSales._count.id || 0,
        averageOrderValue,
        growthPercentage,
      },
    }
  } catch (error) {
    console.error("Error fetching sales summary:", error)
    return { error: "Failed to fetch sales summary" }
  }
}

export async function getSalesTrend(
  period: "daily" | "weekly" | "monthly" | "yearly",
  startDate?: Date,
  endDate?: Date,
) {
  try {
    // Default to last 12 months if no date range provided
    const start = startDate || new Date(new Date().setFullYear(new Date().getFullYear() - 1))
    const end = endDate || new Date()

    // Format SQL based on period
    let dateFormat
    let groupBy

    switch (period) {
      case "daily":
        dateFormat = "%Y-%m-%d"
        groupBy = "day"
        break
      case "weekly":
        dateFormat = "%Y-%u" // ISO week number
        groupBy = "week"
        break
      case "monthly":
        dateFormat = "%Y-%m"
        groupBy = "month"
        break
      case "yearly":
        dateFormat = "%Y"
        groupBy = "year"
        break
      default:
        dateFormat = "%Y-%m"
        groupBy = "month"
    }

    // Raw SQL query for date formatting and grouping
    // Note: This is PostgreSQL syntax - adjust for your database
    const salesTrend = await prisma.$queryRaw`
      SELECT 
        TO_CHAR(o."createdAt", ${dateFormat}) as period,
        SUM(o.total) as total,
        COUNT(o.id) as count
      FROM "Order" o
      WHERE o."createdAt" >= ${start} AND o."createdAt" <= ${end}
        AND o.status != 'CANCELLED'
      GROUP BY period
      ORDER BY period
    `

    return {
      success: true,
      data: salesTrend,
    }
  } catch (error) {
    console.error("Error fetching sales trend:", error)
    return { error: "Failed to fetch sales trend" }
  }
}

export async function getTopProducts(startDate?: Date, endDate?: Date, limit = 10) {
  try {
    let dateFilter = {}
    if (startDate && endDate) {
      dateFilter = {
        order: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: { not: "CANCELLED" },
        },
      }
    } else {
      dateFilter = {
        order: {
          status: { not: "CANCELLED" },
        },
      }
    }

    // Get top products by quantity sold
    const topProductsByQuantity = await prisma.orderItem.groupBy({
      by: ["fruitId"],
      where: dateFilter,
      _sum: {
        quantity: true,
        subtotal: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: limit,
    })

    // Get fruit details for these products
    const fruitIds = topProductsByQuantity.map((item) => item.fruitId)
    const fruits = await prisma.fruit.findMany({
      where: {
        id: {
          in: fruitIds,
        },
      },
      select: {
        id: true,
        name: true,
        image: true,
      },
    })

    // Combine data
    const topProducts = topProductsByQuantity.map((item) => {
      const fruit = fruits.find((f) => f.id === item.fruitId)
      return {
        id: item.fruitId,
        name: fruit?.name || "Unknown Product",
        image: fruit?.image || "",
        quantitySold: item._sum.quantity || 0,
        revenue: item._sum.subtotal || 0,
      }
    })

    // Get top products by revenue
    const topProductsByRevenue = [...topProducts].sort((a, b) => b.revenue - a.revenue)

    return {
      success: true,
      data: {
        byQuantity: topProducts,
        byRevenue: topProductsByRevenue,
      },
    }
  } catch (error) {
    console.error("Error fetching top products:", error)
    return { error: "Failed to fetch top products" }
  }
}

// Payment Report Actions
export async function getPaymentSummary(startDate?: Date, endDate?: Date) {
  try {
    let dateFilter = {}
    if (startDate && endDate) {
      dateFilter = {
        paymentDate: {
          gte: startDate,
          lte: endDate,
        },
      }
    }

    // Get payment statistics
    const [completedPayments, pendingPayments, failedPayments] = await Promise.all([
      // Completed payments
      prisma.payment.aggregate({
        where: {
          ...dateFilter,
          paymentStatus: "COMPLETED",
        },
        _sum: {
          amountPaid: true,
        },
        _count: {
          id: true,
        },
      }),

      // Pending payments
      prisma.payment.count({
        where: {
          ...dateFilter,
          paymentStatus: "PENDING",
        },
      }),

      // Failed payments
      prisma.payment.count({
        where: {
          ...dateFilter,
          paymentStatus: "FAILED",
        },
      }),
    ])

    // Get payment method distribution
    const paymentMethods = await prisma.payment.groupBy({
      by: ["paymentMethod"],
      where: dateFilter,
      _count: {
        id: true,
      },
    })

    // Calculate total payments
    const totalPayments = (completedPayments._count.id || 0) + pendingPayments + failedPayments

    // Calculate percentages for payment methods
    const methodDistribution = paymentMethods.map((method) => {
      return {
        name: getPaymentMethodName(method.paymentMethod),
        value: totalPayments > 0 ? (method._count.id / totalPayments) * 100 : 0,
        count: method._count.id,
      }
    })

    return {
      success: true,
      data: {
        totalAmount: completedPayments._sum.amountPaid || 0,
        completedCount: completedPayments._count.id || 0,
        pendingCount: pendingPayments,
        failedCount: failedPayments,
        totalCount: totalPayments,
        methodDistribution,
      },
    }
  } catch (error) {
    console.error("Error fetching payment summary:", error)
    return { error: "Failed to fetch payment summary" }
  }
}

export async function getPaymentTrend(
  period: "daily" | "weekly" | "monthly" | "yearly",
  startDate?: Date,
  endDate?: Date,
) {
  try {
    // Default to last 12 months if no date range provided
    const start = startDate || new Date(new Date().setFullYear(new Date().getFullYear() - 1))
    const end = endDate || new Date()

    // Format SQL based on period
    let dateFormat
    let groupBy

    switch (period) {
      case "daily":
        dateFormat = "%Y-%m-%d"
        groupBy = "day"
        break
      case "weekly":
        dateFormat = "%Y-%u" // ISO week number
        groupBy = "week"
        break
      case "monthly":
        dateFormat = "%Y-%m"
        groupBy = "month"
        break
      case "yearly":
        dateFormat = "%Y"
        groupBy = "year"
        break
      default:
        dateFormat = "%Y-%m"
        groupBy = "month"
    }

    // Raw SQL query for date formatting and grouping
    // Note: This is PostgreSQL syntax - adjust for your database
    const paymentTrend = await prisma.$queryRaw`
      SELECT 
        TO_CHAR(p."paymentDate", ${dateFormat}) as period,
        SUM(CASE WHEN p."paymentStatus" = 'COMPLETED' THEN p."amountPaid" ELSE 0 END) as completed,
        COUNT(CASE WHEN p."paymentStatus" = 'COMPLETED' THEN 1 ELSE NULL END) as completed_count,
        COUNT(CASE WHEN p."paymentStatus" = 'PENDING' THEN 1 ELSE NULL END) as pending_count,
        COUNT(CASE WHEN p."paymentStatus" = 'FAILED' THEN 1 ELSE NULL END) as failed_count
      FROM "Payment" p
      WHERE p."paymentDate" >= ${start} AND p."paymentDate" <= ${end}
      GROUP BY period
      ORDER BY period
    `

    return {
      success: true,
      data: paymentTrend,
    }
  } catch (error) {
    console.error("Error fetching payment trend:", error)
    return { error: "Failed to fetch payment trend" }
  }
}

export async function getRecentPayments(limit = 10) {
  try {
    const payments = await prisma.payment.findMany({
      take: limit,
      orderBy: {
        paymentDate: "desc",
      },
      include: {
        order: {
          include: {
            customer: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    return {
      success: true,
      data: payments.map((payment) => ({
        id: payment.id,
        orderNumber: payment.order.orderNumber,
        customer: payment.order.customer?.name || "Unknown",
        amount: payment.amountPaid,
        method: payment.paymentMethod,
        status: payment.paymentStatus,
        date: payment.paymentDate,
      })),
    }
  } catch (error) {
    console.error("Error fetching recent payments:", error)
    return { error: "Failed to fetch recent payments" }
  }
}

// Helper functions
function getPaymentMethodName(method: string) {
  switch (method) {
    case "TRANSFER":
      return "Transfer Bank"
    case "DIGITAL_WALLET":
      return "E-Wallet"
    case "CASH":
      return "Tunai"
    default:
      return method
  }
}
