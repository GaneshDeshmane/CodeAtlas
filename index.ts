import agentRouter from "./routes/agent";
import ingestRouter from "./routes/ingest";
import express from 'express'
const app = express()
import cors from 'cors'
app.use(cors())
app.use(express.json())
app.use('/agent',agentRouter)
app.use('/ingestion',ingestRouter)
app.listen(3001)