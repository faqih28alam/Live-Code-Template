import { Link, Outlet, useNavigate } from 'react-router-dom'
import { ShoppingCart, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'

export default function RootLayout() {
  const { user, logout } = useAuthStore()
  const cartCount = useCartStore((s) => s.count)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">Mini Store</Link>
          <nav className="flex items-center gap-4">
            <Link to="/" className="text-sm hover:underline">Products</Link>

            {user ? (
              <>
                {user.role === 'BUYER' && (
                  <Link to="/cart" className="relative">
                    <Button variant="ghost" size="icon">
                      <ShoppingCart className="h-5 w-5" />
                    </Button>
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}
                {user.role === 'ADMIN' && (
                  <Link to="/admin/products" className="text-sm hover:underline">
                    Manage Products
                  </Link>
                )}
                <span className="text-sm text-muted-foreground">{user.name}</span>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
