import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getProductsApi, type Product } from '@/api/products'
import { addToCartApi } from '@/api/cart'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { Spinner } from '@/components/ui/spinner'
import { ErrorMessage } from '@/components/ui/error-message'

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getProductsApi()
      .then(setProducts)
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
  if (error) return <ErrorMessage message={error} />
  if (products.length === 0) return <p className="text-muted-foreground">No products yet.</p>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const user = useAuthStore((s) => s.user)
  const increment = useCartStore((s) => s.increment)
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return }

    setAdding(true)
    try {
      await addToCartApi(product.id)
      increment()
      setAdded(true)
      setTimeout(() => setAdded(false), 1500)  // reset label after 1.5s
    } finally {
      setAdding(false)
    }
  }

  return (
    <Card className="flex flex-col">
      {product.image ? (
        <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded-t-lg" />
      ) : (
        <div className="w-full h-40 bg-muted rounded-t-lg flex items-center justify-center text-muted-foreground text-sm">
          No image
        </div>
      )}
      <CardContent className="flex-1 pt-4 space-y-1">
        <p className="font-semibold">{product.name}</p>
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        )}
        <p className="text-lg font-bold">${product.price.toFixed(2)}</p>
        <Badge variant={product.stock > 0 ? 'secondary' : 'destructive'}>
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </Badge>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={product.stock === 0 || adding || user?.role === 'ADMIN'}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {added ? 'Added!' : adding ? 'Adding…' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  )
}
