import db from '@services/orm/index.mjs'
import  { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomString, UCWord, combinedDiffArray } from '@utils/helpers.mjs'
import UserService from '@services/apps/user.mjs'
import { sendEmit } from '@sockets/index.mjs';

const DBAAppUserModel = db.DatabaseA.models.AppUser;
const DBAAppUserLoginModel = db.DatabaseA.models.AppUserLogin;
const DBAAppPermissionModel = db.DatabaseA.models.AppRpPermission;
const DBAAppRoleModel = db.DatabaseA.models.AppRpRole;
const DBAAppPermissionUser = db.DatabaseA.models.AppRpPermissionUser;
const DBAAppPermissionRole = db.DatabaseA.models.AppRpPermissionRole;

class AuthServices {
  constructor() {}

  /** PERMISSION SECTION */
  async getPermission() {
    try {
      const permissions = await DBAAppPermissionModel.findAll({
        include: [
          { model: DBAAppUserModel, as: 'permissionUsers', attributes: { exclude:['created_at','updated_at']} },
          {
            model: DBAAppRoleModel,
            as: 'permissionRoles',
            include: [
              {
                model: DBAAppUserModel,
                as: 'roleUsers',
                attributes: { exclude:['created_at','updated_at']} 
              }
            ],
            attributes: { exclude:['created_at','updated_at']}
          },
        ],
      })
      return permissions
    } catch (error) {
      throw error
    }
  };

  async detailPermission(payload) {
    try {
      const permission = await DBAAppPermissionModel.findOne({
        where: { permission_unique_str: payload.unique },
        include: [
          { model: DBAAppUserModel, as: 'permissionUsers', attributes: { exclude:['created_at','updated_at']} },
          {
            model: DBAAppRoleModel,
            as: 'permissionRoles',
            include: [
              {
                model: DBAAppUserModel,
                as: 'roleUsers',
                attributes: { exclude:['created_at','updated_at']} 
              }
            ],
            attributes: { exclude:['created_at','updated_at']}
          },
        ],
      });
      return permission
    } catch (error) {
      throw error
    }
  };

  async updatePermission(payload, authUserId) {
    let trxUpdatePermission;
    try {
      const { permission_unique_str, name, text, description, permissionUsers, permissionRoles } = payload.body;
      const permission = await this.detailPermission({unique: permission_unique_str});
      const lastRelatedUserIds = permission.permissionUsers.map(user => user.user_id)
      const userIdsByRole = []
      if(permission.permissionRoles && permission.permissionRoles.length > 0){
        permission.permissionRoles.forEach(role => {
          if(role.roleUsers && role.roleUsers.length > 0){
            role.roleUsers.forEach(user => userIdsByRole.push(user.user_id))
          }
        })
      }
      const combinedLastUserIds = [...lastRelatedUserIds, ...userIdsByRole]

      trxUpdatePermission = await db.DatabaseA.transaction();

      const updating = await permission.update({
        text: text,
        description: description,
      },{transaction: trxUpdatePermission});

      await trxUpdatePermission.commit();

      await this.assignPermissionToRoles({permission: permission, roleIds: permissionRoles});
      await this.assignPermissionToUsers({permission:permission, userIds: permissionUsers});
      const updated = await this.detailPermission({unique: permission_unique_str});
     
      this.broadcastUpdateRolePermissionToUsers(permissionUsers, combinedLastUserIds)

      return updated
    } catch (error) {
      console.error(error)
      if(trxUpdatePermission) { await trxUpdatePermission.rollback() }
      throw error
    }
  };
  /** END PERMISSION SECTION */

  /** ROLE SECTION */ 
  async getRole() {
    try {
      const roles = await DBAAppRoleModel.findAll({
        order: [['id', 'DESC']],
        include: [
          { model: DBAAppUserModel, as: 'roleUsers' },
          { model: DBAAppPermissionModel, as: 'rolePermissions' },
        ]
      })
      return roles
    } catch (error) {
      throw error
    }
  };

  async createRole(payload, authUserId) {
    let transactionCreateRole
    try {
      const { name, description, rolePermissionId, roleUserId } = payload.body;
      const unique_str = await randomString(8);

      transactionCreateRole = await db.DatabaseA.transaction();
      const creating = await DBAAppRoleModel.create({
        role_unique_str: unique_str,
        name: name.toUpperCase(),
        description: UCWord(description),
      }, { transaction: transactionCreateRole });
      
      await transactionCreateRole.commit()
      
      if(rolePermissionId.length > 0) {
        await this.assignRoleToPermissions({role: creating, permissionIds: rolePermissionId})
      }
      if(roleUserId.length > 0) {
        await this.assignRoleToUsers({role: creating, userIds: roleUserId})
      }

      const created = await this.detailRole({unique: unique_str});

      this.broadcastUpdateRolePermissionToUsers(roleUserId, [])

      return created;
    } catch (error) {
      console.error(error)
      if(transactionCreateRole) { await transactionCreateRole.rollback() }
      throw error
    }
  };
  
