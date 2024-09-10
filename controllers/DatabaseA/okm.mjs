import pc from 'picocolors';
import path from 'path';
import OKMServices from '@services/apps/okm.mjs';
import JobServices from '@services/jobs.mjs';
import { sendEmit } from '@sockets/index.mjs';
import { normalizedArray } from '@utils/helpers.mjs';

const getAllMaterials = async (req, res, next) => {
  try {
    const data = await OKMServices.getAllMaterial(
      req.userAuthenticated.user_id,
    );
    res.status(200).send({success: true, message: 'Data Loaded', data: data});
  } catch (error) {
    res.status(500).send({success: false, message: 'Internal Server Error', data: error});
  }
};
const createMaterial = async (req, res, next) => {
  try {
    const title = req.body.title.toUpperCase();
    const sinopsis = req.body.sinopsis;
    const level = req.body.level;
    const dept_id = req.body.deptId;
    const isActive = req.body.isActive;
    const creator = await OKMServices.getUser(req.userAuthenticated.user_id);
    const contents = req.body.contents;

    /** Validation Input */
    let validationErrors = [];
    const validatingInput = OKMServices.inputMaterial(title, level, dept_id, isActive);
    validationErrors = [...validationErrors, ...validatingInput.message];
    
    if(contents && contents.length > 0) {
      for (const [index, content] of contents.entries()){
        const validatingContent = OKMServices.inputMaterialContent(JSON.stringify(content.materialId), content.isActive);
        validationErrors = [...validationErrors, ...validatingContent.message];
      }
    }

    if(req.files && req.files.length > 0) {
      for (const file of req.files) {
        const validatingFile = OKMServices.inputFilePDF(file);
        validationErrors = [...validationErrors, ...validatingFile.message];
      }
    }

    if(validationErrors.length > 0) { return res.status(422).send({success: false, message: 'Internal Server Error', data: validationErrors}); }
    /** End Validation Input */

    /** Processing Data */
    const creating = await OKMServices.createMaterial(
      req.userAuthenticated.user_id,
      title,
      sinopsis,
      level,
      dept_id,
      isActive,
      creator,
    );
    
    if(contents && contents.length > 0) {
      for (const [index, content] of contents.entries()){
        const materialId = creating.id
        const desc = content.description === 'null' ? null : content.description;
        const viewCount = content.viewCount;
        const isActive = content.isActive;
        const fileMaterial = JSON.parse(content.fileMaterial);

        let filePath = null;
        if(fileMaterial) {
          const file = await OKMServices.getFileByFieldName(req.files, `material_${index}`);
          if(file) {
            const filename = await OKMServices.createDateName('materialContent');
            const filenameWithExt = `${filename}.${file.mimetype.split('/')[1]}`;
            filePath = `okm/material/${materialId}/${filenameWithExt}`;
            await OKMServices.storeMedia(filePath, file.buffer);
          }
        }
        const creatingMatContent = await OKMServices.createMaterialContent(
          req.userAuthenticated.user_id,
          materialId,
          desc,
          filePath,
          viewCount,
          isActive,
        );
      }
    }
    /** End Processing Data */

    const created = await OKMServices.detailMaterial(
      req.userAuthenticated.user_id,
      creating.id,
    );
    sendEmit('okm:material:created', JSON.stringify(created));
    res.status(200).send({success: true, message: 'Data Created', data: created});
  } catch (error) {
    console.error(pc.bgRed(pc.white(`CONTROLLER-createMaterial: ${error}`)))
    res.status(500).send({success: false, message: 'Internal Server Error', data: error});
  }
};
const detailMaterial = async (req, res, next) => {
  try {
    const data = await OKMServices.detailMaterial(
      req.userAuthenticated.user_id,
      req.params.id,
    );
    res.status(200).send({success: true, message: 'Data Loaded', data: data});
  } catch (error) {
    res.status(500).send({success: false, message: 'Internal Server Error', data: error});
  }
};
const updateMaterial = async (req, res, next) => {
  try {
    const title = req.body.title.toUpperCase();
    const sinopsis = req.body.sinopsis;
    const level = req.body.level;
    const dept_id = req.body.deptId;
    const isActive = req.body.isActive;

    const validation = OKMServices.inputMaterial(title, level, dept_id, isActive);
    if(!validation.success) { return res.status(422).send({success: false, message: 'Unprocessable Entity', data: validation.message}); }

    await OKMServices.updateMaterial(
      req.userAuthenticated.user_id,
      req.params.id,
      title,
      sinopsis,
      level,
      dept_id,
      isActive,
    );

    const updated = await OKMServices.detailMaterial(
      req.userAuthenticated.user_id,
      req.params.id,
    );
    res.status(200).send({success: true, message: 'Data Updated', data: updated});
  } catch (error) {
    console.error(pc.bgRed(pc.white(`CONTROLLER-updateMaterial: ${error}`)))
    res.status(500).send({success: false, message: 'Internal Server Error', data: error});
  }
};
const deleteMaterial = async (req, res, next) => {};

