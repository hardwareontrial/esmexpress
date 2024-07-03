import db from '@services/orm/sequelize.mjs'

const { AppGaInvMerk, AppGaInvLocation, AppGaInventaris, AppGaInventarisLog, AppUser } = db.DatabaseA.models;

AppGaInvMerk.hasMany(AppGaInventaris, {
  as: 'merkInvs',
  foreignKey: 'merk_id',
  sourceKey: 'id',
});

AppGaInvLocation.hasMany(AppGaInventaris, {
  as: 'locationInvs',
  foreignKey: 'lokasi_id',
  sourceKey: 'id',
});

AppGaInventaris.belongsTo(AppGaInvMerk, {
  as: 'invmerk',
  foreignKey: 'merk_id',
  targetKey: 'id',
});

AppGaInventaris.belongsTo(AppGaInvLocation, {
  as: 'invloc',
  foreignKey: 'lokasi_id',
  targetKey: 'id',
});

AppGaInventaris.belongsTo(AppUser, {
  as: 'invuser1',
  foreignKey: 'user_id_1',
  targetKey: 'user_id',
});

AppGaInventaris.belongsTo(AppUser, {
  as: 'invuser2',
  foreignKey: 'user_id_2',
  targetKey: 'user_id',
});

AppGaInventaris.hasMany(AppGaInventarisLog, {
  as: 'loginvs',
  foreignKey: 'gainventaris_id',
  sourceKey: 'id',
});