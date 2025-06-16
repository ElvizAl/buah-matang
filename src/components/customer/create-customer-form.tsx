"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createCustomerSchema, type CreateCustomerInput } from "@/validasi/validasi"
import { createCustomer } from "@/actions/customer-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save } from "lucide-react"

export function CreateCustomerForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Omit<CreateCustomerInput, "userId">>({
    resolver: zodResolver(createCustomerSchema.omit({ userId: true })),
  })

  const onSubmit = async (data: Omit<CreateCustomerInput, "userId">) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await createCustomer(data as CreateCustomerInput)

      if (result.success) {
        router.push("/dashboard/pelanggan")
        router.refresh()
      } else {
        setError(result.error || "Failed to create customer")
      }
    } catch (error) {
      console.log(error)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Enter customer name"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="customer@example.com"
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            {...register("phone")}
            placeholder="+62 812 3456 7890"
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          {...register("address")}
          placeholder="Enter customer address"
          rows={3}
          className={errors.address ? "border-red-500" : ""}
        />
        {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Customer
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