const getAllMaterialContents = async (req, res, next) => {
  try {
    const data = await OKMServices.getAllMaterialContent(
      req.userAuthenticated.user_id,
    );
    res.status(200).send({success: true, message: 'Data Loaded', data: data});
  } catch (error) {
    res.status(500).send({success: false, message: 'Internal Server Error', data: error});
  }
};
const createMaterialContent = async (req, res, next) => {
  try {
    const materialId = req.body.materialId
    const desc = req.body.description === 'null' ? null : req.body.description;
    const viewCount = req.body.viewCount;
    const isActive = req.body.isActive;
    const fileMaterial = JSON.parse(req.body.fileMaterial);

    /** Validation Input */
    let validationErrors = [];
    const validatingInput = OKMServices.inputMaterialContent(materialId, isActive);
    validationErrors = [...validationErrors, ...validatingInput.message];
    if(fileMaterial) {
      const validatingMedia = OKMServices.inputFilePDF(req.file);
      validationErrors = [...validationErrors, ...validatingMedia.message];
    }
    if(validationErrors.length > 0) { return res.status(422).send({success: false, message: 'Internal Server Error', data: validationErrors}); }
    /** End Validation Input */

    /** Processing Data */
    let filePath = null;
    if(fileMaterial) {
      const file = req.file
      const filename = await OKMServices.createDateName('materialContent');
      const filenameWithExt = `${filename}.${file.mimetype.split('/')[1]}`;
      filePath = `okm/material/${materialId}/${filenameWithExt}`;
      await OKMServices.storeMedia(filePath, file.buffer);
    }
    const creatingMatContent = await OKMServices.createMaterialContent(
      req.userAuthenticated.user_id,
      materialId,
      desc,
      filePath,
      viewCount,
      isActive,
    );
    /** End Processing Data */

    const created = await OKMServices.detailMaterialContent(
      req.userAuthenticated.user_id,
      creatingMatContent.id,
    );
    res.status(200).send({success: true, message: 'Data Created', data: created});
  } catch (error) {
    console.error(pc.bgRed(pc.white(`CONTROLLER-createMaterialContent: ${error}`)))
    res.status(500).send({success: false, message: 'Internal Server Error', data: error});
  }
};
const detailMaterialContent = async (req, res, next) => {
  try {
    const data = await OKMServices.detailMaterialContent(
      req.userAuthenticated.user_id,
      req.params.id,
    );
    res.status(200).send({success: true, message: 'Data Loaded', data: data});
  } catch (error) {
    res.status(500).send({success: false, message: 'Internal Server Error', data: error});
  }
};
const updateMaterialContent = async (req, res, next) => {
  try {
    const materialId = req.body.materialId;
    const desc = req.body.description === 'null' ? null : req.body.description;
    const viewCount = req.body.viewCount;
    const isActive = req.body.isActive;
    const fileMaterial = JSON.parse(req.body.fileMaterial);
    const lastData = await OKMServices.detailMaterialContent(req.userAuthenticated.user_id, req.params.id);

    /** Validation Input */
    let validationErrors = [];
    const validatingInput = OKMServices.inputMaterialContent(materialId, isActive);
    validationErrors = [...validationErrors, ...validatingInput.message];
    if(fileMaterial) {
      const validatingMedia = OKMServices.inputFilePDF(req.file);
      validationErrors = [...validationErrors, ...validatingMedia.message];
    }
    if(validationErrors.length > 0) { return res.status(422).send({success: false, message: 'Internal Server Error', data: validationErrors}); }
    /** End Validation Input */

    /** Processing Data */
    let filePath = req.body.filePath === 'null' ? null : req.body.filePath;
    if(fileMaterial) {
      const file = req.file
      const filename = await OKMServices.createDateName('materialContent');
      const filenameWithExt = `${filename}.${file.mimetype.split('/')[1]}`;
      filePath = `okm/material/${materialId}/${filenameWithExt}`;
      await OKMServices.storeMedia(filePath, file.buffer);
    }

    await OKMServices.updateMaterialContent(
      req.userAuthenticated.user_id,
      req.params.id,
      materialId,
      desc,
      filePath,
      viewCount,
      isActive,
    );
    if(fileMaterial && lastData.filepath) { await OKMServices.removePath(lastData.filepath); }
    if(!filePath && lastData.filepath) { await OKMServices.removePath(lastData.filepath); }
    /** End Processing Data */

    const updated = await OKMServices.detailMaterialContent(
      req.userAuthenticated.user_id,
      req.params.id,
    );
    res.status(200).send({success: true, message: 'Data Updated', data: updated});
  } catch (error) {
    console.error(pc.bgRed(pc.white(`CONTROLLER-updateMaterialContent: ${error}`)))
    res.status(500).send({success: false, message: 'Internal Server Error', data: error});
  }
};

