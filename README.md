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

## 🚀 Getting Started Day-1
### 1. Setup Express with Typescript

```bash
mkdir backend                                   # create backend folder
cd backend                                      # go inside backend folder
npm init -y                                     # create package.json as project dependencies blueprint
npm i express                                   # install express framework
npm i -D typescript ts-node-dev @types/express  # install & configure typscript
npx tsc  --init                                 # make typescript work
```
edit package.json & tsconfig.json
```json
// package.json
"dev": "ts-node-dev --respawn src/app.ts",
```
```json
// tsconfig.json
"rootDir": "./src"
//uncommand this line, so it be like:
// "verbatimModuleSyntax": true,
```
### 2. Setup Project Structure
```bash
code src/app.ts                             # crtl + S
code src/routes/auth-route.ts               # crtl + S
code src/controllers/auth-controller.ts     # crtl + S
code src/models/auth-model.ts               # crtl + S
code src/utils/jwt.ts                       # crtl + S
code src/validations/joi.ts                 # crtl + S
```
```bash
npm run dev                                 # run backend server (edit package.json & tsconfig.json first)
```
### 3. Setup Prisma 6
```bash
npm i -D prisma@6                           # install prisma version 6; to perform migration, generate etc 
npm i @prisma/client@6                      # install prisma client; perform Create, Read, Update, Delete (CRUD) to DB
npx prisma init                             # generate prisma config        
```
setup postgreSQL connection
```text
1. move prisma config inside .src folder
2. Create DB
3. edit DATABASE_URL in .env
4. edit prisma/schema.prisma
```
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME?schema=public"
```
```prisma.schema
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model
```
