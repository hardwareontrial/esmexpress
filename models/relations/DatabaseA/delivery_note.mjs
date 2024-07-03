import db from '@services/orm/sequelize.mjs'
const { AppSuratjalan, AppSuratjalanDetail, AppSuratjalanLog, AppUser} = db.DatabaseA.models;

AppSuratjalan.hasOne(AppSuratjalanDetail, {
  as: 'detail',
  foreignKey: 'deliveryno_id',
  sourceKey: 'delivery_no',
});

AppSuratjalan.belongsTo(AppUser, {
  as: 'creator',
  foreignKey: 'creator_id',
  targetKey: 'user_id',
});

AppSuratjalan.hasMany(AppSuratjalanLog, {
  as: 'logs',
  foreignKey: 'deliveryno_id',
  sourceKey: 'delivery_no',
});