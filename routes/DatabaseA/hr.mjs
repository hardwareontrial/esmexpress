import { Router } from 'express'
import checkToken from '@middlewares/routes/token.mjs'
import checkRoutePermission from '@middlewares/routes/permissions.mjs'
import {
  getPositionData, createPosition, detailPosition, updatePosition, getDeptData, createDept, detailDept, updateDept,
  syncAttFromSource, downloadTextFile, getAttnLogs, getAllAttendanceData, getAttnStatistic,
  testServices
} from '@controllers/DatabaseA/hr.mjs'

import { deptValidator } from '@middlewares/validators/hr.mjs'

const route = Router()

route.get('/test', checkToken, checkRoutePermission(['manage.all']), testServices)

route.get('/position/all', checkToken, checkRoutePermission(['manage.all']), getPositionData);
route.post('/position/create', checkToken, checkRoutePermission(['manage.all']), createPosition);
route.get('/position/:id/detail', checkToken, checkRoutePermission(['manage.all']), detailPosition);
route.put('/position/:id/update', checkToken, checkRoutePermission(['manage.all']), updatePosition);

route.get('/dept/all', checkToken, checkRoutePermission(['manage.all']), getDeptData);
route.post('/dept/create', checkToken, checkRoutePermission(['manage.all']), deptValidator, createDept);
route.get('/dept/:id/detail', checkToken, checkRoutePermission(['manage.all']), detailDept);
route.put('/dept/:id/update', checkToken, checkRoutePermission(['manage.all']), deptValidator, updateDept);

route.get('/attn', checkToken, checkRoutePermission(['manage.all']), getAllAttendanceData);
route.post('/attn/sync', checkToken, checkRoutePermission(['manage.all']), syncAttFromSource);
route.post('/attn/export', checkToken, checkRoutePermission(['manage.all']), downloadTextFile);
route.get('/attn/log', checkToken, checkRoutePermission(['manage.all']), getAttnLogs);
route.get('/attn/statistic', checkToken, checkRoutePermission(['manage.all']), getAttnStatistic);

export default route;