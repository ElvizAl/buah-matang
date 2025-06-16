"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2, Package, AlertTriangle } from "lucide-react"
import { deleteFruit } from "@/actions/fruit-actions"
import { useRouter } from "next/navigation"

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

interface FruitListProps {
  fruits: Fruit[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export function FruitList({ fruits, pagination }: FruitListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fruit?")) return

    setDeletingId(id)
    const result = await deleteFruit(id)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error)
    }
    setDeletingId(null)
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", color: "destructive" }
    if (stock <= 10) return { label: "Low Stock", color: "secondary" }
    return { label: "In Stock", color: "default" }
  }

  if (fruits.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">No fruits found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="w-16">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fruits.map((fruit) => {
              const stockStatus = getStockStatus(fruit.stock)

              return (
                <TableRow key={fruit.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                      {fruit.image ? (
                        <Image src={fruit.image || "/placeholder.svg"} alt={fruit.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="font-medium">{fruit.name}</div>
                  </TableCell>

                  <TableCell>
                    <div className="font-semibold">Rp {fruit.price.toLocaleString("id-ID")}</div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center">
                      <span className="font-semibold">{fruit.stock}</span>
                      {fruit.stock <= 10 && fruit.stock > 0 && (
                        <AlertTriangle className="h-4 w-4 ml-1 text-yellow-600" />
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant={stockStatus.color as any}>{stockStatus.label}</Badge>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm">
                      <div>{fruit._count.orderItems} orders</div>
                      <div className="text-gray-500">{fruit._count.stockHistory} changes</div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm text-gray-500">{new Date(fruit.createdAt).toLocaleDateString("id-ID")}</div>
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={"/dashboard/edit"}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(fruit.id)}
                          disabled={deletingId === fruit.id}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {deletingId === fruit.id ? "Deleting..." : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
            <Button key={page} variant={page === pagination.page ? "default" : "outline"} size="sm" asChild>
              <Link href={`?page=${page}`}>{page}</Link>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
