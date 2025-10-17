const prisma = require('../prismaClient');

async function getProfile(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, name: true, bio: true, createdAt: true, updatedAt: true }
  });
  res.json({ user });
}

async function editProfile(req, res) {
  const { name, bio } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { name, bio }
  });
  res.json({ user: { id: user.id, email: user.email, name: user.name, bio: user.bio } });
}

module.exports = { getProfile, editProfile };
