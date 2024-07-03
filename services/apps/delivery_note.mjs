import db from '@services/orm/index.mjs'
import moment from 'moment';
import { Op } from 'sequelize'
import { UCWord } from '@utils/helpers.mjs'

class DeliveryNote {
  constructor(){
    this.DBAAppDeliverynoteModel = db.DatabaseA.models.AppSuratjalan;
    this.DBAAppDeliverynoteDetailModel = db.DatabaseA.models.AppSuratjalanDetail;
    this.DBAAppDeliverynoteLogModel = db.DatabaseA.models.AppSuratjalanLog;
    this.DBAAppUserModel = db.DatabaseA.models.AppUser;
    this.btnIndicatorToName = {
      1: 'Buat Surat Jalan',
      2: 'Update Surat Jalan',
      3: 'Printing',
      4: 'Post Invoice'
    };
    this.createTransaction = null;
    this.updateTransaction = null;
    this.logTransaction = null;
  }

  async create(payload, authUserId) {
    this.createTransaction = await db.DatabaseA.transaction();
    try {
      const { donumber, ponumber, customernama, customeralamat, customerkota, nopol, drivernama, item, qty, uom, tanggalkirim } = payload.form;
      const btnRequest = payload.btnRequest
      const authUser = await this.DBAAppUserModel.findOne({ where: {user_id: authUserId} });
  
      const number = await this.getDeliveryNumber()

      // * CREATE DELIVERY
      await this.DBAAppDeliverynoteModel.create({
        delivery_no: number,
        do_no: donumber?.toUpperCase(),
        po_no: ponumber,
        creator_id: authUserId,
        is_processing: true,
        is_remark: false,
        print_count: 0,
      },{transaction: this.createTransaction})

      // * CREATE DELIVERY DETAIL
      await this.DBAAppDeliverynoteDetailModel.create({
        deliveryno_id: number,
        detail_customer: UCWord(customernama),
        detail_address: UCWord(customeralamat),
        detail_city: customerkota.toUpperCase(),
        detail_nopol: nopol.toUpperCase(),
        detail_driver: drivernama.toUpperCase(),
        detail_item: item,
        detail_qty: qty,
        detail_uom: uom,
        detail_sending_date: tanggalkirim,
      },{transaction: this.createTransaction})
      
      await this.createTransaction.commit()

      const logging = await this.createLog(number, this.btnIndicatorToName[btnRequest] || 'NULL', authUser.fname || 'NN')
      const created = await this.detail(number);

      return created
    } catch (error) {
      if(this.createTransaction){ await this.createTransaction.rollback() }
      throw error
    }
  };

  async update(payload, authUserId) {
    try {
      const keyword = payload.query.keyword
      const btnRequest = payload.body.btnRequest
      let updatingParent, updatingChild;

      if (keyword == 'update-form-sj' || keyword == 'update-print-count' || keyword == 'update-post-invoice') {
        const authUser = await this.DBAAppUserModel.findOne({ where: {user_id: authUserId} });

        if(keyword == 'update-form-sj') {
          updatingParent = await this.updateParent({body: payload.body, params: payload.params})
          updatingChild = await this.updateChild({body: payload.body, params: payload.params})
        }

        else if(keyword == 'update-print-count' || keyword == 'update-post-invoice') {
          updatingParent = await this.updateParent({body: payload.body, params: payload.params})
        }

        else {}

        const logging = await this.createLog(payload.params.deliveryno, this.btnIndicatorToName[btnRequest] || 'NULL', authUser.fname || 'NN')
        const updated = await this.detail(payload.params.deliveryno)
        return updated
      } else {
        throw new Error('Invalid keyword for update operation')
      }
    } catch (error) {
      throw error
    }
  };

  async updateParent(payload) {
    this.updateTransaction = await db.DatabaseA.transaction();
    try {
      const { donumber, ponumber, invoice_no, is_processing, is_remark, print_count } = payload.body.form
      const data = await this.detail(payload.params.deliveryno)
      if(!data){ throw new Error('Data not found for update') }
      await data.update({
        do_no: donumber?.toUpperCase(),
        po_no: ponumber,
        is_processing: is_processing,
        is_remark: is_remark,
        invoice_no: invoice_no,
        print_count: print_count,
      },{transaction: this.updateTransaction})
      await this.updateTransaction.commit()
      return data
    } catch (error) {
      if(this.updateTransaction){ await this.updateTransaction.rollback() }
      throw error
    }
  };

  async updateChild(payload) {
    this.updateTransaction = await db.DatabaseA.transaction();
    try {
      const { customernama, customeralamat, customerkota, nopol, drivernama, item, qty, uom, tanggalkirim } = payload.body.form
      const data = await this.detail(payload.params.deliveryno)
      if(!data){ throw new Error('Data not found for update') }
      const detail = await data.getDetail();
      await detail.update({
        detail_customer: UCWord(customernama),
        detail_address: UCWord(customeralamat),
        detail_city: customerkota.toUpperCase(),
        detail_nopol: nopol.toUpperCase(),
        detail_driver: drivernama.toUpperCase(),
        detail_item: item,
        detail_qty: qty,
        detail_uom: uom,
        detail_sending_date: tanggalkirim,
      },{transaction: this.updateTransaction});
      await this.updateTransaction.commit()
      return detail
    } catch (error) {
      if(this.updateTransaction){ await this.updateTransaction.rollback() }
      throw error
    }
  };

