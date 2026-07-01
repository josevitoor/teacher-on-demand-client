import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import UsuarioCreatePage from "../pages/UsuarioCreatePage";
import SelectProfilePage from "../pages/SelectProfilePage";
import HomePage from "../pages/HomePage";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/cadastro" element={<UsuarioCreatePage />} />

                <Route
                    path="/selecionar-perfil"
                    element={
                        <ProtectedRoute>
                            <SelectProfilePage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    element={
                        <ProtectedRoute>
                            <MainLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/inicio" element={<HomePage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;