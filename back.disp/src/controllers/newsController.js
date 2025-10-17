const prisma = require('../prismaClient');

async function listNews(req, res) {
  const news = await prisma.news.findMany({
    orderBy: { publishedAt: 'desc' },
    take: 50,
    select: { id: true, title: true, summary: true, imageUrl: true, publishedAt: true }
  });
  res.json({ news });
}

async function getNewsDetail(req, res) {
  const id = parseInt(req.params.id, 10);
  const item = await prisma.news.findUnique({
    where: { id },
    select: { id: true, title: true, content: true, imageUrl: true, publishedAt: true }
  });
  if (!item) return res.status(404).json({ error: 'Notícia não encontrada' });
  res.json({ news: item });
}

// Optional endpoints to create/update news (admin). For dev ease:
async function createNews(req, res) {
  const { title, content, summary, imageUrl } = req.body;
  const news = await prisma.news.create({ data: { title, content, summary, imageUrl } });
  res.json({ news });
}

module.exports = { listNews, getNewsDetail, createNews };
