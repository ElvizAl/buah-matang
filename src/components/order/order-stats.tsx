import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, DollarSign, Clock, CheckCircle } from "lucide-react"

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

interface OrderStatsProps {
  orders: OrderFromDB[]
}

export function OrderStats({ orders }: OrderStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount)
  }

  // Hitung statistik dari data orders
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)

  // Orders hari ini
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt)
    orderDate.setHours(0, 0, 0, 0)
    return orderDate.getTime() === today.getTime()
  }).length

  // Pending orders (status PROCESSING)
  const pendingOrders = orders.filter((order) => order.status === "PROCESSING").length

  // Completed orders
  const completedOrders = orders.filter((order) => order.status === "COMPLETED").length

  // Pending payments
  const pendingPayments = orders.reduce((count, order) => {
    const pendingPaymentCount = order.payments.filter((payment) => payment.paymentStatus === "PENDING").length
    return count + pendingPaymentCount
  }, 0)

  const stats = [
    {
      title: "Total Orders",
      value: totalOrders.toString(),
      description: `${completedOrders} completed`,
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      description: "All time revenue",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Today's Orders",
      value: todayOrders.toString(),
      description: "Orders placed today",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Pending Orders",
      value: pendingOrders.toString(),
      description: `${pendingPayments} pending payments`,
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
