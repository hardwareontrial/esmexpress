import OKMServices from '@services/apps/okm.mjs';
import pc from 'picocolors';

const inputMaterialValidator = async (req, res, next) => {
  try {
    const isMaterialValid = OKMServices.inputMaterialValidator(req.body.title, req.body.sinopsis, req.body.level, req.body.deptId, req.body.isActive, req.body.creator);

    const isMaterialContentValid = OKMServices.inputMaterialContentValidator(req.body.materialId, req.body.description, req.body.filepath, req.body.viewCount);

    let isMaterialFileValid = { success: true, message: [] }
    if(req.file) {
      const validating = OKMServices.inputMaterialFileValidator(req.file);
      isMaterialFileValid = { success: validating.success, message: validating.message }
    }

    const result = {
      success: isMaterialValid.message.length === 0 && isMaterialContentValid.message.length === 0 && isMaterialFileValid.message.length === 0,
      message: [...isMaterialValid.message, ...isMaterialContentValid.message, ...isMaterialFileValid.message]
    }

    if(!result.success) { return res.status(422).send({success: false, message: 'Unprocessable Entity', data: result.message}) }
    return next()
  } catch (error) {
    console.log(pc.bgRed(pc.white(`VALIDATOR-inputMaterialValidator: ${error.message || error}`)));
    return res.status(500).send({ success: false, message: 'Internal Server Error', data: [] });
  }
};

const inputMaterialContentValidator = (req, res, next) => {
  try {
    const isMaterialContentValid = OKMServices.inputMaterialContentValidator(req.body.materialId, req.body.description, req.body.filepath, req.body.viewCount);
    
    let isMaterialFileValid = { success: true, message: [] }
    if(req.file) {
      const validating = OKMServices.inputMaterialFileValidator(req.file);
      isMaterialFileValid = { success: validating.success, message: validating.message }
    }
    
    const result = {
      success: isMaterialContentValid.message.length === 0 && isMaterialFileValid.message.length === 0,
      message: [...isMaterialContentValid.message, ...isMaterialFileValid.message]
    }

    if(!result.success) { return res.status(422).send({success: false, message: 'Unprocessable Entity', data: result.message}) }
    return next();
  } catch (error) {
    console.log(pc.bgRed(pc.white(`VALIDATOR-inputMaterialContentValidator: ${error.message || error}`)));
    return res.status(500).send({ success: false, message: 'Internal Server Error', data: [] });
  }
};

const inputQuestionCollectionValidator = async (req, res, next) => {
  try {
    const isQuestionCollValid = OKMServices.inputQuestionCollectionValidator(req.body.materialContentId, req.body.title, req.body.level, req.body.isActive, req.body.creator);
    
    let isQuestionFileValid = { success: true, message: [] }
    if(req.file) {
      const validating = OKMServices.inputQuestionFileValidator(req.file);
      isQuestionFileValid = { success: validating.success, message: validating.message }
    }

    const result = {
      success: isQuestionCollValid.message.length === 0 && isQuestionFileValid.message.length === 0,
      message: [...isQuestionCollValid.message, ...isQuestionFileValid.message]
    }
    
    if(!result.success) { return res.status(422).send({success: false, message: 'Unprocessable Entity', data: result.message}) }
    return next();
  } catch (error) {
    console.log(pc.bgRed(pc.white(`VALIDATOR-inputQuestionCollectionValidator: ${error.message || error}`)));
    return res.status(500).send({ success: false, message: 'Internal Server Error', data: [] });
  }
};

const inputQuestionContentValidator = async (req, res,next) => {
  try {
    //
  } catch (error) {
    console.log(pc.bgRed(pc.white(`VALIDATOR-inputQuestionContentValidator: ${error.message || error}`)));
    return res.status(500).send({ success: false, message: 'Internal Server Error', data: [] });
  }
};

const inputQuizValidator = async  (req, res, next) => {
  try {
    //
  } catch (error) {
    console.log(pc.bgRed(pc.white(`VALIDATOR-inputQuizValidator: ${error.message || error}`)));
    return res.status(500).send({ success: false, message: 'Internal Server Error', data: [] });
  }
};

export { inputMaterialValidator, inputMaterialContentValidator, inputQuestionCollectionValidator }