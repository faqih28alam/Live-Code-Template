import express from 'express'
import cors from 'cors'
import authRoute from './routes/auth-route'

const app = express()
const port = 3000;

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoute)     // mount: POST /api/auth/register & /api/auth/login

app.use('/health', (req, res) => {
    res.send("Backend Health: Ok")
})

app.listen(
    port,
    () => { console.log(`Server running on http://localhost:${port}`) }
);

export default app