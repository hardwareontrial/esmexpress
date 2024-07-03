import db from '@services/orm/index.mjs'
import { Op } from 'sequelize'
import { randomString, UCWord } from '@utils/helpers.mjs'

const DBAPbExternal = db.DatabaseA.models.PhonebookExternal;
const DBAPbExtDetail = db.DatabaseA.models.PhonebookExtDetail;
const DBAPbExtLog = db.DatabaseA.models.PhonebookExtLog;
const DBAAppUser = db.DatabaseA.models.AppUser;

class PhoneBookServices {
  constructor() {}

  async getAllExternal(authUserId) {
    try {
      const data = await DBAPbExternal.findAndCountAll({
        include: [
          {model: DBAPbExtDetail, as: 'detail' },
          {model: DBAPbExtLog, as: 'logs'},
        ],
        order: [
          ['detail', 'id', 'ASC'],
          ['logs', 'id', 'DESC']
        ],
      });
      return data
    } catch (error) {
      throw error
    }
  };

  async createExternal(payload, authUserId) { // payload: {body: req.body}
    let createTransaction;
    try {
      const { type, name, address, company_name, company_address, city, email, note, inputs } = payload.body
      const unique_str = await randomString(8)
    
      createTransaction = await db.DatabaseA.transaction();
      
      const creating = await DBAPbExternal.create({
        pext_unique_str: unique_str,
        type: type,
        name: name?.toUpperCase(),
        address: address? UCWord(address) : '',
        company_name: company_name?.toUpperCase(),
        company_address: company_address ? UCWord(company_address): '',
        city: city ? UCWord(city) : '',
        email: email,
        note: note,
      }, {transaction: createTransaction});

      for(const input of inputs){
        await DBAPbExtDetail.create({
          phonebook_id: creating.id,
          number: input.number,
          pic: UCWord(input.pic),
        }, {transaction: createTransaction });
      }

      await createTransaction.commit();

      const logging = await this.createLogExternal(creating, authUserId, 'Create Data')
      const created = this.detailExternal({id: creating.id}, authUserId)

      return created
    } catch (error) {
      if(createTransaction){ await createTransaction.rollback() }
      throw error
    }
  };
  
  async detailExternal(payload, authUserId) { // payload: {id: req.params.id}
    try {
      const data = await DBAPbExternal.findOne({
        where: {id: payload.id},
        include: [
          {model: DBAPbExtDetail, as: 'detail' },
          {model: DBAPbExtLog, as: 'logs'},
        ],
        order: [
          ['detail', 'id', 'ASC'],
          ['logs', 'id', 'DESC']
        ],
      })
      return data
    } catch (error) {
      throw error
    }
  };

  async updateExternal(payload, authUserId) { // payload: {body: req.body, id: req.params.id}
    let updateTransaction;
    try {
      const { type, name, address, company_name, company_address, city, email, note, inputs } = payload.body;

      updateTransaction = await db.DatabaseA.transaction();

      const updating = await DBAPbExternal.update({
        type: type,
        name: name?.toUpperCase(),
        address: address? UCWord(address) : '',
        company_name: company_name?.toUpperCase(),
        company_address: company_address ? UCWord(company_address): '',
        city: city ? UCWord(city) : '',
        email: email,
        note: note,
      },{
        where: { id: payload.id }, 
        transaction: updateTransaction,
      })
      
      for(const input of inputs){
        const [dataDetail, created] = await DBAPbExtDetail.findOrCreate({
          where: { phonebook_id: payload.id, id: input.id },
          defaults: {
            phonebook_id: payload.id,
            number: input.number,
            pic: UCWord(input.pic),
          },
          transaction: updateTransaction
        })
  
        try {
          await dataDetail.update({number: input.number, pic: UCWord(input.pic)},{transaction: updateTransaction})
        } catch (error) {
          throw new Error('Failed to update DBAPbExtDetail record')
        }
      }

      await updateTransaction.commit();

      const logging = await this.createLogExternal(updating, authUserId, 'Update Data')
      const updated = await this.detailExternal({id: payload.id}, authUserId)

      return updated
    } catch (error) {
      if(updateTransaction){ await updateTransaction.rollback() }
      throw error
    }
  };

  async deleteExternal(payload, authUserId) { //payload: {id: req.params.id}
    let deleteTransaction;
    try {
      deleteTransaction = await db.DatabaseA.transaction();

      const data = await this.detailExternal({id: payload.id}, authUserId)
      
      await DBAPbExtLog.destroy({where: {phonebook_id: payload.id}}, {transaction: deleteTransaction});
      await DBAPbExtDetail.destroy({where: {phonebook_id: payload.id}}, {transaction: deleteTransaction});
      await data.destroy({transaction: deleteTransaction});

      await deleteTransaction.commit();

      return true
    } catch (error) {
      if(deleteTransaction){ await deleteTransaction.rollback() }
      throw error
    }
  };

  async deleteDetailExternal(payload, authUserId) { // payload: {idDetail:req.params.iddetail, id:req.params.id, body: req.body}
    let deleteDetailTransaction;
    try {
      const { type } = payload.body;
      deleteDetailTransaction = await db.DatabaseA.transaction();

      const detailData = await DBAPbExtDetail.findOne({
        where: {
          [Op.and]: [{id: payload.idDetail}, {phonebook_id: payload.id}]
        }
      });

      await detailData.destroy({transaction: deleteDetailTransaction});
      await deleteDetailTransaction.commit();
      const logging = await this.createLogExternal({id: payload.id, type: type}, authUserId, 'Delete Data')
      return true
    } catch (error) {
      if(deleteDetailTransaction){ await deleteDetailTransaction.rollback() }
      throw error
    }
  };

  async createLogExternal(payload, authUserId, note) {
    let logExternalTrx;
    try {
      logExternalTrx = await db.DatabaseA.transaction();
      
      const userAuthName = await this.userAuthName(authUserId)
      
      const logging = await DBAPbExtLog.create({
        phonebook_id: payload.id,
        phonebook_type: payload.type,
        activity: note,
        creator: userAuthName?.fname,
      },{transaction: logExternalTrx});

      await logExternalTrx.commit();

      return logging
    } catch (error) {
      if(logExternalTrx){ await logExternalTrx.rollback() }
      throw error
    }
  };

  async getAllInternal(authUserId) {}
  async createInternal(payload, authUserId) {}
  async detailInternal(payload, authUserId) {}
  async updateInternal(payload, authUserId) {}
  async deleteInternal(payload, authUserId) {}

  async userAuthName(authUserId) {
    try {
      const user = await DBAAppUser.findOne({ where: {user_id: authUserId} });
      return user
    } catch (error) {
      throw error
    }
  };
}

export default new PhoneBookServices