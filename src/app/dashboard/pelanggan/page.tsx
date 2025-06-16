import { searchCustomers } from "@/actions/customer-actions"
import { CustomerList } from "@/components/customer/customer-list"
import { CustomerFilters } from "@/components/customer/customer-filter"
import { CustomerStats } from "@/components/customer/customer-stats"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

interface SearchParams {
  query?: string
  page?: string
}

interface PageProps {
  searchParams: Promise<SearchParams>
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const query = params.query || ""
  const page = Number.parseInt(params.page || "1")

  const customersResult = await searchCustomers({
    query,
    page,
    limit: 12,
  })

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Customer Management</h1>
          <p className="text-gray-600">Manage your customer relationships</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/pelanggan/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Link>
        </Button>
      </div>

      <CustomerStats />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <CustomerFilters />
        </div>

        <div className="lg:col-span-3">
          {customersResult.success ? (
            <CustomerList customers={customersResult.data.customers} pagination={customersResult.data.pagination} />
          ) : (
            <div className="text-center py-8">
              <p className="text-red-600">{customersResult.error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
