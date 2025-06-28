import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Users, DollarSign, TrendingUp, ShoppingCart, Clock, Plus, Eye } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/db/prisma"

async function getDashboardStats() {
  try {
    const [totalOrders, totalCustomers, totalRevenue, pendingOrders, totalProducts, recentOrders] = await Promise.all([
      prisma.order.count(),
      prisma.customer.count(),
      prisma.order.aggregate({
        _sum: {
          total: true,
        },
        where: {
          status: "COMPLETED",
        },
      }),
      prisma.order.count({
        where: {
          status: "PROCESSING",
        },
      }),
      prisma.fruit.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          customer: {
            select: {
              name: true,
            },
          },
        },
      }),
    ])

    return {
      totalOrders,
      totalCustomers,
      totalRevenue: totalRevenue._sum.total || 0,
      pendingOrders,
      totalProducts,
      recentOrders,
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      totalOrders: 0,
      totalCustomers: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      totalProducts: 0,
      recentOrders: [],
    }
  }
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session || session.user?.role !== "admin") {
    redirect("/")
  }

  const stats = await getDashboardStats()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-800"
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "PROCESSING":
        return "Diproses"
      case "COMPLETED":
        return "Selesai"
      case "CANCELLED":
        return "Dibatalkan"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Selamat Datang, {session.user.name}!</h1>
        <p className="text-blue-100 text-lg">Kelola toko buah Anda dengan mudah melalui dashboard admin</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Order</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Semua order yang masuk</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pelanggan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Pelanggan terdaftar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Dari order yang selesai</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Order Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Menunggu diproses</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Terbaru
            </CardTitle>
            <CardDescription>5 order terakhir yang masuk</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Belum ada order</p>
              ) : (
                stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Order #{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">{order.customer.name}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-medium">{formatCurrency(order.total)}</p>
                      <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/dashboard/orders">
                  <Eye className="h-4 w-4 mr-2" />
                  Lihat Semua Order
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Menu Cepat
            </CardTitle>
            <CardDescription>Aksi yang sering digunakan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button asChild className="h-20 flex-col">
                <Link href="/dashboard/orders/new">
                  <Plus className="h-6 w-6 mb-2" />
                  Buat Order Baru
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
                <Link href="/dashboard/buah/new">
                  <Package className="h-6 w-6 mb-2" />
                  Tambah Produk
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
                <Link href="/dashboard/pelanggan/new">
                  <Users className="h-6 w-6 mb-2" />
                  Tambah Pelanggan
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
                <Link href="/dashboard/reports">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  Lihat Laporan
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
