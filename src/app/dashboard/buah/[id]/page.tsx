import { getFruitById } from "@/actions/fruit-actions"
import { FruitDetail } from "@/components/fruits/fruit-detail"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function FruitDetailPage({ params }: PageProps) {
  const { id } = await params

  const fruitResult = await getFruitById(id)

  if (!fruitResult.success) {
    notFound()
  }

  const fruit = fruitResult.data

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/buah">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Fruits
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{fruit.name}</h1>
            <p className="text-gray-600">Fruit Details</p>
          </div>
        </div>

        <Button asChild>
          <Link href={`/dashboard/buah/${fruit.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Fruit
          </Link>
        </Button>
      </div>

      <FruitDetail fruit={fruit} />
    </div>
  )
}
