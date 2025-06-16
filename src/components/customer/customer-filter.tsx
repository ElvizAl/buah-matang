"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, X } from "lucide-react"

export function CustomerFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(searchParams.get("query") || "")

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch()
    }, 500)

    return () => clearTimeout(timer)
  }, [query])

  const handleSearch = () => {
    const params = new URLSearchParams()

    if (query) params.set("query", query)

    const queryString = params.toString()
    router.push(`/dashboard/pelanggan${queryString ? `?${queryString}` : ""}`)
  }

  const clearFilters = () => {
    setQuery("")
    router.push("/dashboard/pelanggan")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Search Customer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by customer name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button onClick={handleSearch} size="sm" className="flex-1">
            <Search className="h-4 w-4 mr-2" />
            Search Now
          </Button>
          <Button onClick={clearFilters} variant="outline" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Active Filters Display */}
        {query && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium mb-2">Searching for:</p>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              {query}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

