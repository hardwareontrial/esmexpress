import { Router } from 'express';
import checkToken from '@middlewares/routes/token.mjs';
import checkRoutePermission from '@middlewares/routes/permissions.mjs';
import multer from 'multer';

import {
  getAllMaterials, detailMaterial, createMaterial, updateMaterial,
  getAllMaterialContents, detailMaterialContent, createMaterialContent, updateMaterialContent,
  getAllQuestionCollection, detailQuestionCollection, createQuestionCollection, updateQuestionCollection,
  getAllQuestionContent, detailQuestionContent, createQuestionContent, updateQuestionContent,
  getAllQuestionOpt, detailQuestionOpt, createQuestionOpt, updateQuestionOpt,
  getParticipantList,
} from '@controllers/DatabaseA/okm.mjs';

const route = Router();

route.get('/materials', checkToken, checkRoutePermission(['manage.all']), getAllMaterials);
route.post('/material', checkToken, checkRoutePermission(['manage.all']), multer({storage: multer.memoryStorage()}).any(), createMaterial);
route.get('/material/:id', checkToken, checkRoutePermission(['manage.all']), detailMaterial);
route.put('/material/:id', checkToken, checkRoutePermission(['manage.all']), updateMaterial);

route.get('/material-contents', checkToken, checkRoutePermission(['manage.all']), getAllMaterialContents);
route.post('/material-content', checkToken, checkRoutePermission(['manage.all']), multer({storage: multer.memoryStorage()}).single('material'), createMaterialContent);
route.get('/material-content/:id', checkToken, checkRoutePermission(['manage.all']), detailMaterialContent);
route.post('/material-content/:id', checkToken, checkRoutePermission(['manage.all']), multer({storage: multer.memoryStorage()}).single('material'), updateMaterialContent);

route.get('/question-collections', checkToken, checkRoutePermission(['manage.all']), getAllQuestionCollection);
route.post('/question-collection', checkToken, checkRoutePermission(['manage.all']), multer({storage: multer.memoryStorage()}).any(), createQuestionCollection);
route.get('/question-collection/:id', checkToken, checkRoutePermission(['manage.all']), detailQuestionCollection);
route.put('/question-collection/:id', checkToken, checkRoutePermission(['manage.all']), updateQuestionCollection);

route.get('/question-contents', checkToken, checkRoutePermission(['manage.all']), getAllQuestionContent);
route.post('/question-content', checkToken, checkRoutePermission(['manage.all']), multer({storage: multer.memoryStorage()}).any(), createQuestionContent);
route.get('/question-content/:id', checkToken, checkRoutePermission(['manage.all']), detailQuestionContent);
route.post('/question-content/:id', checkToken, checkRoutePermission(['manage.all']), multer({storage: multer.memoryStorage()}).single('question_media'), updateQuestionContent);

route.get('/question-options', checkToken, checkRoutePermission(['manage.all']), getAllQuestionOpt);
route.post('/question-option', checkToken, checkRoutePermission(['manage.all']), multer({storage: multer.memoryStorage()}).single('question_option_media'), createQuestionOpt);
route.get('/question-option/:id', checkToken, checkRoutePermission(['manage.all']), detailQuestionOpt);
route.post('/question-option/:id', checkToken, checkRoutePermission(['manage.all']), multer({storage: multer.memoryStorage()}).single('question_option_media'), updateQuestionOpt);

route.get('/list/participants', checkToken, checkRoutePermission(['manage.all']), getParticipantList);

export default route;