import { Router } from 'express'
import {
    handleGetCart,
    handleAddCartItem,
    handleUpdateCartItem,
    handleRemoveCartItem,
    handleClearCart,
} from '../controllers/cart-controller'
import { authenticate, authorizeRole } from '../middlewares/auth-middleware'

const router = Router()

// all cart routes require authentication — buyers only
router.use(authenticate, authorizeRole('BUYER'))

router.get('/', handleGetCart)                          // GET  /api/cart
router.post('/items', handleAddCartItem)                // POST /api/cart/items
router.put('/items/:itemId', handleUpdateCartItem)      // PUT  /api/cart/items/:itemId
router.delete('/items/:itemId', handleRemoveCartItem)   // DELETE /api/cart/items/:itemId
router.delete('/', handleClearCart)                     // DELETE /api/cart

export default router