  async detail(deliveryNumber) {
    try {
      const data = await this.DBAAppDeliverynoteModel.findOne({
        where: {delivery_no: deliveryNumber},
        include: [
          {model: this.DBAAppUserModel, as: 'creator'},
          {model: this.DBAAppDeliverynoteDetailModel, as: 'detail', required: true},
          {model: this.DBAAppDeliverynoteLogModel, as: 'logs'},
        ],
        order: [
          ['logs', 'id', 'DESC']
        ],
      })
      return data;
    } catch (error) {
      throw error
    }
  };

  async export(creatorId, createstartdate, createenddate, sentstartdate, sentenddate) {
    try {
      const data = await this.DBAAppDeliverynoteModel.findAll({
        order: [['created_at', 'DESC']],
        include: [
          {model: this.DBAAppDeliverynoteDetailModel, as: 'detail', required: true,},
          {model: this.DBAAppUserModel, as: 'creator', required: true,}
        ],
        where: {
          creator_id: creatorId.length > 0 ? { [Op.in]: creatorId } : { [Op.notIn]: creatorId },
          created_at: { [Op.between]: [createstartdate, createenddate] },
          '$detail.detail_sending_date$': { [Op.between]: [sentstartdate, sentenddate] },
        }
      })
      return data
    } catch (error) {
      throw error
    }
  }

  async getAllData() {
    try {
      const items = await this.DBAAppDeliverynoteModel.findAll({
        include: [
          {model: this.DBAAppUserModel, as: 'creator'},
          {model: this.DBAAppDeliverynoteDetailModel, as: 'detail', required: true},
          {model: this.DBAAppDeliverynoteLogModel, as: 'logs'},
        ],
        order: [
          ['created_at', 'DESC'],
          ['logs', 'id', 'DESC'],
        ],
      })
      return items
    } catch (error) {
      throw error
    }
  };

  async getAllDataPaginate(currentPage, limit, search) {
    try {
      const data = await this.getAllData()
      const filterData = data.filter(item => 
        item.do_no.includes(search) ||
        item.po_no.includes(search) ||
        item.delivery_no.includes(search) ||
        item.detail.detail_customer.toLowerCase().includes(search?.toLowerCase()) ||
        item.detail.detail_address.toLowerCase().includes(search?.toLowerCase()) ||
        item.detail.detail_city.toLowerCase().includes(search?.toLowerCase()) ||
        item.detail.detail_driver.toLowerCase().includes(search?.toLowerCase()) ||
        item.detail.detail_item.includes(search)
      )
      const countFilteredArray = filterData.length
      const totalPages = Math.ceil(countFilteredArray/limit)
      currentPage = Math.min(Math.max(1, currentPage), totalPages)
      const startIndex = (currentPage -1)*limit
      const endIndex = startIndex + limit
      const itemsForPage = filterData.slice(startIndex, endIndex)
      const from = ((currentPage -1)* limit) +1
      const to = Math.min((currentPage * limit), countFilteredArray)
      return {
        items: itemsForPage,
        total: countFilteredArray,
        currentPage: Math.max(currentPage, 1),
        per_page: limit,
        from: Math.max(from, 0),
        to: to,
      }
    } catch (error) {
      throw error
    }
  };

  async getDeliveryNumber() {
    try {
      const baseCode = 'S-'+moment().format('YYMMDD');
      let newCode;
      
      const isExist = await this.DBAAppDeliverynoteModel.findOne({
        where: {
          delivery_no: {[Op.like]: `${baseCode}%`}
        },
        order: [
          ['created_at', 'DESC']
        ],
      })

      if(!isExist) { 
        newCode = baseCode+'0001'
      } else {
        const lastCode = (isExist.delivery_no).substring(8);
        const nextNumber = ((parseInt(lastCode)+1).toString()).padStart(4, '0');
        newCode = baseCode+nextNumber;
      }
      return newCode
    } catch (error) {
      throw error
    }
  };

  async createLog(deliverynoId, actionName, creator) {
    this.logTransaction = await db.DatabaseA.transaction();
    try {
      const logging = await this.DBAAppDeliverynoteLogModel.create({
        deliveryno_id: deliverynoId,
        action_name: actionName,
        creator: creator,
      },{transaction: this.logTransaction})
      await this.logTransaction.commit()
      return logging
    } catch (error) {
      if(this.logTransaction){ await this.logTransaction.rollback() }
      reject(error)
    }
  };

  async getStatistic(payload) {
    try {
      const data = await this.getAllData()
      const range = payload.range
      
      const calculateData = (data, range) => {
        // const today = moment()
        const daysAgo14 = moment().subtract(14, 'days')
        const daysAgo28 = moment().subtract(28, 'days')

        const filterData = data.filter(item => {
          const today = moment()
          const targetDate = moment(item.detail.detail_sending_date)
          const diffDays = today.diff(targetDate, 'days')
          return (range === 'z0' && diffDays === 0) || (range === 'z14' && diffDays <= 14) || (range === 'z28' && diffDays <= 28)
        })

        const totalDelivery = filterData.length
        const totalIsRemark = filterData.filter(item => item.is_remark === 1).length

        const itemsMap = new Map();
        filterData.forEach(item => {
          const { detail_item, detail_qty, detail_uom } = item.detail;
          if(!itemsMap.has(detail_item)) {
            itemsMap.set(detail_item, {sent: parseInt(detail_qty), uom: detail_uom})
          } else {
            const existingItem = itemsMap.get(detail_item)
            existingItem.sent += parseInt(detail_qty)
            itemsMap.set(detail_item, existingItem);
          }
        })

        const items = Array.from(itemsMap, ([item, values]) => ({item, sent: values.sent, uom: values.uom}))
        console.log(items)

        return { range, totalDelivery,totalIsRemark, items }
      }
      const result = calculateData(data, range)
      return result
    } catch (error) {
      throw error
    }
  };
  
}

export default new DeliveryNote()