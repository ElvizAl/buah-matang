"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { createOrder } from "@/actions/order-actions"
import { getCustomers } from "@/actions/customer-actions"
import { getFruitsInStock } from "@/actions/fruit-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { OrderItemForm } from "@/components/order/-item-form"
import { ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"

interface Customer {
  id: string
  name: string
  email: string | null
}

interface Fruit {
  id: string
  name: string
  price: number
  stock: number
}

interface OrderItem {
  fruitId: string
  quantity: number
  price: number
}

type PaymentMethod = "CASH" | "TRANSFER" | "CREDIT_CARD" | "DIGITAL_WALLET"

export default function NewOrderPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [fruits, setFruits] = useState<Fruit[]>([])
  const [customerId, setCustomerId] = useState("")
  const [payment, setPayment] = useState<PaymentMethod | "">("")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      loadData()
    }
  }, [status])

  const loadData = async () => {
    setIsLoadingData(true)
    try {
      const [customersResult, fruitsResult] = await Promise.all([getCustomers(), getFruitsInStock()])

      if (customersResult.success) {
        setCustomers(customersResult.data)
      }

      if (fruitsResult.success) {
        setFruits(fruitsResult.data)
      }
    } catch (error) {
      console.log(error)
      setError("Failed to load data")
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user?.id) {
      setError("User not authenticated")
      return
    }

    if (orderItems.length === 0) {
      setError("Please add at least one item to the order")
      return
    }

    if (!payment) {
      setError("Please select a payment method")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await createOrder({
        customerId,
        payment: payment as PaymentMethod,
        userId: session.user.id,
        orderItems,
      })

      if (result.success) {
        router.push("/dashboard/orders")
      } else {
        setError(result.error ?? "Something went wrong")
      }
    } catch (error) {
      console.log(error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.quantity * item.price, 0)
  }

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
            <span>Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (status === "unauthenticated") {
    return null
  }

  if (isLoadingData) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
            <span>Loading data...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Order</h1>
          <p className="text-gray-600">Add a new customer order</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Order Information */}
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
            <CardDescription>Select customer and payment method</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer *</Label>
                <Select value={customerId} onValueChange={setCustomerId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} {customer.email && `(${customer.email})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment">Payment Method *</Label>
                <Select value={payment} onValueChange={(value) => setPayment(value as PaymentMethod)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                    <SelectItem value="DIGITAL_WALLET">Digital Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
            <CardDescription>Add fruits to this order</CardDescription>
          </CardHeader>
          <CardContent>
            <OrderItemForm fruits={fruits} orderItems={orderItems} onOrderItemsChange={setOrderItems} />
          </CardContent>
        </Card>

        {/* Order Summary */}
        {orderItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {orderItems.map((item, index) => {
                  const fruit = fruits.find((f) => f.id === item.fruitId)
                  return (
                    <div key={index} className="flex justify-between">
                      <span>
                        {item.quantity}x {fruit?.name}
                      </span>
                      <span>Rp {(item.quantity * item.price).toLocaleString("id-ID")}</span>
                    </div>
                  )
                })}
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>Rp {calculateTotal().toLocaleString("id-ID")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <div className="flex space-x-2">
          <Button type="submit" disabled={isLoading || orderItems.length === 0 || !customerId || !payment}>
            {isLoading ? "Creating..." : "Create Order"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/orders">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
