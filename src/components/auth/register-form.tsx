"use client"

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { signUpCredentials } from "@/actions/auth"
import { useActionState } from "react"
import { RegisterButton } from "@/components/auth/form-button"

export const RegisterForm = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const [state, formAction] = useActionState(signUpCredentials, null);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Daftar ke akun Anda</CardTitle>
          <CardDescription>
            Masukkan form Anda di bawah ini untuk daftar ke akun Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            {state?.message ? (
              <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-100" role="alert">
                <span className="text-sm">{state?.message}</span>
              </div>
            ) : null}
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="name"
                  name="name"
                  placeholder="Jhon Doe"
                />
                <div aria-live="polite" aria-atomic="true">
                  <span className="text-sm text-red-500">{state?.error?.name}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3 mt-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="m@example.com"
                />
                <div aria-live="polite" aria-atomic="true">
                  <span className="text-sm text-red-500">{state?.error?.email}</span>
                </div>
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" type="password" name="password" />
                <div aria-live="polite" aria-atomic="true">
                  <span className="text-sm text-red-500">{state?.error?.password}</span>
                </div>
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="ConfirmPassword">Confirm Password</Label>
                </div>
                <Input id="ConfirmPassword" type="password" name="ConfirmPassword" />
                <div aria-live="polite" aria-atomic="true">
                  <span className="text-sm text-red-500">{state?.error?.ConfirmPassword}</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <RegisterButton />
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/login" className="underline cursor-pointer underline-offset-4 hover:text-primary">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}