import db from '@services/orm/index.mjs'
import moment from 'moment';
import { Op } from 'sequelize'
import path from 'path'
import fs from 'fs'

class GaInventaris {
  constructor() {
    this.DBAGaInventaris = db.DatabaseA.models.AppGaInventaris;
    this.DBAGaInventarisLog = db.DatabaseA.models.AppGaInventarisLog;
    this.DBAGaMerk = db.DatabaseA.models.AppGaInvMerk;
    this.DBAGaLocation = db.DatabaseA.models.AppGaInvLocation;
    this.DBAGaInvSell = db.DatabaseA.models.AppGaInventarisSell;
    this.DBAAppUser = db.DatabaseA.models.AppUser;
    this.DBAAppPosition = db.DatabaseA.models.AppHrPosition;
    this.DBAAppDepartment = db.DatabaseA.models.AppHrDepartment;
  };

  async getDataAll(authUserId) {
    try {
      const data = await this.DBAGaInventaris.findAll({
        include: [
          { model: this.DBAAppUser, as: 'invuser1' },
          { model: this.DBAAppUser, as: 'invuser2' },
          { model: this.DBAGaMerk, as: 'invmerk' },
          { model: this.DBAGaLocation, as: 'invloc' },
          { model: this.DBAGaInventarisLog, as: 'loginvs' }
        ],
        order: [
          ['id', 'DESC'],
          ['loginvs', 'id', 'DESC']
        ],
        paranoid: true,
      });
      return data
    } catch (error) {
      throw error
    }
  };
  
