import db from '@services/orm/index.mjs'

const dbValidator = (dbName) => {
  const DBKey = db[dbName]
  return async function (req, res, next) {
    try {
      await DBKey.authenticate();
      console.log('Database connection successfull.');
      return next();
    } catch (error) {
      console.error('Unable to connect to the database:', error);
      const err = []
      err.push(`Error Code: ${error.original.code}`)
      err.push(`Error No: ${error.original.errno}`)
      err.push(`SQL State: ${error.original.sqlState}`)
      err.push(`SQL Msg: ${error.original.sqlMessage}`)
      return res.status(500).json({success: false, message: 'Unable to connect to the database', data: err});
    }
  }
}

export default dbValidator