const Carrinho = require('../model/Carrinho.js');
const ItemCarrinho = require('../model/ItemCarrinho.js');
const Produto = require('../model/Produto.js');

// ---- validações ----
function validarId(id) {
    const n = Number(id);
    return Number.isInteger(n) && n > 0 ? n : null;
}

function validarQuantidade(quantidade) {
    const n = Number(quantidade);
    return Number.isInteger(n) && n > 0 && n <= 1000;
}

// ---- helpers ----
async function buscarCarrinho(id) {
    const carrinho = await Carrinho.findByPk(id, {
        include: [{ model: ItemCarrinho, as: 'itens', include: [{ model: Produto, as: 'produto' }] }],
        order: [[{ model: ItemCarrinho, as: 'itens' }, 'id', 'ASC']]
    });
    if (!carrinho) return null;

    const json = carrinho.toJSON();
    json.total = Math.round(json.itens.reduce((soma, item) => soma + Number(item.produto.preco) * item.quantidade, 0) * 100) / 100;
    return json;
}

module.exports = class CarrinhoController {
    static async create(req, res) {
        try {
            const carrinho = await Carrinho.create();
            res.status(201).json({ message: 'Carrinho criado com sucesso', carrinho: await buscarCarrinho(carrinho.id) });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao criar o carrinho' });
        }
    }

    static async getById(req, res) {
        const id = validarId(req.params.id);
        if (!id) {
            return res.status(422).json({ message: 'ID inválido' });
        }

        try {
            const carrinho = await buscarCarrinho(id);
            if (!carrinho) {
                return res.status(404).json({ message: 'Carrinho não encontrado' });
            }
            res.status(200).json(carrinho);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao buscar o carrinho' });
        }
    }

    static async addItem(req, res) {
        const id = validarId(req.params.id);
        if (!id) {
            return res.status(422).json({ message: 'ID inválido' });
        }

        const { produtoId, quantidade = 1 } = req.body ?? {};
        if (!validarId(produtoId)) {
            return res.status(422).json({ message: 'O produto é obrigatório' });
        }
        if (!validarQuantidade(quantidade)) {
            return res.status(422).json({ message: 'A quantidade deve ser um número inteiro maior que zero' });
        }

        try {
            const carrinho = await Carrinho.findByPk(id);
            if (!carrinho) {
                return res.status(404).json({ message: 'Carrinho não encontrado' });
            }
            if (carrinho.status !== 'aberto') {
                return res.status(422).json({ message: 'O carrinho já foi finalizado' });
            }
            const produto = await Produto.findByPk(produtoId);
            if (!produto) {
                return res.status(404).json({ message: 'Produto não encontrado' });
            }

            const item = await ItemCarrinho.findOne({ where: { CarrinhoId: id, ProdutoId: produto.id } });
            if (item) {
                const novaQuantidade = item.quantidade + Number(quantidade);
                if (!validarQuantidade(novaQuantidade)) {
                    return res.status(422).json({ message: 'Quantidade máxima por item excedida' });
                }
                await item.update({ quantidade: novaQuantidade });
            } else {
                await ItemCarrinho.create({ CarrinhoId: id, ProdutoId: produto.id, quantidade: Number(quantidade) });
            }

            res.status(200).json({ message: 'Item adicionado ao carrinho', carrinho: await buscarCarrinho(id) });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao adicionar o item ao carrinho' });
        }
    }

    static async updateItem(req, res) {
        const id = validarId(req.params.id);
        const produtoId = validarId(req.params.produtoId);
        if (!id || !produtoId) {
            return res.status(422).json({ message: 'ID inválido' });
        }

        const { quantidade } = req.body ?? {};
        if (!validarQuantidade(quantidade)) {
            return res.status(422).json({ message: 'A quantidade deve ser um número inteiro maior que zero' });
        }

        try {
            const carrinho = await Carrinho.findByPk(id);
            if (!carrinho) {
                return res.status(404).json({ message: 'Carrinho não encontrado' });
            }
            if (carrinho.status !== 'aberto') {
                return res.status(422).json({ message: 'O carrinho já foi finalizado' });
            }
            const item = await ItemCarrinho.findOne({ where: { CarrinhoId: id, ProdutoId: produtoId } });
            if (!item) {
                return res.status(404).json({ message: 'Item não encontrado no carrinho' });
            }

            await item.update({ quantidade: Number(quantidade) });
            res.status(200).json({ message: 'Item atualizado com sucesso', carrinho: await buscarCarrinho(id) });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao atualizar o item do carrinho' });
        }
    }

    static async removeItem(req, res) {
        const id = validarId(req.params.id);
        const produtoId = validarId(req.params.produtoId);
        if (!id || !produtoId) {
            return res.status(422).json({ message: 'ID inválido' });
        }

        try {
            const carrinho = await Carrinho.findByPk(id);
            if (!carrinho) {
                return res.status(404).json({ message: 'Carrinho não encontrado' });
            }
            if (carrinho.status !== 'aberto') {
                return res.status(422).json({ message: 'O carrinho já foi finalizado' });
            }
            const item = await ItemCarrinho.findOne({ where: { CarrinhoId: id, ProdutoId: produtoId } });
            if (!item) {
                return res.status(404).json({ message: 'Item não encontrado no carrinho' });
            }

            await item.destroy();
            res.status(200).json({ message: 'Item removido do carrinho', carrinho: await buscarCarrinho(id) });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao remover o item do carrinho' });
        }
    }

    static async clear(req, res) {
        const id = validarId(req.params.id);
        if (!id) {
            return res.status(422).json({ message: 'ID inválido' });
        }

        try {
            const carrinho = await Carrinho.findByPk(id);
            if (!carrinho) {
                return res.status(404).json({ message: 'Carrinho não encontrado' });
            }
            if (carrinho.status !== 'aberto') {
                return res.status(422).json({ message: 'O carrinho já foi finalizado' });
            }

            await ItemCarrinho.destroy({ where: { CarrinhoId: id } });
            res.status(200).json({ message: 'Carrinho esvaziado com sucesso', carrinho: await buscarCarrinho(id) });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao esvaziar o carrinho' });
        }
    }
};
