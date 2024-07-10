import Sequelize from 'sequelize'
import fs from 'fs'
import path from 'path'
import dbconfig from '@configs/dbConfig.mjs'

const databases = Object.keys(dbconfig.databases);
const sequelize = {};

for (let i=0; i < databases.length; ++i){
  const dbName = databases[i];
  const dbPath = dbconfig.databases[dbName];
  sequelize[dbName] = new Sequelize({
    database: dbPath.database,
    username: dbPath.username,
    password: dbPath.password,
    dialect: dbPath.dialect,
    host: dbPath.host,
    port: dbPath.port,
    dialect: dbPath.dialect,
    timezone: dbPath.timezone,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
}

// sequelize['DatabaseA'].sync({force: false});
// sequelize['DatabaseA'].sync();
sequelize.Sequelize = Sequelize;

export default sequelize