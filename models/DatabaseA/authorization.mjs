import { Model, DataTypes } from 'sequelize'
import db from '@services/orm/sequelize.mjs'

class AppRpPermission extends Model {};
class AppRpRole extends Model {};
class AppRpRoleUser extends Model {};
class AppRpPermissionRole extends Model {};
class AppRpPermissionUser extends Model {};

AppRpPermission.init({
  id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false, autoIncrement: true, primaryKey: true},
  permission_unique_str: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: {type: DataTypes.STRING(255), allowNull: false},
  guard_name: {type: DataTypes.STRING(255), allowNull: false, defaultValue: 'web'},
  description: {type: DataTypes.TEXT, allowNull: false},
  text: {type: DataTypes.STRING(255), allowNull: false},
  group_name: {type: DataTypes.STRING(255), allowNull: false},
},{
  sequelize: db.DatabaseA,
  modelName: 'AppRpPermission',
  freezeTableName: true,
  tableName: 'tbl_auth_permissions',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseA.config.database,
});

AppRpRole.init({
  id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false, autoIncrement: true, primaryKey: true},
  role_unique_str: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: {type: DataTypes.STRING(255), allowNull: false},
  guard_name: {type: DataTypes.STRING(255), allowNull: false, defaultValue: 'web'},
  description: {type: DataTypes.TEXT, allowNull: false},
},{
  sequelize: db.DatabaseA,
  modelName: 'AppRpRole',
  freezeTableName: true,
  tableName: 'tbl_auth_roles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseA.config.database,
});

AppRpRoleUser.init({
  role_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false, primaryKey: true},
  model_type: {type: DataTypes.STRING(255), allowNull: false, primaryKey: true, defaultValue: 'App\\Models\\API\\Auth\\AppUser'},
  user_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false, primaryKey: true},
},{
  sequelize: db.DatabaseA,
  modelName: 'AppRpRoleUser',
  freezeTableName: true,
  tableName: 'tbl_auth_roles_has_users',
  timestamps: false,
  underscored: false,
  schema: db.DatabaseA.config.database,
});

AppRpPermissionRole.init({
  role_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false, primaryKey: true},
  permission_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false, primaryKey: true},
},{
  sequelize: db.DatabaseA,
  modelName: 'AppRpPermissionRole',
  freezeTableName: true,
  tableName: 'tbl_auth_permissions_has_roles',
  timestamps: false,
  underscored: false,
  schema: db.DatabaseA.config.database,
});

AppRpPermissionUser.init({
  permission_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false, primaryKey: true},
  model_type: {type: DataTypes.STRING(255), allowNull: false, primaryKey: true, defaultValue: 'App\\Models\\API\\Auth\\AppUser'},
  user_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false, primaryKey: true},
},{
  sequelize: db.DatabaseA,
  modelName: 'AppRpPermissionUser',
  freezeTableName: true,
  tableName: 'tbl_auth_permissions_has_users',
  timestamps: false,
  underscored: false,
  schema: db.DatabaseA.config.database,
});

db.DatabaseA.dialect.supports.schemas = true;