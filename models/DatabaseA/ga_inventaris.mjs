import { Model, DataTypes } from 'sequelize'
import db from '@services/orm/sequelize.mjs'

class AppGaInvMerk extends Model {};
class AppGaInvLocation extends Model {};
class AppGaInventaris extends Model {};
class AppGaInventarisLog extends Model {};
class AppGaInventarisSell extends Model {};

AppGaInvMerk.init({
  id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true},
  name: {type:DataTypes.STRING(255), allowNull: false},
},{
  sequelize: db.DatabaseA,
  modelName: 'AppGaInvMerk',
  freezeTableName: true,
  tableName: 'tbl_gainventaris_merk',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseA.config.database,
});

AppGaInvLocation.init({
  id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true},
  name: {type:DataTypes.STRING(255), allowNull: false},
},{
  sequelize: db.DatabaseA,
  modelName: 'AppGaInvLocation',
  freezeTableName: true,
  tableName: 'tbl_gainventaris_location',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseA.config.database,
});

AppGaInventaris.init({
  id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true},
  kode_brg: {type: DataTypes.STRING(255), allowNull: false, unique: true},
  nama_brg: {type: DataTypes.STRING(255), allowNull: false},
  tgl_beli: {type: DataTypes.DATEONLY, allowNull: false},
  harga: {type: DataTypes.INTEGER(11), allowNull: true},
  toko: {type: DataTypes.STRING(255), allowNull: true},
  spesifikasi: {type: DataTypes.TEXT('medium'), allowNull: true},
  serialnumber: {type: DataTypes.STRING(100), allowNull: true},
  pic_bagian_id: {type: DataTypes.INTEGER(11), allowNull: false},
  merk_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false},
  lokasi_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false},
  status_id: {type: DataTypes.INTEGER(11), allowNull: false},
  is_active: {type: DataTypes.TINYINT(1), allowNull: false},
  qrcode: {type: DataTypes.STRING(255), allowNull: true},
  qrcodeLink: {
    type: DataTypes.VIRTUAL, noUpdate: false,
    get(){ return this.qrcode ? `http://${process.env.APP_IP}:${process.env.APP_PORT}/public/storage/app/gainventaris/qrcode/${this.qrcode}` : null },
    set(value){ throw new Error(`Don't try to set!`) }
  },
  user_id_1: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: true},
  user_id_2: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: true},
  notes: {type: DataTypes.TEXT('medium'), allowNull: true},
  mtc_note: {type: DataTypes.TEXT('medium'), allowNull: true},
  _rowVariant: {
    type: DataTypes.VIRTUAL, noUpdate: false,
    get(){ return this.is_active === 1 ? '' : 'secondary' },
    set(value){ throw new Error(`Don't try to set!`) }
  },
},{
  sequelize: db.DatabaseA,
  modelName: 'AppGaInventaris',
  freezeTableName: true,
  tableName: 'tbl_gainventaris',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseA.config.database,
  paranoid: true,
  deletedAt: 'delete_at',
});

AppGaInventarisLog.init({
  id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true},
  gainventaris_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false},
  action: {type: DataTypes.INTEGER(11), allowNull: false},
  n_status_id: {type: DataTypes.INTEGER(11), allowNull: false},
  n_is_active: {type: DataTypes.TINYINT(1), allowNull: false},
  creator: {type: DataTypes.STRING(255), allowNull: false},
  logs: {type: DataTypes.TEXT('long'), allowNull: false},
},{
  sequelize: db.DatabaseA,
  modelName: 'AppGaInventarisLog',
  freezeTableName: true,
  tableName: 'tbl_gainventaris_log',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseA.config.database,
});

AppGaInventarisSell.init({
  id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true},
  kode_brg: {type: DataTypes.STRING(255), allowNull: false},
  last_data: {type: DataTypes.TEXT('long'), allowNull: false},
  logs: {type: DataTypes.TEXT('long'), allowNull: false},
  creator: {type: DataTypes.STRING(255), allowNull: false},
},{
  sequelize: db.DatabaseA,
  modelName: 'AppGaInventarisSell',
  freezeTableName: true,
  tableName: 'tbl_gainventaris_sell',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  schema: db.DatabaseA.config.database,
});

