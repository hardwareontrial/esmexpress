import db from '@services/orm/index.mjs'
import { Op, where } from 'sequelize'
import path from 'path'
import fs from 'fs'
import { randomString } from '@utils/helpers.mjs'
import { createdStructure, createdStructure2, getAllLevelPosition, removeTopLevel } from '@utils/nestedPosition.mjs'
import moment from 'moment';
import { promisify } from 'node:util';
import { exec } from 'node:child_process';

const AppPositionModel = db.DatabaseA.models.AppHrPosition;
const AppDeptModel = db.DatabaseA.models.AppHrDepartment;
const AppUserModel = db.DatabaseA.models.AppUser;

class HRServices {
  constructor() {
    this.DBBAttnSource = db.DatabaseB.models.AttendanceLog;
    this.DBATmpAttn = db.DatabaseA.models.TmpAttendance;
    this.DBATmpAttnLog = db.DatabaseA.models.TmpAttnLog;
  }

  /** POSITION SECTION */
  async getAllPositionData(authUserId) {
    try {
      const levels = await getAllLevelPosition();
      const childrenStructure2 = createdStructure2(levels.length);
      const parentStructure2 = createdStructure2(levels.length, false);
      const positions = await AppPositionModel.findAll({
        include: [
          { model: AppDeptModel, as: 'department', attributes: {exclude: ['created_at', 'updated_at']} },
          { model: AppUserModel, as: 'hasUsers', attributes: {exclude: ['created_at', 'updated_at']} },
          parentStructure2,
          childrenStructure2,
        ]
      });
      return positions
    } catch (error) {
      throw error
    }
  };

  async createPosition(payload, authUserId) { // payload: {body: req.body}
    let newPositionTransaction;
    try {

      const { name, deptId, level, superPos, employeeIds, isActive } = payload.body;
      const parsedEmpIds = JSON.parse(employeeIds);
      const unique_str = await randomString(8);
      
      /** CREATE DATA */
      newPositionTransaction = await db.DatabaseA.transaction();
      const newData = await AppPositionModel.create({
        position_unique_str: unique_str,
        parent_position_id: superPos,
        name: name.toUpperCase(),
        department_id: deptId,
        level: level,
        is_active: JSON.parse(isActive),
      },{transaction: newPositionTransaction});
      
      await newPositionTransaction.commit();
      
      /** ASSIGN TO SELECTED USER */
      // if (parsedEmpIds.length > 0) {
      //   const assigningToUser = await this.massAssignPositionToUser(parsedEmpIds, newData.id)
      // }
      
      const position = await this.detailPosition({id: newData.id}, authUserId)
      return position
    } catch (error) {
      if(newPositionTransaction){ await newPositionTransaction.rollback() }
      throw error
    }
  };

  async detailPosition(payload, authUserId) { // payload: {id: req.params.id}
    try {
      const levels = await getAllLevelPosition();
      const childrenStructure2 = createdStructure2(levels.length);
      const parentStructure2 = createdStructure2(levels.length, false);
      const position = await AppPositionModel.findOne({
        where: { id: payload.id },
        include: [
          { model: AppDeptModel, as: 'department', attributes: {exclude: ['created_at', 'updated_at']} },
          { model: AppUserModel, as: 'hasUsers', attributes: {exclude: ['created_at', 'updated_at']} },
          parentStructure2,
          childrenStructure2,
        ],
      });
      return position
    } catch (error) {
      throw error
    }
  };

