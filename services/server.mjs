import http from 'http'
import app from '@services/express.mjs'

const server = http.createServer(app)

export default server