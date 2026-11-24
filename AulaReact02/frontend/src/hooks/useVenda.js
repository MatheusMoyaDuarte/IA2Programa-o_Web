import api from "../utils/api";

function useVenda() {
    async function create(carrinhoId) {
        const response = await api.post('/venda/create', { carrinhoId });
        return response.data;
    }
    async function getAll() {
        const response = await api.get('/venda/getAll');
        return response.data;
    }
    async function getById(id) {
        const response = await api.get(`/venda/getById/${id}`);
        return response.data;
    }

    return {create, getAll, getById};
}

export default useVenda;
