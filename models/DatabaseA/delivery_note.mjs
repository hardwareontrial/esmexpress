import { Model, DataTypes } from 'sequelize'
import db from '@services/orm/sequelize.mjs'
  
class AppSuratjalan extends Model {};
class AppSuratjalanDetail extends Model {};
class AppSuratjalanLog extends Model {};

AppSuratjalan.init({
  delivery_no: {type: DataTypes.STRING(255), allowNull: false, primaryKey: true},
  do_no: {type: DataTypes.STRING(255), allowNull: true},
  po_no: {type: DataTypes.STRING(255), noUpdate: false, allowNull: true},
  // creator: {type: DataTypes.STRING(255), allowNull: false},
  creator_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false},
  is_processing: {type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 0},
  is_remark: {type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 0},
  invoice_no: {type: DataTypes.STRING(255), allowNull: true},
  print_count: {type: DataTypes.INTEGER(11), allowNull: false},
},{
  sequelize: db.DatabaseA,
  modelName: 'AppSuratjalan',
  freezeTableName: true,
  tableName: 'tbl_suratjalan',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseA.config.database,
});

AppSuratjalanDetail.init({
  deliveryno_id: {type: DataTypes.STRING(255), allowNull: false, primaryKey: true},
  detail_customer: {type: DataTypes.STRING(255), allowNull: false},
  detail_address: {type: DataTypes.STRING(255), allowNull: false},
  detail_city: {type: DataTypes.STRING(255), allowNull: false},
  detail_nopol: {type: DataTypes.STRING(255), allowNull: false},
  detail_driver: {type: DataTypes.STRING(255), allowNull: false},
  detail_item: {type: DataTypes.STRING(255), allowNull: false},
  detail_qty: {type: DataTypes.STRING(255), allowNull: false},
  detail_uom: {type: DataTypes.STRING(255), allowNull: false},
  detail_sending_date: {type: DataTypes.DATEONLY, allowNull: true},
},{
  sequelize: db.DatabaseA,
  modelName: 'AppSuratjalanDetail',
  freezeTableName: true,
  tableName: 'tbl_suratjalan_detail',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseA.config.database,
});

AppSuratjalanLog.init({
  id: {type: DataTypes.BIGINT(20).UNSIGNED, autoIncrement: true, primaryKey: true, allowNull: false},
  deliveryno_id: {type: DataTypes.STRING(255), allowNull: false},
  action_name: {type: DataTypes.STRING(100), allowNull: false},
  creator: {type: DataTypes.STRING(255), allowNull: false},
},{
  sequelize: db.DatabaseA,
  modelName: 'AppSuratjalanLog',
  freezeTableName: true,
  tableName: 'tbl_suratjalan_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseA.config.database,
});

db.DatabaseA.dialect.supports.schemas = true;