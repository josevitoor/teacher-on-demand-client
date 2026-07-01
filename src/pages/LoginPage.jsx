import { Button, Card, Form, Input, message, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { login, saveCurrentProfile, saveUser } from "../services/authService";

const { Title } = Typography;

const LoginPage = () => {
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            const user = await login(values);

            saveUser(user);

            const profiles = [];

            if (user.professor) profiles.push("PROFESSOR");
            if (user.pessoaFisica) profiles.push("PESSOA_FISICA");
            if (user.instituicaoEnsino) profiles.push("INSTITUICAO_ENSINO");

            message.success("Login realizado com sucesso");

            if (profiles.length > 1) {
                navigate("/selecionar-perfil");
            } else {
                saveCurrentProfile(profiles[0]);
                navigate("/inicio");
            }
        } catch (error) {
            message.error("Usuário ou senha inválidos");
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <Card style={{ width: 400 }}>
                <Title level={3}>Teacher On Demand</Title>

                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        label="E-mail"
                        name="email"
                        rules={[{ required: true, message: "Informe o e-mail" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Senha"
                        name="senha"
                        rules={[{ required: true, message: "Informe a senha" }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block>
                        Entrar
                    </Button>

                    <Button type="link" block onClick={() => navigate("/cadastro")}>
                        Criar conta
                    </Button>
                </Form>
            </Card>
        </div>
    );
};

export default LoginPage;