import http from 'http'
import https from 'https';
import fs from 'fs';
import app from '@services/express.mjs'
import path from 'path';

let privateKey = fs.readFileSync(path.join(path.resolve(), '/public/certificates/development.key'), 'utf8');
let certificate = fs.readFileSync(path.join(path.resolve(), '/public/certificates/development.crt'), 'utf8');
if(process.env.NODE_ENV === 'production') {
  privateKey = fs.readFileSync(path.join(path.resolve(), '/public/certificates/server.key'), 'utf8');
  certificate = fs.readFileSync(path.join(path.resolve(), '/public/certificates/server.crt'), 'utf8');
}
const credentials = { key: privateKey, cert: certificate }

// const server = http.createServer(app)
const server = https.createServer(credentials, app);

export default server