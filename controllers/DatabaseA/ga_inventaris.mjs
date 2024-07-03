import GaInventarisService from '@services/apps/ga_inventaris.mjs'
import { sendEmit } from '@sockets/index.mjs';

const getData = async (req, res) => {
  try {
    const items = await GaInventarisService.getDataAll()
    res.status(200).send({success: true, message: 'Data Loaded!', data: items})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to loading data!', data: error.message || error})
  }
};

const getDataPaginate = async (req, res) => {
  try {
    const items = await GaInventarisService.getDataPaginate(req.query.currentPage, req.query.limit, req.query.search)
    res.status(200).send({success: true, message: 'Data Loaded!', data: items})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to loading data!', data: error.message || error})
  }
};

const createData = async (req, res) => {
  try {
    const creating = await GaInventarisService.create(req.body, req.userAuthenticated.user_id)
    const stringData = JSON.stringify(creating)
    sendEmit('auth:gainventaris:created', stringData)
    sendEmit(`auth:gainventaris:created:${creating.kode_brg.replace(/\s+/g, '')}`, `${creating.kode_brg}`)
    res.status(200).send({success: true, message: 'Inventaris Created', data: creating})
  } catch (error) {
    console.log(error)
    res.status(500).send({success: false, message: 'Error on creating Inventaris', data: error.message || error})
  }
};

const detailData = async (req, res) => {
  try {
    const item = await GaInventarisService.detail(req.params.id)
    res.status(200).send({success: true, message: 'Data loaded!', data: item})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to loading data!', data: error.message || error})
  }
};

const updateData = async (req, res) => {
  try {
    const updated = await GaInventarisService.update(
      {id: req.params.id, body: req.body, keyword: req.query.updateKeyword},
      req.userAuthenticated.user_id
    )
    sendEmit('auth:gainventaris:updated', `${req.body.form.kode_brg}`)
    sendEmit(`auth:gainventaris:updated:${req.body.form.kode_brg.replace(/\s+/g, '')}`, `${req.body.form.kode_brg}`)
    res.status(200).send({success: true, message: 'Data updated!', data: updated})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to updating data!', data: error.message || error})
  }
};

const deleteData = async (req, res) => {
  try {
    const kodeBarang = req.query.kode_brg
    const deleted = await GaInventarisService.delete(req.params.id, req.userAuthenticated.user_id)
    sendEmit('auth:gainventaris:deleted', `${kodeBarang}`)
    sendEmit(`auth:gainventaris:deleted:${kodeBarang.replace(/\s+/g, '')}`, `${kodeBarang}`)
    res.status(200).send({success: true, message: 'Data deleted!', data: deleted})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to deleting data!', data: error.message || error})
  }
};

const getMerk = async (req, res) => {
  try {
    const items = await GaInventarisService.misc(
      { keyword: 'get-merk' },
      req.userAuthenticated.user_id,
    )
    res.status(200).send({success: true, message: 'Merk Loaded!', data: items})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to loading merk!', data: error.message || error})
  }
};

const addMerk = async (req, res) => {
  try {
    const create = await GaInventarisService.misc(
      { keyword: 'create-merk', body: req.body },
      req.userAuthenticated.user_id,
    )
    sendEmit('auth:gainventaris:merk-created', create)
    res.status(200).send({success: true, message: 'Merk Added!', data: create})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed on adding merk!', data: error.message || error})
  }
};

const getLocation = async (req, res) => {
  try {
    const items = await GaInventarisService.misc(
      { keyword: 'get-location' },
      req.userAuthenticated.user_id,
    )
    res.status(200).send({success: true, message: 'Location Loaded!', data: items})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed to loading location!', data: error.message || error})
  }
};

const addLocation = async (req, res) => {
  try {
    const create = await GaInventarisService.misc(
      { keyword: 'create-location', body: req.body },
      req.userAuthenticated.user_id,
    )
    sendEmit('auth:gainventaris:location-created', create)
    res.status(200).send({success: true, message: 'Location added!', data: create})
  } catch (error) {
    res.status(500).send({success: false, message: 'Failed on adding location!', data: error.message || error})
  }
};

export {
  getMerk, addMerk, getLocation, addLocation,
  createData, updateData, deleteData, getData, getDataPaginate, detailData,
}