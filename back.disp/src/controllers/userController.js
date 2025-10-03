// Este é o SEU código com a função login alterada:

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_aqui';

// Lógica de Cadastro (Registro) - Nenhuma alteração aqui
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: 'Email já cadastrado.' });
        }

        const hash = await bcrypt.hash(password, 8);
        
        const user = await prisma.user.create({ 
            data: { name, email, password: hash } 
        });

        const token = jwt.sign(
            { id: user.id },
            JWT_SECRET, 
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        const { password: _, ...userData } = user;
        
        res.status(201).json({ user: userData, token });
    } catch (err) {
        console.error("Erro CRÍTICO no Registro:", err);
        res.status(500).json({ error: "Erro interno do servidor ao tentar cadastrar. Verifique o console do servidor." });
    }
};

// Lógica de Login - COM ALTERAÇÃO TEMPORÁRIA
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const isMatch = await bcrypt.compare(password, user.password); // retorna true ou false
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const token = jwt.sign(
            { id: user.id },
            JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        const { password: _, ...userData } = user;
        res.json({ user: userData, token });

    } catch (err) {
        console.error("Erro no Login:", err);
        res.status(500).json({ error: 'Erro interno do servidor durante o login.' });
    }
};