const getAllQuestionCollection = async (req, res, next) => {
  try {
    const data = await OKMServices.getQuestionCollection(
      req.userAuthenticated.user_id,
    );
    res.status(200).send({success: true, message: 'Data Loaded', data: data});
  } catch (error) {
    res.status(500).send({success: false, message: 'Internal Server Error', data: error});
  }
};
const createQuestionCollection = async (req, res, next) => {
  try {
    const materialContentId = req.body.materialContentId;
    const title = req.body.title;
    const level = req.body.level;
    const isActive = req.body.isActive;
    const hasExcel = JSON.parse(req.body.fileExcel);
    const questions = normalizedArray(req.body.questions);
    const creator = await OKMServices.getUser(req.userAuthenticated.user_id);

    /** Validation Input */
    let validationErrors = [];
    const validatingInput = OKMServices.inputQuestionCollection(materialContentId, title, level, isActive);
    validationErrors = [...validationErrors, ...validatingInput.message];

    if(questions.length > 0) {
      for(const [index, question] of questions.entries()) {
        const validationForm = OKMServices.inputQuestionContent(collection_id, question.type, question.isActive);
        validationErrors = [...validationErrors, ...validationForm.message];
      }
    }

    if(req.files && req.files.length > 0) {
      for(const itemFile of req.files) {
        if(itemFile.fieldname === 'file_excel') {
          const validatingExcel = OKMServices.inputFileExcel(itemFile);
          validationErrors = [...validationErrors, ...validatingExcel.message]
        } else {
          const validatingMedia = OKMServices.inputFileImage(itemFile);
          validationErrors = [...validationErrors, ...validatingMedia.message]
        }
      }
    }
    if(validationErrors.length > 0) { return res.status(422).send({success: false, message: 'Internal Server Error', data: validationErrors}); }
    /** End Validation Input */

    /** Processing Data */
    const creating = await OKMServices.createQuestionCollection(
      req.userAuthenticated.user_id,
      materialContentId,
      title.toUpperCase(),
      level,
      creator,
      isActive,
    );

    let fileExcelQuestion = null;
    if(hasExcel) {
      fileExcelQuestion = await OKMServices.getFileByFieldName(req.files, 'file_excel');
      const filename = await OKMServices.createDateName('excelQuestion');
      const filenameWithExt = `${filename}${path.extname(fileExcelQuestion.originalname)}`;
      const filePath = `okm/temporary/${filenameWithExt}`;
      await OKMServices.storeMedia(filePath, fileExcelQuestion.buffer);
      await JobServices.createJob('medium', {
        type: 'process-excel-okm-question', collection_id: creating.id, filename: filenameWithExt
      });
      await OKMServices.createQuestionUploadStatus(req.userAuthenticated.user_id, 'queue', creating.id);
    }

    if(questions && questions.length > 0) {
      const questionsArrayWithColId = questions.map(item => ({...item, collection_id: creating.id}));
      await OKMServices.readQuestionFromForm(req.userAuthenticated.user_id, questionsArrayWithColId, req.files, creating.id)
    };
    /** End Processing Data */

    const created = await OKMServices.detailQuestionCollection(
      req.userAuthenticated.user_id,
      creating.id,
    );
    res.status(200).send({success: true, message: 'Data Created', data: created});
  } catch (error) {
    console.error(pc.bgRed(pc.white(`CONTROLLER-createQuestionCollection: ${error}`)))
    res.status(500).send({success: false, message: 'Internal Server Error', data: error});
  }
};
const detailQuestionCollection = async (req, res, next) => {
  try {
    const data = await OKMServices.detailQuestionCollection(
      req.userAuthenticated.user_id,
      req.params.id,
    );
    res.status(200).send({success: true, message: 'Data Load', data: data});
  } catch (error) {
    res.status(500).send({success: false, message: 'Internal Server Error', data: error});
  }
};
const updateQuestionCollection = async (req, res, next) => {
  try {
    const materialContentId = req.body.materialContentId;
    const title = req.body.title;
    const level = req.body.level;
    const isActive = req.body.isActive;
    const lastData = await OKMServices.detailQuestionCollection(
      req.userAuthenticated.user_id,
      req.params.id,
    ); 

    const validation = OKMServices.inputQuestionCollection(materialContentId, title, level, isActive);
    if(!validation.success) { return res.status(422).send({success: false, message: 'Unprocessable Entity', data: validation.message}); }

    const updating = await OKMServices.updateQuestionCollection(
      req.userAuthenticated.user_id,
      req.params.id,
      materialContentId,
      title.toUpperCase(),
      level,
      lastData.created_by,
      isActive,
    );

    const updated = await OKMServices.detailQuestionCollection(
      req.userAuthenticated.user_id,
      req.params.id,
    );
    res.status(200).send({success: true, message: 'Data Updated', data: updated});
  } catch (error) {
    console.error(pc.bgRed(pc.white(`CONTROLLER-updateQuestionCollection: ${error}`)))
    res.status(500).send({success: false, message: 'Internal Server Error', data: error});
  }
};

