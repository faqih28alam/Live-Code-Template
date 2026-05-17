import prisma from '../utils/prisma'
import bcrypt from 'bcrypt'

export const registerUser = async (name: string, username: string, full_name: string, email: string, password: string, role: 'ADMIN' | 'BUYER') => {
    const hashed = await bcrypt.hash(password, 10)        // hash password before saving
    return prisma.user.create({
        data: { name, username, full_name, email, password: hashed, role },
    })
}

export const loginUser = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new Error('User not found')

    const valid = await bcrypt.compare(password, user.password)   // compare plain vs hashed
    if (!valid) throw new Error('Invalid password')

    return user
}