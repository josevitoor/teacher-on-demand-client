import { useEffect, useState } from "react";
import {
    Button,
    Card,
    DatePicker,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Radio,
    Select,
    Space,
    Steps,
    Tag,
    TimePicker,
    Typography,
} from "antd";
import dayjs from "dayjs";
import { getUser } from "../services/authService";
import { criarAgendamento } from "../services/agendaService";
import { getProfessores } from "../services/professorService";

const { Text, Title } = Typography;

const tipoServicoOptions = [
    { value: "Aula Única", label: "Aula Única" },
    { value: "Aula Mensal", label: "Aula Mensal" },
    { value: "Pacote de Aulas", label: "Pacote de Aulas" },
];

const metodoPagamentoOptions = [
    { value: "PIX", label: "PIX" },
    { value: "CARTAO", label: "Cartão" },
    { value: "DINHEIRO", label: "Dinheiro" },
];

const AgendamentoModal = ({ open, onClose, onSuccess }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [professores, setProfessores] = useState([]);
    const [loadingProfessores, setLoadingProfessores] = useState(false);

    const [form] = Form.useForm();
    const user = getUser();

    const idProfessor = Form.useWatch("idProfessor", form);
    const professorSelecionado = professores.find(
        (p) => p.idProfessor === idProfessor
    );

    useEffect(() => {
        if (open) {
            carregarProfessores();
        }
    }, [open]);

    const carregarProfessores = async () => {
        try {
            setLoadingProfessores(true);
            const data = await getProfessores();
            setProfessores(data);
        } catch {
            message.error("Erro ao carregar professores");
        } finally {
            setLoadingProfessores(false);
        }
    };

    const next = async () => {
        try {
            await form.validateFields(getFieldsByStep(currentStep));
            setCurrentStep(currentStep + 1);
        } catch {
            message.warning("Preencha os campos obrigatórios");
        }
    };

    const previous = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleClose = () => {
        form.resetFields();
        setCurrentStep(0);
        onClose();
    };

    const handleSubmit = async () => {
        try {
            await form.validateFields();
            setLoading(true);

            const values = form.getFieldsValue(true);

            const payload = {
                idProfessor: values.idProfessor,
                idContratante: user.usuarioId,

                tipoServico: values.tipoServico,
                descricaoServico: values.descricaoServico,

                endereco: values.endereco,
                horaInicio: values.horario[0].format("HH:mm:ss"),
                horaFim: values.horario[1].format("HH:mm:ss"),
                datas: values.datas.map((data) => data.format("YYYY-MM-DD")),

                valorTotal: values.valorTotal,
                metodoPagamento: values.metodoPagamento,
            };

            await criarAgendamento(payload);

            message.success("Agendamento criado e aguardando aprovação");
            handleClose();
            onSuccess();
        } catch {
            message.error("Erro ao criar agendamento");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Novo agendamento"
            open={open}
            onCancel={handleClose}
            footer={null}
            width={820}
            destroyOnClose
        >
            <Steps
                current={currentStep}
                style={{ marginBottom: 24 }}
                items={[
                    { title: "Professor" },
                    { title: "Serviço" },
                    { title: "Aula" },
                    { title: "Pagamento" },
                    { title: "Revisão" },
                ]}
            />

            <Form form={form} layout="vertical">
                <div style={{ display: currentStep === 0 ? "block" : "none" }}>
                    <Form.Item
                        label="Professor"
                        name="idProfessor"
                        rules={[{ required: true, message: "Selecione o professor" }]}
                    >
                        <Select
                            loading={loadingProfessores}
                            placeholder="Selecione um professor"
                            options={professores.map((professor) => ({
                                value: professor.idProfessor,
                                label: `${professor.nome} - R$ ${professor.valorHoraAula}/h`,
                            }))}
                        />
                    </Form.Item>

                    {professorSelecionado && (
                        <Card size="small">
                            <Space direction="vertical" size={8}>
                                <Text strong>{professorSelecionado.nome}</Text>

                                <Text>
                                    Valor hora/aula:{" "}
                                    <strong>
                                        R$ {professorSelecionado.valorHoraAula}
                                    </strong>
                                </Text>

                                <Space wrap>
                                    {professorSelecionado.especialidades?.map((item) => (
                                        <Tag color="blue" key={item}>
                                            {item}
                                        </Tag>
                                    ))}
                                </Space>
                            </Space>
                        </Card>
                    )}
                </div>

                <div style={{ display: currentStep === 1 ? "block" : "none" }}>
                    <Form.Item
                        label="Tipo de serviço"
                        name="tipoServico"
                        initialValue="Aula Única"
                        rules={[{ required: true, message: "Informe o tipo de serviço" }]}
                    >
                        <Select
                            placeholder="Selecione ou informe o tipo"
                            options={tipoServicoOptions}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Descrição do serviço"
                        name="descricaoServico"
                        initialValue={
                            professorSelecionado?.especialidades?.length
                                ? `Aula particular de ${professorSelecionado.especialidades[0]}`
                                : "Aula particular"
                        }
                        rules={[{ required: true, message: "Informe a descrição" }]}
                    >
                        <Input placeholder="Ex: Aula particular de Matemática" />
                    </Form.Item>

                    <Text type="secondary">
                        O serviço será criado junto com o agendamento.
                    </Text>
                </div>

                <div style={{ display: currentStep === 2 ? "block" : "none" }}>
                    <Form.Item
                        label="Endereço ou local da aula"
                        name="endereco"
                        rules={[{ required: true, message: "Informe o endereço" }]}
                    >
                        <Input placeholder="Ex: Google Meet, escola, residência..." />
                    </Form.Item>

                    <Form.Item
                        label="Horário"
                        name="horario"
                        rules={[{ required: true, message: "Informe o horário" }]}
                    >
                        <TimePicker.RangePicker
                            style={{ width: "100%" }}
                            format="HH:mm"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Datas da aula"
                        name="datas"
                        rules={[{ required: true, message: "Selecione ao menos uma data" }]}
                    >
                        <DatePicker
                            multiple
                            style={{ width: "100%" }}
                            format="DD/MM/YYYY"
                        />
                    </Form.Item>
                </div>

                <div style={{ display: currentStep === 3 ? "block" : "none" }}>
                    <Form.Item
                        label="Valor total"
                        name="valorTotal"
                        initialValue={professorSelecionado?.valorHoraAula}
                        rules={[{ required: true, message: "Informe o valor" }]}
                    >
                        <InputNumber
                            style={{ width: "100%" }}
                            min={0}
                            precision={2}
                            prefix="R$"
                            decimalSeparator=","
                        />
                    </Form.Item>

                    <Form.Item
                        label="Método de pagamento"
                        name="metodoPagamento"
                        rules={[{ required: true, message: "Selecione o método" }]}
                    >
                        <Select
                            placeholder="Selecione"
                            options={metodoPagamentoOptions}
                        />
                    </Form.Item>
                </div>

                <div style={{ display: currentStep === 4 ? "block" : "none" }}>
                    <ResumoAgendamento
                        form={form}
                        user={user}
                        professor={professorSelecionado}
                    />
                </div>
            </Form>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 24,
                }}
            >
                <Button disabled={currentStep === 0} onClick={previous}>
                    Voltar
                </Button>

                {currentStep < 4 ? (
                    <Button type="primary" onClick={next}>
                        Próximo
                    </Button>
                ) : (
                    <Button type="primary" loading={loading} onClick={handleSubmit}>
                        Criar agendamento
                    </Button>
                )}
            </div>
        </Modal>
    );
};