const getAllQuestionContent = async (req, res, next) => {
  try {
    const data = await OKMServices.getQuestionContent(
      req.userAuthenticated.user_id,
    );
    res.status(200).send({success: true, message: 'Data Loaded', data: data});
  } catch (error) {
    res.status(500).send({success: false, message: 'Internal Server Error', data: error});
  }
};
const createQuestionContent = async (req, res, next) => {
  try {
    const collection_id = req.body.collection_id;
    const hasExcel = JSON.parse(req.body.fileExcel);
    const questions = normalizedArray(req.body.questions);
    const creator = await OKMServices.getUser(req.userAuthenticated.user_id);

    /** Validation Input */
    let validationErrors = [];
    if(questions.length > 0) {
      for(const [index, question] of questions.entries()) {
        const validationForm = OKMServices.inputQuestionContent(collection_id, question.type, question.isActive);
        validationErrors = [...validationErrors, ...validationForm.message];
      }
    }
    if(req.files && req.files.length > 0) {
      for(const itemFile of req.files) {
        if(itemFile.fieldname === 'file_excel') {
          const validatingExcel = OKMServices.inputFileExcel(itemFile);
          validationErrors = [...validationErrors, ...validatingExcel.message]
        } else {
          const validatingMedia = OKMServices.inputFileImage(itemFile);
          validationErrors = [...validationErrors, ...validatingMedia.message]
        }
      }
    }
    if(validationErrors.length > 0) { return res.status(422).send({success: false, message: 'Internal Server Error', data: validationErrors}); }
    /** End Validation Input */

    /** Processing Data */
    let fileExcelQuestion = null;
    if(hasExcel) {
      fileExcelQuestion = await OKMServices.getFileByFieldName(req.files, 'file_excel');
      const filename = await OKMServices.createDateName('excelQuestion');
      const filenameWithExt = `${filename}${path.extname(fileExcelQuestion.originalname)}`;
      const filePath = `okm/temporary/${filenameWithExt}`;
      await OKMServices.storeMedia(filePath, fileExcelQuestion.buffer);
      await JobServices.createJob('medium', {
        type: 'process-excel-okm-question', collection_id: collection_id, filename: filenameWithExt
      });
      await OKMServices.createQuestionUploadStatus(req.userAuthenticated.user_id, 'queue', collection_id);
    }

    if(questions.length > 0) {
      const questionsArrayWithColId = questions.map(item => ({...item, collection_id: collection_id}));
      await OKMServices.readQuestionFromForm(req.userAuthenticated.user_id, questionsArrayWithColId, req.files, collection_id)
    }
    /** End Processing Data */


    // /** FILE EXCEL VALIDATION */
    // let validationExcel = true;
    // let fileExcelQuestion = null;
    // if(hasExcel && req.files && req.files.length > 0) {
    //   fileExcelQuestion = await OKMServices.getFileByFieldName(req.files, 'file_excel');
    //   if(fileExcelQuestion) {
    //     const validating = OKMServices.inputFileExcel(fileExcelQuestion);
    //     if(!validating.success) {
    //       console.log(pc.bgRed(pc.white(`Validation-inputFileExcel: ${JSON.stringify(validating.message)}`)));
    //       validationExcel = false;
    //     }
    //   }
    // }

    // if(hasExcel && validationExcel){
    //   const filename = await OKMServices.createDateName('excelQuestion');
    //   const filenameWithExt = `${filename}${path.extname(fileExcelQuestion.originalname)}`;
    //   const filePath = `okm/temporary/${filenameWithExt}`;
    //   await OKMServices.storeMedia(filePath, fileExcelQuestion.buffer);
    //   await JobServices.createJob('medium', {
    //     type: 'process-excel-okm-question', collection_id: collection_id, filename: filenameWithExt
    //   });
    //   await OKMServices.createQuestionUploadStatus(req.userAuthenticated.user_id, 'queue', collection_id);
    //   validationExcel = true;
    //   fileExcelQuestion = null;
    // };

    // if(questions && questions.length > 0) {
    //   const questionsArrayWithColId = questions.map(item => ({...item, collection_id: collection_id}));
    //   await OKMServices.readQuestionFromForm(req.userAuthenticated.user_id, questionsArrayWithColId, req.files, collection_id)
    // };
    
    res.status(200).send({
      success: true,
      message: 'Data Created',
      data: `${hasExcel && validationExcel ? 'File uploaded, waiting on process' : ''} ${(hasExcel && validationExcel) && (questions && questions.length > 0) ? '&' : ''} ${questions && questions.length > 0 ? 'Form Questions processed' : ''}`
    });
  } catch (error) {
    res.status(500).send({success: false, message: 'Internal Server Error', data: error});
  }
};
const detailQuestionContent = async (req, res, next) => {
  try {
    const data = await OKMServices.detailQuestionContent(
      req.userAuthenticated.user_id,
      req.params.id,
    );
    res.status(200).send({success: true, message: 'Data Load', data: data});
  } catch (error) {
    res.status(500).send({success: false, message: 'Internal Server Error', data: error});
  }
};
const updateQuestionContent = async (req, res, next) => {
  try {
    const collection_id = req.body.collection_id;
    const type = req.body.type;
    const text = req.body.text;
    const hasMedia = JSON.parse(req.body.file_media);
    const media = req.body.media === 'null' ? JSON.parse(req.body.media) : req.body.media;
    const key = req.body.answerKey;
    const isActive = req.body.isActive;
    const lastData = await OKMServices.detailQuestionContent(
      req.userAuthenticated.user_id,
      req.params.id,
    );

    /** Validation Input */
    let validationErrors = [];
    if(hasMedia) {
      const validatingMedia = OKMServices.inputFileImage(req.file);
      validationErrors = [...validationErrors, ...validatingMedia.message];
    }
    const validationForm = OKMServices.inputQuestionContent(collection_id, type, isActive);
    validationErrors = [...validationErrors, ...validationForm.message];
    if(validationErrors.length > 0) { return res.status(422).send({success: false, message: 'Internal Server Error', data: validationErrors}); }
    /** End Validation Input */

    /** Processing Data */
    let mediaPath = media;
    if(hasMedia) {
      const file = req.file;
      const dirMediaPath = `okm/question/collection/${collection_id}/Q_${req.params.id}`;
      const filename = await OKMServices.createDateName('questionContent');
      const filenameWithExt = `${filename}.${file.mimetype.split('/')[1]}`;
      mediaPath = `${dirMediaPath}/${filenameWithExt}`;
      await OKMServices.storeMedia(mediaPath, file.buffer);
    }

    await OKMServices.updateQuestionContent(
      req.userAuthenticated.user_id,
      req.params.id,
      collection_id,
      type,
      text,
      mediaPath,
      key,
      isActive,
    );

    if(hasMedia) { await OKMServices.removePath(lastData.question_media); }
    if(!hasMedia && !media) { await OKMServices.removePath(lastData.question_media); }
    /** End Processing Data */

    const updated = await OKMServices.detailQuestionContent(
      req.userAuthenticated.user_id,
      req.params.id,
    );
    res.status(200).send({success: true, message: 'Data Updated', data: updated});
  } catch (error) {
    console.error(pc.bgRed(pc.white(`CONTROLLER-updateQuestionContent: ${error}`)))
    res.status(500).send({success: false, message: 'Internal Server Error', data: error});
  }
};

