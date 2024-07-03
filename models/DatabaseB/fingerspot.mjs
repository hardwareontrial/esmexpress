import { Model, DataTypes } from 'sequelize'
import db from '@services/orm/sequelize.mjs'

class AttendanceLog extends Model {};

AttendanceLog.init({
  sn:{ type: DataTypes.STRING, noUpdate: true, primaryKey: true, },
  scan_date: { type: DataTypes.DATE, noUpdate: true, primaryKey: true, },
  pin: { type: DataTypes.STRING, noUpdate: true, primaryKey: true, },
  verifymode: { type: DataTypes.INTEGER, noUpdate: true, },
  inoutmode: { type: DataTypes.INTEGER, noUpdate: true, },
  reserved: { type: DataTypes.INTEGER, noUpdate: true, },
  work_code: { type: DataTypes.INTEGER, noUpdate: true, },
  att_id: { type: DataTypes.STRING, noUpdate: true, },
},{
  sequelize: db.DatabaseB,
  modelName: 'AttendanceLog',
  freezeTableName: true,
  tableName: 'att_log',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseB.config.database,
})