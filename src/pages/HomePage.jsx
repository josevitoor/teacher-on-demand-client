import { Card, Typography } from "antd";
import {
    getCurrentProfile,
    getUser,
} from "../services/authService";

const { Title, Paragraph } = Typography;

const HomePage = () => {
    const user = getUser();
    const profile = getCurrentProfile();

    return (
        <Card>
            <Title level={3}>Bem-vindo, {user?.nome}</Title>
            <Paragraph>Perfil atual: {profile}</Paragraph>
        </Card>
    );
};

export default HomePage;