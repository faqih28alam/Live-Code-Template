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
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── app.ts
│   │   ├── models/            # auth, product, cart
│   │   ├── controllers/       # auth, product, cart
│   │   ├── routes/            # auth, product, cart
│   │   ├── middlewares/       # auth-middleware, cors
│   │   ├── validations/
│   │   │   └── joi.ts
│   │   └── utils/             # jwt, prisma
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── ui/            # ShadCN components (Button, ...)
    │   ├── layouts/
    │   │   └── RootLayout.tsx
    │   ├── pages/
    │   │   ├── HomePage.tsx
    │   │   ├── LoginPage.tsx
    │   │   ├── RegisterPage.tsx
    │   │   ├── CartPage.tsx
    │   │   └── AdminProductsPage.tsx
    │   ├── lib/
    │   │   └── utils.ts       # cn() helper
    │   ├── App.tsx            # router setup
    │   ├── main.tsx
    │   └── index.css          # Tailwind v4 + ShadCN CSS vars
    ├── components.json        # ShadCN config
    ├── vite.config.ts
    └── tsconfig.app.json
```

## 🚀 Getting Started Day-6

### 1. Stack
```txt
Vite + React + TypeScript  →  bundler & dev server
Tailwind CSS v4            →  utility-first styling
ShadCN                     →  pre-built accessible UI components
React Router v7            →  client-side routing
```

### 2. Install & run
```bash
cd mini-store/frontend
npm install
npm run dev      # http://localhost:5173
```

### 3. `vite.config.ts` — Tailwind v4 plugin + path alias
```ts
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

### 4. `src/index.css` — Tailwind v4 + ShadCN theme
```css
@import "tailwindcss";

/* ShadCN CSS variables */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... other tokens ... */
}

/* Register as Tailwind v4 theme tokens so bg-background, text-foreground etc work */
@theme inline {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-border: hsl(var(--border));
  /* ... */
}
```

### 5. `src/lib/utils.ts` — ShadCN `cn()` helper
```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 6. `src/App.tsx` — routing setup
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RootLayout from '@/layouts/RootLayout'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import CartPage from '@/pages/CartPage'
import AdminProductsPage from '@/pages/AdminProductsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

### 7. `src/layouts/RootLayout.tsx` — shared header with `<Outlet />`
```tsx
import { Link, Outlet } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">Mini Store</Link>
          <nav className="flex items-center gap-4">
            {/* nav links */}
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />   {/* child routes render here */}
      </main>
    </div>
  )
}
```

---

## 🔑 Key Concepts Day-6

```text
@import "tailwindcss"        → Tailwind v4: no config file, just import in CSS
@theme inline { }            → register CSS variables as Tailwind utility tokens
cn()                         → merges Tailwind classes safely (clsx + tailwind-merge)
components.json              → ShadCN config: tells CLI where to put components, which CSS to use
<BrowserRouter>              → wraps the whole app to enable routing
<Routes> + <Route>           → declarative route definitions
<Outlet />                   → renders the matched child route inside a layout
@/ alias                     → maps to src/ — use instead of long relative paths
```

---

## 🔗 Routes Day-6

```text
/                   → HomePage         (public)
/login              → LoginPage        (public)
/register           → RegisterPage     (public)
/cart               → CartPage         (buyer, protected in Day-10)
/admin/products     → AdminProductsPage (admin, protected in Day-10)
```
