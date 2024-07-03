import AuthServices from '@services/apps/auth.mjs'
import { sendEmit } from '@sockets/index.mjs';

/** Authentication Section */
const createUserAuth = async (req, res) => {
  try {
    const creating = await AuthServices.createUserAuth({ body: req.body }, req.userAuthenticated.user_id);
    sendEmit('auth:auth-user:created', creating)
    res.status(200).send({success: true, message: 'Data Authentication Created', data: creating})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to Creating Authentication Data', data: error.message || error })
  }
};

const detailUserAuth = async (req, res) => {
  try {
    const user = await AuthServices.detailUserAuth({ query: req.params.query });
    res.status(200).send({success: true, message: 'Data Found', data: user})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to Load Data', data: error.message || error })
  }
};

const detailUserAuthById = async (req, res) => {
  try {
    const user = await AuthServices.detailUserAuthById({user_auth_id: req.params.auth_id});
    res.status(200).send({success: true, message: 'Data Found', data: user})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to Load Data', data: error.message || error })
  }
}

const updateUserAuth = async (req, res) => {
  try {
    const updating = await AuthServices.updateUserAuth({
      body: req.body,
      auth_id: req.params.auth_id,
    }, req.userAuthenticated.user_id)
    res.status(200).send({success: true, message: 'Data Updated', data: updating})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to Update Data', data: error.message || error })
  }
};

const updateUserRolePermission = async (req, res) => {
  try {
    const updating = await AuthServices.updateUserRolePermission({
      body: req.body,
      user_id: req.params.user_id,
    }, req.userAuthenticated.user_id)
    sendEmit(`auth:auth-user-${req.params.user_id}:updated-role-permission`, updating)
    res.status(200).send({success: true, message: 'User Updated', data: updating})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to Update Data', data: error.message || error })
  }
};

const signInUser = async (req, res) => {
  try {
    const { username } = req.body;
    const userAuth = await AuthServices.detailUserAuth({
      query: username, authUserId: '',
    });
    const generatedToken = await AuthServices.generateToken(userAuth)
    res.status(200).send({success: true, message: 'Data Found', data: generatedToken})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to Load Data', data: error.message || error })
  }
};
/** End Authentication Section */

/** Permission Section */
const getPermissionAll = async (req, res) => {
  try {
    const permissions = await AuthServices.getPermission()
    res.status(200).send({success: true, message: 'Data Loaded', data: permissions})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to Load Data', data: error.message || error })
  }
}; 

const getPermissionDetail = async (req, res) => {
  try {
    const permission = await AuthServices.detailPermission({unique: req.params.unique})
    res.status(200).send({success: true, message: 'Data Loaded', data: permission})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to Load Data', data: error.message || error })
  }
};

const updatePermission = async (req, res) => {
  try {
    const updating = await AuthServices.updatePermission({unique: req.params.unique, body: req.body}, req.userAuthenticated.user_id);
    sendEmit(`auth:permission-${req.params.unique}:updated`, updating)
    sendEmit('auth:permission:updated', updating)
    res.status(200).send({success: true, message: 'Data Updated', data: updating})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to Updating Data', data: error.message || error })
  }
};
/** End Permission Section */

/** Role Section */
const getRoleAll = async (req, res) => {
  try {
    const roles = await AuthServices.getRole({authUserId: req.userAuthenticated.user_id})
    res.status(200).send({success: true, message: 'Data Loaded', data: roles})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to Load Data', data: error.message || error })
  }
};

const createRole = async (req, res) => {
  try {
    const creating = await AuthServices.createRole({body: req.body}, req.userAuthenticated.user_id)
    sendEmit('auth:role:created', creating)
    res.status(200).send({success: true, message: 'Data Created', data: creating})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to create Data', data: error.message || error })
  }
};

const detailRole = async (req, res) => {
  try {
    const detail = await AuthServices.detailRole({authUserId: req.userAuthenticated.user_id, unique: req.params.unique})
    res.status(200).send({success: true, message: 'Data Loaded', data: detail})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to Load Data', data: error.message || error })
  }
};

const updateRole = async (req, res) => {
  try {
    const updating = await AuthServices.updateRole({
      unique: req.params.unique,
      body: req.body,
    }, req.userAuthenticated.user_id)
    sendEmit(`auth:role-${req.params.unique}:updated`, updating)
    sendEmit('auth:role:updated', updating)
    res.status(200).send({success: true, message: 'Data Updated', data: updating})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to Updated Data', data: error.message || error })
  }
};

const deleteRole = async (req, res) => {
  try {
    const deleting = await AuthServices.deleteRole({
      unique: req.params.unique,
    }, req.userAuthenticated.user_id)
    sendEmit(`auth:role-${req.params.unique}:deleted`, deleting)
    sendEmit('auth:role:deleted', deleting)
    res.status(200).send({success: true, message: 'Data Deleted', data: deleting})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to Deleted Data', data: error.message || error })
  }
};
/** End Role Section */

export {
  createUserAuth, detailUserAuth, updateUserAuth, signInUser, updateUserRolePermission, detailUserAuthById,
  getPermissionAll, getPermissionDetail, updatePermission,
  getRoleAll, createRole, detailRole, updateRole, deleteRole,
}