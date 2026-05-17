```text
Day 1:  Project setup (folder structure, Express server, Prisma init, PostgreSQL connection)
Day 2:  Prisma schema (User, Product, Cart, CartItem models + migrations)
Day 3:  Auth (register/login, JWT, role-based middleware)
Day 4:  Product CRUD API (admin only for CUD, public READ)
Day 5:  Cart API (buyer: add, read, update, delete cart items)
Day 6:  React setup (Vite, Tailwind, ShadCN, folder structure, routing)
Day 7:  Auth UI (login/register pages, auth state with Zustand/Context)
Day 8:  Product UI (product list for buyer, full CRUD UI for admin)
Day 9:  Cart UI (cart page, add/remove/update items)
Day 10: Polish (role-based route guards, loading states, error handling)
```

```
mini-store/
├── backend/
└── frontend/
    └── src/
        ├── api/
        │   ├── client.ts            # axios + JWT interceptor + global 401 handler
        │   ├── auth.ts
        │   ├── products.ts
        │   └── cart.ts
        ├── store/
        │   ├── authStore.ts
        │   └── cartStore.ts
        ├── components/
        │   ├── ProtectedRoute.tsx   # guards by auth + role
        │   ├── GuestRoute.tsx       # redirects logged-in users
        │   └── ui/
        │       ├── spinner.tsx      # loading spinner
        │       ├── error-message.tsx
        │       ├── button.tsx
        │       ├── input.tsx
        │       ├── label.tsx
        │       ├── card.tsx
        │       ├── badge.tsx
        │       └── dialog.tsx
        ├── layouts/
        │   └── RootLayout.tsx
        └── pages/
            ├── HomePage.tsx
            ├── LoginPage.tsx
            ├── RegisterPage.tsx
            ├── CartPage.tsx
            ├── AdminProductsPage.tsx
            └── NotFoundPage.tsx     # 404
```

## 🚀 Getting Started Day-10

### 1. What changed
```txt
App.tsx        → routes wrapped in ProtectedRoute / GuestRoute
client.ts      → response interceptor: 401 → auto logout + redirect to /login
All pages      → consistent Spinner on load, ErrorMessage on error
CartPage.tsx   → fixed decrement() usage (removed direct getState() call)
```

### 2. Route Guards in `src/App.tsx`
```tsx
<Routes>
  <Route element={<RootLayout />}>
    <Route index element={<HomePage />} />               {/* public */}

    <Route element={<GuestRoute />}>                     {/* logged-in → redirect to / */}
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Route>

    <Route element={<ProtectedRoute role="BUYER" />}>    {/* unauthenticated → /login, ADMIN → / */}
      <Route path="/cart" element={<CartPage />} />
    </Route>

    <Route element={<ProtectedRoute role="ADMIN" />}>    {/* unauthenticated → /login, BUYER → / */}
      <Route path="/admin/products" element={<AdminProductsPage />} />
    </Route>

    <Route path="*" element={<NotFoundPage />} />        {/* 404 */}
  </Route>
</Routes>
```

### 3. `src/components/ProtectedRoute.tsx`
```tsx
export default function ProtectedRoute({ role }: { role?: 'ADMIN' | 'BUYER' }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return <Outlet />
}
```

### 4. `src/components/GuestRoute.tsx`
```tsx
export default function GuestRoute() {
  const user = useAuthStore((s) => s.user)
  if (user) return <Navigate to="/" replace />
  return <Outlet />
}
```

### 5. Global 401 handling in `src/api/client.ts`
```ts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()   // clear token from store + localStorage
      window.location.href = '/login'    // hard redirect (bypasses React Router)
    }
    return Promise.reject(error)
  }
)
```

### 6. Reusable loading & error components
```tsx
// src/components/ui/spinner.tsx
export function Spinner({ className }) {
  return <div className={cn('animate-spin rounded-full border-2 border-muted border-t-primary h-6 w-6', className)} />
}

// src/components/ui/error-message.tsx
export function ErrorMessage({ message }) {
  return (
    <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
      {message}
    </div>
  )
}

// usage in any page:
if (loading) return <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
if (error)   return <ErrorMessage message={error} />
```

---

## 🔑 Key Concepts Day-10

```text
<Navigate to="..." replace />     → redirect without adding to browser history
<Outlet />                        → renders the matched child route (guard is a layout wrapper)
role-based guard                  → same ProtectedRoute component, different role prop
GuestRoute                        → prevents /login flash for already-authenticated users
interceptors.response             → runs on every API response — ideal for global error handling
useAuthStore.getState()           → access Zustand outside React (no hook, safe in interceptors)
window.location.href              → hard redirect — ensures all React state is cleared cleanly
401 vs 403                        → 401 = not authenticated (no/bad token), 403 = wrong role
Spinner / ErrorMessage            → extract once, use everywhere — consistent UX without repetition
```

---

## ✅ Complete API Reference

### Backend `http://localhost:3000`
```text
POST   /api/auth/register           → register user
POST   /api/auth/login              → login, returns JWT

GET    /api/products                → public — list all products
GET    /api/products/:id            → public — single product
POST   /api/products                → ADMIN — create product
PUT    /api/products/:id            → ADMIN — update product
DELETE /api/products/:id            → ADMIN — delete product

GET    /api/cart                    → BUYER — get cart with items
POST   /api/cart/items              → BUYER — add item
PUT    /api/cart/items/:itemId      → BUYER — update quantity
DELETE /api/cart/items/:itemId      → BUYER — remove item
DELETE /api/cart                    → BUYER — clear cart
```

### Frontend routes `http://localhost:5173`
```text
/                  → product grid (public)
/login             → login form (guest only)
/register          → register form (guest only)
/cart              → cart page (BUYER only)
/admin/products    → product CRUD (ADMIN only)
```
