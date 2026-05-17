import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCartApi, updateCartItemApi, removeCartItemApi, clearCartApi, type Cart, type CartItem } from '@/api/cart'
import { useCartStore } from '@/store/cartStore'

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const setCount = useCartStore((s) => s.setCount)

  useEffect(() => {
    getCartApi()
      .then((data) => {
        setCart(data)
        setCount(data?.items.length ?? 0)
      })
      .finally(() => setLoading(false))
  }, [setCount])

  const updateQuantity = async (item: CartItem, delta: number) => {
    const newQty = item.quantity + delta
    if (newQty < 1) return

    const updated = await updateCartItemApi(item.id, newQty)
    setCart((prev) =>
      prev ? { ...prev, items: prev.items.map((i) => (i.id === updated.id ? updated : i)) } : prev
    )
  }

  const removeItem = async (itemId: number) => {
    await removeCartItemApi(itemId)
    setCart((prev) =>
      prev ? { ...prev, items: prev.items.filter((i) => i.id !== itemId) } : prev
    )
    setCount(useCartStore.getState().count - 1)
  }

  const clearCart = async () => {
    if (!confirm('Clear your entire cart?')) return
    await clearCartApi()
    setCart((prev) => (prev ? { ...prev, items: [] } : prev))
    setCount(0)
  }

  const total = cart?.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0) ?? 0

  if (loading) return <p className="text-muted-foreground">Loading cart…</p>

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-xl font-semibold">Your cart is empty</p>
        <Link to="/">
          <Button variant="outline">Browse Products</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Cart</h1>
        <Button variant="outline" size="sm" onClick={clearCart}>
          Clear Cart
        </Button>
      </div>

      <div className="border rounded-lg divide-y">
        {cart.items.map((item) => (
          <CartRow
            key={item.id}
            item={item}
            onIncrease={() => updateQuantity(item, 1)}
            onDecrease={() => updateQuantity(item, -1)}
            onRemove={() => removeItem(item.id)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <span className="text-lg font-semibold">Total</span>
        <span className="text-2xl font-bold">${total.toFixed(2)}</span>
      </div>

      <Button className="w-full" size="lg" disabled>
        Checkout — coming Day-10
      </Button>
    </div>
  )
}

function CartRow({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  item: CartItem
  onIncrease: () => void
  onDecrease: () => void
  onRemove: () => void
}) {
  const subtotal = item.product.price * item.quantity

  return (
    <div className="flex items-center gap-4 p-4">
      {item.product.image ? (
        <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded-md" />
      ) : (
        <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
          No img
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{item.product.name}</p>
        <p className="text-sm text-muted-foreground">${item.product.price.toFixed(2)} each</p>
      </div>

      {/* quantity controls */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={onDecrease} disabled={item.quantity <= 1}>
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={onIncrease}>
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <p className="w-20 text-right font-semibold">${subtotal.toFixed(2)}</p>

      <Button variant="ghost" size="icon" onClick={onRemove}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  )
}
