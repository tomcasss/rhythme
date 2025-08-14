// Cargar variables de entorno PRIMERO
import './config/env.js';

import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import http from 'http';
import { setupSocket } from './socket.js';
import { dbConnect } from './dbConnect/dbConnect.js';
import routes from './routes/routes.js';

const app = express();


app.use(helmet());
app.use(morgan('common'));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const server = http.createServer(app);
const io = setupSocket(server);
app.set("io", io);

app.use('/', routes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  dbConnect();
});