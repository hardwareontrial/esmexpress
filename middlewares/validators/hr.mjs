const deptValidator = (req, res, next) => {
  const { name, isActive, positions } = req.body;
  const errors = [];

  if(!name) errors.push('Name cannot be empty');

  if(errors.length !== 0){ return res.status(422).send({success: false, message: 'Unprocessable Entity', data: errors}) }
  else { next(); }
};

export {
  deptValidator,
}