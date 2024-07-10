import { Model, DataTypes } from 'sequelize'
import db from '@services/orm/sequelize.mjs'

class AppHrDepartment extends Model {};
class AppHrPosition extends Model {};
class AppHrPositionUser extends Model {};
class TmpAttendance extends Model {};
class TmpAttnLog extends Model {};

AppHrDepartment.init({
  id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true},
  dept_unique_str: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: {type:DataTypes.STRING(255), allowNull: false},
  is_active: {type:DataTypes.TINYINT(1), allowNull: false, defaultValue: 1},
},{
  sequelize: db.DatabaseA,
  modelName: 'AppHrDepartment',
  freezeTableName: true,
  tableName: 'tbl_hr_departments',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseA.config.database,  
});

AppHrPosition.init({
  id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false, noUpdate: false, primaryKey: true, autoIncrement: true},
  position_unique_str: { type: DataTypes.STRING, allowNull: false, unique: true },
  parent_position_id: {type:DataTypes.BIGINT(20).UNSIGNED, allowNull: true, noUpdate: false},
  name: {type:DataTypes.STRING(255), allowNull: false, noUpdate: false},
  department_id: {type:DataTypes.BIGINT(20).UNSIGNED, allowNull: true, noUpdate: false},
  level: {type:DataTypes.INTEGER(11), allowNull: true, noUpdate: false},
  is_active: {type:DataTypes.TINYINT(1), allowNull: false, noUpdate: false, defaultValue: 1},
},{
  sequelize: db.DatabaseA,
  modelName: 'AppHrPosition',
  freezeTableName: true,
  tableName: 'tbl_hr_positions',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseA.config.database,
});

AppHrPositionUser.init({
  position_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false, primaryKey: true},
  user_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false, primaryKey: true},
},{
  sequelize: db.DatabaseA,
  modelName: 'AppHrPositionUser',
  freezeTableName: true,
  tableName: 'tbl_hr_position_user',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseA.config.database,
});

TmpAttendance.init({
  scan_date: {type: DataTypes.DATE(), allowNull: false},
  nik: {type: DataTypes.INTEGER(11), allowNull: false, primaryKey: true},
  fullname: {type: DataTypes.STRING(), allowNull: false},
  verifymode: {type: DataTypes.INTEGER, allowNull: false},
  inoutmode: {type: DataTypes.INTEGER, allowNull: false},
},{
  sequelize: db.DatabaseA,
  modelName: 'TmpAttendance',
  freezeTableName: true,
  tableName: 'tbl_tmpattn',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  underscored: false,
  schema: db.DatabaseA.config.database,
});

TmpAttnLog.init({
  id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false, autoIncrement: true, primaryKey: true},
  startDate: {type: DataTypes.DATE(), allowNull: false},
  endDate: {type: DataTypes.DATE(), allowNull: false},
  note: {type: DataTypes.TEXT('medium'), allowNull: false},
},{
  sequelize: db.DatabaseA,
  modelName: 'TmpAttnLog',
  freezeTableName: true,
  tableName: 'tbl_tmpattn_log',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  underscored: false,
  schema: db.DatabaseA.config.database,
})

db.DatabaseA.dialect.supports.schemas = true;