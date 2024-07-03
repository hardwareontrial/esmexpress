import UserService from '@services/apps/user.mjs'

const usersData = async (req, res) => {
  try {
    const items = await UserService.getDataAll(req.userAuthenticated.user_id)
    res.status(200).send({success: true, message: 'Loaded!', data: items})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed Loaded!', data: error.message || error})
  }
};

const usersDataPaginate = async (req, res) => {}

const createUser = async (req, res) => {
  try {
    const created = await UserService.create({body: req.body, file: req.file}, req.userAuthenticated.user_id)
    res.status(200).send({success: true, message: 'User Created!', data: created})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed To Creating User!', data: error.message || error})
  }
};

const detailUser  = async (req, res) => {
  try {
    const byInit = req.query.detailBy;
    let detail;
    if(byInit === 'unique') {
      detail = await UserService.detailByUnique(req.params.by)
    } else if (byInit === 'id') {
      detail = await UserService.detailById(req.params.by)
    }
    res.status(200).send({success: true, message: 'User found!', data: detail})
  } catch (e) {
    res.status(500).send({success: false, message: 'Failed Loaded!', data: e.message || e})
  }
};

const updateUser = async (req, res) => {
  try {
    const items = await UserService.update({
      user_id: req.params.user_id,
      body: req.body,
      file: req.file,
    }, req.userAuthenticated.user_id)
    res.status(200).send({success: true, message: 'Loaded!', data: items})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed Loaded!', data: error.message || error})
  }
};

const getNumber = async (req, res) => {};

const testing = async (req, res) => {
  try {
    const users = await UserService.getDataAll()
    const tester = users.forEach(async user => {
      // const data = await UserService.detailById(user.user_id)
      user.update({position_id: null});
    });
    res.status(200).send({success: true, message: 'Success!', data: tester})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed!', data: error.message || error})
  }
};

export { usersData, createUser, detailUser, updateUser, getNumber, testing }