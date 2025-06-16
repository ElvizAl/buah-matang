"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"

export function OrderFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("query") || "")

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())

      if (search.trim()) {
        params.set("query", search.trim())
      } else {
        params.delete("query")
      }

      // Reset to page 1 when searching
      params.delete("page")

      router.push(`/dashboard/orders?${params.toString()}`)
    }, 500)

    return () => clearTimeout(timer)
  }, [search, router, searchParams])

  const handleSearchNow = () => {
    const params = new URLSearchParams(searchParams.toString())

    if (search.trim()) {
      params.set("query", search.trim())
    } else {
      params.delete("query")
    }

    params.delete("page")
    router.push(`/dashboard/orders?${params.toString()}`)
  }

  const clearSearch = () => {
    setSearch("")
    const params = new URLSearchParams(searchParams.toString())
    params.delete("query")
    params.delete("page")
    router.push(`/dashboard/orders?${params.toString()}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="h-4 w-4" />
          <span>Search Orders</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label>Search by Customer Name</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search by customer name..."
              className="pl-8 pr-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchNow()
                }
              }}
            />
            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500">Search orders by customer name</p>
        </div>

        {/* Active Search Display */}
        {search && (
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                Searching: <span className="font-medium">"{search}"</span>
              </span>
              <button onClick={clearSearch} className="text-blue-600 hover:text-blue-800 text-sm">
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <Button onClick={handleSearchNow} className="w-full">
            Search Now
          </Button>
          {search && (
            <Button onClick={clearSearch} variant="outline" className="w-full">
              Clear Search
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
