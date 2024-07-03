import db from '@services/orm/index.mjs'
import { Op } from 'sequelize'
import moment from 'moment';
import UserService from '@services/apps/user.mjs'
import { splitRoomReservation } from '@utils/reservation.mjs'

const AppUser = db.DatabaseA.models.AppUser
const RoomResources = db.DatabaseA.models.RoomResources
const ReservationRoom = db.DatabaseA.models.ReservationRoom
const ReservationLog = db.DatabaseA.models.ReservationLog
const Reservations = db.DatabaseA.models.Reservations

class ReservationServices {
  constructor() {}

  /** Reservations */
  async getReservations(authUserId) {
    try {
      const data = await Reservations.findAll({
        include: [
          {
            model: ReservationRoom,
            as: 'details',
            include: [
              {model: Reservations, as: 'reservationData'},
              {model: RoomResources, as: 'room'},
              {model: AppUser, as: 'creatorData'},
            ],
          },
          {model: ReservationLog, as: 'logs'},
        ],
      });
      return data
    } catch (error) {
      throw error
    }
  };

  async createReservation(payload, authUserId) {
    let createReservation;
    try {
      const authUser = await UserService.detailById(authUserId);
      createReservation = await db.DatabaseA.transaction();

      const number = await this.numberReservation()
      const newData = await Reservations.create({
        number: number,
        type: payload.type,
      },{ transaction: createReservation });

      await createReservation.commit();
      
      const logging = this.logging({rsv_id: newData.rsv_id, creator: authUser.fname, description: `Nomor reservasi ${newData.number} dibuat.`})

      return newData
    } catch (error) {
      if(createReservation){ await createReservation.rollback() }
      throw error
    }
  };

  async deleteReservation(payload, authUserId) {
    let deleteReservation;
    try {
      const data = await Reservations.findOne({
        where: { rsv_id: payload.rsv_id },
      });

      deleteReservation = await db.DatabaseA.transaction();
      await data.destroy({transaction: deleteReservation})
      await deleteReservation.commit()

      return true
    } catch (error) {
      if(deleteReservation) { await deleteReservation.rollback() }
      throw error
    }
  };

  async detailReservation(payload, authUserId) {
    try {
      const detail = await Reservations.findOne({
        where: {rsv_id: payload.rsv_id},
        include: [
          {
            model: ReservationRoom,
            as: 'details',
            include: [
              {model: Reservations, as: 'reservationData'},
              {model: RoomResources, as: 'room'},
              {model: AppUser, as: 'creatorData'},
            ],
          },
          {model: ReservationLog, as: 'logs'},
        ]
      })
      return detail
    } catch (error) {
      throw error
    }
  };

  async logging(payload, authUserId) { // payload: {rsv_id: null, creator: '', description: ''}
    let createRoomLog;
    try {
      createRoomLog = await db.DatabaseA.transaction();

      const newLog = await ReservationLog.create({
        rsv_id: payload.rsv_id,
        created_by: payload.creator,
        description: payload.description,
      },{transaction: createRoomLog});
      
      await createRoomLog.commit()

      return newLog;
    } catch (error) {
      if(createRoomLog) { await createRoomLog.rollback() }
      throw error
    }
  };
  /** End Reservations */

  /** Reservation Room */
  async getReservationRooms(authUserId) {
    try {
      const reservations = await ReservationRoom.findAll({
        include: [
          {model: Reservations, as: 'reservationData', include: [{model: ReservationLog, as: 'logs'}]},
          {model: RoomResources, as: 'room'},
          {model: AppUser, as: 'creatorData'},
        ],
      });
      return reservations
    } catch (error) {
      throw error
    }
  };

  async createReservationRoom(payload, authUserId) {
    let createReservationRoomTrx, reservation;
    try {
      const {rsv_room_id, rsv_id, title, status, start_time, end_time, room_id, creator_id, notes} = payload.body;
      const authUser = await UserService.detailById(authUserId);
      
      const reservationSegment = splitRoomReservation(start_time, end_time);
      createReservationRoomTrx = await db.DatabaseA.transaction();
      
      /** Registering number reservation */
      reservation = await this.createReservation({type: 'room'}, authUserId);
      
      /** Create Reservation */
      await Promise.all(reservationSegment.map(async (dateReservation) => {
        await ReservationRoom.create({
          rsv_id: reservation.rsv_id,
          title: title.toUpperCase(),
          start_time: dateReservation.start_time,
          end_time: dateReservation.end_time,
          room_id: room_id,
          status: status,
          notes: notes,
          creator_id: authUserId,
        });
      }));

      await createReservationRoomTrx.commit();

      const description = `Reservasi Ruangan untuk tanggal/jam ${reservationSegment.map(item => `${item.start_time} -- ${item.end_time}`).join(' ,')} berhasil dibuat.`
      const logging = this.logging({rsv_id: reservation.rsv_id, creator: authUser.fname, description: description})

      const created = await this.detailReservation({rsv_id: reservation.rsv_id})
      return created;
    } catch (error) {
      if(createReservationRoomTrx) { await createReservationRoomTrx.rollback() }
      await this.deleteReservation({rsv_id: reservation.rsv_id})
      throw error
    }
  };

