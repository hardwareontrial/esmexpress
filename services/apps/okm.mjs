import db from '@services/orm/index.mjs'
import { Op, where } from 'sequelize'
import path from 'path'
import fs from 'fs'
import ExcelJS from 'exceljs';
import { Readable } from 'stream';
import JobServices from '@services/jobs.mjs';
import pc from 'picocolors';
import { getNextAutoIncrementValue } from '@utils/helpers.mjs';

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

  async deleteMaterial(id) {};
  /** End Material Section */

  /** Material Content Section */
  async getAllMaterialContent() {
    try {
      const data = await OKMMaterialContent.findAll({
        include: [
          {model: OKMMaterial, as: 'contentMaterial'},
        ],
      });
      return data
    } catch (error) {
      throw error;
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

  async updateMaterialContent(id, materialId, description, filepath, viewCount, file, authUserId) {
    let materialContentUpdTrx, newPathFile;
    try {
      const materialContentFile = file;
      const authUser = await this.getUser(authUserId);
      
      if(materialContentFile) {
        const filename = await this.createDateName('materialContent');
        const filenameWithExt = `${filename}${path.extname(file.originalname)}`;
        newPathFile = `okm/material/${materialId}/${filenameWithExt}`;
        await this.storeMediaOkm(materialContentFile, newPathFile);
      }

      materialContentUpdTrx = await db.DatabaseA.transaction();
      await OKMMaterialContent.update({
        material_id: materialId,
        description: description,
        filepath: newPathFile,
        view_count: viewCount,
      },{
        where: {id: id},
        transaction: materialContentUpdTrx,
      });
      await materialContentUpdTrx.commit();

      if(materialContentFile && filepath) { await this.removeMediaOkm(filepath) }

      const updated = await this.detailMaterialContent(id);
      return updated;
    } catch (error) {
      console.log(error)
      if(materialContentUpdTrx) {
        await materialContentUpdTrx.rollback();
        await this.removeMediaOkm(filePath);
      }
      throw error
    }
  };

  async deleteMaterialContent(id) {};
  /** End Material Content Section */

  /** Question Collection Section */
  async getAllQuestionCollection(authUserId) {
    try {
      const questionsCollection = await OKMQuestionCollection.findAll({
        include: [
          {model: OKMQuestionContent, as: 'questions', include: [{ model: OKMQuestionAnswerOptions, as: 'options' }]},
          {model: OKMMaterialContent, as: 'partMaterial', include: [{model: OKMMaterial, as: 'contentMaterial'}]},
          {model: OKMQuestionUploadStatus, as: 'uploadedStatus'},
        ],
        order: [
          [{model: OKMQuestionUploadStatus, as: 'uploadedStatus'}, 'id', 'DESC']
        ],
      });
      return questionsCollection;
    } catch (error) {
      throw error
    }
  };

  async getQuestionCollectionPaginate(currentPage, itemPerPage, query, authUserId) {
    try {
      // let currentPage = payload.currentPage;
      // let itemPerPage = payload.limit; 
      // let query = payload.query;
      const questionColl = await this.getAllQuestionCollection();
      const filtered = questionColl.filter(item => item.title.toLowerCase().includes(query?.toLowerCase()));
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

  async createQuestionCollection(materialContentId, title, level, isActive, creator, files, questionsArray, authUserId) {
    let createQuestionCollTrx;
    try {
      
      const parsedIsActive = JSON.parse(isActive);
      const creator = await this.getUser(authUserId);
      const fileQuestion = await this.getFileByFieldName(files, 'fileExcel');

      createQuestionCollTrx = await db.DatabaseA.transaction();
      const createColl = await OKMQuestionCollection.create({
        material_content_id: materialContentId,
        title: title.toUpperCase(),
        level: level,
        is_active: parsedIsActive,
        created_by: creator?.fname,
      },{ transaction: createQuestionCollTrx });
      await createQuestionCollTrx.commit();

      if(fileQuestion) {
        const filename = await this.createDateName('excelQuestion');
        const filenameWithExt = `${filename}${path.extname(fileQuestion.originalname)}`;
        const filePath = `okm/temporary/${filenameWithExt}`;
        await this.storeMediaOkm(fileQuestion, filePath);
        const creatingJob = await JobServices.createJob('medium', {
          type: 'process-excel-okm-question', collection_id: createColl.id, filename: filenameWithExt
        });
        const creatingUploadStatus = await this.createQuestionUploadStatus({
          body: { status: 'queue', question_coll_id: createColl.id },
        });

        if(!creatingJob || !creatingUploadStatus) { await this.removeMediaOkm(filePath); }
      }

      if(questionsArray.length > 0) {
        await this.readQuestionFromForm(createColl.id, questionsArray, files, authUserId)
      }

      const created = await this.detailQuestionCollection(createColl.id, authUserId);
      return created;
    } catch (error) {
      if(createQuestionCollTrx) { await createQuestionCollTrx.rollback() }
      throw error
    }
  };

  async updateQuestionCollection(id, materialContentId, title, level, isActive, authUserId) {
    let updateQuestionCollTrx;
    try {
      const parsedIsActive = JSON.parse(isActive);

      updateQuestionCollTrx = await db.DatabaseA.transaction();
      const updating = await OKMQuestionCollection.update({
        material_content_id: materialContentId,
        title: title.toUpperCase(),
        level: level,
        is_active: parsedIsActive,
      },{
        where: { id: id },
        transaction: updateQuestionCollTrx
      });
      await updateQuestionCollTrx.commit();

      const updated = await this.detailQuestionCollection(id, authUserId);
      return updated;
    } catch (error) {
      if(updateQuestionCollTrx) { await updateQuestionCollTrx.rollback() }
      throw error;
    }
  };

  async detailQuestionCollection(id, authUserId) {
    try {
      const questionCollection = await OKMQuestionCollection.findOne({
        where: {id: id},
        include: [
          {model: OKMQuestionContent, as: 'questions', include: [{ model: OKMQuestionAnswerOptions, as: 'options' }]},
          {model: OKMMaterialContent, as: 'partMaterial', include: [{model: OKMMaterial, as: 'contentMaterial'}]},
          {model: OKMQuestionUploadStatus, as: 'uploadedStatus'},
        ],
        order: [
          [{model: OKMQuestionUploadStatus, as: 'uploadedStatus'}, 'id', 'DESC']
        ],
      });
      return questionCollection;
    } catch (error) {
      throw error
    }
  };

  async deleteQuestionCollection() {};
  /** End Question Collection Section */

  /** Question Content Section */
  async getAllQuestionContent(authUser) {
    try {
      const data = await OKMQuestionContent.findAll({
        include: [{ model: OKMQuestionAnswerOptions, as: 'options' }]
      });
      console.log(data)
      return data
    } catch (error) {
      throw error
    }
  };

  async getQuestionContentPaginate() {};

  async createQuestionContent(collectionId, text, media, type, answerKey, answerOpts) {
    let createQuestionContentTrx, nextId, dirMediaPath, mediaPath;
    try {
      nextId = await getNextAutoIncrementValue('tbl_okm_question_content');
      dirMediaPath = `okm/question/collection/${collectionId}/Q_${nextId}`;

      if(media) {
        const filename = await this.createDateName('questionContent');
        const filenameWithExt = `${filename}.${media.imageData.extension}`;
        mediaPath = `${dirMediaPath}/${filenameWithExt}`;
        const bufferData = media.imageData.buffer;
        await this.storeMediaOkm({buffer: bufferData}, mediaPath);
      }

      createQuestionContentTrx = await db.DatabaseA.transaction();
      const createContent = await OKMQuestionContent.create({
        question_coll_id: collectionId,
        question_text: text,
        question_media: media ? mediaPath : null,
        question_type: type,
        answer_key: answerKey,
      },{transaction: createQuestionContentTrx});
      
      if(type === 'multiple') {
        for(const answeropt of answerOpts) {
          console.log(answeropt)
          if(answeropt.text || answeropt.media) {
            await this.createQuestionOption(createContent.id, answeropt.text, answeropt.media, answeropt.value, dirMediaPath, createQuestionContentTrx);
          }
        }
      }
      await createQuestionContentTrx.commit();

      return createContent;
    } catch (error) {
      if(createQuestionContentTrx) { await createQuestionContentTrx.rollback(); }
      if(nextId) { await OKMQuestionContent.destroy({where: {id: nextId}}); }
      if(dirMediaPath) { await this.removeDirectoryMediaOkm(dirMediaPath); }
      throw error;
    }
  };

  async detailQuestionContent(id, authUser) {
    try {
      const data = await OKMQuestionContent.findOne({
        where: { id: id },
        include: [{ model: OKMQuestionAnswerOptions, as: 'options' }]
      });
      return data;
    } catch (error) {
      throw error;
    }
  };

  async updateQuestionContent(id, collectionId, questionText, questionMedia, questionType, answerKey) {};

  async deleteQuestionContent(id) {};
  /** End Question Content Section */

  /** Question Option Section */
  async getAllQuestionOption(authUserId) {
    try {
      const data = await OKMQuestionAnswerOptions.findAll();
      return data;
    } catch (error) {
      throw error;
    }
  };

  async createQuestionOption(contentId, text, media, value, mediaStorage, transaction) {
    let createQstOptTrx, mediaPath;
    try {
      if(media) {
        const filename = await this.createDateName('answerOpt');
        const filenameWithExt = `${filename}.${media.imageData.extension}`;
        mediaPath = `${mediaStorage}/${filenameWithExt}`;
        const bufferData = media.imageData.buffer;
        await this.storeMediaOkm({buffer: bufferData}, mediaPath);
      }

      const createOpt = await OKMQuestionAnswerOptions.create({
        question_content_id: contentId,
        option_text: text,
        option_media: media ? mediaPath : null,
        option_value: value,
      },{transaction});

      return createOpt;
    } catch (error) {
      if(transaction) { await transaction.rollback(); }
      throw error
    }
  };

  async detailQuestionOption(id) {
    try {
      const data = await OKMQuestionAnswerOptions.findOne({
        where: { id: id },
      });
      return data
    } catch (error) {
      throw error;
    }
  };

  async updateQuestionOption(id, contentId, text, media, value) {};

  async deleteQuestionOption(id) {};

  async storeMediaQuestion() {};
  /** End Question Option Section */

  /** Quiz Section */
  async getAllQuiz() {};
  async getQuizPaginate() {};
  async createQuiz() {};
  async detailQuiz() {};
  async updateQuiz() {};
  async deleteQuiz() {};
  /** End Quiz Section */

  /** Participant Section */
  async createParticipant() {};
  async detailParticipant() {};
  async updateParticipant() {};
  async deleteParticipant() {};
  /** End Participant Section */

  /** Participant Response Section */
  async createParticipantResponse() {};
  async detailParticipantResponse() {};
  async updateParticipantResponse() {};
  async deleteParticipantResponse() {};
  /** End Participant Response Section */

  /** Validator Section*/
  inputMaterialValidator(title, sinopsis, level, deptId, isActive, createdBy) {
    const errors = [];
    if(!title) errors.push('Title is required.');
    if(!level) errors.push('Level is required.');
    if(!deptId) errors.push('Department identity is required.');
    if(!isActive) errors.push('Status is required.');
    if(!createdBy) errors.push('Creator name is required.');
    return { success: errors.length === 0, message: errors }
  };

  inputMaterialContentValidator(materialId, description, filepath, viewCount) {
    const errors = [];
    if(!materialId) errors.push('Material identity is required.');
    return { success: errors.length === 0, message: errors }
  };

  inputMaterialFileValidator(file) {
    const errors = [];

    const acceptedMimes = ['application/pdf'];
    const maxFileSize = 6 * 1024 * 1024; // 6Mb
    if(!acceptedMimes.includes(file.mimetype)) { errors.push('Only accept PDF file.') };
    if(maxFileSize < file.size) { errors.push('File size exceeds the limit (6 MB).') };

    return { success: errors.length === 0, message: errors }
  };

  inputQuestionCollectionValidator(materialContentId, title, level, isActive, createdBy) {
    const errors = [];
    if(!materialContentId) errors.push('Material-Content identity is required.');
    if(!title) errors.push('Title is required.');
    if(!level) errors.push('Level is required.');
    if(!isActive) errors.push('Status is required.');
    if(!createdBy) errors.push('Creator name is required.');
    return { success: errors.length === 0, message: errors }
  };

  inputQuestionFileValidator(file) {
    const errors = [];

    const acceptedMimes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const maxFileSize = 3 * 1024 * 1024; // 3 Mb
    if(!acceptedMimes.includes(file.mimetype)) { errors.push('Only accept PDF file.') };
    if(maxFileSize < file.size) { errors.push('File size exceeds the limit (3 MB).') };

    return { success: errors.length === 0, message: errors }
  };

  inputQuestionContentValidator(questionCollectionId, questionType, questionText, questionMedia, answerKey) {
    const errors = [];
    if(!questionCollectionId) errors.push('Question-Collection identity is required.');
    if(!questionType) errors.push('Question type is required.');
    return { success: errors.length === 0, message: errors }
  };

  inputQuestionAnswerOptValidator(questionContentId, optText, optMedia, optValue) {
    const errors = [];
    if(!questionContentId) errors.push('Question-Content identity is required.');
    if(!optValue) errors.push('Option Value is required.');
    return { success: errors.length === 0, message: errors }
  };

  inputQuizValidator(title, materialContentId, questionCollId, totalQuestion, score, timer, startDate, endDate, type, notes, isActive, creator ) {
    const errors = [];
    if(!title) errors.push('Title is required.');
    if(!materialContentId) errors.push('Material-Content is required.');
    if(!questionCollId) errors.push('Question-Collection is required.');
    if(!totalQuestion) errors.push('Input total question is required.');
    if(!score) errors.push('Score is required.');
    if(!timer) errors.push('Timer is required.');
    if(!startDate) errors.push('Start of Quiz is required.');
    if(!endDate) errors.push('End of Quiz is required.');
    if(!type) errors.push('Type Quiz is required.');
    if(!isActive) errors.push('Status is required.');
    if(!creator) errors.push('Creator name is required.');
    return { success: errors.length === 0, message: errors };
  };

  inputParticipantValidator(quizId, userNik, timeLeft, startDate, endDate, status, certificatePath) {
    const errors = [];
    if(!quizId) errors.push('Quiz identity is required.');
    if(!userNik) errors.push('User NIK is required.');
    if(!timeLeft) errors.push('User time left is required.');
    if(!status) errors.push('User quiz status is required.');
    return { success: errors.length === 0, message: errors }
  };

  inputParticipantResponseValidator(participantId, questionContentId) {
    const errors = [];
    if(!participantId) errors.push('Participant identity is required.');
    if(!questionContentId) errors.push('Question-Content identity is required.');
    return { success: errors.length === 0, message: errors }
  };

  inputCertificateValidator(quizId, signer, designPath) {
    const errors = [];
    if(!quizId) errors.push('Quiz identity is required.');
    if(!signer) errors.push('Signer name is required.');
    if(!designPath) errors.push('Certificate Image Path is required.');
    return { success: errors.length === 0, message: errors }
  }
  /** End Validator Section */

  /** Misc */
  async readQuestionFromExcel(collection_id, filename) {
    
    function checkArrayImages (array, ref) {
      const finding =  array.find(item => item.cell === ref)
      if(!finding) { return false }
      return finding
    };

    try {
      const filePath = `okm/temporary/${filename}`;
      // const nameExcel = 'excelQuestion_1723188346.xlsx';
      // const filePath = `okm/temporary/${nameExcel}`;
      const question_coll_id = collection_id;

      const arrayImages = [];
      const dataFromExcel = [];
      const startRow = 9;

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(path.join(this.appStorage, filePath));
      const worksheet = workbook.getWorksheet('Sheet1');
      const rowLimit = worksheet.actualRowCount;
      const initializeForm = worksheet.getCell('A1').value;
      
      if(initializeForm !== 'Form_by_IT') {
        console.log(pc.bgRed(`OKM-QUESTION: No Valid Form (missing 'Form_by_IT' indicator).`));
        return new Error(`No Valid Form (missing 'Form_by_IT' indicator).`);
      }
      if(startRow > rowLimit) {
        console.log(pc.bgRed(`OKM-QUESTION: No Data from file.`));
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
      await this.createQuestionUploadStatus({body: { status: 'success', question_coll_id: collection_id }});
      await this.removeMediaOkm(filePath)
      return seeding;
    } catch (error) {
      // console.log(error)
      await this.createQuestionUploadStatus({body: { status: 'failed', question_coll_id: collection_id }});
      throw error
    }
  };

  async seedingQuestionFromExcel(arrayQuestion) {
    try {
      if(arrayQuestion.length <=0) {
        console.log(pc.bgYellow(`OKM-QUESTION: No Array Questions provided.`));
        return false
      }

      for(const [index, question] of arrayQuestion.entries()) {
        // console.log(question)
        const creatingContent = await this.createQuestionContent(
          question.collection_id,
          question.text,
          question.media,
          question.type,
          question.key,
          question.answersOpt,
        );
      }
      return true;
    } catch (error) {
      throw error
    }
  };

  async createQuestionUploadStatus(payload) {
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

  async readQuestionFromForm(collectionId, questionsArray, mediaArray, authUserId) {
    try {
      // console.info({collection_id: collectionId, questionsArray: questionsArray, mediaArray: mediaArray, authUserId: authUserId});
      const findingMedia = async (mediaArray, fieldName) => {
        const mediaByFieldName = await this.getFileByFieldName(mediaArray, fieldName);
        
        
      }

      // const findingMedia = await this.getFileByFieldName(mediaArray, fieldName);

      // function checkArrayImage(mediaArray, fieldName) {
      //   // const finding = await getFileByFieldName(mediaArray, fieldName);
      //   const [type, subtype] = findingMedia.mimetype.split('/');
      //   const question_media_index = fieldName.match(/_(\d+)_/);
      //   const obj = {
      //     imageId: null,
      //     cell: null,
      //     imageData: {
      //       type: type,
      //       name: fieldName,
      //       extension: subtype,
      //       buffer: findingMedia.buffer,
      //       index: question_media_index,
      //     }
      //   }
      //   return obj;
      // }

      // for (const [index, item] of questionsArray.entries()) {
      //   let eachQuestion = {
      //     collection_id: collectionId,
      //     text: item.text,
      //     media: (item.media === 'true' || item.media === true) ? checkArrayImage(mediaArray, `question_${index}_media`) : false,
      //     key: item.answerKey,
      //     type: item.type,
      //   }

      //   console.log({eachQuestion: eachQuestion})
      // }
    } catch (error) {
      throw error;
    }
  };

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

  async removeDirectoryMediaOkm(dirPath) {
    try {
      fs.rmSync(path.dirname(dirPath), {recursive: true, force: true});
    } catch (error) {
      throw error;
    }
  };

  async getFileByFieldName (files, fieldName){
    const file = files.find(obj => obj.fieldname === fieldName);
    if(file) { return file }
    else { console.info(pc.bgYellow(pc.black(`OKMServices-getFileByFieldName: Field name not found!`))); return false }
  };
}

export default new OKMServices()