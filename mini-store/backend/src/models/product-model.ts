import prisma from '../utils/prisma'

export const getProducts = async () => {
    return prisma.product.findMany()
}

export const getProductById = async (id: number) => {
    return prisma.product.findUnique({ where: { id } })
}

export const createProduct = async (data: {
    name: string
    description?: string
    price: number
    stock: number
    image?: string
}) => {
    return prisma.product.create({ data })
}

export const updateProduct = async (id: number, data: {
    name?: string
    description?: string
    price?: number
    stock?: number
    image?: string
}) => {
    return prisma.product.update({ where: { id }, data })
}

export const deleteProduct = async (id: number) => {
    return prisma.product.delete({ where: { id } })
}