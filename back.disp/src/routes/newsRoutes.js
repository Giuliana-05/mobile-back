// Arquivo: src/routes/newsRoutes.js

const express = require('express');
const router = express.Router();

// 1. Importa as funções que realmente existem no newsController.js
// listNews e search são as funções para o Front End.
const {
    listNews,   
    search,
} = require('../controllers/newsController'); 

// Rotas públicas (não precisam de login)

// ROTA: GET /api/news (Lista todas as notícias)
router.get('/', listNews); 

// ROTA: GET /api/news/search?q=termo (Busca)
router.get('/search', search);

// Rotas de administração (Comentadas para evitar o erro 'handler must be a function', 
// já que as funções 'create' e 'delete' não foram implementadas no newsController.js)

// router.post('/', auth, controller.create);
//router.delete('/:id', auth, controller.delete);

module.exports = router;