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
├── backend/                         # Express + Prisma API
└── frontend/
    └── src/
        ├── api/
        │   ├── client.ts            # axios instance + JWT interceptor
        │   └── auth.ts              # login / register API calls
        ├── store/
        │   └── authStore.ts         # Zustand auth store (persisted)
        ├── components/ui/           # ShadCN: Button, Input, Label, Card
        ├── layouts/
        │   └── RootLayout.tsx       # navbar reflects auth state
        ├── pages/
        │   ├── LoginPage.tsx        # login form
        │   ├── RegisterPage.tsx     # register form
        │   ├── HomePage.tsx
        │   ├── CartPage.tsx
        │   └── AdminProductsPage.tsx
        └── lib/utils.ts
```

## 🚀 Getting Started Day-7

### 1. Flow Overview
```txt
Form submit → api/auth.ts (axios POST) → backend → token returned
           → decode JWT payload (atob) → setAuth(user, token) in Zustand
           → token persisted to localStorage → axios interceptor attaches it to all future requests
```

### 2. `src/store/authStore.ts` — Zustand auth state
```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User { id: number; role: 'ADMIN' | 'BUYER'; name: string }

interface AuthStore {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'auth' }   // saves to localStorage under key "auth"
  )
)
```

### 3. `src/api/client.ts` — axios instance with JWT interceptor
```ts
import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:3000/api' })

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('auth')
  if (stored) {
    const { state } = JSON.parse(stored)
    if (state?.token) config.headers.Authorization = `Bearer ${state.token}`
  }
  return config
})

export default api
```

### 4. `src/api/auth.ts` — login / register calls
```ts
import api from './client'

export const loginApi = async (payload: { email: string; password: string }) => {
  const { data } = await api.post('/auth/login', payload)
  return data as { token: string }
}

export const registerApi = async (payload: RegisterPayload) => {
  const { data } = await api.post('/auth/register', payload)
  return data
}
```

### 5. `src/pages/LoginPage.tsx` — login form pattern
```tsx
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault()
  try {
    const { token } = await loginApi({ email, password })
    // decode JWT payload without a library
    const payload = JSON.parse(atob(token.split('.')[1]!))
    setAuth({ id: payload.id, role: payload.role, name: payload.name }, token)
    navigate('/')
  } catch (err) {
    setError(err.response?.data?.message ?? 'Login failed')
  }
}
```

### 6. `src/layouts/RootLayout.tsx` — navbar reacts to auth state
```tsx
const { user, logout } = useAuthStore()

// logged out → show Login + Register buttons
// logged in  → show username, role-based links, logout icon
```

### 7. Install dependencies
```bash
npm install zustand axios
```

---

## 🔑 Key Concepts Day-7

```text
zustand / persist       → global state that survives page refresh (localStorage)
useAuthStore(s => s.x)  → selector pattern — only re-renders when selected value changes
atob(token.split('.')[1])  → decode JWT payload client-side — no library needed
axios interceptor        → automatically attaches Authorization header to every request
controlled input         → value + onChange on every <Input> — React owns the form state
navigate('/')            → programmatic redirect after login
```

---

## 🔗 Pages Day-7

```text
/login     → LoginPage    — email + password form, redirects to / on success
/register  → RegisterPage — full registration form, redirects to /login on success
```
