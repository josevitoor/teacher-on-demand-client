import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/agenda`,
});

export const getAgendaUsuario = async (idUsuario) => {
    const response = await api.get(`/${idUsuario}`);
    return response.data;
};

export const criarAgendamento = async (data) => {
    const response = await api.post("", data);
    return response.data;
};

export const aprovarAgendamento = async (idContrato) => {
    const response = await api.put(`/${idContrato}/aprovar`);
    return response.data;
};

export const recusarAgendamento = async (idContrato) => {
    const response = await api.put(`/${idContrato}/recusar`);
    return response.data;
};