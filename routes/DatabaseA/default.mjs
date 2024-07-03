import { Router } from 'express'
import checkToken from '@middlewares/routes/token.mjs'
import checkRoutePermission from '@middlewares/routes/permissions.mjs'

const route = Router()
export default route;