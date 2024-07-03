import { Router } from 'express'
import multer from 'multer'
import { usersData, createUser, detailUser, updateUser, getNumber, testing } from '@controllers/DatabaseA/user.mjs'

import checkToken from '@middlewares/routes/token.mjs'
import checkRoutePermission from '@middlewares/routes/permissions.mjs'

import { createUserValidator, updateUserValidator } from '@middlewares/validators/user.mjs'

const route = Router()

route.get('/all', checkToken, checkRoutePermission(['manage.all']), usersData);
route.post('/create', checkToken, checkRoutePermission(['manage.all']), multer({storage: multer.memoryStorage()}).single('avatarFile'), createUserValidator, createUser);
route.get('/:by/detail', checkToken, checkRoutePermission(['manage.all']), detailUser);
route.put('/:user_id/update', checkToken, checkRoutePermission(['manage.all']), multer({storage: multer.memoryStorage()}).single('avatarFile'), updateUserValidator, updateUser);
route.get('/number', checkToken, checkRoutePermission(['manage.all']), getNumber);

route.post('/test', checkToken, checkRoutePermission(['manage.all']), testing);
export default route