  async getDataPaginate(currentPage, limit, search) {
    try {
      const data = await this.getDataAll()
      const filteredArray = data.filter(item => {
        const kodeBrg = item.kode_brg ? item.kode_brg.toLowerCase() : '';
        const namaBrg = item.nama_brg ? item.nama_brg.toLowerCase() : '';
        const invLocName = item.invloc && item.invloc.name ? item.invloc.name.toLowerCase() : '';
        return kodeBrg.includes(search?.toLowerCase()) || namaBrg.includes(search?.toLowerCase()) || invLocName.includes(search?.toLowerCase())
      })
      const countFilteredArray = filteredArray.length
      const totalPages = Math.ceil(countFilteredArray/limit)
      currentPage = Math.min(Math.max(1, currentPage), totalPages)
      const startIndex = (currentPage -1)*limit
      const endIndex = startIndex + limit
      const itemsForPage = filteredArray.slice(startIndex, endIndex)
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

  async create(body, authUserId) {
    let createTransaction;

    try {
      const ipf = process.env.FRONTEND_IP;
      const {
        kode_brg, nama_brg, tgl_beli, harga, toko, spesifikasi, serialnumber, pic_bagian_id, 
        merk_id, lokasi_id, status_id, is_active, qrcode, user_id_1, user_id_2, notes, mtc_note,
      } = body.form
      const creator = await this.authUsername(authUserId)

      // GET CODE
      const kodeBrg = await this.getKodeBarang()
      
      // QRNAME
      const qrName = (kodeBrg.replace(' ',''))+'.png';

      // CREATING DATA
      createTransaction = await db.DatabaseA.transaction()
      const creating = await this.DBAGaInventaris.create({
        kode_brg: kodeBrg,
        nama_brg: (nama_brg.trim()).toUpperCase(),
        tgl_beli: tgl_beli,
        harga: harga ? harga : null,
        toko: (toko?.trim())?.toUpperCase(),
        spesifikasi: (spesifikasi?.trim())?.toUpperCase(),
        serialnumber: (serialnumber?.trim())?.toUpperCase(),
        pic_bagian_id: pic_bagian_id,
        merk_id: merk_id,
        lokasi_id: lokasi_id,
        status_id: status_id,
        is_active: JSON.parse(is_active),
        qrcode: qrName,
        mtc_note: null,
        notes: (notes?.trim())?.toUpperCase(),
        user_id_1: status_id === 2 ? user_id_1 : null,
        user_id_2: status_id === 2 ? user_id_2 : null,
      },{
        transaction: createTransaction,
        creator: creator,
      })

      await createTransaction.commit()

      const createQr = await this.createQr(`http://${ipf}/inventaris/show/${creating.dataValues.id}`, qrName)
      const created = await this.detail(creating.dataValues.id)
      return created
    } catch (error) {
      if(createTransaction) { await createTransaction.rollback() }
      throw error      
    }
  };

  async detail(id) {
    try {
      const detail = await this.DBAGaInventaris.findOne({
        where: {id: id},
        paranoid: true,
        include: [
          { model: this.DBAAppUser, as: 'invuser1' },
          { model: this.DBAAppUser, as: 'invuser2' },
          { model: this.DBAGaMerk, as: 'invmerk' },
          { model: this.DBAGaLocation, as: 'invloc' },
          { model: this.DBAGaInventarisLog, as: 'loginvs' }
        ],
        order: [
          ['loginvs', 'id', 'DESC']
        ],
      })
      return detail
    } catch (error) {
      throw error
    }
  };

  async update(payload, authUserId) {
    let updateTransaction;
    try {
      const data = await this.detail(payload.id);
      const creator = await this.authUsername(authUserId)
      
      const keyword = payload.keyword;
      if(keyword === 'update-isactive') {
        payload.body.form.status_id = 1;
        payload.body.form.user_id_1 = null;
        payload.body.form.user_id_2 = null;
        payload.body.form.is_active = ~payload.body.form.is_active +2;
      }
      const {
        kode_brg, nama_brg, tgl_beli, harga, toko, spesifikasi, serialnumber, pic_bagian_id, 
        merk_id, lokasi_id, status_id, is_active, qrcode, user_id_1, user_id_2, notes, mtc_note,
      } = payload.body.form


      // UPDATING DATA
      updateTransaction = await db.DatabaseA.transaction()
      const updating = await data.update({
        nama_brg: (nama_brg.trim()).toUpperCase(),
        tgl_beli: tgl_beli,
        harga: harga ? harga : null,
        toko: (toko?.trim())?.toUpperCase(),
        spesifikasi: (spesifikasi?.trim())?.toUpperCase(),
        serialnumber: (serialnumber?.trim())?.toUpperCase(),
        pic_bagian_id: pic_bagian_id,
        merk_id: merk_id,
        lokasi_id: lokasi_id,
        status_id: status_id,
        is_active: is_active,
        mtc_note: status_id === 4 ? mtc_note : null,
        notes: (notes?.trim())?.toUpperCase(),
        user_id_1: status_id === 2 ? user_id_1 : null,
        user_id_2: status_id === 2 ? user_id_2 : null,
      },{
        transaction: updateTransaction,
        creator: creator,
      })

      await updateTransaction.commit()

      const updated = await this.detail(payload.id);
      return updated
    } catch (error) {
      if(updateTransaction) { await updateTransaction.rollback() }
      throw error      
    }
  };
  
  async delete(id, authUserId) {
    let deleteTransaction;
    try {
      const data = await this.detail(id);
      const creator = await this.authUsername(authUserId);
      const oldPath = path.join(path.resolve(),'/public/storage/app/gainventaris/qrcode/', data.qrcode)
      const newPath = path.join(path.resolve(),'/public/storage/app/gainventaris/qrcode/', `deleted-${data.qrcode}`)
      
      deleteTransaction = await db.DatabaseA.transaction();
      
      const updateQrname = await data.update({
        qrcode: `deleted-${data.qrcode}`
      },{ 
        transaction: deleteTransaction,
        creator: creator,
      });
      
      const deleteData = await data.destroy({
        transaction: deleteTransaction,
        creator: creator
      });

      await fs.promises.rename(oldPath, newPath)

      await deleteTransaction.commit();

      return;
    } catch (error) {
      if(deleteTransaction) {
        await fs.promises.rename(newPath, oldPath)
        await deleteTransaction.rollback()
      }
      throw error
    }
  };

  async createQr(url, name) {
    const { QRCodeStyling } = require('qr-code-styling-node/lib/qr-code-styling.common');
    const nodeCanvas = require('canvas');
    const storedir = path.join(path.resolve(), 'public/storage/app/');
    const gaInventarisDir = fs.existsSync(path.join(storedir, 'gainventaris'))

    const options = {
      width: 300,
      height: 300,
      data: url,
      image: path.resolve('public/storage/mig.png'),
      imageOptions: {
        hideBackgroundDots	:	true,
        imageSize	:	0.4,
        margin	:	0,
      },
      margin: 0,
      qrOptions: {
        typeNumber: '0',
        mode: 'Byte',
        errorCorrectionLevel: 'Q',
      },
      dotsOptions: {
        color: '#147fc2',
        type: 'extra-rounded',
      },
      backgroundOptions: {
        color: '#ffffff',
      },
      cornersSquareOptions: {
        type : '#000000',
        color: 'extra-rounded',
      },
    }

    try {
      if(!gaInventarisDir) { await fs.promises.mkdir(path.join(storedir, 'gainventaris'), { recursive: true }) }
      const qrCodeDir = await fs.promises.readdir(path.join(storedir, 'gainventaris'))
      if(!qrCodeDir.includes('qrcode')) {
        await fs.promises.mkdir(path.join(storedir, 'gainventaris', 'qrcode'), { recursive: true })
      }

      const qrCodeImage = await new QRCodeStyling({
        nodeCanvas, // this is required
        ...options
      });

      const buffer = await qrCodeImage.getRawData('png')
      fs.writeFileSync(path.resolve(`public/storage/app/gainventaris/qrcode/${name}`), buffer);
      return
    } catch (error) {
      throw new Error(`Error creating QR code: ${error.message}`)
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

  async getKodeBarang() {
    try {
      const base = 'NB ';
      let kode;

      const isExist = await this.DBAGaInventaris.findOne({
        where: {
          kode_brg: {[Op.like]: `${base}%`}
        },
        order: [['id', 'DESC']],
        paranoid: false,
      });
      
      if(!isExist){
        kode = base+'0001';
      }else{
        const nextCode = parseInt(isExist.kode_brg.substring(2))+1;
        kode = base+(nextCode.toString()).padStart(4, '0');
      }
      return kode
    } catch (error) {
      throw error
    }
  };

  async misc(payload, authUserId) {
    try {
      const creator = await this.authUsername(authUserId)
      console.log(payload)
      let data;
      switch (payload.keyword) {
        case 'get-location':
          data = await this.DBAGaLocation.findAll()
          return data;
        case 'create-location':
          const inputLocation = payload.body.name;
          data = await this.DBAGaLocation.create({ name: inputLocation.toUpperCase() });
          return data;
        case 'get-merk':
          data = await this.DBAGaMerk.findAll()
          return data
        case 'create-merk':
          const inputMerk = payload.body.name;
          data = await this.DBAGaMerk.create({ name: inputMerk.toUpperCase() })
          return data
        default:
          throw new Error('No keyword provided');
      }
    } catch (error) {
      throw error
    }
  };
}

export default new GaInventaris()