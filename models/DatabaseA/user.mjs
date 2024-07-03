import { Model, DataTypes } from 'sequelize'
import db from '@services/orm/sequelize.mjs'

class AppUser extends Model {};
class AppUserLogin extends Model {};

AppUser.init({
  user_id: { type: DataTypes.BIGINT(20).UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false},
  user_unique_str: { type: DataTypes.STRING, allowNull: false, unique: true },
  nik: { type: DataTypes.INTEGER(11), allowNull: true, unique: true},
  fname: { type: DataTypes.STRING, allowNull: false},
  mname: { type: DataTypes.STRING, allowNull: true},
  lname: { type: DataTypes.STRING, allowNull: true},
  dept_id: { type: DataTypes.BIGINT(20).UNSIGNED, allowNull: true},
  position_id: { type: DataTypes.BIGINT(20).UNSIGNED, allowNull: true},
  group_id: { type: DataTypes.BIGINT(20).UNSIGNED, allowNull: true},
  avatar: { type: DataTypes.STRING, allowNull: true},
  is_active: { type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 1},
  is_admin: { type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 0},
  avatarlink: {
    type: DataTypes.VIRTUAL, noUpdate: false,
    get(){ return this.avatar ? `http://${process.env.APP_IP}:${process.env.APP_PORT}/public/storage/app/user/avatar/${this.avatar}` : null },
    set(value){ throw new Error(`Don't try to set!`) }
  },
},{
  sequelize: db.DatabaseA,
  modelName: 'AppUser',
  freezeTableName: true,
  tableName: 'tbl_users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseA.config.database,
});

AppUserLogin.init({
  user_auth_id: {type: DataTypes.BIGINT(20).UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false},
  user_id: { type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false },
  nik: {type: DataTypes.INTEGER(11), allowNull: true},
  s_nik: {type:DataTypes.STRING(255), allowNull: true},
  email: {type:DataTypes.STRING(255), allowNull: false},
  password: {type:DataTypes.STRING(255), allowNull: false},
  is_active: {type:DataTypes.TINYINT(1), allowNull: false, defaultValue: 1},
},{
  sequelize: db.DatabaseA,
  modelName: 'AppUserLogin',
  freezeTableName: true,
  tableName: 'tbl_user_authentication',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseA.config.database,
});

db.DatabaseA.dialect.supports.schemas = true;