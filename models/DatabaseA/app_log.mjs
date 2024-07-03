import { Model, DataTypes } from 'sequelize'
import db from '@services/orm/sequelize.mjs'

class AppLog extends Model {};

AppLog.init({
  uuid: {type: DataTypes.UUID(), defaultValue: DataTypes.UUIDV4(), allowNull: false, primaryKey: true},
  logged_at: {type: DataTypes.DATE(), defaultValue: DataTypes.NOW(), allowNull: false},
  operation_type: {type: DataTypes.STRING(), allowNull: false, comment: 'Create, Update, Delete, Queue, etc'},
  operation_details: {type: DataTypes.TEXT(), allowNull: false, comment: 'Detail Operation'},
  status: {type: DataTypes.STRING(), allowNull: false, comment: 'SUCCESS or FAIL'},
  error_message: {type: DataTypes.TEXT('medium'), allowNull: true, comment: 'Any error on every transaction'},
  created_by: {type: DataTypes.STRING(), allowNull: false, defaultValue: 'APP', comment: 'Username or System'},
  ip_address: {type: DataTypes.STRING(), allowNull: true},
  user_agent: {type: DataTypes.STRING(), allowNull: true},
  request_payload: {type: DataTypes.TEXT('long'), allowNull: true, comment: 'Any sending request from client'},
  response_payload: {type: DataTypes.TEXT('long'), allowNull: true, comment: 'Any data sent to client (when success)'}
},{
  sequelize: db.DatabaseA,
  modelName: 'AppLog',
  freezeTableName: true,
  tableName: 'tbl_app_log',
  timestamps: false,
  underscored: false,
  schema: db.DatabaseA.config.database,
});

db.DatabaseA.dialect.supports.schemas = true;