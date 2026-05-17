```text
Day 1: Project setup (folder structure, Express server, Prisma init, PostgreSQL connection)
Day 2: Prisma schema (User, Product, Cart, CartItem models + migrations)
Day 3: Auth (register/login, JWT, role-based middleware)
Day 4: Product CRUD API (admin only for CUD, public READ)
Day 5: Cart API (buyer: add, read, update, delete cart items)
Day 6: React setup (Vite, Tailwind, ShadCN, folder structure, routing)
Day 7: Auth UI (login/register pages, auth state with Zustand/Context)
Day 8: Product UI (product list for buyer, full CRUD UI for admin)
Day 9: Cart UI (cart page, add/remove/update items)
Day 10: Polish (role-based route guards, loading states, error handling)
```

```
mini-store/
├── backend/
└── frontend/
    └── src/
        ├── api/
        │   ├── client.ts
        │   ├── auth.ts
        │   ├── products.ts
        │   └── cart.ts              # getCart, addToCart, updateItem, removeItem, clearCart
        ├── store/
        │   ├── authStore.ts
        │   └── cartStore.ts         # item count for navbar badge
        ├── components/ui/
        ├── layouts/
        │   └── RootLayout.tsx       # cart count badge on navbar icon
        └── pages/
            ├── HomePage.tsx         # Add to Cart wired up
            ├── CartPage.tsx         # full cart UI
            ├── AdminProductsPage.tsx
            ├── LoginPage.tsx
            └── RegisterPage.tsx
```

## 🚀 Getting Started Day-9

### 1. Flow Overview
```txt
HomePage → Add to Cart → addToCartApi() → increment cartStore count → badge updates in navbar
CartPage → getCartApi() → setCount(items.length) → render items
         → +/- buttons → updateCartItemApi() → update local state
         → trash icon  → removeCartItemApi() → filter item from list
         → Clear Cart  → clearCartApi()      → empty items list
```

### 2. `src/api/cart.ts` — cart API calls
```ts
import api from './client'

export const getCartApi    = async () => { const { data } = await api.get('/cart'); return data.cart }
export const addToCartApi  = async (productId, quantity = 1) => { const { data } = await api.post('/cart/items', { productId, quantity }); return data.item }
export const updateCartItemApi = async (itemId, quantity)   => { const { data } = await api.put(`/cart/items/${itemId}`, { quantity }); return data.item }
export const removeCartItemApi = async (itemId) => api.delete(`/cart/items/${itemId}`)
export const clearCartApi      = async ()       => api.delete('/cart')
```

### 3. `src/store/cartStore.ts` — count for navbar badge
```ts
import { create } from 'zustand'

export const useCartStore = create((set) => ({
  count: 0,
  setCount:  (n) => set({ count: n }),
  increment: ()  => set((s) => ({ count: s.count + 1 })),
  decrement: ()  => set((s) => ({ count: Math.max(0, s.count - 1) })),
}))
```

### 4. `src/pages/HomePage.tsx` — Add to Cart button
```tsx
const handleAddToCart = async () => {
  if (!user) { navigate('/login'); return }   // redirect guests

  setAdding(true)
  await addToCartApi(product.id)
  increment()                                  // update navbar badge
  setAdded(true)
  setTimeout(() => setAdded(false), 1500)      // flash "Added!" then reset
  setAdding(false)
}

// button label: "Add to Cart" → "Adding…" → "Added!" → "Add to Cart"
// disabled when: out of stock, currently adding, or user is ADMIN
```

### 5. `src/pages/CartPage.tsx` — cart UI
```tsx
// load cart and sync count on mount
useEffect(() => {
  getCartApi().then((data) => {
    setCart(data)
    setCount(data?.items.length ?? 0)    // sync navbar badge
  })
}, [])

// quantity controls: +/- buttons, min 1
const updateQuantity = async (item, delta) => {
  const newQty = item.quantity + delta
  if (newQty < 1) return
  const updated = await updateCartItemApi(item.id, newQty)
  setCart((prev) => ({ ...prev, items: prev.items.map((i) => i.id === updated.id ? updated : i) }))
}

// running total
const total = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
```

### 6. `src/layouts/RootLayout.tsx` — cart badge
```tsx
const cartCount = useCartStore((s) => s.count)

// in navbar:
<Link to="/cart" className="relative">
  <Button variant="ghost" size="icon"><ShoppingCart /></Button>
  {cartCount > 0 && (
    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
      {cartCount}
    </span>
  )}
</Link>
```

---

## 🔑 Key Concepts Day-9

```text
cartStore (no persist)       → session-only state; rehydrated from API on CartPage mount
setCount(items.length)       → sync store with server truth when CartPage loads
increment()                  → optimistic update on add — feels instant without refetch
prev.items.map(i => ...)     → immutable update: replace one cart item after quantity change
prev.items.filter(...)       → immutable update: remove item after delete
absolute -top-1 -right-1     → Tailwind trick for badge positioned over an icon
disabled={user?.role==='ADMIN'} → admins can't add to cart (they manage products instead)
```

---

## 🔗 Pages Day-9

```text
/       → HomePage    — Add to Cart now fully wired (redirects guests to /login)
/cart   → CartPage    — view items, update qty with +/-, remove, clear, running total
```
