const prisma = require('../prismaClient');

async function listFavorites(req, res) {
  const favs = await prisma.favorite.findMany({
    where: { userId: req.user.id },
    include: { news: { select: { id: true, title: true, summary: true, content: true, imageUrl: true, publishedAt: true } } }
  });

  // Retorna somente as notícias em um array
  const newsList = favs.map(f => f.news);
  res.json({ favorites: newsList });
}

async function toggleFavorite(req, res) {
  const newsId = parseInt(req.params.newsId, 10);
  if (Number.isNaN(newsId)) return res.status(400).json({ error: 'newsId inválido' });

  const existing = await prisma.favorite.findUnique({ where: { userId_newsId: { userId: req.user.id, newsId } } });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return res.json({ message: 'Removido dos favoritos' });
  } else {
    await prisma.favorite.create({ data: { userId: req.user.id, newsId } });
    return res.json({ message: 'Adicionado aos favoritos' });
  }
}

async function removeFavorite(req, res) {
  const newsId = parseInt(req.params.newsId, 10);
  if (Number.isNaN(newsId)) return res.status(400).json({ error: 'newsId inválido' });

  const existing = await prisma.favorite.findUnique({ where: { userId_newsId: { userId: req.user.id, newsId } } });
  if (!existing) {
    return res.status(404).json({ error: 'Favorito não encontrado' });
  }
  await prisma.favorite.delete({ where: { id: existing.id } });
  res.json({ message: 'Favorito removido' });
}

module.exports = { listFavorites, toggleFavorite, removeFavorite };
