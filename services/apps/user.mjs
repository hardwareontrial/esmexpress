import bcrypt from 'bcrypt'
import path from 'path'
import fs from 'fs'
import { Op } from 'sequelize'
import db from '@services/orm/index.mjs'
import { randomString, slug } from '@utils/helpers.mjs'
import { getAllLevelPosition, createdStructure2 } from '@utils/nestedPosition.mjs';
import AuthServices from '@services/apps/auth.mjs'

const DBAAppUserModel = db.DatabaseA.models.AppUser;
const DBAAppUserLoginModel = db.DatabaseA.models.AppUserLogin;
const DBAAppPositionModel = db.DatabaseA.models.AppHrPosition;
const DBAAppDeptModel = db.DatabaseA.models.AppHrDepartment;
const DBAAppPermissionModel = db.DatabaseA.models.AppRpPermission;
const DBAAppRoleModel = db.DatabaseA.models.AppRpRole;

class UserService {
  constructor() {
    this.avatarStorage = path.join(path.resolve(), '/public/storage/app/user/avatar/');
  };

  async getDataAll(authUserId) {
    try {
      const users = await DBAAppUserModel.findAll({
        include: [
          { model: DBAAppUserLoginModel, as: 'datalogin' },
          {
            model: DBAAppPositionModel,
            as: 'hasPosition',
            include: [
              { model: DBAAppDeptModel, as: 'department' }
            ],
          },
          { model: DBAAppPermissionModel, as: 'userPermissions', attributes: { exclude:['created_at','updates_at']} },
          { model: DBAAppRoleModel, as: 'userRoles', attributes: { exclude:['created_at','updates_at']} },
        ],
      })

      return users
    } catch (e) {
      e
    }
  };

  async getDataPaginate(currentPage, limit, search) {}

  async create(payload, authUserId) {
    let newUserTransaction, filenameWithExt, filePath;
    const isAvatarFile = payload.file;
    
    try {
      const { nik, fname, mname, lname, user_id, user_unique_str, avatar } = payload.body;
      const parsedIsActive = JSON.parse(payload.body.isActive);
      const parsedIsAdmin = JSON.parse(payload.body.isAdmin);
      const parsedPositionId = JSON.parse(payload.body.positionId);
      const isCreateLogin = JSON.parse(payload.body.createLogin.isActive);

      const unique_str = await randomString(12);
      // /** Handle File Upload */
      if(isAvatarFile) {
        const avatarFilename = await this.createAvatarName(fname);
        filenameWithExt = `${avatarFilename}.${isAvatarFile.mimetype.split('/')[1]}`
        filePath = path.join(this.avatarStorage, filenameWithExt);

        // STORING
        await this.storeAvatar(isAvatarFile, filePath)
      };

      newUserTransaction = await db.DatabaseA.transaction();

      /** CREATE USERDATA */
      const createUserData = await DBAAppUserModel.create({
        user_unique_str: unique_str,
        nik: nik,
        fname: fname.toUpperCase(),
        mname: mname?.toUpperCase(),
        lname: lname?.toUpperCase(),
        position_id: parsedPositionId,
        is_active: parsedIsActive,
        is_admin: parsedIsAdmin,
        avatar: isAvatarFile ? filenameWithExt : avatar,
      },{transaction: newUserTransaction});
      
      await newUserTransaction.commit();

      /** CREATE LOGIN IF TRUE FROM FRONTEND */
      if(isCreateLogin) {
        const creatingUserAuth = await AuthServices.createUserAuth({
          body: {
            user_id: createUserData.user_id,
            nik: nik.toString(),
            permissions: payload.body.permissions,
            roles: payload.body.roles,
            createLogin: {
              email: payload.body.createLogin.email,
              password: payload.body.createLogin.password,
              isActive: payload.body.createLogin.isActive,
              user_auth_id: null,
            },
          }
        }, authUserId)
      };

      const created = await this.detailById(createUserData.user_id);
      return created;
    } catch (e) {
      // console.log(e)
      if(isAvatarFile){ await this.removeAvatar(filePath) }
      if(newUserTransaction){ await newUserTransaction.rollback() }
      throw e
    }
  };
  
