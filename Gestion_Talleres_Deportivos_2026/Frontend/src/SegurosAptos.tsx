
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ShieldCheck,
    HeartPulse,
    Users,
    Search,
    RefreshCw,
    CalendarDays,
    FileText,
    AlertCircle,
    CheckCircle2,
    Clock,
    X,
    Pencil,
    Trash2,
} from "lucide-react";
import { api } from "./services/api";
import type { Participante, PaginaResponse } from "./types";
import "./SegurosAptos.css";

type Estado = "VIGENTE" | "VENCIDO";

interface Seguro {
    id: number;
    idParticipante: number;
    dni: string;
    participante: string;
    idPeriodo: number;
    periodo: string;
    numeroPoliza: string | null;
    fechaPago: string;
    vigenciaDesde: string;
    vigenciaHasta: string;
    estado: Estado;
    informadoProductora: boolean;
}

interface AptoMedico {
    id: number;
    idParticipante: number;
    fechaEmision: string;
    fechaVencimiento: string;
    archivoUrl: string | null;
    estado: Estado;
}

interface Periodo {
    id: number;
    codigo: string;
    fechaInicio: string;
    fechaFin: string;
    vigente: boolean;
}

const fecha = (valor?: string | null) => {
    if (!valor) return "—";
    const [anio, mes, dia] = valor.split("-");
    return `${dia}/${mes}/${anio}`;
};

const nombreCompleto = (p: Participante) =>
    `${p.nombre} ${p.apellido}`;

