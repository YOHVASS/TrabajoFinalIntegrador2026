
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
    FileText,
    Upload,
    Search,
    UserRound,
    CalendarDays,
    Download,
    Eye,
    Trash2,
    Plus,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Clock,
    X,
} from "lucide-react";
import { api } from "./services/api";
import type { Participante, PaginaResponse } from "./types";
import "./Documentacion.css";

type TipoDocumento = {
    id: number;
    nombre: string;
    obligatorio: boolean;
    tieneVencimiento: boolean;
};

type Documento = {
    id: number;
    idParticipante: number;
    idTipoDocumento: number;
    tipoDocumento: string;
    obligatorio: boolean;
    archivoUrl: string;
    fechaPresentacion: string;
    fechaVencimiento: string | null;
    estado: "VIGENTE" | "VENCIDO" | "PENDIENTE";
};

const API_URL = "http://localhost:8080/api";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const EXTENSIONES_PERMITIDAS = ["pdf", "jpg", "jpeg", "png", "webp"];

function fechaLegible(fecha: string | null) {
    if (!fecha) return "Sin fecha";
    const [anio, mes, dia] = fecha.split("-");
    return `${dia}/${mes}/${anio}`;
}

function nombreArchivo(url: string) {
    return url.split("/").pop() || "documento";
}