  async updatePosition(payload, authUserId) { // payload: {body: req.body, id: req.params.id}
    let updateTransaction;
    try {
      const { name, deptId, level, superPos, employeeIds, isActive } = payload.body;
      const parsedEmpIds = JSON.parse(employeeIds);
      const parsedStatus = JSON.parse(isActive);
      const lastIdsUser = await AppUserModel.findAll({where: {position_id: payload.id} }).then(result => result.map(({user_id})=>user_id))

      // const nulledToUser = await this.massAssignPositionToUser(lastIdsUser, null)
      updateTransaction = await db.DatabaseA.transaction();
      let propertyUpdate = {};
      if(!parsedStatus) {
        propertyUpdate = {
          name: name.toUpperCase(),
          parent_position_id: null,
          department_id: null,
          level: null,
          is_active: parsedStatus,
        }
      } else {
        propertyUpdate = {
          name: name.toUpperCase(),
          parent_position_id: superPos,
          department_id: deptId,
          level: level,
          is_active: parsedStatus,
        }
        // const assigningToUser = await this.massAssignPositionToUser(parsedEmpIds, payload.id)
      }

      const updating = await AppPositionModel.update(propertyUpdate,{
        where: {id: payload.id},
        transaction: updateTransaction,
      });
      await updateTransaction.commit()
      const position = await this.detailPosition({id: payload.id}, authUserId)
      return position
    } catch (error) {
      if(updateTransaction){ await updateTransaction.rollback() }
      throw error
    }
  };

  async massAssignPositionToUser(userIds, positionId) {
    let assignPositionTransaction;
    try {
      assignPositionTransaction = await db.DatabaseA.transaction();
      for (const input of userIds) {
        await AppUserModel.update({
          position_id: positionId,
        },{
          where: { user_id: input },
          transaction: assignPositionTransaction,
        })
      }
      return
    } catch (error) {
      if(assignPositionTransaction){ await assignPositionTransaction.rollback() }
      throw error
    }
  };
  /** END POSITION SECTION */

  /** DEPARTMENT SECTION */
  async getAllDeptData(authUserId) {
    try {
      const levels = await getAllLevelPosition();
      const childrenStructure2 = createdStructure2(levels.length);
      const parentStructure2 = createdStructure2(levels.length, false);
      const departments = await AppDeptModel.findAll({
        include: [
          {
            model: AppPositionModel,
            as: 'positions',
            include: [
              childrenStructure2, parentStructure2,
              { model: AppUserModel, as: 'hasUsers', attributes: {exclude: ['created_at', 'updated_at']} }
            ],
          },
        ],
      })
      return departments
    } catch (error) {
      throw error
    }
  };

  async createDept(payload, authUserId) { // payload: {body: req.body}
    let newDeptTransaction;
    try {
      const { name, isActive, positions } = payload.body;
      const unique_str = await randomString(5)
      const parsedStatus = JSON.parse(isActive)
      const parsedIdsPosition = JSON.parse(positions)

      newDeptTransaction = await db.DatabaseA.transaction();
      const newDept = await AppDeptModel.create({
        dept_unique_str: unique_str,
        name: name.toUpperCase(),
        is_active: parsedStatus,
      },{ transaction: newDeptTransaction})
      
      await newDeptTransaction.commit()

      if(parsedIdsPosition.length > 0) {
        this.massAssignDeptToPosition(parsedIdsPosition, newDept.id)
      }

      const dept = await this.detailDept({id: newDept.id}, authUserId)
      return dept
    } catch (error) {
      if(newDeptTransaction){ await newDeptTransaction.rollback() }
      throw error
    }
  };

  async detailDept(payload, authUserId) { // payloa d: {id: req.params.id}
    try {
      const levels = await getAllLevelPosition();
      const childrenStructure2 = createdStructure2(levels.length);
      const parentStructure2 = createdStructure2(levels.length, false);
      const detail = await AppDeptModel.findOne({
        where: {id: payload.id},
        include: [
          {
            model: AppPositionModel,
            as: 'positions',
            include: [
              childrenStructure2, parentStructure2,
              { model: AppUserModel, as: 'hasUsers', attributes: {exclude: ['created_at', 'updated_at']} },
            ]
          }
        ],
      })
      return detail
    } catch (error) {
      throw error
    }
  };

