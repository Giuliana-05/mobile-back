const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendResetEmail } = require('../utils/email');
require('dotenv').config();

const SALT_ROUNDS = 10;
const TOKEN_EXP_HOURS = 1;

function generateToken(user) {
  return jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

async function register(req, res) {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email e password obrigatórios' });
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: 'Usuário já existe' });
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({ data: { email, password: hashed, name } });
  const token = generateToken(user);
  res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email e password obrigatórios' });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' });
  const token = generateToken(user);
  res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
}

async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email obrigatório' });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(200).json({ message: 'Se o e-mail existir, um link de reset será enviado.' }); // não vaza info
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + TOKEN_EXP_HOURS * 60 * 60 * 1000);
  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt }
  });
  // Tente enviar por e-mail; se não houver SMTP configurado, retornamos o token (útil para desenvolvimento)
  try {
    if (process.env.SMTP_HOST) {
      await sendResetEmail(email, token);
      return res.json({ message: 'Email de redefinição enviado (se o e-mail existir).' });
    } else {
      // DEBUG / DEV: retorna token
      return res.json({ message: 'Token gerado (dev).', token });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao enviar e-mail', details: err.message });
  }
}

async function resetPassword(req, res) {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: 'token e newPassword obrigatórios' });
  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record) return res.status(400).json({ error: 'Token inválido' });
  if (record.used) return res.status(400).json({ error: 'Token já usado' });
  if (record.expiresAt < new Date()) return res.status(400).json({ error: 'Token expirado' });
  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: record.userId }, data: { password: hashed } });
  await prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true } });
  res.json({ message: 'Senha redefinida com sucesso' });
}

module.exports = { register, login, forgotPassword, resetPassword };
