
import { useCallback, useEffect, useState } from "react";
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    History,
    Loader2,
    Search,
    ShieldCheck,
    UserRound,
    XCircle,
    Camera,
    CameraOff,
} from "lucide-react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { api } from "./services/api";
import "./ControlIngreso.css";

type MetodoVerificacion = "QR" | "DNI";
type ResultadoHabilitacion = "HABILITADO" | "RECHAZADO";

interface Taller {
    id: number;
    nombre: string;
    modalidad: string;
    disciplina?: { id: number; nombre: string };
    profesor?: { id: number; nombre: string };
}

interface Participante {
    id?: number;
    dni?: string;
    nombre?: string;
    apellido?: string;
}

interface IngresoResponse {
    resultado: ResultadoHabilitacion;
    motivos: string[];
    yaRegistradoHoy: boolean;
    idAsistencia: number | null;
    participante: Participante | null;
    idTaller: number;
    taller: string;
    fecha: string;
    hora: string;
    metodo: MetodoVerificacion;
}

interface Asistencia {
    id: number;
    fecha: string;
    horaIngreso: string;
    metodoVerificacion: MetodoVerificacion;
    resultadoHabilitacion: ResultadoHabilitacion;
    idParticipante: number;
    dni: string;
    participante: string;
    idTaller: number;
    taller: string;
    registradoPor: string;
}

interface PaginaResponse<T> {
    contenido: T[];
    pagina: number;
    tamanio: number;
    totalElementos: number;
    totalPaginas: number;
}

const fechaActual = () => {
    const fecha = new Date();

    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
};