  async updateDept(payload, authUserId) { // payload: {body: req.body, id: req.params.id}
    let updateDeptTransaction;
    try {
      const { id, name, isActive, positions } = payload.body;
      const parsedStatus = JSON.parse(isActive)
      const parsedIdsPosition = JSON.parse(positions)
      const positionIds = await AppPositionModel.findAll({ where: { department_id: id }});

      updateDeptTransaction = await db.DatabaseA.transaction();
      
      const nulled = await this.massAssignDeptToPosition(positionIds, payload.id)
      if(parsedStatus) {
        const assigningDept = await this.massAssignDeptToPosition(parsedIdsPosition, payload.id)
      }

      const updating = await AppDeptModel.update({
        name: name.toUpperCase(),
        is_active: parsedStatus
      },{
        where: { id: payload.id },
        transaction: updateDeptTransaction,
      })

      await updateDeptTransaction.commit();
      const updated = await this.detailDept({id: id}, authUserId)
      return updated
    } catch (error) {
      if(updateDeptTransaction){ await updateDeptTransaction.rollback() }
      throw error
    }
  };

  async massAssignDeptToPosition(positionIds, deptId) {
    let assignDeptTransaction;
    try {
      assignDeptTransaction = await db.DatabaseA.transaction();
      for (const input of positionIds) {
        await AppPositionModel.update({
          department_id: deptId,
        },{
          where: { id: input },
          transaction: assignDeptTransaction,
        })
      }
      return
    } catch (error) {
      if(assignDeptTransaction){ await assignDeptTransaction.rollback() }
      throw error
    }
  };
  /** END DEPARTMENT SECTION */

  /** ATENDANCE SECTION */
  async getAttSourceData(startDate, endDate) {
    try {
      const source = await this.DBBAttnSource.findAll({
        where: { scan_date: {[Op.gt]: startDate, [Op.lte]: endDate} },
        include: [
          {model: AppUserModel, as: 'detail', required: true, attributes: ['user_id', 'user_unique_str', 'nik', 'fname', 'mname', 'lname']},
        ],
        order: [
          ['scan_date', 'ASC']
        ],
      });
      return source
    } catch (error) {
      throw error
    }
  };

  async createAttendance(data) { // data = []
    let createAttendance;
    try {
      createAttendance = await db.DatabaseA.transaction()
      const addedData = [];

      for(const item of data){
        const [attn, created] = await this.DBATmpAttn.findOrCreate({
          where: {
            scan_date: item.scan_date,
            nik: item.pin,
          },
          defaults: {
            fullname: item.detail.fname,
            verifymode: item.verifymode,
            inoutmode: item.inoutmode,
          },
          transaction: createAttendance,
        })
        if(created){ addedData.push(attn) }
      }
      await createAttendance.commit()
      return addedData;
    } catch (error) {
      if(createAttendance){ await createAttendance.rollback() }
      throw error
    }
  };

  async synchronizeAttFromSource(startDate, endDate) {
    const name = await this.transformDateToName(startDate, endDate)
    try {
      const getData = await this.getAttSourceData(startDate, endDate)
      if(getData.length > 0) {
        const createAttendance = await this.createAttendance(getData)
        const logging = await this.createLog({startDate: startDate, endDate: endDate, note: `Sync successfull ${name}`})
      } else {
        const logging = await this.createLog({startDate: startDate, endDate: endDate, note: `No Data from ${name}`})
      }
      return getData
    } catch (error) {
      const logging = await this.createLog({startDate: startDate, endDate: endDate, note: `Failed sync ${name}: ${error.message || error}`})
      throw error
    }
  };

  async exportToTextFile(startDate, endDate) {
    try {
      const getAttData = await this.rangeAttnData(startDate, endDate);
      const trxName = await this.transformDateToName(startDate, endDate);
      const createFile = await this.storeTextAtt(getAttData, `${trxName}`)
      return trxName
    } catch (error) {
      throw error
    }
  };

  async rangeAttnData(startDate, endDate) {
    try {
      const data = await this.getAllAttendanceData();
      const filtered = data.filter(item => {
        const scan_date = moment(item.scan_date)
        return scan_date.isSameOrAfter(startDate) && scan_date.isSameOrBefore(endDate)
      });
      return filtered
    } catch (error) {
      throw error
    }
  };

  async getAllAttendanceData(authUserId) {
    try {
      const data = await this.DBATmpAttn.findAll({
        order: [['scan_date', 'ASC']]
      })
      return data
    } catch (error) {
      throw error
    }
  };

