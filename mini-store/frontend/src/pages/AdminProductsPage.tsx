import { useEffect, useState, type FormEvent } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { ErrorMessage } from '@/components/ui/error-message'
import {
  getProductsApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  type Product,
  type ProductPayload,
} from '@/api/products'

const EMPTY_FORM: ProductPayload = { name: '', description: '', price: 0, stock: 0, image: '' }

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductPayload>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchProducts = () =>
    getProductsApi().then(setProducts).finally(() => setLoading(false))

  useEffect(() => { fetchProducts() }, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setError(''); setOpen(true) }
  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({ name: p.name, description: p.description ?? '', price: p.price, stock: p.stock, image: p.image ?? '' })
    setError('')
    setOpen(true)
  }

  const set = (field: keyof ProductPayload) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: field === 'price' || field === 'stock' ? Number(e.target.value) : e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      // strip empty optional strings before sending
      const payload = {
        ...form,
        description: form.description || undefined,
        image: form.image || undefined,
      }
      if (editing) {
        const updated = await updateProductApi(editing.id, payload)
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      } else {
        const created = await createProductApi(payload)
        setProducts((prev) => [...prev, created])
      }
      setOpen(false)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message
      setError(msg ?? 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return
    await deleteProductApi(id)
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground">No products yet. Add one!</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Price</th>
                <th className="text-left px-4 py-3">Stock</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.name}</p>
                    {p.description && <p className="text-muted-foreground text-xs">{p.description}</p>}
                  </td>
                  <td className="px-4 py-3">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={p.stock > 0 ? 'secondary' : 'destructive'}>{p.stock}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild><span /></DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {error && <ErrorMessage message={error} />}
            {(
              [
                { id: 'name', label: 'Name', type: 'text', required: true },
                { id: 'description', label: 'Description', type: 'text', required: false },
                { id: 'price', label: 'Price', type: 'number', required: true },
                { id: 'stock', label: 'Stock', type: 'number', required: true },
                { id: 'image', label: 'Image URL', type: 'url', required: false },
              ] as const
            ).map(({ id, label, type, required }) => (
              <div key={id} className="space-y-1">
                <Label htmlFor={id}>{label}</Label>
                <Input
                  id={id}
                  type={type}
                  value={form[id]}
                  onChange={set(id)}
                  required={required}
                  min={type === 'number' ? 0 : undefined}
                  step={id === 'price' ? '0.01' : undefined}
                />
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : editing ? 'Save Changes' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
