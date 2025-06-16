"use server"

import { prisma } from "@/db/prisma"
import { createOrderSchema, updateOrderSchema, type CreateOrderInput, type UpdateOrderInput } from "@/validasi/validasi"
import { revalidatePath } from "next/cache"

export async function createOrder(data: CreateOrderInput) {
  try {
    const validatedData = createOrderSchema.parse(data)

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Calculate total
    const total = validatedData.orderItems.reduce((sum, item) => {
      return sum + item.quantity * item.price
    }, 0)

    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: validatedData.customerId,
          payment: validatedData.payment,
          total,
          userId: validatedData.userId,
        },
      })

      // Create order items and update stock
      for (const item of validatedData.orderItems) {
        // Check if fruit has enough stock
        const fruit = await tx.fruit.findUnique({
          where: { id: item.fruitId },
        })

        if (!fruit || fruit.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${fruit?.name || "fruit"}`)
        }

        // Create order item
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            fruitId: item.fruitId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.quantity * item.price,
          },
        })

        // Update fruit stock
        await tx.fruit.update({
          where: { id: item.fruitId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      }

      // Automatically create payment record
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          amountPaid: total,
          paymentStatus: "PENDING",
          paymentMethod: validatedData.payment,
          paymentDate: new Date(),
        },
      })

      return newOrder
    })

    revalidatePath("/orders")
    return { success: true, data: order }
  } catch (error) {
    console.error("Error creating order:", error)
    return { error: error instanceof Error ? error.message : "Failed to create order" }
  }
}

export async function updateOrder(data: UpdateOrderInput) {
  try {
    const validatedData = updateOrderSchema.parse(data)
    const { id, ...updateData } = validatedData

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        orderItems: {
          include: {
            fruit: true,
          },
        },
      },
    })

    revalidatePath("/orders")
    return { success: true, data: order }
  } catch (error) {
    console.error("Error updating order:", error)
    return { error: "Failed to update order" }
  }
}

export async function cancelOrder(id: string) {
  try {
    const order = await prisma.$transaction(async (tx) => {
      // Get order with items
      const existingOrder = await tx.order.findUnique({
        where: { id },
        include: {
          orderItems: true,
        },
      })

      if (!existingOrder) {
        throw new Error("Order not found")
      }

      if (existingOrder.status === "CANCELLED") {
        throw new Error("Order is already cancelled")
      }

      // Restore stock for each item
      for (const item of existingOrder.orderItems) {
        await tx.fruit.update({
          where: { id: item.fruitId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        })

        // Create stock history
        await tx.stockHistory.create({
          data: {
            fruitId: item.fruitId,
            quantity: item.quantity,
            movementType: "in",
            description: `Order ${existingOrder.orderNumber} cancelled`,
          },
        })
      }

      // Update related payments to FAILED (not CANCELLED)
      await tx.payment.updateMany({
        where: { orderId: id },
        data: { paymentStatus: "FAILED" },
      })

      // Update order status
      return await tx.order.update({
        where: { id },
        data: { status: "CANCELLED" },
      })
    })

    revalidatePath("/orders")
    return { success: true, data: order }
  } catch (error) {
    console.error("Error cancelling order:", error)
    return { error: error instanceof Error ? error.message : "Failed to cancel order" }
  }
}



export async function getOrderById(id: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        user: {
          select: { name: true },
        },
        orderItems: {
          include: {
            fruit: true,
          },
        },
        payments: true,
      },
    })

    if (!order) {
      return { error: "Order not found" }
    }

    return { success: true, data: order }
  } catch (error) {
    console.error("Error fetching order:", error)
    return { error: "Failed to fetch order" }
  }
}

export async function getOrderSummary() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const [totalOrders, todayOrders, thisMonthOrders, statusCounts] = await Promise.all([
      // Total orders
      prisma.order.aggregate({
        _count: { id: true },
        _sum: { total: true },
      }),

      // Today's orders
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
        _count: { id: true },
        _sum: { total: true },
      }),

      // This month's orders
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: thisMonth,
          },
        },
        _count: { id: true },
        _sum: { total: true },
      }),

      // Orders by status
      prisma.order.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
    ])

    return {
      success: true,
      data: {
        totalCount: totalOrders._count.id,
        totalAmount: totalOrders._sum.total || 0,
        todayCount: todayOrders._count.id,
        todayAmount: todayOrders._sum.total || 0,
        thisMonthCount: thisMonthOrders._count.id,
        thisMonthAmount: thisMonthOrders._sum.total || 0,
        statusBreakdown: statusCounts.reduce(
          (acc, item) => {
            acc[item.status] = item._count.id
            return acc
          },
          {} as Record<string, number>,
        ),
      },
    }
  } catch (error) {
    console.error("Error fetching order summary:", error)
    return { error: "Failed to fetch order summary" }
  }
}
