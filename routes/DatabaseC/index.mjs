import { Router } from 'express'
import dbValidator from '@middlewares/validators/db.mjs'
const route = Router()
route.get('/', dbValidator('DatabaseC'), (req, res) => {
res.status(200).json({message: `Database C route`});
});
export default route