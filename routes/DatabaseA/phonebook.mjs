import { Router } from 'express'
import checkToken from '@middlewares/routes/token.mjs'
import checkRoutePermission from '@middlewares/routes/permissions.mjs'

import { getAllData, createExternal, detailExternal, updateExternal, deleteExternal, deleteDetailExternal } from '@controllers/DatabaseA/phonebook.mjs'

// TODO: Validator
const route = Router()

route.get('/external/all', checkToken, checkRoutePermission(['manage.all']), getAllData);
route.get('/external/:id/detail', checkToken, checkRoutePermission(['manage.all']), detailExternal);
route.post('/external/create', checkToken, checkRoutePermission(['manage.all']), createExternal);
route.put('/external/:id/update', checkToken, checkRoutePermission(['manage.all']), updateExternal);
route.delete('/external/:id/delete', checkToken, checkRoutePermission(['manage.all']), deleteExternal);
route.delete('/external/:id/detail/:iddetail/delete', checkToken, checkRoutePermission(['manage.all']), deleteDetailExternal);

export default route;