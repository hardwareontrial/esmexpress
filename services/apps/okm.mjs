import db from '@services/orm/index.mjs'
import { Op, where } from 'sequelize'
import path from 'path'
import fs from 'fs'
import ExcelJS from 'exceljs';
import { Readable } from 'stream';
import JobServices from '@services/jobs.mjs';

const OKMMaterial = db.DatabaseA.models.OKMMaterial;
const OKMMaterialContent = db.DatabaseA.models.OKMMaterialContent;
const OKMQuestionContent = db.DatabaseA.models.OKMQuestionContent;
const OKMQuestionCollection = db.DatabaseA.models.OKMQuestionCollection;
const OKMQuestionAnswerOptions = db.DatabaseA.models.OKMQuestionAnswerOptions;
const OKMQuestionUploadStatus = db.DatabaseA.models.OKMQuestionUploadStatus;
const OKMLogs = db.DatabaseA.models.OKMLogs;
const AppUserModel = db.DatabaseA.models.AppUser;
const AppDeptModel = db.DatabaseA.models.AppHrDepartment;

class OKMServices {
  constructor() {
    // this.tmpStorage = path.join(path.resolve(), '/public/storage/app/okm/temporary/');
    // this.okmStorage = path.join(path.resolve(), '/public/storage/app/okm/');
    this.appStorage = path.join(path.resolve(), '/public/storage/app/');
  }

  /** Material Section */
  async getAllMaterials(authUserId) {
    try {
      const materials = await OKMMaterial.findAll({
        include: [
          {model: OKMMaterialContent, as: 'materialContents'},
          {model: AppDeptModel, as: 'materialDeptOKM'}
        ],
      });
      return materials
    } catch (error) {
      throw error
    }
  };

  async getAllMaterialsPaginate(payload) {
    try {
      let currentPage = payload.currentPage;
      let itemPerPage = payload.limit; 
      let query = payload.query;
      const materials = await this.getAllMaterials();
      const filtered = materials.filter(item => item.title.toLowerCase().includes(query?.toLowerCase()));
      const countFilteredArray = filtered.length
      const totalPages = Math.ceil(countFilteredArray/itemPerPage)
      currentPage = Math.min(Math.max(1, currentPage), totalPages)
      const startIndex = (currentPage -1)*itemPerPage
      const endIndex = startIndex + itemPerPage
      const itemsForPage = filtered.slice(startIndex, endIndex)
      const from = ((currentPage -1)* itemPerPage) +1
      const to = Math.min((currentPage * itemPerPage), countFilteredArray)
      return {
        items: itemsForPage,
        total: countFilteredArray,
        currentPage: Math.max(currentPage, 1),
        totalPages: totalPages,
        per_page: itemPerPage,
        from: Math.max(from, 0),
        to: to,
      }
    } catch (error) {
      throw error      
    }
  };

  async createMaterial(payload, authUserId) {
    let materialCreateTrx;
    try {
      const { title, sinopsis, level, deptId } = payload.body;
      const isActive = payload.body.isActive;
      const authUser = await this.getUser(authUserId);
      const materialFile = payload.file;

      materialCreateTrx = await db.DatabaseA.transaction();
      const newMaterial = await OKMMaterial.create({
        title: title.toUpperCase(),
        sinopsis: sinopsis,
        level: level,
        department_id: deptId,
        is_active: isActive,
        created_by: authUser?.fname
      }, { transaction: materialCreateTrx });
      await materialCreateTrx.commit();

      if(materialFile) {
        payload.body.material_id = newMaterial.id;
        const storingMaterialContent = await this.createMaterialContent(payload, authUserId)
        if(!storingMaterialContent) { return storingMaterialContent }
      }
      
      const created = await this.detailMaterial(newMaterial.id)
      
      return created
    } catch (error) {
      if(materialCreateTrx) { await materialCreateTrx.rollback(); }
      throw error
    }
  };

