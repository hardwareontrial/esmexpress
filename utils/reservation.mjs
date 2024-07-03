import moment from 'moment'

export function splitRoomReservation(start_time, end_time) {
  const reservations = []
  let currentStartTime = moment(start_time)
  const endTime = moment(end_time)

  while(currentStartTime.isBefore(endTime)) {
    if(currentStartTime.day() === 0 || currentStartTime.day() === 6) {
      currentStartTime = currentStartTime.add(1, 'day').hour(7).minute(0).second(0);
      continue;
    }

    let currentEndTime = currentStartTime.clone().endOf('day').hour(16).minute(0).second(0);

    if(currentEndTime.isAfter(endTime)) {
      currentEndTime = endTime
    }

    reservations.push({start_time: currentStartTime.format('YYYY-MM-DD HH:mm'), end_time: currentEndTime.format('YYYY-MM-DD HH:mm')});
    currentStartTime = currentStartTime.add(1, 'day').hour(7).minute(0).second(0);
  }
  return reservations
};