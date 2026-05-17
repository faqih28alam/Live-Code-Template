import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface Props {
  role?: 'ADMIN' | 'BUYER'
}

// Blocks unauthenticated users (redirects to /login)
// Blocks wrong-role users (redirects to /)
export default function ProtectedRoute({ role }: Props) {
  const user = useAuthStore((s) => s.user)

  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />

  return <Outlet />
}
