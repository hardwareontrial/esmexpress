import db from '@services/orm/sequelize.mjs'
import { Op } from 'sequelize';

const AppPositionModel = db.DatabaseA.models.AppHrPosition;
const AppDeptModel = db.DatabaseA.models.AppHrDepartment;
const AppUserModel = db.DatabaseA.models.AppUser;

export function createdStructure(arrayLength, isChildren = true) {
  const asValue = isChildren ? 'children' : 'parent';
  if(arrayLength <= 1){
    return {model: AppPositionModel, as: asValue, include: []};
  }else{
    const innerStructure = createdStructure(arrayLength -1, isChildren);
    return {model: AppPositionModel, as: asValue, include: [innerStructure]};
  }
}

export function createdStructure2(arrayLength, isChildren = true) {
  const asValue = isChildren ? 'children' : 'parent';
  const result = {
    model: AppPositionModel,
    as: asValue,
    include: [],
  };
  if(arrayLength >= 1){
    const innerStructure = createdStructure2(arrayLength -1, isChildren)
    result.include.push(innerStructure);
    // result.include.push({model: AppUserModel, as: 'user', attributes: {exclude: ['created_at', 'updated_at']}});
    // result.include.push({model: AppDeptModel, as: 'deptname', attributes: {exclude: ['created_at', 'updated_at']}})
    result.include.push({model: AppUserModel, as: 'hasUsers', attributes: {exclude: ['created_at', 'updated_at']}});
    result.include.push({model: AppDeptModel, as: 'department', attributes: {exclude: ['created_at', 'updated_at']}})
  }
  return result;
}

export async function getAllLevelPosition() {
  async function extractedUnique (inputArray) {
    const uniqueLevelSet = new Set();
    inputArray.forEach((item) => {
      if(item.level !== undefined && item.level !== 1){
        uniqueLevelSet.add(item.level)
      }
    });
    return [...uniqueLevelSet];
  }
  const allLevels = await AppPositionModel.findAll({ attributes: ['level'] });
  const uniqueLevels = await extractedUnique(allLevels);
  const sortUniqueLevels = uniqueLevels.sort((a,b) => a-b);
  return sortUniqueLevels;
}

export async function removeTopLevel(obj) {
  if(obj.parent && obj.parent.parent) {
    return await removeTopLevel(obj.parent)
  } else {
    if (obj.parent && obj.parent.level === 1) {
      // obj.parent = {}
    }
    return obj;
  }
}