  async storeTextAtt(dataToExport, name) {
    const tranformedName = await this.transformNameToDate(name)
    try {
      const storedir = path.join(path.resolve(), 'public/storage/app/');
      const hrDir = fs.existsSync(path.join(storedir, 'hr'));
      // const attStorageDir = fs.existsSync(path.join(hrDir, 'attn_export'));

      if(!hrDir) { await fs.promises.mkdir(path.join(storedir, 'hr'), { recursive: true }) }
      const attTxtDir = await fs.promises.readdir(path.join(storedir, 'hr'))
      if(!attTxtDir.includes('attn_export')) {
        await fs.promises.mkdir(path.join(storedir, 'hr', 'attn_export'), { recursive: true })
      }

      const dataString = dataToExport
        .map(item => `${item.nik}, ${item.fullname}, ${moment(item.scan_date).format('DD/MM/YYYY HH:mm')}`)
        .join('\n');
      
      const buffer = Buffer.from(dataString, 'utf-8');
      fs.writeFileSync(path.resolve(`public/storage/app/hr/attn_export/${name}.txt`), buffer)
      const logging = await this.createLog({startDate: tranformedName.startDate, endDate: tranformedName.endDate, note: `File ${name} Exported`})
      return true
    } catch (error) {
      const logging = await this.createLog({startDate: tranformedName.startDate, endDate: tranformedName.endDate, note: `Failed to Exported ${name}: ${error.message || error}`})
      throw error
    }
  };

  async transformDateToName(startDate, endDate) {
    return `${startDate.replace(/-|\s|:/g,"")}-${endDate.replace(/-|\s|:/g,"")}`
  };

  async transformNameToDate(name) {
    const startDate = name.substring(0, 8);
    const startTime = name.substring(8, 14);
    const endDate = name.substring(15, 23);
    const endTime = name.substring(23);
    const formattedStartDate = `${startDate.substring(0, 4)}-${startDate.substring(4, 6)}-${startDate.substring(6, 8)} ${startTime.substring(0, 2)}:${startTime.substring(2, 4)}:${startTime.substring(4)}`;
    const formattedEndDate = `${endDate.substring(0, 4)}-${endDate.substring(4, 6)}-${endDate.substring(6, 8)} ${endTime.substring(0, 2)}:${endTime.substring(2, 4)}:${endTime.substring(4)}`;
    return { startDate: formattedStartDate, endDate: formattedEndDate };
  };

  async createLog(payload) { // payload: {startDate: '', endDate: '', note: ''}
    let createLogAtt;
    try {
      createLogAtt = await db.DatabaseA.transaction();
      const creating = await this.DBATmpAttnLog.create({
        startDate: payload.startDate,
        endDate: payload.endDate,
        note: payload.note,
      },{ transaction: createLogAtt })
      await createLogAtt.commit()
      return creating
    } catch (error) {
      if(createLogAtt){ await createLogAtt.rollback() }
      throw error
    }
  };

  async getAttnLogs(authUserId) {
    try {
      const logs = await this.DBATmpAttnLog.findAll({
        order: [['id', 'DESC']],
      });
      return logs
    } catch (error) {
      throw error
    }
  };

  async attnStatistic(authUserId) {
    try {
      const attnLogs = await this.getAttnLogs();
      const attnSyncd = await this.getAllAttendanceData();
      const lastAttnSyncd = attnSyncd.length > 0 ? attnSyncd[attnSyncd.length -1] : null;
      return {
        totalLogs: attnLogs.length,
        totalAttnSync: attnSyncd.length,
        lastAttnSyncd: lastAttnSyncd,
      }
    } catch (error) {
      throw error
    }
  };

  async SFTPCheckConnection () {
    const execAsync = promisify(exec);
    const HOST = 'snftp.dataon.com';
    const PORT = '2222';
    
    try {
      const {stdout, stderr} = await exec(`nc -z -v -w5 ${HOST} ${PORT}`);
      if(stderr) { console.error(`stderr: ${stderr}`); return false }
      console.log(`stdout: ${stdout}`)
      return true;
    } catch (error) {
      console.error(`Error: ${error.message}`)
      return false;
    }
  };

  /** END ATENDANCE SECTION */
}

export default new HRServices()