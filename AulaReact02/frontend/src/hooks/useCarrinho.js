import api from "../utils/api";

function useCarrinho() {
    async function create() {
        const response = await api.post('/carrinho/create');
        return response.data;
    }
    async function getById(id) {
        const response = await api.get(`/carrinho/getById/${id}`);
        return response.data;
    }
    async function addItem(id, produtoId, quantidade = 1) {
        const response = await api.post(`/carrinho/addItem/${id}`, { produtoId, quantidade });
        return response.data;
    }
    async function updateItem(id, produtoId, quantidade) {
        const response = await api.patch(`/carrinho/updateItem/${id}/${produtoId}`, { quantidade });
        return response.data;
    }
    async function removeItem(id, produtoId) {
        const response = await api.delete(`/carrinho/removeItem/${id}/${produtoId}`);
        return response.data;
    }
    async function clear(id) {
        const response = await api.delete(`/carrinho/clear/${id}`);
        return response.data;
    }

    return {create, getById, addItem, updateItem, removeItem, clear};
}

export default useCarrinho;
