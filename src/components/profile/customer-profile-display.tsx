"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin, Calendar, ShoppingBag, DollarSign, TrendingUp } from "lucide-react"
import Link from "next/link"

interface CustomerProfileDisplayProps {
  customer: {
    id: string
    name: string
    email: string | null
    phone: string | null
    address: string | null
    createdAt: Date
    stats: {
      totalSpent: number
      totalOrders: number
      averageOrderValue: number
    }
    orders: Array<{
      id: string
      total: number
      status: string
      createdAt: Date
      orderItems: Array<{
        quantity: number
        price: number
        fruit: {
          name: string
          image: string | null
        }
      }>
    }>
  }
}

export function CustomerProfileDisplay({ customer }: CustomerProfileDisplayProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
                  {getInitials(customer.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{customer.name}</CardTitle>
              </div>
            </div>
            <Button asChild>
              <Link href="/shop">Start Shopping</Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customer.email && (
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{customer.email}</span>
              </div>
            )}

            {customer.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{customer.phone}</span>
              </div>
            )}
          </div>

          {customer.address && (
            <div className="flex items-center space-x-3">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{customer.address}</span>
            </div>
          )}

          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>Customer since {new Date(customer.createdAt).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold">{formatCurrency(customer.stats.totalSpent)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{customer.stats.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Average Order</p>
                <p className="text-2xl font-bold">{formatCurrency(customer.stats.averageOrderValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      {customer.orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest orders and purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customer.orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">Order #{order.id.slice(-8)}</p>
                      <Badge variant={order.status === "COMPLETED" ? "default" : "secondary"}>{order.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {order.orderItems.length} items • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {order.orderItems.slice(0, 3).map((item, index) => (
                        <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {item.fruit.name} x{item.quantity}
                        </span>
                      ))}
                      {order.orderItems.length > 3 && (
                        <span className="text-xs text-gray-500">+{order.orderItems.length - 3} more</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(order.total)}</p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/orders/${order.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {customer.orders.length >= 5 && (
              <div className="mt-4 text-center">
                <Button variant="outline" asChild>
                  <Link href="/orders">View All Orders</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
