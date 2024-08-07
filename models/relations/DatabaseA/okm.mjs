import db from '@services/orm/sequelize.mjs'

const {
  AppHrDepartment, OKMMaterial, OKMMaterialContent, OKMQuestionContent, OKMQuestionCollection, OKMQuestionAnswerOptions,
  OKMQuestionUploadStatus, OKMLogs
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