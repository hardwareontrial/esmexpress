import { Router } from 'express'
import checkToken from '@middlewares/routes/token.mjs'
import checkRoutePermission from '@middlewares/routes/permissions.mjs'
import {
  getAllMaterial, createMaterial, detailMaterial, getMaterialPaginate, updateMaterial, updateMaterialContent,
  getAllQuestionsCollection, detailQuestionCollection, createQuestionCollection,
} from '@controllers/DatabaseA/okm.mjs'
import multer from 'multer'

import { inputMaterialValidator, inputMaterialContentValidator } from '@middlewares/validators/okm.mjs'

const route = Router();

route.get('/materials', checkToken, checkRoutePermission(['manage.all']), getAllMaterial);
route.get('/material-paginate', checkToken, checkRoutePermission(['manage.all']), getMaterialPaginate);
route.post('/material', checkToken, checkRoutePermission(['manage.all']), multer({storage: multer.memoryStorage()}).single('file'), inputMaterialValidator, createMaterial);
route.get('/material/:id', checkToken, checkRoutePermission(['manage.all']), detailMaterial);
route.put('/material/:id', checkToken, checkRoutePermission(['manage.all']), inputMaterialValidator, updateMaterial);
route.post('/material/:id/content/:mContentId', checkToken, checkRoutePermission(['manage.all']), multer({storage: multer.memoryStorage()}).single('file'), inputMaterialContentValidator, updateMaterialContent);

route.get('/questions', checkToken, checkRoutePermission(['manage.all']), getAllQuestionsCollection);
route.get('/question/:id', checkToken, checkRoutePermission(['manage.all']), detailQuestionCollection);
route.post('/question', checkToken, checkRoutePermission(['manage.all']), multer({storage: multer.memoryStorage()}).single('file'), createQuestionCollection);

export default route;