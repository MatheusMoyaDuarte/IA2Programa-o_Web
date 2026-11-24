const { DataTypes } = require('sequelize');
const db = require('../db/conn.js');
const Carrinho = require('./Carrinho.js');
const Produto = require('./Produto.js');

const ItemCarrinho = db.define('ItemCarrinho', {
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    }
}, {
    indexes: [{ unique: true, fields: ['CarrinhoId', 'ProdutoId'] }]
});

Carrinho.hasMany(ItemCarrinho, { as: 'itens', foreignKey: 'CarrinhoId', onDelete: 'CASCADE' });
ItemCarrinho.belongsTo(Carrinho, { foreignKey: 'CarrinhoId' });
Produto.hasMany(ItemCarrinho, { foreignKey: 'ProdutoId', onDelete: 'CASCADE' });
ItemCarrinho.belongsTo(Produto, { as: 'produto', foreignKey: 'ProdutoId' });

module.exports = ItemCarrinho;