  async updateReservationRoom(payload, authUserId) {
    let updateReservationRoomTrx;
    try {
      const {rsv_room_id, rsv_id, title, status, start_time, end_time, room_id, creator_id, notes} = payload.body;
      const detail = await this.detailReservationRoom({rsv_room_id: rsv_room_id});
      const authUser = await UserService.detailById(authUserId);
      
      updateReservationRoomTrx = await db.DatabaseA.transaction();

      /** Update Reservation */
      const roomReservation = await ReservationRoom.update({
        rsv_id: rsv_id,
        title: title.toUpperCase(),
        start_time: start_time,
        end_time: end_time,
        room_id: room_id,
        status: status,
        notes: notes,
        creator_id: creator_id,
      },{
        where: { rsv_room_id: rsv_room_id },
        transaction: updateReservationRoomTrx,
      });

      await updateReservationRoomTrx.commit();

      const description = status === 'cancelled' ? `Pembatalan pesanan untuk ${detail.reservationData.number} ID_${rsv_room_id}.` : `Perubahan data untuk ${detail.reservationData.number} ID_${rsv_room_id}.`
      const logging = this.logging({rsv_id: rsv_id, creator: authUser.fname, description: description})

      const updated = await this.detailReservationRoom({rsv_room_id: rsv_room_id});
      return updated;
    } catch (error) {
      if(updateReservationRoomTrx) { await updateReservationRoomTrx.rollback() }
      throw error
    }
  };

  async detailReservationRoom(payload, authUserId) {
    try {
      const detail = await ReservationRoom.findOne({
        where: { rsv_room_id: payload.rsv_room_id },
        include: [
          {model: Reservations, as: 'reservationData', include: [{model: ReservationLog, as: 'logs'}]},
          {model: RoomResources, as: 'room'},
          {model: AppUser, as: 'creatorData'},
        ],
      });
      return detail
    } catch (error) {
      throw error
    }
  };
  /** End Reservation Room */

  /** Room Resource */
  async getRooms(authUserId) {
    try {
      const rooms = await RoomResources.findAll();
      console.log(rooms)
      return rooms
    } catch (error) {
      throw error
    }
  };

  async createRoom(payload, authUserId) {
    let createRoomTrx;
    try {
      const { id, name, isActive } = payload.body

      createRoomTrx = await db.DatabaseA.transaction();
      const newRoom = await RoomResources.create({
        name: name.toUpperCase(),
        is_active: isActive,
      },{transaction: createRoomTrx});
      await createRoomTrx.commit();

      return newRoom;
    } catch (error) {
      if(createRoomTrx) { await createRoomTrx.rollback() }
      throw error
    }
  };

  async updateRoom(payload, authUserId) {
    let updateRoomTrx;
    try {
      const { id, name, isActive } = payload.body;
      
      updateRoomTrx = await db.DatabaseA.transaction();
      const updateRoom = await RoomResources.update({
        name: name.toUpperCase(),
        is_active: isActive,
      },{
        where: { id: id },
        transaction: updateRoomTrx
      });
      await updateRoomTrx.commit();

      const updated = await this.detailRoom({id: id})
      return updated;
    } catch (error) {
      if(updateRoomTrx) { await updateRoomTrx.rollback() }
      throw error
    }
  };

  async detailRoom(payload, authUserId) {
    try {
      const detail = await RoomResources.findOne({
        where: {id: payload.id},
      });
      return detail
    } catch (error) {
      throw error
    }
  };
  /** End Room Resource */

  /** Reservation Number Letter */
  async createNumberReservation(payload, authUserId) {};
  /** End Reservation Number Letter */

  /** Misc */
  async numberReservation() {
    try {
      const base = moment().format('YYYYMMDD')
      const lastEntry = await Reservations.findOne({
        where: {
          number: { [Op.like]: `%${base}%`},
        },
        sort: [['rsv_id', 'ASC']]
      });
      if(!lastEntry) { return `${base}001` }
      else {
        const dateString = lastEntry.number.slice(0, 8)
        const codeString = lastEntry.number.slice(8)
        let code = parseInt(codeString, 10)
        code++
        const newCodeString = String(code).padStart(3, '0')
        return `${dateString}${newCodeString}`
      }
    } catch (error) {
      throw error      
    }
  };
  /** End Misc */
}

export default new ReservationServices()