import db from '@services/orm/sequelize.mjs'
const { AppRpPermission, AppRpPermissionRole, AppRpPermissionUser, AppRpRole, AppRpRoleUser, AppUser, AppUserLogin } = db.DatabaseA.models;

AppRpPermission.belongsToMany(AppUser, {
  as: 'permissionUsers',
  foreignKey: 'permission_id',
  otherKey: 'user_id',
  through: {
    model: AppRpPermissionUser,
  }
});

AppRpPermission.belongsToMany(AppRpRole, {
  as: 'permissionRoles',  
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  through: {
    model: AppRpPermissionRole,
  },
});

AppRpRole.belongsToMany(AppRpPermission, {
  as: 'rolePermissions',  
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  through: {
    model: AppRpPermissionRole,
  },
});

AppRpRole.belongsToMany(AppUser, {
  as: 'roleUsers',  
  foreignKey: 'role_id',
  otherKey: 'user_id',
  through: {
    model: AppRpRoleUser,
  },
});

AppUserLogin.belongsTo(AppUser, {
  as: 'detailuser',
  foreignKey: 'user_id',
  targetKey: 'user_id',
});