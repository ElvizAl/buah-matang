"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createFruit } from "@/actions/fruit-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImageUpload } from "@/components/fruits/image-upload"
import { ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function NewFruitPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("")
  const [image, setImage] = useState<string | undefined>()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await createFruit({
        name,
        price: Number(price),
        stock: Number(stock),
        image,
      })

      if (result.success) {
        router.push("/dashboard/buah")
      } else {
        setError(result.error ?? "Something went wrong. Please try again.")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/fruits">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Fruits
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add New Fruit</h1>
          <p className="text-gray-600">Add a new fruit to your inventory</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fruit Information</CardTitle>
          <CardDescription>Enter the fruit details below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Image Upload */}
            <ImageUpload value={image} onChange={setImage} disabled={isLoading} />

            <div className="space-y-2">
              <Label htmlFor="name">Fruit Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Apple, Orange, Banana"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (Rp) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="10000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min="0"
                  step="100"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="100"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                  min="0"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Fruit"}
              </Button>
              <Button type="button" variant="outline" asChild disabled={isLoading}>
                <Link href="/fruits">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}