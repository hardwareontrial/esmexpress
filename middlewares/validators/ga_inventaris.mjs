const createDataValidator = (req,res,next) => {
  const {
    kode_brg, nama_brg, tgl_beli, harga, toko, spesifikasi, serialnumber, pic_bagian_id, 
    merk_id, lokasi_id, status_id, is_active, qrcode, user_id_1, user_id_2, notes, mtc_note,
  } = req.body.form
  const errors = [];
  if(!process.env.FRONTEND_IP){ errors.push('Please check environment variable'); console.log('IP-Frontend not set!') }
  if(!status_id) errors.push('Status is required')
  if(!nama_brg) errors.push('Name is required')
  if(!tgl_beli) errors.push('Date is required')
  if(!merk_id) errors.push('Merk is required')
  if(!lokasi_id) errors.push('Location is required')
  if(!pic_bagian_id) errors.push('PIC is required')

  if(status_id == 2){
    if(!user_id_1) errors.push('At least 1 user selected.')
  }
  if(status_id == 4){
    if(!mtc_note) errors.push('Please describe maintenance note')
  }
  
  if(errors.length !== 0){ return res.status(422).send({success: false, message: 'Unprocessable Entity', data: errors}) }
  else { next(); }
};

const addMerkValidator = (req,res,next) => {
  const errors = [];
  if(!req.body.name) errors.push('Name is required')

  if(errors.length !== 0){ return res.status(422).send({success: false, message: 'Unprocessable Entity', data: errors}) }
  else { next(); }
};

const addLocationValidator = (req,res,next) => {
  const errors = [];
  if(!req.body.name) errors.push('Name is required')
  
  if(errors.length !== 0){ return res.status(422).send({success: false, message: 'Unprocessable Entity', data: errors}) }
  else { next(); }
};

const updateDataValidator = (req,res,next) => {
  const {
    kode_brg, nama_brg, tgl_beli, harga, toko, spesifikasi, serialnumber, pic_bagian_id, 
    merk_id, lokasi_id, status_id, is_active, qrcode, user_id_1, user_id_2, notes, mtc_note,
  } = req.body.form
  const errors = [];
  if(!kode_brg) errors.push('Kode is required')
  if(!status_id) errors.push('Status is required')
  if(!nama_brg) errors.push('Name is required')
  if(!tgl_beli) errors.push('Date is required')
  if(!merk_id) errors.push('Merk is required')
  if(!lokasi_id) errors.push('Location is required')
  if(!pic_bagian_id) errors.push('PIC is required')
  if(is_active === null || is_active === "" || is_active === undefined) errors.push('Active/Not Active is required')

  if(status_id == 2){
    if(!user_id_1) errors.push('At least 1 user selected.')
  }
  if(status_id == 4){
    if(!mtc_note) errors.push('Please describe maintenance note')
  }
  
  if(errors.length !== 0){ return res.status(422).send({success: false, message: 'Unprocessable Entity', data: errors}) }
  else { next(); }
};

export {
  createDataValidator, addMerkValidator, addLocationValidator, updateDataValidator
}