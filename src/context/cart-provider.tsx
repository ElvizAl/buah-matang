"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface CartItem {
  fruitId: string
  name: string
  price: number
  quantity: number
  image: string | null
  stock: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (fruitId: string) => void
  updateQuantity: (fruitId: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart")
      console.log("Loading cart from localStorage:", savedCart)
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        console.log("Parsed cart:", parsedCart)
        setItems(parsedCart)
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        console.log("Saving cart to localStorage:", items)
        localStorage.setItem("cart", JSON.stringify(items))
      } catch (error) {
        console.error("Failed to save cart to localStorage:", error)
      }
    }
  }, [items, isLoaded])

  const addItem = (item: CartItem) => {
    console.log("Adding item to cart:", item)
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.fruitId === item.fruitId)

      if (existingItem) {
        // Don't exceed stock
        const newQuantity = Math.min(existingItem.quantity + item.quantity, item.stock)
        const updatedItems = prevItems.map((i) =>
          i.fruitId === item.fruitId ? { ...i, quantity: newQuantity, price: Number(item.price) || i.price } : i,
        )
        console.log("Updated existing item, new cart:", updatedItems)
        return updatedItems
      } else {
        const newItem = {
          ...item,
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
        }
        const updatedItems = [...prevItems, newItem]
        console.log("Added new item, new cart:", updatedItems)
        return updatedItems
      }
    })
  }

  const removeItem = (fruitId: string) => {
    console.log("Removing item from cart:", fruitId)
    setItems((prevItems) => {
      const updatedItems = prevItems.filter((item) => item.fruitId !== fruitId)
      console.log("After removal:", updatedItems)
      return updatedItems
    })
  }

  const updateQuantity = (fruitId: string, quantity: number) => {
    console.log("Updating quantity:", fruitId, quantity)
    setItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.fruitId === fruitId ? { ...item, quantity: Number(quantity) || 0 } : item,
      )
      console.log("After quantity update:", updatedItems)
      return updatedItems
    })
  }

  const clearCart = () => {
    console.log("Clearing cart")
    setItems([])
  }

  const itemCount = items.reduce((count, item) => count + (Number(item.quantity) || 0), 0)

  const total = items.reduce((sum, item) => {
    const itemPrice = Number(item.price) || 0
    const itemQuantity = Number(item.quantity) || 0
    const itemTotal = itemPrice * itemQuantity
    console.log(`Item: ${item.name}, Price: ${itemPrice}, Quantity: ${itemQuantity}, Total: ${itemTotal}`)
    return sum + itemTotal
  }, 0)

  console.log("Cart state - Items:", items, "Total:", total, "ItemCount:", itemCount)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
