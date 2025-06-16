"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart} from "lucide-react"
import { useCart } from "@/context/cart-provider"
import { toast } from "sonner"

interface Fruit {
  id: string
  name: string
  price: number
  stock: number
  image: string | null
  createdAt: Date
  _count: {
    orderItems: number
    stockHistory: number
  }
}

interface ProductCardProps {
  fruit: Fruit
}

export function ProductCard({ fruit }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { addItem } = useCart()

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Habis", variant: "destructive" as const }
    if (stock <= 10) return { label: "Stok Terbatas", variant: "secondary" as const }
    return { label: "Tersedia", variant: "default" as const }
  }

  const handleAddToCart = async () => {
    if (fruit.stock === 0) {
      toast.error("Produk sedang habis")
      return
    }

    setIsLoading(true)
    try {
      addItem({
        fruitId: fruit.id,
        name: fruit.name,
        price: fruit.price,
        quantity: 1,
        image: fruit.image,
        stock: fruit.stock
      })
      toast.success(`${fruit.name} ditambahkan ke keranjang`)
    } catch (error) {
      console.log(error)
      toast.error("Gagal menambahkan ke keranjang")
    } finally {
      setIsLoading(false)
    }
  }

  const stockStatus = getStockStatus(fruit.stock)

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-4">
        <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={fruit.image || "/placeholder.svg?height=200&width=200"}
            alt={fruit.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2">
            <Badge variant={stockStatus.variant} className="text-xs">
              {stockStatus.label}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1">{fruit.name}</h3>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-primary">Rp {fruit.price.toLocaleString("id-ID")}</p>
            <p className="text-sm text-gray-500">Stok: {fruit.stock}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button size="sm" className="flex-1" onClick={handleAddToCart} disabled={fruit.stock === 0 || isLoading}>
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isLoading ? "..." : "Keranjang"}
        </Button>
      </CardFooter>
    </Card>
  )
}
