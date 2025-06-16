"use server"

import { auth } from "@/auth"
import { prisma } from "@/db/prisma"
import {
  createCustomerSchema,
  updateCustomerSchema,
  type CreateCustomerInput,
  type UpdateCustomerInput,
} from "@/validasi/validasi"
import { revalidatePath } from "next/cache"

export async function createCustomer(data: CreateCustomerInput) {
  try {
    // Get current user session
    const session = await auth()
    if (!session?.user) {
      return { error: "User not authenticated" }
    }

    const validatedData = createCustomerSchema.parse({
      ...data,
      userId: session.user.id,
    })

    // Check if email already exists (if provided)
    if (validatedData.email) {
      const existingCustomer = await prisma.customer.findUnique({
        where: { email: validatedData.email },
      })

      if (existingCustomer) {
        return { error: "Customer with this email already exists" }
      }
    }

    const customer = await prisma.customer.create({
      data: validatedData,
      include: {
        user: {
          select: { name: true },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    })

    revalidatePath("/dashboard/pelanggan")
    return { success: true, data: customer }
  } catch (error) {
    console.error("Error creating customer:", error)
    return { error: "Failed to create customer" }
  }
}

export async function updateCustomer(data: UpdateCustomerInput) {
  try {
    // Get current user session
    const session = await auth()
    if (!session?.user) {
      return { error: "User not authenticated" }
    }

    const validatedData = updateCustomerSchema.parse(data)
    const { id, ...updateData } = validatedData

    // Check if email already exists (if provided and different from current)
    if (updateData.email) {
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          email: updateData.email,
          NOT: { id },
        },
      })

      if (existingCustomer) {
        return { error: "Customer with this email already exists" }
      }
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { name: true },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    })

    revalidatePath("/dashboard/pelanggan")
    revalidatePath(`/dashboard/pelanggan/${id}`)
    return { success: true, data: customer }
  } catch (error) {
    console.error("Error updating customer:", error)
    return { error: "Failed to update customer" }
  }
}

export async function deleteCustomer(id: string) {
  try {
    // Get current user session
    const session = await auth()
    if (!session?.user) {
      return { error: "User not authenticated" }
    }

    // Check if customer has orders
    const orderCount = await prisma.order.count({
      where: { customerId: id },
    })

    if (orderCount > 0) {
      return { error: "Cannot delete customer with existing orders" }
    }

    await prisma.customer.delete({
      where: { id },
    })

    revalidatePath("/dashboard/pelanggan")
    return { success: true }
  } catch (error) {
    console.error("Error deleting customer:", error)
    return { error: "Failed to delete customer" }
  }
}

export async function getCustomers(userId?: string) {
  try {
    const customers = await prisma.customer.findMany({
      where: userId ? { userId } : undefined,
      include: {
        user: {
          select: { name: true },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Calculate total spent for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const totalSpent = await prisma.order.aggregate({
          where: {
            customerId: customer.id,
            status: "COMPLETED",
          },
          _sum: {
            total: true,
          },
        })

        return {
          ...customer,
          totalSpent: totalSpent._sum.total || 0,
        }
      }),
    )

    return { success: true, data: customersWithStats }
  } catch (error) {
    console.error("Error fetching customers:", error)
    return { error: "Failed to fetch customers" }
  }
}

export async function getCustomerById(id: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true },
        },
        orders: {
          orderBy: { createdAt: "desc" },
          include: {
            orderItems: {
              include: {
                fruit: {
                  select: { name: true, image: true },
                },
              },
            },
            payments: true,
          },
        },
      },
    })

    if (!customer) {
      return { error: "Customer not found" }
    }

    // Calculate customer statistics
    const stats = await prisma.order.aggregate({
      where: {
        customerId: id,
        status: "COMPLETED",
      },
      _sum: {
        total: true,
      },
      _count: {
        id: true,
      },
    })

    // Get favorite products
    const favoriteProducts = await prisma.orderItem.groupBy({
      by: ["fruitId"],
      where: {
        order: {
          customerId: id,
          status: "COMPLETED",
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    })

    const favoriteProductsWithDetails = await Promise.all(
      favoriteProducts.map(async (item) => {
        const fruit = await prisma.fruit.findUnique({
          where: { id: item.fruitId },
          select: { name: true, image: true },
        })
        return {
          ...fruit,
          totalQuantity: item._sum.quantity || 0,
        }
      }),
    )

    return {
      success: true,
      data: {
        ...customer,
        stats: {
          totalSpent: stats._sum.total || 0,
          totalOrders: stats._count.id,
          averageOrderValue: stats._count.id > 0 ? (stats._sum.total || 0) / stats._count.id : 0,
        },
        favoriteProducts: favoriteProductsWithDetails,
      },
    }
  } catch (error) {
    console.error("Error fetching customer:", error)
    return { error: "Failed to fetch customer" }
  }
}