  async createMaterialContent(payload, authUserId) {
    let materialContentCreate, filenameWithExt, filePath;
    try {
      const { material_id, description } = payload.body;
      const materialFile = payload.file;
      const authUser = await this.getUser(authUserId);

      if(materialFile) {
        const filename = await this.createDateName('materialContent');
        filenameWithExt = `${filename}.${materialFile.mimetype.split('/')[1]}`;
        filePath = `okm/material/${filenameWithExt}`;
        await this.storeMediaOkm(materialFile, filePath);
      }

      materialContentCreate = await db.DatabaseA.transaction();
      const newMaterialContent = await OKMMaterialContent.create({
        material_id: material_id,
        description: description,
        filepath: filePath,
      }, { transaction: materialContentCreate });
      await materialContentCreate.commit();

      return newMaterialContent;
    } catch (error) {
      if(materialContentCreate) {
        await this.removeMediaOkm(filePath);
        await materialContentCreate.rollback();
      }
      throw error;
    }
  };

  async updateMaterial(payload, authUserId) {
    let materialUpdate;
    try {
      const { title, sinopsis, level, deptId } = payload.body;
      const isActive = payload.body.isActive;
      const authUser = await this.getUser(authUserId);
      const materialId = payload.materialId;

      materialUpdate = await db.DatabaseA.transaction();
      const updateMaterial = await OKMMaterial.update({
        title: title.toUpperCase(),
        sinopsis: sinopsis,
        level: level,
        department_id: deptId,
        is_active: isActive,
      },{
        where: {id: materialId},
        transaction: materialUpdate,
      });
      await materialUpdate.commit();

      const updated = await this.detailMaterial(materialId);

      return updated;
    } catch (error) {
      if(materialUpdate) { await materialUpdate.rollback() }
      throw error
    }
  };

  async updateMaterialContent(payload, authUserId) {
    let materialContentUpdate, filenameWithExt, filePath;
    try {
      const { material_id, description } = payload.body;
      const materialFile = payload.file;
      const authUser = await this.getUser(authUserId);
      const lastData = await this.detailMaterialContent(payload.materialContentId);

      if(materialFile) {
        const filename = await this.createDateName('materialContent');
        filenameWithExt = `${filename}.${materialFile.mimetype.split('/')[1]}`;
        filePath = `okm/material/${filenameWithExt}`;
        await this.storeMediaOkm(materialFile, filePath);
      }

      materialContentUpdate = await db.DatabaseA.transaction();
      const updateMaterialContent = await OKMMaterialContent.update({
        description: description,
        filepath: filePath,
      },{
        where: {id: payload.materialContentId},
        transaction: materialContentUpdate
      });
      await materialContentUpdate.commit();

      if(materialFile) { await this.removeMediaOkm(filePath); }

      const updated = await this.detailMaterialContent(payload.materialContentId);

      return updated
    } catch (error) {
      if(materialContentUpdate) {
        await materialContentUpdate.rollback();
        await this.removeMediaOkm(filePath);
      }
      throw error
    }
  };

  async detailMaterial(id) {
    try {
      const material = await OKMMaterial.findOne({
        where: {id: id},
        include: [
          {model: OKMMaterialContent, as: 'materialContents'},
          {model: AppDeptModel, as: 'materialDeptOKM'}
        ],
      });
      return material;
    } catch (error) {
      throw error
    }
  };

  async detailMaterialContent(id) {
    try {
      const materialContent = await OKMMaterialContent.findOne({
        where: {id: id},
        include: [
          {model: OKMMaterial, as: 'contentMaterial'}
        ],
      });
      return materialContent;
    } catch (error) {
      throw error
    }
  };

  // async deleteMaterial(id) {
  //   // Cannot delete if related into schedule
  //   // Force delete will be delete all related into
  // };

  // async deleteMaterialContent() {
  //   // Cannot delete if related into question, remove question first
  //   // Force delete will be delete all related into
  // };
  
  async validatorInputMaterial(payload) {
    const errors = []
    const { title, sinopsis, level, deptId, description } = payload.body;
    const file = payload.file;

    if(!title) { errors.push('Title cannot be empty.') }
    if(!level) { errors.push('Choose a level.') }
    if(!deptId) { errors.push('Choose a Department.') }

    if(file) {
      const fileIsValid = await this.validatorFileMaterial(file)
      if(!fileIsValid.success) { errors.push(...fileIsValid.message) }
    }
    return { success: errors.length === 0, message: errors }
  };

