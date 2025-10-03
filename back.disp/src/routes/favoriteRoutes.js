// Arquivo: src/routes/favoriteRoutes.js

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth'); // Importa o seu middleware

const {
    getFavorites,
    addFavorite,
    removeFavorite
} = require('../controllers/newsController'); // Lógica está no newsController

// ROTA: GET /api/favorites (Listar Favoritos do Usuário)
router.get('/', verifyToken, getFavorites);

// ROTA: POST /api/favorites (Adicionar Notícia aos Favoritos)
router.post('/', verifyToken, addFavorite);

// ROTA: DELETE /api/favorites/:newsId (Remover Favorito)
router.delete('/:newsId', verifyToken, removeFavorite);

module.exports = router;