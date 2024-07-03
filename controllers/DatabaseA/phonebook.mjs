import PhoneBookServices from '@services/apps/phonebook.mjs'
import { sendEmit } from '@sockets/index.mjs';

const getAllData = async (req, res) => {
  try {
    const data = await PhoneBookServices.getAllExternal(req.userAuthenticated.user_id)
    res.status(200).send({success: true, message: 'Data Loaded!', data: data})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to loading data!', data: error.message || error})
  }
};

const createExternal = async (req, res) => {
  try {
    const creating = await PhoneBookServices.createExternal({body: req.body}, req.userAuthenticated.user_id)
    res.status(200).send({success: true, message: 'Data Loaded!', data: creating})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to loading data!', data: error.message || error})
  }
};

const detailExternal = async (req, res) => {
  try {
    const detail = await PhoneBookServices.detailExternal({id: req.params.id}, req.userAuthenticated.user_id)
    res.status(200).send({success: true, message: 'Data Loaded!', data: detail})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to loading data!', data: error.message || error})
  }
};

const updateExternal = async (req, res) => {
  try {
    const updating = await PhoneBookServices.detailExternal({body: req.body, id: req.params.id}, req.userAuthenticated.user_id)
    res.status(200).send({success: true, message: 'Data Loaded!', data: updating})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to loading data!', data: error.message || error})
  }
};

const deleteExternal = async (req, res) => {
  try {
    const deleting = await PhoneBookServices.detailExternal({id: req.params.id}, req.userAuthenticated.user_id)
    res.status(200).send({success: true, message: 'Data Loaded!', data: deleting})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to loading data!', data: error.message || error})
  }
};

const deleteDetailExternal = async (req, res) => {
  try {
    const deleting = await PhoneBookServices.detailExternal({
      idDetail:req.params.iddetail,
      id:req.params.id,
      body: req.body
    }, req.userAuthenticated.user_id)
    res.status(200).send({success: true, message: 'Data Loaded!', data: deleting})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to loading data!', data: error.message || error})
  }
};

export { getAllData, createExternal, detailExternal, updateExternal, deleteExternal, deleteDetailExternal }