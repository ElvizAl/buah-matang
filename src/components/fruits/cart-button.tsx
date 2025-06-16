"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useCart } from "@/context/cart-provider"
import { toast } from "sonner"
import { useState } from "react"

// Component untuk icon cart di navbar
export function CartButton() {
  const { itemCount } = useCart()

  return (
    <Button variant="ghost" size="icon" asChild className="relative">
      <Link href="/cart">
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
            {itemCount}
          </Badge>
        )}
        <span className="sr-only">Shopping Cart</span>
      </Link>
    </Button>
  )
}

// Component untuk add to cart button di product cards
interface AddToCartButtonProps {
  fruit: {
    id: string
    name: string
    price: number
    image: string | null
    stock: number
  }
  disabled?: boolean
}

export function AddToCartButton({ fruit, disabled = false }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [isLoading, setIsLoading] = useState(false)

  const handleAddToCart = async () => {
    if (disabled || fruit.stock <= 0) {
      toast.error("Produk tidak tersedia")
      return
    }

    setIsLoading(true)

    try {
      addItem({
        fruitId: fruit.id, // Menggunakan fruitId sesuai CartItem interface
        name: fruit.name,
        price: fruit.price,
        image: fruit.image,
        quantity: 1,
        stock: fruit.stock, // Menambahkan stock yang required
      })

      toast.success(`${fruit.name} ditambahkan ke keranjang`)
    } catch (error) {
      toast.error("Gagal menambahkan ke keranjang")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleAddToCart} disabled={disabled || isLoading || fruit.stock <= 0} size="sm" className="gap-1">
      <ShoppingCart className="h-4 w-4" />
      {isLoading ? "..." : "Keranjang"}
    </Button>
  )
}

// Export default untuk backward compatibility
export default CartButton
