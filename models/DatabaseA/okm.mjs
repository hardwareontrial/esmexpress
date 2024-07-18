import { Model, DataTypes } from 'sequelize'
import db from '@services/orm/sequelize.mjs'
  
class OKMMaterial extends Model {};
class OKMMaterialContent extends Model {};
class OKMQuestionContent extends Model {};
class OKMQuestionCollection extends Model {};
class OKMQuestionAnswerOptions extends Model {};
class OKMQuestionUploadStatus extends Model {};

OKMMaterial.init({
  id: {type: DataTypes.BIGINT(20).UNSIGNED, autoIncrement: true, primaryKey: true, allowNull: false},
  title: {type: DataTypes.STRING(255), allowNull: false},
  sinopsis: {type: DataTypes.STRING(255), allowNull: true},
  level: {type: DataTypes.STRING(255), allowNull: false},
  department_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false},
  is_active: {type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 1},
  created_by: {type: DataTypes.STRING(255), allowNull: false},
},{
  sequelize: db.DatabaseA,
  modelName: 'OKMMaterial',
  freezeTableName: true,
  tableName: 'tbl_okm_material',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseA.config.database,
});

OKMMaterialContent.init({
  id: {type: DataTypes.BIGINT(20).UNSIGNED, autoIncrement: true, primaryKey: true, allowNull: false},
  material_id:{type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false},
  description: {type: DataTypes.STRING(255), allowNull: true},
  filepath: {type: DataTypes.STRING(255), allowNull: false},
  view_count:{type: DataTypes.INTEGER(11), allowNull: false, defaultValue: 0},
},{
  sequelize: db.DatabaseA,
  modelName: 'OKMMaterialContent',
  freezeTableName: true,
  tableName: 'tbl_okm_material_content',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseA.config.database,
});

OKMQuestionCollection.init({
  id: {type: DataTypes.BIGINT(20).UNSIGNED, autoIncrement: true, primaryKey: true, allowNull: false},
  material_content_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false},
  title: {type: DataTypes.STRING(255), allowNull: false},
  level: {type: DataTypes.STRING(255), allowNull: false},
  is_active: {type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 1},
  created_by: {type: DataTypes.STRING(255), allowNull: false},
},{
  sequelize: db.DatabaseA,
  modelName: 'OKMQuestionCollection',
  freezeTableName: true,
  tableName: 'tbl_okm_question_coll',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseA.config.database,
});

OKMQuestionContent.init({
  id: {type: DataTypes.BIGINT(20).UNSIGNED, autoIncrement: true, primaryKey: true, allowNull: false},
  question_coll_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false},
  question_type: {type: DataTypes.STRING(255), allowNull: false},
  question_text: {type: DataTypes.TEXT('medium'), allowNull: true},
  question_media: {type: DataTypes.TEXT('medium'), allowNull: true},
  answer_key: {type: DataTypes.TEXT('medium'), allowNull: true},
},{
  sequelize: db.DatabaseA,
  modelName: 'OKMQuestionContent',
  freezeTableName: true,
  tableName: 'tbl_okm_question_content',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseA.config.database,
});

OKMQuestionAnswerOptions.init({
  id: {type: DataTypes.BIGINT(20).UNSIGNED, autoIncrement: true, primaryKey: true, allowNull: false},
  question_content_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false},
  option_text: {type: DataTypes.TEXT('medium'), allowNull: true},
  option_media: {type: DataTypes.TEXT('medium'), allowNull: true},
  option_value: {type: DataTypes.TEXT('medium'), allowNull: false},
},{
  sequelize: db.DatabaseA,
  modelName: 'OKMQuestionAnswerOptions',
  freezeTableName: true,
  tableName: 'tbl_okm_question_answer_opts',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseA.config.database,
});

OKMQuestionUploadStatus.init({
  id: {type: DataTypes.BIGINT(20).UNSIGNED, autoIncrement: true, primaryKey: true, allowNull: false},
  status: {type: DataTypes.STRING(255), allowNull: false},
  question_coll_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false},
},{
  sequelize: db.DatabaseA,
  modelName: 'OKMQuestionUploadStatus',
  freezeTableName: true,
  tableName: 'tbl_okm_question_upload_status',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseA.config.database,
});

db.DatabaseA.dialect.supports.schemas = true;