import { Model, DataTypes } from 'sequelize'
import db from '@services/orm/sequelize.mjs'

class JobsQueue extends Model {};
class JobsFailed extends Model {};

JobsQueue.init({
  uuid: {type: DataTypes.UUID(), defaultValue: DataTypes.UUIDV4(), allowNull: false, primaryKey: true},
  priority: {type: DataTypes.STRING(), allowNull: false},
  data: {type: DataTypes.TEXT('long'), allowNull: false},
  attempt: {type: DataTypes.TINYINT(3), defaultValue: 0, allowNull: false},
  lock: {type: DataTypes.TINYINT(1), defaultValue: 0, allowNull: false},
  reserved_at: {type: DataTypes.DATE(), defaultValue: DataTypes.NOW(), allowNull: true},
  created_at: {type: DataTypes.DATE(), defaultValue: DataTypes.NOW(), allowNull: false},
},{
  sequelize: db.DatabaseA,
  modelName: 'JobsQueue',
  freezeTableName: true,
  tableName: 'tbl_jobs',
  timestamps: false,
  underscored: false,
  schema: db.DatabaseA.config.database,
});

JobsFailed.init({
  id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false, autoIncrement: true, primaryKey: true},
  uuid: {type: DataTypes.UUID(), defaultValue: DataTypes.UUIDV4(), allowNull: false},
  priority: {type: DataTypes.STRING(), allowNull: false},
  data: {type: DataTypes.TEXT('long'), allowNull: false},
  exception: {type: DataTypes.TEXT('long'), allowNull: false},
  failed_at: {type: DataTypes.DATE(), defaultValue: DataTypes.NOW(), allowNull: false},
},{
  sequelize: db.DatabaseA,
  modelName: 'JobsFailed',
  freezeTableName: true,
  tableName: 'tbl_jobs_failed',
  timestamps: false,
  underscored: false,
  schema: db.DatabaseA.config.database,
});

db.DatabaseA.dialect.supports.schemas = true;