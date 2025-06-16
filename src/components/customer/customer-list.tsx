"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Mail, Phone, MapPin, Edit, Trash2 } from "lucide-react"
import { deleteCustomer } from "@/actions/customer-actions"

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  createdAt: Date
  totalSpent: number
  _count: {
    orders: number
  }
}

interface CustomerListProps {
  customers: Customer[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export function CustomerList({ customers, pagination }: CustomerListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return

    setDeletingId(id)
    const result = await deleteCustomer(id)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error)
    }
    setDeletingId(null)
  }

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()

  if (customers.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No customers found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((customer) => {

          return (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {getInitials(customer.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{customer.name}</CardTitle>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/pelanggan/${customer.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(customer.id)}
                        disabled={deletingId === customer.id}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {deletingId === customer.id ? "Deleting..." : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {customer.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {customer.email}
                  </div>
                )}

                {customer.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {customer.phone}
                  </div>
                )}

                {customer.address && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="truncate">{customer.address}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                  <div>
                    <p className="text-xs text-gray-500">Total Spent</p>
                    <p className="font-semibold">Rp {customer.totalSpent.toLocaleString("id-ID")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Orders</p>
                    <p className="font-semibold">{customer._count.orders}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-gray-500">Customer Since</p>
                  <p className="text-sm">{new Date(customer.createdAt).toLocaleDateString("id-ID")}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button variant="outline" size="sm" disabled={!pagination.hasPrev} asChild={pagination.hasPrev}>
            {pagination.hasPrev ? (
              <Link href={`/dashboard/pelanggan?page=${pagination.page - 1}`}>Previous</Link>
            ) : (
              <span>Previous</span>
            )}
          </Button>

          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const page = i + 1
              return (
                <Button key={page} variant={page === pagination.page ? "default" : "outline"} size="sm" asChild>
                  <Link href={`/dashboard/pelanggan?page=${page}`}>{page}</Link>
                </Button>
              )
            })}
          </div>

          <Button variant="outline" size="sm" disabled={!pagination.hasNext} asChild={pagination.hasNext}>
            {pagination.hasNext ? (
              <Link href={`/dashboard/pelanggan?page=${pagination.page + 1}`}>Next</Link>
            ) : (
              <span>Next</span>
            )}
          </Button>
        </div>
      )}

      {/* Results Info */}
      <div className="text-center text-sm text-gray-500">
        Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
        {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} customers
      </div>
    </div>
  )
}
