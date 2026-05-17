import { Request, Response } from 'express'
import { registerSchema, loginSchema } from '../validations/joi'
import { registerUser, loginUser } from '../models/auth-model'
import { signToken } from '../utils/jwt'

export const handleRegister = async (req: Request, res: Response) => {
    const { error, value } = registerSchema.validate(req.body)
    if (error) return res.status(400).json({ message: error.message })

    try {
        const user = await registerUser(
            value.name,
            value.username,
            value.full_name,
            value.email,
            value.password,
            value.role
        )
        res.status(201).json({ message: 'Register success', user })
    } catch (err: any) {
        res.status(400).json({ message: err.message })
    }
}

export const handleLogin = async (req: Request, res: Response) => {
    const { error, value } = loginSchema.validate(req.body)
    if (error) return res.status(400).json({ message: error.message })

    try {
        const user = await loginUser(value.email, value.password)
        const token = signToken({ id: user.id, role: user.role })   // embed role in token
        res.status(200).json({ message: 'Login success', token })
    } catch (err: any) {
        res.status(401).json({ message: err.message })
    }
}