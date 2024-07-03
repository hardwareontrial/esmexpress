const addDataValidator = async (req, res, next) => {
  const errors = [];
  if(!req.body.form.customernama){errors.push('Customer name is required')};
  if(!req.body.form.customeralamat){errors.push('Customer address is required')};
  if(!req.body.form.customerkota){errors.push('Customer City is required')};
  if(!req.body.form.nopol){errors.push('Nopol is required')};
  if(!req.body.form.drivernama){errors.push('Driver Name is required')};
  if(!req.body.form.item){errors.push('Item is required')};
  if(!req.body.form.qty){errors.push('Quantity is required')};
  if(!req.body.form.uom){errors.push('Uom is required')};
  if(!req.body.form.tanggalkirim){errors.push('Date is required')};
  if(!req.body.btnRequest){errors.push('Button indicator is required')}
  
  if(errors.length !== 0){ return res.status(422).send({success: false, message: 'Unprocessable Entity', data: errors}) }
  else { next(); }
};

const updateDataValidator = async (req, res, next) => {
  const errors = [];
  if(!req.query.keyword){errors.push('No query included')}

  if(req.query.keyword == 'update-form-sj'){
    if(!req.body.form.customernama){errors.push('Customer name is required')};
    if(!req.body.form.customeralamat){errors.push('Customer address is required')};
    if(!req.body.form.customerkota){errors.push('Customer City is required')};
    if(!req.body.form.nopol){errors.push('Nopol is required')};
    if(!req.body.form.drivernama){errors.push('Driver Name is required')};
    if(!req.body.form.item){errors.push('Item is required')};
    if(!req.body.form.qty){errors.push('Quantity is required')};
    if(!req.body.form.uom){errors.push('Uom is required')};
    if(!req.body.form.tanggalkirim){errors.push('Date is required')};
    if(!req.body.btnRequest){errors.push('Button indicator is required')}
  }
  
  else if(req.query.keyword == 'update-post-invoice'){
    if(!req.body.form.invoice_no){errors.push('Invoice Number is required') };
    if(!req.body.btnRequest){errors.push('Button indicator is required')}
  }
  
  else if(req.query.keyword == 'update-print-count'){
    if(!req.body.btnRequest){errors.push('Button indicator is required')}
  }

  if(errors.length !== 0){ return res.status(422).send({success: false, message: 'Unprocessable Entity', data: errors}) }
  else { next(); }
};

const exportDataValidator = async (req, res, next) => {
  const errors = [];
  console.log(req.query)
  if(!req.query.sentstartdate){errors.push('Please provide starting sending date.')};
  if(!req.query.sentenddate){errors.push('Please provide ending sending date.')};
  if(!req.query.createstartdate){errors.push('Please provide starting created date.')};
  if(!req.query.createenddate){errors.push('Please provide ending created date.')};
  
  if(errors.length !== 0){ return res.status(422).send({success: false, message: 'Unprocessable Entity', data: errors}) }
  else { next(); }
};

export {
  addDataValidator, updateDataValidator, exportDataValidator
}
