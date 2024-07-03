import { Router } from 'express'
import dbValidator from '@middlewares/validators/db.mjs'
const route = Router()
route.get('/', dbValidator('DatabaseB'), (req, res) => {
res.status(200).json({message: `Database B route`});
});
export default route