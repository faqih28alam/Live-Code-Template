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
│   │   ├── auth-model.ts
│   │   ├── product-model.ts
│   │   └── cart-model.ts
│   ├── controllers/
│   │   ├── auth-controller.ts
│   │   ├── product-controller.ts
│   │   └── cart-controller.ts
│   ├── routes/
│   │   ├── auth-route.ts
│   │   ├── product-route.ts
│   │   └── cart-route.ts
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

## 🚀 Getting Started Day-5

### 1. Flow Overview
```txt
Request → cart-route.ts → authenticate → authorizeRole('BUYER') → cart-controller.ts → joi.ts (validate) → cart-model.ts (DB) → Response
```

### 2. `src/middlewares/auth-middleware.ts` — add `authorizeRole`
```ts
// generic role guard — replaces hardcoded authorizeAdmin for new routes
export const authorizeRole = (role: 'ADMIN' | 'BUYER') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) return res.status(403).json({ message: `${role} only` })
    next()
  }
}
```

### 3. `src/validations/joi.ts` — add cart schemas
```ts
export const cartItemSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  quantity:  Joi.number().integer().min(1).default(1),
})

export const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required(),
})
```

### 4. `src/models/cart-model.ts` — DB operations
```ts
import prisma from '../utils/prisma'

export const getOrCreateCart = async (userId: number) => {
  return prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: { items: { include: { product: true } } },
  })
}

export const getCartByUserId = async (userId: number) => {
  return prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  })
}

export const addCartItem = async (userId: number, productId: number, quantity: number) => {
  const cart = await getOrCreateCart(userId)
  const existing = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productId } })

  if (existing) {
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
      include: { product: true },
    })
  }

  return prisma.cartItem.create({
    data: { cartId: cart.id, productId, quantity },
    include: { product: true },
  })
}

export const updateCartItem = async (itemId: number, userId: number, quantity: number) => {
  const item = await prisma.cartItem.findFirst({ where: { id: itemId, cart: { userId } } })
  if (!item) return null
  return prisma.cartItem.update({ where: { id: itemId }, data: { quantity }, include: { product: true } })
}

export const removeCartItem = async (itemId: number, userId: number) => {
  const item = await prisma.cartItem.findFirst({ where: { id: itemId, cart: { userId } } })
  if (!item) return null
  return prisma.cartItem.delete({ where: { id: itemId } })
}

export const clearCart = async (userId: number) => {
  const cart = await prisma.cart.findUnique({ where: { userId } })
  if (!cart) return null
  return prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
}
```

### 5. `src/controllers/cart-controller.ts` — handle req/res
```ts
import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth-middleware'
import { cartItemSchema, updateCartItemSchema } from '../validations/joi'
import { getCartByUserId, addCartItem, updateCartItem, removeCartItem, clearCart } from '../models/cart-model'

export const handleGetCart = async (req: AuthRequest, res: Response) => {
  try {
    const cart = await getCartByUserId(req.user.id)
    res.status(200).json({ message: 'Success', cart })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const handleAddCartItem = async (req: AuthRequest, res: Response) => {
  const { error, value } = cartItemSchema.validate(req.body)
  if (error) return res.status(400).json({ message: error.message })

  try {
    const item = await addCartItem(req.user.id, value.productId, value.quantity)
    res.status(201).json({ message: 'Item added to cart', item })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const handleUpdateCartItem = async (req: AuthRequest, res: Response) => {
  const { error, value } = updateCartItemSchema.validate(req.body)
  if (error) return res.status(400).json({ message: error.message })

  try {
    const item = await updateCartItem(Number(req.params.itemId), req.user.id, value.quantity)
    if (!item) return res.status(404).json({ message: 'Cart item not found' })
    res.status(200).json({ message: 'Cart item updated', item })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const handleRemoveCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const item = await removeCartItem(Number(req.params.itemId), req.user.id)
    if (!item) return res.status(404).json({ message: 'Cart item not found' })
    res.status(200).json({ message: 'Cart item removed' })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const handleClearCart = async (req: AuthRequest, res: Response) => {
  try {
    await clearCart(req.user.id)
    res.status(200).json({ message: 'Cart cleared' })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}
```

### 6. `src/routes/cart-route.ts` — define endpoints
```ts
import { Router } from 'express'
import { handleGetCart, handleAddCartItem, handleUpdateCartItem, handleRemoveCartItem, handleClearCart } from '../controllers/cart-controller'
import { authenticate, authorizeRole } from '../middlewares/auth-middleware'

const router = Router()

router.use(authenticate, authorizeRole('BUYER'))  // all cart routes: buyers only

router.get('/',                   handleGetCart)          // GET    /api/cart
router.post('/items',             handleAddCartItem)       // POST   /api/cart/items
router.put('/items/:itemId',      handleUpdateCartItem)    // PUT    /api/cart/items/:itemId
router.delete('/items/:itemId',   handleRemoveCartItem)    // DELETE /api/cart/items/:itemId
router.delete('/',                handleClearCart)         // DELETE /api/cart

export default router
```

### 7. `src/app.ts` — mount cart route
```ts
import cartRoute from './routes/cart-route'

app.use('/api/cart', cartRoute)
```

---

## 🔑 Key Concepts Day-5

```text
upsert()               → create if not exists, update if exists (used for auto-creating cart)
findFirst()            → find one record matching any condition (not just unique fields)
deleteMany()           → delete multiple records at once (used for clearCart)
include: { product }   → eager-load related product data in the response
router.use(middleware) → apply middleware to ALL routes in this router
authorizeRole('BUYER') → generic role guard, reusable for any role
cart: { userId }       → nested where filter: find item WHERE cart.userId = x (ownership check)
```

---

## 🔗 API Endpoints Day-5

```text
GET    /api/cart                  → BUYER — get cart with all items
POST   /api/cart/items            → BUYER — add item (auto-increments if already in cart)
PUT    /api/cart/items/:itemId    → BUYER — update item quantity
DELETE /api/cart/items/:itemId    → BUYER — remove single item
DELETE /api/cart                  → BUYER — clear entire cart
```
