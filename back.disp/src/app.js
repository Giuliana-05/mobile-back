const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Importação de rota
const userRoutes = require('./routes/userRoutes');
const newsRoutes = require('./routes/newsRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes'); 

require('dotenv').config();
console.log("DATABASE_URL:", process.env.DATABASE_URL);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors()); 

app.use(express.json());

// Rotas Principais
app.use('/api/users', userRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/favorites', favoriteRoutes); 

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});