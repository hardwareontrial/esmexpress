import { Router } from 'express'
import checkToken from '@middlewares/routes/token.mjs'
import checkRoutePermission from '@middlewares/routes/permissions.mjs'

import {
  createUserAuth, detailUserAuth, updateUserAuth, signInUser, updateUserRolePermission, detailUserAuthById,
  getPermissionAll, getPermissionDetail, updatePermission,
  getRoleAll, createRole, detailRole, updateRole, deleteRole,
} from '@controllers/DatabaseA/auth.mjs'

import { signInValidator, registerUserValidator, updateUserValidator, roleValidator } from '@middlewares/validators/auth.mjs';

const route = Router()

/** Authentication Section */ 
route.post('/login', signInValidator, signInUser);
route.post('/register', checkToken, checkRoutePermission(['manage.all']), registerUserValidator, createUserAuth);
route.get('/user/:query', checkToken, checkRoutePermission(['manage.all']), detailUserAuth);
route.put('/user/:user_id/role-permission', checkToken, checkRoutePermission(['manage.all']), updateUserRolePermission);
route.get('/user/:auth_id', checkToken, checkRoutePermission(['manage.all']), detailUserAuthById);
route.put('/user/:auth_id/update', checkToken, checkRoutePermission(['manage.all']), updateUserValidator, updateUserAuth);
/** End Authentication Section */

/** Permission Section */
route.get('/permission/all', checkToken, checkRoutePermission(['manage.all']), getPermissionAll);
route.get('/permission/:unique', checkToken, checkRoutePermission(['manage.all']), getPermissionDetail);
route.put('/permission/:unique', checkToken, checkRoutePermission(['manage.all']), updatePermission);
/** End Permission Section */

/** Role Section */
route.get('/role/all', checkToken, checkRoutePermission(['manage.all']), getRoleAll);
route.post('/role/create', checkToken, checkRoutePermission(['manage.all']), createRole);
route.get('/role/:unique', checkToken, checkRoutePermission(['manage.all']), detailRole);
route.put('/role/:unique', checkToken, checkRoutePermission(['manage.all']), updateRole);
route.delete('/role/:unique', checkToken, checkRoutePermission(['manage.all']), deleteRole);
/** End Role Section */

export default route;