// Fungsi search customers dengan pagination
export async function searchCustomers(params: {
  query?: string
  page?: number
  limit?: number
}) {
  try {
    const { query, page = 1, limit = 10 } = params
    const skip = (page - 1) * limit

    // Build where condition - hanya mencari berdasarkan nama
    const where = query
      ? {
          name: {
            contains: query,
            mode: "insensitive" as const,
          },
        }
      : {}

    // Get customers with pagination
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          user: {
            select: { name: true },
          },
          _count: {
            select: {
              orders: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.customer.count({ where }),
    ])

    // Calculate total spent for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const totalSpent = await prisma.order.aggregate({
          where: {
            customerId: customer.id,
            status: "COMPLETED",
          },
          _sum: {
            total: true,
          },
        })

        return {
          ...customer,
          totalSpent: totalSpent._sum.total || 0,
        }
      }),
    )

    const totalPages = Math.ceil(total / limit)

    return {
      success: true,
      data: {
        customers: customersWithStats,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    }
  } catch (error) {
    console.error("Error searching customers:", error)
    return { error: "Failed to search customers" }
  }
}

export async function getCustomerAnalytics() {
  try {
    const [totalCustomers, newCustomersThisMonth, topCustomers, customerGrowth] = await Promise.all([
      // Total customers
      prisma.customer.count(),

      // New customers this month
      prisma.customer.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),

      // Top customers by total spent
      prisma.$queryRaw`
        SELECT 
          c.id,
          c.name,
          c.email,
          COALESCE(SUM(o.total), 0) as total_spent,
          COUNT(o.id) as order_count
        FROM "Customer" c
        LEFT JOIN "Order" o ON c.id = o."customerId" AND o.status = 'COMPLETED'
        GROUP BY c.id, c.name, c.email
        ORDER BY total_spent DESC
        LIMIT 10
      `,

      // Customer growth over last 6 months
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*) as count
        FROM "Customer"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month
      `,
    ])

    return {
      success: true,
      data: {
        totalCustomers,
        newCustomersThisMonth,
        topCustomers,
        customerGrowth,
      },
    }
  } catch (error) {
    console.error("Error fetching customer analytics:", error)
    return { error: "Failed to fetch customer analytics" }
  }
}


export async function getCustomerSummary() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)

    const [totalCustomers, newCustomersThisMonth, activeCustomers, customerGrowth] = await Promise.all([
      // Total customers
      prisma.customer.count(),

      // New customers this month
      prisma.customer.count({
        where: {
          createdAt: {
            gte: thisMonth,
          },
        },
      }),

      // Active customers (customers who made orders this month)
      prisma.customer.count({
        where: {
          orders: {
            some: {
              createdAt: {
                gte: thisMonth,
              },
            },
          },
        },
      }),

      // Customer growth (this month vs last month)
      Promise.all([
        prisma.customer.count({
          where: {
            createdAt: {
              gte: thisMonth,
            },
          },
        }),
        prisma.customer.count({
          where: {
            createdAt: {
              gte: lastMonth,
              lt: thisMonth,
            },
          },
        }),
      ]),
    ])

    const [thisMonthCount, lastMonthCount] = customerGrowth
    const growthPercentage = lastMonthCount > 0 ? ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100 : 0

    return {
      success: true,
      data: {
        totalCustomers,
        newCustomersThisMonth,
        activeCustomers,
        growthPercentage: Math.round(growthPercentage * 100) / 100,
      },
    }
  } catch (error) {
    console.error("Error fetching customer summary:", error)
    return { error: "Failed to fetch customer summary" }
  }
}

export async function createCustomerProfile(data: Omit<CreateCustomerInput, "userId">) {
  try {
    // Get current user session
    const session = await auth()
    if (!session?.user) {
      return { error: "User not authenticated" }
    }

    // Check if user already has a customer profile
    const existingCustomer = await prisma.customer.findFirst({
      where: { userId: session.user.id },
    })

    if (existingCustomer) {
      return { error: "Customer profile already exists" }
    }

    const validatedData = createCustomerSchema.parse({
      ...data,
      userId: session.user.id,
    })

    // Check if email already exists (if provided)
    if (validatedData.email) {
      const existingCustomer = await prisma.customer.findUnique({
        where: { email: validatedData.email },
      })

      if (existingCustomer) {
        return { error: "Customer with this email already exists" }
      }
    }

    const customer = await prisma.customer.create({
      data: validatedData,
      include: {
        user: {
          select: { name: true },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    })

    revalidatePath("/profile")
    return { success: true, data: customer }
  } catch (error) {
    console.error("Error creating customer profile:", error)
    return { error: "Failed to create customer profile" }
  }
}

export async function getCurrentUserCustomer() {
  try {
    // Get current user session
    const session = await auth()
    if (!session?.user) {
      return { error: "User not authenticated" }
    }

    const customer = await prisma.customer.findFirst({
      where: { userId: session.user.id },
      include: {
        user: {
          select: { name: true },
        },
        orders: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            orderItems: {
              include: {
                fruit: {
                  select: { name: true, image: true },
                },
              },
            },
            payments: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    })

    if (!customer) {
      return { error: "Customer profile not found" }
    }

    // Calculate customer statistics
    const stats = await prisma.order.aggregate({
      where: {
        customerId: customer.id,
        status: "COMPLETED",
      },
      _sum: {
        total: true,
      },
      _count: {
        id: true,
      },
    })

    return {
      success: true,
      data: {
        ...customer,
        stats: {
          totalSpent: stats._sum.total || 0,
          totalOrders: stats._count.id,
          averageOrderValue: stats._count.id > 0 ? (stats._sum.total || 0) / stats._count.id : 0,
        },
      },
    }
  } catch (error) {
    console.error("Error fetching current user customer:", error)
    return { error: "Failed to fetch customer profile" }
  }
}
