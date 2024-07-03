import db from '@services/orm/sequelize.mjs'
const { PhonebookExternal, PhonebookExtDetail, PhonebookExtLog } = db.DatabaseA.models;

PhonebookExternal.hasMany(PhonebookExtDetail, {
  as: 'detail',
  foreignKey: 'phonebook_id',
  sourceKey: 'id',
});

PhonebookExternal.hasMany(PhonebookExtLog, {
  as: 'logs',
  foreignKey: 'phonebook_id',
  sourceKey: 'id',
});