import { auth } from "@/auth"
import { getOrders } from "@/actions/order-actions"
import { OrderList } from "@/components/order/order-list"
import { OrderFilters } from "@/components/order/order-filter"
import { OrderStats } from "@/components/order/order-stats"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

interface PageProps {
  searchParams: Promise<{
    query?: string
    page?: string
  }>
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // Await searchParams before accessing properties
  const params = await searchParams

  // Extract search parameters
  const query = params.query || ""
  const page = params.page ? Number.parseInt(params.page) : 1

  // Get orders with search parameters
  const ordersResult = await getOrders({
    query,
    page,
    limit: 10,
  })

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-gray-600">Manage customer orders and payments</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/orders/new">
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Link>
        </Button>
      </div>

      {/* Pass orders data to OrderStats */}
      {ordersResult.success && <OrderStats orders={ordersResult.data.orders} />}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <OrderFilters />
        </div>

        <div className="lg:col-span-3">
          {ordersResult.success ? (
            <>
              {query && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                  <p className="text-sm text-blue-700">
                    Showing results for: <span className="font-medium">"{query}"</span>
                  </p>
                </div>
              )}
              <OrderList orders={ordersResult.data.orders} pagination={ordersResult.data.pagination} />
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-red-600">{ordersResult.error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
