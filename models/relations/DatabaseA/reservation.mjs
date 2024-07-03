import db from '@services/orm/sequelize.mjs'
const { AppUser, RoomResources, ReservationRoom, ReservationLog, Reservations } = db.DatabaseA.models;

Reservations.hasMany(ReservationRoom, {
  as: 'details',
  sourceKey: 'rsv_id',
  foreignKey: 'rsv_id',
});

Reservations.hasMany(ReservationLog, {
  as: 'logs',
  sourceKey: 'rsv_id',
  foreignKey: 'rsv_id',
});

ReservationRoom.belongsTo(Reservations, {
  as: 'reservationData',
  targetKey: 'rsv_id',
  foreignKey: 'rsv_id'
});

ReservationRoom.belongsTo(RoomResources, {
  as: 'room',
  targetKey: 'id',
  foreignKey: 'room_id',
});

ReservationRoom.belongsTo(AppUser, {
  as: 'creatorData',
  targetKey: 'user_id',
  foreignKey: 'creator_id',
});

RoomResources.hasMany(ReservationRoom, {
  as: 'roomReservations',
  sourceKey: 'id',
  foreignKey: 'room_id',
});