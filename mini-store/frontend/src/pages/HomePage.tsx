import { useEffect, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getProductsApi, type Product } from '@/api/products'

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

  if (loading) return <p className="text-muted-foreground">Loading products…</p>
  if (error) return <p className="text-destructive">{error}</p>
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
  return (
    <Card className="flex flex-col">
      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-40 object-cover rounded-t-lg"
        />
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
        {/* Add to Cart wired in Day-9 */}
        <Button className="w-full" disabled={product.stock === 0}>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}
