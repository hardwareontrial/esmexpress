import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import path from 'path'

import '@services/orm/index.mjs'
// import '@services/scheduler.mjs'
import route from '@routes/index.mjs'

const app = express()

app.use(cors({
  origin: "*",
  exposedHeaders: ['Content-Disposition'],
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/public/', express.static(path.resolve('public')));
app.use('/v1/api/', route);
app.all('*', (req, res) => { res.status(404).json({message: 'Page Not Found!'}) });

export default app