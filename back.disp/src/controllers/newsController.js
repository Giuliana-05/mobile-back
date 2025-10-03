// Arquivo: src/controllers/newsController.js (CORRIGIDO PARA PRISMA)

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ==========================================================
// A. FUNÇÕES DE NOTÍCIAS (PÚBLICAS)
// ==========================================================

// Função que lista todas as notícias (Usada na tela inicial)
exports.listNews = async (req, res) => {
    try {
        const news = await prisma.news.findMany({
            // CORREÇÃO: Adicionando 'select' para garantir que o campo 'image' seja incluído
            select: {
                id: true,
                title: true,
                content: true,
                image: true, // <<-- CAMPO NECESSÁRIO PARA O FALLBACK DA IMAGEM NO FRONT END
                publishedAt: true,
                category: true,
                // Adicione aqui outros campos se houver necessidade (ex: author, slug)
            },
            orderBy: { publishedAt: 'desc' },
        });
        res.json(news);
    } catch (err) {
        console.error("Erro ao listar notícias:", err);
        res.status(500).json({ error: 'Falha ao buscar notícias.' });
    }
};

// Função de Busca (Adaptada para usar o LIKE do PostgreSQL/Prisma)
exports.search = async (req, res) => {
    const { q } = req.query;
    
    // Verifica se há termo de busca e adapta a consulta
    if (!q) {
        return res.status(400).json({ error: 'Termo de busca (q) é obrigatório.' });
    }

    try {
        const news = await prisma.news.findMany({
            where: {
                title: {
                    contains: q, // Procura onde o título contém o termo (case-insensitive em PG)
                    mode: 'insensitive' // Adiciona case-insensitivity (PostgreSQL)
                }
            },
            orderBy: { publishedAt: 'desc' },
        });
        res.json(news);
    } catch (err) {
        console.error("Erro na busca:", err);
        res.status(500).json({ error: 'Falha ao buscar notícias.' });
    }
};

// ==========================================================
// B. FUNÇÕES DE FAVORITOS (PROTEGIDAS - Lidas pela rota favoriteRoutes.js)
// ==========================================================

// Listar Notícias Favoritas do Usuário
exports.getFavorites = async (req, res) => {
    // req.userId é injetado pelo middleware 'auth.js'
    const userId = req.userId; 
    
    try {
        const favorites = await prisma.favorite.findMany({
            where: { userId },
            // Inclui os dados completos da notícia
            include: { news: true }, 
        });

        // Retorna apenas a lista de objetos 'news' favoritos
        const favoriteNews = favorites.map(fav => fav.news); 
        
        res.json(favoriteNews);
    } catch (err) {
        console.error("Erro ao buscar favoritos:", err);
        res.status(500).json({ error: 'Falha ao buscar favoritos.' });
    }
};

// Adicionar Notícia aos Favoritos
exports.addFavorite = async (req, res) => {
    const userId = req.userId;
    const { newsId } = req.body;

    if (!newsId) {
        return res.status(400).json({ error: 'ID da notícia é obrigatório.' });
    }
    
    try {
        // Verifica a chave composta para evitar duplicatas
        const favorite = await prisma.favorite.create({
            data: {
                userId,
                newsId: parseInt(newsId), 
            },
        });

        res.status(201).json({ message: 'Adicionado aos favoritos.', favorite });
    } catch (err) {
        // Código de erro comum do Prisma para chave duplicada
        if (err.code === 'P2002') {
             return res.status(409).json({ error: 'Notícia já está nos favoritos.' });
        }
        console.error("Erro ao adicionar favorito:", err);
        res.status(500).json({ error: 'Falha ao adicionar favorito.' });
    }
};

// Remover Notícia dos Favoritos
exports.removeFavorite = async (req, res) => {
    const userId = req.userId;
    const newsId = parseInt(req.params.newsId); // Pega o ID da URL

    try {
        // Deleta o registro com base na chave composta
        await prisma.favorite.delete({
            where: {
                userId_newsId: { // Nome do campo da chave composta no Prisma (veja seu schema.prisma)
                    userId,
                    newsId,
                },
            },
        });

        res.status(204).send(); // 204 No Content (remoção bem-sucedida)
    } catch (err) {
        console.error("Erro ao remover favorito:", err);
        // Se o registro não for encontrado (ex: já foi deletado), o Prisma lança um erro.
        res.status(500).json({ error: 'Falha ao remover favorito. Notícia não encontrada nos favoritos.' });
    }
};