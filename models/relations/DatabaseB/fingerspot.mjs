import db from '@services/orm/sequelize.mjs'

const { AppUser } = db.DatabaseA.models;
const { AttendanceLog } = db.DatabaseB.models;

AttendanceLog.hasOne(AppUser, {
  foreignKey: 'nik',
  sourceKey: 'pin', 
  as: 'detail'
})