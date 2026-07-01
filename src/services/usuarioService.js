import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/usuarios`,
});

export const criarUsuario = async (data) => {
    const response = await api.post("", data);
    return response.data;
};