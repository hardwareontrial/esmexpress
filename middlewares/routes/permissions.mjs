import db from '@services/orm/index.mjs'

const DBAAppUserModel = db.DatabaseA.models.AppUser;
const DBAAppPermissionModel = db.DatabaseA.models.AppRpPermission;
const DBAAppRoleModel = db.DatabaseA.models.AppRpRole;

const checkRoutePermission = (permissions) => {
  return async function (req, res, next){
    const permissionIds = await mapPermissionIds(permissions);
    const userPermissionIds = await mapUserPermissionIds(req);
    const commonPermissionIds = arrayCommonElement(permissionIds, userPermissionIds);
    if (commonPermissionIds.length > 0) {
      next();
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  }
};

const mapPermissionIds = async (permissions) => {
  const result = await DBAAppPermissionModel.findAll({
    where: { name: permissions },
  });
  return result.map((permission) => permission.id);
};

const mapUserPermissionIds = async (req) => {
  const result = await DBAAppUserModel.findOne({
    where: { user_id: req.userAuthenticated.user_id },
    include: [
      {
        model: DBAAppPermissionModel,
        as: 'userPermissions',
        attributes: { exclude: ['created_at', 'updates_at'] },
      },
      {
        model: DBAAppRoleModel,
        as: 'userRoles',
        attributes: { exclude: ['created_at', 'updates_at'] },
        include: [
          {
            model: DBAAppPermissionModel,
            as: 'rolePermissions',
            attributes: { exclude: ['created_at', 'updates_at'] },
          },
        ],
      },
    ],
  });
  const dataUserPermissions = await result.userPermissions;
  const dataUserRoles = await result.userRoles;
  const uniqueRolePermissions = [
    ...new Set(
      await dataUserRoles.flatMap((role) =>
        role.rolePermissions.map((permission) => permission.id)
      )
    ),
  ];
  const mergedPermissions = await dataUserPermissions.concat(
    dataUserRoles.flatMap((role) =>
      role.rolePermissions.filter((permission) =>
        uniqueRolePermissions.includes(permission.id)
      )
    )
  );
  const ids = await mergedPermissions.map((permission) => permission.id);
  return ids;
};

function arrayCommonElement(arrayOne, arrayTwo) {
  const commonElements = [];
  for (let i = 0; i < arrayOne.length; i++) {
    for (let j = 0; j < arrayTwo.length; j++) {
      if (arrayOne[i] === arrayTwo[j]) {
        commonElements.push(arrayOne[i]);
        // Jika Anda ingin menemukan satu elemen yang cocok cukup dan lanjutkan,
        // Anda bisa membatalkan perulangan di sini
        // return commonElements;
      }
    }
  }
  return commonElements;
};

export default checkRoutePermission