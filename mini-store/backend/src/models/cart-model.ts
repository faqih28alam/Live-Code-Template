import prisma from '../utils/prisma'

export const getOrCreateCart = async (userId: number) => {
    return prisma.cart.upsert({
        where: { userId },
        create: { userId },
        update: {},
        include: { items: { include: { product: true } } },
    })
}

export const getCartByUserId = async (userId: number) => {
    return prisma.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } },
    })
}

export const addCartItem = async (userId: number, productId: number, quantity: number) => {
    const cart = await getOrCreateCart(userId)

    const existing = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId },
    })

    if (existing) {
        return prisma.cartItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + quantity },
            include: { product: true },
        })
    }

    return prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
        include: { product: true },
    })
}

export const updateCartItem = async (itemId: number, userId: number, quantity: number) => {
    // verify the item belongs to this user's cart before updating
    const item = await prisma.cartItem.findFirst({
        where: { id: itemId, cart: { userId } },
    })
    if (!item) return null

    return prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
        include: { product: true },
    })
}

export const removeCartItem = async (itemId: number, userId: number) => {
    const item = await prisma.cartItem.findFirst({
        where: { id: itemId, cart: { userId } },
    })
    if (!item) return null

    return prisma.cartItem.delete({ where: { id: itemId } })
}

export const clearCart = async (userId: number) => {
    const cart = await prisma.cart.findUnique({ where: { userId } })
    if (!cart) return null

    return prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
}
