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
│   └── schema.prisma       ← define all models here
├── src/
│   ├── app.ts
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   ├── validations/
│   │   └── joi.ts       
│   ├── utils/
│   │   └── jwt.ts
│   └── index.js
├── .env
├── package.json
└── tsconfig.json
```

## 🚀 Getting Started Day-2
### 1. Define Prisma Schema

edit `prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  BUYER
}

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(BUYER)
  cart      Cart?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Product {
  id          Int        @id @default(autoincrement())
  name        String
  description String?
  price       Float
  stock       Int        @default(0)
  image       String?
  cartItems   CartItem[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Cart {
  id        Int        @id @default(autoincrement())
  userId    Int        @unique
  user      User       @relation(fields: [userId], references: [id])
  items     CartItem[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model CartItem {
  id        Int      @id @default(autoincrement())
  cartId    Int
  cart      Cart     @relation(fields: [cartId], references: [id])
  productId Int
  product   Product  @relation(fields: [productId], references: [id])
  quantity  Int      @default(1)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```
### 2. Run Migration
```bash
npx prisma migrate dev --name init      # create migration file + apply to DB
npx prisma generate                     # generate Prisma Client from schema so Code will understand the context
```

### 3. Setup Prisma Client (singleton)

create `src/utils/prisma.ts`
```ts
// singleton pattern: reuse one PrismaClient instance across the app
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default prisma
```

### 4. Verify with Prisma Studio
```bash
npx prisma studio       # opens browser UI at localhost:5555 to inspect DB tables
```



### 📝 Note: If Database Already Exists
```bash
npx prisma db pull      # introspect existing DB → auto-update schema.prisma
npx prisma generate     # regenerate Prisma Client from updated schema
```
> Use this instead of `migrate dev` when the DB tables are already created externally.