
import { useCallback, useEffect, useState } from "react";
import { api } from "./services/api";
import "./Reportes.css";

interface Resumen {
    participantesActivos: number;
    habilitados: number;
    noHabilitados: number;
    conRequisitosPendientes: number;
    inscripcionesActivas: number;
    preinscripcionesPendientes: number;
    enListaEspera: number;
    asistenciasUltimos30Dias: number;
    ingresosRechazadosUltimos30Dias: number;
    aptosPorVencer: number;
    alertasActivas: number;
}

interface PorTaller {
    idTaller: number;
    taller: string;
    disciplina: string;
    modalidad: string;
    periodo: string;
    cupoMaximo: number;
    inscriptosActivos: number;
    pendientesRevision: number;
    enListaEspera: number;
}

interface PorDisciplina {
    disciplina: string;
    participantes: number;
    inscripciones: number;
}

interface PorCategoria {
    categoria: string;
    participantes: number;
}

interface EvolucionMensual {
    mes: string;
    preinscripciones: number;
    inscripciones: number;
}

interface AsistenciaPorTaller {
    idTaller: number;
    taller: string;
    habilitados: number;
    rechazados: number;
    participantesDistintos: number;
    diasConRegistro: number;
}

interface AptoPorVencerDetalle {
    idParticipante: number;
    dni: string;
    nombre: string;
    apellido: string;
    fechaVencimiento: string;
}

interface DocumentacionPendienteDetalle {
    idParticipante: number;
    dni: string;
    nombre: string;
    apellido: string;
    estadoHabilitacion: string;
    pendientes: string;
}

function fechaLocal(fecha: Date) {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
}