AppGaInventaris.afterCreate(async (data, options) => {
  try {
    const createdDataValues = data.toJSON()
    const logs = ['Register inventaris']
    await AppGaInventarisLog.create({
      gainventaris_id: createdDataValues.id,
      action: 1,
      n_status_id: createdDataValues.status_id,
      n_is_active: createdDataValues.is_active,
      creator: options.creator?.fname,
      logs: JSON.stringify(logs),
    },{ transaction: options.transaction })
  } catch (error) {
    console.log('Error afterCreate:',error)
    throw error
  }
});

AppGaInventaris.afterUpdate(async (data, options) => {
  try {
    const logs = []
    const statusProps = [{1: 'Stock', 2: 'Assign User', 3: 'Property', 4: 'Maintenance'}]
    const picProps = [{1: 'GA', 2: 'IT', 3: 'HSE' }]
    const oriDataValue = data._previousDataValues
    const updateDataValue = data.dataValues
    
    if(!data._options.isNewRecord){

      if(oriDataValue.status_id !== updateDataValue.status_id){
        logs.push(`Perubahan status ke ${statusProps[0][parseInt(updateDataValue.status_id)]}`)
        if(updateDataValue.status_id == 4) logs.push(`MTC_NOTE: ${updateDataValue.mtc_note}`)
      }
      if(oriDataValue.nama_brg.toLowerCase() !== updateDataValue.nama_brg.toLowerCase())logs.push(`Perubahan nama dari ${oriDataValue.nama_brg} ke ${updateDataValue.nama_brg.toUpperCase()}`)
      if(oriDataValue.tgl_beli !== updateDataValue.tgl_beli)logs.push(`Perubahan tgl pembelian dari ${oriDataValue.tgl_beli} ke ${updateDataValue.tgl_beli}`)
      if(oriDataValue.merk_id !== updateDataValue.merk_id) {
        const lastMerkData = await getMerk(oriDataValue.merk_id)
        const newMerkData = await getMerk(updateDataValue.merk_id)
        logs.push(`Perubahan merk dari ${lastMerkData.name} ke ${newMerkData.name}`)
      }
      if(oriDataValue.lokasi_id !== updateDataValue.lokasi_id){
        const lastLocData = await getLocation(oriDataValue.lokasi_id)
        const newLocData = await getLocation(updateDataValue.lokasi_id)
        logs.push(`Perubahan lokasi dari ${lastLocData.name} ke ${newLocData.name}`)
      }
      if(oriDataValue.pic_bagian_id !== updateDataValue.pic_bagian_id) logs.push(`Perubahan pic dari ${picProps[0][oriDataValue.pic_bagian_id]} ke ${picProps[0][updateDataValue.pic_bagian_id]}`)
      if(oriDataValue.is_active !== updateDataValue.is_active) {logs.push(`Status barang ${updateDataValue.is_active?'Aktif':'Tidak Aktif'}`)}
      if(oriDataValue.harga !== updateDataValue.harga){
        if(oriDataValue.harga == null && updateDataValue.harga != null) logs.push('Menambah harga')
        if(oriDataValue.harga != null && updateDataValue.harga != null) logs.push(`Merubah harga dari ${oriDataValue.harga} ke ${updateDataValue.harga}`)
        if(oriDataValue.harga != null && updateDataValue.harga == null) logs.push(`Menghapus harga dari ${oriDataValue.harga}`)
      }
      if(oriDataValue.toko?.toLowerCase() !== updateDataValue.toko?.toLowerCase()){
        if(oriDataValue.toko == null && updateDataValue.toko != null) logs.push('Menambah nama toko')
        if(oriDataValue.toko != null && updateDataValue.toko != null) logs.push(`Merubah nama toko dari ${oriDataValue.toko} ke ${updateDataValue.toko}`)
        if(oriDataValue.toko != null && updateDataValue.toko == null) logs.push(`Menghapus nama toko dari ${oriDataValue.toko}`)
      }
      if(oriDataValue.spesifikasi?.toLowerCase() !== updateDataValue.spesifikasi?.toLowerCase()){
        if(oriDataValue.spesifikasi == null && updateDataValue.spesifikasi != null) logs.push('Menambah spesifikasi')
        if(oriDataValue.spesifikasi != null && updateDataValue.spesifikasi != null) logs.push(`Merubah spec dari ${oriDataValue.spesifikasi} ke ${updateDataValue.spesifikasi}`)
        if(oriDataValue.spesifikasi != null && updateDataValue.spesifikasi == null) logs.push(`Spec ${oriDataValue.spesifikasi}. Dihapus`)
      }
      if(oriDataValue.serialnumber.toLowerCase() !== updateDataValue.serialnumber.toLowerCase()){
        if(oriDataValue.serialnumber == null && updateDataValue.serialnumber != null)logs.push('Menambah sn')
        if(oriDataValue.serialnumber != null && updateDataValue.serialnumber != null)logs.push(`Merubah sn dari ${oriDataValue.serialnumber} ke ${updateDataValue.serialnumber}`)
        if(oriDataValue.serialnumber != null && updateDataValue.serialnumber == null)logs.push(`SN ${oriDataValue.serialnumber}. Dihapus`)
      }
      if(oriDataValue.user_id_1 !== updateDataValue.user_id_1){
        if(oriDataValue.user_id_1 == null && updateDataValue.user_id_1 != null){
          const newUser = await getUser(updateDataValue.user_id_1)
          logs.push(`Menambah user ${newUser.fname}`)
        }
        if(oriDataValue.user_id_1 != null && updateDataValue.user_id_1 != null){
          const lastUser = await getUser(oriDataValue.user_id_1)
          const newUser = await getUser(updateDataValue.user_id_1)
          logs.push(`Merubah user dari ${lastUser.fname} ke ${newUser.fname}`)
        }
        if(oriDataValue.user_id_1 != null && updateDataValue.user_id_1 == null){
          const lastUser = await getUser(oriDataValue.user_id_1)
          logs.push(`Menghapus data dari ${lastUser.fname}`)
        }
      }
      if(oriDataValue.user_id_2 !== updateDataValue.user_id_2){
        if(oriDataValue.user_id_2 == null && updateDataValue.user_id_2 != null){
          const newUser = await getUser(updateDataValue.user_id_2)
          logs.push(`Menambah user ${newUser.fname}`)
        }
        if(oriDataValue.user_id_2 != null && updateDataValue.user_id_2 != null){
          const lastUser = await getUser(oriDataValue.user_id_2)
          const newUser = await getUser(updateDataValue.user_id_2)
          logs.push(`Merubah user dari ${lastUser.fname} ke ${newUser.fname}`)
        }
        if(oriDataValue.user_id_2 != null && updateDataValue.user_id_2 == null){
          const lastUser = await getUser(oriDataValue.user_id_2)
          logs.push(`Menghapus data dari ${lastUser.fname}`)
        }
      }
      if(oriDataValue.notes?.toLowerCase() !== updateDataValue.notes?.toLowerCase()){
        if(oriDataValue.notes == null && updateDataValue.notes != null) logs.push('Menambah Notes')
        if(oriDataValue.notes != null && updateDataValue.notes != null) logs.push(`Merubah Notes dari ${oriDataValue.notes}`)
        if(oriDataValue.notes != null && updateDataValue.notes == null) logs.push(`Note: ${oriDataValue.notes}. Dihapus`)
      }
    }

    if(logs.length > 0) {
      await AppGaInventarisLog.create({
        gainventaris_id: updateDataValue.id,
        action: 2,
        n_status_id: updateDataValue.status_id,
        n_is_active: updateDataValue.is_active,
        creator: options.creator?.fname,
        logs: JSON.stringify(logs),
      },{ transaction: options.transaction })
    }
  } catch (error) {
    console.log('Error afterUpdate:',error)
    throw error
  }
});

AppGaInventaris.afterDestroy(async (data, options) => {
  // const deleteDataValues = data.toJSON()
  try {
    const deleteDataValues = data.toJSON()
    const dataLogs = await AppGaInventarisLog.findAll({
      where: {gainventaris_id: deleteDataValues.id},
      order: [['id', 'DESC']]
    })
    await AppGaInventarisSell.create({
      kode_brg: deleteDataValues.kode_brg,
      last_data: JSON.stringify(deleteDataValues),
      logs: JSON.stringify(dataLogs),
      creator: options.creator?.fname,
    },{ transaction: options.transaction })
  } catch (error) {
    console.log('Error beforeDestroy:',error)
    throw error
  }
});

const getMerk = async (id) =>{ return await AppGaInvMerk.findOne({ where: {id: id} }) }
const getLocation = async (id) =>{ return await AppGaInvLocation.findOne({ where: {id: id} }) }
const getUser = async (user_id) =>{ return await db.DatabaseA.models.AppUser.findOne({ where: {user_id: user_id} }) }

db.DatabaseA.dialect.supports.schemas = true;