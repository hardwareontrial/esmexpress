import HRServices from '@services/apps/hr.mjs'
import QueueServices from '@services/queue.mjs'
import path from 'path'
import fs from 'fs'
import { sendEmit } from '@sockets/index.mjs';
import { randomString, UCWord, combinedDiffArray } from '@utils/helpers.mjs'

/** POSITION SECTION */
const getPositionData = async (req, res) => {
  try {
    const positions = await HRServices.getAllPositionData()
    res.status(200).send({success: true, message: 'Data Loaded!', data: positions})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to loading data!', data: error.message || error})
  }
};

const createPosition = async (req, res) => {
  try {
    const position = await HRServices.createPosition({body: req.body})
    res.status(200).send({success: true, message: 'Data created!', data: position})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to creating data!', data: error.message || error})
  }
};

const detailPosition = async (req, res) => {
  try {
    const position = await HRServices.detailPosition({id: req.params.id})
    res.status(200).send({success: true, message: 'Data found!', data: position})
  } catch (error) {
    res.status(500).send({success: false, message: 'Data not found!', data: error.message || error})
  }
};

const updatePosition = async (req, res) => {
  try {
    const position = await HRServices.updatePosition({body: req.body, id: req.params.id})
    res.status(200).send({success: true, message: 'Data updated!', data: position})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to update!', data: error.message || error})
  }
};
/** END POSITION SECTION */

/** DEPT SECTION */
const getDeptData = async (req, res) => {
  try {
    const depts = await HRServices.getAllDeptData()
    res.status(200).send({success: true, message: 'Data Loaded!', data: depts})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to loading data!', data: error.message || error})
  }
};

const createDept = async (req, res) => {
  try {
    const position = await HRServices.createDept({body: req.body}, req.userAuthenticated.user_id)
    res.status(200).send({success: true, message: 'Data created!', data: position})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to creating data!', data: error.message || error})
  }
};

const detailDept = async (req, res) => {
  try {
    const position = await HRServices.detailDept({id: req.params.id}, req.userAuthenticated.user_id)
    res.status(200).send({success: true, message: 'Data found!', data: position})
  } catch (error) {
    res.status(500).send({success: false, message: 'Data not found!', data: error.message || error})
  }
};

const updateDept = async (req, res) => {
  try {
    const position = await HRServices.updateDept({body: req.body, id: req.params.id}, req.userAuthenticated.user_id)
    res.status(200).send({success: true, message: 'Data updated!', data: position})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to update!', data: error.message || error})
  }
};
/** END DEPT SECTION */

/** ATTENDANCE */
const syncAttFromSource = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const attn = await HRServices.synchronizeAttFromSource(startDate, endDate)
    res.status(200).send({success: true, message: 'Success!', data: attn})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed!', data: error.message || error})
  }
};