  async detailRole(payload) {
    try {
      const role = await DBAAppRoleModel.findOne({
        where: { role_unique_str: payload.unique },
        include: [
          { model: DBAAppUserModel, as: 'roleUsers', attributes: { exclude:['created_at','updates_at']} },
          { model: DBAAppPermissionModel, as: 'rolePermissions', attributes: { exclude:['created_at','updates_at']} },
        ]
      })
      return role
    } catch (error) {
      throw error
    }
  };
  
  async updateRole(payload, authUserId) {
    let transactionUpdateRole;
    try {
      const { name, description, rolePermissionId, roleUserId } = payload.body;
      const role = await this.detailRole({unique: payload.unique});
      const lastRelatedUserId = role.roleUsers.map(user => user.user_id);

      transactionUpdateRole = await db.DatabaseA.transaction();
      
      const updating = await role.update({
        name: name.toUpperCase(),
        description: UCWord(description),
      },{ transaction: transactionUpdateRole });
      await transactionUpdateRole.commit()
      await this.assignRoleToPermissions({role: role, permissionIds: rolePermissionId});
      await this.assignRoleToUsers({role: role, userIds: roleUserId});
      
      const updated = await this.detailRole({unique: payload.unique});
      
      this.broadcastUpdateRolePermissionToUsers(roleUserId, lastRelatedUserId)

      return updated
    } catch (error) {
      if(transactionUpdateRole) { await transactionUpdateRole.rollback() }
      throw error
    }
  };

  async deleteRole(payload, authUserId) {
    let transactionDeleteRole;
    try {
      const role = await this.detailRole({unique: payload.unique})
      const roleName = role.name
      const lastRelatedUserId = role.roleUsers.map(user => user.user_id);

      transactionDeleteRole = await db.DatabaseA.transaction();

      await role.removeRoleUsers({ transaction: transactionDeleteRole });
      await role.removeRolePermissions({ transaction: transactionDeleteRole });
      await role.destroy({ transaction: transactionDeleteRole });
      
      await transactionDeleteRole.commit();

      this.broadcastUpdateRolePermissionToUsers([], lastRelatedUserId)

      return roleName
    } catch (error) {
      if(transactionDeleteRole) { await transactionDeleteRole.rollback() }
      throw error
    }
  };
  /** END ROLE SECTION */

  /** USER AUTHORIZE SECTION */
  async getUserAuth() {
    try {
      const authorized = await DBAAppUserLoginModel.findAll({
        include: [
          {model: DBAAppUserModel, as: 'detailuser', require: true}
        ],
      })
      return authorized
    } catch (error) {
      throw error
    }
  };

  async createUserAuth(payload, authUserId) {
    let transactionUserAuth, assignedRoles, assignedPermissions;
    try {
      const { user_id, nik, permissions, roles } = payload.body;
      const { email, password, user_auth_id } = payload.body.createLogin;
      const parsedIsActive = JSON.parse(payload.body.createLogin.isActive);

      const user = await UserService.detailById(user_id)
      const shortNik = nik.substring(4);
      const parsedRoles = JSON.parse(roles);
      const parsedPermissions = JSON.parse(permissions);
      const filteredRoles = parsedRoles.filter(item => item !== '');
      const filteredPermissions = parsedPermissions.filter(item => item !== '');

      /** Assign user roles-permissions */
      if(filteredRoles.length > 0) { assignedRoles = filteredRoles }
      else { assignedRoles = [2] }
      assignedPermissions = filteredPermissions

      transactionUserAuth = await db.DatabaseA.transaction();

      const creating = await DBAAppUserLoginModel.create({
        user_id: user_id,
        nik: nik,
        s_nik: shortNik,
        email: email,
        password: bcrypt.hashSync(password, 12),
        is_active: parsedIsActive,
      },{ transaction: transactionUserAuth });

      await transactionUserAuth.commit()

      const created = await this.detailUserAuthById({user_auth_id: creating.user_auth_id});
      
      await this.assignUserToRoles({user: user, roleIds: assignedRoles})
      await this.assignUserToPermissions({user: user, permissionsIds: assignedPermissions});

      return created
    } catch (error) {
      if(transactionUserAuth) { await transactionUserAuth.rollback() }
      throw error
    }
  };

