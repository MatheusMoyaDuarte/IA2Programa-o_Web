const { DataTypes } = require('sequelize');
const db = require('../db/conn.js');
const Carrinho = require('./Carrinho.js');

const Venda = db.define('Venda', {
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
});

Carrinho.hasOne(Venda, { foreignKey: 'CarrinhoId' });
Venda.belongsTo(Carrinho, { foreignKey: 'CarrinhoId' });

module.exports = Venda;
