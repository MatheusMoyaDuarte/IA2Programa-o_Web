const db = require('../db/conn.js');
const Carrinho = require('../model/Carrinho.js');
const ItemCarrinho = require('../model/ItemCarrinho.js');
const Produto = require('../model/Produto.js');
const Venda = require('../model/Venda.js');
const ItemVenda = require('../model/ItemVenda.js');

// ---- validações ----
function validarId(id) {
    const n = Number(id);
    return Number.isInteger(n) && n > 0 ? n : null;
}

module.exports = class VendaController {
    static async create(req, res) {
        const { carrinhoId } = req.body ?? {};
        if (!validarId(carrinhoId)) {
            return res.status(422).json({ message: 'O carrinho é obrigatório' });
        }

        const t = await db.transaction();
        try {
            const carrinho = await Carrinho.findByPk(carrinhoId, {
                include: [{ model: ItemCarrinho, as: 'itens', include: [{ model: Produto, as: 'produto' }] }],
                transaction: t,
                lock: t.LOCK.UPDATE
            });
            if (!carrinho) {
                await t.rollback();
                return res.status(404).json({ message: 'Carrinho não encontrado' });
            }
            if (carrinho.status !== 'aberto') {
                await t.rollback();
                return res.status(422).json({ message: 'O carrinho já foi finalizado' });
            }
            if (carrinho.itens.length === 0) {
                await t.rollback();
                return res.status(422).json({ message: 'O carrinho está vazio' });
            }

            const total = Math.round(carrinho.itens.reduce((soma, item) => soma + Number(item.produto.preco) * item.quantidade, 0) * 100) / 100;

            const venda = await Venda.create({ total, CarrinhoId: carrinho.id }, { transaction: t });
            await ItemVenda.bulkCreate(carrinho.itens.map(item => ({
                VendaId: venda.id,
                ProdutoId: item.produto.id,
                nome: item.produto.nome,
                preco: item.produto.preco,
                quantidade: item.quantidade
            })), { transaction: t });
            await carrinho.update({ status: 'finalizado' }, { transaction: t });

            await t.commit();

            const vendaCriada = await Venda.findByPk(venda.id, { include: [{ model: ItemVenda, as: 'itens' }] });
            res.status(201).json({ message: 'Venda finalizada com sucesso', venda: vendaCriada });
        } catch (err) {
            await t.rollback();
            console.error(err);
            res.status(500).json({ message: 'Erro ao finalizar a venda' });
        }
    }

    static async getAll(req, res) {
        try {
            const vendas = await Venda.findAll({
                include: [{ model: ItemVenda, as: 'itens' }],
                order: [['id', 'DESC']]
            });
            res.status(200).json(vendas);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao buscar as vendas' });
        }
    }

    static async getById(req, res) {
        const id = validarId(req.params.id);
        if (!id) {
            return res.status(422).json({ message: 'ID inválido' });
        }

        try {
            const venda = await Venda.findByPk(id, { include: [{ model: ItemVenda, as: 'itens' }] });
            if (!venda) {
                return res.status(404).json({ message: 'Venda não encontrada' });
            }
            res.status(200).json(venda);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao buscar a venda' });
        }
    }
};
