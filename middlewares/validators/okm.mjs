import OKMServices from '@services/apps/okm.mjs'

const inputMaterialValidator = async (req,res,next) => {
  const isValid = await OKMServices.validatorInputMaterial({
    file: req.file,
    body: req.body,
  });
  if(!isValid.success) {
    return res.status(422).send({success: false, message: 'Unprocessable Entity', data: isValid.message})
  } else {
    next()
  }
};

const inputMaterialContentValidator = async (req,res,next) => {
  // only validating file
  const isValid = await OKMServices.validatorFileMaterial(req.file)
  if(!isValid.success) {
    return res.status(422).send({success: false, message: 'Unprocessable Entity', data: isValid.message})
  } else {
    next()
  }
}

export { inputMaterialValidator, inputMaterialContentValidator }