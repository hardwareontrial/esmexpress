import { Model, DataTypes } from 'sequelize'
import db from '@services/orm/sequelize.mjs'

class PhonebookExternal extends Model {};
class PhonebookExtDetail extends Model {};
class PhonebookExtLog extends Model {};

PhonebookExternal.init({
  id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false, autoIncrement: true, primaryKey: true},
  pext_unique_str: { type: DataTypes.STRING, allowNull: false, unique: true },
  type: {type: DataTypes.INTEGER(11), allowNull: false},
  name: {type: DataTypes.STRING(255), allowNull: true},
  address: {type: DataTypes.STRING(255), allowNull: true},
  company_name: {type: DataTypes.STRING(255), allowNull: true},
  company_address: {type: DataTypes.STRING(255), allowNull: true},
  city: {type: DataTypes.STRING(255), allowNull: true},
  email: {type: DataTypes.STRING(255), allowNull: true},
  note: {type: DataTypes.STRING(255), allowNull: true},
},{
  sequelize: db.DatabaseA,
  modelName: 'PhonebookExternal',
  freezeTableName: true,
  tableName: 'tbl_phonebook_ext',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseA.config.database,
});

PhonebookExtDetail.init({
  id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false, autoIncrement: true, primaryKey: true},
  phonebook_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false},
  number: {type: DataTypes.STRING(255), allowNull: true},
  pic: {type: DataTypes.STRING(255), allowNull: true},
},{
  sequelize: db.DatabaseA,
  modelName: 'PhonebookExtDetail',
  freezeTableName: true,
  tableName: 'tbl_phonebook_ext_detail',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseA.config.database,
});

PhonebookExtLog.init({
  id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false, autoIncrement: true, primaryKey: true},
  phonebook_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false},
  phonebook_type: {type: DataTypes.INTEGER(11), allowNull: false},
  activity: {type: DataTypes.STRING(255), allowNull: false},
  creator: {type: DataTypes.STRING(255), allowNull: false},
},{
  sequelize: db.DatabaseA,
  modelName: 'PhonebookExtLog',
  freezeTableName: true,
  tableName: 'tbl_phonebook_ext_log',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseA.config.database,
});

db.DatabaseA.dialect.supports.schemas = true;