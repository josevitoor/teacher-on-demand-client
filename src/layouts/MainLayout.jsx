import { Layout, Menu, Button, Typography } from "antd";
import {
    HomeOutlined,
    LogoutOutlined,
    SwapOutlined,
} from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { getAvailableProfiles, getCurrentProfile, logout } from "../services/authService";

const { Sider, Content } = Layout;
const { Text } = Typography;

const profileLabels = {
    PROFESSOR: "Professor",
    PESSOA_FISICA: "Pessoa Física",
    INSTITUICAO_ENSINO: "Instituição",
};

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const currentProfile = getCurrentProfile();
    const profiles = getAvailableProfiles();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const items = [
        {
            key: "/inicio",
            icon: <HomeOutlined />,
            label: "Início",
            onClick: () => navigate("/inicio"),
        },
    ];

    const rodape = [
        ...(profiles.length > 1
            ? [{
                key: "trocar",
                icon: <SwapOutlined />,
                label: "Trocar perfil",
                onClick: () => navigate("/selecionar-perfil"),
            }]
            : []),

        {
            key: "logout",
            danger: true,
            icon: <LogoutOutlined />,
            label: "Sair",
            onClick: handleLogout,
        },
    ];


    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider width={240}>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                    }}
                >
                    <div
                        style={{
                            padding: 16,
                            color: "#fff",
                            fontWeight: "bold",
                            fontSize: 18,
                        }}
                    >
                        Teacher On Demand
                    </div>

                    <div style={{ padding: "0 16px 16px" }}>
                        <Text style={{ color: "#fff" }}>
                            {profileLabels[currentProfile]}
                        </Text>
                    </div>

                    <Menu
                        theme="dark"
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        items={items}
                    />

                    <div style={{ flex: 1 }} />

                    <Menu
                        theme="dark"
                        mode="inline"
                        selectable={false}
                        items={rodape}
                    />
                </div>
            </Sider>

            <Layout>
                <Content style={{ padding: 24 }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;