# Mini Store — Live Code Template

A 10-day incremental fullstack CRUD mini e-commerce app, built step-by-step for live coding sessions. Each branch (`Day-1` through `Day-10`) is a self-contained checkpoint.

## Tech Stack

| Layer | Stack |
|-------|-------|
| Backend | Express 5, TypeScript, Prisma 6, PostgreSQL |
| Auth | JWT, bcrypt, role-based middleware (ADMIN / BUYER) |
| Validation | Joi |
| Frontend | React 19, Vite, TypeScript |
| Styling | Tailwind CSS v4, ShadCN |
| State | Zustand (persisted auth, session cart count) |
| HTTP | Axios |
| Routing | React Router v7 |

---

## Getting Started

### Backend

```bash
cd mini-store/backend
cp .env.example .env        # fill in DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev
npm run dev                  # http://localhost:3000
```

### Frontend

```bash
cd mini-store/frontend
npm install
npm run dev                  # http://localhost:5173
```

---

## 10-Day Learning Path

| Branch | Feature |
|--------|---------|
| `Day-1` | Project setup — folder structure, Express server, Prisma init, PostgreSQL connection |
| `Day-2` | Prisma schema — User, Product, Cart, CartItem models + migrations |
| `Day-3` | Auth — register/login, JWT, role-based middleware |
| `Day-4` | Product CRUD API — admin only for CUD, public READ |
| `Day-5` | Cart API — buyer: add, read, update, delete cart items |
| `Day-6` | React setup — Vite, Tailwind, ShadCN, folder structure, routing |
| `Day-7` | Auth UI — login/register pages, auth state with Zustand |
| `Day-8` | Product UI — product grid for buyer, full CRUD UI for admin |
| `Day-9` | Cart UI — cart page, add/remove/update items, navbar badge |
| `Day-10` | Polish — role-based route guards, loading states, error handling |

To jump to any day:
```bash
git checkout Day-5
```

---

## Project Structure

```
mini-store/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # User, Product, Cart, CartItem
│   │   └── migrations/
│   └── src/
│       ├── app.ts
│       ├── models/                # DB query functions (auth, product, cart)
│       ├── controllers/           # Request handlers
│       ├── routes/                # Express routers
│       ├── middlewares/           # authenticate, authorizeAdmin, authorizeRole
│       ├── validations/joi.ts     # Joi schemas
│       └── utils/                 # jwt.ts, prisma.ts (singleton)
└── frontend/
    └── src/
        ├── api/                   # axios client + auth/products/cart calls
        ├── store/                 # authStore (persisted), cartStore
        ├── components/
        │   ├── ProtectedRoute.tsx # auth + role guard
        │   ├── GuestRoute.tsx     # redirect logged-in users
        │   └── ui/                # ShadCN: Button, Input, Label, Card, Badge, Dialog, Spinner
        ├── layouts/RootLayout.tsx # shared navbar
        └── pages/                 # Home, Login, Register, Cart, AdminProducts, NotFound
```

---

## API Reference

### Auth
```
POST /api/auth/register    → create account
POST /api/auth/login       → returns JWT
```

### Products
```
GET    /api/products        → public — list all
GET    /api/products/:id    → public — single product
POST   /api/products        → ADMIN — create
PUT    /api/products/:id    → ADMIN — update
DELETE /api/products/:id    → ADMIN — delete
```

### Cart
```
GET    /api/cart                 → BUYER — get cart with items
POST   /api/cart/items           → BUYER — add item
PUT    /api/cart/items/:itemId   → BUYER — update quantity
DELETE /api/cart/items/:itemId   → BUYER — remove item
DELETE /api/cart                 → BUYER — clear cart
```

---

## Frontend Routes

```
/                  → product grid (public)
/login             → login form (guest only)
/register          → register form (guest only)
/cart              → cart page (BUYER only)
/admin/products    → product CRUD table (ADMIN only)
```
