// Entry point — boots Express, mounts middleware, starts server
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config() // load .env variables into process.env

const app = express()

app.use(cors())           // allow cross-origin requests from React
app.use(express.json())   // parse incoming JSON request bodies

app.get('/', (req, res) => {
    res.json({ message: 'Mini Store API is running' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})