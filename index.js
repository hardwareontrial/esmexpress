import 'dotenv/config.js'
import server from '@services/server.mjs'

import { initializeSocket } from '@sockets/index.mjs';

const port = process.env.APP_PORT || 3000
initializeSocket()

server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on 0.0.0.0:${port}`);
})