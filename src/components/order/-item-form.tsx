"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

interface Fruit {
  id: string
  name: string
  price: number
  stock: number
}

interface OrderItem {
  fruitId: string
  quantity: number
  price: number
}

interface OrderItemFormProps {
  fruits: Fruit[]
  orderItems: OrderItem[]
  onOrderItemsChange: (items: OrderItem[]) => void
}

export function OrderItemForm({ fruits, orderItems, onOrderItemsChange }: OrderItemFormProps) {
  const [selectedFruitId, setSelectedFruitId] = useState("")
  const [quantity, setQuantity] = useState("")

  const addItem = () => {
    if (!selectedFruitId || !quantity) return

    const fruit = fruits.find((f) => f.id === selectedFruitId)
    if (!fruit) return

    const qty = Number.parseInt(quantity)
    if (qty <= 0 || qty > fruit.stock) return

    // Check if item already exists
    const existingItemIndex = orderItems.findIndex((item) => item.fruitId === selectedFruitId)

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...orderItems]
      const newQuantity = updatedItems[existingItemIndex].quantity + qty

      if (newQuantity <= fruit.stock) {
        updatedItems[existingItemIndex].quantity = newQuantity
        onOrderItemsChange(updatedItems)
      } else {
        alert(`Cannot add more. Maximum stock available: ${fruit.stock}`)
        return
      }
    } else {
      // Add new item
      const newItem: OrderItem = {
        fruitId: selectedFruitId,
        quantity: qty,
        price: fruit.price,
      }
      onOrderItemsChange([...orderItems, newItem])
    }

    // Reset form
    setSelectedFruitId("")
    setQuantity("")
  }

  const removeItem = (index: number) => {
    const updatedItems = orderItems.filter((_, i) => i !== index)
    onOrderItemsChange(updatedItems)
  }

  const updateQuantity = (index: number, newQuantity: number) => {
    const fruit = fruits.find((f) => f.id === orderItems[index].fruitId)
    if (!fruit || newQuantity <= 0 || newQuantity > fruit.stock) return

    const updatedItems = [...orderItems]
    updatedItems[index].quantity = newQuantity
    onOrderItemsChange(updatedItems)
  }

  const getAvailableFruits = () => {
    return fruits.filter((fruit) => {
      const existingItem = orderItems.find((item) => item.fruitId === fruit.id)
      return !existingItem || existingItem.quantity < fruit.stock
    })
  }

  const selectedFruit = fruits.find((f) => f.id === selectedFruitId)

  return (
    <div className="space-y-4">
      {/* Add Item Form */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label>Fruit</Label>
              <Select value={selectedFruitId} onValueChange={setSelectedFruitId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fruit" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableFruits().map((fruit) => (
                    <SelectItem key={fruit.id} value={fruit.id}>
                      {fruit.name} (Stock: {fruit.stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                placeholder="Qty"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                max={selectedFruit?.stock || 1}
              />
            </div>

            <div className="space-y-2">
              <Label>Price</Label>
              <Input value={selectedFruit ? `Rp ${selectedFruit.price.toLocaleString()}` : ""} disabled />
            </div>

            <Button type="button" onClick={addItem} disabled={!selectedFruitId || !quantity}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Order Items List */}
      {orderItems.length > 0 && (
        <div className="space-y-2">
          <Label>Order Items</Label>
          <div className="space-y-2">
            {orderItems.map((item, index) => {
              const fruit = fruits.find((f) => f.id === item.fruitId)
              if (!fruit) return null

              return (
                <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{fruit.name}</p>
                    <p className="text-sm text-gray-500">Rp {item.price.toLocaleString()} each</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(index, Number.parseInt(e.target.value) || 0)}
                      min="1"
                      max={fruit.stock}
                      className="w-20"
                    />
                    <span className="text-sm text-gray-500">/ {fruit.stock}</span>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">Rp {(item.quantity * item.price).toLocaleString()}</p>
                  </div>

                  <Button type="button" variant="destructive" size="sm" onClick={() => removeItem(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
