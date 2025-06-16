import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import ProductCardWithClient from "@/components/sections/produk/product-card"
import { getFruitsInStock } from "@/actions/fruit-actions"

export default async function ProductsPage() {
  const fruitResult = await getFruitsInStock()
  const fruits = fruitResult.success ? fruitResult.data : []
  return (
    <div className="max-w-7xl mx-auto px-5 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter">Semua Produk</h1>
          <p className="text-muted-foreground mt-1">Temukan berbagai buah segar berkualitas tinggi</p>
        </div>
        <Link href="/#produk">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Link>
      </div>
      <ProductCardWithClient fruits={fruits} />
    </div>
  )
}