function SegurosAptos() {
    const [participantes, setParticipantes] = useState<Participante[]>([]);
    const [periodos, setPeriodos] = useState<Periodo[]>([]);
    const [participanteSeleccionado, setParticipanteSeleccionado] =
        useState<Participante | null>(null);
    const [seguros, setSeguros] = useState<Seguro[]>([]);
    const [aptos, setAptos] = useState<AptoMedico[]>([]);
    const [altasPendientes, setAltasPendientes] = useState<Seguro[]>([]);
    const [busqueda, setBusqueda] = useState("");
    const [periodoFiltro, setPeriodoFiltro] = useState("");
    const [seccion, setSeccion] = useState<"seguros" | "aptos" | "productora">("seguros");
    const [cargando, setCargando] = useState(true);
    const [cargandoDetalle, setCargandoDetalle] = useState(false);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    // Formulario de seguros
    const [mostrarFormularioSeguro, setMostrarFormularioSeguro] = useState(false);
    const [numeroPoliza, setNumeroPoliza] = useState("");
    const [fechaPago, setFechaPago] = useState("");
    const [vigenciaDesde, setVigenciaDesde] = useState("");
    const [vigenciaHasta, setVigenciaHasta] = useState("");
    const [periodoSeguro, setPeriodoSeguro] = useState("");

    // Edición y eliminación de seguros
    const [seguroEditando, setSeguroEditando] = useState<Seguro | null>(null);
    const [guardandoSeguro, setGuardandoSeguro] = useState(false);
    const [eliminandoSeguro, setEliminandoSeguro] = useState<number | null>(null);

    // Formulario de aptos médicos
    const [mostrarFormularioApto, setMostrarFormularioApto] = useState(false);
    const [fechaEmision, setFechaEmision] = useState("");
    const [fechaVencimiento, setFechaVencimiento] = useState("");
    const [archivoApto, setArchivoApto] = useState<File | null>(null);
    const [guardandoApto, setGuardandoApto] = useState(false);

    // Edición y eliminación de aptos médicos
    const [aptoEditando, setAptoEditando] = useState<AptoMedico | null>(null);
    const [eliminandoApto, setEliminandoApto] = useState<number | null>(null);

    const cargarBase = useCallback(async () => {
        setCargando(true);
        setError("");

        try {
            const [respuestaParticipantes, respuestaPeriodos, respuestaPendientes] =
                await Promise.all([
                    api<PaginaResponse<Participante>>(
                        "/participantes?pagina=0&tamanio=100"
                    ),
                    api<Periodo[]>("/periodos"),
                    api<Seguro[]>("/seguros/altas-pendientes"),
                ]);

            setParticipantes(respuestaParticipantes.contenido);
            setPeriodos(respuestaPeriodos);
            setAltasPendientes(respuestaPendientes);
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "No se pudieron cargar los datos del módulo."
            );
        } finally {
            setCargando(false);
        }
    }, []);

    const cargarDetalle = useCallback(async (participante: Participante) => {
        setCargandoDetalle(true);
        setError("");
        setParticipanteSeleccionado(participante);
        setSeguros([]);
        setAptos([]);

        try {
            const [segurosRespuesta, aptosRespuesta] = await Promise.all([
                api<Seguro[]>(`/participantes/${participante.id}/seguros`),
                api<AptoMedico[]>(`/participantes/${participante.id}/aptos-medicos`),
            ]);

            setSeguros(segurosRespuesta);
            setAptos(aptosRespuesta);
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "No se pudieron cargar los registros del participante."
            );
        } finally {
            setCargandoDetalle(false);
        }
    }, []);

    const actualizarPendientes = async () => {
        const pendientes = await api<Seguro[]>("/seguros/altas-pendientes");
        setAltasPendientes(pendientes);
    };

    useEffect(() => {
        const temporizador = window.setTimeout(() => {
            void cargarBase();
        }, 0);

        return () => {
            window.clearTimeout(temporizador);
        };
    }, [cargarBase]);

    const participantesFiltrados = useMemo(() => {
        const texto = busqueda.trim().toLowerCase();
        if (!texto) return participantes;

        return participantes.filter((p) =>
            `${p.nombre} ${p.apellido} ${p.dni}`
                .toLowerCase()
                .includes(texto)
        );
    }, [participantes, busqueda]);

    const segurosVigentes = seguros.filter((s) => s.estado === "VIGENTE").length;
    const aptosVigentes = aptos.filter((a) => a.estado === "VIGENTE").length;
    const segurosVencidos = seguros.filter((s) => s.estado === "VENCIDO").length;

    const pendientesFiltradas = altasPendientes.filter((s) =>
        !periodoFiltro || String(s.idPeriodo) === periodoFiltro
    );

    const abrirArchivo = async (url?: string | null) => {
        if (!url) {
            setError("Este registro no tiene un archivo adjunto.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const respuesta = await fetch(`http://localhost:8080${url}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            if (!respuesta.ok) throw new Error("No se pudo abrir el archivo.");

            const blob = await respuesta.blob();
            const blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl, "_blank", "noopener,noreferrer");
            setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Error al abrir el archivo.");
        }
    };

    const descargarCsv = async () => {
        try {
            const token = localStorage.getItem("token");
            const query = periodoFiltro ? `?idPeriodo=${periodoFiltro}` : "";
            const respuesta = await fetch(
                `http://localhost:8080/api/seguros/altas-pendientes/csv${query}`,
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );

            if (!respuesta.ok) throw new Error("No se pudo descargar el CSV.");

            const blob = await respuesta.blob();
            const url = URL.createObjectURL(blob);
            const enlace = document.createElement("a");
            enlace.href = url;
            enlace.download = "altas-pendientes-productora.csv";
            enlace.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Error al descargar el CSV.");
        }
    };

    const informarProductora = async () => {
        if (!window.confirm(
            `¿Confirmás informar ${pendientesFiltradas.length} alta(s) a la productora?`
        )) return;

        try {
            setError("");
            setMensaje("");

            await api<Seguro[]>("/seguros/informar-productora", {
                method: "POST",
                body: JSON.stringify({
                    idsSeguros: pendientesFiltradas.map((s) => s.id),
                    idPeriodo: periodoFiltro ? Number(periodoFiltro) : null,
                }),
            });

            setMensaje("Las altas seleccionadas fueron informadas a la productora.");
            await actualizarPendientes();
        } catch (e) {
            setError(e instanceof Error ? e.message : "No se pudieron informar las altas.");
        }
    };

    // Registrar seguro
    const registrarSeguro = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!participanteSeleccionado) {
            setError("Primero seleccioná un participante.");
            return;
        }

        if (!periodoSeguro || !fechaPago) {
            setError("El período y la fecha de pago son obligatorios.");
            return;
        }

        if (fechaPago > new Date().toLocaleDateString("en-CA")) {
            setError("La fecha de pago no puede ser futura.");
            return;
        }

        if (vigenciaDesde && vigenciaHasta && vigenciaHasta < vigenciaDesde) {
            setError("La fecha de vencimiento no puede ser anterior al inicio de vigencia.");
            return;
        }

        try {
            setError("");
            setMensaje("");

            await api<Seguro>(
                `/participantes/${participanteSeleccionado.id}/seguros`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        idPeriodo: Number(periodoSeguro),
                        numeroPoliza: numeroPoliza.trim() || null,
                        fechaPago,
                        vigenciaDesde: vigenciaDesde || null,
                        vigenciaHasta: vigenciaHasta || null,
                    }),
                }
            );

            setMensaje("El seguro se registró correctamente.");
            setMostrarFormularioSeguro(false);
            setNumeroPoliza("");
            setFechaPago("");
            setVigenciaDesde("");
            setVigenciaHasta("");
            setPeriodoSeguro("");

            await cargarDetalle(participanteSeleccionado);
            await actualizarPendientes();
        } catch (e) {
            setError(
                e instanceof Error ? e.message : "No se pudo registrar el seguro."
            );
        }
    };

    // Preparar edición de seguro
    const iniciarEdicionSeguro = (seguro: Seguro) => {
        setError("");
        setMensaje("");
        setMostrarFormularioSeguro(false);
        setSeguroEditando(seguro);

        setPeriodoSeguro(String(seguro.idPeriodo));
        setNumeroPoliza(seguro.numeroPoliza || "");
        setFechaPago(seguro.fechaPago);
        setVigenciaDesde(seguro.vigenciaDesde || "");
        setVigenciaHasta(seguro.vigenciaHasta || "");
    };

    // Cancelar edición de seguro
    const cancelarEdicionSeguro = () => {
        setSeguroEditando(null);
        setPeriodoSeguro("");
        setNumeroPoliza("");
        setFechaPago("");
        setVigenciaDesde("");
        setVigenciaHasta("");
        setError("");
    };

    // Guardar cambios del seguro
    const editarSeguro = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!seguroEditando || !participanteSeleccionado) return;

        if (!periodoSeguro || !fechaPago) {
            setError("El período y la fecha de pago son obligatorios.");
            return;
        }

        if (fechaPago > new Date().toLocaleDateString("en-CA")) {
            setError("La fecha de pago no puede ser futura.");
            return;
        }

        if (vigenciaDesde && vigenciaHasta && vigenciaHasta < vigenciaDesde) {
            setError("La fecha de vencimiento no puede ser anterior al inicio de vigencia.");
            return;
        }

        try {
            setError("");
            setMensaje("");
            setGuardandoSeguro(true);

            await api<Seguro>(`/seguros/${seguroEditando.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    idPeriodo: Number(periodoSeguro),
                    numeroPoliza: numeroPoliza.trim() || null,
                    fechaPago,
                    vigenciaDesde: vigenciaDesde || null,
                    vigenciaHasta: vigenciaHasta || null,
                }),
            });

            setMensaje("El seguro se actualizó correctamente.");
            cancelarEdicionSeguro();

            await cargarDetalle(participanteSeleccionado);
            await actualizarPendientes();
        } catch (e) {
            setError(
                e instanceof Error ? e.message : "No se pudo actualizar el seguro."
            );
        } finally {
            setGuardandoSeguro(false);
        }
    };

    // Eliminar seguro
    const eliminarSeguro = async (seguro: Seguro) => {
        const confirmar = window.confirm(
            `¿Estás segura de que querés eliminar el seguro ${seguro.numeroPoliza || "sin número de póliza"} de ${seguro.participante}? Esta acción no se puede deshacer.`
        );

        if (!confirmar) return;

        try {
            setError("");
            setMensaje("");
            setEliminandoSeguro(seguro.id);

            await api<void>(`/seguros/${seguro.id}`, {
                method: "DELETE",
            });

            if (seguroEditando?.id === seguro.id) {
                cancelarEdicionSeguro();
            }

            setMensaje("El seguro se eliminó correctamente.");

            await cargarDetalle(participanteSeleccionado!);
            await actualizarPendientes();
        } catch (e) {
            setError(
                e instanceof Error ? e.message : "No se pudo eliminar el seguro."
            );
        } finally {
            setEliminandoSeguro(null);
        }
    };

    // Registrar apto médico y subir certificado
    const registrarApto = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!participanteSeleccionado) {
            setError("Primero seleccioná un participante.");
            return;
        }

        if (!fechaEmision) {
            setError("La fecha de emisión es obligatoria.");
            return;
        }

        if (fechaEmision > new Date().toLocaleDateString("en-CA")) {
            setError("La fecha de emisión no puede ser futura.");
            return;
        }

        if (fechaVencimiento && fechaVencimiento < fechaEmision) {
            setError("La fecha de vencimiento no puede ser anterior a la emisión.");
            return;
        }

        if (archivoApto && archivoApto.size > 5 * 1024 * 1024) {
            setError("El archivo no puede superar los 5 MB.");
            return;
        }

        if (
            archivoApto &&
            !["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(
                archivoApto.type
            )
        ) {
            setError("El archivo debe ser PDF, JPG, PNG o WEBP.");
            return;
        }

        try {
            setError("");
            setMensaje("");
            setGuardandoApto(true);

            let archivoUrl: string | null = null;

            if (archivoApto) {
                const formData = new FormData();
                formData.append("archivo", archivoApto);

                const token = localStorage.getItem("token");

                const respuestaArchivo = await fetch(
                    "http://localhost:8080/api/archivos",
                    {
                        method: "POST",
                        headers: token
                            ? { Authorization: `Bearer ${token}` }
                            : {},
                        body: formData,
                    }
                );

                if (!respuestaArchivo.ok) {
                    const detalle = await respuestaArchivo.text();
                    throw new Error(detalle || "No se pudo subir el certificado.");
                }

                const resultado: { url: string } = await respuestaArchivo.json();
                archivoUrl = resultado.url;
            }

            await api<AptoMedico>(
                `/participantes/${participanteSeleccionado.id}/aptos-medicos`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        fechaEmision,
                        fechaVencimiento: fechaVencimiento || null,
                        archivoUrl,
                    }),
                }
            );

            setMensaje("El apto médico se registró correctamente.");
            setMostrarFormularioApto(false);
            setFechaEmision("");
            setFechaVencimiento("");
            setArchivoApto(null);

            await cargarDetalle(participanteSeleccionado);
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "No se pudo registrar el apto médico."
            );
        } finally {
            setGuardandoApto(false);
        }
    };

    // Preparar formulario de edición de apto
    const iniciarEdicionApto = (apto: AptoMedico) => {
        setError("");
        setMensaje("");
        setMostrarFormularioApto(false);
        setAptoEditando(apto);
        setFechaEmision(apto.fechaEmision);
        setFechaVencimiento(apto.fechaVencimiento || "");
        setArchivoApto(null);
    };

    // Guardar cambios del apto médico
    const editarApto = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!aptoEditando || !participanteSeleccionado) return;

        if (!fechaEmision) {
            setError("La fecha de emisión es obligatoria.");
            return;
        }

        if (fechaEmision > new Date().toLocaleDateString("en-CA")) {
            setError("La fecha de emisión no puede ser futura.");
            return;
        }

        if (fechaVencimiento && fechaVencimiento < fechaEmision) {
            setError("La fecha de vencimiento no puede ser anterior a la emisión.");
            return;
        }

        try {
            setError("");
            setMensaje("");
            setGuardandoApto(true);

            await api<AptoMedico>(`/aptos-medicos/${aptoEditando.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    fechaEmision,
                    fechaVencimiento: fechaVencimiento || null,
                    archivoUrl: aptoEditando.archivoUrl,
                }),
            });

            setMensaje("El apto médico se actualizó correctamente.");
            setAptoEditando(null);
            setFechaEmision("");
            setFechaVencimiento("");
            setArchivoApto(null);

            await cargarDetalle(participanteSeleccionado);
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "No se pudo actualizar el apto médico."
            );
        } finally {
            setGuardandoApto(false);
        }
    };

    // Cancelar edición de apto
    const cancelarEdicionApto = () => {
        setAptoEditando(null);
        setFechaEmision("");
        setFechaVencimiento("");
        setArchivoApto(null);
        setError("");
    };

    // Eliminar apto médico
    const eliminarApto = async (apto: AptoMedico) => {
        const confirmar = window.confirm(
            `¿Estás segura de que querés eliminar el apto médico emitido el ${fecha(apto.fechaEmision)}? Esta acción no se puede deshacer.`
        );

        if (!confirmar) return;

        try {
            setError("");
            setMensaje("");
            setEliminandoApto(apto.id);

            await api<void>(`/aptos-medicos/${apto.id}`, {
                method: "DELETE",
            });

            if (aptoEditando?.id === apto.id) {
                cancelarEdicionApto();
            }

            setMensaje("El apto médico se eliminó correctamente.");

            if (participanteSeleccionado) {
                await cargarDetalle(participanteSeleccionado);
            }
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "No se pudo eliminar el apto médico."
            );
        } finally {
            setEliminandoApto(null);
        }
    };

    return (
        <div className="seguros-page">
            <div className="module-heading">
                <div>
                    <span className="module-eyebrow">GESTIÓN ADMINISTRATIVA</span>
                    <h1>Seguros y aptos médicos</h1>
                    <p>Controlá las coberturas y la vigencia de los requisitos de salud.</p>
                </div>
                <button className="secondary-button" onClick={() => void cargarBase()}>
                    <RefreshCw size={16} /> Actualizar
                </button>
            </div>

            {error && (
                <div className="seguros-message error-message">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                    <button onClick={() => setError("")}><X size={16} /></button>
                </div>
            )}

            {mensaje && (
                <div className="seguros-message success-message">
                    <CheckCircle2 size={18} />
                    <span>{mensaje}</span>
                    <button onClick={() => setMensaje("")}><X size={16} /></button>
                </div>
            )}

            <section className="seguros-summary">
                <article className="seguros-stat">
                    <div className="seguros-stat-icon blue-stat"><Users size={21} /></div>
                    <div><span>Participantes cargados</span><strong>{participantes.length}</strong></div>
                </article>
                <article className="seguros-stat">
                    <div className="seguros-stat-icon green-stat"><ShieldCheck size={21} /></div>
                    <div><span>Seguros vigentes</span><strong>{segurosVigentes}</strong></div>
                </article>
                <article className="seguros-stat">
                    <div className="seguros-stat-icon red-stat"><ShieldCheck size={21} /></div>
                    <div><span>Seguros vencidos</span><strong>{segurosVencidos}</strong></div>
                </article>
                <article className="seguros-stat">
                    <div className="seguros-stat-icon orange-stat"><HeartPulse size={21} /></div>
                    <div><span>Aptos médicos vigentes</span><strong>{aptosVigentes}</strong></div>
                </article>
            </section>

            <div className="seguros-tabs">
                <button
                    className={seccion === "seguros" ? "active" : ""}
                    onClick={() => setSeccion("seguros")}
                >
                    <ShieldCheck size={17} /> Seguros
                </button>
                <button
                    className={seccion === "aptos" ? "active" : ""}
                    onClick={() => setSeccion("aptos")}
                >
                    <HeartPulse size={17} /> Aptos médicos
                </button>
                <button
                    className={seccion === "productora" ? "active" : ""}
                    onClick={() => setSeccion("productora")}
                >
                    <FileText size={17} /> Productora
                    {altasPendientes.length > 0 && <span>{altasPendientes.length}</span>}
                </button>
            </div>

            {seccion === "productora" ? (
                <section className="seguros-card">
                    <div className="seguros-card-heading">
                        <div>
                            <h2>Altas pendientes de informar</h2>
                            <p>Consultá y prepará las altas de seguros para enviar a la productora.</p>
                        </div>
                        <strong className="seguros-count">{pendientesFiltradas.length}</strong>
                    </div>

                    <div className="seguros-toolbar">
                        <label>
                            Período
                            <select
                                value={periodoFiltro}
                                onChange={(e) => setPeriodoFiltro(e.target.value)}
                            >
                                <option value="">Todos los períodos</option>
                                {periodos.map((p) => (
                                    <option key={p.id} value={p.id}>{p.codigo}</option>
                                ))}
                            </select>
                        </label>
                        <div className="seguros-toolbar-actions">
                            <button className="secondary-button" onClick={() => void descargarCsv()}>
                                <FileText size={16} /> Descargar CSV
                            </button>
                            <button
                                className="primary-button"
                                disabled={!pendientesFiltradas.length}
                                onClick={() => void informarProductora()}
                            >
                                <CheckCircle2 size={16} /> Informar altas
                            </button>
                        </div>
                    </div>

                    <div className="seguros-table-wrap">
                        <table className="seguros-table">
                            <thead>
                            <tr>
                                <th>Participante</th>
                                <th>DNI</th>
                                <th>Período</th>
                                <th>Póliza</th>
                                <th>Vigencia hasta</th>
                            </tr>
                            </thead>
                            <tbody>
                            {pendientesFiltradas.map((s) => (
                                <tr key={s.id}>
                                    <td>{s.participante}</td>
                                    <td>{s.dni}</td>
                                    <td>{s.periodo}</td>
                                    <td>{s.numeroPoliza || "—"}</td>
                                    <td>{fecha(s.vigenciaHasta)}</td>
                                </tr>
                            ))}
                            {!pendientesFiltradas.length && (
                                <tr>
                                    <td colSpan={5} className="seguros-empty">
                                        No hay altas pendientes para este período.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </section>
            ) : (
                <div className="seguros-layout">
                    <section className="seguros-card seguros-participants">
                        <div className="seguros-card-heading">
                            <div>
                                <h2>Participantes</h2>
                                <p>Seleccioná una persona para consultar sus registros.</p>
                            </div>
                            <strong className="seguros-count">{participantes.length}</strong>
                        </div>

                        <label className="seguros-search">
                            <Search size={17} />
                            <input
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                placeholder="Buscar por nombre o DNI..."
                            />
                        </label>

                        {cargando ? (
                            <div className="seguros-empty">Cargando participantes...</div>
                        ) : (
                            <div className="seguros-participant-list">
                                {participantesFiltrados.map((p) => (
                                    <button
                                        key={p.id}
                                        className={`seguros-participant ${participanteSeleccionado?.id === p.id ? "selected" : ""}`}
                                        onClick={() => {
                                            cancelarEdicionApto();
                                            cancelarEdicionSeguro();
                                            setMostrarFormularioSeguro(false);
                                            setMostrarFormularioApto(false);
                                            void cargarDetalle(p);
                                        }}
                                    >
                                        <span className="seguros-avatar">
                                            {p.nombre.charAt(0)}{p.apellido.charAt(0)}
                                        </span>
                                        <span className="seguros-participant-info">
                                            <strong>{nombreCompleto(p)}</strong>
                                            <small>DNI {p.dni}</small>
                                        </span>
                                    </button>
                                ))}
                                {!participantesFiltrados.length && (
                                    <div className="seguros-empty">
                                        No se encontraron participantes.
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    <section className="seguros-card seguros-records">
                        {!participanteSeleccionado ? (
                            <div className="seguros-no-selection">
                                <div><Users size={30} /></div>
                                <h2>Seleccioná un participante</h2>
                                <p>
                                    Elegí una persona de la lista para consultar sus{" "}
                                    {seccion === "seguros" ? "seguros" : "aptos médicos"}.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="seguros-card-heading selected-heading">
                                    <div>
                                        <h2>{nombreCompleto(participanteSeleccionado)}</h2>
                                        <p>
                                            DNI {participanteSeleccionado.dni} ·{" "}
                                            {participanteSeleccionado.facultad}
                                        </p>
                                    </div>
                                    <div className="seguros-heading-actions">
                                        <span className="seguros-count">
                                            {seccion === "seguros" ? seguros.length : aptos.length} registros
                                        </span>

                                        {seccion === "seguros" && (
                                            <button
                                                className="primary-button"
                                                onClick={() => {
                                                    cancelarEdicionSeguro();
                                                    setMostrarFormularioSeguro(!mostrarFormularioSeguro);
                                                }}
                                                disabled={guardandoSeguro || eliminandoSeguro !== null}
                                            >
                                                {mostrarFormularioSeguro ? "Cancelar" : "+ Registrar seguro"}
                                            </button>
                                        )}

                                        {seccion === "aptos" && (
                                            <button
                                                className="primary-button"
                                                onClick={() => {
                                                    cancelarEdicionApto();
                                                    setMostrarFormularioApto(!mostrarFormularioApto);
                                                }}
                                            >
                                                {mostrarFormularioApto ? "Cancelar" : "+ Registrar apto"}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {seccion === "seguros" && mostrarFormularioSeguro && (
                                    <form className="seguros-form" onSubmit={registrarSeguro}>
                                        <h3>Registrar nuevo seguro</h3>

                                        <label>
                                            Período *
                                            <select
                                                value={periodoSeguro}
                                                onChange={(e) => setPeriodoSeguro(e.target.value)}
                                                required
                                            >
                                                <option value="">Seleccionar período</option>
                                                {periodos.map((p) => (
                                                    <option key={p.id} value={p.id}>{p.codigo}</option>
                                                ))}
                                            </select>
                                        </label>

                                        <label>
                                            Número de póliza
                                            <input
                                                value={numeroPoliza}
                                                onChange={(e) => setNumeroPoliza(e.target.value)}
                                                maxLength={50}
                                                placeholder="Número de póliza"
                                            />
                                        </label>

                                        <label>
                                            Fecha de pago *
                                            <input
                                                type="date"
                                                value={fechaPago}
                                                max={new Date().toLocaleDateString("en-CA")}
                                                onChange={(e) => setFechaPago(e.target.value)}
                                                required
                                            />
                                        </label>

                                        <label>
                                            Vigencia desde
                                            <input
                                                type="date"
                                                value={vigenciaDesde}
                                                onChange={(e) => setVigenciaDesde(e.target.value)}
                                            />
                                        </label>

                                        <label>
                                            Vigencia hasta
                                            <input
                                                type="date"
                                                value={vigenciaHasta}
                                                min={vigenciaDesde || undefined}
                                                onChange={(e) => setVigenciaHasta(e.target.value)}
                                            />
                                        </label>

                                        <button type="submit" className="primary-button">
                                            Guardar seguro
                                        </button>
                                    </form>
                                )}

                                {seccion === "seguros" && seguroEditando && (
                                    <form className="seguros-form" onSubmit={editarSeguro}>
                                        <h3>Editar seguro</h3>

                                        <label>
                                            Período *
                                            <select
                                                value={periodoSeguro}
                                                onChange={(e) => setPeriodoSeguro(e.target.value)}
                                                required
                                            >
                                                <option value="">Seleccionar período</option>
                                                {periodos.map((p) => (
                                                    <option key={p.id} value={p.id}>{p.codigo}</option>
                                                ))}
                                            </select>
                                        </label>

                                        <label>
                                            Número de póliza
                                            <input
                                                value={numeroPoliza}
                                                onChange={(e) => setNumeroPoliza(e.target.value)}
                                                maxLength={50}
                                                placeholder="Número de póliza"
                                            />
                                        </label>

                                        <label>
                                            Fecha de pago *
                                            <input
                                                type="date"
                                                value={fechaPago}
                                                max={new Date().toLocaleDateString("en-CA")}
                                                onChange={(e) => setFechaPago(e.target.value)}
                                                required
                                            />
                                        </label>

                                        <label>
                                            Vigencia desde
                                            <input
                                                type="date"
                                                value={vigenciaDesde}
                                                onChange={(e) => setVigenciaDesde(e.target.value)}
                                            />
                                        </label>

                                        <label>
                                            Vigencia hasta
                                            <input
                                                type="date"
                                                value={vigenciaHasta}
                                                min={vigenciaDesde || undefined}
                                                onChange={(e) => setVigenciaHasta(e.target.value)}
                                            />
                                        </label>

                                        <div className="apto-edit-actions">
                                            <button
                                                type="submit"
                                                className="primary-button"
                                                disabled={guardandoSeguro}
                                            >
                                                {guardandoSeguro ? "Guardando..." : "Guardar cambios"}
                                            </button>
                                            <button
                                                type="button"
                                                className="secondary-button"
                                                onClick={cancelarEdicionSeguro}
                                                disabled={guardandoSeguro}
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {seccion === "aptos" && mostrarFormularioApto && (
                                    <form className="seguros-form" onSubmit={registrarApto}>
                                        <h3>Registrar apto médico</h3>

                                        <label>
                                            Fecha de emisión *
                                            <input
                                                type="date"
                                                value={fechaEmision}
                                                max={new Date().toLocaleDateString("en-CA")}
                                                onChange={(e) => setFechaEmision(e.target.value)}
                                                required
                                            />
                                        </label>

                                        <label>
                                            Fecha de vencimiento
                                            <input
                                                type="date"
                                                value={fechaVencimiento}
                                                min={fechaEmision || undefined}
                                                onChange={(e) => setFechaVencimiento(e.target.value)}
                                            />
                                        </label>

                                        <label className="apto-archivo-label">
                                            Certificado médico (PDF o imagen)
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                                                onChange={(e) => setArchivoApto(e.target.files?.[0] || null)}
                                            />
                                            <small>Opcional. Tamaño máximo: 5 MB.</small>
                                        </label>

                                        {archivoApto && (
                                            <p className="apto-archivo-seleccionado">
                                                <FileText size={16} />
                                                {archivoApto.name}
                                            </p>
                                        )}

                                        <button
                                            type="submit"
                                            className="primary-button"
                                            disabled={guardandoApto}
                                        >
                                            {guardandoApto ? "Guardando..." : "Guardar apto médico"}
                                        </button>
                                    </form>
                                )}

                                {seccion === "aptos" && aptoEditando && (
                                    <form className="seguros-form" onSubmit={editarApto}>
                                        <h3>Editar apto médico</h3>

                                        <label>
                                            Fecha de emisión *
                                            <input
                                                type="date"
                                                value={fechaEmision}
                                                max={new Date().toLocaleDateString("en-CA")}
                                                onChange={(e) => setFechaEmision(e.target.value)}
                                                required
                                            />
                                        </label>

                                        <label>
                                            Fecha de vencimiento
                                            <input
                                                type="date"
                                                value={fechaVencimiento}
                                                min={fechaEmision || undefined}
                                                onChange={(e) => setFechaVencimiento(e.target.value)}
                                            />
                                        </label>

                                        <div className="apto-archivo-label">
                                            <strong>Certificado adjunto</strong>
                                            <p>
                                                {aptoEditando.archivoUrl
                                                    ? "Se conservará el archivo actual."
                                                    : "Este apto no tiene un archivo adjunto."}
                                            </p>
                                        </div>

                                        <div className="apto-edit-actions">
                                            <button
                                                type="submit"
                                                className="primary-button"
                                                disabled={guardandoApto}
                                            >
                                                {guardandoApto ? "Guardando..." : "Guardar cambios"}
                                            </button>
                                            <button
                                                type="button"
                                                className="secondary-button"
                                                onClick={cancelarEdicionApto}
                                                disabled={guardandoApto}
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {cargandoDetalle ? (
                                    <div className="seguros-empty">Cargando registros...</div>
                                ) : seccion === "seguros" ? (
                                    <div className="seguros-table-wrap">
                                        <table className="seguros-table">
                                            <thead>
                                            <tr>
                                                <th>Período</th>
                                                <th>N.º póliza</th>
                                                <th>Fecha de pago</th>
                                                <th>Vigencia hasta</th>
                                                <th>Estado</th>
                                                <th>Acciones</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {seguros.map((s) => (
                                                <tr key={s.id}>
                                                    <td>{s.periodo}</td>
                                                    <td>{s.numeroPoliza || "—"}</td>
                                                    <td>{fecha(s.fechaPago)}</td>
                                                    <td>{fecha(s.vigenciaHasta)}</td>
                                                    <td>
                                                            <span className={`seguros-status ${s.estado.toLowerCase()}`}>
                                                                {s.estado}
                                                            </span>
                                                    </td>
                                                    <td>
                                                        <div className="apto-actions">
                                                            <button
                                                                type="button"
                                                                className="apto-action-edit"
                                                                title="Editar seguro"
                                                                onClick={() => iniciarEdicionSeguro(s)}
                                                                disabled={
                                                                    guardandoSeguro ||
                                                                    eliminandoSeguro !== null
                                                                }
                                                            >
                                                                <Pencil size={16} />
                                                                Editar
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="apto-action-delete"
                                                                title="Eliminar seguro"
                                                                onClick={() => void eliminarSeguro(s)}
                                                                disabled={
                                                                    eliminandoSeguro !== null ||
                                                                    guardandoSeguro
                                                                }
                                                            >
                                                                <Trash2 size={16} />
                                                                {eliminandoSeguro === s.id
                                                                    ? "Eliminando..."
                                                                    : "Eliminar"}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {!seguros.length && (
                                                <tr>
                                                    <td colSpan={6} className="seguros-empty">
                                                        Este participante no tiene seguros registrados.
                                                    </td>
                                                </tr>
                                            )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="seguros-table-wrap">
                                        <table className="seguros-table">
                                            <thead>
                                            <tr>
                                                <th>Fecha de emisión</th>
                                                <th>Vencimiento</th>
                                                <th>Estado</th>
                                                <th>Archivo</th>
                                                <th>Acciones</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {aptos.map((a) => (
                                                <tr key={a.id}>
                                                    <td>{fecha(a.fechaEmision)}</td>
                                                    <td>{fecha(a.fechaVencimiento)}</td>
                                                    <td>
                                                            <span className={`seguros-status ${a.estado.toLowerCase()}`}>
                                                                {a.estado}
                                                            </span>
                                                    </td>
                                                    <td>
                                                        {a.archivoUrl ? (
                                                            <button
                                                                className="file-link"
                                                                onClick={() => void abrirArchivo(a.archivoUrl)}
                                                            >
                                                                Ver archivo
                                                            </button>
                                                        ) : "—"}
                                                    </td>
                                                    <td>
                                                        <div className="apto-actions">
                                                            <button
                                                                type="button"
                                                                className="apto-action-edit"
                                                                title="Editar apto"
                                                                onClick={() => iniciarEdicionApto(a)}
                                                                disabled={guardandoApto || eliminandoApto !== null}
                                                            >
                                                                <Pencil size={16} />
                                                                Editar
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="apto-action-delete"
                                                                title="Eliminar apto"
                                                                onClick={() => void eliminarApto(a)}
                                                                disabled={eliminandoApto !== null || guardandoApto}
                                                            >
                                                                <Trash2 size={16} />
                                                                {eliminandoApto === a.id ? "Eliminando..." : "Eliminar"}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {!aptos.length && (
                                                <tr>
                                                    <td colSpan={5} className="seguros-empty">
                                                        Este participante no tiene aptos médicos registrados.
                                                    </td>
                                                </tr>
                                            )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                </div>
            )}

            <footer className="seguros-footer">
                <span><CalendarDays size={14} /> Gestión de seguros y aptos médicos</span>
                <span><Clock size={14} /> Los estados se calculan en el backend</span>
            </footer>
        </div>
    );
}

export default SegurosAptos;