  async validatorFileMaterial(file) {
    const errors = [];

    const acceptedMimes = ['application/pdf'];
    const maxFileSize = 6 * 1024 * 1024; // 6Mb
    if(!acceptedMimes.includes(file.mimetype)) { errors.push('Only accept PDF file.') };
    if(maxFileSize < file.size) { errors.push('File size exceeds the limit (6 MB).') };
    
    return { success: errors.length === 0, message: errors }
  };
  /** End Material Section */

  /** Question Section */
  async getAllQuestionCollection(authUserId) {
    try {
      const questionsCollection = await OKMQuestionCollection.findAll({
        include: [
          {model: OKMQuestionContent, as: 'questions', include: [{ model: OKMQuestionAnswerOptions, as: 'options' }]},
          {model: OKMMaterialContent, as: 'partMaterial'},
        ],
      });
      return questionsCollection;
    } catch (error) {
      throw error
    }
  };

  async getQuestionCollectionPaginate() {};

  async createQuestionCollection(payload, authUserId) {
    let createQuestionCollTrx;
    try {
      const { matContentId, title, level } = payload.body;
      const isActive = JSON.parse(payload.body.isActive);
      const fileQuestion = payload.file;
      const creator = await this.getUser(authUserId);

      createQuestionCollTrx = await db.DatabaseA.transaction();
      const createColl = await OKMQuestionCollection.create({
        material_content_id: matContentId,
        title: title.toUpperCase(),
        level: level,
        is_active: isActive,
        created_by: creator?.fname,
      },{ transaction: createQuestionCollTrx });
      await createQuestionCollTrx.commit();

      if(fileQuestion) {
        const filename = await this.createDateName('excelQuestion');
        const filenameWithExt = `${filename}.${fileQuestion.mimetype.split('/')[1]}`;
        const filePath = `okm/temporary/${filenameWithExt}`;
        await this.storeMediaOkm(fileQuestion, filePath);
        const creatingJob = await JobServices.createJobQueue({
          priority: 'medium',
          payload: { type: 'process-excel-okm-question', collection_id: createColl.id, filename: filenameWithExt }
        });
        const creatingUploadStatus = this.createQuestionUploadStatus({
          body: { status: 'queue', question_coll_id: createColl.id },
        }, authUserId);

        if(!creatingJob || !creatingUploadStatus) { await this.removeMediaOkm(filePath); }
      }

      const created = await this.detailQuestionCollection(createColl.id, authUserId);
      return created;
    } catch (error) {
      if(createQuestionCollTrx) { await createQuestionCollTrx.rollback() }
      throw error
    }
  };

  async updateQuestionCollection() {};

  async detailQuestionCollection(id, authUserId) {
    try {
      const questionCollection = await OKMQuestionCollection.findOne({
        where: {id: id},
        include: [
          {model: OKMQuestionContent, as: 'questions', include: [{ model: OKMQuestionAnswerOptions, as: 'options' }]},
          {model: OKMMaterialContent, as: 'partMaterial', include: [{model: OKMMaterial, as: 'contentMaterial'}]},
          {model: OKMQuestionUploadStatus, as: 'uploadedStatus', order: [['id', 'DESC']]},
        ],
      });
      return questionCollection;
    } catch (error) {
      throw error
    }
  };

  async deleteQuestionCollection() {};

  async createQuestionContent(payload) {
    let createQuestionContentTrx;
    try {
      const { collection_id, text, media, type, answer_key } = payload.body;
      
      createQuestionContentTrx = await db.DatabaseA.transaction();
      const createContent = await OKMQuestionContent.create({
        question_coll_id: collection_id,
        question_text: text,
        question_media: media,
        question_type: type,
        answer_key: answer_key,
      });
      await createQuestionContentTrx.commit();

      return createContent;
    } catch (error) {
      if(createQuestionContentTrx) { await createQuestionContentTrx.rollback(); }
      throw error
    }
  };

