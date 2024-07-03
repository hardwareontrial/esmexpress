export default {
  'databases': {
    'DatabaseA': {
      'database': process.env.DB_DATABASE_A,
      'username': process.env.DB_USERNAME_A,
      'password': process.env.DB_PASSWORD_A,
      'host': process.env.DB_HOST_A,
      'port': process.env.DB_PORT_A,
      'dialect': process.env.DB_DRIVER_A,
      'timezone': '+07:00'
    },
    'DatabaseB': {
      'database': process.env.DB_DATABASE_B,
      'username': process.env.DB_USERNAME_B,
      'password': process.env.DB_PASSWORD_B,
      'host': process.env.DB_HOST_B,
      'port': process.env.DB_PORT_B,
      'dialect': process.env.DB_DRIVER_B,
      'timezone': '+07:00'
    },
    'DatabaseC': {
      'database': process.env.DB_DATABASE_C,
      'username': process.env.DB_USERNAME_C,
      'password': process.env.DB_PASSWORD_C,
      'host': process.env.DB_HOST_C,
      'port': process.env.DB_PORT_C,
      'dialect': process.env.DB_DRIVER_C,
      'timezone': '+07:00'
    },
  }
}