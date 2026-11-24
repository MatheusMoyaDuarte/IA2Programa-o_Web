import axios from 'axios';

const api = axios.create({
    baseURL : process.env.REACT_APP_API_URL || 'http://localhost:5000'
});

export function urlImagem(nome) {
    return nome ? `${api.defaults.baseURL}/uploads/${nome}` : null;
}

export default api;