  async detailUserAuth(payload) {
    try {
      let whereClause = {}
      if(payload.query.startsWith('0')) {
        whereClause.s_nik = payload.query
      }
      else if(isNaN(payload.query)) {
        whereClause.email = payload.query
      }
      else {
        whereClause = {
          [Op.or]: [
            {s_nik: payload.query},
            {nik: payload.query}
          ]
        }
      }

      const userAuth = await DBAAppUserLoginModel.findOne({
        where: whereClause,
        include: [{model: DBAAppUserModel, as: 'detailuser', require: true}],
      });
      return userAuth
    } catch (error) {
      throw error
    }
  };

  async detailUserAuthById(payload) {
    try {
      const userAuth = await DBAAppUserLoginModel.findOne({
        where: {user_auth_id: payload.user_auth_id},
        include: [{model: DBAAppUserModel, as: 'detailuser', require: true}],
      });
      return userAuth
    } catch (error) {
      throw error
    }
  };

  async updateUserAuth(payload) {
    let updateUserAuthTrx, assignedRoles, assignedPermissions;
    try {
      const { user_id, nik, permissions, roles } = payload.body;
      const { email, password, user_auth_id } = payload.body.dataLogin;
      const parsedIsActive = JSON.parse(payload.body.dataLogin.isActive);
      const user = await UserService.detailById(user_id);

      const shortNik = nik.substring(4);
      const parsedRoles = JSON.parse(roles);
      const parsedPermissions = JSON.parse(permissions);
      const filteredRoles = parsedRoles.filter(item => item !== '');
      const filteredPermissions = parsedPermissions.filter(item => item !== '');

      const updateProps = {
        nik: nik,
        s_nik: shortNik,
        email: email,
        is_active: parsedIsActive,
      }
      
      /** If update password requested */
      if(password) {
        updateProps.password = bcrypt.hashSync(password, 12)
      }

      /** Re-assign user roles-permissions */
      if(!parsedIsActive) {
        assignedRoles = [];
        assignedPermissions = [];
      } else {
        /** Re-Assign User Roles */
        if(filteredRoles.length > 0) { assignedRoles = filteredRoles }
        else { assignedRoles = [2] }

        /** Re-Assign User Permissions */
        assignedPermissions = filteredPermissions
      }

      updateUserAuthTrx = await db.DatabaseA.transaction();

      const updating = await DBAAppUserLoginModel.update(updateProps, {
        where: {user_auth_id : user_auth_id},
        transaction: updateUserAuthTrx,
      });

      await updateUserAuthTrx.commit();

      await this.assignUserToRoles({user: user, roleIds: assignedRoles})
      await this.assignUserToPermissions({user: user, permissionsIds: assignedPermissions})

      const updated = await this.detailUserAuthById({user_auth_id: user_auth_id})
      return updated
    } catch (error) {
      if(updateUserAuthTrx) { await updateUserAuthTrx.rollback() }
      throw error   
    }
  };

  async updateUserRolePermission(payload, authUserId) {
    try {
      const { user_id, userRoles, userPermissions } = payload.body;
      const user = await UserService.detailById(user_id)
      await this.assignUserToPermissions({user: user, permissionsIds: userPermissions});
      await this.assignUserToRoles({user: user, roleIds: userRoles});
      const updatedUser = await UserService.detailById(user_id)
      return updatedUser
    } catch (error) {
      throw error
    }
  };
  /** END USER AUTHORIZE SECTION */
  
  async generateToken(data) {
    try {
      const token = jwt.sign({
        user_id: data.detailuser.user_id,
        user_auth_id: data.user_auth_id,
        user_nik: data.nik,
        user_s_nik: data.s_nik,
        user_email: data.email,
        user_u_str: data.detailuser.user_unique_str,
      // }, process.env.JWT_SECRET_KEY, { expiresIn: 3600}); // with expired time
      }, process.env.APP_SECRET_KEY);
      return token
    } catch (error) {
      throw error
    }
  };

  async assignUserToPermissions(payload) {
    try {
      const user = payload.user;
      const permissionsIds = payload.permissionsIds;
      const assign = await user.setUserPermissions(permissionsIds);
      return assign
    } catch (error) {
      throw error
    }
  };

  async assignUserToRoles(payload) {
    try {
      const user = payload.user;
      const roleIds = payload.roleIds;
      const assign = await user.setUserRoles(roleIds);
      return assign
    } catch (error) {
      throw error
    }
  };

