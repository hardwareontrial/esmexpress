import db from '@services/orm/index.mjs';
import path from 'path';
import fs from 'fs/promises';
import ExcelJS from 'exceljs';
import pc from 'picocolors';
import JobServices from '@services/jobs.mjs';
import HRServices from '@services/apps/hr.mjs';
import { getNextAutoIncrementValue } from '@utils/helpers.mjs';
import { Op } from 'sequelize';

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
    this.appStorage = path.join(path.resolve(), '/public/storage/app/');
  }

  /** MATERIAL */
  async getAllMaterial(authUserId) {
    try {
      const data = await OKMMaterial.findAll({
        include: [
          {
            model: OKMMaterialContent,
            as: 'materialContents',
            include: [
              {
                model: OKMQuestionCollection,
                as: 'contentQuestions',
                include: [
                  {
                    model: OKMQuestionContent,
                    as: 'questions',
                    include: [{model: OKMQuestionAnswerOptions, as: 'options'}]
                  }
                ]
              }
            ]
          },
          {model: AppDeptModel, as: 'materialDeptOKM'}
        ],
      });
      return data;
    } catch (error) {
      throw error;
    }
  };
  async createMaterial(authUserId, title, sinopsis, level, deptId, isActive, creator) {
    let createMaterialTrx;
    try {
      createMaterialTrx = await db.DatabaseA.transaction();
      const creating = await OKMMaterial.create({
        title: title.toUpperCase(),
        sinopsis: sinopsis,
        level: level,
        department_id: deptId,
        is_active: isActive,
        created_by: creator,
      },{transaction: createMaterialTrx});
      await createMaterialTrx.commit();
      return creating;
    } catch (error) {
      if(createMaterialTrx) { await createMaterialTrx.rollback(); }
      throw error;
    }
  };
  async detailMaterial(authUserId, id) {
    try {
      const data = await OKMMaterial.findOne({
        where: { id: id },
        include: [
          {
            model: OKMMaterialContent,
            as: 'materialContents',
            include: [
              {
                model: OKMQuestionCollection,
                as: 'contentQuestions',
                include: [
                  {
                    model: OKMQuestionContent,
                    as: 'questions',
                    include: [{model: OKMQuestionAnswerOptions, as: 'options'}]
                  }
                ]
              }
            ]
          },
          {model: AppDeptModel, as: 'materialDeptOKM'}
        ],
      });
      return data;
    } catch (error) {
      
    }
  };
  async updateMaterial(authUserId, id, title, sinopsis, level, deptId, isActive, creator) {
    let updateMaterialTrx;
    try {
      updateMaterialTrx = await db.DatabaseA.transaction();
      const updating = await OKMMaterial.update({
        title: title.toUpperCase(),
        sinopsis: sinopsis,
        level: level,
        department_id: deptId,
        is_active: isActive,
        created_by: creator,
      },{
        where: {id: id},
        transaction: updateMaterialTrx,
      });
      await updateMaterialTrx.commit();
      return updating;
    } catch (error) {
      if(updateMaterialTrx) { await updateMaterialTrx.rollback(); }
      throw error;
    }
  };
  async deleteMaterial(authUserId, id) {};

  /** MATERIAL CONTENT */
  async getAllMaterialContent(authUserId) {
    try {
      const data = await OKMMaterialContent.findAll({
        include: [
          {
            model: OKMQuestionCollection,
            as: 'contentQuestions',
            include: [
              {
                model: OKMQuestionContent,
                as: 'questions',
                include: [{model: OKMQuestionAnswerOptions, as: 'options'}]
              }
            ]
          },
          {model: OKMMaterial, as: 'contentMaterial'},
        ],
      });
      return data;
    } catch (error) {
      throw error;
    }
  };
  async createMaterialContent(authUserId, materialId, description, filePath, viewCount, isActive) {
    let materialContentTrx;
    try {
      materialContentTrx = await db.DatabaseA.transaction();
      const creating = await OKMMaterialContent.create({
        material_id: materialId,
        description: description,
        filepath: filePath,
        view_count: viewCount,
        is_active: isActive,
      });
      await materialContentTrx.commit();
      return creating;
    } catch (error) {
      if(materialContentTrx) { await materialContentTrx.rollback(); }
      throw error;
    }
  };
  async detailMaterialContent(authUserId, id) {
    try {
      const data = await OKMMaterialContent.findOne({
        where: {id: id},
        include: [
          {
            model: OKMQuestionCollection,
            as: 'contentQuestions',
            include: [
              {
                model: OKMQuestionContent,
                as: 'questions',
                include: [{model: OKMQuestionAnswerOptions, as: 'options'}]
              }
            ]
          },
          {model: OKMMaterial, as: 'contentMaterial'},
        ],
      });
      return data;
    } catch (error) {
      throw error;
    }
  };
  async updateMaterialContent(authUserId, id, materialId, description, filePath, viewCount, isActive) {
    let updateMaterialContentTrx;
    try {
      updateMaterialContentTrx = await db.DatabaseA.transaction();
      const updating = await OKMMaterialContent.update({
        material_id: materialId,
        description: description,
        filepath: filePath,
        view_count: viewCount,
        is_active: isActive,
      },{
        where: {id: id},
        transaction: updateMaterialContentTrx,
      });
      await updateMaterialContentTrx.commit();
      return updating;
    } catch (error) {
      if(updateMaterialContentTrx) { await updateMaterialContentTrx.rollback(); }
      throw error;
    }
  };
  async deleteMaterialContent(authUserId, id) {};

  /** QUESTION COLLECTION */
  async getQuestionCollection(authUserId) {
    try {
      const data = await OKMQuestionCollection.findAll({
        include: [
          {model: OKMQuestionContent, as: 'questions', include: [{ model: OKMQuestionAnswerOptions, as: 'options' }]},
          {model: OKMMaterialContent, as: 'partMaterial', include: [{model: OKMMaterial, as: 'contentMaterial', include:[{model: AppDeptModel, as: 'materialDeptOKM'}]}]},
          {model: OKMQuestionUploadStatus, as: 'uploadedStatus'},
        ],
        order: [
          [{model: OKMQuestionUploadStatus, as: 'uploadedStatus'}, 'id', 'DESC']
        ],
      });
      return data
    } catch (error) {
      throw error;
    }
  };
  async createQuestionCollection(authUserId, materialContentId, title, level, creator, isActive) {
    let qstCollTrx;
    try {
      qstCollTrx = await db.DatabaseA.transaction();
      const data = await OKMQuestionCollection.create({
        material_content_id: materialContentId,
        title: title.toUpperCase(),
        level: level,
        is_active: isActive,
        created_by: creator,
      },{transaction: qstCollTrx});
      await qstCollTrx.commit();
      return data;
    } catch (error) {
      if(qstCollTrx) { await qstCollTrx.rollback(); }
      throw error;
    }
  };
  async detailQuestionCollection(authUserId, id) {
    try {
      const data = await OKMQuestionCollection.findOne({
        where: {id: id},
        include: [
          {model: OKMQuestionContent, as: 'questions', include: [{ model: OKMQuestionAnswerOptions, as: 'options' }]},
          {model: OKMMaterialContent, as: 'partMaterial', include: [{model: OKMMaterial, as: 'contentMaterial', include:[{model: AppDeptModel, as: 'materialDeptOKM'}]}]},
          {model: OKMQuestionUploadStatus, as: 'uploadedStatus'},
        ],
        order: [
          [{model: OKMQuestionUploadStatus, as: 'uploadedStatus'}, 'id', 'DESC']
        ],
      });
      return data
    } catch (error) {
      throw error;
    }
  };
  async updateQuestionCollection(authUserId, id, materialContentId, title, level, creator, isActive) {
    let qstCollTrx;
    try {
      qstCollTrx = await db.DatabaseA.transaction();
      const data = await OKMQuestionCollection.update({
        material_content_id: materialContentId,
        title: title.toUpperCase(),
        level: level,
        is_active: isActive,
        created_by: creator,
      },{
        where: {id: id},
        transaction: qstCollTrx
      });
      await qstCollTrx.commit();
      return data;
    } catch (error) {
      if(qstCollTrx) { await qstCollTrx.rollback(); }
      throw error;
    }
  };
  async deleteQuestionCollection(authUserId, id) {};

  /** QUESTION CONTENT */
  async getQuestionContent(authUserId) {
    try {
      const data = await OKMQuestionContent.findAll({
        include: [
          { model: OKMQuestionAnswerOptions, as: 'options' },
          { model: OKMQuestionCollection, as: 'questionCollection', include: [{model: OKMMaterialContent, as: 'partMaterial', include: [{model: OKMMaterial, as: 'contentMaterial', include:[{model: AppDeptModel, as: 'materialDeptOKM'}]}]}] },
        ],
      });
      return data
    } catch (error) {
      throw error;
    }
  };
  async createQuestionContent(authUserId, collectionId, type, text, mediapath, answerKey, isActive) {
    let qstContentTrx;
    try {
      qstContentTrx = await db.DatabaseA.transaction();
      const data = await OKMQuestionContent.create({
        question_coll_id: collectionId,
        question_type: type,
        question_text: text,
        question_media: mediapath,
        answer_key: answerKey,
        is_active: isActive,
      },{transaction: qstContentTrx})
      await qstContentTrx.commit();
      return data;
    } catch (error) {
      if(qstContentTrx) { await qstContentTrx.rollback(); }
      throw error;
    }
  };
  async detailQuestionContent(authUserId, id) {
    try {
      const data = await OKMQuestionContent.findOne({
        where: {id: id},
        include: [
          { model: OKMQuestionAnswerOptions, as: 'options' },
          { model: OKMQuestionCollection, as: 'questionCollection', include: [{model: OKMMaterialContent, as: 'partMaterial', include: [{model: OKMMaterial, as: 'contentMaterial', include:[{model: AppDeptModel, as: 'materialDeptOKM'}]}]}] },
        ],
      });
      return data
    } catch (error) {
      throw error;
    }
  };
  async updateQuestionContent(authUserId, id, collectionId, type, text, mediapath, answerKey, isActive) {
    let qstContentTrx;
    try {
      qstContentTrx = await db.DatabaseA.transaction();
      const data = await OKMQuestionContent.update({
        question_coll_id: collectionId,
        question_type: type,
        question_text: text,
        question_media: mediapath,
        answer_key: answerKey,
        is_active: isActive,
      },{
        where: {id: id},
        transaction: qstContentTrx
      })
      await qstContentTrx.commit();
      return data;
    } catch (error) {
      if(qstContentTrx) { await qstContentTrx.rollback(); }
      throw error;
    }
  };
  async deleteQuestionContent(authUserId, id) {};

  /** QUESTION OPTIONS */
  async getQuestionOpts(authUserId) {
    try {
      const data = await OKMQuestionAnswerOptions.findAll({
        include: [
          {
            model: OKMQuestionContent,
            as: 'partContent',
            include: [
              {
                model: OKMQuestionCollection,
                as: 'questionCollection',
                include: [
                  {model: OKMMaterialContent, as: 'partMaterial', include: [{model: OKMMaterial, as: 'contentMaterial', include:[{model: AppDeptModel, as: 'materialDeptOKM'}]}]}
                ] 
              },
            ]
          },
        ],
      });
      return data
    } catch (error) {
      throw error;
    }
  };
  async createQuestionOpts(authUserId, contentid, text, mediapath, value, isActive) {
    let qstOptsTrx;
    try {
      qstOptsTrx = await db.DatabaseA.transaction();
      const data = await OKMQuestionAnswerOptions.create({
        question_content_id: contentid,
        option_text: text,
        option_media: mediapath,
        option_value: value,
        is_active: isActive,
      },{transaction: qstOptsTrx});
      await qstOptsTrx.commit();
      return data;
    } catch (error) {
      if(qstOptsTrx) { await qstOptsTrx.rollback(); }
      throw error;
    }
  };
  async detailQuestionOpts(authUserId, id) {
    try {
      const data = await OKMQuestionAnswerOptions.findOne({
        where: {id: id},
        include: [
          {
            model: OKMQuestionContent,
            as: 'partContent',
            include: [
              {
                model: OKMQuestionCollection,
                as: 'questionCollection',
                include: [
                  {model: OKMMaterialContent, as: 'partMaterial', include: [{model: OKMMaterial, as: 'contentMaterial', include:[{model: AppDeptModel, as: 'materialDeptOKM'}]}]}
                ] 
              },
            ]
          },
        ],
      });
      return data
    } catch (error) {
      throw error;
    }
  };
  async updateQuestionOpts(authUserId, id, contentid, text, mediapath, value, isActive) {
    let qstOptsTrx;
    try {
      qstOptsTrx = await db.DatabaseA.transaction();
      const data = await OKMQuestionAnswerOptions.update({
        question_content_id: contentid,
        option_text: text,
        option_media: mediapath,
        option_value: value,
        is_active: isActive,
      },{
        where: {id: id},
        transaction: qstOptsTrx
      });
      await qstOptsTrx.commit();
      return data;
    } catch (error) {
      if(qstOptsTrx) { await qstOptsTrx.rollback(); }
      throw error;
    }
  };
  async deleteQuestionOpts(authUserId, id) {};
  async getQuestionOptsByContentId(authUserId, content_id) {
    try {
      const allData = await this.getQuestionOpts(authUserId);
      const filteredContentId = await allData.filter(item => item.question_content_id === parseInt(content_id));
      return filteredContentId;
    } catch (error) {
      throw error;
    }
  };

  /** QUESTION UPLOAD LOG */
  async createQuestionUploadStatus(authUserId, status, questionCollId) {
    let qstUploadTrx;
    try {
      qstUploadTrx = await db.DatabaseA.transaction();
      const logs = await OKMQuestionUploadStatus.create({
        status: status,
        question_coll_id: questionCollId,
      },{transaction: qstUploadTrx});
      await qstUploadTrx.commit();
      return logs;
    } catch (error) {
      if(qstUploadTrx) { await qstUploadTrx.rollback(); }
      throw error
    }
  };

  /** Quiz */
  async getAllQuiz() {};
  async createQuiz() {};
  async detailQuiz() {};
  async updateQuiz() {};

  /** MISC */
  async readQuestionFromExcel(authUserId, collection_id, filename) {
    function checkArrayImages (array, ref) {
      const finding =  array.find(item => item.cell === ref)
      if(!finding) { return false }
      return finding
    };

    try {
      const filePath = `okm/temporary/${filename}`;
      const question_coll_id = collection_id;
      let seedingStatus = false;

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
          collection_id: collection_id,
          text: worksheet.getCell(`B${row}`).value,
          media: checkArrayImages(arrayImages, `C${row}`),
          key: worksheet.getCell(`L${row}`).value,
          type: worksheet.getCell(`M${row}`).value,
          isActive: 1,
        }
        if(eachQuestion.type === 'multiple') {
          /** AnswerOptions (Cell D-K) */
          const answersOpt = [];
          const opt1 = {
            text: worksheet.getCell(`D${row}`).value,
            media: checkArrayImages(arrayImages, `E${row}`),
            value: 1,
            isActive: 1,
          };
          const opt2 = {
            text: worksheet.getCell(`F${row}`).value,
            media: checkArrayImages(arrayImages, `G${row}`),
            value: 2,
            isActive: 1,
          };
          const opt3 = {
            text: worksheet.getCell(`H${row}`).value,
            media: checkArrayImages(arrayImages, `I${row}`),
            value: 3,
            isActive: 1,
          };
          const opt4 = {
            text: worksheet.getCell(`J${row}`).value,
            media: checkArrayImages(arrayImages, `K${row}`),
            value: 4,
            isActive: 1,
          };
          answersOpt.push(opt1,opt2,opt3,opt4)
          eachQuestion.answersOpt = answersOpt;
        }
        dataFromExcel.push(eachQuestion);
      }

      // if(dataFromExcel.length > 0){
      //   for(const [idxQst, question] of dataFromExcel.entries()) {
      //     const nextId = await getNextAutoIncrementValue('tbl_okm_question_content');
      //     const dirMediaPath = `okm/question/collection/${collection_id}/Q_${nextId}`;

      //     let mediaPath = null;
      //     if(question.media) {
      //       const filename = await this.createDateName('questionContent');
      //       const filenameWithExt = `${filename}.${question.media.imageData.extension}`;
      //       mediaPath = `${dirMediaPath}/${filenameWithExt}`;
      //       const bufferData = question.media.imageData.buffer;
      //       await this.storeMedia(mediaPath, bufferData);
      //     }
          
      //     const creatingContent = await this.createQuestionContent(
      //       authUserId,
      //       question.collection_id,
      //       question.type,
      //       question.text,
      //       mediaPath,
      //       question.key,
      //       question.isActive,
      //     );
      //     console.log(pc.bgGreen(pc.black(`OKMServices-readQuestionFromExcel: Qst_${idxQst} seeded.`)));

      //     if(creatingContent && question.type === 'multiple') {
      //       for(const [idxOpt, opt] of question.answersOpt.entries()) {

      //         let mediaPathOpt = null;
      //         if(opt.media) {
      //           const filenameOpt = await this.createDateName('questionContent');
      //           const filenameOptWithExt = `${filenameOpt}.${opt.media.imageData.extension}`;
      //           mediaPathOpt = `${dirMediaPath}/${filenameOptWithExt}`;
      //           await this.storeMedia(mediaPathOpt, opt.media.imageData.buffer);
      //         }
      //         const creatingOpts = await this.createQuestionOpts(
      //           authUserId,
      //           creatingContent.id,
      //           opt.text,
      //           mediaPathOpt,
      //           opt.value,
      //           opt.isActive,
      //         );
      //         console.log(pc.bgGreen(pc.black(`OKMServices-readQuestionFromExcel: Opt_${idxOpt} seeded, part of Qst_${idxQst}.`)));
      //       }
      //     }
      //   }
      // }
      const seeding = await this.seedingQuestions(authUserId, dataFromExcel, collection_id);
      await this.createQuestionUploadStatus(authUserId, 'success', collection_id);
      await this.removePath(filePath);
      return true;
    } catch (error) {
      await this.createQuestionUploadStatus(authUserId, 'failed', collection_id);
      throw error
    }
  };
  async readQuestionFromForm(authUserId, questionsArray, mediaArray, collection_id) {
    const findingIndex = (fieldName) => {
      return (fieldName.split('_').filter(part => !isNaN(part))).map(Number);
    };
    const checkMedia = async (medias, fieldName) => {
      const mediaByFieldName = await this.getFileByFieldName(medias, fieldName);
      const [type, subtype] = mediaByFieldName.mimetype.split('/');
      return {
        imageId: null,
        cell: null,
        imageData: {
          type: type,
          name: fieldName,
          extension: subtype,
          buffer: mediaByFieldName.buffer,
          index: fieldName.includes('options') ? findingIndex(fieldName)[1] : findingIndex(fieldName)[0],
        }
      }
    };
    try {
      const dataFromForm = [];
      for (const [index, item] of questionsArray.entries()) {
        let eachQuestion = {
          collection_id: item.collection_id,
          text: item.text,
          media: JSON.parse(item.media) ? await checkMedia(mediaArray, `questions_${index}_media`) : false,
          key: item.answerKey ? item.answerKey : null,
          type: item.type,
          isActive: item.isActive,
        }
        if(eachQuestion.type === 'multiple') {
          const answersOpt = await Promise.all(item.options.map(async (itemOpt, indexOpt) => {
            return {
              text: itemOpt.text,
              media: JSON.parse(itemOpt.media) ? await checkMedia(mediaArray, `questions_${index}_options_${indexOpt}_media`) : false,
              value: itemOpt.value,
              isActive: itemOpt.isActive,
            };
          }));
          eachQuestion.answersOpt = answersOpt;
        }
        dataFromForm.push(eachQuestion);
      }
      const seeding = await this.seedingQuestions(authUserId, dataFromForm, collection_id);
      return true;
    } catch (error) {
      throw error;
    }
  };
  async seedingQuestions(authUserId, questionArray, collection_id) {
    try {
      if(questionArray.length > 0){
        for(const [idxQst, question] of questionArray.entries()) {
          const nextId = await getNextAutoIncrementValue('tbl_okm_question_content');
          const dirMediaPath = `okm/question/collection/${collection_id}/Q_${nextId}`;

          let mediaPath = null;
          if(question.media) {
            const filename = await this.createDateName('questionContent');
            const filenameWithExt = `${filename}.${question.media.imageData.extension}`;
            mediaPath = `${dirMediaPath}/${filenameWithExt}`;
            const bufferData = question.media.imageData.buffer;
            await this.storeMedia(mediaPath, bufferData);
          }
          
          const creatingContent = await this.createQuestionContent(
            authUserId,
            question.collection_id,
            question.type,
            question.text,
            mediaPath,
            question.key,
            question.isActive,
          );
          console.log(pc.bgGreen(pc.black(`OKMServices-readQuestionFromExcel: Qst_${idxQst} seeded.`)));

          if(creatingContent && question.type === 'multiple') {
            for(const [idxOpt, opt] of question.answersOpt.entries()) {

              let mediaPathOpt = null;
              if(opt.media) {
                const filenameOpt = await this.createDateName('questionContent');
                const filenameOptWithExt = `${filenameOpt}.${opt.media.imageData.extension}`;
                mediaPathOpt = `${dirMediaPath}/${filenameOptWithExt}`;
                await this.storeMedia(mediaPathOpt, opt.media.imageData.buffer);
              }
              const creatingOpts = await this.createQuestionOpts(
                authUserId,
                creatingContent.id,
                opt.text,
                mediaPathOpt,
                opt.value,
                opt.isActive,
              );
              console.log(pc.bgGreen(pc.black(`OKMServices-readQuestionFromExcel: Opt_${idxOpt} seeded, part of Qst_${idxQst}.`)));
            }
          }
        }
      }
      return true;
    } catch (error) {
      throw error;
    }
  };
  async storeMedia(filepath, dataBuffer){
    try {
      const fullPath = path.join(this.appStorage, filepath);
      await fs.mkdir(path.dirname(fullPath),{ recursive: true });
      await fs.writeFile(fullPath, dataBuffer);
      console.log(pc.bgGreen(pc.black(`OKMServices-storeMedia: file media stored.`)))
    } catch (error) {
      console.error(pc.bgRed(pc.white(`OKMServices-storeMedia: ${error}`)));
    }
  };
  async removePath(filepath) {
    try {
      const fullPath = path.join(this.appStorage, filepath);
      const stats = await fs.stat(fullPath);

      if(stats.isDirectory()) {
        const items = await fs.readdir( fullPath, {withFileTypes: true});
        for (const item of items) {
          const fullpath = path.join(fullPath, item.name);
          if(item.isDirectory()) { await this.removePath(fullpath) }
          else { await fs.unlink(fullpath); }
        }
        await fs.rmdir(fullPath);
        console.log(pc.bgGreen(pc.black(`OKMServices-removePath: ${fullPath} remove completely.`)))
      }
      else if(stats.isFile()) {
        await fs.unlink(fullPath);
        console.log(pc.bgGreen(pc.black(`OKMServices-removePath: ${fullPath} file removed`)))
      }
      else { console.log(pc.bgYellow(pc.black(`OKMServices-removePath: ${fullPath} undefined`))); }
    } catch (error) {
      console.error(pc.bgRed(pc.white(`OKMServices-removePath: ${error}`)));
    }
  };
  async createDateName(type) {
    const currentTimeInMilliseconds = Date.now();
    const currentTimeInSecond = Math.floor(currentTimeInMilliseconds/1000);
    const result = `${type}_${currentTimeInSecond}`;
    console.log(pc.bgGreen(pc.black(`OKMServices-createDateName: ${result} generated.`)))
    return result;
  };
  async getFileByFieldName(files, fieldName) {
    const file = files.find(obj => obj.fieldname === fieldName);
    if(file) { return file }
    else { console.info(pc.bgYellow(pc.black(`OKMServices-getFileByFieldName: Fieldname not found!`))); return false }
  };
  async getUser(id) {
    try {
      const user = await AppUserModel.findOne({
        where: {user_id: id},
      });
      if(!user) { return null }
      return user.fname
    } catch (error) {
      throw error
    }
  };
  async getParticipantList(){
    try {
      let lists = [
        { L00: '(ALL) KARYAWAN' },
        { L34: '(ALL) MANAGER' },
        { L55: '(ALL) SUPERVISOR' },
        { L66: '(ALL) STAFF' },
      ];

      const allDepts = await HRServices.getAllDeptData()
        .then(result => result.filter(item => item.is_active === 1))
        .then(result => result.sort((a,b) => a.name.localeCompare(b.name)))
        .then(result => result.map(dept => ({[dept.dept_unique_str]: `(DEPT) ${dept.name}`})));
      const allPositions = await HRServices.getAllPositionData()
        .then(result => result.filter(item => item.is_active === 1))
        .then(result => result.sort((a,b) => a.name.localeCompare(b.name)))
        .then(result => result.map(pos => ({[pos.position_unique_str]: `(POS) ${pos.name}`})));
      const users = await AppUserModel.findAll({where: {is_active: 1, nik: {[Op.ne]: null, [Op.lt]: 8000000}}, order: [['fname', 'ASC']]})
        .then(result => result.map(user => ({[user.nik]: user.fname})));

      const combinedArray = [...lists, ...allDepts, ...allPositions, ...users];
      return combinedArray;
    } catch (error) {
      throw error;
    }
  };

  /** VALIDATION */
  inputMaterial(title, level, deptId, isActive) {
    const errors = [];
    if(!title) errors.push('Title is required.');
    if(!level) errors.push('Level is required.');
    if(!deptId) errors.push('Department identity is required.');
    if(!isActive) errors.push('Status is required.');
    return { success: errors.length === 0, message: errors }
  };
  inputMaterialContent(materialId, isActive) {
    const errors = [];
    if(!materialId) errors.push('Material identity is required.');
    if(!isActive) errors.push('Status is required.');
    return { success: errors.length === 0, message: errors }
  };
  inputQuestionCollection(materialContentId, title, level, isActive) {
    const errors = [];
    if(!materialContentId) errors.push('Material Content identity is required.');
    if(!title) errors.push('Title is required.');
    if(!level) errors.push('Level is required.');
    if(!isActive) errors.push('Status is required.');
    return { success: errors.length === 0, message: errors }
  };
  inputQuestionContent(qstCollectionId, type, isActive) {
    const errors = [];
    if(!qstCollectionId) errors.push('Question Collection identity is required.');
    if(!type) errors.push('Type is required.');
    if(!isActive) errors.push('Status is required.');
    return { success: errors.length === 0, message: errors }
  };
  inputQuestionOptions(qstContentId, value, isActive) {
    const errors = [];
    if(!qstContentId) errors.push('Question Content identity is required.');
    if(!value) errors.push('Value Option is required.');
    if(!isActive) errors.push('Status is required.');
    return { success: errors.length === 0, message: errors }
  };
  inputQuiz(title, materialContentId, questionCollId, totalQuestion, score, timer, startDatetime, endDatetime, type, isActive) {
    const errors = [];
    if(!title) errors.push('Title is required.');
    if(!materialContentId) errors.push('Material Content identity is required.');
    if(!totalQuestion) errors.push('Question Collection identity is required.');
    if(!score) errors.push('Score is required.');
    if(!timer) errors.push('timer identity is required.');
    if(!startDatetime) errors.push('Start Datetime is required.');
    if(!endDatetime) errors.push('End Datetime is required.');
    if(!type) errors.push('Type is required.');
    if(!isActive) errors.push('Status is required.');
    return { success: errors.length === 0, message: errors }
  };
  inputFileExcel(file) {
    const errors = [];
    const acceptedMimes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const maxFileSize = 3 * 1024 * 1024; // 3 Mb
    if(!acceptedMimes.includes(file.mimetype)) { errors.push('Only accept XLSX file.') };
    if(maxFileSize < file.size) { errors.push('File size exceeds the limit (3 MB).') };
    return { success: errors.length === 0, message: errors };
  };
  inputFileImage(file) {
    const errors = [];
    const acceptedMimes = ['image/jpeg', 'image/jpg'];
    const maxFileSize = 1 * 1024 * 1024; // 1 Mb
    if(!acceptedMimes.includes(file.mimetype)) { errors.push('Only accept JPEG/JPG file.') };
    if(maxFileSize < file.size) { errors.push('File size exceeds the limit (1 MB).') };
    return { success: errors.length === 0, message: errors };
  };
  inputFilePDF(file) {
    const errors = [];
    const acceptedMimes = ['application/pdf'];
    const maxFileSize = 6 * 1024 * 1024; // 6Mb
    if(!acceptedMimes.includes(file.mimetype)) { errors.push('Only accept PDF file.') };
    if(maxFileSize < file.size) { errors.push('File size exceeds the limit (6 MB).') };
    return { success: errors.length === 0, message: errors }
  };
}

export default new OKMServices();
