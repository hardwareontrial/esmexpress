import moment from 'moment';
import ReservationServices from '@services/apps/reservation.mjs';

const createReservationRoomValidator = async (req, res, next) => {
  const {rsv_room_id, rsv_id, title, status, start_time, end_time, room_id, creator_id, notes} = req.body;
  const errors = [];

  if(!title) { errors.push('Title cannot be null.') }
  if(!status) { errors.push('Please select status.') }
  if(!start_time) { errors.push('Please input start date time.') }
  if(!end_time) { errors.push('Please input end date time.') }
  if(!room_id) { errors.push('Please choose room id for this reservation.') }

  if(start_time && end_time) {
    const start = moment(start_time, 'YYYY-MM-DD HH:mm')
    const end = moment(end_time, 'YYYY-MM-DD HH:mm')
    const startHour = start.hour()
    const endHour = end.hour()

    if(!end.isAfter(start)) {errors.push('End date time must be greater than start date time.')}
    if(startHour < 7) {errors.push('Start time at least 07.00.')}
    if(endHour > 16) {errors.push('End time must be at most 16.00.')}
  }

  const hasReservation = await findMatchReservations(room_id, start_time, end_time);
  if(hasReservation.length > 0) { errors.push('Room you are selected with start datetime / end datetime already booked.') }

  if(errors.length !== 0){ return res.status(422).send({success: false, message: 'Unprocessable Entity', data: errors}) }
  else { next(); }
};

const findMatchReservations = async (roomId, startTime, endTime) => {
  const reservations = await ReservationServices.getReservationRooms();
  const inputStart = moment(startTime, 'YYYY-MM-DD HH:mm')
  const inputEnd = moment(endTime, 'YYYY-MM-DD HH:mm')

  return reservations.filter(reservation => {
    const reservationStart = moment(reservation.start_time, 'YYYY-MM-DD HH:mm')
    const reservationEnd = moment(reservation.end_time, 'YYYY-MM-DD HH:mm')
    const roomIdMatch = reservation.room_id === roomId
    const timeMatch = (
      inputStart.isBetween(reservationStart, reservationEnd, null, '[)') ||
      inputEnd.isBetween(reservationStart, reservationEnd, null, '[)') ||
      inputStart.isSame(reservationStart) ||
      inputEnd.isSame(reservationEnd));
    return roomIdMatch && timeMatch
  })
};

export {
  createReservationRoomValidator,
}