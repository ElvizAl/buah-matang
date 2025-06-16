"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Search, X } from "lucide-react"

export function FruitFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(searchParams.get("query") || "")

  // Real-time search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleSearch = () => {
    const params = new URLSearchParams()

    if (query.trim()) {
      params.set("query", query.trim())
    }

    const url = params.toString() ? `/dashboard/buah?${params.toString()}` : "/dashboard/buah"
    router.push(url)
  }

  const clearSearch = () => {
    setQuery("")
    router.push("/dashboard/buah")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="h-4 w-4" />
          <span>Search Fruits</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Simple Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search by name</Label>
          <div className="relative">
            <Input
              id="search"
              placeholder="Type fruit name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-8"
            />
            {query && (
              <Button variant="ghost" size="sm" className="absolute right-1 top-1 h-6 w-6 p-0" onClick={clearSearch}>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          {query && (
            <p className="text-xs text-gray-500">
              Searching for: <span className="font-medium">{query}</span>
            </p>
          )}
        </div>

        {/* Manual Search Button */}
        <div className="space-y-2">
          <Button onClick={handleSearch} className="w-full" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Search Now
          </Button>
          {query && (
            <Button onClick={clearSearch} variant="outline" className="w-full" size="sm">
              <X className="h-4 w-4 mr-2" />
              Clear Search
            </Button>
          )}
        </div>

        {/* Search Info */}
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <p>💡 Tips:</p>
          <ul className="mt-1 space-y-1">
            <li>• Type to search automatically</li>
            <li>• Press Enter to search instantly</li>
            <li>• Search is case-insensitive</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
