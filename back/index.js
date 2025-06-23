const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB')) //cuando se tenga la bd se usa esta connection
  .catch(err => console.error(err));

app.get('/', (req, res) => {
  res.send('API funcionando');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend en puerto ${PORT}`);
});
