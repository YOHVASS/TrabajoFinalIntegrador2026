
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Users,
    Search,
    BookOpen,
    ShieldCheck,
    Clock,
    AlertCircle,
    Loader2,
    UserRound,
} from "lucide-react";

import { api } from "./services/api";
import "./ParticipantesTaller.css";

interface Taller {
    id: number;
    nombre: string;
    modalidad?: string;
    disciplina?: { id: number; nombre: string };
    periodo?: { codigo?: string };
}

interface Inscripcion {
    id: number;
    fechaInscripcion: string;
    estado: string;
    idParticipante: number;
    dni: string;
    nombre: string;
    apellido: string;
    fotoUrl?: string | null;
    estadoHabilitacion: string;
    idTaller: number;
    taller: string;
    periodo?: string;
}

function ParticipantesTaller() {
    const [talleres, setTalleres] = useState<Taller[]>([]);
    const [tallerSeleccionado, setTallerSeleccionado] = useState("");
    const [participantes, setParticipantes] = useState<Inscripcion[]>([]);
    const [busqueda, setBusqueda] = useState("");
    const [estado, setEstado] = useState("TODOS");
    const [cargandoTalleres, setCargandoTalleres] = useState(true);
    const [cargandoParticipantes, setCargandoParticipantes] = useState(false);
    const [error, setError] = useState("");

    const cargarTalleres = useCallback(async () => {
        try {
            setError("");
            setCargandoTalleres(true);

            const datos = await api<Taller[]>("/ingreso/talleres");
            setTalleres(datos);

            if (datos.length > 0) {
                setTallerSeleccionado(String(datos[0].id));
            } else {
                setTallerSeleccionado("");
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudieron cargar los talleres."
            );
        } finally {
            setCargandoTalleres(false);
        }
    }, []);

    const cargarParticipantes = useCallback(async () => {
        if (!tallerSeleccionado) {
            setParticipantes([]);
            return;
        }

        try {
            setCargandoParticipantes(true);
            setError("");

            const datos = await api<Inscripcion[]>(
                `/talleres/${tallerSeleccionado}/inscriptos?estado=ACTIVA`
            );

            setParticipantes(datos);
        } catch (err) {
            setParticipantes([]);
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudieron cargar los participantes del taller."
            );
        } finally {
            setCargandoParticipantes(false);
        }
    }, [tallerSeleccionado]);

    // Carga inicial de los talleres.
    useEffect(() => {
        const temporizador = window.setTimeout(() => {
            void cargarTalleres();
        }, 0);

        return () => {
            window.clearTimeout(temporizador);
        };
    }, [cargarTalleres]);

    // Carga los participantes cada vez que cambia el taller seleccionado.
    useEffect(() => {
        const temporizador = window.setTimeout(() => {
            void cargarParticipantes();
        }, 0);

        return () => {
            window.clearTimeout(temporizador);
        };
    }, [cargarParticipantes]);

    const participantesFiltrados = useMemo(() => {
        const texto = busqueda.trim().toLowerCase();

        return participantes.filter((participante) => {
            const nombre =
                `${participante.apellido} ${participante.nombre}`.toLowerCase();

            const coincideBusqueda =
                !texto ||
                nombre.includes(texto) ||
                participante.dni.includes(texto) ||
                String(participante.idParticipante).includes(texto);

            const coincideEstado =
                estado === "TODOS" ||
                participante.estadoHabilitacion === estado;

            return coincideBusqueda && coincideEstado;
        });
    }, [participantes, busqueda, estado]);

    const habilitados = participantes.filter(
        (participante) =>
            participante.estadoHabilitacion === "HABILITADO"
    ).length;

    const pendientes = participantes.filter(
        (participante) =>
            participante.estadoHabilitacion === "PENDIENTE"
    ).length;

    const noHabilitados = participantes.filter(
        (participante) =>
            participante.estadoHabilitacion === "NO_HABILITADO"
    ).length;

    const nombreEstado = (valor: string) => {
        switch (valor) {
            case "HABILITADO":
                return "Habilitado";
            case "PENDIENTE":
                return "Pendiente";
            case "NO_HABILITADO":
                return "No habilitado";
            default:
                return valor || "Sin información";
        }
    };

    const claseEstado = (valor: string) => {
        switch (valor) {
            case "HABILITADO":
                return "participantes-status-enabled";
            case "PENDIENTE":
                return "participantes-status-pending";
            default:
                return "participantes-status-disabled";
        }
    };

    if (cargandoTalleres) {
        return (
            <div className="page-container participantes-taller-container">
                <div className="participantes-loading">
                    <Loader2 className="participantes-spinner" size={26} />
                    <span>Cargando talleres...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container participantes-taller-container">
            <section className="participantes-header">
                <div>
                    <span className="participantes-eyebrow">
                        <Users size={15} />
                        ÁREA DOCENTE
                    </span>

                    <h1>Participantes por taller</h1>

                    <p>
                        Consultá las personas inscriptas en cada taller
                        deportivo.
                    </p>
                </div>

                <div className="participantes-header-icon">
                    <Users size={29} />
                </div>
            </section>

            <section className="participantes-selector-card">
                <div className="participantes-selector-heading">
                    <BookOpen size={20} />
                    <div>
                        <strong>Seleccionar taller</strong>
                        <span>
                            Elegí un taller para consultar sus participantes.
                        </span>
                    </div>
                </div>

                <select
                    value={tallerSeleccionado}
                    onChange={(e) => setTallerSeleccionado(e.target.value)}
                    disabled={talleres.length === 0}
                >
                    {talleres.length === 0 ? (
                        <option value="">No hay talleres disponibles</option>
                    ) : (
                        talleres.map((taller) => (
                            <option key={taller.id} value={taller.id}>
                                {taller.nombre}
                                {taller.disciplina?.nombre
                                    ? ` - ${taller.disciplina.nombre}`
                                    : ""}
                            </option>
                        ))
                    )}
                </select>
            </section>

            {error && (
                <div className="participantes-error">
                    <AlertCircle size={19} />
                    <span>{error}</span>
                </div>
            )}

            {talleres.length === 0 && !error ? (
                <div className="participantes-empty">
                    <Users size={35} />
                    <h3>No hay talleres disponibles</h3>
                    <p>
                        Cuando tengas talleres asignados, sus participantes
                        aparecerán en esta sección.
                    </p>
                </div>
            ) : (
                <>
                    <section className="participantes-summary">
                        <article className="participantes-summary-card">
                            <div className="participantes-summary-icon blue">
                                <Users size={21} />
                            </div>
                            <div>
                                <span>Participantes inscriptos</span>
                                <strong>{participantes.length}</strong>
                            </div>
                        </article>

                        <article className="participantes-summary-card">
                            <div className="participantes-summary-icon green">
                                <ShieldCheck size={21} />
                            </div>
                            <div>
                                <span>Habilitados</span>
                                <strong>{habilitados}</strong>
                            </div>
                        </article>

                        <article className="participantes-summary-card">
                            <div className="participantes-summary-icon orange">
                                <Clock size={21} />
                            </div>
                            <div>
                                <span>Pendientes</span>
                                <strong>{pendientes}</strong>
                            </div>
                        </article>

                        <article className="participantes-summary-card">
                            <div className="participantes-summary-icon red">
                                <AlertCircle size={21} />
                            </div>
                            <div>
                                <span>No habilitados</span>
                                <strong>{noHabilitados}</strong>
                            </div>
                        </article>
                    </section>

                    <section className="participantes-list-card">
                        <div className="participantes-list-heading">
                            <div>
                                <h2>Listado de participantes</h2>
                                <p>
                                    Personas con inscripción activa en el
                                    taller seleccionado.
                                </p>
                            </div>

                            <span className="participantes-count">
                                {participantes.length} participantes
                            </span>
                        </div>

                        <div className="participantes-filters">
                            <label className="participantes-search">
                                <Search size={18} />
                                <input
                                    value={busqueda}
                                    onChange={(e) =>
                                        setBusqueda(e.target.value)
                                    }
                                    placeholder="Buscar por nombre, DNI o ID..."
                                />
                            </label>

                            <select
                                value={estado}
                                onChange={(e) => setEstado(e.target.value)}
                            >
                                <option value="TODOS">Todos los estados</option>
                                <option value="HABILITADO">Habilitados</option>
                                <option value="PENDIENTE">Pendientes</option>
                                <option value="NO_HABILITADO">
                                    No habilitados
                                </option>
                            </select>
                        </div>

                        <div className="participantes-table-wrapper">
                            <table className="participantes-table">
                                <thead>
                                <tr>
                                    <th>PARTICIPANTE</th>
                                    <th>DNI</th>
                                    <th>INSCRIPCIÓN</th>
                                    <th>HABILITACIÓN</th>
                                </tr>
                                </thead>

                                <tbody>
                                {cargandoParticipantes ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="participantes-empty-cell"
                                        >
                                            <Loader2
                                                size={22}
                                                className="participantes-spinner"
                                            />
                                            <span>
                                                    Cargando participantes...
                                                </span>
                                        </td>
                                    </tr>
                                ) : participantesFiltrados.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="participantes-empty-cell"
                                        >
                                            <UserRound size={25} />
                                            <span>
                                                    No se encontraron
                                                    participantes.
                                                </span>
                                        </td>
                                    </tr>
                                ) : (
                                    participantesFiltrados.map(
                                        (participante) => (
                                            <tr key={participante.id}>
                                                <td>
                                                    <div className="participantes-person">
                                                        {participante.fotoUrl ? (
                                                            <img
                                                                src={participante.fotoUrl}
                                                                alt=""
                                                            />
                                                        ) : (
                                                            <div className="participantes-avatar">
                                                                {participante.nombre?.[0]}
                                                                {participante.apellido?.[0]}
                                                            </div>
                                                        )}

                                                        <div>
                                                            <strong>
                                                                {participante.apellido},{" "}
                                                                {participante.nombre}
                                                            </strong>
                                                            <small>
                                                                ID: {participante.idParticipante}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>{participante.dni}</td>

                                                <td>
                                                        <span className="participantes-enrollment-status">
                                                            {participante.estado}
                                                        </span>
                                                </td>

                                                <td>
                                                        <span
                                                            className={`participantes-status ${claseEstado(
                                                                participante.estadoHabilitacion
                                                            )}`}
                                                        >
                                                            {nombreEstado(
                                                                participante.estadoHabilitacion
                                                            )}
                                                        </span>
                                                </td>
                                            </tr>
                                        )
                                    )
                                )}
                                </tbody>
                            </table>
                        </div>

                        <footer className="participantes-footer">
                            Mostrando {participantesFiltrados.length} de{" "}
                            {participantes.length} participantes inscriptos.
                        </footer>
                    </section>
                </>
            )}
        </div>
    );
}

export default ParticipantesTaller;
