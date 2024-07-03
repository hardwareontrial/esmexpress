import { Router } from 'express'
import DatabaseA from '@routes/DatabaseA/index.mjs'
import DatabaseB from '@routes/DatabaseB/index.mjs'
import DatabaseC from '@routes/DatabaseC/index.mjs'

const route = Router()

route.get('/', (req, res) => {
  res.status(200).json({message: `API running on port ${process.env.APP_PORT}`});
});

route.use('/97c6', DatabaseA)
route.use('/4ec8', DatabaseB)
route.use('/9jag', DatabaseC)

export default route