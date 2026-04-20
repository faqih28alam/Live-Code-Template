import { Router } from 'express'
import {
    handleGetProducts,
    handleGetProductById,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
} from '../controllers/product-controller'
import { authenticate, authorizeAdmin } from '../middlewares/auth-middleware'

const router = Router()

router.get('/', handleGetProducts)                                    // PUBLIC: all buyers & guests
router.get('/:id', handleGetProductById)                                 // PUBLIC: all buyers & guests
router.post('/', authenticate, authorizeAdmin, handleCreateProduct)    // ADMIN only
router.put('/:id', authenticate, authorizeAdmin, handleUpdateProduct)    // ADMIN only
router.delete('/:id', authenticate, authorizeAdmin, handleDeleteProduct)  // ADMIN only

export default router