const downloadTextFile = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const exportingToText = await HRServices.exportToTextFile(startDate, endDate)
    const pathFile = path.join(path.resolve(), 'public/storage/app/hr/attn_export', `${exportingToText}.txt`)
    
    if(!fs.existsSync(pathFile)) {
      return res.status(404).send({success: false, message: 'File not found', data: null})
    }

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=${exportingToText}.txt`);
    fs.createReadStream(pathFile).pipe(res)
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed!', data: error.message || error})
  }
};

const getAttnLogs = async (req, res) => {
  try {
    const logs = await HRServices.getAttnLogs(req.userAuthenticated.user_id);
    res.status(200).send({success: true, message: 'Success!', data: logs})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed!', data: error.message || error})
  }
};

const getAllAttendanceData = async (req, res) => {
  try {
    const data = await HRServices.getAllAttendanceData()
    res.status(200).send({success: true, message: 'Success!', data: data})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed!', data: error.message || error})
  }
};

const getAttnStatistic = async (req, res) => {
  try {
    const data = await HRServices.attnStatistic()
    res.status(200).send({success: true, message: 'Success!', data: data})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed!', data: error.message || error})
  }
};
/** END ATTENDANCE */

const testServices = async (req, res) => {
  // const positionArr = [
  //   'ACCOUNT PAYABLE (AP) & TAX STAFF',
  //   'ACCOUNT RECEIVABLE  (AR) STAFF',
  //   'BOC / BOD DRIVER',
  //   'CASHIER STAFF',
  //   'CO2 PRODUCTION OPERATOR STAFF',
  //   'CONTROLLER STAFF',
  //   'CORPORATE AFFAIR STAFF',
  //   'DIRECTOR',
  //   'DISTRIBUTION OPERATION SUPERVISOR',
  //   'DRY ICE PRODUCTION OPERATOR STAFF',
  //   'FINANCE , ACCOUNTING & TAX (FAT) SUPERVISOR',
  //   'FINANCE STAFF',
  //   'FINANCE, ACCOUNTING & TAX (FAT) MANAGER',
  //   'GENERAL ADMINISTRATION STAFF',
  //   'GENERAL AFFAIR STAFF',
  //   'GENERAL AFFAIR SUPERVISOR',
  //   'GENERAL MANAGER',
  //   'HRM & GA MANAGER',
  //   'HRM STAFF',
  //   'HRM SUPERVISOR',
  //   'HSE & TECHNICAL SUPPORT STAFF',
  //   'HSE OFFICER',
  //   'IT STAFF',
  //   'IT SUPERVISOR',
  //   'LOGISTIC MANAGER',
  //   'MANAGEMENT SYSTEM MANAGER',
  //   'OFFICE HOUSEKEEPING STAFF',
  //   'PLANT HOUSEKEEPING STAFF',
  //   'PLANT MANAGER',
  //   'PRODUCTION SUPERVISOR',
  //   'PURCHASING STAFF',
  //   'PURCHASING SUPERVISOR',
  //   'QC & INVENTORY STAFF',
  //   'QUALITY CONTROL STAFF',
  //   'QUALITY CONTROL SUPERVISOR',
  //   'QUALITY SYSTEM OFFICER',
  //   'REGULAR DRIVER',
  //   'SALES ADMINISTRATION STAFF',
  //   'SALES MANAGER (EAST)',
  //   'SALES MANAGER (WEST)',
  //   'SALES OPERATION SUPERVISOR',
  //   'SALES STAFF',
  //   'SALES SUPERVISOR',
  //   'SECURITY SENIOR STAFF',
  //   'SECURITY STAFF',
  //   'TECHNICAL DESIGN OFFICER',
  //   'TECHNICAL SUPPORT STAFF',
  //   'TRANSPORTER CO-DRIVER',
  //   'TRANSPORTER DRIVER',
  //   'TRANSPORTER DRIVER',
  //   'TRANSPORTER MECHANICAL STAFF',
  //   'UTILITY OPERATOR STAFF',
  //   'UTILITY SUPERVISOR',
  //   'UTILITY SUPPORT STAFF',
  //   'UTILITY WELDER STAFF',
  //   'WAREHOUSE STAFF',
  //   'WAREHOUSE SUPERVISOR',
  // ];
  try {
    // const tester = positionArr.forEach(async item => {
    //   const creating = await HRServices.createPosition({
    //     body: {
    //       name: item.toUpperCase(),
    //       deptId: 1,
    //       level: 2,
    //       superPos: null,
    //       employeeIds: '[]',
    //       isActive: 'true',
    //     },
    //   })
    //   // console.log(creating)
    // })
    // const tester = null;
    // sendEmit(`auth:auth-user-${req.userAuthenticated.user_id}:updated-role-permission`, 'updating')
    // const tester = await HRServices.synchronizeAttFromSource(req.query.startDate, req.query.endDate)
    // const tester = await HRServices.exportToTextFile(req.query.startDate, req.query.endDate)
    // const tester = await QueueServices.createQueue({ priority: 'medium', payload: {type: 'sync-attn', startDate: req.query.startDate, endDate: req.query.endDate} })
    // const a1 = [6, 6]
    // const a2 = [5,6,7]
    // const tester = combinedDiffArray(a1, a2)
    // const tester = true
    const SFTPIsConnected = await HRServices.SFTPCheckConnection()
    res.status(200).send({success: true, message: 'Success!', data: SFTPIsConnected})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed!', data: error.message || error})
  }
};

export {
  getPositionData, createPosition, detailPosition, updatePosition, getDeptData, createDept, detailDept, updateDept,
  syncAttFromSource, downloadTextFile, getAttnLogs, getAllAttendanceData, getAttnStatistic,
  testServices,
}