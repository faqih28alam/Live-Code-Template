import { Request, Response } from 'express'
import { productSchema } from '../validations/joi'
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../models/product-model'

export const handleGetProducts = async (req: Request, res: Response) => {
    try {
        const products = await getProducts()
        res.status(200).json({ message: 'Success', products })
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}

export const handleGetProductById = async (req: Request, res: Response) => {
    try {
        const product = await getProductById(Number(req.params.id))
        if (!product) return res.status(404).json({ message: 'Product not found' })
        res.status(200).json({ message: 'Success', product })
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}

export const handleCreateProduct = async (req: Request, res: Response) => {
    const { error, value } = productSchema.validate(req.body)
    if (error) return res.status(400).json({ message: error.message })

    try {
        const product = await createProduct(value)
        res.status(201).json({ message: 'Product created', product })
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}

export const handleUpdateProduct = async (req: Request, res: Response) => {
    const { error, value } = productSchema.validate(req.body)
    if (error) return res.status(400).json({ message: error.message })

    try {
        const product = await updateProduct(Number(req.params.id), value)
        res.status(200).json({ message: 'Product updated', product })
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}

export const handleDeleteProduct = async (req: Request, res: Response) => {
    try {
        await deleteProduct(Number(req.params.id))
        res.status(200).json({ message: 'Product deleted' })
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}