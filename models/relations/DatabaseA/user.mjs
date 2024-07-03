import db from '@services/orm/sequelize.mjs'

const { 
  AppUser, AppUserLogin, AppRpPermission, AppRpPermissionUser, AppRpRole, AppRpRoleUser, AppHrPosition,
  TmpAttendance,
} = db.DatabaseA.models;

AppUser.hasOne(AppUserLogin, {
  as: 'datalogin',
  foreignKey: 'user_id',
  sourceKey: 'user_id',
});

AppUser.belongsToMany(AppRpPermission, {
  as: 'userPermissions',
  foreignKey: 'user_id',
  otherKey: 'permission_id',
  through: {
    model: AppRpPermissionUser,
  }
});

AppUser.belongsToMany(AppRpRole, {
  as: 'userRoles',
  foreignKey: 'user_id',
  otherKey: 'role_id',
  through: {
    model: AppRpRoleUser,
  }
});

// AppUser.belongsTo(AppHrPosition, {
//   as: 'position',
//   foreignKey: 'position_id',
//   targetKey: 'id',
// });

AppUser.hasMany(TmpAttendance, {
  as: 'tmpAttns',
  sourceKey: 'nik',
  foreignKey: 'nik',
});