// singleton pattern: reuse one PrismaClient instance across the app
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default prisma