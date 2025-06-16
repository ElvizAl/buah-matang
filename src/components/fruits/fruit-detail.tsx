import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, DollarSign, Calendar, TrendingUp, AlertTriangle } from "lucide-react"

interface FruitDetailProps {
  fruit: {
    id: string
    name: string
    price: number
    stock: number
    image: string | null
    createdAt: Date
    updatedAt: Date
    _count: {
      orderItems: number
    }
  }
}

export function FruitDetail({ fruit }: FruitDetailProps) {
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock" }
    if (stock <= 10) return { label: "Low Stock" }
    return { label: "In Stock" }
  }

  const stockStatus = getStockStatus(fruit.stock)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Fruit Info */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start space-x-4">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                {fruit.image ? (
                  <Image src={fruit.image || "/placeholder.svg"} alt={fruit.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <CardTitle className="text-2xl">{fruit.name}</CardTitle>
                <Badge>{stockStatus.label}</Badge>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-500">Added: {new Date(fruit.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500">Updated: {new Date(fruit.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Right Column - Stats */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Harga</span>
              </div>
              <span className="font-bold text-green-600">Rp {fruit.price.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Current Stock</span>
              </div>
              <span className="font-bold text-blue-600 flex items-center">
                {fruit.stock}
                {fruit.stock <= 10 && fruit.stock > 0 && <AlertTriangle className="h-3 w-3 ml-1 text-yellow-600" />}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Total Orders</span>
              </div>
              <span className="font-bold text-purple-600">{fruit._count.orderItems}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Stock</span>
              </div>
              <span className="font-bold text-orange-600">Rp {(fruit.price * fruit.stock).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        {fruit.stock <= 10 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">
                    {fruit.stock === 0 ? "Out of Stock" : "Low Stock Alert"}
                  </p>
                  <p className="text-sm text-yellow-700">
                    {fruit.stock === 0
                      ? "This product is out of stock and needs restocking."
                      : "This product is running low and may need restocking soon."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
