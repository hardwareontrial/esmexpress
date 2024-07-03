import ReservationServices from '@services/apps/reservation.mjs'

/** Room Resource Section */
const getReservationRooms = async (req, res) => {
  try {
    const reservations = await ReservationServices.getReservationRooms(req.userAuthenticated.user_id);
    res.status(200).send({success: true, data: reservations, message: 'Data Loaded.'});
  } catch (error) {
    res.status(500).send({success: false, data: null, message: error.message || error});
  }
};

const createReservationRoom = async (req, res) => {
  try {
    const creating = await ReservationServices.createReservationRoom({
      body: req.body,
    }, req.userAuthenticated.user_id);
    res.status(200).send({success: true, data: creating, message: 'Data Created.'});
  } catch (error) {
    res.status(500).send({success: false, data: null, message: error.message || error});
  }
};

const detailReservationRoom = async (req, res) => {
  try {
    const detail = await ReservationServices.detailReservationRoom({rsv_room_id: req.params.rsv_room_id}, req.userAuthenticated.user_id);
    res.status(200).send({success: true, data: detail, message: 'Data Found.'});
  } catch (error) {
    res.status(500).send({success: false, data: null, message: error.message || error});
  }
};

const updateReservationRoom = async (req, res) => {
  try {

    const updating = await ReservationServices.updateReservationRoom({
      rsv_room_id: req.params.rsv_room_id,
      body: req.body,
    }, req.userAuthenticated.user_id);
    res.status(200).send({success: true, data: updating, message: 'Data Updated.'});
  } catch (error) {
    res.status(500).send({success: false, data: null, message: error.message || error});
  }
};
/** End Room Resource Section */

/** Room Resource Section */
const getAllRoom = async (req, res) => {
  try {
    const rooms = await ReservationServices.getRooms(req.userAuthenticated.user_id);
    res.status(200).send({success: true, data: rooms, message: 'Data Loaded.'});
  } catch (error) {
    res.status(500).send({success: false, data: null, message: error.message || error});
  }
};

const createRoom = async (req, res) => {
  try {
    const creating = await ReservationServices.createRoom({
      body: req.body,
    }, req.userAuthenticated.user_id);
    res.status(200).send({success: true, data: creating, message: 'Data Created.'});
  } catch (error) {
    res.status(500).send({success: false, data: null, message: error.message || error});
  }
};

const updateRoom = async (req, res) => {
  try {
    const updating = await ReservationServices.updateRoom({
      body: req.body,
      id: req.params.id,
    }, req.userAuthenticated.user_id);
    res.status(200).send({success: true, data: updating, message: 'Data Updated.'});
  } catch (error) {
    res.status(500).send({success: false, data: null, message: error.message || error});
  }
};


const testReservation = async (req, res) => {
  // const result = await ReservationServices.numberReservation();
  // const result = await ReservationServices.create({type: 'number'});
  const result = await ReservationServices.delete({rsv_id: 1});
  res.send(result)
}

export {
  getReservationRooms, createReservationRoom, detailReservationRoom, updateReservationRoom,
  getAllRoom, createRoom, updateRoom,
  testReservation
}