function ControlIngreso() {
    const [talleres, setTalleres] = useState<Taller[]>([]);
    const [tallerSeleccionado, setTallerSeleccionado] = useState("");

    const [metodo, setMetodo] = useState<MetodoVerificacion>("DNI");
    const [valor, setValor] = useState("");

    const [resultado, setResultado] = useState<IngresoResponse | null>(null);
    const [registrando, setRegistrando] = useState(false);
    const [error, setError] = useState("");

    const [qrActivo, setQrActivo] = useState(false);

    const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
    const [cargandoHistorial, setCargandoHistorial] = useState(false);
    const [errorHistorial, setErrorHistorial] = useState("");

    const [filtroTaller, setFiltroTaller] = useState("");
    const [filtroDni, setFiltroDni] = useState("");
    const [filtroResultado, setFiltroResultado] = useState("");
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");

    const [pagina, setPagina] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [totalElementos, setTotalElementos] = useState(0);

    // Lector de cámara QR.
    useEffect(() => {
        if (metodo !== "QR" || !qrActivo) return;

        let cancelado = false;

        const lector = new Html5Qrcode("lector-qr-ingreso", {
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
            verbose: false,
        });

        const iniciarLector = async () => {
            try {
                await lector.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                    },
                    (codigoLeido) => {
                        if (cancelado) return;

                        setValor(codigoLeido);
                        setError("");
                        setQrActivo(false);
                    },
                    () => {
                        // Se ignoran los errores de lectura de cada fotograma.
                    }
                );
            } catch (err) {
                if (!cancelado) {
                    console.error("Error al iniciar el lector QR:", err);

                    setError(
                        "No se pudo iniciar la cámara. Verificá los permisos del navegador y que ninguna otra aplicación la esté utilizando."
                    );

                    setQrActivo(false);
                }
            }
        };

        void iniciarLector();

        return () => {
            cancelado = true;

            void (async () => {
                try {
                    if (lector.isScanning) {
                        await lector.stop();
                    }

                    await lector.clear();
                } catch (err) {
                    console.warn("No se pudo cerrar el lector QR:", err);
                }
            })();
        };
    }, [metodo, qrActivo]);

    const cargarTalleres = useCallback(async () => {
        try {
            const datos = await api<Taller[]>("/ingreso/talleres");

            setTalleres(datos ?? []);

            // Si solo hay un taller disponible, lo seleccionamos automáticamente.
            if (datos?.length === 1) {
                setTallerSeleccionado(String(datos[0].id));
                setFiltroTaller(String(datos[0].id));
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudieron cargar los talleres."
            );
        }
    }, []);

    const cargarHistorial = useCallback(async () => {
        // El backend exige idTaller para los roles docentes.
        // No consultamos el historial general sin un taller seleccionado.
        const idTaller = filtroTaller || tallerSeleccionado;

        if (!idTaller) {
            setAsistencias([]);
            setTotalPaginas(0);
            setTotalElementos(0);

            setErrorHistorial(
                talleres.length === 0
                    ? "No hay talleres disponibles para consultar."
                    : "Seleccioná un taller para consultar su historial de asistencias."
            );

            return;
        }

        setCargandoHistorial(true);
        setErrorHistorial("");

        try {
            const parametros = new URLSearchParams();

            parametros.set("pagina", String(pagina));
            parametros.set("tamanio", "50");
            parametros.set("idTaller", idTaller);

            if (filtroDni.trim()) {
                parametros.set("idParticipante", filtroDni.trim());
            }

            if (filtroResultado) {
                parametros.set("resultado", filtroResultado);
            }

            if (desde) parametros.set("desde", desde);
            if (hasta) parametros.set("hasta", hasta);

            const datos = await api<PaginaResponse<Asistencia>>(
                `/asistencias?${parametros.toString()}`
            );

            setAsistencias(datos.contenido ?? []);
            setTotalPaginas(datos.totalPaginas ?? 0);
            setTotalElementos(datos.totalElementos ?? 0);
        } catch (err) {
            setAsistencias([]);
            setTotalPaginas(0);
            setTotalElementos(0);

            setErrorHistorial(
                err instanceof Error
                    ? err.message
                    : "No se pudo cargar el historial."
            );
        } finally {
            setCargandoHistorial(false);
        }
    }, [
        pagina,
        filtroTaller,
        tallerSeleccionado,
        filtroDni,
        filtroResultado,
        desde,
        hasta,
        talleres.length,
    ]);

    // Carga inicial de talleres.
    useEffect(() => {
        const temporizador = window.setTimeout(() => {
            void cargarTalleres();
        }, 0);

        return () => {
            window.clearTimeout(temporizador);
        };
    }, [cargarTalleres]);

    // Carga del historial cuando cambian los filtros o el taller.
    useEffect(() => {
        const temporizador = window.setTimeout(() => {
            void cargarHistorial();
        }, 0);

        return () => {
            window.clearTimeout(temporizador);
        };
    }, [cargarHistorial]);

    const registrarIngreso = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!tallerSeleccionado) {
            setError("Seleccioná un taller antes de registrar el ingreso.");
            return;
        }

        if (!valor.trim()) {
            setError(
                metodo === "DNI"
                    ? "Ingresá el número de DNI."
                    : "Escaneá o ingresá el código QR."
            );

            return;
        }

        setRegistrando(true);
        setError("");
        setResultado(null);

        try {
            const respuesta = await api<IngresoResponse>("/ingreso", {
                method: "POST",
                body: JSON.stringify({
                    metodo,
                    valor: valor.trim(),
                    idTaller: Number(tallerSeleccionado),
                }),
            });

            setResultado(respuesta);
            setValor("");

            // Actualizamos el historial del taller seleccionado.
            await cargarHistorial();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo registrar el ingreso."
            );
        } finally {
            setRegistrando(false);
        }
    };

    const limpiarFiltros = () => {
        setFiltroDni("");
        setFiltroResultado("");
        setDesde("");
        setHasta("");
        setPagina(0);
    };

    const cambiarMetodo = (nuevoMetodo: MetodoVerificacion) => {
        setQrActivo(false);
        setMetodo(nuevoMetodo);
        setValor("");
        setResultado(null);
        setError("");
    };

    const nombreParticipante = (participante: Participante | null) => {
        if (!participante) return "Participante sin datos";

        return (
            [participante.apellido, participante.nombre]
                .filter(Boolean)
                .join(", ") || "Participante"
        );
    };

    return (
        <div className="page-container ingreso-container">
            <section className="ingreso-header">
                <div>
                    <div className="ingreso-eyebrow">
                        <span className="ingreso-status-dot" />
                        CONTROL DE ACCESO
                    </div>

                    <h1>Control de ingreso</h1>

                    <p>
                        Verificá la habilitación de los participantes y registrá
                        su asistencia a los talleres deportivos.
                    </p>
                </div>

                <div className="ingreso-header-icon">
                    <ShieldCheck size={30} />
                </div>
            </section>

            <div className="ingreso-layout">
                <section className="ingreso-panel">
                    <div className="ingreso-panel-heading">
                        <div className="ingreso-heading-icon">
                            <UserRound size={21} />
                        </div>

                        <div>
                            <h2>Registrar ingreso</h2>
                            <p>
                                Identificá al participante para verificar su habilitación.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={registrarIngreso}>
                        <div className="ingreso-field">
                            <label htmlFor="tallerIngreso">Taller</label>

                            <select
                                id="tallerIngreso"
                                value={tallerSeleccionado}
                                onChange={(e) => {
                                    const nuevoTaller = e.target.value;

                                    setTallerSeleccionado(nuevoTaller);
                                    setFiltroTaller(nuevoTaller);
                                    setPagina(0);
                                    setResultado(null);
                                    setError("");
                                }}
                                required
                            >
                                <option value="">Seleccionar taller</option>

                                {talleres.map((taller) => (
                                    <option key={taller.id} value={taller.id}>
                                        {taller.nombre}
                                    </option>
                                ))}
                            </select>

                            {talleres.length === 0 && (
                                <small>
                                    No hay talleres disponibles para el ingreso.
                                </small>
                            )}
                        </div>

                        <div className="ingreso-field">
                            <label>Método de identificación</label>

                            <div className="ingreso-methods">
                                <button
                                    type="button"
                                    className={`ingreso-method ${metodo === "DNI" ? "selected" : ""}`}
                                    onClick={() => cambiarMetodo("DNI")}
                                >
                                    <UserRound size={19} />
                                    DNI
                                </button>

                                <button
                                    type="button"
                                    className={`ingreso-method ${metodo === "QR" ? "selected" : ""}`}
                                    onClick={() => cambiarMetodo("QR")}
                                >
                                    <ShieldCheck size={19} />
                                    Código QR
                                </button>
                            </div>
                        </div>

                        {metodo === "DNI" ? (
                            <div className="ingreso-field">
                                <label htmlFor="valorIngreso">
                                    Número de documento
                                </label>

                                <input
                                    id="valorIngreso"
                                    type="text"
                                    value={valor}
                                    onChange={(e) => setValor(e.target.value)}
                                    placeholder="Ingresar DNI del participante"
                                    autoComplete="off"
                                    disabled={registrando}
                                />

                                <small>Ingresá el DNI sin puntos.</small>
                            </div>
                        ) : (
                            <div className="ingreso-field">
                                <label htmlFor="valorIngreso">Código QR</label>

                                <input
                                    id="valorIngreso"
                                    type="text"
                                    value={valor}
                                    onChange={(e) => setValor(e.target.value)}
                                    placeholder="El código leído aparecerá aquí"
                                    autoComplete="off"
                                    disabled={registrando || qrActivo}
                                />

                                <div className="ingreso-qr-controls">
                                    {!qrActivo ? (
                                        <button
                                            type="button"
                                            className="ingreso-submit"
                                            onClick={() => {
                                                setError("");
                                                setValor("");
                                                setQrActivo(true);
                                            }}
                                            disabled={registrando}
                                        >
                                            <Camera size={19} />
                                            Activar cámara y escanear
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="ingreso-clear-filters"
                                            onClick={() => setQrActivo(false)}
                                        >
                                            <CameraOff size={19} />
                                            Detener cámara
                                        </button>
                                    )}
                                </div>

                                {qrActivo && (
                                    <div className="ingreso-qr-container">
                                        <div id="lector-qr-ingreso" />

                                        <small>
                                            Apuntá la cámara al código QR del participante.
                                        </small>
                                    </div>
                                )}

                                <small>
                                    También podés ingresar manualmente el contenido del QR.
                                </small>
                            </div>
                        )}

                        {error && (
                            <div className="ingreso-error">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="ingreso-submit"
                            disabled={
                                registrando ||
                                !tallerSeleccionado ||
                                !valor.trim()
                            }
                        >
                            {registrando ? (
                                <>
                                    <Loader2
                                        size={19}
                                        className="ingreso-spinner"
                                    />
                                    Verificando...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck size={19} />
                                    Verificar y registrar ingreso
                                </>
                            )}
                        </button>
                    </form>

                    {resultado && (
                        <div
                            className={`ingreso-result ${
                                resultado.resultado === "HABILITADO"
                                    ? "result-ok"
                                    : "result-rejected"
                            }`}
                        >
                            <div className="ingreso-result-title">
                                {resultado.resultado === "HABILITADO" ? (
                                    <CheckCircle2 size={30} />
                                ) : (
                                    <XCircle size={30} />
                                )}

                                <div>
                                    <strong>
                                        {resultado.resultado === "HABILITADO"
                                            ? "INGRESO HABILITADO"
                                            : "INGRESO RECHAZADO"}
                                    </strong>

                                    <span>
                                        {resultado.resultado === "HABILITADO"
                                            ? "El participante cumple los requisitos."
                                            : "El participante no puede ingresar."}
                                    </span>
                                </div>
                            </div>

                            {resultado.participante && (
                                <div className="ingreso-result-person">
                                    <strong>
                                        {nombreParticipante(resultado.participante)}
                                    </strong>

                                    {resultado.participante.dni && (
                                        <span>
                                            DNI: {resultado.participante.dni}
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="ingreso-result-info">
                                <span>
                                    <strong>Taller:</strong> {resultado.taller}
                                </span>

                                <span>
                                    <strong>Fecha:</strong> {resultado.fecha}
                                </span>

                                <span>
                                    <strong>Hora:</strong> {resultado.hora}
                                </span>

                                <span>
                                    <strong>Método:</strong> {resultado.metodo}
                                </span>
                            </div>

                            {resultado.yaRegistradoHoy && (
                                <div className="ingreso-duplicate">
                                    <AlertCircle size={17} />
                                    Este participante ya tenía un ingreso habilitado
                                    registrado hoy en este taller. No se duplicó la asistencia.
                                </div>
                            )}

                            {resultado.motivos?.length > 0 && (
                                <div className="ingreso-motivos">
                                    <strong>Motivos del rechazo:</strong>

                                    <ul>
                                        {resultado.motivos.map((motivo, index) => (
                                            <li key={index}>{motivo}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </section>

                <aside className="ingreso-info-panel">
                    <div className="ingreso-info-icon">
                        <ShieldCheck size={25} />
                    </div>

                    <h3>Verificación de habilitación</h3>

                    <p>
                        El sistema consulta los requisitos del participante antes
                        de registrar su asistencia.
                    </p>

                    <div className="ingreso-info-item">
                        <CheckCircle2 size={18} />
                        <span>Resultado automático de habilitación.</span>
                    </div>

                    <div className="ingreso-info-item">
                        <Clock size={18} />
                        <span>Registro de fecha y hora de ingreso.</span>
                    </div>

                    <div className="ingreso-info-item">
                        <History size={18} />
                        <span>Historial de asistencias del taller seleccionado.</span>
                    </div>
                </aside>
            </div>

            <section className="ingreso-history-panel">
                <div className="ingreso-history-heading">
                    <div>
                        <h2>
                            <History size={21} />
                            Historial de asistencias
                        </h2>

                        <p>
                            Consultá los ingresos registrados y sus resultados.
                        </p>
                    </div>

                    <span className="ingreso-total">
                        {totalElementos} registros
                    </span>
                </div>

                <div className="ingreso-filters">
                    <div className="ingreso-filter">
                        <label htmlFor="filtroTaller">Taller</label>

                        <select
                            id="filtroTaller"
                            value={filtroTaller}
                            onChange={(e) => {
                                setFiltroTaller(e.target.value);
                                setPagina(0);
                            }}
                        >
                            <option value="">Seleccionar taller</option>

                            {talleres.map((taller) => (
                                <option key={taller.id} value={taller.id}>
                                    {taller.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="ingreso-filter">
                        <label htmlFor="filtroDni">ID participante</label>

                        <input
                            id="filtroDni"
                            type="number"
                            min="1"
                            value={filtroDni}
                            onChange={(e) => {
                                setFiltroDni(e.target.value);
                                setPagina(0);
                            }}
                            placeholder="ID del participante"
                        />
                    </div>

                    <div className="ingreso-filter">
                        <label htmlFor="filtroResultado">Resultado</label>

                        <select
                            id="filtroResultado"
                            value={filtroResultado}
                            onChange={(e) => {
                                setFiltroResultado(e.target.value);
                                setPagina(0);
                            }}
                        >
                            <option value="">Todos</option>
                            <option value="HABILITADO">Habilitado</option>
                            <option value="RECHAZADO">Rechazado</option>
                        </select>
                    </div>

                    <div className="ingreso-filter">
                        <label htmlFor="fechaDesde">Desde</label>

                        <input
                            id="fechaDesde"
                            type="date"
                            value={desde}
                            max={hasta || fechaActual()}
                            onChange={(e) => {
                                setDesde(e.target.value);
                                setPagina(0);
                            }}
                        />
                    </div>

                    <div className="ingreso-filter">
                        <label htmlFor="fechaHasta">Hasta</label>

                        <input
                            id="fechaHasta"
                            type="date"
                            value={hasta}
                            min={desde || undefined}
                            max={fechaActual()}
                            onChange={(e) => {
                                setHasta(e.target.value);
                                setPagina(0);
                            }}
                        />
                    </div>

                    <button
                        type="button"
                        className="ingreso-clear-filters"
                        onClick={limpiarFiltros}
                    >
                        Limpiar filtros
                    </button>
                </div>

                {errorHistorial && (
                    <div className="ingreso-error">
                        <AlertCircle size={18} />
                        {errorHistorial}
                    </div>
                )}

                <div className="ingreso-table-wrapper">
                    <table className="ingreso-table">
                        <thead>
                        <tr>
                            <th>Fecha y hora</th>
                            <th>Participante</th>
                            <th>DNI</th>
                            <th>Taller</th>
                            <th>Método</th>
                            <th>Resultado</th>
                            <th>Registrado por</th>
                        </tr>
                        </thead>

                        <tbody>
                        {cargandoHistorial ? (
                            <tr>
                                <td colSpan={7} className="ingreso-empty">
                                    <Loader2
                                        size={22}
                                        className="ingreso-spinner"
                                    />
                                    Cargando historial...
                                </td>
                            </tr>
                        ) : asistencias.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="ingreso-empty">
                                    <Search size={23} />
                                    {filtroTaller || tallerSeleccionado
                                        ? "No se encontraron asistencias para este taller."
                                        : "Seleccioná un taller para consultar el historial."}
                                </td>
                            </tr>
                        ) : (
                            asistencias.map((asistencia) => (
                                <tr key={asistencia.id}>
                                    <td>
                                        <strong>{asistencia.fecha}</strong>
                                        <small>{asistencia.horaIngreso}</small>
                                    </td>

                                    <td>{asistencia.participante}</td>
                                    <td>{asistencia.dni}</td>
                                    <td>{asistencia.taller}</td>

                                    <td>
                                            <span className="ingreso-method-tag">
                                                {asistencia.metodoVerificacion}
                                            </span>
                                    </td>

                                    <td>
                                            <span
                                                className={`ingreso-badge ${
                                                    asistencia.resultadoHabilitacion ===
                                                    "HABILITADO"
                                                        ? "badge-ok"
                                                        : "badge-rejected"
                                                }`}
                                            >
                                                {asistencia.resultadoHabilitacion}
                                            </span>
                                    </td>

                                    <td>{asistencia.registradoPor}</td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                <div className="ingreso-pagination">
                    <span>
                        Página {totalPaginas === 0 ? 0 : pagina + 1} de{" "}
                        {totalPaginas}
                    </span>

                    <div>
                        <button
                            type="button"
                            disabled={pagina <= 0 || cargandoHistorial}
                            onClick={() =>
                                setPagina((actual) => actual - 1)
                            }
                        >
                            Anterior
                        </button>

                        <button
                            type="button"
                            disabled={
                                pagina + 1 >= totalPaginas ||
                                cargandoHistorial
                            }
                            onClick={() =>
                                setPagina((actual) => actual + 1)
                            }
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default ControlIngreso;
