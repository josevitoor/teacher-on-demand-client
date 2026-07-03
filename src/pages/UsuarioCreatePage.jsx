import {
    Button,
    Card,
    Checkbox,
    DatePicker,
    Form,
    Input,
    InputNumber,
    message,
    Select,
    Typography,
} from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { criarUsuario } from "../services/usuarioService";

const { Title } = Typography;

const UsuarioCreatePage = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const tiposSelecionados = Form.useWatch("tipos", form) || [];

    const isProfessor = tiposSelecionados.includes("PROFESSOR");
    const isPessoaFisica = tiposSelecionados.includes("PESSOA_FISICA");
    const isInstituicao = tiposSelecionados.includes("INSTITUICAO_ENSINO");

    const onFinish = async (values) => {
        try {
            const payload = {
                ...values,
                dataNascimento: values.dataNascimento
                    ? dayjs(values.dataNascimento).format("YYYY-MM-DD")
                    : null,
            };

            await criarUsuario(payload);

            message.success("Usuário criado com sucesso");
            navigate("/");
        } catch (error) {
            message.error("Erro ao criar usuário");
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <Card style={{ width: 520 }}>
                <Title level={3}>Criar conta</Title>

                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        label="Tipos de usuário"
                        name="tipos"
                        rules={[{ required: true, message: "Selecione pelo menos um tipo" }]}
                    >
                        <Checkbox.Group>
                            <Checkbox value="PROFESSOR">Professor</Checkbox>
                            <Checkbox value="PESSOA_FISICA">Pessoa Física</Checkbox>
                            <Checkbox value="INSTITUICAO_ENSINO">Instituição de Ensino</Checkbox>
                        </Checkbox.Group>
                    </Form.Item>

                    <Form.Item label="Nome" name="nome" rules={[{ required: true, message: "Informe o nome" }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="E-mail" name="email" rules={[{ required: true, type: "email", message: "Informe um e-mail válido" }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Senha" name="senha" rules={[{ required: true, message: "Informe a senha" }]}>
                        <Input.Password />
                    </Form.Item>

                    <Form.Item label="Telefone" name="telefone" rules={[{ required: true, message: "Informe o telefone" }]}>
                        <Input />
                    </Form.Item>

                    {(isProfessor || isPessoaFisica) && (
                        <>
                            <Form.Item label="CPF" name="cpf" rules={[{ required: true, message: "Informe o CPF" }]}>
                                <Input maxLength={11} minLength={11} />
                            </Form.Item>

                            <Form.Item label="Data de nascimento" name="dataNascimento" rules={[{ required: true, message: "Informe a data de nascimento" }]}>
                                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </>
                    )}

                    {isProfessor && (
                        <>
                            <Form.Item
                                label="Especialidades"
                                name="especialidades"
                                rules={[{ required: true, message: "Selecione pelo menos uma especialidade" }]}
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Selecione as disciplinas"
                                    options={[
                                        { value: "Matemática", label: "Matemática" },
                                        { value: "Português", label: "Português" },
                                        { value: "História", label: "História" },
                                        { value: "Geografia", label: "Geografia" },
                                        { value: "Física", label: "Física" },
                                        { value: "Química", label: "Química" },
                                        { value: "Biologia", label: "Biologia" },
                                        { value: "Inglês", label: "Inglês" },
                                        { value: "Programação", label: "Programação" },
                                    ]}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Tipo do documento"
                                name="documentoTipo"
                                initialValue="Comprovante de Formação"
                                rules={[{ required: true }]}
                            >
                                <Input disabled />
                            </Form.Item>

                            <Form.Item
                                label="Comprovante de formação"
                                name="documentoArquivo"
                                rules={[{ required: true, message: "Informe o documento" }]}
                            >
                                <Input placeholder="Caminho do arquivo" />
                            </Form.Item>
                        </>
                    )}

                    {isProfessor && (
                        <Form.Item label="Valor hora/aula" name="valorHoraAula" rules={[{ required: true, message: "Informe o valor por hora/aula" }]}>
                            <InputNumber
                                min={0}
                                style={{ width: "100%" }}
                                prefix="R$"
                                decimalSeparator=","
                            />
                        </Form.Item>
                    )}

                    {isInstituicao && (
                        <Form.Item label="CNPJ" name="cnpj" rules={[{ required: true, message: "Informe o CNPJ" }]}>
                            <Input maxLength={14} minLength={14} />
                        </Form.Item>
                    )}

                    <Button type="primary" htmlType="submit" block>
                        Criar conta
                    </Button>

                    <Button type="link" block onClick={() => navigate("/")}>
                        Voltar para login
                    </Button>
                </Form>
            </Card>
        </div>
    );
};

export default UsuarioCreatePage;