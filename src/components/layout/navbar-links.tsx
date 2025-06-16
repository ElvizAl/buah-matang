"use client"

import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface NavbarItemProps {
    href: string
    children: React.ReactNode
    isActive?: boolean
}

const NavbarItem = ({ href, children, isActive }: NavbarItemProps) => {
    return (
        <Button
            variant="outline"
            size="sm"
            className={cn(
                "bg-transparent hover:bg-transparent rounded-full hover:border-primary border-transparent text-black px-4 py-2 text-md",
                isActive && "bg-blue-500 text-black hover:bg-blue-500 hover:text-black",
            )}
        >
            <Link href={href}>{children}</Link>
        </Button>
    )
}

const navbarItems = [
    { href: "/", children: "Home" },
    { href: "/produk", children: "Produk" },
    { href: "/kontak", children: "Kontak" },
    { href: "/Maps", children: "Maps" },
]

export const NavbarLink = () => {
    const pathname = usePathname()
    return (
        <div className="flex items-center space-x-4">
            {navbarItems.map((item) => (
                <NavbarItem key={item.href} href={item.href} isActive={pathname === item.href}>
                    {item.children}
                </NavbarItem>
            ))}
        </div>
    )
}