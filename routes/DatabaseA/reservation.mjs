import { Router } from 'express'
import checkToken from '@middlewares/routes/token.mjs'
import checkRoutePermission from '@middlewares/routes/permissions.mjs'

import {
  getReservationRooms, createReservationRoom, detailReservationRoom, updateReservationRoom,
  getAllRoom, createRoom, updateRoom,
  testReservation,
} from '@controllers/DatabaseA/reservation.mjs'

import { createReservationRoomValidator } from '@middlewares/validators/reservation.mjs'

const route = Router()

route.get('/rooms', checkToken, checkRoutePermission(['manage.all']), getReservationRooms);
route.post('/rooms', checkToken, checkRoutePermission(['manage.all']), createReservationRoomValidator, createReservationRoom);
route.get('/rooms/resources', checkToken, checkRoutePermission(['manage.all']), getAllRoom);
route.post('/rooms/resources', checkToken, checkRoutePermission(['manage.all']), createRoom);
route.put('/rooms/resources/:id', checkToken, checkRoutePermission(['manage.all']), updateRoom);
route.get('/rooms/:rsv_room_id', checkToken, checkRoutePermission(['manage.all']), detailReservationRoom);
route.put('/rooms/:rsv_room_id', checkToken, checkRoutePermission(['manage.all']), updateReservationRoom);

route.get('/test', checkToken, checkRoutePermission(['manage.all']), testReservation);

export default route;