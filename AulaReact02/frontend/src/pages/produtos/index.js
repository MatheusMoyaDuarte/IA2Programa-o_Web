import { useState, useEffect } from "react";
import InputGroup from "../../components/inputGroup";
import useProduto from "../../hooks/useProduto";
import { urlImagem } from "../../utils/api";

const tiposImagem = ['image/jpeg', 'image/png'];

const Produtos = () => {
    const { getAll, create, update, remove } = useProduto();
    const [produto, setProduto] = useState({ nome: '', preco: '' });
    const [imagem, setImagem] = useState(null);
    const [inputKey, setInputKey] = useState(0);
    const [editandoId, setEditandoId] = useState(null);
    const [listaProdutos, setListaProdutos] = useState([]);

    useEffect(() => {
        carregarProdutos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function carregarProdutos() {
        try {
            setListaProdutos(await getAll());
        } catch (err) {
            alert(err.response?.data?.message || "Erro ao buscar os produtos");
        }
    }

    function validateProduto(produto) {
        if (!produto.nome || !produto.nome.trim()) {
            alert("O campo nome é obrigatório");
            return false;
        }
        if (produto.preco === '' || produto.preco === undefined) {
            alert("O campo preço é obrigatório");
            return false;
        }
        if (Number.isNaN(Number(produto.preco))) {
            alert("O preço deve ser um número válido");
            return false;
        }
        if (Number(produto.preco) < 0) {
            alert("O preço não pode ser negativo");
            return false;
        }
        return true;
    }

    function handleChange (e) {
        setProduto({...produto, [e.target.name]: e.target.value})
    }

    function handleKeyDownPreco (e) {
        if (e.key === '-' || e.key === 'e' || e.key === 'E') {
            e.preventDefault();
        }
    }

    function handleImagem (e) {
        const arquivo = e.target.files[0];
        if (arquivo && !tiposImagem.includes(arquivo.type)) {
            alert("A imagem deve ser .jpeg ou .png");
            e.target.value = '';
            setImagem(null);
            return;
        }
        setImagem(arquivo || null);
    }

    function limparFormulario () {
        setProduto({ nome: '', preco: '' });
        setImagem(null);
        setInputKey(inputKey + 1);
        setEditandoId(null);
    }

    async function handleSubmit (e) {
        e.preventDefault();
        if (!validateProduto(produto)) {
            return;
        }

        const formData = new FormData();
        formData.append('nome', produto.nome.trim());
        formData.append('preco', produto.preco);
        if (imagem) {
            formData.append('imagem', imagem);
        }

        try {
            if (editandoId) {
                await update(editandoId, formData);
            } else {
                await create(formData);
            }
            limparFormulario();
            carregarProdutos();
        } catch (err) {
            alert(err.response?.data?.message || "Erro ao salvar o produto");
        }
    }

    function handleEditar (item) {
        setEditandoId(item.id);
        setProduto({ nome: item.nome, preco: item.preco });
        setImagem(null);
        setInputKey(inputKey + 1);
    }

    async function handleExcluir (id) {
        if (!window.confirm("Deseja excluir este produto?")) {
            return;
        }
        try {
            await remove(id);
            if (editandoId === id) {
                limparFormulario();
            }
            carregarProdutos();
        } catch (err) {
            alert(err.response?.data?.message || "Erro ao excluir o produto");
        }
    }

    return (
        <div className="container">
            <h1 className="text-center fs-4">Produtos</h1>
            <div>
                <form onSubmit={handleSubmit}>
                    <InputGroup
                        label="Nome"
                        onChange={handleChange}
                        type="text"
                        placeholder="Nome do Produto"
                        name="nome"
                        value={produto.nome}/>
                    <InputGroup
                        label="Preço"
                        onChange={handleChange}
                        onKeyDown={handleKeyDownPreco}
                        type="number"
                        placeholder="Preço do Produto"
                        name="preco"
                        min="0"
                        step="0.01"
                        value={produto.preco}/>
                    <InputGroup
                        key={inputKey}
                        label="Imagem"
                        onChange={handleImagem}
                        type="file"
                        name="imagem"
                        accept=".jpg,.jpeg,.png,image/jpeg,image/png"/>

                    <button className="btn btn-primary" type="submit">Salvar</button>
                    {editandoId && (
                        <button className="btn btn-secondary ms-2" type="button" onClick={limparFormulario}>Cancelar</button>
                    )}
                </form>
            </div>
            <table className=" table table-striped mt-3">
                <thead>
                    <tr>
                        <th>Imagem</th>
                        <th>Nome</th>
                        <th>Preço</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {listaProdutos.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center">Nenhum produto encontrado</td>
                        </tr>)
                        : (
                            listaProdutos.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        {item.imagem && (
                                            <img src={urlImagem(item.imagem)} alt={item.nome} width="50" height="50" style={{ objectFit: 'cover' }}/>
                                        )}
                                    </td>
                                    <td>{item.nome}</td>
                                    <td>R$ {Number(item.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td>
                                        <button className="btn btn-sm btn-warning me-2" onClick={() => handleEditar(item)}>Editar</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleExcluir(item.id)}>Excluir</button>
                                    </td>
                                </tr>
                            ))
                        )
                    }
                </tbody>
            </table>
        </div>
    )
}

export default Produtos;