function GraficoBarras<T extends object>({
                                             datos,
                                             etiqueta,
                                             valor,
                                         }: {
    datos: T[];
    etiqueta: string;
    valor: string;
}) {
    const maximo = Math.max(
        1,
        ...datos.map((item) => {
            const registro = item as Record<string, string | number>;
            return Number(registro[valor] ?? 0);
        })
    );

    if (!datos.length) {
        return <p className="reportes-vacio">No hay datos para mostrar.</p>;
    }

    return (
        <div className="reportes-barras">
            {datos.map((item, index) => {
                const registro = item as Record<string, string | number>;
                const cantidad = Number(registro[valor] ?? 0);
                const porcentaje = (cantidad / maximo) * 100;

                return (
                    <div className="reportes-barra-item" key={index}>
                        <div className="reportes-barra-texto">
                            <span>
                                {registro[etiqueta] || "Sin especificar"}
                            </span>
                            <strong>{cantidad}</strong>
                        </div>
                        <div className="reportes-barra-fondo">
                            <div
                                className="reportes-barra-valor"
                                style={{ width: `${porcentaje}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function Reportes() {
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    const rol = usuario.rol || "";
    const puedeVerDetalles =
        rol === "ADMINISTRATIVO" || rol === "COORDINADOR";

    const hoy = fechaLocal(new Date());
    const fechaAnterior = new Date();
    fechaAnterior.setDate(fechaAnterior.getDate() - 30);

    const [desde, setDesde] = useState(fechaLocal(fechaAnterior));
    const [hasta, setHasta] = useState(hoy);

    const [resumen, setResumen] = useState<Resumen | null>(null);
    const [talleres, setTalleres] = useState<PorTaller[]>([]);
    const [disciplinas, setDisciplinas] = useState<PorDisciplina[]>([]);
    const [facultades, setFacultades] = useState<PorCategoria[]>([]);
    const [sexos, setSexos] = useState<PorCategoria[]>([]);
    const [evolucion, setEvolucion] = useState<EvolucionMensual[]>([]);
    const [asistencias, setAsistencias] = useState<AsistenciaPorTaller[]>([]);
    const [aptos, setAptos] = useState<AptoPorVencerDetalle[]>([]);
    const [documentacion, setDocumentacion] =
        useState<DocumentacionPendienteDetalle[]>([]);

    const [cargando, setCargando] = useState(true);
    const [cargandoDetalles, setCargandoDetalles] = useState(false);
    const [error, setError] = useState("");
    const [errorDetalles, setErrorDetalles] = useState("");

    const cargarReportes = useCallback(async () => {
        setCargando(true);
        setError("");

        try {
            const [r, t, d, f, s, e, a] = await Promise.all([
                api<Resumen>("/reportes/resumen"),
                api<PorTaller[]>("/reportes/participantes-por-taller"),
                api<PorDisciplina[]>("/reportes/participantes-por-disciplina"),
                api<PorCategoria[]>("/reportes/participantes-por-facultad"),
                api<PorCategoria[]>("/reportes/participantes-por-sexo"),
                api<EvolucionMensual[]>(
                    `/reportes/evolucion-inscripciones?desde=${desde}&hasta=${hasta}`
                ),
                api<AsistenciaPorTaller[]>(
                    `/reportes/asistencia?desde=${desde}&hasta=${hasta}`
                ),
            ]);

            setResumen(r);
            setTalleres(t);
            setDisciplinas(d);
            setFacultades(f);
            setSexos(s);
            setEvolucion(e);
            setAsistencias(a);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudieron cargar los reportes."
            );
        } finally {
            setCargando(false);
        }
    }, [desde, hasta]);

    const cargarDetalles = useCallback(async () => {
        if (!puedeVerDetalles) return;

        setCargandoDetalles(true);
        setErrorDetalles("");

        try {
            const [a, d] = await Promise.all([
                api<AptoPorVencerDetalle[]>("/reportes/aptos-por-vencer/detalle"),
                api<DocumentacionPendienteDetalle[]>(
                    "/reportes/documentacion-pendiente/detalle"
                ),
            ]);

            setAptos(a);
            setDocumentacion(d);
        } catch (err) {
            setErrorDetalles(
                err instanceof Error
                    ? err.message
                    : "No se pudieron cargar los detalles nominales."
            );
        } finally {
            setCargandoDetalles(false);
        }
    }, [puedeVerDetalles]);

    useEffect(() => {
        const temporizador = window.setTimeout(() => {
            void cargarReportes();
        }, 0);

        return () => {
            window.clearTimeout(temporizador);
        };
    }, [cargarReportes]);

    useEffect(() => {
        const temporizador = window.setTimeout(() => {
            void cargarDetalles();
        }, 0);

        return () => {
            window.clearTimeout(temporizador);
        };
    }, [cargarDetalles]);

    function actualizarPeriodo() {
        if (!desde || !hasta) {
            setError("Seleccioná las dos fechas.");
            return;
        }

        if (desde > hasta) {
            setError("La fecha inicial no puede ser posterior a la fecha final.");
            return;
        }

        void cargarReportes();
    }

    if (cargando) {
        return (
            <div className="reportes-contenedor">
                <p className="reportes-cargando">Cargando reportes...</p>
            </div>
        );
    }

    return (
        <div className="reportes-contenedor">
            <div className="reportes-encabezado">
                <div>
                    <span className="reportes-etiqueta">
                        GESTIÓN DEPORTIVA UNJu
                    </span>
                    <h1>Reportes</h1>
                    <p>
                        Indicadores y estadísticas de los talleres deportivos.
                    </p>
                </div>

                <button
                    className="reportes-boton"
                    onClick={() => void cargarReportes()}
                    type="button"
                >
                    Actualizar reportes
                </button>
            </div>

            {error && <div className="reportes-error">{error}</div>}

            <section className="reportes-seccion">
                <h2>Resumen general</h2>
                <div className="reportes-tarjetas">
                    <Tarjeta
                        titulo="Participantes activos"
                        valor={resumen?.participantesActivos}
                    />
                    <Tarjeta
                        titulo="Habilitados"
                        valor={resumen?.habilitados}
                    />
                    <Tarjeta
                        titulo="No habilitados"
                        valor={resumen?.noHabilitados}
                    />
                    <Tarjeta
                        titulo="Requisitos pendientes"
                        valor={resumen?.conRequisitosPendientes}
                    />
                    <Tarjeta
                        titulo="Inscripciones activas"
                        valor={resumen?.inscripcionesActivas}
                    />
                    <Tarjeta
                        titulo="Preinscripciones pendientes"
                        valor={resumen?.preinscripcionesPendientes}
                    />
                    <Tarjeta
                        titulo="Lista de espera"
                        valor={resumen?.enListaEspera}
                    />
                    <Tarjeta
                        titulo="Asistencias últimos 30 días"
                        valor={resumen?.asistenciasUltimos30Dias}
                    />
                    <Tarjeta
                        titulo="Ingresos rechazados"
                        valor={resumen?.ingresosRechazadosUltimos30Dias}
                    />
                    <Tarjeta
                        titulo="Aptos por vencer"
                        valor={resumen?.aptosPorVencer}
                    />
                    <Tarjeta
                        titulo="Alertas activas"
                        valor={resumen?.alertasActivas}
                    />
                </div>
            </section>

            <section className="reportes-seccion">
                <h2>Estadísticas por categoría</h2>

                <div className="reportes-grid">
                    <div className="reportes-panel">
                        <h3>Participantes por disciplina</h3>
                        <GraficoBarras
                            datos={disciplinas}
                            etiqueta="disciplina"
                            valor="participantes"
                        />
                    </div>

                    <div className="reportes-panel">
                        <h3>Participantes por facultad</h3>
                        <GraficoBarras
                            datos={facultades}
                            etiqueta="categoria"
                            valor="participantes"
                        />
                    </div>

                    <div className="reportes-panel">
                        <h3>Participantes por sexo</h3>
                        <GraficoBarras
                            datos={sexos}
                            etiqueta="categoria"
                            valor="participantes"
                        />
                    </div>

                    <div className="reportes-panel">
                        <h3>Inscripciones por disciplina</h3>
                        <GraficoBarras
                            datos={disciplinas}
                            etiqueta="disciplina"
                            valor="inscripciones"
                        />
                    </div>
                </div>
            </section>

            <section className="reportes-seccion">
                <h2>Evolución y asistencia</h2>

                <div className="reportes-filtros">
                    <label>
                        Desde
                        <input
                            type="date"
                            value={desde}
                            onChange={(e) => setDesde(e.target.value)}
                        />
                    </label>

                    <label>
                        Hasta
                        <input
                            type="date"
                            value={hasta}
                            onChange={(e) => setHasta(e.target.value)}
                        />
                    </label>

                    <button
                        className="reportes-boton"
                        type="button"
                        onClick={actualizarPeriodo}
                    >
                        Aplicar período
                    </button>
                </div>

                <div className="reportes-grid">
                    <div className="reportes-panel">
                        <h3>Evolución de inscripciones</h3>
                        {evolucion.length ? (
                            <div className="reportes-tabla-contenedor">
                                <table className="reportes-tabla">
                                    <thead>
                                    <tr>
                                        <th>Mes</th>
                                        <th>Preinscripciones</th>
                                        <th>Inscripciones</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {evolucion.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.mes}</td>
                                            <td>{item.preinscripciones}</td>
                                            <td>{item.inscripciones}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="reportes-vacio">
                                No hay datos para este período.
                            </p>
                        )}
                    </div>

                    <div className="reportes-panel">
                        <h3>Asistencia por taller</h3>
                        {asistencias.length ? (
                            <div className="reportes-tabla-contenedor">
                                <table className="reportes-tabla">
                                    <thead>
                                    <tr>
                                        <th>Taller</th>
                                        <th>Habilitados</th>
                                        <th>Rechazados</th>
                                        <th>Participantes</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {asistencias.map((item) => (
                                        <tr key={item.idTaller}>
                                            <td>{item.taller}</td>
                                            <td>{item.habilitados}</td>
                                            <td>{item.rechazados}</td>
                                            <td>{item.participantesDistintos}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="reportes-vacio">
                                No hay datos para este período.
                            </p>
                        )}
                    </div>
                </div>
            </section>

            <section className="reportes-seccion">
                <h2>Participantes por taller</h2>

                <div className="reportes-tabla-contenedor">
                    <table className="reportes-tabla">
                        <thead>
                        <tr>
                            <th>Taller</th>
                            <th>Disciplina</th>
                            <th>Modalidad</th>
                            <th>Período</th>
                            <th>Cupo</th>
                            <th>Inscriptos</th>
                            <th>Pendientes</th>
                            <th>Lista de espera</th>
                        </tr>
                        </thead>
                        <tbody>
                        {talleres.map((item) => (
                            <tr key={item.idTaller}>
                                <td>{item.taller}</td>
                                <td>{item.disciplina}</td>
                                <td>{item.modalidad}</td>
                                <td>{item.periodo}</td>
                                <td>{item.cupoMaximo}</td>
                                <td>{item.inscriptosActivos}</td>
                                <td>{item.pendientesRevision}</td>
                                <td>{item.enListaEspera}</td>
                            </tr>
                        ))}
                        {!talleres.length && (
                            <tr>
                                <td colSpan={8}>
                                    No hay talleres para mostrar.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </section>

            {puedeVerDetalles && (
                <section className="reportes-seccion">
                    <h2>Reportes nominales</h2>
                    <p className="reportes-aclaracion">
                        Información personal visible únicamente para los
                        roles autorizados.
                    </p>

                    {errorDetalles && (
                        <div className="reportes-error">{errorDetalles}</div>
                    )}

                    {cargandoDetalles ? (
                        <p className="reportes-cargando">
                            Cargando detalles...
                        </p>
                    ) : (
                        <div className="reportes-grid">
                            <div className="reportes-panel">
                                <h3>Aptos médicos por vencer</h3>
                                <TablaAptos datos={aptos} />
                            </div>

                            <div className="reportes-panel">
                                <h3>Documentación pendiente</h3>
                                <TablaDocumentacion datos={documentacion} />
                            </div>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}

function Tarjeta({
                     titulo,
                     valor,
                 }: {
    titulo: string;
    valor?: number | null;
}) {
    return (
        <div className="reportes-tarjeta">
            <span>{titulo}</span>
            <strong>{valor ?? 0}</strong>
        </div>
    );
}

function TablaAptos({ datos }: { datos: AptoPorVencerDetalle[] }) {
    if (!datos.length) {
        return <p className="reportes-vacio">No hay aptos por vencer.</p>;
    }

    return (
        <div className="reportes-tabla-contenedor">
            <table className="reportes-tabla">
                <thead>
                <tr>
                    <th>Participante</th>
                    <th>DNI</th>
                    <th>Vencimiento</th>
                </tr>
                </thead>
                <tbody>
                {datos.map((item) => (
                    <tr key={item.idParticipante}>
                        <td>
                            {item.apellido}, {item.nombre}
                        </td>
                        <td>{item.dni}</td>
                        <td>{item.fechaVencimiento}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

function TablaDocumentacion({
                                datos,
                            }: {
    datos: DocumentacionPendienteDetalle[];
}) {
    if (!datos.length) {
        return (
            <p className="reportes-vacio">
                No hay documentación pendiente.
            </p>
        );
    }

    return (
        <div className="reportes-tabla-contenedor">
            <table className="reportes-tabla">
                <thead>
                <tr>
                    <th>Participante</th>
                    <th>DNI</th>
                    <th>Estado</th>
                    <th>Pendientes</th>
                </tr>
                </thead>
                <tbody>
                {datos.map((item) => (
                    <tr key={item.idParticipante}>
                        <td>
                            {item.apellido}, {item.nombre}
                        </td>
                        <td>{item.dni}</td>
                        <td>{item.estadoHabilitacion}</td>
                        <td>{item.pendientes}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default Reportes;
