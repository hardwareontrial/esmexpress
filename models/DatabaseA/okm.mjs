import { Model, DataTypes } from 'sequelize'
import db from '@services/orm/sequelize.mjs'
import moment from 'moment';
  
class OKMMaterial extends Model {};
class OKMMaterialContent extends Model {};
class OKMQuestionContent extends Model {};
class OKMQuestionCollection extends Model {};
class OKMQuestionAnswerOptions extends Model {};
class OKMQuestionUploadStatus extends Model {};
class OKMLogs extends Model {};
class OKMQuiz extends Model {};
class OKMParticipant extends Model {};
class OKMParticipantResponse extends Model {};
class OKMCertificate extends Model {};

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
  filepath: {type: DataTypes.STRING(255), allowNull: true},
  view_count:{type: DataTypes.INTEGER(11), allowNull: true, defaultValue: 0},
  is_active: {type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 1},
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
  is_active: {type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 1},
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
  is_active: {type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 1},
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
  logged_at: {type: DataTypes.DATE(), allowNull: false, defaultValue: moment().format('YYYY-MM-DD HH:mm:ss')},
},{
  sequelize: db.DatabaseA,
  modelName: 'OKMQuestionUploadStatus',
  freezeTableName: true,
  tableName: 'tbl_okm_question_upload_status',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseA.config.database,
});

OKMLogs.init({
  id: {type: DataTypes.BIGINT(20).UNSIGNED, autoIncrement: true, primaryKey: true, allowNull: false},
  message: {type: DataTypes.TEXT('long'), allowNull: false},
  created_by: {type: DataTypes.STRING(255), allowNull: false},
},{
  sequelize: db.DatabaseA,
  modelName: 'OKMLogs',
  freezeTableName: true,
  tableName: 'tbl_okm_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseA.config.database,
});

OKMQuiz.init({
  id: {type: DataTypes.BIGINT(20).UNSIGNED, autoIncrement: true, primaryKey: true, allowNull: false},
  title: {type: DataTypes.STRING(255), allowNull: false},
  material_content_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false},
  question_coll_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false},
  total_question: {type: DataTypes.INTEGER(11), allowNull: false},
  score_min: {type: DataTypes.INTEGER(11), allowNull: false},
  timer: {type: DataTypes.INTEGER(11), allowNull: false},
  start_datetime: {type: DataTypes.DATE, allowNull: false},
  end_datetime: {type: DataTypes.DATE, allowNull: false},
  type: {type: DataTypes.STRING(255), allowNull: false},
  notes: {type: DataTypes.TEXT('tiny'), allowNull: true},
  is_active: {type: DataTypes.TINYINT(1), allowNull: false, defaultValue: true},
  creator: {type: DataTypes.STRING(255), allowNull: false},
},{
  sequelize: db.DatabaseA,
  modelName: 'OKMQuiz',
  freezeTableName: true,
  tableName: 'tbl_okm_quiz',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseA.config.database,
});

OKMParticipant.init({
  id: {type: DataTypes.BIGINT(20).UNSIGNED, autoIncrement: true, primaryKey: true, allowNull: false},
  quiz_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false},
  user_nik: {type: DataTypes.INTEGER(11), allowNull: false},
  time_left: {type: DataTypes.INTEGER(11), allowNull: false},
  start_datetime: {type: DataTypes.DATE, allowNull: true},
  end_datetime: {type: DataTypes.DATE, allowNull: true},
  status: {type: DataTypes.TINYINT(1), allowNull: false, comment: '0=not-taken, 1=taken, 2=processing, 3=done', defaultValue: 0},
  certificate_path: {type: DataTypes.STRING, allowNull: true},
},{
  sequelize: db.DatabaseA,
  modelName: 'OKMParticipant',
  freezeTableName: true,
  tableName: 'tbl_okm_participant',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseA.config.database,
});

OKMParticipantResponse.init({
  id: {type: DataTypes.BIGINT(20).UNSIGNED, autoIncrement: true, primaryKey: true, allowNull: false},
  participant_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false},
  question_content_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false},
  question_answer: {type: DataTypes.TEXT('medium'), allowNull: true},
  score: {type: DataTypes.INTEGER(11), allowNull: true, defaultValue: 0},
},{
  sequelize: db.DatabaseA,
  modelName: 'OKMParticipantResponse',
  freezeTableName: true,
  tableName: 'tbl_okm_participant_response',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseA.config.database,
});

OKMCertificate.init({
  id: {type: DataTypes.BIGINT(20).UNSIGNED, autoIncrement: true, primaryKey: true, allowNull: false},
  quiz_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false},
  signer: {type: DataTypes.STRING(255), allowNull: false},
  design_path: {type: DataTypes.STRING(255), allowNull: false},
},{
  sequelize: db.DatabaseA,
  modelName: 'OKMCertificate',
  freezeTableName: true,
  tableName: 'tbl_okm_certificate',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseA.config.database,
});

db.DatabaseA.dialect.supports.schemas = true;