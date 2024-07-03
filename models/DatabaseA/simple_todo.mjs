import { Model, DataTypes } from 'sequelize'
import db from '@services/orm/sequelize.mjs'

class SimpleTodo extends Model {};

SimpleTodo.init({
  id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false, autoIncrement: true, primaryKey: true},
  todo_unique_str: { type: DataTypes.STRING, allowNull: false, unique: true },
  title: {type: DataTypes.STRING(255), allowNull: false},
  dueDate: {type: DataTypes.DATEONLY, allowNull:false},
  detail: {type: DataTypes.TEXT, allowNull: false},
  assignee_id: {type: DataTypes.BIGINT(11).UNSIGNED, allowNull: false},
  tags: {type: DataTypes.TEXT('long'), allowNull: false},
  requestor_id: { type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false},
  isComplete: {type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 0},
  isImportant: {type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 0},
  isDeleted: {type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 0},
  creator_user_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false},
},{
  sequelize: db.DatabaseA,
  modelName: 'SimpleTodo',
  freezeTableName: true,
  tableName: 'tbl_simple_todos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseA.config.database,
});

db.DatabaseA.dialect.supports.schemas = true;