function Documentacion() {
    const [participantes, setParticipantes] = useState<Participante[]>([]);
    const [tipos, setTipos] = useState<TipoDocumento[]>([]);
    const [participanteSeleccionado, setParticipanteSeleccionado] =
        useState<Participante | null>(null);
    const [documentos, setDocumentos] = useState<Documento[]>([]);

    const [busqueda, setBusqueda] = useState("");
    const [tipoFiltro, setTipoFiltro] = useState("TODOS");
    const [estadoFiltro, setEstadoFiltro] = useState("TODOS");

    const [cargando, setCargando] = useState(true);
    const [cargandoDocumentos, setCargandoDocumentos] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    const [modalDocumento, setModalDocumento] = useState(false);
    const [modalTipo, setModalTipo] = useState(false);

    const [tipoDocumento, setTipoDocumento] = useState("");
    const [archivo, setArchivo] = useState<File | null>(null);
    const [fechaPresentacion, setFechaPresentacion] = useState(
        new Date().toISOString().slice(0, 10)
    );
    const [fechaVencimiento, setFechaVencimiento] = useState("");

    const [nombreTipo, setNombreTipo] = useState("");
    const [tipoObligatorio, setTipoObligatorio] = useState(true);
    const [tipoConVencimiento, setTipoConVencimiento] = useState(true);

    const documentosFiltrados = useMemo(() => {
        return documentos.filter((documento) => {
            const coincideTipo =
                tipoFiltro === "TODOS" ||
                String(documento.idTipoDocumento) === tipoFiltro;

            const coincideEstado =
                estadoFiltro === "TODOS" || documento.estado === estadoFiltro;

            return coincideTipo && coincideEstado;
        });
    }, [documentos, tipoFiltro, estadoFiltro]);

    const participantesFiltrados = useMemo(() => {
        const texto = busqueda.trim().toLowerCase();

        if (!texto) return participantes;

        return participantes.filter((participante) =>
            `${participante.nombre} ${participante.apellido} ${participante.dni}`
                .toLowerCase()
                .includes(texto)
        );
    }, [participantes, busqueda]);

    const resumen = useMemo(() => ({
        total: documentos.length,
        vigentes: documentos.filter((d) => d.estado === "VIGENTE").length,
        vencidos: documentos.filter((d) => d.estado === "VENCIDO").length,
        pendientes: documentos.filter((d) => d.estado === "PENDIENTE").length,
    }), [documentos]);

    async function cargarDatos() {
        setCargando(true);
        setError("");

        try {
            const [respuestaParticipantes, respuestaTipos] = await Promise.all([
                api<PaginaResponse<Participante>>(
                    "/participantes?pagina=0&tamanio=100"
                ),
                api<TipoDocumento[]>("/tipos-documento"),
            ]);

            setParticipantes(respuestaParticipantes.contenido);
            setTipos(respuestaTipos);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudieron cargar los datos."
            );
        } finally {
            setCargando(false);
        }
    }

    async function cargarDocumentos(idParticipante: number) {
        setCargandoDocumentos(true);
        setError("");

        try {
            const respuesta = await api<Documento[]>(
                `/participantes/${idParticipante}/documentos`
            );
            setDocumentos(respuesta);
        } catch (err) {
            setDocumentos([]);
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudieron cargar los documentos."
            );
        } finally {
            setCargandoDocumentos(false);
        }
    }

    useEffect(() => {
        const temporizador = window.setTimeout(() => {
            void cargarDatos();
        }, 0);

        return () => {
            window.clearTimeout(temporizador);
        };
    }, []);

    async function seleccionarParticipante(participante: Participante) {
        setParticipanteSeleccionado(participante);
        setDocumentos([]);
        setTipoFiltro("TODOS");
        setEstadoFiltro("TODOS");
        setMensaje("");
        await cargarDocumentos(participante.id);
    }

    function cerrarModalDocumento() {
        setModalDocumento(false);
        setTipoDocumento("");
        setArchivo(null);
        setFechaPresentacion(new Date().toISOString().slice(0, 10));
        setFechaVencimiento("");
    }

    async function registrarDocumento(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!participanteSeleccionado || !tipoDocumento || !archivo) {
            setError("Completá el tipo de documento y seleccioná un archivo.");
            return;
        }

        const extension = archivo.name.split(".").pop()?.toLowerCase() || "";

        if (!EXTENSIONES_PERMITIDAS.includes(extension)) {
            setError("Formato no permitido. Utilizá PDF, JPG, PNG o WEBP.");
            return;
        }

        if (archivo.size > MAX_FILE_SIZE) {
            setError("El archivo supera el tamaño máximo permitido de 5 MB.");
            return;
        }

        const tipoSeleccionado = tipos.find(
            (tipo) => String(tipo.id) === tipoDocumento
        );

        if (tipoSeleccionado?.tieneVencimiento && !fechaVencimiento) {
            setError("Este tipo de documento requiere fecha de vencimiento.");
            return;
        }

        if (fechaVencimiento && fechaVencimiento < fechaPresentacion) {
            setError(
                "La fecha de vencimiento no puede ser anterior a la presentación."
            );
            return;
        }

        setGuardando(true);
        setError("");
        setMensaje("");

        try {
            const formData = new FormData();
            formData.append("archivo", archivo);

            const token = localStorage.getItem("token");

            const respuestaArchivo = await fetch(`${API_URL}/archivos`, {
                method: "POST",
                headers: token
                    ? { Authorization: `Bearer ${token}` }
                    : {},
                body: formData,
            });

            if (!respuestaArchivo.ok) {
                const detalle = await respuestaArchivo.text();
                throw new Error(detalle || "No se pudo subir el archivo.");
            }

            const archivoSubido: { url: string } =
                await respuestaArchivo.json();

            await api(
                `/participantes/${participanteSeleccionado.id}/documentos`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        idTipoDocumento: Number(tipoDocumento),
                        archivoUrl: archivoSubido.url,
                        fechaPresentacion,
                        fechaVencimiento: fechaVencimiento || null,
                    }),
                }
            );

            cerrarModalDocumento();
            setMensaje("El documento se registró correctamente.");
            await cargarDocumentos(participanteSeleccionado.id);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo registrar el documento."
            );
        } finally {
            setGuardando(false);
        }
    }

    async function eliminarDocumento(documento: Documento) {
        const confirmar = window.confirm(
            `¿Querés eliminar el documento "${documento.tipoDocumento}"?`
        );

        if (!confirmar) return;

        setError("");
        setMensaje("");

        try {
            await api(`/documentos/${documento.id}`, {
                method: "DELETE",
            });

            setMensaje("El documento se eliminó correctamente.");

            if (participanteSeleccionado) {
                await cargarDocumentos(participanteSeleccionado.id);
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo eliminar el documento."
            );
        }
    }

    // Obtiene el archivo del servidor y lo abre en una pestaña nueva.
    async function abrirArchivo(documento: Documento) {
        setError("");

        try {
            const token = localStorage.getItem("token");

            const respuesta = await fetch(
                `http://localhost:8080${documento.archivoUrl}`,
                {
                    headers: token
                        ? { Authorization: `Bearer ${token}` }
                        : {},
                }
            );

            if (!respuesta.ok) {
                throw new Error("No se pudo abrir el archivo.");
            }

            const blob = await respuesta.blob();
            const url = URL.createObjectURL(blob);
            const ventana = window.open(url, "_blank");

            if (!ventana) {
                URL.revokeObjectURL(url);
                throw new Error(
                    "El navegador bloqueó la ventana emergente. Permití las ventanas emergentes para este sitio."
                );
            }

            window.setTimeout(() => URL.revokeObjectURL(url), 60000);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo abrir el archivo."
            );
        }
    }

    // Obtiene el archivo del servidor y fuerza su descarga.
    async function descargarArchivo(documento: Documento) {
        setError("");

        try {
            const token = localStorage.getItem("token");

            const respuesta = await fetch(
                `http://localhost:8080${documento.archivoUrl}`,
                {
                    headers: token
                        ? { Authorization: `Bearer ${token}` }
                        : {},
                }
            );

            if (!respuesta.ok) {
                throw new Error("No se pudo descargar el archivo.");
            }

            const blob = await respuesta.blob();
            const url = URL.createObjectURL(blob);
            const enlace = document.createElement("a");

            enlace.href = url;
            enlace.download = nombreArchivo(documento.archivoUrl);

            document.body.appendChild(enlace);
            enlace.click();
            enlace.remove();

            window.setTimeout(() => URL.revokeObjectURL(url), 60000);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo descargar el archivo."
            );
        }
    }

    async function crearTipoDocumento(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!nombreTipo.trim()) {
            setError("Ingresá el nombre del tipo de documento.");
            return;
        }

        setGuardando(true);
        setError("");
        setMensaje("");

        try {
            await api<TipoDocumento>("/tipos-documento", {
                method: "POST",
                body: JSON.stringify({
                    nombre: nombreTipo.trim(),
                    obligatorio: tipoObligatorio,
                    tieneVencimiento: tipoConVencimiento,
                }),
            });

            setNombreTipo("");
            setTipoObligatorio(true);
            setTipoConVencimiento(true);
            setModalTipo(false);
            setMensaje("El tipo de documento se creó correctamente.");
            await cargarDatos();

            if (participanteSeleccionado) {
                await cargarDocumentos(participanteSeleccionado.id);
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo crear el tipo de documento."
            );
        } finally {
            setGuardando(false);
        }
    }

    const tipoElegido = tipos.find(
        (tipo) => String(tipo.id) === tipoDocumento
    );

    return (
        <div className="documentacion-page">
            <section className="module-heading">
                <div>
                    <span className="module-eyebrow">GESTIÓN DOCUMENTAL</span>
                    <h1>Documentación</h1>
                    <p>Administrá los archivos y requisitos de los participantes.</p>
                </div>

                <div className="documentacion-heading-actions">
                    <button
                        className="secondary-button"
                        onClick={() => void cargarDatos()}
                        disabled={cargando}
                    >
                        <RefreshCw size={16} />
                        Actualizar
                    </button>
                    <button
                        className="primary-button"
                        onClick={() => setModalTipo(true)}
                    >
                        <Plus size={17} />
                        Tipo de documento
                    </button>
                </div>
            </section>

            {error && (
                <div className="documentacion-message error-message">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                    <button onClick={() => setError("")} aria-label="Cerrar">
                        <X size={16} />
                    </button>
                </div>
            )}

            {mensaje && (
                <div className="documentacion-message success-message">
                    <CheckCircle2 size={18} />
                    <span>{mensaje}</span>
                    <button onClick={() => setMensaje("")} aria-label="Cerrar">
                        <X size={16} />
                    </button>
                </div>
            )}

            <section className="documentacion-summary">
                <article className="documentacion-stat">
                    <div className="documentacion-stat-icon blue-stat">
                        <FileText size={21} />
                    </div>
                    <div>
                        <span>Documentos cargados</span>
                        <strong>{resumen.total}</strong>
                    </div>
                </article>
                <article className="documentacion-stat">
                    <div className="documentacion-stat-icon green-stat">
                        <CheckCircle2 size={21} />
                    </div>
                    <div>
                        <span>Vigentes</span>
                        <strong>{resumen.vigentes}</strong>
                    </div>
                </article>
                <article className="documentacion-stat">
                    <div className="documentacion-stat-icon red-stat">
                        <AlertCircle size={21} />
                    </div>
                    <div>
                        <span>Vencidos</span>
                        <strong>{resumen.vencidos}</strong>
                    </div>
                </article>
                <article className="documentacion-stat">
                    <div className="documentacion-stat-icon orange-stat">
                        <Clock size={21} />
                    </div>
                    <div>
                        <span>Pendientes</span>
                        <strong>{resumen.pendientes}</strong>
                    </div>
                </article>
            </section>

            <section className="documentacion-layout">
                <article className="documentacion-card participant-selector">
                    <div className="documentacion-card-heading">
                        <div>
                            <h2>Participantes</h2>
                            <p>Seleccioná una persona para consultar sus archivos.</p>
                        </div>
                        <span className="documentacion-count">
                            {participantes.length}
                        </span>
                    </div>

                    <label className="documentacion-search">
                        <Search size={17} />
                        <input
                            value={busqueda}
                            onChange={(event) => setBusqueda(event.target.value)}
                            placeholder="Buscar por nombre o DNI..."
                        />
                    </label>

                    <div className="participant-list">
                        {cargando ? (
                            <div className="documentacion-empty">
                                Cargando participantes...
                            </div>
                        ) : participantesFiltrados.length === 0 ? (
                            <div className="documentacion-empty">
                                No se encontraron participantes.
                            </div>
                        ) : (
                            participantesFiltrados.map((participante) => (
                                <button
                                    key={participante.id}
                                    className={`participant-option ${
                                        participanteSeleccionado?.id === participante.id
                                            ? "participant-option-active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        void seleccionarParticipante(participante)
                                    }
                                >
                                    <div className="participant-option-avatar">
                                        {participante.nombre.charAt(0)}
                                        {participante.apellido.charAt(0)}
                                    </div>
                                    <div className="participant-option-info">
                                        <strong>
                                            {participante.apellido}, {participante.nombre}
                                        </strong>
                                        <span>DNI {participante.dni}</span>
                                    </div>
                                    <span
                                        className={`participant-option-status ${
                                            participante.estadoHabilitacion === "HABILITADO"
                                                ? "status-enabled"
                                                : participante.estadoHabilitacion === "PENDIENTE"
                                                    ? "status-pending"
                                                    : "status-disabled"
                                        }`}
                                    />
                                </button>
                            ))
                        )}
                    </div>
                </article>

                <article className="documentacion-card document-list-card">
                    {!participanteSeleccionado ? (
                        <div className="documentacion-no-selection">
                            <div className="documentacion-no-selection-icon">
                                <UserRound size={30} />
                            </div>
                            <h2>Seleccioná un participante</h2>
                            <p>
                                Elegí una persona del listado para consultar y
                                administrar su documentación.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="documentacion-card-heading selected-participant-heading">
                                <div>
                                    <span className="module-eyebrow">
                                        LEGAJO DEL PARTICIPANTE
                                    </span>
                                    <h2>
                                        {participanteSeleccionado.nombre}{" "}
                                        {participanteSeleccionado.apellido}
                                    </h2>
                                    <p>
                                        DNI {participanteSeleccionado.dni} ·{" "}
                                        {participanteSeleccionado.facultad}
                                    </p>
                                </div>
                                <button
                                    className="primary-button"
                                    onClick={() => {
                                        setError("");
                                        setMensaje("");
                                        setModalDocumento(true);
                                    }}
                                    disabled={tipos.length === 0}
                                >
                                    <Upload size={16} />
                                    Cargar documento
                                </button>
                            </div>

                            <div className="documentacion-filters">
                                <label>
                                    Tipo de documento
                                    <select
                                        value={tipoFiltro}
                                        onChange={(event) =>
                                            setTipoFiltro(event.target.value)
                                        }
                                    >
                                        <option value="TODOS">Todos los tipos</option>
                                        {tipos.map((tipo) => (
                                            <option key={tipo.id} value={String(tipo.id)}>
                                                {tipo.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    Estado
                                    <select
                                        value={estadoFiltro}
                                        onChange={(event) =>
                                            setEstadoFiltro(event.target.value)
                                        }
                                    >
                                        <option value="TODOS">Todos los estados</option>
                                        <option value="VIGENTE">Vigentes</option>
                                        <option value="VENCIDO">Vencidos</option>
                                        <option value="PENDIENTE">Pendientes</option>
                                    </select>
                                </label>
                            </div>

                            {cargandoDocumentos ? (
                                <div className="documentacion-empty">
                                    Cargando documentación...
                                </div>
                            ) : documentosFiltrados.length === 0 ? (
                                <div className="documentacion-empty documentacion-empty-large">
                                    <FileText size={28} />
                                    <strong>No hay documentos para mostrar</strong>
                                    <span>
                                        Todavía no hay archivos registrados con estos filtros.
                                    </span>
                                </div>
                            ) : (
                                <div className="documentacion-table-wrapper">
                                    <table className="documentacion-table">
                                        <thead>
                                        <tr>
                                            <th>Documento</th>
                                            <th>Presentación</th>
                                            <th>Vencimiento</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {documentosFiltrados.map((documento) => (
                                            <tr key={documento.id}>
                                                <td>
                                                    <div className="document-name-cell">
                                                        <div className="document-file-icon">
                                                            <FileText size={18} />
                                                        </div>
                                                        <div>
                                                            <strong>
                                                                {documento.tipoDocumento}
                                                            </strong>
                                                            <span>
                                                                    {documento.obligatorio
                                                                        ? "Obligatorio"
                                                                        : "Opcional"}
                                                                </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    {fechaLegible(
                                                        documento.fechaPresentacion
                                                    )}
                                                </td>
                                                <td>
                                                    {fechaLegible(
                                                        documento.fechaVencimiento
                                                    )}
                                                </td>
                                                <td>
                                                        <span
                                                            className={`document-status status-${documento.estado.toLowerCase()}`}
                                                        >
                                                            {documento.estado === "VIGENTE"
                                                                ? "Vigente"
                                                                : documento.estado === "VENCIDO"
                                                                    ? "Vencido"
                                                                    : "Pendiente"}
                                                        </span>
                                                </td>
                                                <td>
                                                    <div className="document-actions">
                                                        <button
                                                            title="Ver archivo"
                                                            aria-label="Ver archivo"
                                                            onClick={() =>
                                                                void abrirArchivo(documento)
                                                            }
                                                        >
                                                            <Eye size={17} />
                                                        </button>
                                                        <button
                                                            title="Descargar archivo"
                                                            aria-label="Descargar archivo"
                                                            onClick={() =>
                                                                void descargarArchivo(documento)
                                                            }
                                                        >
                                                            <Download size={17} />
                                                        </button>
                                                        <button
                                                            title="Eliminar documento"
                                                            aria-label="Eliminar documento"
                                                            className="delete-document-button"
                                                            onClick={() =>
                                                                void eliminarDocumento(documento)
                                                            }
                                                        >
                                                            <Trash2 size={17} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </article>
            </section>

            <section className="document-types-card">
                <div className="documentacion-card-heading">
                    <div>
                        <h2>Tipos de documentos</h2>
                        <p>Requisitos configurados para los legajos.</p>
                    </div>
                    <span className="documentacion-count">{tipos.length}</span>
                </div>

                {tipos.length === 0 ? (
                    <div className="documentacion-empty">
                        No hay tipos de documentos configurados.
                    </div>
                ) : (
                    <div className="document-types-grid">
                        {tipos.map((tipo) => (
                            <article className="document-type-item" key={tipo.id}>
                                <div className="document-type-icon">
                                    <FileText size={19} />
                                </div>
                                <div>
                                    <strong>{tipo.nombre}</strong>
                                    <span>
                                        {tipo.obligatorio ? "Obligatorio" : "Opcional"}
                                        {" · "}
                                        {tipo.tieneVencimiento
                                            ? "Con vencimiento"
                                            : "Sin vencimiento"}
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {modalDocumento && (
                <div className="documentacion-modal-overlay">
                    <div className="documentacion-modal">
                        <div className="documentacion-modal-heading">
                            <div>
                                <span className="module-eyebrow">LEGAJO DIGITAL</span>
                                <h2>Cargar documento</h2>
                                <p>
                                    Participante: {participanteSeleccionado?.nombre}{" "}
                                    {participanteSeleccionado?.apellido}
                                </p>
                            </div>
                            <button
                                className="modal-close-button"
                                onClick={cerrarModalDocumento}
                                aria-label="Cerrar"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={registrarDocumento}>
                            <label className="documentacion-form-field">
                                Tipo de documento *
                                <select
                                    required
                                    value={tipoDocumento}
                                    onChange={(event) =>
                                        setTipoDocumento(event.target.value)
                                    }
                                >
                                    <option value="">Seleccionar tipo...</option>
                                    {tipos.map((tipo) => (
                                        <option key={tipo.id} value={String(tipo.id)}>
                                            {tipo.nombre}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            {tipoElegido && (
                                <div className="document-type-hint">
                                    {tipoElegido.obligatorio
                                        ? "Este documento es obligatorio."
                                        : "Este documento es opcional."}
                                    {" "}
                                    {tipoElegido.tieneVencimiento
                                        ? "Requiere fecha de vencimiento."
                                        : "No requiere fecha de vencimiento."}
                                </div>
                            )}

                            <label className="documentacion-form-field">
                                Archivo *
                                <input
                                    type="file"
                                    required
                                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                                    onChange={(event) =>
                                        setArchivo(event.target.files?.[0] || null)
                                    }
                                />
                                <small>Formatos: PDF, JPG, PNG o WEBP. Máximo 5 MB.</small>
                            </label>

                            <div className="documentacion-form-row">
                                <label className="documentacion-form-field">
                                    <span>
                                        <CalendarDays size={15} />
                                        Fecha de presentación *
                                    </span>
                                    <input
                                        type="date"
                                        required
                                        max={new Date().toISOString().slice(0, 10)}
                                        value={fechaPresentacion}
                                        onChange={(event) =>
                                            setFechaPresentacion(event.target.value)
                                        }
                                    />
                                </label>

                                {tipoElegido?.tieneVencimiento && (
                                    <label className="documentacion-form-field">
                                        <span>
                                            <CalendarDays size={15} />
                                            Fecha de vencimiento *
                                        </span>
                                        <input
                                            type="date"
                                            required
                                            min={fechaPresentacion}
                                            value={fechaVencimiento}
                                            onChange={(event) =>
                                                setFechaVencimiento(event.target.value)
                                            }
                                        />
                                    </label>
                                )}
                            </div>

                            <div className="documentacion-modal-actions">
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={cerrarModalDocumento}
                                    disabled={guardando}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={guardando}
                                >
                                    <Upload size={16} />
                                    {guardando ? "Subiendo archivo..." : "Guardar documento"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {modalTipo && (
                <div className="documentacion-modal-overlay">
                    <div className="documentacion-modal documentacion-type-modal">
                        <div className="documentacion-modal-heading">
                            <div>
                                <span className="module-eyebrow">CONFIGURACIÓN</span>
                                <h2>Nuevo tipo de documento</h2>
                                <p>Definí un requisito para los legajos.</p>
                            </div>
                            <button
                                className="modal-close-button"
                                onClick={() => setModalTipo(false)}
                                aria-label="Cerrar"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={crearTipoDocumento}>
                            <label className="documentacion-form-field">
                                Nombre del documento *
                                <input
                                    required
                                    maxLength={50}
                                    value={nombreTipo}
                                    onChange={(event) =>
                                        setNombreTipo(event.target.value)
                                    }
                                    placeholder="Ej.: Certificado médico"
                                />
                            </label>

                            <label className="documentacion-check-field">
                                <input
                                    type="checkbox"
                                    checked={tipoObligatorio}
                                    onChange={(event) =>
                                        setTipoObligatorio(event.target.checked)
                                    }
                                />
                                <span>
                                    <strong>Documento obligatorio</strong>
                                    <small>Se considera un requisito necesario.</small>
                                </span>
                            </label>

                            <label className="documentacion-check-field">
                                <input
                                    type="checkbox"
                                    checked={tipoConVencimiento}
                                    onChange={(event) =>
                                        setTipoConVencimiento(event.target.checked)
                                    }
                                />
                                <span>
                                    <strong>Requiere fecha de vencimiento</strong>
                                    <small>Se controla su vigencia automáticamente.</small>
                                </span>
                            </label>

                            <div className="documentacion-modal-actions">
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() => setModalTipo(false)}
                                    disabled={guardando}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={guardando}
                                >
                                    {guardando ? "Guardando..." : "Crear tipo"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Documentacion;
