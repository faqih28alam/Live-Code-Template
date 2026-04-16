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

## 📥 Case: Database Already Exists (No Migrations Yet)

Use this when the PostgreSQL tables were created externally (e.g. from a SQL dump, another tool, or a teammate's setup) and you have **no migration history** locally.

```bash
npx prisma db pull    # introspects the existing DB and auto-updates schema.prisma to match it
npx prisma generate   # regenerates Prisma Client from the updated schema
```

> ⚠️ Do **not** run `migrate dev` here — it will try to diff against an empty migration history and may attempt to recreate or drop tables.

---

## 🔄 Case: Adjusting an Existing Schema (Add/Remove Model or Column)

Use this when your DB already has data and you want to evolve the schema **without losing existing records**.

> ✅ Safe for: adding models, adding columns (nullable or with a default), renaming via a 2-step migration.  
> ⚠️ Destructive by design: deleting a model or column will drop its data — only do this intentionally.

### Step-by-step

**1. Edit `prisma/schema.prisma`** to reflect the changes you want:

```prisma
// Example: adding a `phone` column to User, adding a new Order model,
// and removing the `image` column from Product

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  phone     String?  // ← new nullable column (safe, no data loss)
  role      Role     @default(BUYER)
  cart      Cart?
  orders    Order[]  // ← relation to new model
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Product {
  id          Int        @id @default(autoincrement())
  name        String
  description String?
  price       Float
  stock       Int        @default(0)
  // image removed intentionally ← existing image data will be dropped
  cartItems   CartItem[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Order {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  total     Float
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**2. Create and apply the migration:**

```bash
npx prisma migrate dev --name 
# example:
npx prisma migrate dev --name add_phone_to_user_add_order_model
```

Prisma will diff the current schema against the last migration, generate a `.sql` file under `prisma/migrations/`, and apply it to your DB.

**3. Regenerate the Prisma Client:**

```bash
npx prisma generate
```

This is usually done automatically by `migrate dev`, but run it manually if you skip the apply step or work in CI.

**4. Verify the changes:**

```bash
npx prisma studio   # inspect the updated tables and confirm data is intact
```

---

### ⚠️ Rules to Avoid Data Loss

| Change | Safe? | Notes |
|---|---|---|
| Add nullable column (`String?`) | ✅ Yes | Existing rows get `NULL` |
| Add column with `@default(...)` | ✅ Yes | Existing rows get the default value |
| Add a new model | ✅ Yes | Creates a new empty table |
| Delete a model | ❌ Destructive | Table and all its data are dropped |
| Delete a column | ❌ Destructive | Column data is permanently lost |
| Add required column (no default) | ⚠️ Caution | Migration will fail if the table has existing rows — add a default or make it nullable first, then tighten the constraint in a follow-up migration |
| Rename a column | ⚠️ Caution | Prisma treats it as drop + add — use a 2-step migration (add new → backfill data → remove old) to preserve data |

> 💡 **Tip:** Before running a destructive migration in production, always back up your database first.