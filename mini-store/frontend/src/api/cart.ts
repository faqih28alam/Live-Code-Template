import api from './client'

export interface CartItem {
  id: number
  quantity: number
  product: {
    id: number
    name: string
    price: number
    image?: string
  }
}

export interface Cart {
  id: number
  items: CartItem[]
}

export const getCartApi = async (): Promise<Cart | null> => {
  const { data } = await api.get('/cart')
  return data.cart
}

export const addToCartApi = async (productId: number, quantity = 1): Promise<CartItem> => {
  const { data } = await api.post('/cart/items', { productId, quantity })
  return data.item
}

export const updateCartItemApi = async (itemId: number, quantity: number): Promise<CartItem> => {
  const { data } = await api.put(`/cart/items/${itemId}`, { quantity })
  return data.item
}

export const removeCartItemApi = async (itemId: number): Promise<void> => {
  await api.delete(`/cart/items/${itemId}`)
}

export const clearCartApi = async (): Promise<void> => {
  await api.delete('/cart')
}
