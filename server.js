const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Servir arquivos estáticos do frontend
app.use('/frontend', express.static(path.join(__dirname, '../frontend')))
app.use(express.static(path.join(__dirname, '../')))

// Importar rotas
const usuarioRoutes = require('./routes/usuarioRoutes')
const produtoRoutes = require('./routes/produtoRoutes')
const pedidoRoutes = require('./routes/pedidoRoutes')
const enderecoRoutes = require('./routes/enderecoRoutes')

// Usar rotas
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/produtos', produtoRoutes)
app.use('/api/pedidos', pedidoRoutes)
app.use('/api/enderecos', enderecoRoutes)

// Rota raiz - servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'))
})

// Rota para pegar produtos (compatibilidade com frontend)
app.get('/api/products', async (req, res) => {
    try {
        const { Produto } = require('./models/rel')
        const produtos = await Produto.findAll({
            where: { ativo: true }
        })
        res.json(produtos)
    } catch (error) {
        console.error('Erro ao buscar produtos:', error)
        res.status(500).json({ error: 'Erro ao buscar produtos' })
    }
})

// Tratamento de erros global
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ 
        error: 'Algo deu errado!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
})

// Iniciar servidor
app.listen(PORT, () => {
    console.log('╔════════════════════════════════════════╗')
    console.log(`║  🚀 Servidor rodando na porta ${PORT}   ║`)
    console.log('╚════════════════════════════════════════╝')
    console.log(`📍 http://localhost:${PORT}`)
    console.log(`📍 API: http://localhost:${PORT}/api`)
})

module.exports = app
