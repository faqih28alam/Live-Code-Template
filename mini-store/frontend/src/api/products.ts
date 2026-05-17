import api from './client'

export interface Product {
  id: number
  name: string
  description?: string
  price: number
  stock: number
  image?: string
}

export type ProductPayload = Omit<Product, 'id'>

export const getProductsApi = async (): Promise<Product[]> => {
  const { data } = await api.get('/products')
  return data.products
}

export const createProductApi = async (payload: ProductPayload): Promise<Product> => {
  const { data } = await api.post('/products', payload)
  return data.product
}

export const updateProductApi = async (id: number, payload: Partial<ProductPayload>): Promise<Product> => {
  const { data } = await api.put(`/products/${id}`, payload)
  return data.product
}

export const deleteProductApi = async (id: number): Promise<void> => {
  await api.delete(`/products/${id}`)
}