  async detail(condition) {
    try {
      let user = await DBAAppUserModel.findOne({
        where: condition,
        include: [
          {
            model: DBAAppUserLoginModel,
            as: 'datalogin',
            attributes: { exclude:['password', 'created_at','updates_at']},
          },
          { model: DBAAppPermissionModel, as: 'userPermissions', attributes: { exclude:['created_at','updates_at']} },
          {
            model: DBAAppRoleModel,
            as: 'userRoles',
            include: [
              { model: DBAAppPermissionModel, as: 'rolePermissions', attributes: { exclude:['created_at','updates_at']} },
            ],
            attributes: { exclude:['created_at','updates_at']}
          },
          {
            model: DBAAppPositionModel,
            as: 'hasPosition',
            include: [
              { model: DBAAppDeptModel, as: 'department', required: true }
            ],
          },
        ],
        attributes: { exclude:['created_at','updates_at'] },
      });
      const dataUserPermissions = await user.userPermissions
      const dataUserRoles = await user.userRoles
      const uniqueRolePermissions = [...new Set(await dataUserRoles.flatMap(role => role.rolePermissions.map(permission => permission.id)))]
      const mergedPermissions = await dataUserPermissions.concat(dataUserRoles.flatMap(role => role.rolePermissions.filter(permission => uniqueRolePermissions.includes(permission.id))))
      await user.setDataValue('mergedPermissions', mergedPermissions);
      if(await user.position_id){
        const levels = await getAllLevelPosition();
        const positionArrayChildren = levels.filter(arr => arr > user.position.level);
        const positionArrayParent = levels.filter(arr => arr < user.position.level);
        const childrenStructure2 = await createdStructure2(positionArrayChildren.length);
        const parentStructure2 = await createdStructure2(positionArrayParent.length, false);
        const positionDetail = await DBAAppPositionModel.findOne({
          where: { id: user.position_id },
          include: [
            {model: DBAAppUserModel, as: 'hasUsers', attributes: {exclude: ['created_at', 'updated_at']}},
            {model: DBAAppDeptModel, as: 'department', attributes: {exclude: ['created_at', 'updated_at']}},
            parentStructure2,
            childrenStructure2,
          ],
        })
        // console.log(positionDetail)
        await user.setDataValue('positionDetail', positionDetail)
      }else{
        await user.setDataValue('positionDetail', null)
      }
      return user
    } catch (error) {
      throw error
    }
  };

  async detailById(id){
    try {
      const condition = { user_id: id }
      const detail = await this.detail(condition)
      if(!detail) { throw new Error('No User found') }
      return detail
    } catch (error) {
      throw error
    }
  };

  async detailByUnique(unique){
    try {
      const condition = { user_unique_str: unique }
      const detail = await this.detail(condition)
      if(!detail) { throw new Error('No User found') }
      return detail
    } catch (error) {
      throw error
    }
  };

  async update(payload, authUserId) {
    let updateUserTransaction, filenameWithExt, filePath;
    const isAvatarFile = payload.file;

    try {
      const { nik, fname, mname, lname, user_id, user_unique_str, avatar } = payload.body;
      const { email, password, user_auth_id } = payload.body.dataLogin;
      const parsedIsActive = JSON.parse(payload.body.isActive);
      const parsedIsAdmin = JSON.parse(payload.body.isAdmin);
      const parsedPositionId = JSON.parse(payload.body.positionId);
      // const hasUserAuth = user_auth_id;
      const isCreateLogin = JSON.parse(payload.body.dataLogin.isActive);
      const lastUserData = await this.detailById(user_id);
      const isAvatarUserExist = lastUserData.avatar;
      
      /** Handle File Upload */
      if(isAvatarFile) {
        const avatarFilename = await this.createAvatarName(fname);
        filenameWithExt = `${avatarFilename}.${isAvatarFile.mimetype.split('/')[1]}`
        filePath = path.join(this.avatarStorage, filenameWithExt);

        // STORING
        await this.storeAvatar(isAvatarFile, filePath)
      };

      updateUserTransaction = await db.DatabaseA.transaction();

      /** Update USERDATA */
      const updateUser = await DBAAppUserModel.update({
        nik: nik,
        fname: fname.toUpperCase(),
        mname: mname?.toUpperCase(),
        lname: lname?.toUpperCase(),
        position_id: parsedPositionId,
        is_active: parsedIsActive,
        is_admin: parsedIsAdmin,
        avatar: isAvatarFile ? filenameWithExt : avatar,
      },{where: {user_id: payload.user_id}, transaction: updateUserTransaction});
      
      await updateUserTransaction.commit();

      /** CHECK AUTHENTICATION USER (CREATE or UPDATE) */
      if(JSON.parse(user_auth_id)) {
        const updatingUserAuth = await AuthServices.updateUserAuth({
          body: {
            user_id: user_id,
            nik: nik.toString(),
            permissions: payload.body.permissions,
            roles: payload.body.roles,
            dataLogin: {
              email: email,
              password: password,
              isActive: parsedIsActive ? payload.body.dataLogin.isActive : payload.body.isActive,
              user_auth_id: user_auth_id,
            },
          }
        }, authUserId)
      }
      else {
        if(isCreateLogin) {
          const creatingUserAuth = await AuthServices.createUserAuth({
            body: {
              user_id: user_id,
              nik: nik.toString(),
              permissions: payload.body.permissions,
              roles: payload.body.roles,
              createLogin: {
                email: email,
                password: password,
                isActive: payload.body.dataLogin.isActive,
                user_auth_id: null,
              },
            }
          }, authUserId);
        };
      }

      const updated = await this.detailById(user_id);

      if(isAvatarFile && avatar) { await this.removeAvatar(path.join(this.avatarStorage, avatar)) }
      if(!isAvatarFile && !avatar) {
        if(isAvatarUserExist){ await this.removeAvatar(path.join(this.avatarStorage, isAvatarUserExist)) }
      }

      return updated;
    } catch (error) {
      console.log(error)
      if(isAvatarFile) { await this.removeAvatar(filePath) }
      if(updateUserTransaction) { await updateUserTransaction.rollback() }
      throw error
    }
  };

