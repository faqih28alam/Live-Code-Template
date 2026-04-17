import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'

export interface AuthRequest extends Request {
    user?: any    // attach decoded token payload to req.user
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1]  // Bearer 
    if (!token) return res.status(401).json({ message: 'No token provided' })

    try {
        req.user = verifyToken(token)
        next()
    } catch {
        res.status(401).json({ message: 'Invalid or expired token' })
    }
}

export const authorizeAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'ADMIN') return res.status(403).json({ message: 'Admin only' })
    next()
}