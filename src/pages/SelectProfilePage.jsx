import { Button, Card, Space, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { getAvailableProfiles, saveCurrentProfile } from "../services/authService";

const { Title } = Typography;

const profileLabels = {
    PROFESSOR: "Professor",
    PESSOA_FISICA: "Contratante - Pessoa Física",
    INSTITUICAO_ENSINO: "Contratante - Instituição de Ensino",
};

const SelectProfilePage = () => {
    const navigate = useNavigate();
    const profiles = getAvailableProfiles();

    const handleSelect = (profile) => {
        saveCurrentProfile(profile);
        navigate("/inicio");
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }}>
            <Card style={{ width: 420 }}>
                <Title level={3}>Selecionar perfil</Title>

                <Space direction="vertical" style={{ width: "100%" }}>
                    {profiles.map((profile) => (
                        <Button
                            key={profile}
                            block
                            type="primary"
                            onClick={() => handleSelect(profile)}
                        >
                            {profileLabels[profile]}
                        </Button>
                    ))}
                </Space>
            </Card>
        </div>
    );
};

export default SelectProfilePage;