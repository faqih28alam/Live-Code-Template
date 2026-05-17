import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth-middleware'
import { cartItemSchema, updateCartItemSchema } from '../validations/joi'
import {
    getCartByUserId,
    addCartItem,
    updateCartItem,
    removeCartItem,
    clearCart,
} from '../models/cart-model'

export const handleGetCart = async (req: AuthRequest, res: Response) => {
    try {
        const cart = await getCartByUserId(req.user.id)
        res.status(200).json({ message: 'Success', cart })
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}

export const handleAddCartItem = async (req: AuthRequest, res: Response) => {
    const { error, value } = cartItemSchema.validate(req.body)
    if (error) return res.status(400).json({ message: error.message })

    try {
        const item = await addCartItem(req.user.id, value.productId, value.quantity)
        res.status(201).json({ message: 'Item added to cart', item })
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}

export const handleUpdateCartItem = async (req: AuthRequest, res: Response) => {
    const { error, value } = updateCartItemSchema.validate(req.body)
    if (error) return res.status(400).json({ message: error.message })

    try {
        const item = await updateCartItem(Number(req.params.itemId), req.user.id, value.quantity)
        if (!item) return res.status(404).json({ message: 'Cart item not found' })
        res.status(200).json({ message: 'Cart item updated', item })
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}

export const handleRemoveCartItem = async (req: AuthRequest, res: Response) => {
    try {
        const item = await removeCartItem(Number(req.params.itemId), req.user.id)
        if (!item) return res.status(404).json({ message: 'Cart item not found' })
        res.status(200).json({ message: 'Cart item removed' })
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}

export const handleClearCart = async (req: AuthRequest, res: Response) => {
    try {
        await clearCart(req.user.id)
        res.status(200).json({ message: 'Cart cleared' })
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}
