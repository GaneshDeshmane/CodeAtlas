import agentRouter from "./routes/agent";
import express from 'express'
const app = express()
app.use(express.json())
app.use('/agent',agentRouter)
app.listen(3000)