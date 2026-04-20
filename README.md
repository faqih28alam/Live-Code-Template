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
backend/
├── prisma/
│   └── schema.prisma       
├── src/
│   ├── app.ts
│   ├── models/
│   │   └── auth-model.ts
│   ├── controllers/
│   │   └── auth-controller.ts
│   ├── routes/
│   │   └── auth-route.ts
│   ├── middlewares/
│   │   ├── auth-middleware.ts
│   │   └── cors.ts
│   ├── validations/
│   │   └── joi.ts       
│   ├── utils/
│   │   ├── jwt.ts
│   │   └── prisma.ts
│   └── prisma.config.ts
├── .env
├── .gitignore
├── package.json
└── tsconfig.json
```

## 🚀 Getting Started Day-4
### 1. Flow Overview
```txt
Request → product-route.ts → auth-middleware.ts (authenticate + authorizeAdmin) → product-controller.ts → joi.ts (validate) → product-model.ts (DB) → Response
```

### 2. `src/routes/product-route.ts` — define endpoints
```ts
import { Router } from 'express'
import {
  handleGetProducts,
  handleGetProductById,
  handleCreateProduct,
  handleUpdateProduct,
  handleDeleteProduct,
} from '../controllers/product-controller'
import { authenticate, authorizeAdmin } from '../middlewares/auth-middleware'

const router = Router()

router.get('/',     handleGetProducts)                                    // PUBLIC: all buyers & guests
router.get('/:id',  handleGetProductById)                                 // PUBLIC: all buyers & guests
router.post('/',    authenticate, authorizeAdmin, handleCreateProduct)    // ADMIN only
router.put('/:id',  authenticate, authorizeAdmin, handleUpdateProduct)    // ADMIN only
router.delete('/:id', authenticate, authorizeAdmin, handleDeleteProduct)  // ADMIN only

export default router
```

### 3. `src/app.ts` — mount product route
```ts
import express from 'express'
import cors from 'cors'
import authRoute from './routes/auth-route'
import productRoute from './routes/product-route'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth',     authRoute)
app.use('/api/products', productRoute)

export default app
```

### 4. `src/validations/joi.ts` — add product schema
```ts
export const productSchema = Joi.object({
  name:        Joi.string().required(),
  description: Joi.string().optional(),
  price:       Joi.number().positive().required(),
  stock:       Joi.number().integer().min(0).required(),
  image:       Joi.string().uri().optional(),
})
```

### 5. `src/models/product-model.ts` — DB operations
```ts
import prisma from '../utils/prisma'

export const getProducts = async () => {
  return prisma.product.findMany()
}

export const getProductById = async (id: number) => {
  return prisma.product.findUnique({ where: { id } })
}

export const createProduct = async (data: {
  name: string
  description?: string
  price: number
  stock: number
  image?: string
}) => {
  return prisma.product.create({ data })
}

export const updateProduct = async (id: number, data: {
  name?: string
  description?: string
  price?: number
  stock?: number
  image?: string
}) => {
  return prisma.product.update({ where: { id }, data })
}

export const deleteProduct = async (id: number) => {
  return prisma.product.delete({ where: { id } })
}
```

### 6. `src/controllers/product-controller.ts` — handle req/res
```ts
import { Request, Response } from 'express'
import { productSchema } from '../validations/joi'
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../models/product-model'

export const handleGetProducts = async (req: Request, res: Response) => {
  try {
    const products = await getProducts()
    res.status(200).json({ message: 'Success', products })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const handleGetProductById = async (req: Request, res: Response) => {
  try {
    const product = await getProductById(Number(req.params.id))
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.status(200).json({ message: 'Success', product })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const handleCreateProduct = async (req: Request, res: Response) => {
  const { error, value } = productSchema.validate(req.body)
  if (error) return res.status(400).json({ message: error.message })

  try {
    const product = await createProduct(value)
    res.status(201).json({ message: 'Product created', product })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const handleUpdateProduct = async (req: Request, res: Response) => {
  const { error, value } = productSchema.validate(req.body)
  if (error) return res.status(400).json({ message: error.message })

  try {
    const product = await updateProduct(Number(req.params.id), value)
    res.status(200).json({ message: 'Product updated', product })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const handleDeleteProduct = async (req: Request, res: Response) => {
  try {
    await deleteProduct(Number(req.params.id))
    res.status(200).json({ message: 'Product deleted' })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}
```

### 7. Install dependencies
```bash
npm i joi                 # already installed on Day-3, skip if done
```

---

## 🔑 Key Concepts Day-4

```text
router.get()            → public route, no middleware needed
router.post/put/delete  → protected: always pass authenticate + authorizeAdmin
authenticate            → verifies JWT token from Authorization header
authorizeAdmin          → checks req.user.role === 'ADMIN'
findMany()              → get all records
findUnique()            → get one record by unique field (id)
create()                → insert new record
update()                → update record by id
delete()                → delete record by id
Number(req.params.id)   → params are strings by default, cast to number for Prisma
```

---

## 🔗 API Endpoints Day-4

```text
GET    /api/products        → PUBLIC  — get all products
GET    /api/products/:id    → PUBLIC  — get product by id
POST   /api/products        → ADMIN   — create product
PUT    /api/products/:id    → ADMIN   — update product
DELETE /api/products/:id    → ADMIN   — delete product
```