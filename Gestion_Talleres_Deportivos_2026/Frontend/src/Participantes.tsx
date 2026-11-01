
import { useEffect, useState } from "react";
import {
    Search,
    UserPlus,
    Users,
    Eye,
    ChevronDown,
    Filter,
    Download,
    X,
} from "lucide-react";

import { api } from "./services/api";
import type { Participante, PaginaResponse } from "./types";
import { QRCodeCanvas } from "qrcode.react";

function Participantes() {
    const [participantes, setParticipantes] = useState<Participante[]>([]);
    const [busqueda, setBusqueda] = useState("");
    const [filtro, setFiltro] = useState("TODOS");
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [participanteSeleccionado, setParticipanteSeleccionado] =
        useState<Participante | null>(null);

    useEffect(() => {
        async function cargarParticipantes() {
            try {
                setCargando(true);
                setError("");

                const respuesta = await api<PaginaResponse<Participante>>(
                    "/participantes"
                );

                setParticipantes(respuesta.contenido);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "No se pudieron cargar los participantes."
                );
            } finally {
                setCargando(false);
            }
        }

        cargarParticipantes();
    }, []);

    const filtrados = participantes.filter((persona) => {
        const nombreCompleto = `${persona.nombre} ${persona.apellido}`;

        const coincideBusqueda =
            nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
            persona.dni.includes(busqueda) ||
            String(persona.id).includes(busqueda);

        const coincideEstado =
            filtro === "TODOS" || persona.estadoHabilitacion === filtro;

        return coincideBusqueda && coincideEstado;
    });

    const totalHabilitados = participantes.filter(
        (persona) => persona.estadoHabilitacion === "HABILITADO"
    ).length;

    const exportarCSV = () => {
        const encabezados = [
            "ID",
            "Nombre",
            "Apellido",
            "DNI",
            "Facultad",
            "Email",
            "Telefono",
            "Estado",
        ];

        const filas = filtrados.map((p) => [
            p.id,
            p.nombre,
            p.apellido,
            p.dni,
            p.facultad,
            p.email,
            p.telefono,
            p.estadoHabilitacion,
        ]);

        const contenido = [encabezados, ...filas]
            .map((fila) =>
                fila
                    .map((valor) => `"${String(valor ?? "").replace(/"/g, '""')}"`)
                    .join(";")
            )
            .join("\n");

        const archivo = new Blob(["\uFEFF" + contenido], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(archivo);
        const enlace = document.createElement("a");
        enlace.href = url;
        enlace.download = "participantes.csv";
        enlace.click();
        URL.revokeObjectURL(url);
    };

    const formatoFecha = (fecha: string) => {
        if (!fecha) return "No informada";

        const fechaCorta = fecha.substring(0, 10);
        const [anio, mes, dia] = fechaCorta.split("-");

        if (!anio || !mes || !dia) return "No informada";

        return `${dia}/${mes}/${anio}`;
    };

    const descargarQR = () => {
        const canvas = document.querySelector<HTMLCanvasElement>(
            "#qr-participante canvas"
        );

        if (!canvas) {
            alert("No se pudo generar el código QR.");
            return;
        }

        const enlace = document.createElement("a");
        enlace.href = canvas.toDataURL("image/png");
        enlace.download = `credencial-qr-${participanteSeleccionado?.dni || "participante"}.png`;
        enlace.click();
    };

    const textoEstado = (estado: string) =>
        estado === "HABILITADO"
            ? "Habilitado"
            : estado === "PENDIENTE"
                ? "Pendiente"
                : "No habilitado";

    const claseEstado = (estado: string) =>
        estado === "HABILITADO"
            ? "status-enabled"
            : estado === "PENDIENTE"
                ? "status-pending"
                : "status-disabled";

    return (
        <div className="module-page">
            <div className="module-heading">
                <div>
                    <div className="module-eyebrow">GESTIÓN DE PERSONAS</div>
                    <h1>Participantes</h1>
                    <p>
                        Consultá y gestioná las personas registradas en los talleres
                        deportivos.
                    </p>
                </div>

                <button className="primary-button" type="button">
                    <UserPlus size={18} />
                    Nuevo participante
                </button>
            </div>

            <div className="participant-summary">
                <div className="participant-summary-icon">
                    <Users size={23} />
                </div>
                <div>
                    <span>Participantes registrados</span>
                    <strong>{participantes.length.toLocaleString("es-AR")}</strong>
                </div>
            </div>

            <section className="participants-card">
                <div className="participants-toolbar">
                    <div>
                        <h2>Listado de participantes</h2>
                        <p>Consultá la información y el estado de habilitación.</p>
                    </div>

                    <button
                        className="secondary-button"
                        type="button"
                        onClick={exportarCSV}
                    >
                        <Download size={16} />
                        Exportar
                    </button>
                </div>

                <div className="participants-filters">
                    <label className="participants-search">
                        <Search size={18} />
                        <input
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar por nombre, DNI o ID..."
                        />
                    </label>

                    <label className="filter-select">
                        <Filter size={16} />
                        <select
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        >
                            <option value="TODOS">Todos los estados</option>
                            <option value="HABILITADO">Habilitados</option>
                            <option value="NO_HABILITADO">No habilitados</option>
                            <option value="PENDIENTE">Pendientes</option>
                        </select>
                        <ChevronDown size={15} />
                    </label>
                </div>

                <div className="participants-table-wrapper">
                    <table className="participants-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>PARTICIPANTE</th>
                            <th>DNI</th>
                            <th>FACULTAD</th>
                            <th>HABILITACIÓN</th>
                            <th>ACCIÓN</th>
                        </tr>
                        </thead>

                        <tbody>
                        {cargando ? (
                            <tr>
                                <td colSpan={6} className="empty-results">
                                    Cargando participantes...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={6} className="empty-results">
                                    {error}
                                </td>
                            </tr>
                        ) : filtrados.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="empty-results">
                                    No se encontraron participantes.
                                </td>
                            </tr>
                        ) : (
                            filtrados.map((persona) => (
                                <tr key={persona.id}>
                                    <td>{persona.id}</td>

                                    <td>
                                        <div className="participant-name">
                                            <div className="participant-avatar">
                                                {persona.nombre[0]}
                                                {persona.apellido[0]}
                                            </div>
                                            <strong>
                                                {persona.nombre} {persona.apellido}
                                            </strong>
                                        </div>
                                    </td>

                                    <td>{persona.dni}</td>
                                    <td>{persona.facultad || "Sin facultad"}</td>

                                    <td>
                                            <span
                                                className={`participant-status ${claseEstado(persona.estadoHabilitacion)}`}
                                            >
                                                {textoEstado(persona.estadoHabilitacion)}
                                            </span>
                                    </td>

                                    <td>
                                        <button
                                            className="view-button"
                                            title="Ver participante"
                                            type="button"
                                            onClick={() =>
                                                setParticipanteSeleccionado(persona)
                                            }
                                        >
                                            <Eye size={17} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                <div className="participants-footer">
                    Mostrando {filtrados.length} de {participantes.length} participantes
                    registrados · {totalHabilitados} habilitados
                </div>
            </section>

            {participanteSeleccionado && (
                <div
                    className="participant-modal-overlay"
                    onClick={() => setParticipanteSeleccionado(null)}
                >
                    <div
                        className="participant-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="participant-modal-header">
                            <div>
                                <span className="module-eyebrow">
                                    FICHA DEL PARTICIPANTE
                                </span>
                                <h2>
                                    {participanteSeleccionado.nombre}{" "}
                                    {participanteSeleccionado.apellido}
                                </h2>
                                <p>ID interno: {participanteSeleccionado.id}</p>
                            </div>

                            <button
                                type="button"
                                className="participant-modal-close"
                                onClick={() => setParticipanteSeleccionado(null)}
                                title="Cerrar"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="participant-modal-body">
                            <div className="participant-detail">
                                <span>DNI</span>
                                <strong>{participanteSeleccionado.dni}</strong>
                            </div>

                            <div className="participant-detail">
                                <span>Facultad</span>
                                <strong>
                                    {participanteSeleccionado.facultad || "Sin facultad"}
                                </strong>
                            </div>

                            <div className="participant-detail">
                                <span>Fecha de nacimiento</span>
                                <strong>
                                    {formatoFecha(participanteSeleccionado.fechaNacimiento)}
                                </strong>
                            </div>

                            <div className="participant-detail">
                                <span>Sexo</span>
                                <strong>{participanteSeleccionado.sexo}</strong>
                            </div>

                            <div className="participant-detail">
                                <span>Correo electrónico</span>
                                <strong>
                                    {participanteSeleccionado.email || "No informado"}
                                </strong>
                            </div>

                            <div className="participant-detail">
                                <span>Teléfono</span>
                                <strong>
                                    {participanteSeleccionado.telefono || "No informado"}
                                </strong>
                            </div>

                            <div className="participant-detail">
                                <span>Fecha de alta</span>
                                <strong>
                                    {formatoFecha(participanteSeleccionado.fechaAlta)}
                                </strong>
                            </div>

                            <div className="participant-detail">
                                <span>Estado de habilitación</span>
                                <strong
                                    className={`participant-status ${claseEstado(participanteSeleccionado.estadoHabilitacion)}`}
                                >
                                    {textoEstado(participanteSeleccionado.estadoHabilitacion)}
                                </strong>
                            </div>

                            <div className="participant-detail participant-detail-full participant-qr-card">
                                <span>Credencial QR</span>

                                {participanteSeleccionado.qrCode ? (
                                    <>
                                        <div id="qr-participante" className="participant-qr-image">
                                            <QRCodeCanvas
                                                value={participanteSeleccionado.qrCode}
                                                size={220}
                                                level="H"
                                                includeMargin={true}
                                            />
                                        </div>

                                        <small>
                                            Código personal de {participanteSeleccionado.nombre}{" "}
                                            {participanteSeleccionado.apellido}
                                        </small>

                                        <button
                                            type="button"
                                            className="secondary-button"
                                            onClick={descargarQR}
                                        >
                                            <Download size={16} />
                                            Descargar credencial QR
                                        </button>
                                    </>
                                ) : (
                                    <strong>
                                        Todavía no tiene un código QR asignado.
                                    </strong>
                                )}
                            </div>
                        </div>

                        <div className="participant-modal-footer">
                            <button
                                type="button"
                                className="primary-button"
                                onClick={() => setParticipanteSeleccionado(null)}
                            >
                                Cerrar ficha
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Participantes;
