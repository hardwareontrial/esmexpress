import { Router } from 'express'
import checkToken from '@middlewares/routes/token.mjs'
import checkRoutePermission from '@middlewares/routes/permissions.mjs'
import {
  getAllMaterial, getMaterialPaginate, createMaterial, detailMaterial, updateMaterial, 
  getAllMaterialContent, getMaterialContentByMaterialId, detailMaterialContent, updateMaterialContent,
  getAllQuestionsCollection, getQuestionCollectionPaginate, createQuestionCollection, detailQuestionCollection, updateQuestionCollection,
  getAllQuestionContent, getQuestionContentByCollectiondId, detailQuestionContent,
  testing,
} from '@controllers/DatabaseA/okm.mjs'
import multer from 'multer'

import { inputMaterialValidator, inputMaterialContentValidator, inputQuestionCollectionValidator } from '@middlewares/validators/okm.mjs'

const route = Router();

route.get('/materials', checkToken, checkRoutePermission(['manage.all']), getAllMaterial);
route.get('/material-paginate', checkToken, checkRoutePermission(['manage.all']), getMaterialPaginate);
route.post('/material', checkToken, checkRoutePermission(['manage.all']),
  multer({storage: multer.memoryStorage()}).single('file'),
  inputMaterialValidator,
  createMaterial
);
route.get('/material/:id', checkToken, checkRoutePermission(['manage.all']), detailMaterial);
route.put('/material/:id', checkToken, checkRoutePermission(['manage.all']), inputMaterialValidator, updateMaterial);

route.get('/material-content', checkToken, checkRoutePermission(['manage.all']), getAllMaterialContent);
route.get('/material-content/:materialId', checkToken, checkRoutePermission(['manage.all']), getMaterialContentByMaterialId);
route.get('/material-content/:contentId', checkToken, checkRoutePermission(['manage.all']), detailMaterialContent);
route.post('/material-content/:contentId',
  checkToken,
  checkRoutePermission(['manage.all']),
  multer({storage: multer.memoryStorage()}).single('file'),
  inputMaterialContentValidator,
  updateMaterialContent
);

route.get('/question-collection', checkToken, checkRoutePermission(['manage.all']), getAllQuestionsCollection);
route.get('/question-collection-paginate', checkToken, checkRoutePermission(['manage.all']), getQuestionCollectionPaginate);
route.get('/question-collection/:id', checkToken, checkRoutePermission(['manage.all']), detailQuestionCollection);
route.post('/question-collection',
  checkToken,
  checkRoutePermission(['manage.all']),
  multer({storage: multer.memoryStorage()}).single('fileExcel'),
  inputQuestionCollectionValidator,
  createQuestionCollection
);
route.put('/question-collection/:id', checkToken, checkRoutePermission(['manage.all']), inputQuestionCollectionValidator, updateQuestionCollection);

route.get('/question-content', checkToken, checkRoutePermission(['manage.all']), getAllQuestionContent);
route.get('/question-content/:collectionId/collection', checkToken, checkRoutePermission(['manage.all']), getQuestionContentByCollectiondId);
route.get('/question-content/:id/detail', checkToken, checkRoutePermission(['manage.all']), detailQuestionContent);
route.post('/question-content', checkToken, checkRoutePermission(['manage.all']));
route.post('/question-content/:id', checkToken, checkRoutePermission(['manage.all']));

// route.post('/testing', checkToken, checkRoutePermission(['manage.all']), testing);
route.post('/testing', checkToken, checkRoutePermission(['manage.all']), multer({storage: multer.memoryStorage()}).any(), testing);

export default route;