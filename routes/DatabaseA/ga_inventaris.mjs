import { Router } from 'express'
import checkToken from '@middlewares/routes/token.mjs'
import checkRoutePermission from '@middlewares/routes/permissions.mjs'
import { getData, getDataPaginate, createData, detailData, updateData, deleteData, getMerk, addMerk, getLocation, addLocation } from '@controllers/DatabaseA/ga_inventaris.mjs'
import {
  createDataValidator, addMerkValidator, addLocationValidator, updateDataValidator
} from '@middlewares/validators/ga_inventaris.mjs';

const route = Router()

/** 
 * CONTROLLER: DBAGaInventarisController 
 * Library: validator\gainventaris-validator
 * */
route.get('/all',
  checkToken,
  checkRoutePermission(['manage.all']),
  getData);

route.get('/all-paginate',
  checkToken,
  checkRoutePermission(['manage.all']),
  getDataPaginate);

route.post('/new',
  checkToken,
  checkRoutePermission(['manage.all']),
  createDataValidator,
  createData)

route.get('/data/:id',
  checkToken,
  checkRoutePermission(['manage.all']),
  detailData)

route.put('/update/:id',
  checkToken,
  checkRoutePermission(['manage.all']),
  updateDataValidator,
  updateData)
  
route.delete('/data/:id',
  checkToken,
  checkRoutePermission(['manage.all']),
  deleteData)

route.get('/all-merk',
  checkToken,
  checkRoutePermission(['manage.all']),
  getMerk)

route.post('/new/merk',
  checkToken,
  checkRoutePermission(['manage.all']),
  addMerkValidator,
  addMerk)

route.get('/all-location',
  checkToken,
  checkRoutePermission(['manage.all']),
  getLocation)

route.post('/new/location',
  checkToken,
  checkRoutePermission(['manage.all']),
  addLocationValidator,
  addLocation)

export default route;