import { Router } from 'express'
import multer from 'multer'
import path from 'path';
import checkToken from '@middlewares/routes/token.mjs'
import checkRoutePermission from '@middlewares/routes/permissions.mjs'

import { getAllData, getAllDataPagination, detailData, exportData, statistic, addData, updateData } from '@controllers/DatabaseA/delivery_note.mjs'
import { addDataValidator, updateDataValidator, exportDataValidator } from '@middlewares/validators/delivery_note.mjs'
const route = Router()
/** 
 * CONTROLLER: DeliverynoteController 
 * Library: validator\deliverynote-validator
 * */

route.get('/all', checkToken, checkRoutePermission(['manage.all']), getAllData);
route.get('/all-paginate', checkToken, checkRoutePermission(['manage.all']), getAllDataPagination);
route.get('/data/:deliveryno', checkToken, checkRoutePermission(['manage.all']), detailData);
route.get('/export', checkToken, checkRoutePermission(['manage.all']), exportDataValidator, exportData);
route.get('/statistic', checkToken, checkRoutePermission(['manage.all']), statistic);
route.post('/new', checkToken, checkRoutePermission(['manage.all']), addDataValidator, addData);
route.put('/data/:deliveryno', checkToken, checkRoutePermission(['manage.all']), updateDataValidator, updateData);

export default route