import db from '@services/orm/sequelize.mjs'
import {response} from "express";

const {
  AppHrDepartment, OKMMaterial, OKMMaterialContent, OKMQuestionContent, OKMQuestionCollection, OKMQuestionAnswerOptions,
  OKMQuestionUploadStatus, OKMLogs, OKMQuiz, OKMParticipant, OKMParticipantResponse, OKMCertificate,
  AppUser,
} = db.DatabaseA.models;
  
AppHrDepartment.hasMany(OKMMaterial, {
  as: 'deptMaterialOKM',
  foreignKey: 'department_id',
  sourceKey: 'id',
});

OKMMaterial.belongsTo(AppHrDepartment, {
  as: 'materialDeptOKM',
  foreignKey: 'department_id',
  targetKey: 'id',
});

OKMMaterial.hasMany(OKMMaterialContent, {
  as: 'materialContents',
  foreignKey: 'material_id',
  sourceKey: 'id',
});

OKMMaterialContent.hasMany(OKMQuestionCollection, {
  as: 'contentQuestions',
  foreignKey: 'material_content_id',
  targetKey: 'id',
});

OKMMaterialContent.belongsTo(OKMMaterial, {
  as: 'contentMaterial',
  foreignKey: 'material_id',
  targetKey: 'id',
});

OKMQuestionCollection.hasMany(OKMQuestionContent, {
  as: 'questions',
  foreignKey: 'question_coll_id',
  sourceKey: 'id',
});

OKMQuestionContent.hasMany(OKMQuestionAnswerOptions, {
  as: 'options',
  foreignKey: 'question_content_id',
  sourceKey: 'id',
});

OKMQuestionCollection.belongsTo(OKMMaterialContent, {
  as: 'partMaterial',
  foreignKey: 'material_content_id',
  sourceKey: 'id',
});

OKMQuestionContent.belongsTo(OKMQuestionCollection, {
  as: 'questionCollection',
  foreignKey: 'question_coll_id',
  targetKey: 'id',
});

OKMQuestionAnswerOptions.belongsTo(OKMQuestionContent, {
  as: 'partContent',
  foreignKey: 'question_content_id',
  targetKey: 'id',
});

OKMQuestionCollection.hasMany(OKMQuestionUploadStatus, {
  as: 'uploadedStatus',
  foreignKey: 'question_coll_id',
  sourceKey: 'id',
});

OKMQuiz.hasMany(OKMParticipant, {
  as: 'participants',
  foreignKey: 'quiz_id',
  sourceKey: 'id',
});

OKMQuiz.belongsTo(OKMMaterialContent, {
  as: 'content_material',
  foreignKey: 'material_content_id',
  targetKey: 'id',
});

OKMQuiz.belongsTo(OKMQuestionCollection, {
  as: 'detailQuestion',
  foreignKey: 'question_coll_id',
  targetKey: 'id',
});

OKMQuiz.hasOne(OKMCertificate, {
  as: 'certificate',
  foreignKey: 'quiz_id',
  sourceKey: 'id',
})

OKMParticipant.hasMany(OKMParticipantResponse, {
  as: 'responses',
  foreignKey: 'participant_id',
  sourceKey: 'id',
});

OKMParticipant.belongsTo(AppUser, {
  as: 'user',
  foreignKey: 'user_nik',
  targetKey: 'nik',
});

OKMParticipantResponse.belongsTo(OKMQuestionContent, {
  as: 'detailQuestionContent',
  foreignKey: 'question_content_id',
  targetKey: 'id',
});