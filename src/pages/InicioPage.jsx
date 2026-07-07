import { useEffect, useState } from "react";
import {
    Button,
    Card,
    Col,
    Empty,
    message,
    Modal,
    Row,
    Space,
    Spin,
    Tag,
    Typography,
} from "antd";
import { ClockCircleOutlined, EnvironmentOutlined, PlusOutlined } from "@ant-design/icons";
import { aprovarAgendamento, getAgendaUsuario, recusarAgendamento } from "../services/agendaService";
import { getCurrentProfile, getUser } from "../services/authService";
import AgendamentoModal from "../components/AgendamentoModal";

const { Title, Text } = Typography;

const InicioPage = () => {
    const [agenda, setAgenda] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openAgendamento, setOpenAgendamento] = useState(false);
    const currentProfile = getCurrentProfile();

    const user = getUser();

    useEffect(() => {
        carregarAgenda();
    }, []);

    const carregarAgenda = async () => {
        try {
            setLoading(true);
            const data = await getAgendaUsuario(user.usuarioId);
            setAgenda(data);
        } catch (error) {
            message.error("Erro ao carregar agenda");
        } finally {
            setLoading(false);
        }
    };

    const handleAprovar = (idContrato) => {
        Modal.confirm({
            title: "Aprovar agendamento?",
            content: "Ao aprovar, o agendamento ficará confirmado para o aluno.",
            okText: "Aprovar",
            cancelText: "Cancelar",
            onOk: async () => {
                try {
                    await aprovarAgendamento(idContrato);
                    message.success("Agendamento aprovado");
                    carregarAgenda();
                } catch {
                    message.error("Erro ao aprovar agendamento");
                }
            },
        });
    };

    const handleRecusar = (idContrato) => {
        Modal.confirm({
            title: "Recusar agendamento?",
            content: "O agendamento será cancelado e não aparecerá mais na sua agenda.",
            okText: "Recusar",
            cancelText: "Cancelar",
            okButtonProps: {
                danger: true,
            },
            onOk: async () => {
                try {
                    await recusarAgendamento(idContrato);
                    message.success("Agendamento recusado");
                    carregarAgenda();
                } catch {
                    message.error("Erro ao recusar agendamento");
                }
            },
        });
    };

    return (
        <Card>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 24,
                }}
            >
                <Title level={3} style={{ margin: 0 }}>
                    Minha agenda
                </Title>
                {currentProfile != "PROFESSOR" && (
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setOpenAgendamento(true)}
                    >
                        Novo agendamento
                    </Button>
                )}
            </div>

            <AgendamentoModal
                open={openAgendamento}
                onClose={() => setOpenAgendamento(false)}
                onSuccess={carregarAgenda}
            />

            {loading ? (
                <Spin />
            ) : agenda.length === 0 ? (
                <Empty description="Nenhuma aula agendada" />
            ) : (
                <Row gutter={[16, 16]}>
                    {agenda.map((item) => (
                        ((currentProfile === "PROFESSOR" &&
                            item.statusContrato !== "RECUSADO" &&
                            item.statusContrato !== "CANCELADO") ||
                            currentProfile !== "PROFESSOR") && (
                            <Col
                                key={item.idAula}
                                xs={24}
                                sm={24}
                                md={12}
                                lg={12}
                                xl={8}
                            >
                                <Card
                                    hoverable
                                    title={getTituloAgenda(item)}
                                    extra={
                                        <Tag color={getStatusColor(item.statusContrato)}>
                                            {formatarStatus(item.statusContrato)}
                                        </Tag>
                                    }
                                >
                                    <Space direction="vertical" size={6}>
                                        <Text>
                                            <ClockCircleOutlined />{" "}
                                            {item.horaInicio} - {item.horaFim}
                                        </Text>

                                        <Text>
                                            <EnvironmentOutlined /> {item.endereco}
                                        </Text>

                                        <Text>
                                            <strong>Tipo:</strong> {formatarTipoAula(item.tipoAula)}
                                        </Text>

                                        <Text>
                                            <strong>Serviço:</strong> {item.servico}
                                        </Text>

                                        {item.tipoAula === "AULA_MENSAL" ? (
                                            <>
                                                <Text>
                                                    <strong>Vencimento:</strong>{" "}
                                                    {formatarData(item.dataVencimento)}
                                                </Text>

                                                <Text>
                                                    <strong>Dias:</strong>{" "}
                                                    {item.diasSemana?.join(", ")}
                                                </Text>
                                            </>
                                        ) : (
                                            <Text>
                                                <strong>Datas:</strong>{" "}
                                                {item.datas?.map(formatarData).join(", ")}
                                            </Text>
                                        )}

                                        <Text>
                                            <strong>Professor:</strong> {item.professor}
                                        </Text>

                                        <Text>
                                            <strong>Contratante:</strong> {item.contratante}
                                        </Text>

                                        {item.statusContrato === "AGUARDANDO_APROVACAO" &&
                                            currentProfile === "PROFESSOR" && (
                                                <Space style={{ marginTop: 8 }}>
                                                    <Button
                                                        type="primary"
                                                        size="small"
                                                        onClick={() => handleAprovar(item.idContrato)}
                                                    >
                                                        Aprovar
                                                    </Button>

                                                    <Button
                                                        danger
                                                        size="small"
                                                        onClick={() => handleRecusar(item.idContrato)}
                                                    >
                                                        Recusar
                                                    </Button>
                                                </Space>
                                            )}
                                    </Space>
                                </Card>
                            </Col>
                        )
                    ))}
                </Row>
            )}
        </Card>
    );
};

const formatarData = (data) => {
    if (!data) return "";
    return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR");
};

const formatarStatus = (status) => {
    const labels = {
        AGUARDANDO_APROVACAO: "Aguardando aprovação",
        AGENDADO: "Agendado",
        RECUSADO: "Recusado",
        CANCELADO: "Cancelado",
        FINALIZADO: "Finalizado",
    };

    return labels[status] || status;
};

const getStatusColor = (status) => {
    const colors = {
        AGUARDANDO_APROVACAO: "orange",
        AGENDADO: "green",
        RECUSADO: "red",
        CANCELADO: "default",
        FINALIZADO: "blue",
    };

    return colors[status] || "default";
};

const getTituloAgenda = (item) => {
    if (item.tipoAula === "AULA_MENSAL") {
        return "Aula mensal";
    }

    if (item.datas?.length === 1) {
        return formatarData(item.datas[0]);
    }

    return `${item.datas?.length || 0} aulas agendadas`;
};

const formatarTipoAula = (tipo) => {
    const labels = {
        AULA_UNICA: "Aula única",
        PACOTE_AULA: "Pacote de aulas",
        AULA_MENSAL: "Aula mensal",
    };

    return labels[tipo] || tipo;
};

export default InicioPage;