  async createQuestionOption(payload) {
    let createQstOptTrx;
    try {
      const { content_id, text, media, value } = payload.body;
      
      createQstOptTrx = await db.DatabaseA.transaction();
      const createOpt = await OKMQuestionAnswerOptions.create({
        question_content_id: content_id,
        option_text: text,
        option_media: media,
        option_value: value,
      });

      await createQstOptTrx.commit();
      return createOpt;
    } catch (error) {
      if(createQstOptTrx) { await createQstOptTrx.rollback(); }
      throw error
    }
  };

  async readQuestionFromExcel(collection_id, filename) {
    
    function checkArrayImages (array, ref) {
      const finding =  array.find(item => item.cell === ref)
      if(!finding) { return false }
      return finding
    };

    try {
      // const filePath = path.join(this.appStorage, 'okm/temporary/1721104330.xlsx');
      // const question_coll_id = 1;
      const filePath = path.join(this.appStorage, `okm/temporary/${filename}`);
      const question_coll_id = collection_id;

      const arrayImages = [];
      const dataFromExcel = [];
      const startRow = 9;

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.getWorksheet('Sheet1');
      const rowLimit = worksheet.actualRowCount;
      const initializeForm = worksheet.getCell('A1').value;
      
      if(initializeForm !== 'Form_by_IT') {
        return new Error(`No Valid Form (missing 'Form_by_IT' indicator.)`);
      }
      if(startRow > rowLimit) {
        return new Error(`No Data from file.`);
      }
      
      const rowRange = Array.from({length: rowLimit - startRow +1}, (_, i) => i +startRow);
      worksheet.getImages().forEach(image => {
        const imageId = image.imageId;
        const range = image.range;
        const startRow = Math.max(1, Math.floor(range.tl.row) +1);
        const startCol = Math.max(1, Math.floor(range.tl.col) +1);
        const startCell = worksheet.getCell(startRow, startCol).address;
        const img = workbook.model.media.find(m => m.index === imageId);
        const object = {
          imageId,
          cell: startCell,
          imageData: img,
        }
        arrayImages.push(object)
      });
      
      for (const row of rowRange) {
       
        /** Question (Cell B-C), AnswerKey (Cell L), Type (Cell M) */
        let eachQuestion = {
          collection_id: question_coll_id,
          text: worksheet.getCell(`B${row}`).value,
          media: checkArrayImages(arrayImages, `C${row}`),
          key: worksheet.getCell(`L${row}`).value,
          type: worksheet.getCell(`M${row}`).value,
        }
        if(eachQuestion.type === 'multiple') {

          /** AnswerOptions (Cell D-K) */
          const answersOpt = [];
          const opt1 = {
            text: worksheet.getCell(`D${row}`).value,
            media: checkArrayImages(arrayImages, `E${row}`),
            value: 1,
          };
          const opt2 = {
            text: worksheet.getCell(`F${row}`).value,
            media: checkArrayImages(arrayImages, `G${row}`),
            value: 2,
          };
          const opt3 = {
            text: worksheet.getCell(`H${row}`).value,
            media: checkArrayImages(arrayImages, `I${row}`),
            value: 3,
          };
          const opt4 = {
            text: worksheet.getCell(`J${row}`).value,
            media: checkArrayImages(arrayImages, `K${row}`),
            value: 4,
          };
          answersOpt.push(opt1,opt2,opt3,opt4)
          eachQuestion.answersOpt = answersOpt;
        }

        dataFromExcel.push(eachQuestion);
      }

      const seeding = await this.seedingQuestionFromExcel(dataFromExcel);

      return seeding;
    } catch (error) {
      console.log(error)
      throw error
    }
  };

