import { Model, DataTypes } from 'sequelize'
import db from '@services/orm/sequelize.mjs'
  
class OKMMaterial extends Model {};
class OKMMaterialContent extends Model {};

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

db.DatabaseA.dialect.supports.schemas = true;