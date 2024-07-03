import { Model, DataTypes } from 'sequelize'
import db from '@services/orm/sequelize.mjs'

class Reservations extends Model {};
class ReservationLog extends Model {};
class ReservationRoom extends Model {};
class ReservationNumberLetter extends Model {};
class RoomResources extends Model {};

RoomResources.init({
  id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false, autoIncrement: true, primaryKey: true},
  name: {type: DataTypes.STRING(), allowNull: false},
  is_active: {type: DataTypes.TINYINT(1), allowNull: false},
},{
  sequelize: db.DatabaseA,
  modelName: 'RoomResources',
  freezeTableName: true,
  tableName: 'tbl_reservation_room_resource',
  timestamps: false,
  underscored: false,
  schema: db.DatabaseA.config.database,
});

ReservationRoom.init({
  rsv_room_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false, autoIncrement: true, primaryKey: true},
  rsv_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false},
  title: {type: DataTypes.STRING(), allowNull: false},
  start_time: {type: DataTypes.STRING(), allowNull: false},
  end_time: {type: DataTypes.STRING(), allowNull: false},
  room_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false},
  status: {type: DataTypes.STRING(10), allowNull: false, comment: 'reserved, moved, cancelled'},
  notes: {type: DataTypes.TEXT('medium'), allowNull: true},
  creator_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false},
},{
  sequelize: db.DatabaseA,
  modelName: 'ReservationRoom',
  freezeTableName: true,
  tableName: 'tbl_reservation_room',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  underscored: false,
  paranoid: false,
  schema: db.DatabaseA.config.database,
});

Reservations.init({
  rsv_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false, autoIncrement: true, primaryKey: true},
  number: {type: DataTypes.STRING(), allowNull: false},
  type: {type: DataTypes.STRING(10), allowNull: false, comment: 'room, number-letter'},
},{
  sequelize: db.DatabaseA,
  modelName: 'Reservations',
  freezeTableName: true,
  tableName: 'tbl_reservation',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  underscored: false,
  paranoid: false,
  schema: db.DatabaseA.config.database,
});

ReservationLog.init({
  id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false, autoIncrement: true, primaryKey: true},
  rsv_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false},
  created_by: {type: DataTypes.STRING(), allowNull: false},
  description: {type: DataTypes.TEXT('tiny'), allowNull: false},
},{
  sequelize: db.DatabaseA,
  modelName: 'ReservationLog',
  freezeTableName: true,
  tableName: 'tbl_reservation_log',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  underscored: false,
  paranoid: false,
  schema: db.DatabaseA.config.database,
});

db.DatabaseA.dialect.supports.schemas = true;