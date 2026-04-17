import Joi from 'joi'

export const registerSchema = Joi.object({
    name: Joi.string().required(),
    username: Joi.string().required(),
    full_name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('ADMIN', 'BUYER').default('BUYER'),
})

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
})