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
        │   └── products.ts          # getProducts, create, update, delete
        ├── store/
        │   └── authStore.ts
        ├── components/ui/           # Button, Input, Label, Card, Badge, Dialog
        ├── layouts/
        │   └── RootLayout.tsx
        └── pages/
            ├── HomePage.tsx         # product grid (buyer)
            ├── AdminProductsPage.tsx  # CRUD table + dialog (admin)
            ├── LoginPage.tsx
            ├── RegisterPage.tsx
            └── CartPage.tsx
```

## 🚀 Getting Started Day-8

### 1. Flow Overview
```txt
Buyer:  HomePage → getProductsApi() → product grid → Add to Cart (Day-9)
Admin:  AdminProductsPage → getProductsApi() → table
                          → Add Product button → Dialog form → createProductApi()
                          → Edit button → Dialog form (pre-filled) → updateProductApi()
                          → Delete button → confirm → deleteProductApi()
```

### 2. `src/api/products.ts` — product API calls
```ts
import api from './client'

export interface Product {
  id: number; name: string; description?: string
  price: number; stock: number; image?: string
}

export const getProductsApi = async (): Promise<Product[]> => {
  const { data } = await api.get('/products')
  return data.products
}

export const createProductApi = async (payload: Omit<Product, 'id'>): Promise<Product> => {
  const { data } = await api.post('/products', payload)
  return data.product
}

export const updateProductApi = async (id: number, payload: Partial<Omit<Product, 'id'>>): Promise<Product> => {
  const { data } = await api.put(`/products/${id}`, payload)
  return data.product
}

export const deleteProductApi = async (id: number): Promise<void> => {
  await api.delete(`/products/${id}`)
}
```

### 3. `src/pages/HomePage.tsx` — buyer product grid
```tsx
const [products, setProducts] = useState<Product[]>([])

useEffect(() => {
  getProductsApi().then(setProducts)
}, [])

// render a grid of ProductCards
// each card: image, name, description, price, stock badge, Add to Cart button
```

### 4. `src/pages/AdminProductsPage.tsx` — admin CRUD pattern
```tsx
const [products, setProducts] = useState<Product[]>([])
const [open, setOpen] = useState(false)
const [editing, setEditing] = useState<Product | null>(null)  // null = creating new
const [form, setForm] = useState<ProductPayload>(EMPTY_FORM)

// open dialog for create
const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setOpen(true) }

// open dialog pre-filled for edit
const openEdit = (p: Product) => { setEditing(p); setForm({ ...p }); setOpen(true) }

// submit: branch on editing vs creating
const handleSubmit = async (e) => {
  if (editing) await updateProductApi(editing.id, form)
  else         await createProductApi(form)
}

// delete with confirmation
const handleDelete = async (id) => {
  if (!confirm('Delete this product?')) return
  await deleteProductApi(id)
  setProducts((prev) => prev.filter((p) => p.id !== id))
}
```

### 5. Install dependencies
```bash
npm install @radix-ui/react-dialog
```

---

## 🔑 Key Concepts Day-8

```text
useEffect(() => { fetch() }, [])   → run once on mount to load data
setProducts(prev => [...prev, x])  → immutable state update: add item
setProducts(prev => prev.map(...)) → immutable update: replace one item by id
setProducts(prev => prev.filter()) → immutable update: remove item by id
editing === null                   → signals "create mode" vs "edit mode" in the same form
Dialog open/onOpenChange           → controlled dialog — open state lives in parent
confirm()                          → quick delete confirmation without a second modal
line-clamp-2                       → Tailwind: truncate text to 2 lines with ellipsis
```

---

## 🔗 Pages Day-8

```text
/                → HomePage         — public product grid, Add to Cart (enabled Day-9)
/admin/products  → AdminProductsPage — full CRUD table with Dialog form (ADMIN only)
```
