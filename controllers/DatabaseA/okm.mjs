import path from 'path'
import fs from 'fs'
import { sendEmit } from '@sockets/index.mjs';
import OKMServices from '@services/apps/okm.mjs';

/** MATERIAL SECTION */
const getAllMaterial = async (req, res) => {
  try {
    const materials = await OKMServices.getAllMaterials()
    res.status(200).send({success: true, message: 'Data Loaded!', data: materials})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to loading data!', data: error.message || error})
  }
};
const getMaterialPaginate = async (req, res) => {
  try {
    const materials = await OKMServices.getAllMaterialsPaginate({
      currentPage: req.query.currentPage,
      limit: req.query.itemPerPage,
      query: req.query.query,
    });
    res.status(200).send({success: true, message: 'Data Loaded!', data: materials})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to loading data!', data: error.message || error})
  }
};
const createMaterial = async (req, res) => {
  try {
    const created = await OKMServices.createMaterial({
      body: req.body,
      file: req.file,
    }, req.userAuthenticated.user_id)
    res.status(200).send({success: true, message: 'Data created!', data: created})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to creating data!', data: error.message || error})
  }
};
const detailMaterial = async (req, res) => {
  try {
    const created = await OKMServices.detailMaterial(req.params.id)
    res.status(200).send({success: true, message: 'Data found!', data: created})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to founding data!', data: error.message || error})
  }
};
const updateMaterial = async (req, res) => {
  try {
    const updated = await OKMServices.updateMaterial({
      materialId: req.params.id,
      body: req.body,
    }, req.userAuthenticated.user_id)
    res.status(200).send({success: true, message: 'Data updated!', data: updated})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to updating data!', data: error.message || error})
  }
};
const updateMaterialContent = async (req, res) => {
  try {
    const updated = await OKMServices.updateMaterialContent({
      materialId: req.params.id,
      materialContentId: req.params.mContentId,
      body: req.body,
      file: req.file,
    }, req.userAuthenticated.user_id)
    res.status(200).send({success: true, message: 'Data updated!', data: updated})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to updating data!', data: error.message || error})
  }
};
/** END MATERIAL SECTION */

/** QUESTION SECTION */
const getAllQuestionsCollection = async (req, res) => {
  try {
    const data = await OKMServices.getAllQuestionCollection(req.userAuthenticated.user_id)
    res.status(200).send({success: true, message: 'Data Loaded!', data: data})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to loading data!', data: error.message || error})
  }
};
const detailQuestionCollection = async (req, res) => {
  try {
    const data = await OKMServices.detailQuestionCollection(req.params.id, req.userAuthenticated.user_id)
    res.status(200).send({success: true, message: 'Data Loaded!', data: data})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to loading data!', data: error.message || error})
  }
};
const createQuestionCollection = async (req, res) => {
  try {
    const created = await OKMServices.createQuestionCollection({body: req.body, file: req.file}, req.userAuthenticated.user_id)
    res.status(200).send({success: true, message: 'Data Created!', data: created})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to creating data!', data: error.message || error})
  }
};
/** END QUESTION SECTION */

export {
  getAllMaterial, createMaterial, detailMaterial, getMaterialPaginate, updateMaterial, updateMaterialContent,
  getAllQuestionsCollection, detailQuestionCollection, createQuestionCollection,
}