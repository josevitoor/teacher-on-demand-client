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
    {
        value: "AULA_UNICA",
        label: "Aula Única",
    },
    {
        value: "PACOTE_AULA",
        label: "Pacote de aulas",
    },
    {
        value: "AULA_MENSAL",
        label: "Aula mensal",
    },
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

    const tipoAula = Form.useWatch("tipoAula", form);
    const qtdAulas = Form.useWatch("qtdAulas", form);

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
            await form.validateFields(
                getFieldsByStep(currentStep, tipoAula)
            );
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
            debugger
            const payload = {
                idProfessor: values.idProfessor,
                idContratante: user.usuarioId,

                tipoServico: values.tipoServico,
                tipoAula: values.tipoAula,

                endereco: values.endereco,

                horaInicio: values.horario[0].format("HH:mm:ss"),
                horaFim: values.horario[1].format("HH:mm:ss"),


                datas:
                    values.tipoAula === "AULA_MENSAL"
                        ? []
                        : Array.isArray(values.datas)
                            ? values.datas.map((d) => d.format("YYYY-MM-DD"))
                            : values.datas
                                ? [values.datas.format("YYYY-MM-DD")]
                                : [],

                diasSemana: values.diasSemana ?? [],

                dataVencimento:
                    values.dataVencimento?.format("YYYY-MM-DD"),

                qtdAulas: values.qtdAulas,

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
                        label="Modalidade"
                        name="tipoAula"
                        initialValue="AULA_UNICA"
                        rules={[{ required: true }]}
                    >
                        <Select
                            options={tipoServicoOptions}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Nome do serviço"
                        name="tipoServico"
                        initialValue={
                            professorSelecionado?.especialidades?.length
                                ? `Aula particular de ${professorSelecionado.especialidades[0]}`
                                : "Aula particular"
                        }
                        rules={[{ required: true }]}
                    >
                        <Input placeholder="Ex.: Reforço de Matemática para ENEM" />
                    </Form.Item>
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
                    {tipoAula === "AULA_MENSAL" && (
                        <>
                            <Form.Item
                                label="Data de vencimento"
                                name="dataVencimento"
                                rules={[{ required: true }]}
                            >
                                <DatePicker
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Dias da semana"
                                name="diasSemana"
                                rules={[{ required: true }]}
                            >
                                <Select
                                    mode="multiple"
                                    options={[
                                        { value: "SEGUNDA", label: "Segunda-feira" },
                                        { value: "TERCA", label: "Terça-feira" },
                                        { value: "QUARTA", label: "Quarta-feira" },
                                        { value: "QUINTA", label: "Quinta-feira" },
                                        { value: "SEXTA", label: "Sexta-feira" },
                                        { value: "SABADO", label: "Sábado" },
                                        { value: "DOMINGO", label: "Domingo" },
                                    ]}
                                />
                            </Form.Item>
                        </>
                    )}

                    {tipoAula === "PACOTE_AULA" && (
                        <Form.Item
                            label="Quantidade de aulas"
                            name="qtdAulas"
                            rules={[{ required: true }]}
                        >
                            <InputNumber
                                min={1}
                                style={{ width: "100%" }}
                            />
                        </Form.Item>
                    )}

                    {tipoAula !== "AULA_MENSAL" && (
                        <Form.Item
                            label={
                                tipoAula === "AULA_UNICA"
                                    ? "Data da aula"
                                    : "Datas das aulas"
                            }
                            name="datas"
                            rules={[
                                { required: true },
                                {
                                    validator(_, value) {

                                        if (tipoAula === "AULA_UNICA") {

                                            if (!value)
                                                return Promise.reject("Informe a data.");

                                            if (Array.isArray(value) && value.length !== 1)
                                                return Promise.reject("Apenas uma data.");

                                            return Promise.resolve();
                                        }

                                        if (tipoAula === "PACOTE_AULA") {

                                            if (!value || value.length !== qtdAulas)
                                                return Promise.reject(
                                                    `Selecione ${qtdAulas} datas.`
                                                );
                                        }

                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <DatePicker
                                multiple={tipoAula === "PACOTE_AULA"}
                                style={{ width: "100%" }}
                                format="DD/MM/YYYY"
                            />
                        </Form.Item>
                    )}
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
                <strong>Modalidade:</strong>{" "}
                {
                    {
                        AULA_UNICA: "Aula Única",
                        PACOTE_AULA: "Pacote de Aulas",
                        AULA_MENSAL: "Aula Mensal",
                    }[values.tipoAula]
                }
            </Text>

            <Text>
                <strong>Serviço:</strong> {values.tipoServico}
            </Text>

            <Text>
                <strong>Local:</strong> {values.endereco}
            </Text>

            <Text>
                <strong>Horário:</strong>{" "}
                {values.horario?.[0]?.format("HH:mm")} -{" "}
                {values.horario?.[1]?.format("HH:mm")}
            </Text>

            {values.tipoAula === "AULA_MENSAL" ? (
                <>
                    <Text>
                        <strong>Data de vencimento:</strong>{" "}
                        {values.dataVencimento?.format("DD/MM/YYYY")}
                    </Text>

                    <Text>
                        <strong>Dias da semana:</strong>{" "}
                        {values.diasSemana?.join(", ")}
                    </Text>
                </>
            ) : (
                <Text>
                    <strong>Datas:</strong>{" "}
                    {Array.isArray(values.datas)
                        ? values.datas
                            .map((data) => data.format("DD/MM/YYYY"))
                            .join(", ")
                        : values.datas?.format("DD/MM/YYYY")}
                </Text>
            )}

            {values.tipoAula === "PACOTE_AULA" && (
                <Text>
                    <strong>Quantidade de aulas:</strong> {values.qtdAulas}
                </Text>
            )}

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

const getFieldsByStep = (step, tipoAula) => {
    switch (step) {
        case 0:
            return ["idProfessor"];

        case 1:
            return ["tipoAula", "tipoServico"];

        case 2:
            if (tipoAula === "AULA_UNICA") {
                return [
                    "endereco",
                    "horario",
                    "datas",
                ];
            }

            if (tipoAula === "PACOTE_AULA") {
                return [
                    "endereco",
                    "horario",
                    "qtdAulas",
                    "datas",
                ];
            }

            if (tipoAula === "AULA_MENSAL") {
                return [
                    "endereco",
                    "horario",
                    "dataVencimento",
                    "diasSemana",
                ];
            }

            return [];

        case 3:
            return [
                "valorTotal",
                "metodoPagamento",
            ];

        default:
            return [];
    }
};

export default AgendamentoModal;