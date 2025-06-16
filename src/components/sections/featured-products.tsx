import { getFeaturedFruits } from "@/actions/fruit-actions"
import { ProductCard } from "@/components/products/product-card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export async function FeaturedProducts() {
  const result = await getFeaturedFruits()

  if (!result.success || !result.data) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Produk Unggulan</h2>
            <p className="text-gray-600 mb-8">Buah-buahan segar pilihan terbaik</p>
            <p className="text-red-500">Gagal memuat produk</p>
          </div>
        </div>
      </section>
    )
  }

  const fruits = result.data

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Produk Unggulan</h2>
          <p className="text-gray-600 mb-8">Buah-buahan segar pilihan terbaik</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {fruits.map((fruit) => (
            <ProductCard key={fruit.id} fruit={fruit} />
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg">
            <Link href="/produk">
              Lihat Semua Produk
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