  async seedingQuestionFromExcel(arrayQuestion) {
    try {
      if(arrayQuestion.length <=0) { return false }

      for(const [index, question] of arrayQuestion.entries()) {
        let pathMediaQst, fileMediaQstWithExt;
        
        if(question.media) {
          const filename = await this.createDateName('questionContent');
          fileMediaQstWithExt = `${filename}.${question.media.imageData.extension}`;
          pathMediaQst = `okm/question/collection/${question.collection_id}/Q_${index+1}/${fileMediaQstWithExt}`;
          const bufferData = question.media.imageData.buffer;
          await this.storeMediaOkm({buffer: bufferData}, pathMediaQst);
        }

        const creatingContent = await this.createQuestionContent({
          body: {
            collection_id: question.collection_id,
            text: question.text,
            media: question.media ? pathMediaQst : null,
            type: question.type,
            answer_key: question.key,
          }
        });

        if(question.type === 'multiple') {
          for(const answeropt of question.answersOpt) {
            let pathAnsOpt, fileMediaAnsOpt;
            
            if(answeropt.media) {
              const filename = await this.createDateName('questionContentAnswer');
              fileMediaAnsOpt = `${filename}.${answeropt.media.imageData.extension}`;
              pathAnsOpt = `okm/question/collection/${question.collection_id}/Q_${index+1}/${fileMediaAnsOpt}`;
              const bufferData = answeropt.media.imageData.buffer;
              await this.storeMediaOkm({buffer: bufferData}, pathAnsOpt);
            }

            await this.createQuestionOption({
              body: {
                content_id: creatingContent.id,
                text: answeropt.text,
                media: answeropt.media ? pathAnsOpt : null,
                value: answeropt.value,
              }
            });
          }
        }
      }
      return true;
    } catch (error) {
      throw error
    }
  };

  async createQuestionUploadStatus(payload, authUserId) {
    let createUploadStatusTrx;
    try {
      const { upload_id, status, question_coll_id } = payload.body;
      
      createUploadStatusTrx = await db.DatabaseA.transaction();
      const creatingUpload = await OKMQuestionUploadStatus.create({
        status: status,
        question_coll_id: question_coll_id,
      },{ transaction: createUploadStatusTrx });
      await createUploadStatusTrx.commit();

      return creatingUpload;
    } catch (error) {
      if(createUploadStatusTrx) { await createUploadStatusTrx.rollback(); }
      throw error;
    }
  };

  // async updateQuestionUploadStatus(payload, authUserId) {
  //   let updateUploadStatusTrx;
  //   try {
  //     const { upload_id, status, question_coll_id } = payload.body;
  //     updateUploadStatusTrx = await db.DatabaseA.transaction();
  //     const updatingUpload = await OKMQuestionUploadStatus.create({
  //       status: status,
  //       question_coll_id: question_coll_id,
  //     },{
  //       where: {id: upload_id},
  //       transaction: updateUploadStatusTrx,
  //     });
  //     await updateUploadStatusTrx.commit();
  //     return updatingUpload;
  //   } catch (error) {
  //     if(updateUploadStatusTrx) { await updateUploadStatusTrx.rollback(); }
  //     throw error;
  //   }
  // };
  /** End Question Section */

  /** Misc */
  async createOkmLogs(payload, authUserId) {
    let createLogTrx;
    try {
      const userauth = await this.getUser(authUserId);
      const { message } = payload.body;

      createLogTrx = await db.DatabaseA.transaction();
      const logging = await OKMLogs.create({
        message: message,
        created_by: userauth?.fname,
      }, {transaction: createLogTrx });
      await createLogTrx.commit();

      return logging;
    } catch (error) {
      if(createLogTrx) { await createLogTrx.rollback(); }
      throw error;
    }
  };

  async getUser(id) {
    try {
      const user = await AppUserModel.findOne({
        where: {user_id: id},
      });
      if(!user) { return null }
      return user
    } catch (error) {
      throw error
    }
  };

  async createDateName(type) {
    try {
      const currentTimeInMilliseconds = Date.now();
      const currentTimeInSecond = Math.floor(currentTimeInMilliseconds/1000)
      const result = `${type}_${currentTimeInSecond}`
      return result
    } catch (e) {
      return e
    }
  };

  async storeMediaOkm(file, filePath) {
    try {
      const fullPath = path.join(this.appStorage, filePath);
      fs.mkdirSync(path.dirname(fullPath),{ recursive: true });
      fs.writeFileSync(fullPath, file.buffer);
      return true
    } catch (error) {
      throw error
    }
  };

  async removeMediaOkm(filePath) {
    try {
      fs.unlinkSync(path.join(this.appStorage, filePath))
      return true
    } catch (error) {
      throw error
    }
  };

  async getFileByFieldName (files, fieldName){
    const file = files.find(obj => obj.fieldname === fieldName);
    if(file) { return file }
    else { throw new Error('Field name not found'); }
  };
}

export default new OKMServices()