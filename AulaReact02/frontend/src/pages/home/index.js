import { useState, useEffect } from "react";
import useProduto from "../../hooks/useProduto";
import useCarrinho from "../../hooks/useCarrinho";
import useVenda from "../../hooks/useVenda";
import { urlImagem } from "../../utils/api";

function formatarPreco(valor) {
    return `R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const Home = () => {
    const produtoApi = useProduto();
    const carrinhoApi = useCarrinho();
    const vendaApi = useVenda();
    const [produtos, setProdutos] = useState([]);
    const [carrinho, setCarrinho] = useState(null);

    useEffect(() => {
        carregarProdutos();
        carregarCarrinho();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function carregarProdutos() {
        try {
            setProdutos(await produtoApi.getAll());
        } catch (err) {
            alert(err.response?.data?.message || "Erro ao buscar os produtos");
        }
    }

    async function carregarCarrinho() {
        const id = localStorage.getItem('carrinhoId');
        if (!id) {
            return;
        }
        try {
            const dados = await carrinhoApi.getById(id);
            if (dados.status === 'aberto') {
                setCarrinho(dados);
            } else {
                localStorage.removeItem('carrinhoId');
            }
        } catch (err) {
            localStorage.removeItem('carrinhoId');
        }
    }

    async function handleAdicionar(produtoId) {
        try {
            let id = carrinho?.id;
            if (!id) {
                const novo = await carrinhoApi.create();
                id = novo.carrinho.id;
                localStorage.setItem('carrinhoId', id);
            }
            const resposta = await carrinhoApi.addItem(id, produtoId, 1);
            setCarrinho(resposta.carrinho);
        } catch (err) {
            alert(err.response?.data?.message || "Erro ao adicionar ao carrinho");
        }
    }

    async function handleQuantidade(produtoId, quantidade) {
        try {
            const resposta = quantidade < 1
                ? await carrinhoApi.removeItem(carrinho.id, produtoId)
                : await carrinhoApi.updateItem(carrinho.id, produtoId, quantidade);
            setCarrinho(resposta.carrinho);
        } catch (err) {
            alert(err.response?.data?.message || "Erro ao atualizar o carrinho");
        }
    }

    async function handleRemover(produtoId) {
        try {
            const resposta = await carrinhoApi.removeItem(carrinho.id, produtoId);
            setCarrinho(resposta.carrinho);
        } catch (err) {
            alert(err.response?.data?.message || "Erro ao remover o item");
        }
    }

    async function handleLimpar() {
        try {
            const resposta = await carrinhoApi.clear(carrinho.id);
            setCarrinho(resposta.carrinho);
        } catch (err) {
            alert(err.response?.data?.message || "Erro ao esvaziar o carrinho");
        }
    }

    async function handleFinalizar() {
        try {
            const resposta = await vendaApi.create(carrinho.id);
            alert(`Venda #${resposta.venda.id} finalizada com sucesso! Total: ${formatarPreco(resposta.venda.total)}`);
            localStorage.removeItem('carrinhoId');
            setCarrinho(null);
        } catch (err) {
            alert(err.response?.data?.message || "Erro ao finalizar a venda");
        }
    }

    const itens = carrinho?.itens ?? [];

    return (
        <div className="container">
            <h1 className="text-center fs-4">Home</h1>
            <div className="row">
                <div className="col-md-8">
                    <div className="row">
                        {produtos.length === 0 ? (
                            <p className="text-center">Nenhum produto encontrado</p>
                        ) : (
                            produtos.map((item) => (
                                <div className="col-6 col-lg-4 mb-3" key={item.id}>
                                    <div className="card h-100">
                                        {item.imagem && (
                                            <img src={urlImagem(item.imagem)} alt={item.nome} className="card-img-top" style={{ height: '150px', objectFit: 'cover' }}/>
                                        )}
                                        <div className="card-body d-flex flex-column">
                                            <h5 className="card-title fs-6">{item.nome}</h5>
                                            <p className="card-text">{formatarPreco(item.preco)}</p>
                                            <button className="btn btn-primary mt-auto" onClick={() => handleAdicionar(item.id)}>Adicionar ao carrinho</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-header">Carrinho</div>
                        <div className="card-body">
                            {itens.length === 0 ? (
                                <p className="text-center mb-0">Carrinho vazio</p>
                            ) : (
                                <>
                                    <table className="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Produto</th>
                                                <th>Qtd</th>
                                                <th>Subtotal</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {itens.map((item) => (
                                                <tr key={item.id}>
                                                    <td>{item.produto.nome}</td>
                                                    <td>
                                                        <button className="btn btn-sm btn-outline-secondary" onClick={() => handleQuantidade(item.produto.id, item.quantidade - 1)}>-</button>
                                                        <span className="mx-2">{item.quantidade}</span>
                                                        <button className="btn btn-sm btn-outline-secondary" onClick={() => handleQuantidade(item.produto.id, item.quantidade + 1)}>+</button>
                                                    </td>
                                                    <td>{formatarPreco(Number(item.produto.preco) * item.quantidade)}</td>
                                                    <td>
                                                        <button className="btn btn-sm btn-danger" onClick={() => handleRemover(item.produto.id)}>x</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <p className="fw-bold">Total: {formatarPreco(carrinho.total)}</p>
                                    <button className="btn btn-success me-2" onClick={handleFinalizar}>Finalizar venda</button>
                                    <button className="btn btn-secondary" onClick={handleLimpar}>Esvaziar</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;
