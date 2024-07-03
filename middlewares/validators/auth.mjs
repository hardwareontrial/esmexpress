import AuthServices from '@services/apps/auth.mjs'

const signInValidator = async (req, res, next) => {
  const isValid = await AuthServices.validatorSignIn(req)
  console.log(isValid)
  if(!isValid.success) {
    return res.status(422).send({success: false, message: 'Unprocessable Entity', data: isValid.message})
  } else {
    next()
  }
};

const registerUserValidator = async (req, res, next) => {
  const isValid = await AuthServices.validatorCreateAuth(req)
  if(!isValid.success) {
    return res.status(422).send({success: false, message: 'Unprocessable Entity', data: isValid.message})
  } else {
    next()
  }
};

const updateUserValidator = async (req, res, next) => {
  const isValid = await AuthServices.validatorUpdateAuth(req)
  if(!isValid.success) {
    return res.status(422).send({success: false, message: 'Unprocessable Entity', data: isValid.message})
  } else {
    next()
  }
};

const roleValidator = (req, res, next) => {
  const isValid = AuthServices.validatorRole(req)
  if(!isValid.success) {
    return res.status(422).send({success: false, message: 'Unprocessable Entity', data: isValid.message})
  } else {
    next()
  }
};

export {
  signInValidator, registerUserValidator, updateUserValidator, roleValidator,
}