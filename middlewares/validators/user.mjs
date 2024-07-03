import UserServices from '@services/apps/user.mjs'

const createUserValidator = async (req,res,next) => {
  const isValid = await UserServices.validatorCreate(req)
  if(!isValid.success) {
    return res.status(422).send({success: false, message: 'Unprocessable Entity', data: isValid.message})
  } else {
    next()
  }
};

const updateUserValidator = async (req, res, next) => {
  const isValid = await UserServices.validatorUpdateUser(req)
  if(!isValid.success) {
    return res.status(422).send({success: false, message: 'Unprocessable Entity', data: isValid.message})
  } else {
    next()
  }
};

export {
  createUserValidator, updateUserValidator,
}