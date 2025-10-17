require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes');
const prisma = require('./prismaClient');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api', routes);

app.get('/', (req, res) => res.send('API rodando'));

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server rodando na porta ${port}`);
});


