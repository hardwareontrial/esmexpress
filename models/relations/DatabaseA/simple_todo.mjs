import db from '@services/orm/sequelize.mjs'

const { SimpleTodo, AppUser } = db.DatabaseA.models;

SimpleTodo.belongsTo(AppUser, {
  as: 'requestorname',
  foreignKey: 'requestor_id',
  targetKey: 'user_id',
});

SimpleTodo.belongsTo(AppUser, {
  as: 'assigneename',
  foreignKey: 'assignee_id',
  targetKey: 'user_id',
});

SimpleTodo.belongsTo(AppUser, {
  as: 'creatorname',
  foreignKey: 'creator_user_id',
  targetKey: 'user_id',
});
