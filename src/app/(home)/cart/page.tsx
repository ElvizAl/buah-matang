"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/context/cart-provider"
import { ArrowLeft, ShoppingCart, Trash2, Package } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart()
  const router = useRouter()

  const handleQuantityChange = (fruitId: string, value: number, maxStock: number) => {
    // Ensure quantity is between 1 and stock
    const quantity = Math.max(1, Math.min(value, maxStock))
    updateQuantity(fruitId, quantity)
  }

  const handleCheckout = () => {
    router.push("/checkout")
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/produk">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shop
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Keranjangmu</h1>
            <p className="text-gray-600">Belanja mu gaada</p>
          </div>
        </div>

        <Card className="text-center py-12">
          <CardContent>
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">Keranjangmu Kosong</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added any fruits to your cart yet.</p>
            <Button asChild>
              <Link href="/produk">Browse Fruits</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/produk">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Belanja
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Keranjangmu</h1>
            <p className="text-gray-600">
              {items.length} {items.length === 1 ? "item" : "items"} di keranjangmu
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={clearCart}>
         Hapus Keranjang
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Kerajang Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.fruitId} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    {item.image ? (
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-500">Rp {item.price.toLocaleString()} each</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item.fruitId, Number.parseInt(e.target.value) || 1, item.stock)
                      }
                      min={1}
                      max={item.stock}
                      className="w-20"
                    />
                    <span className="text-sm text-gray-500">/ {item.stock}</span>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">Rp {(item.quantity * item.price).toLocaleString()}</p>
                  </div>

                  <Button variant="ghost" size="sm" onClick={() => removeItem(item.fruitId)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Pembelian</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.fruitId} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>Rp {(item.quantity * item.price).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>Rp {total.toLocaleString()}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCheckout} className="w-full">
                Proses ke Checkout
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
