import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { registerApi } from '@/api/auth'

export default function RegisterPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    username: '',
    full_name: '',
    email: '',
    password: '',
    role: 'BUYER' as 'ADMIN' | 'BUYER',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await registerApi(form)
      navigate('/login')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message
      setError(msg ?? 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-start pt-16">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Create a new account.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            {(
              [
                { id: 'name', label: 'Name', type: 'text', placeholder: 'John' },
                { id: 'username', label: 'Username', type: 'text', placeholder: 'john123' },
                { id: 'full_name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
                { id: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
                { id: 'password', label: 'Password', type: 'password', placeholder: '••••••' },
              ] as const
            ).map(({ id, label, type, placeholder }) => (
              <div key={id} className="space-y-1">
                <Label htmlFor={id}>{label}</Label>
                <Input
                  id={id}
                  type={type}
                  placeholder={placeholder}
                  value={form[id]}
                  onChange={set(id)}
                  required
                />
              </div>
            ))}
            <div className="space-y-1">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={form.role}
                onChange={set('role')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="BUYER">Buyer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Registering…' : 'Register'}
            </Button>
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="underline">Login</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
