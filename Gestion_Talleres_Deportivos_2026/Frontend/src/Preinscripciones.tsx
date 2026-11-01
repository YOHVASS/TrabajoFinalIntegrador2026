
import { useCallback, useEffect, useState } from "react";
import {
    ClipboardList,
    Search,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw,
} from "lucide-react";

import { api } from "./services/api";
import type { PaginaResponse } from "./types";

type EstadoPreinscripcion =
    | "PENDIENTE"
    | "APROBADA"
    | "RECHAZADA"
    | "LISTA_ESPERA";

interface Preinscripcion {
    id: number;
    fechaSolicitud: string;
    estado: EstadoPreinscripcion;
    idParticipante: number;
    dni: string;
    nombre: string;
    apellido: string;
    sexo: string;
    facultad: string;
    email: string;
    telefono: string;
    estadoHabilitacion: string;
    idTaller: number;
    taller: string;
    disciplina: string;
    periodo: string;
}

type ColumnaOrden =
    | "id"
    | "participante"
    | "dni"
    | "taller"
    | "fecha"
    | "estado";

function Preinscripciones() {
    const [preinscripciones, setPreinscripciones] = useState<Preinscripcion[]>([]);
    const [busqueda, setBusqueda] = useState("");
    const [filtro, setFiltro] = useState("TODOS");
    const [cargando, setCargando] = useState(true);
    const [procesando, setProcesando] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    const [columnaOrden, setColumnaOrden] = useState<ColumnaOrden>("id");
    const [direccionOrden, setDireccionOrden] = useState<"asc" | "desc">("desc");

    const cargarPreinscripciones = useCallback(async () => {
        try {
            setCargando(true);
            setError("");

            const parametros = new URLSearchParams({
                pagina: "0",
                tamanio: "100",
            });

            if (filtro !== "TODOS") {
                parametros.set("estado", filtro);
            }

            const respuesta = await api<PaginaResponse<Preinscripcion>>(
                `/preinscripciones?${parametros.toString()}`
            );

            setPreinscripciones(respuesta.contenido);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudieron cargar las preinscripciones."
            );
        } finally {
            setCargando(false);
        }
    }, [filtro]);

    // Carga las preinscripciones al ingresar y cuando cambia el filtro.
    useEffect(() => {
        const temporizador = window.setTimeout(() => {
            void cargarPreinscripciones();
        }, 0);

        return () => {
            window.clearTimeout(temporizador);
        };
    }, [cargarPreinscripciones]);

    async function aprobar(id: number) {
        try {
            setProcesando(id);
            setError("");
            setMensaje("");

            await api<unknown>(`/preinscripciones/${id}/aprobar`, {
                method: "POST",
            });

            setMensaje("La preinscripción fue aprobada correctamente.");
            await cargarPreinscripciones();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo aprobar la preinscripción."
            );
        } finally {
            setProcesando(null);
        }
    }

    async function rechazar(id: number) {
        const confirmar = window.confirm(
            "¿Estás segura de que deseas rechazar esta preinscripción?"
        );

        if (!confirmar) return;

        try {
            setProcesando(id);
            setError("");
            setMensaje("");

            await api<Preinscripcion>(
                `/preinscripciones/${id}/rechazar`,
                { method: "POST" }
            );

            setMensaje("La preinscripción fue rechazada.");
            await cargarPreinscripciones();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo rechazar la preinscripción."
            );
        } finally {
            setProcesando(null);
        }
    }

    const filtradas = preinscripciones.filter((item) => {
        const nombreCompleto = `${item.nombre} ${item.apellido}`.toLowerCase();
        const texto = busqueda.toLowerCase();

        return (
            nombreCompleto.includes(texto) ||
            item.dni.includes(busqueda) ||
            item.taller.toLowerCase().includes(texto) ||
            String(item.id).includes(busqueda)
        );
    });

    const ordenadas = [...filtradas].sort((a, b) => {
        let comparacion = 0;

        switch (columnaOrden) {
            case "id":
                comparacion = a.id - b.id;
                break;

            case "participante":
                comparacion = `${a.apellido} ${a.nombre}`.localeCompare(
                    `${b.apellido} ${b.nombre}`,
                    "es",
                    { sensitivity: "base" }
                );
                break;

            case "dni":
                comparacion = a.dni.localeCompare(
                    b.dni,
                    "es",
                    { numeric: true }
                );
                break;

            case "taller":
                comparacion = a.taller.localeCompare(
                    b.taller,
                    "es",
                    { sensitivity: "base" }
                );
                break;

            case "fecha":
                comparacion =
                    new Date(a.fechaSolicitud).getTime() -
                    new Date(b.fechaSolicitud).getTime();
                break;

            case "estado":
                comparacion = a.estado.localeCompare(
                    b.estado,
                    "es",
                    { sensitivity: "base" }
                );
                break;
        }

        return direccionOrden === "asc" ? comparacion : -comparacion;
    });

    function ordenarPor(columna: ColumnaOrden) {
        if (columnaOrden === columna) {
            setDireccionOrden((actual) =>
                actual === "asc" ? "desc" : "asc"
            );
        } else {
            setColumnaOrden(columna);
            setDireccionOrden("asc");
        }
    }

    function encabezadoOrdenable(
        texto: string,
        columna: ColumnaOrden
    ) {
        const activo = columnaOrden === columna;

        return (
            <button
                type="button"
                onClick={() => ordenarPor(columna)}
                title={`Ordenar por ${texto.toLowerCase()}`}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                    padding: "0",
                    border: "none",
                    background: "transparent",
                    color: activo ? "#2463d4" : "inherit",
                    font: "inherit",
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                }}
            >
                {texto}
                <span style={{ fontSize: "11px" }}>
                    {activo
                        ? direccionOrden === "asc"
                            ? "▲"
                            : "▼"
                        : "↕"}
                </span>
            </button>
        );
    }

    const pendientes = preinscripciones.filter(
        (item) => item.estado === "PENDIENTE"
    ).length;

    const enEspera = preinscripciones.filter(
        (item) => item.estado === "LISTA_ESPERA"
    ).length;

    function nombreEstado(estado: EstadoPreinscripcion) {
        switch (estado) {
            case "PENDIENTE":
                return "Pendiente";
            case "APROBADA":
                return "Aprobada";
            case "RECHAZADA":
                return "Rechazada";
            case "LISTA_ESPERA":
                return "Lista de espera";
        }
    }

    function claseEstado(estado: EstadoPreinscripcion) {
        switch (estado) {
            case "PENDIENTE":
                return "status-pending";
            case "APROBADA":
                return "status-enabled";
            case "RECHAZADA":
                return "status-disabled";
            case "LISTA_ESPERA":
                return "status-pending";
        }
    }

    function formatoFecha(fecha: string) {
        return new Date(fecha).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    return (
        <div className="module-page">
            <div className="module-heading">
                <div>
                    <div className="module-eyebrow">
                        GESTIÓN DE INSCRIPCIONES
                    </div>
                    <h1>Preinscripciones</h1>
                    <p>
                        Revisá las solicitudes de inscripción a los talleres deportivos.
                    </p>
                </div>

                <button
                    className="secondary-button"
                    type="button"
                    onClick={() => void cargarPreinscripciones()}
                    disabled={cargando}
                >
                    <RefreshCw size={17} />
                    Actualizar
                </button>
            </div>

            <div className="participant-summary">
                <div className="participant-summary-icon">
                    <ClipboardList size={23} />
                </div>
                <div>
                    <span>Solicitudes recibidas</span>
                    <strong>{preinscripciones.length}</strong>
                </div>
            </div>

            <div className="participant-summary">
                <div className="participant-summary-icon">
                    <Clock size={23} />
                </div>
                <div>
                    <span>Pendientes de revisión</span>
                    <strong>{pendientes}</strong>
                </div>
            </div>

            <div className="participant-summary">
                <div className="participant-summary-icon">
                    <Clock size={23} />
                </div>
                <div>
                    <span>En lista de espera</span>
                    <strong>{enEspera}</strong>
                </div>
            </div>

            <section className="participants-card">
                <div className="participants-toolbar">
                    <div>
                        <h2>Bandeja de preinscripciones</h2>
                        <p>
                            Hacé clic en los encabezados para ordenar las solicitudes.
                        </p>
                    </div>
                </div>

                <div className="participants-filters">
                    <label className="participants-search">
                        <Search size={18} />
                        <input
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar por número, participante, DNI o taller..."
                        />
                    </label>

                    <label className="filter-select">
                        <select
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        >
                            <option value="TODOS">Todos los estados</option>
                            <option value="PENDIENTE">Pendientes</option>
                            <option value="APROBADA">Aprobadas</option>
                            <option value="RECHAZADA">Rechazadas</option>
                            <option value="LISTA_ESPERA">Lista de espera</option>
                        </select>
                    </label>
                </div>

                {mensaje && (
                    <p className="success-message">{mensaje}</p>
                )}

                {error && (
                    <p className="login-error">{error}</p>
                )}

                <div className="participants-table-wrapper">
                    <table className="participants-table">
                        <thead>
                        <tr>
                            <th>{encabezadoOrdenable("N.º SOLICITUD", "id")}</th>
                            <th>{encabezadoOrdenable("PARTICIPANTE", "participante")}</th>
                            <th>{encabezadoOrdenable("DNI", "dni")}</th>
                            <th>{encabezadoOrdenable("TALLER", "taller")}</th>
                            <th>{encabezadoOrdenable("FECHA", "fecha")}</th>
                            <th>{encabezadoOrdenable("ESTADO", "estado")}</th>
                            <th>ACCIONES</th>
                        </tr>
                        </thead>

                        <tbody>
                        {cargando ? (
                            <tr>
                                <td colSpan={7} className="empty-results">
                                    Cargando preinscripciones...
                                </td>
                            </tr>
                        ) : ordenadas.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="empty-results">
                                    No se encontraron preinscripciones.
                                </td>
                            </tr>
                        ) : (
                            ordenadas.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <strong>{item.id}</strong>
                                    </td>

                                    <td>
                                        <div className="participant-name">
                                            <div className="participant-avatar">
                                                {item.nombre[0]}
                                                {item.apellido[0]}
                                            </div>
                                            <div>
                                                <strong>
                                                    {item.nombre} {item.apellido}
                                                </strong>
                                                <small>
                                                    {item.facultad || "Sin facultad"}
                                                </small>
                                            </div>
                                        </div>
                                    </td>

                                    <td>{item.dni}</td>

                                    <td>
                                        <strong>{item.taller}</strong>
                                        <br />
                                        <small>{item.disciplina}</small>
                                    </td>

                                    <td>{formatoFecha(item.fechaSolicitud)}</td>

                                    <td>
                                            <span
                                                className={`participant-status ${claseEstado(item.estado)}`}
                                            >
                                                {nombreEstado(item.estado)}
                                            </span>
                                    </td>

                                    <td>
                                        {item.estado === "PENDIENTE" ? (
                                            <div className="preinscripcion-actions">
                                                <button
                                                    className="view-button"
                                                    type="button"
                                                    title="Aprobar"
                                                    disabled={procesando !== null}
                                                    onClick={() => void aprobar(item.id)}
                                                >
                                                    {procesando === item.id ? (
                                                        "..."
                                                    ) : (
                                                        <CheckCircle size={18} />
                                                    )}
                                                </button>

                                                <button
                                                    className="view-button"
                                                    type="button"
                                                    title="Rechazar"
                                                    disabled={procesando !== null}
                                                    onClick={() => void rechazar(item.id)}
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span>Sin acciones</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                <div className="participants-footer">
                    Mostrando {ordenadas.length} de {preinscripciones.length} solicitudes
                </div>
            </section>
        </div>
    );
}

export default Preinscripciones;
