import { Router } from 'express'
import { storeRepo } from '../services/embedding'

const ingestRouter = Router()
ingestRouter.post('/', async (req, res) => {
    const { repository } = req.body
    if (!repository) return res.status(400).json({ msg: 'repository is required' })
    try {
        await storeRepo(repository)
        return res.json({ msg: 'ingested', repository })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ msg: 'ingestion failed' })
    }
})
export default ingestRouter