  async assignRoleToUsers(payload) {
    try {
      const role = payload.role;
      const userIds = payload.userIds;
      const assign = await role.setRoleUsers(userIds);
      return assign
    } catch (error) {
      throw error
    }
  };

  async assignRoleToPermissions(payload) {
    try {
      const role = payload.role;
      const permissionIds = payload.permissionIds;
      const assign = await role.setRolePermissions(permissionIds);
      return assign
    } catch (error) {
      throw error
    }
  };

  async assignPermissionToRoles(payload) {
    try {
      const permission = payload.permission;
      const roleIds = payload.roleIds;
      const assign = await permission.setPermissionRoles(roleIds);
      return assign
    } catch (error) {
      throw error
    }
  };

  async assignPermissionToUsers(payload) {
    try {
      console.log(payload)
      const permission = payload.permission;
      const userIds = payload.userIds;
      const assign = await permission.setPermissionUsers(userIds);
      return assign
    } catch (error) {
      throw error
    }
  };

  broadcastUpdateRolePermissionToUsers(newArray, lastArray) {
    const combinedIds = combinedDiffArray(newArray, lastArray);
    
    /** Broadcast to Users */
    if(combinedIds.length > 0) {
      combinedIds.forEach(async user_id => {
        const updatedUser = await UserService.detailById(user_id)
        sendEmit(`auth:auth-user-${user_id}:updated-role-permission`, updatedUser)
      })
    }
  };

  async validatorCreateAuth(payload) {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    const errors = [];
    console.log(payload)

    const { user_id, nik } = payload.body;
    const { email, password, cpassword } = payload.body.createLogin

    if(!user_id) { errors.push('Invalid User Identity') }
    else {
      if(!nik) { errors.push('Please provide NIK User') }
      if(!email) { errors.push('Please fill email.') }
      if(!email.match(emailRegex)) { errors.push('Email format not accepted!') }
      if(email) {
        const isEmailExist = await this.detailUserAuth({query: email});
        if(isEmailExist) { errors.push('Email already taken') }
      }
      if(!password) { errors.push('Password cannot empty.') }
      if(!cpassword) { errors.push('Confirmed Password cannot empty.') }
      if(password.length < 6) { errors.push('Password length minimum 6 chars.') }
      if(password !== cpassword) { errors.push('Confirmed Password does not match.') }
    }

    return { success: errors.length === 0, message: errors }
  };

  async validatorUpdateAuth(payload) {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    const errors = [];

    const { user_id, nik } = payload.body;
    const { email, password, cpassword, user_auth_id } = payload.body.dataLogin;

    const userAuthIsExist = await this.detailUserAuthById({
      user_auth_id: user_auth_id,
    });

    if(userAuthIsExist) {
      if(!email) { errors.push('Please fill email.') }
      if(!email.match(emailRegex)) { errors.push('Email format not accepted!') }
      if(email) {
        const sameEmailUserId = await DBAAppUserLoginModel.findOne({
          where: {
            [Op.and]: [
              {user_auth_id: user_auth_id},
              {email: email},
            ],
          },
        });
        if(!sameEmailUserId) {
          const isEmailAreadyExist = await this.detailUserAuth({query: email});
          if(isEmailAreadyExist) { errors.push('Email already taken') }
        }
      }
      if(password) {
        if(password !== cpassword) { errors.push('Confirmed Password does not match.') }
      }
    }
    else {
      errors.push('No User Authentication found!')
    }

    return { success: errors.length === 0, message: errors }
  };

  async validatorSignIn(payload) {
    const { username, password } = payload.body;
    const errors = [];
    if(!username)errors.push('Username is required.');
    if(!password)errors.push('Password is required.');

    if(username){
      const userAuth = await this.detailUserAuth({
        query: username,
      })
      if(!userAuth){errors.push('User not found')}
      else{
        if(!(!!userAuth.is_active)) errors.push('Your account is not active. Please contact IT for assisted support.')
        const hashingUserPassword = userAuth.password.replace(/^\$2y(.+)$/i, '$2a$1'); // for password made in laravel
        const isValidPassword = await bcrypt.compare(password, hashingUserPassword); // then compare with bcrypt
        if(!isValidPassword)errors.push('Username/Password are incorrect.')
      }
    }

    return { success: errors.length === 0, message: errors }
  };

  validatorRole(payload) {
    const errors = []
    
    if(!payload.body.name) errors.push('Name is required')
    if(!payload.body.description) errors.push('Description is required')

    return { success: errors.length === 0, message: errors }
  };
}

export default new AuthServices()