import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RootLayout from '@/layouts/RootLayout'
import ProtectedRoute from '@/components/ProtectedRoute'
import GuestRoute from '@/components/GuestRoute'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import CartPage from '@/pages/CartPage'
import AdminProductsPage from '@/pages/AdminProductsPage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          {/* public */}
          <Route index element={<HomePage />} />

          {/* guests only — redirect to / if already logged in */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* BUYER only */}
          <Route element={<ProtectedRoute role="BUYER" />}>
            <Route path="/cart" element={<CartPage />} />
          </Route>

          {/* ADMIN only */}
          <Route element={<ProtectedRoute role="ADMIN" />}>
            <Route path="/admin/products" element={<AdminProductsPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
