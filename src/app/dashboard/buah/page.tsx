import { searchFruits } from "@/actions/fruit-actions"
import { FruitList } from "@/components/fruits/fruit-list"
import { FruitFilters } from "@/components/fruits/fruit-filters"
import { FruitStats } from "@/components/fruits/fruit-stats"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

interface PageProps {
  searchParams: Promise<{
    query?: string
    page?: string
  }>
}

export default async function FruitsPage({ searchParams }: PageProps) {

  // Await searchParams before using
  const params = await searchParams
  const query = params.query
  const page = params.page ? Number.parseInt(params.page) : 1

  const searchParams_ = {
    query,
    page,
    limit: 10,
  }

  const fruitsResult = await searchFruits(searchParams_)

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Fruit Inventory</h1>
          <p className="text-gray-600">Manage your fruit products and stock</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/buah/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Fruit
          </Link>
        </Button>
      </div>

      <FruitStats />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <div className="lg:col-span-1">
          <FruitFilters />
        </div>

        <div className="lg:col-span-3">
          {fruitsResult.success ? (
            <div>
              {/* Results Summary */}
              <div className="mb-4 text-sm text-gray-600">
                Showing {fruitsResult.data.fruits.length} of {fruitsResult.data.pagination.total} fruits
                {query && ` for "${query}"`}
              </div>

              <FruitList fruits={fruitsResult.data.fruits} pagination={fruitsResult.data.pagination} />
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-red-600">{fruitsResult.error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
