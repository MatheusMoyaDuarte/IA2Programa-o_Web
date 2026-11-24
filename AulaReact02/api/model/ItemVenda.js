const { DataTypes } = require('sequelize');
const db = require('../db/conn.js');
const Venda = require('./Venda.js');
const Produto = require('./Produto.js');

// nome e preco ficam gravados na venda para o histórico não mudar se o produto for editado ou excluído
const ItemVenda = db.define('ItemVenda', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    preco: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

Venda.hasMany(ItemVenda, { as: 'itens', foreignKey: 'VendaId', onDelete: 'CASCADE' });
ItemVenda.belongsTo(Venda, { foreignKey: 'VendaId' });
Produto.hasMany(ItemVenda, { foreignKey: 'ProdutoId', onDelete: 'SET NULL' });
ItemVenda.belongsTo(Produto, { foreignKey: 'ProdutoId' });

module.exports = ItemVenda;
