import db from '@services/orm/sequelize.mjs'

const { AppHrDepartment, AppHrPosition, AppUser, AppHrPositionUser } = db.DatabaseA.models;
  
AppHrDepartment.hasMany(AppHrPosition, {
  as: 'positions',
  foreignKey: 'department_id',
  sourceKey: 'id',
});

AppHrPosition.belongsTo(AppHrDepartment, {
  as: 'department',
  foreignKey: 'department_id',
  targetKey: 'id',
});

AppHrPosition.hasMany(AppHrPosition, {
  as: 'children',
  foreignKey: 'parent_position_id',
  sourceKey: 'id',
});

AppHrPosition.belongsTo(AppHrPosition, {
  as: 'parent',
  foreignKey: 'parent_position_id',
  targetKey: 'id',
});

AppHrPosition.belongsToMany(AppUser, {
  as: 'hasUsers',
  foreignKey: 'position_id',
  otherKey: 'user_id',
  through: {
    model: AppHrPositionUser,
  }
});

AppUser.belongsToMany(AppHrPosition, {
  as: 'hasPosition',
  foreignKey: 'user_id',
  otherKey: 'position_id',
  through: {
    model: AppHrPositionUser,
  }
});

// AppHrPosition.belongsTo(AppHrDepartment, {
//   as: 'deptname',
//   foreignKey: 'dept_id',
//   targetKey: 'id',
// });

// AppHrPosition.hasMany(AppUser, {
//   as: 'user',
//   foreignKey: 'position_id',
//   sourceKey: 'id',
// });

// AppHrPosition.hasMany(AppHrPosition, {
//   as: 'children',
//   foreignKey: 'parent_id',
//   sourceKey: 'id',
// });

// AppHrPosition.belongsTo(AppHrPosition, {
//   as: 'parent',
//   foreignKey: 'parent_id',
//   targetKey: 'id',
// });