import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/professor`,
});

export const getProfessores = async () => {
    const response = await api.get("");
    return response.data;
};