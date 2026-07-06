import { useEffect, useState } from "react";
import { Card, Col, Empty, message, Row, Space, Spin, Tag, Typography } from "antd";
import { ClockCircleOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { getAgendaUsuario } from "../services/agendaService";
import { getUser } from "../services/authService";

const { Title, Text } = Typography;

const InicioPage = () => {
    const [agenda, setAgenda] = useState([]);
    const [loading, setLoading] = useState(false);

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

    return (
        <Card>
            <Title level={3}>Minha agenda</Title>

            {loading ? (
                <Spin />
            ) : agenda.length === 0 ? (
                <Empty description="Nenhuma aula agendada" />
            ) : (
                <Row gutter={[16, 16]}>
                    {agenda.map((item) => (
                        <Col
                            key={`${item.idAula}-${item.dataAula}`}
                            xs={24}
                            sm={24}
                            md={12}
                            lg={8}
                            xl={6}
                        >
                            <Card
                                hoverable
                                title={formatarData(item.dataAula)}
                                extra={
                                    <Tag color="blue">
                                        {item.statusContrato}
                                    </Tag>
                                }
                            >
                                <Space direction="vertical" size={6}>
                                    <Text>
                                        <ClockCircleOutlined />{" "}
                                        {item.horaInicio} - {item.horaFim}
                                    </Text>

                                    <Text>
                                        <EnvironmentOutlined />{" "}
                                        {item.endereco}
                                    </Text>

                                    <Text>
                                        <strong>Serviço:</strong> {item.servico}
                                    </Text>

                                    <Text>
                                        <strong>Professor:</strong> {item.professor}
                                    </Text>

                                    <Text>
                                        <strong>Contratante:</strong> {item.contratante}
                                    </Text>
                                </Space>
                            </Card>
                        </Col>
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

export default InicioPage;