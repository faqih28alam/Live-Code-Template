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
