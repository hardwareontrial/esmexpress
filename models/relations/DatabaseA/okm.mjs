import db from '@services/orm/sequelize.mjs'

const { AppHrDepartment, OKMMaterial, OKMMaterialContent } = db.DatabaseA.models;
  
AppHrDepartment.hasMany(OKMMaterial, {
  as: 'deptMaterialOKM',
  foreignKey: 'department_id',
  sourceKey: 'id',
});

OKMMaterial.belongsTo(AppHrDepartment, {
  as: 'materialDeptOKM',
  foreignKey: 'department_id',
  targetKey: 'id',
});

OKMMaterial.hasMany(OKMMaterialContent, {
  as: 'materialContents',
  foreignKey: 'material_id',
  sourceKey: 'id',
});

OKMMaterialContent.belongsTo(OKMMaterial, {
  as: 'contentMaterial',
  foreignKey: 'material_id',
  targetKey: 'id',
});