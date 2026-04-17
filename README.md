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

## 🚀 Getting Started Day-3
### 1. Setup Auth (Authentication & Authorization)
```txt
1. work with app.ts
2. work with cors.ts
2. work with auth-route.ts (end-point for Register & Login)
3. work with auth-controller.ts (handleRegister & handleLogin)
4. work with joi.ts (registerSchema & loginSchema)
5. work with auth-model.ts (registerUser & loginUser)
6. work with jwt.ts & bcrypt
```

`src/app.ts` — mount auth route
```ts
import express from 'express'
import cors from 'cors'
import authRoute from './routes/auth-route'

const app = express()
const port = 3000;

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoute)     // mount: POST /api/auth/register & /api/auth/login

app.use('/health', (req, res) => {
    res.send("Backend Health: Ok")
})

app.listen(
    port,
    () => { console.log(`Server running on http://localhost:${port}`) }
);

export default app
```
`src/middlewares/cors.ts` — tell browsers which origins can read responses from your server.
```ts
import cors from 'cors';

// this only works on frontend, cant test with postman
const corsMiddleware = cors({
    origin: ['http://localhost:5173', 'kilau.ai', ], // ganti dengan URL front-end kamu
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],  // set the allowed HTTP methods
    credentials: true,                                  // allow credentials
});

export default corsMiddleware;
```
```bash
npm i cors           # install cors to  tell browsers which origins can read responses from your server.
npm i -D @types/cors
```
`src/routes/auth-route.ts` — define endpoints
```ts
import { Router } from 'express'
import { handleRegister, handleLogin } from '../controllers/auth-controller'

const router = Router()

router.post('/register', handleRegister)
router.post('/login', handleLogin)

export default router
```

`src/validations/joi.ts` — validate request body
```ts
import Joi from 'joi'

export const registerSchema = Joi.object({
  name:     Joi.string().required(),
  email:    Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role:     Joi.string().valid('ADMIN', 'BUYER').default('BUYER'),
})

export const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
})
```
```bash
npm i joi           # install joi for validation
npm i -D @types/joi
```

`src/utils/jwt.ts` — sign & verify token
```ts
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET as string

export const signToken = (payload: object): string => {
  return jwt.sign(payload, SECRET, { expiresIn: '1d' })
}

export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET)   // throws if invalid/expired
}
```
```bash
npm i jsonwebtoken
npm i -D @types/jsonwebtoken
```

`src/models/auth-model.ts` — DB operations
```ts
import prisma from '../utils/prisma'
import bcrypt from 'bcrypt'

export const registerUser = async (name: string, email: string, password: string, role: 'ADMIN' | 'BUYER') => {
  const hashed = await bcrypt.hash(password, 10)        // hash password before saving
  return prisma.user.create({
    data: { name, email, password: hashed, role },
  })
}

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error('User not found')

  const valid = await bcrypt.compare(password, user.password)   // compare plain vs hashed
  if (!valid) throw new Error('Invalid password')

  return user
}
```
```bash
npm i bcrypt
npm i -D @types/bcrypt
```

`src/controllers/auth-controller.ts` — handle req/res
```ts
import { Request, Response } from 'express'
import { registerSchema, loginSchema } from '../validations/joi'
import { registerUser, loginUser } from '../models/auth-model'
import { signToken } from '../utils/jwt'

export const handleRegister = async (req: Request, res: Response) => {
  const { error, value } = registerSchema.validate(req.body)
  if (error) return res.status(400).json({ message: error.message })

  try {
    const user = await registerUser(value.name, value.email, value.password, value.role)
    res.status(201).json({ message: 'Register success', user })
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
}

export const handleLogin = async (req: Request, res: Response) => {
  const { error, value } = loginSchema.validate(req.body)
  if (error) return res.status(400).json({ message: error.message })

  try {
    const user = await loginUser(value.email, value.password)
    const token = signToken({ id: user.id, role: user.role })   // embed role in token
    res.status(200).json({ message: 'Login success', token })
  } catch (err: any) {
    res.status(401).json({ message: err.message })
  }
}
```

`src/middlewares/auth-middleware.ts` — protect routes
```ts
import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'

export interface AuthRequest extends Request {
  user?: any    // attach decoded token payload to req.user
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]  // Bearer 
  if (!token) return res.status(401).json({ message: 'No token provided' })

  try {
    req.user = verifyToken(token)
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

export const authorizeAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ message: 'Admin only' })
  next()
}
```

---

## 🔑 Key Concepts Day-3

```text
bcrypt.hash()       → hash plain password before storing in DB
bcrypt.compare()    → compare plain input vs stored hash
jwt.sign()          → create token with payload + secret + expiry
jwt.verify()        → decode & validate token (throws if invalid)
Joi.validate()      → validate req.body shape before hitting DB
authenticate        → middleware: checks token exists & is valid
authorizeAdmin      → middleware: checks role === 'ADMIN' from token
req.user            → custom field on Request to carry decoded token data
```

---

## 🔗 Middleware Usage (preview for Day-4)

```ts
// how authenticate & authorizeAdmin will be used on routes:
router.post('/products', authenticate, authorizeAdmin, handleCreateProduct)
//                           ↑ check token       ↑ check role
```
