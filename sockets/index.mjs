import { Server } from 'socket.io'
import server from '@services/server.mjs'
import UserService from '@services/apps/user.mjs'

let io;
const userConnections = []
const authUserConnections = [];

const initializeSocket = () => {
  io = new Server(server);
  io.on('connection', async (socket) => {
    console.log(socket.id)
    addUserConnection(socket.id)

    socket.on('userLoggedIn', async (data) => {
      // console.log(data)
      try {
        const parsedData = JSON.parse(data)
        toAuthUserConnections(parsedData)
        const getUserDataById = await getUserData(parsedData.userId)
        sendEmitToSocketId(parsedData.socketId, 'isLoggedIn', {
          success: true,
          message: 'isLoggedIn',
          data: getUserDataById
        })
      } catch (e) {
        console.log(`Cannot emitting 'isLoggedIn' caused: ${e}`)
      }
    })

    socket.on('userLoggedOut', (data) => {
      // console.log(data)
      const parsedData = JSON.parse(data)
      const socketIds = getAuthUserConnectionsByUserIDToken(parsedData.userId, parsedData.token)
      socketIds.forEach(item => {
        console.log(item)
        sendEmitToSocketId(item, 'isLoggedOut', {
          success: true,
          message: 'isLoggedOut',
          data: null,
        })
        toUserConnections(item)
      })
    })

    socket.on('disconnect', () => {
      const indexInUserConnections = userConnections.indexOf(socket.id)
      if (indexInUserConnections !== -1 ) {
        userConnections.splice(indexInUserConnections, 1)
      } else {
        const indexInAuthUserConnections = authUserConnections.findIndex((conn) => conn.socketId === socket.id)
        if (indexInAuthUserConnections !== -1) {
          authUserConnections.splice(indexInAuthUserConnections, 1);
        }
      }
      console.log(`socketId ${socket.id} disconnect`)
    })
  })
};

const addUserConnection = (socketId) => {
  return userConnections.push(socketId)
};

const getUserConnections= () => {
  return userConnections
};

const getAuthUserConnections = () => {
  return authUserConnections
};

const getAuthUserConnectionsByUserId = (userId) => {
  return authUserConnections.filter(conn => conn.userId === userId).map(conn => conn.socketId)
};

const getAuthUserConnectionsByUserIDToken = (userId, token) => {
  return authUserConnections
    .filter(conn => conn.userId === userId && conn.token === token)
    .map(conn => conn.socketId)
};

const toAuthUserConnections = (data) => {
  const index = userConnections.indexOf(data.socketId)
  if (index !== -1) {
    userConnections.splice(index, 1)
    authUserConnections.push(data)
  }
};

const toUserConnections = (socketId) => {
  const index = authUserConnections.findIndex((conn) => conn.socketId === socketId)
  if (index !== -1) {
    authUserConnections.splice(index, 1)
    userConnections.push(socketId)
  }
};

const sendEmitToSocketId = (socketId, eventName, eventData) => {
  io.to(socketId).emit(eventName, eventData)
};

const sendEmit = (eventName, eventData) => {
  io.emit(eventName, eventData)
};

const getUserData = async (userId) => {
  const detail =  await UserService.detailById(userId)
  return detail
};

export {
  initializeSocket,
  addUserConnection,
  getUserConnections,
  getAuthUserConnections,
  getAuthUserConnectionsByUserId,
  getAuthUserConnectionsByUserIDToken,
  toAuthUserConnections,
  toUserConnections,
  sendEmitToSocketId,
  sendEmit,
}