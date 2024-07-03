import DeliveryNoteService from '@services/apps/delivery_note.mjs'
import { sendEmit } from '@sockets/index.mjs';

const getAllData = async (req, res) => {
  try {
    const items = await DeliveryNoteService.getAllData()
    return await res.status(200).send({success: true, message: 'Loaded!', data: items})
  } catch (error) {
    return await res.status(500).send({success: false, message: 'Failed Loaded!', data: error.message || error})
  }
};

const addData = async (req, res) => {
  try {
    const creating = await DeliveryNoteService.create(req.body, req.userAuthenticated.user_id)
    sendEmit('auth:delivery-note:created', JSON.stringify(creating))
    return await res.status(200).send({success: true, message: 'Delivery Note Created', data: creating})
  } catch (error) {
    return await res.status(500).send({success: false, message: 'Error on creating Delivery Note', data: error.message || error})
  }
};

const detailData = async (req, res) => {
  try {
    const detail = await DeliveryNoteService.detail(req.params.deliveryno)
    return await res.status(200).send({success: true, message: 'Data Found!', data: detail})
  } catch (error) {
    return await res.status(500).send({success: false, message: 'Data Failed!', data: error.message || error})
  }
};

const updateData = async (req, res) => {
  try {
    console.log(req)
    const updating = await DeliveryNoteService.update({params: req.params, body: req.body, query: req.query}, req.userAuthenticated.user_id)
    if(req.query.keyword == 'update-form-sj') { sendEmit('auth:delivery-note:updated', `${req.params.deliveryno} updated!`) }
    else if(req.query.keyword == 'update-post-invoice') { sendEmit('auth:delivery-note:updated', `${req.params.deliveryno} invoiced!`) }
    else{}
    return await res.status(200).send({success: true, message: 'Delivery Note Updated', data: updating})
  } catch (error) {
    console.log(error)
    return await res.status(500).send({success: false, message: 'Error on updating Delivery Note', data: error.message || error})
  }
};

const exportData = async (req, res) => {
  const ExcelJS = require('exceljs');
  const moment = require('moment');

  const creatorid = JSON.parse(req.query.creatorId); // ? ARRAY 
  const {sentstartdate, sentenddate, createstartdate, createenddate } = req.query

  try {
    const items = await DeliveryNoteService.export(creatorid, createstartdate, createenddate, sentstartdate, sentenddate)
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Surat Jalan');
    worksheet.columns = [
      {header: 'DELIVERY NO.', key: 'delivery_no', width: 15},
      {header: 'PO', key: 'po_no', width: 15},
      {header: 'DO', key: 'do_no', width: 15},
      {header: 'CUSTOMER', key: 'customer_name', width: 30},
      {header: 'ALAMAT', key: 'customer_addr', width: 40},
      {header: 'KOTA', key: 'customer_city', width: 15},
      {header: 'DRIVER', key: 'driver', width: 15},
      {header: 'NOPOL', key: 'nopol', width: 15},
      {header: 'QTY', key: 'qty', width: 15},
      {header: 'TGL KIRIM', key: 'send_date', width: 15},
      {header: 'CREATOR', key: 'creator', width: 25},
      {header: 'TGL DIBUAT', key: 'created_at', width: 18},
    ];
    await items.forEach(item => {
      worksheet.addRow({
        delivery_no: item.delivery_no,
        po_no: item.po_no,
        do_no: item.do_no,
        customer_name: item.detail.detail_customer,
        customer_addr: item.detail.detail_address,
        customer_city: item.detail.detail_city,
        driver: item.detail.detail_driver,
        nopol: item.detail.detail_nopol,
        qty: item.detail.detail_qty+' '+item.detail.detail_uom,
        send_date: moment(item.detail.detail_sending_date).format('DD/MM/YYYY'),
        creator: item.creator.name,
        created_at: moment(item.created_at).format('DD/MM/YYYY HH:mm'),
      });
    });
    const excelFilename = 'sjexport_'+moment().format('YYMMDD_HHmm')+'.xlsx';
    workbook.xlsx.writeBuffer().then(async data => {
      await res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      await res.setHeader('Content-Disposition', `attachment; ${excelFilename}`);
      await res.send(Buffer.from(data));
    })
  } catch (error) {
    return await res.status(500).send({success: false, message: 'Error on getting Delivery Note data!', data: error.message || error})
  }
};

const getAllDataPagination = async (req, res) => {
  try {
    const items = await DeliveryNoteService.getAllDataPaginate(req.query.currentPage, req.query.limit, req.query.search)
    return await res.status(200).send({success: true, message: 'Loaded!', data: items})
  } catch (error) {
    return await res.status(500).send({success: false, message: 'Failed Loaded!', data: error.message || error})
  }
};

const statistic = async (req, res) => {
  try {
    const statistic = await DeliveryNoteService.getStatistic({range: req.query.inputRange})
    return await res.status(200).send({success: true, message: 'Loaded!', data: statistic})
  } catch (error) {
    return await res.status(500).send({success: false, message: 'Failed Loaded!', data: error.message || error})
  }
};

export {
  getAllData, addData, detailData, updateData, exportData,
  getAllDataPagination, statistic,
}
