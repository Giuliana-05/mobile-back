// Arquivo: src/middlewares/auth.js

const jwt = require('jsonwebtoken');

// Middleware para verificar o token JWT
const verifyToken = (req, res, next) => {
    // O token é esperado no formato "Bearer [token]"
    // Usa 'authorization' em minúsculo, que é o padrão do Express/Node
    const authHeader = req.headers['authorization']; 
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    // Use a variável de ambiente para a chave secreta
    const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_aqui';

    try {
        // Verifica o token e decodifica a carga útil (payload)
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Adiciona o ID do usuário (usando 'userId' que foi salvo no token) ao objeto de requisição
        req.userId = decoded.userId; // CORREÇÃO APLICADA
        
        next();
    } catch (err) {
        // Token inválido ou expirado
        return res.status(403).json({ error: 'Token inválido ou expirado.' });
    }
};

module.exports = { verifyToken };