const ResumoAgendamento = ({ form, user, professor }) => {
    const values = form.getFieldsValue(true);

    return (
        <Space direction="vertical" size={8}>
            <Title level={5}>Resumo do agendamento</Title>

            <Text>
                <strong>Professor:</strong> {professor?.nome}
            </Text>

            <Text>
                <strong>Contratante:</strong> {user?.nome}
            </Text>

            <Text>
                <strong>Tipo:</strong> {values.tipoServico}
            </Text>

            <Text>
                <strong>Serviço:</strong> {values.descricaoServico}
            </Text>

            <Text>
                <strong>Local:</strong> {values.endereco}
            </Text>

            <Text>
                <strong>Horário:</strong>{" "}
                {values.horario?.[0]?.format("HH:mm")} -{" "}
                {values.horario?.[1]?.format("HH:mm")}
            </Text>

            <Text>
                <strong>Datas:</strong>{" "}
                {values.datas
                    ?.map((data) => data.format("DD/MM/YYYY"))
                    .join(", ")}
            </Text>

            <Text>
                <strong>Valor:</strong> R$ {values.valorTotal}
            </Text>

            <Text>
                <strong>Pagamento:</strong> {values.metodoPagamento}
            </Text>

            <Tag color="orange">
                O contrato será criado como aguardando aprovação
            </Tag>
        </Space>
    );
};

const getFieldsByStep = (step) => {
    const fields = {
        0: ["idProfessor"],
        1: ["tipoServico", "descricaoServico"],
        2: ["endereco", "horario", "datas"],
        3: ["valorTotal", "metodoPagamento"],
        4: [],
    };

    return fields[step];
};

export default AgendamentoModal;