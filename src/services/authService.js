import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/auth`,
});

const USER_KEY = "teacher_user";
const PROFILE_KEY = "teacher_profile";

export const login = async (data) => {
    const response = await api.post("/login", data);
    return response.data;
};

export const saveUser = (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
};

export const saveCurrentProfile = (profile) => {
    localStorage.setItem(PROFILE_KEY, profile);
};

export const getCurrentProfile = () => {
    return localStorage.getItem(PROFILE_KEY);
};

export const logout = () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PROFILE_KEY);
};

export const isAuthenticated = () => {
    return !!getUser();
};

export const getAvailableProfiles = () => {
    const user = getUser();

    if (!user) return [];

    const profiles = [];

    if (user.professor) profiles.push("PROFESSOR");
    if (user.pessoaFisica) profiles.push("PESSOA_FISICA");
    if (user.instituicaoEnsino) profiles.push("INSTITUICAO_ENSINO");

    return profiles;
};