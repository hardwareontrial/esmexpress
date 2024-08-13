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
const deleteMaterial = async (req, res) => {};

const getAllMaterialContent = async (req, res) => {
  try {
    const data = await OKMServices.getAllMaterialContent(req.userAuthenticated.user_id)
    res.status(200).send({success: true, message: 'Data Loaded!', data: data})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to updating data!', data: error.message || error})
  }
};
const getMaterialContentByMaterialId = async (req, res) => {
  try {
    const data = await OKMServices.getAllMaterialContent(req.userAuthenticated.user_id);
    const filtered = data.filter(item => item.material_id === parseInt(req.params.materialId));
    res.status(200).send({success: true, message: 'Data Loaded!', data: filtered})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to updating data!', data: error.message || error})
  }
};
const getMaterialContentPaginate = async (req, res) => {};
const getMaterialContentByMaterialIdPaginate = async (req, res) => {};
const createMaterialContent = async (req, res) => {};
const detailMaterialContent = async (req, res) => {
  try {
    const data = await OKMServices.detailMaterialContent(req.params.contentId, req.userAuthenticated.user_id);
    res.status(200).send({success: true, message: 'Data Loaded!', data: data})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to updating data!', data: error.message || error})
  }
};
const updateMaterialContent = async (req, res) => {
  try {
    const updated = await OKMServices.updateMaterialContent(
      req.params.contentId,
      req.body.materialId,
      req.body.description,
      req.body.filepath,
      req.body.viewCount,
      req.file,
      req.userAuthenticated.user_id
    );
    res.status(200).send({success: true, message: 'Data updated!', data: updated})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to updating data!', data: error.message || error})
  }
};
const deleteMaterialContent = async (req, res) => {};
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
const getQuestionCollectionPaginate = async (req, res) => {
  try {
    const data = await OKMServices.getQuestionCollectionPaginate(req.query.currentPage, req.query.itemPerPage, req.query.query, req.userAuthenticated.user_id);
    res.status(200).send({success: true, message: 'Data Loaded!', data: data})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to loading data!', data: error.message || error})
  }
};
const createQuestionCollection = async (req, res) => {
  try {
    const created = await OKMServices.createQuestionCollection(
      req.body.materialContentId,
      req.body.title,
      req.body.level,
      req.body.isActive,
      req.body.creator,
      req.file,
      req.userAuthenticated.user_id
    );
    res.status(200).send({success: true, message: 'Data Created!', data: created})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to creating data!', data: error.message || error})
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
const updateQuestionCollection = async (req, res) => {
  try {
    const data = await OKMServices.updateQuestionCollection(
      req.params.id,
      req.body.materialContentId,
      req.body.title,
      req.body.level,
      req.body.isActive,
      req.userAuthenticated.user_id
    )
    res.status(200).send({success: true, message: 'Data Upated!', data: data})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to updating data!', data: error.message || error})
  }
};
const deleteQuestionCollection = async (req, res) => {};
const getAllQuestionContent = async (req, res) => {
  try {
    const data = await OKMServices.getAllQuestionContent(req.userAuthenticated.user_id);
    res.status(200).send({success: true, message: 'Data Loaded!', data: data})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to loading data!', data: error.message || error})
  }
};
const getQuestionContentByCollectiondId = async (req, res) => {
  try {
    const data = await OKMServices.getAllQuestionContent(req.userAuthenticated.user_id);
    const filtered = data.filter(item => item.question_coll_id === parseInt(req.params.collectionId));
    res.status(200).send({success: true, message: 'Data Loaded!', data: filtered})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to loading data!', data: error.message || error})
  }
};
const getQuestionContentPaginate = async (req, res) => {};
const createQuestionContent = async (req, res) => {};
const detailQuestionContent = async (req, res) => {
  try {
    const data = await OKMServices.detailQuestionContent(req.params.id, req.userAuthenticated.user_id);
    res.status(200).send({success: true, message: 'Data Loaded!', data: data})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to loading data!', data: error.message || error})
  }
};
const updateQuestionContent = async (req, res) => {};
const deleteQuestionContent = async (req, res) => {};
/** END QUESTION SECTION */

const testing = async (req, res) => {
  try {
    // const testing = await OKMServices.readQuestionFromExcel(1, null);
    // const questions = req.body;
    // const files = req.files;
    const fileQuestion = await OKMServices.readQuestionFromForm(1, req.body.questions, req.files, 1);
    // console.info(fileQuestion)
  } catch (error) {
    console.error(error)
    // res.status(500).send({success: false, message: 'Failed to testing function!', data: error.message || error})
  }
};

export {
  getAllMaterial, getMaterialPaginate, createMaterial, detailMaterial, updateMaterial, 
  getAllMaterialContent, getMaterialContentByMaterialId, detailMaterialContent, updateMaterialContent,
  getAllQuestionsCollection, getQuestionCollectionPaginate, createQuestionCollection, detailQuestionCollection, updateQuestionCollection,
  getAllQuestionContent,getQuestionContentByCollectiondId, detailQuestionContent,
  testing,
}