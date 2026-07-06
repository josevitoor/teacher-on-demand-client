import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/agenda`,
});

export const getAgendaUsuario = async (idUsuario) => {
    const response = await api.get(`/${idUsuario}`);
    return response.data;
};