"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, X, CheckCircle, Search } from "lucide-react"
import { updateOrder, cancelOrder } from "@/actions/order-actions"

// Interface yang sesuai dengan data dari database
interface OrderFromDB {
  id: string
  orderNumber: string
  total: number
  status: string
  payment: string
  createdAt: Date
  customer: {
    name: string
    email: string | null
  }
  user: {
    name: string | null // ✅ Fixed: name bisa null
  } | null
  orderItems: Array<{
    id: string
    quantity: number
    price: number
    subtotal: number
    fruit: {
      name: string
      image: string | null
    }
  }>
  payments: Array<{
    id: string
    amountPaid: number
    paymentStatus: string
    paymentMethod: string
  }>
  _count: {
    orderItems: number
    payments: number
  }
}

interface OrderListProps {
  orders: OrderFromDB[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export function OrderList({ orders, pagination }: OrderListProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const router = useRouter()

  const handleStatusUpdate = async (id: string, status: string) => {
    setUpdatingId(id)
    const result = await updateOrder({ id, status: status as "PROCESSING" | "COMPLETED" | "CANCELLED" })

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error)
    }
    setUpdatingId(null)
  }

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this order? This will restore the stock.")) return

    setUpdatingId(id)
    const result = await cancelOrder(id)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error)
    }
    setUpdatingId(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentColor = (payment: string) => {
    switch (payment) {
      case "CASH":
        return "bg-green-100 text-green-800"
      case "TRANSFER":
        return "bg-blue-100 text-blue-800"
      case "CREDIT_CARD":
        return "bg-purple-100 text-purple-800"
      case "DIGITAL_WALLET":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount)
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg bg-white">
        <Search className="mx-auto h-10 w-10 text-gray-400 mb-3" />
        <h3 className="text-lg font-medium">No orders found</h3>
        <p className="text-gray-500 mt-1">Try adjusting your search to find what you're looking for.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{order.customer.name}</div>
                    {order.customer.email && <div className="text-sm text-gray-500">{order.customer.email}</div>}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-500">{formatDate(order.createdAt)}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {order.orderItems.slice(0, 1).map((item) => (
                      <div key={item.id} className="truncate max-w-[150px]">
                        {item.quantity}x {item.fruit.name}
                      </div>
                    ))}
                    {order.orderItems.length > 1 && (
                      <span className="text-xs text-gray-500">+{order.orderItems.length - 1} more</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getPaymentColor(order.payment)}>
                    {order.payment}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" disabled={updatingId === order.id}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/orders/${order.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>

                      {order.status === "PROCESSING" && (
                        <>
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(order.id, "COMPLETED")}
                            disabled={updatingId === order.id}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleCancel(order.id)}
                            disabled={updatingId === order.id}
                            className="text-red-600"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel Order
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
          </p>

          <div className="flex space-x-2">
            {pagination.hasPrev && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/orders?page=${pagination.page - 1}`}>Previous</Link>
              </Button>
            )}

            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <Button key={pageNum} variant={pageNum === pagination.page ? "default" : "outline"} size="sm" asChild>
                  <Link href={`/dashboard/orders?page=${pageNum}`}>{pageNum}</Link>
                </Button>
              )
            })}

            {pagination.hasNext && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/orders?page=${pagination.page + 1}`}>Next</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