  async createAvatarName(username){
    try {
      const currentTimeInMilliseconds = Date.now();
      const currentTimeInSecond = Math.floor(currentTimeInMilliseconds/1000)
      const result = `${slug(username.toUpperCase())}_${currentTimeInSecond}`
      return result
    } catch (e) {
      return e
    }
  };

  async storeAvatar(file, storagePath){
    try {
      fs.mkdirSync(path.dirname(storagePath),{ recursive: true });
      fs.writeFileSync(storagePath, file.buffer);
      return storagePath
    } catch (e) {
      throw e
    }
  };

  async removeAvatar(storagePath){
    try {
      if(fs.existsSync(storagePath)) {
        fs.unlinkSync(storagePath)
        return
      }
      return
    } catch (error) {
      throw error
    }
  };

  async getNumber(authUserId){
    const baseAdmin = '9000';
    const baseExternal = '8000';
    let newNikAdmin, newNikExternal;
    
    try {
      // DEFINE DIGIT
      function digits(number) {
        const numberString = number.toString();
        if (numberString.length >= 3) {
          const stringDigit = numberString.slice(-3);
          const digitToNumber = parseInt(stringDigit) + 1;
          return digitToNumber;
        } else {
          return 100;
        }
      }

      // FIND USER
      function findUser(condition) {
        return DBAAppUserModel.findOne({
          where: { nik: { [Op.like]: `%${condition}%` } },
          order: [['user_id', 'DESC']]
        });
      }

      const externalUser = await findUser(baseExternal);
      const adminUser = await findUser(baseAdmin);

      let lastData, digit;

      if (adminUser) {
        lastData = adminUser.nik;
        digit = digits(lastData);
        newNikAdmin = baseAdmin + digit;
      } else {
        newNikAdmin = baseAdmin + '901';
      }

      if (externalUser) {
        lastData = externalUser.nik;
        digit = digits(lastData);
        newNikExternal = baseExternal + digit;
      } else {
        newNikExternal = baseExternal + '801';
      }

      return { externalUser: newNikExternal, admin: newNikAdmin } 
    } catch (error) {
      throw error
    }
  };

  async authUsername(userId) {
    try {
      const creator = await this.DBAAppUser.findOne({ where: {user_id: userId} });
      return creator
    } catch (error) {
      throw error      
    }
  };

  async validatorCreate(payload) {
    const errorsUser = []
    let errorsAuth = []

    const { nik, fname, mname, lname, positionId } = payload.body;
    const isCreateLogin = JSON.parse(payload.body.createLogin.isActive)
    const uploadFile = payload.file

    if(!nik) { errorsUser.push('Please fill NIK.') }
    if(nik) {
      const isExist = await DBAAppUserModel.findOne({ where: {nik: nik} })
      if(nik.length < 7) { errorsUser.push('Minimal NIK length is 7 chars.') }
      if(isExist) { errorsUser.push('NIK already exist. Please provide another number.') }
    }
    if(!fname) { errorsUser.push('Please give a Name.') }
    if(uploadFile) {
      const acceptedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
      const maxFileSize = 4096 * 1024;
      if(!acceptedMimes.includes(uploadFile.mimetype)) errorsUser.push('Only accept JPG, JPEG, PNG file image.')
      if(maxFileSize < uploadFile.size) errorsUser.push('File size exceeds the limit (4MB).')
    }

    if(isCreateLogin) {
      const authValid = await AuthServices.validatorCreateAuth(payload)
      if(!authValid.success) {
        errorsAuth = authValid.message
      }
    }

    const errors = [...errorsUser, ...errorsAuth];
    return { success: errors.length === 0, message: errors }
  };

  async validatorUpdateUser(payload) {
    // console.log(payload)
    const errorsUser = []
    let errorsAuth = []

    const { nik, fname, mname, lname, positionId } = payload.body;
    // const hasUserAuth = payload.body.dataLogin.user_auth_id;
    const statusActiveUserAuth = JSON.parse(payload.body.dataLogin.isActive);
    const uploadFile = payload.file

    if(!nik) { errorsUser.push('Please fill NIK.') }
    if(!fname) { errorsUser.push('Please give a Name.') }
    if(uploadFile) {
      const acceptedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
      const maxFileSize = 4096 * 1024;
      if(!acceptedMimes.includes(uploadFile.mimetype)) errorsUser.push('Only accept JPG, JPEG, PNG file image.')
      if(maxFileSize < uploadFile.size) errorsUser.push('File size exceeds the limit (4MB).')
    }

    if(JSON.parse(payload.body.dataLogin.user_auth_id)) {
      const authValid = await AuthServices.validatorUpdateAuth(payload)
      if(!authValid.success) {
        errorsAuth = authValid.message
      }
    }

    const errors = [...errorsUser, ...errorsAuth];
    return { success: errors.length === 0, message: errors }
  };
}

export default new UserService()