const getAllQuestionOpt = async (req, res, next) => {
  try {
    const data = await OKMServices.getQuestionOpts(
      req.userAuthenticated.user_id,
    );
    res.status(200).send({success: true, message: 'Data Loaded', data: data});
  } catch (error) {
    res.status(500).send({success: false, message: 'Internal Server Error', data: error});
  }
};
const createQuestionOpt = async (req, res, next) => {
  try {
    const content_id = req.body.content_id;
    const collection_id = req.body.collection_id;
    const text = req.body.text;
    const media = req.body.media === 'null' ? JSON.parse(req.body.media) : req.body.media;
    const value = req.body.value;
    const isActive = req.body.isActive;
    const hasMedia = JSON.parse(req.body.file_media);

    /** Validation input */
    let validationErrors = [];
    if(hasMedia && req.file){
      const validatingMedia = await OKMServices.inputFileImage(req.file);
      validationErrors = [...validationErrors, ...validatingMedia.message];
    }
    const validatingInput = OKMServices.inputQuestionOptions(content_id, value, isActive);
    validationErrors = [...validationErrors, ...validatingInput.message];
    if(validationErrors.length > 0) { return res.status(422).send({success: false, message: 'Internal Server Error', data: validationErrors}); }
    /** End Validation input */

    /** Processing Data */
    let mediaPathOpt = media;
    if(hasMedia && req.file){
      const file = req.file;
      const dirMediaPath = `okm/question/collection/${collection_id}/Q_${content_id}`;
      const filenameOpt = await OKMServices.createDateName('questionContent');
      const filenameOptWithExt = `${filenameOpt}.${file.mimetype.split('/')[1]}`;
      mediaPathOpt = `${dirMediaPath}/${filenameOptWithExt}`;
      await OKMServices.storeMedia(mediaPathOpt, file.buffer);
    }
    const creating = await OKMServices.createQuestionOpts(
      req.userAuthenticated.user_id,
      content_id,
      text,
      mediaPathOpt,
      value,
      isActive,
    );
    /** End Processing Data */

    const created = await OKMServices.detailQuestionOpts(req.userAuthenticated.user_id, creating.id);
    res.status(200).send({success: true, message: 'Data Created', data: created});
  } catch (error) {
    res.status(500).send({success: false, message: 'Internal Server Error', data: error});
  }
};
const detailQuestionOpt = async (req, res, next) => {
  try {
    const data = await OKMServices.detailQuestionOpts(
      req.userAuthenticated.user_id,
      req.params.id,
    );
    res.status(200).send({success: true, message: 'Data Load', data: data});
  } catch (error) {
    res.status(500).send({success: false, message: 'Internal Server Error', data: error});
  }
};
const updateQuestionOpt = async (req, res, next) => {
  try {
    // console.log(req)
    const content_id = req.body.content_id;
    const collection_id = req.body.collection_id;
    const text = req.body.text;
    const media = req.body.media === 'null' ? JSON.parse(req.body.media) : req.body.media;
    const value = req.body.value;
    const isActive = req.body.isActive;
    const hasMedia = JSON.parse(req.body.file_media);
    const lastData = await OKMServices.detailQuestionOpts(req.userAuthenticated.user_id, req.params.id);

    /** Validation input */
    let validationErrors = [];
    if(hasMedia && req.file){
      const validatingMedia = await OKMServices.inputFileImage(req.file);
      validationErrors = [...validationErrors, ...validatingMedia.message];
    }
    const validatingInput = OKMServices.inputQuestionOptions(content_id, value, isActive);
    validationErrors = [...validationErrors, ...validatingInput.message];
    if(validationErrors.length > 0) { return res.status(422).send({success: false, message: 'Internal Server Error', data: validationErrors}); }
    /** End Validation input */

    /** Processing Data */
    let mediaPathOpt = media;
    if(hasMedia && req.file){
      const file = req.file;
      const dirMediaPath = `okm/question/collection/${collection_id}/Q_${content_id}`;
      const filenameOpt = await OKMServices.createDateName('questionContent');
      const filenameOptWithExt = `${filenameOpt}.${file.mimetype.split('/')[1]}`;
      mediaPathOpt = `${dirMediaPath}/${filenameOptWithExt}`;
      await OKMServices.storeMedia(mediaPathOpt, file.buffer);
    }
    const updating = await OKMServices.updateQuestionOpts(
      req.userAuthenticated.user_id,
      req.params.id,
      content_id,
      text,
      mediaPathOpt,
      value,
      isActive,
    );
    if(hasMedia) { await OKMServices.removePath(lastData.option_media); }
    if(!hasMedia && !media) { await OKMServices.removePath(lastData.option_media); }
    /** End Processing Data */

    const updated = await OKMServices.detailQuestionOpts(req.userAuthenticated.user_id, req.params.id);
    res.status(200).send({success: true, message: 'Data Created', data: updated});
  } catch (error) {
    res.status(500).send({success: false, message: 'Internal Server Error', data: error});
  }
};

const getParticipantList = async (req, res, next) => {
  try {
    const data = await OKMServices.getParticipantList();
    res.status(200).send({status: true, message: 'Data Loaded', data: data});
  } catch (error) {
    res.status(500).send({status: true, message: 'Internal Server Error', data: error});
  }
}

export {
  getAllMaterials, detailMaterial, createMaterial, updateMaterial,
  getAllMaterialContents, detailMaterialContent, createMaterialContent, updateMaterialContent,
  getAllQuestionCollection, detailQuestionCollection, createQuestionCollection, updateQuestionCollection,
  getAllQuestionContent, detailQuestionContent, createQuestionContent, updateQuestionContent,
  getAllQuestionOpt, detailQuestionOpt, createQuestionOpt, updateQuestionOpt,
  getParticipantList,
}