
import { useCallback, useEffect, useState } from "react";
import {
    Activity,
    CalendarDays,
    Check,
    ChevronDown,
    Clock3,
    Dumbbell,
    Edit2,
    Filter,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    Users,
    X,
} from "lucide-react";
import { api } from "./services/api";
import "./OfertaDeportiva.css";

type Modalidad = "FEMENINA" | "MASCULINA" | "MIXTA";
type DiaSemana =
    | "LUNES"
    | "MARTES"
    | "MIERCOLES"
    | "JUEVES"
    | "VIERNES"
    | "SABADO"
    | "DOMINGO";

interface Disciplina {
    id: number;
    nombre: string;
    descripcion: string | null;
}

interface Periodo {
    id: number;
    codigo: string;
    fechaInicio: string;
    fechaFin: string;
    vigente: boolean;
}

interface Referencia {
    id: number;
    nombre: string;
}

interface Horario {
    id?: number | null;
    diaSemana: DiaSemana;
    horaInicio: string;
    horaFin: string;
}

interface Taller {
    id: number;
    nombre: string;
    modalidad: Modalidad;
    cupoMaximo: number | null;
    lugaresDisponibles: number | null;
    inscriptosActivos: number | null;
    enListaEspera: number | null;
    disciplina: Referencia;
    profesor: Referencia;
    periodo: {
        id: number;
        codigo: string;
        fechaInicio: string;
        fechaFin: string;
    };
    horarios: Horario[];
    ayudantes: Referencia[];
}

interface Docente {
    id: number;
    dni: string;
    nombre: string;
    apellido: string;
}

const DIAS: { value: DiaSemana; label: string }[] = [
    { value: "LUNES", label: "Lunes" },
    { value: "MARTES", label: "Martes" },
    { value: "MIERCOLES", label: "Miércoles" },
    { value: "JUEVES", label: "Jueves" },
    { value: "VIERNES", label: "Viernes" },
    { value: "SABADO", label: "Sábado" },
    { value: "DOMINGO", label: "Domingo" },
];

const MODALIDADES: { value: Modalidad; label: string }[] = [
    { value: "FEMENINA", label: "Femenina" },
    { value: "MASCULINA", label: "Masculina" },
    { value: "MIXTA", label: "Mixta" },
];

const errorMessage = (error: unknown) =>
    error instanceof Error ? error.message : "Ocurrió un error inesperado.";

const fecha = (value?: string) =>
    value
        ? new Date(`${value}T00:00:00`).toLocaleDateString("es-AR")
        : "—";

const modalidadLabel = (value: Modalidad) =>
    MODALIDADES.find((item) => item.value === value)?.label ?? value;

const nuevoHorario = (): Horario => ({
    diaSemana: "LUNES",
    horaInicio: "09:00",
    horaFin: "10:00",
});

function OfertaDeportiva() {
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    const puedeGestionar = ["ADMINISTRATIVO", "COORDINADOR"].includes(
        usuario.rol
    );

    const [seccion, setSeccion] = useState<"talleres" | "disciplinas" | "periodos">("talleres");
    const [talleres, setTalleres] = useState<Taller[]>([]);
    const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
    const [periodos, setPeriodos] = useState<Periodo[]>([]);
    const [profesores, setProfesores] = useState<Docente[]>([]);
    const [ayudantes, setAyudantes] = useState<Docente[]>([]);

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [filtroDisciplina, setFiltroDisciplina] = useState("");
    const [filtroPeriodo, setFiltroPeriodo] = useState("");
    const [filtroModalidad, setFiltroModalidad] = useState("");

    const [modal, setModal] = useState<"taller" | "disciplina" | "periodo" | "cupo" | null>(null);
    const [editandoId, setEditandoId] = useState<number | null>(null);
    const [guardando, setGuardando] = useState(false);

    const [tallerForm, setTallerForm] = useState({
        nombre: "",
        idDisciplina: "",
        idProfesor: "",
        idPeriodo: "",
        modalidad: "MIXTA" as Modalidad,
        cupoMaximo: "",
        horarios: [nuevoHorario()],
        idsAyudantes: [] as number[],
    });

    const [disciplinaForm, setDisciplinaForm] = useState({
        nombre: "",
        descripcion: "",
    });

    const [periodoForm, setPeriodoForm] = useState({
        codigo: "",
        fechaInicio: "",
        fechaFin: "",
    });

    const [cupoForm, setCupoForm] = useState("");
    const [tallerCupo, setTallerCupo] = useState<Taller | null>(null);

    const cargarDatos = useCallback(async () => {
        try {
            setCargando(true);
            setError("");

            const [listaTalleres, listaDisciplinas, listaPeriodos] =
                await Promise.all([
                    api<Taller[]>("/talleres"),
                    api<Disciplina[]>("/disciplinas"),
                    api<Periodo[]>("/periodos"),
                ]);

            setTalleres(listaTalleres);
            setDisciplinas(listaDisciplinas);
            setPeriodos(listaPeriodos);

            if (puedeGestionar) {
                const [listaProfesores, listaAyudantes] = await Promise.all([
                    api<Docente[]>("/profesores"),
                    api<Docente[]>("/ayudantes"),
                ]);

                setProfesores(listaProfesores);
                setAyudantes(listaAyudantes);
            } else {
                setProfesores([]);
                setAyudantes([]);
            }
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setCargando(false);
        }
    }, [puedeGestionar]);

    // Carga inicial diferida para evitar actualizar el estado directamente
    // durante el efecto.
    useEffect(() => {
        const temporizador = window.setTimeout(() => {
            void cargarDatos();
        }, 0);

        return () => {
            window.clearTimeout(temporizador);
        };
    }, [cargarDatos]);

    const talleresFiltrados = talleres.filter((taller) => {
        const texto = busqueda.trim().toLowerCase();
        const coincideTexto =
            !texto ||
            taller.nombre.toLowerCase().includes(texto) ||
            taller.disciplina.nombre.toLowerCase().includes(texto) ||
            taller.profesor.nombre.toLowerCase().includes(texto);

        return (
            coincideTexto &&
            (!filtroDisciplina || taller.disciplina.id === Number(filtroDisciplina)) &&
            (!filtroPeriodo || taller.periodo.id === Number(filtroPeriodo)) &&
            (!filtroModalidad || taller.modalidad === filtroModalidad)
        );
    });

    const mostrarMensaje = (texto: string) => {
        setMensaje(texto);
        window.setTimeout(() => setMensaje(""), 4000);
    };

    const cerrarModal = () => {
        setModal(null);
        setEditandoId(null);
        setTallerCupo(null);
    };

    const abrirNuevoTaller = () => {
        if (!puedeGestionar) return;

        setEditandoId(null);
        setTallerForm({
            nombre: "",
            idDisciplina: "",
            idProfesor: "",
            idPeriodo: "",
            modalidad: "MIXTA",
            cupoMaximo: "",
            horarios: [nuevoHorario()],
            idsAyudantes: [],
        });
        setModal("taller");
    };

    const abrirEditarTaller = (taller: Taller) => {
        if (!puedeGestionar) return;

        setEditandoId(taller.id);
        setTallerForm({
            nombre: taller.nombre,
            idDisciplina: String(taller.disciplina.id),
            idProfesor: String(taller.profesor.id),
            idPeriodo: String(taller.periodo.id),
            modalidad: taller.modalidad,
            cupoMaximo: taller.cupoMaximo == null ? "" : String(taller.cupoMaximo),
            horarios: taller.horarios.length
                ? taller.horarios.map((horario) => ({
                    diaSemana: horario.diaSemana,
                    horaInicio: horario.horaInicio.slice(0, 5),
                    horaFin: horario.horaFin.slice(0, 5),
                }))
                : [nuevoHorario()],
            idsAyudantes: taller.ayudantes.map((item) => item.id),
        });
        setModal("taller");
    };

    const guardarTaller = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!puedeGestionar) return;

        if (
            !tallerForm.nombre.trim() ||
            !tallerForm.idDisciplina ||
            !tallerForm.idProfesor ||
            !tallerForm.idPeriodo
        ) {
            setError("Completá todos los campos obligatorios del taller.");
            return;
        }

        if (tallerForm.horarios.some((h) => h.horaFin <= h.horaInicio)) {
            setError("En cada horario, la hora de fin debe ser posterior a la de inicio.");
            return;
        }

        try {
            setGuardando(true);
            setError("");

            const payload = {
                idDisciplina: Number(tallerForm.idDisciplina),
                idProfesor: Number(tallerForm.idProfesor),
                idPeriodo: Number(tallerForm.idPeriodo),
                nombre: tallerForm.nombre.trim(),
                modalidad: tallerForm.modalidad,
                cupoMaximo: tallerForm.cupoMaximo ? Number(tallerForm.cupoMaximo) : null,
                horarios: tallerForm.horarios.map((h) => ({
                    diaSemana: h.diaSemana,
                    horaInicio: h.horaInicio,
                    horaFin: h.horaFin,
                })),
                idsAyudantes: tallerForm.idsAyudantes,
            };

            if (editandoId) {
                await api(`/talleres/${editandoId}`, {
                    method: "PUT",
                    body: JSON.stringify(payload),
                });
                mostrarMensaje("El taller se actualizó correctamente.");
            } else {
                await api("/talleres", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
                mostrarMensaje("El taller se creó correctamente.");
            }

            cerrarModal();
            await cargarDatos();
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setGuardando(false);
        }
    };

    const guardarDisciplina = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!puedeGestionar) return;

        try {
            setGuardando(true);
            setError("");
            const payload = {
                nombre: disciplinaForm.nombre.trim(),
                descripcion: disciplinaForm.descripcion.trim() || null,
            };

            if (editandoId) {
                await api(`/disciplinas/${editandoId}`, {
                    method: "PUT",
                    body: JSON.stringify(payload),
                });
                mostrarMensaje("La disciplina se actualizó correctamente.");
            } else {
                await api("/disciplinas", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
                mostrarMensaje("La disciplina se creó correctamente.");
            }

            cerrarModal();
            await cargarDatos();
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setGuardando(false);
        }
    };

    const guardarPeriodo = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!puedeGestionar) return;

        if (periodoForm.fechaFin < periodoForm.fechaInicio) {
            setError("La fecha de finalización no puede ser anterior a la fecha de inicio.");
            return;
        }

        try {
            setGuardando(true);
            setError("");
            const payload = {
                codigo: periodoForm.codigo.trim(),
                fechaInicio: periodoForm.fechaInicio,
                fechaFin: periodoForm.fechaFin,
            };

            if (editandoId) {
                await api(`/periodos/${editandoId}`, {
                    method: "PUT",
                    body: JSON.stringify(payload),
                });
                mostrarMensaje("El período se actualizó correctamente.");
            } else {
                await api("/periodos", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
                mostrarMensaje("El período se creó correctamente.");
            }

            cerrarModal();
            await cargarDatos();
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setGuardando(false);
        }
    };

    const cambiarCupo = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!puedeGestionar || !tallerCupo) return;

        try {
            setGuardando(true);
            setError("");
            await api(`/talleres/${tallerCupo.id}/cupo`, {
                method: "PATCH",
                body: JSON.stringify({
                    cupoMaximo: cupoForm.trim() ? Number(cupoForm) : null,
                }),
            });
            cerrarModal();
            mostrarMensaje("El cupo se actualizó. Se revisó la lista de espera.");
            await cargarDatos();
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setGuardando(false);
        }
    };

    const eliminar = async (tipo: "disciplina" | "periodo", id: number, nombre: string) => {
        if (!puedeGestionar) return;

        const etiqueta = tipo === "disciplina" ? "la disciplina" : "el período";
        if (!window.confirm(`¿Querés eliminar ${etiqueta} "${nombre}"? Esta acción no se puede deshacer.`)) {
            return;
        }

        try {
            setError("");
            await api(`/${tipo === "disciplina" ? "disciplinas" : "periodos"}/${id}`, {
                method: "DELETE",
            });
            mostrarMensaje(`${tipo === "disciplina" ? "Disciplina" : "Período"} eliminado correctamente.`);
            await cargarDatos();
        } catch (err) {
            setError(errorMessage(err));
        }
    };

    const eliminarTaller = async (taller: Taller) => {
        if (!puedeGestionar) return;
        if (!window.confirm(`¿Querés eliminar el taller "${taller.nombre}"?`)) return;

        try {
            setError("");
            await api(`/talleres/${taller.id}`, { method: "DELETE" });
            mostrarMensaje("El taller se eliminó correctamente.");
            await cargarDatos();
        } catch (err) {
            setError(errorMessage(err));
        }
    };

    const abrirDisciplina = (disciplina?: Disciplina) => {
        if (!puedeGestionar) return;

        setEditandoId(disciplina?.id ?? null);
        setDisciplinaForm({
            nombre: disciplina?.nombre ?? "",
            descripcion: disciplina?.descripcion ?? "",
        });
        setModal("disciplina");
    };

    const abrirPeriodo = (periodo?: Periodo) => {
        if (!puedeGestionar) return;

        setEditandoId(periodo?.id ?? null);
        setPeriodoForm({
            codigo: periodo?.codigo ?? "",
            fechaInicio: periodo?.fechaInicio ?? "",
            fechaFin: periodo?.fechaFin ?? "",
        });
        setModal("periodo");
    };

    const abrirCupo = (taller: Taller) => {
        if (!puedeGestionar) return;

        setTallerCupo(taller);
        setCupoForm(taller.cupoMaximo == null ? "" : String(taller.cupoMaximo));
        setModal("cupo");
    };

    const totalInscriptos = talleres.reduce(
        (total, item) => total + (item.inscriptosActivos ?? 0),
        0
    );
    const totalEspera = talleres.reduce(
        (total, item) => total + (item.enListaEspera ?? 0),
        0
    );

    return (
        <div className="module-page oferta-page">
            <div className="module-heading">
                <div>
                    <div className="module-eyebrow">GESTIÓN DE ACTIVIDADES</div>
                    <h1>Oferta deportiva</h1>
                    <p>
                        {puedeGestionar
                            ? "Administrá talleres, disciplinas, períodos y disponibilidad de cupos."
                            : "Consultá los talleres de la oferta deportiva."}
                    </p>
                </div>

                {puedeGestionar && (
                    <button
                        className="primary-button"
                        type="button"
                        onClick={
                            seccion === "talleres"
                                ? abrirNuevoTaller
                                : seccion === "disciplinas"
                                    ? () => abrirDisciplina()
                                    : () => abrirPeriodo()
                        }
                    >
                        <Plus size={18} />
                        {seccion === "talleres"
                            ? "Nuevo taller"
                            : seccion === "disciplinas"
                                ? "Nueva disciplina"
                                : "Nuevo período"}
                    </button>
                )}
            </div>

            <div className="oferta-tabs">
                <button
                    className={seccion === "talleres" ? "active" : ""}
                    onClick={() => setSeccion("talleres")}
                    type="button"
                >
                    <Dumbbell size={17} /> Talleres
                </button>

                {puedeGestionar && (
                    <>
                        <button
                            className={seccion === "disciplinas" ? "active" : ""}
                            onClick={() => setSeccion("disciplinas")}
                            type="button"
                        >
                            <Activity size={17} /> Disciplinas
                        </button>

                        <button
                            className={seccion === "periodos" ? "active" : ""}
                            onClick={() => setSeccion("periodos")}
                            type="button"
                        >
                            <CalendarDays size={17} /> Períodos
                        </button>
                    </>
                )}
            </div>

            {mensaje && (
                <div className="oferta-alert success">
                    <Check size={17} />
                    {mensaje}
                </div>
            )}

            {error && (
                <div className="oferta-alert error">
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => setError("")}
                        aria-label="Cerrar"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {seccion === "talleres" && (
                <>
                    {puedeGestionar && (
                        <div className="oferta-summary">
                            <article>
                                <span className="summary-icon blue">
                                    <Dumbbell size={20} />
                                </span>
                                <div>
                                    <small>Talleres registrados</small>
                                    <strong>{talleres.length}</strong>
                                </div>
                            </article>

                            <article>
                                <span className="summary-icon green">
                                    <Users size={20} />
                                </span>
                                <div>
                                    <small>Inscripciones activas</small>
                                    <strong>{totalInscriptos}</strong>
                                </div>
                            </article>

                            <article>
                                <span className="summary-icon orange">
                                    <Clock3 size={20} />
                                </span>
                                <div>
                                    <small>En lista de espera</small>
                                    <strong>{totalEspera}</strong>
                                </div>
                            </article>
                        </div>
                    )}

                    <section className="oferta-card">
                        <div className="oferta-card-heading">
                            <div>
                                <h2>Listado de talleres</h2>
                                <p>Consultá la oferta deportiva y sus datos.</p>
                            </div>

                            <button
                                className="secondary-button"
                                type="button"
                                onClick={() => void cargarDatos()}
                            >
                                <RefreshCw size={16} /> Actualizar
                            </button>
                        </div>

                        <div className="oferta-filters">
                            <label className="oferta-search">
                                <Search size={17} />
                                <input
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    placeholder="Buscar taller, disciplina o profesor..."
                                />
                            </label>

                            <label>
                                <Filter size={16} />
                                <select
                                    value={filtroDisciplina}
                                    onChange={(e) => setFiltroDisciplina(e.target.value)}
                                >
                                    <option value="">Todas las disciplinas</option>
                                    {disciplinas.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.nombre}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={14} />
                            </label>

                            <label>
                                <select
                                    value={filtroPeriodo}
                                    onChange={(e) => setFiltroPeriodo(e.target.value)}
                                >
                                    <option value="">Todos los períodos</option>
                                    {periodos.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.codigo}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={14} />
                            </label>

                            <label>
                                <select
                                    value={filtroModalidad}
                                    onChange={(e) => setFiltroModalidad(e.target.value)}
                                >
                                    <option value="">Todas las modalidades</option>
                                    {MODALIDADES.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={14} />
                            </label>
                        </div>

                        <div className="oferta-table-wrap">
                            <table className="oferta-table">
                                <thead>
                                <tr>
                                    <th>TALLER</th>
                                    <th>DISCIPLINA</th>
                                    <th>PROFESOR</th>
                                    <th>MODALIDAD</th>
                                    <th>PERÍODO</th>
                                    <th>CUPOS</th>
                                    {puedeGestionar && <th>ACCIONES</th>}
                                </tr>
                                </thead>

                                <tbody>
                                {cargando ? (
                                    <tr>
                                        <td colSpan={puedeGestionar ? 7 : 6} className="oferta-empty">
                                            Cargando oferta deportiva...
                                        </td>
                                    </tr>
                                ) : talleresFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan={puedeGestionar ? 7 : 6} className="oferta-empty">
                                            No hay talleres que coincidan con la búsqueda.
                                        </td>
                                    </tr>
                                ) : (
                                    talleresFiltrados.map((taller) => (
                                        <tr key={taller.id}>
                                            <td>
                                                <strong>{taller.nombre}</strong>
                                                <small className="oferta-subline">
                                                    {taller.horarios.length} horario(s)
                                                </small>
                                            </td>
                                            <td>{taller.disciplina.nombre}</td>
                                            <td>{taller.profesor.nombre}</td>
                                            <td>
                                                <span className={`modalidad-chip ${taller.modalidad.toLowerCase()}`}>
                                                    {modalidadLabel(taller.modalidad)}
                                                </span>
                                            </td>
                                            <td>{taller.periodo.codigo}</td>
                                            <td>
                                                <strong>{taller.inscriptosActivos ?? 0}</strong>
                                                <small className="oferta-subline">
                                                    {taller.cupoMaximo == null
                                                        ? "Sin límite"
                                                        : `${taller.lugaresDisponibles ?? 0} disponibles`}
                                                </small>
                                            </td>

                                            {puedeGestionar && (
                                                <td>
                                                    <div className="oferta-actions">
                                                        <button
                                                            type="button"
                                                            title="Editar taller"
                                                            onClick={() => abrirEditarTaller(taller)}
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            title="Modificar cupo"
                                                            onClick={() => abrirCupo(taller)}
                                                        >
                                                            <Users size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            title="Eliminar taller"
                                                            onClick={() => void eliminarTaller(taller)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>

                        <div className="oferta-footer">
                            Mostrando {talleresFiltrados.length} de {talleres.length} talleres
                            {puedeGestionar &&
                                ` · ${disciplinas.length} disciplinas · ${periodos.length} períodos`}
                        </div>
                    </section>
                </>
            )}

            {puedeGestionar && seccion === "disciplinas" && (
                <section className="oferta-card">
                    <div className="oferta-card-heading">
                        <div>
                            <h2>Disciplinas deportivas</h2>
                            <p>Administrá las actividades que componen la oferta institucional.</p>
                        </div>
                        <strong>{disciplinas.length} registradas</strong>
                    </div>

                    <div className="oferta-entity-grid">
                        {cargando ? (
                            <p className="oferta-empty">Cargando disciplinas...</p>
                        ) : disciplinas.length === 0 ? (
                            <p className="oferta-empty">Todavía no hay disciplinas registradas.</p>
                        ) : (
                            disciplinas.map((d) => (
                                <article className="oferta-entity" key={d.id}>
                                    <div className="entity-icon">
                                        <Dumbbell size={20} />
                                    </div>
                                    <div className="entity-content">
                                        <strong>{d.nombre}</strong>
                                        <p>{d.descripcion || "Sin descripción"}</p>
                                    </div>
                                    <div className="oferta-actions">
                                        <button
                                            type="button"
                                            title="Editar"
                                            onClick={() => abrirDisciplina(d)}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            title="Eliminar"
                                            onClick={() => void eliminar("disciplina", d.id, d.nombre)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </section>
            )}

            {puedeGestionar && seccion === "periodos" && (
                <section className="oferta-card">
                    <div className="oferta-card-heading">
                        <div>
                            <h2>Períodos académicos</h2>
                            <p>Definí los ciclos en los que se desarrollan los talleres.</p>
                        </div>
                        <strong>{periodos.length} registrados</strong>
                    </div>

                    <div className="oferta-period-list">
                        {cargando ? (
                            <p className="oferta-empty">Cargando períodos...</p>
                        ) : periodos.length === 0 ? (
                            <p className="oferta-empty">Todavía no hay períodos registrados.</p>
                        ) : (
                            periodos.map((p) => (
                                <article className="oferta-period" key={p.id}>
                                    <div className="period-icon">
                                        <CalendarDays size={20} />
                                    </div>
                                    <div className="period-content">
                                        <strong>{p.codigo}</strong>
                                        <span>
                                            {fecha(p.fechaInicio)} — {fecha(p.fechaFin)}
                                        </span>
                                    </div>
                                    <span className={`period-status ${p.vigente ? "current" : ""}`}>
                                        {p.vigente ? "Vigente" : "No vigente"}
                                    </span>
                                    <div className="oferta-actions">
                                        <button
                                            type="button"
                                            title="Editar"
                                            onClick={() => abrirPeriodo(p)}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            title="Eliminar"
                                            onClick={() => void eliminar("periodo", p.id, p.codigo)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </section>
            )}

            {modal && puedeGestionar && (
                <div
                    className="oferta-modal-backdrop"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) cerrarModal();
                    }}
                >
                    <section className="oferta-modal" role="dialog" aria-modal="true">
                        <div className="oferta-modal-heading">
                            <div>
                                <small>UNJU DEPORTES</small>
                                <h2>
                                    {modal === "taller"
                                        ? editandoId
                                            ? "Editar taller"
                                            : "Nuevo taller"
                                        : modal === "disciplina"
                                            ? editandoId
                                                ? "Editar disciplina"
                                                : "Nueva disciplina"
                                            : modal === "periodo"
                                                ? editandoId
                                                    ? "Editar período"
                                                    : "Nuevo período"
                                                : "Modificar cupo"}
                                </h2>
                            </div>
                            <button type="button" onClick={cerrarModal} aria-label="Cerrar">
                                <X size={20} />
                            </button>
                        </div>

                        {modal === "taller" && (
                            <form onSubmit={guardarTaller}>
                                <label>
                                    Nombre del taller
                                    <input
                                        required
                                        maxLength={100}
                                        value={tallerForm.nombre}
                                        onChange={(e) =>
                                            setTallerForm({ ...tallerForm, nombre: e.target.value })
                                        }
                                        placeholder="Ej. Vóley recreativo"
                                    />
                                </label>

                                <div className="oferta-form-grid">
                                    <label>
                                        Disciplina
                                        <select
                                            required
                                            value={tallerForm.idDisciplina}
                                            onChange={(e) =>
                                                setTallerForm({ ...tallerForm, idDisciplina: e.target.value })
                                            }
                                        >
                                            <option value="">Seleccionar</option>
                                            {disciplinas.map((d) => (
                                                <option key={d.id} value={d.id}>{d.nombre}</option>
                                            ))}
                                        </select>
                                    </label>

                                    <label>
                                        Profesor
                                        <select
                                            required
                                            value={tallerForm.idProfesor}
                                            onChange={(e) =>
                                                setTallerForm({ ...tallerForm, idProfesor: e.target.value })
                                            }
                                        >
                                            <option value="">Seleccionar</option>
                                            {profesores.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.nombre} {p.apellido}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label>
                                        Período
                                        <select
                                            required
                                            value={tallerForm.idPeriodo}
                                            onChange={(e) =>
                                                setTallerForm({ ...tallerForm, idPeriodo: e.target.value })
                                            }
                                        >
                                            <option value="">Seleccionar</option>
                                            {periodos.map((p) => (
                                                <option key={p.id} value={p.id}>{p.codigo}</option>
                                            ))}
                                        </select>
                                    </label>

                                    <label>
                                        Modalidad
                                        <select
                                            value={tallerForm.modalidad}
                                            onChange={(e) =>
                                                setTallerForm({
                                                    ...tallerForm,
                                                    modalidad: e.target.value as Modalidad,
                                                })
                                            }
                                        >
                                            {MODALIDADES.map((m) => (
                                                <option key={m.value} value={m.value}>{m.label}</option>
                                            ))}
                                        </select>
                                    </label>

                                    <label>
                                        Cupo máximo
                                        <input
                                            type="number"
                                            min="1"
                                            value={tallerForm.cupoMaximo}
                                            onChange={(e) =>
                                                setTallerForm({ ...tallerForm, cupoMaximo: e.target.value })
                                            }
                                            placeholder="Vacío = sin límite"
                                        />
                                    </label>
                                </div>

                                <div className="horarios-heading">
                                    <strong>Horarios</strong>
                                    <button
                                        type="button"
                                        className="text-button"
                                        onClick={() =>
                                            setTallerForm({
                                                ...tallerForm,
                                                horarios: [...tallerForm.horarios, nuevoHorario()],
                                            })
                                        }
                                    >
                                        <Plus size={15} /> Agregar horario
                                    </button>
                                </div>

                                {tallerForm.horarios.map((h, index) => (
                                    <div className="horario-row" key={index}>
                                        <select
                                            aria-label="Día"
                                            value={h.diaSemana}
                                            onChange={(e) =>
                                                setTallerForm({
                                                    ...tallerForm,
                                                    horarios: tallerForm.horarios.map((item, i) =>
                                                        i === index
                                                            ? { ...item, diaSemana: e.target.value as DiaSemana }
                                                            : item
                                                    ),
                                                })
                                            }
                                        >
                                            {DIAS.map((d) => (
                                                <option key={d.value} value={d.value}>{d.label}</option>
                                            ))}
                                        </select>

                                        <input
                                            aria-label="Hora de inicio"
                                            type="time"
                                            required
                                            value={h.horaInicio}
                                            onChange={(e) =>
                                                setTallerForm({
                                                    ...tallerForm,
                                                    horarios: tallerForm.horarios.map((item, i) =>
                                                        i === index
                                                            ? { ...item, horaInicio: e.target.value }
                                                            : item
                                                    ),
                                                })
                                            }
                                        />

                                        <input
                                            aria-label="Hora de fin"
                                            type="time"
                                            required
                                            value={h.horaFin}
                                            onChange={(e) =>
                                                setTallerForm({
                                                    ...tallerForm,
                                                    horarios: tallerForm.horarios.map((item, i) =>
                                                        i === index
                                                            ? { ...item, horaFin: e.target.value }
                                                            : item
                                                    ),
                                                })
                                            }
                                        />

                                        <button
                                            type="button"
                                            title="Quitar horario"
                                            disabled={tallerForm.horarios.length === 1}
                                            onClick={() =>
                                                setTallerForm({
                                                    ...tallerForm,
                                                    horarios: tallerForm.horarios.filter((_, i) => i !== index),
                                                })
                                            }
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}

                                <label>Ayudantes</label>
                                <div className="ayudantes-select">
                                    {ayudantes.length === 0 ? (
                                        <small>No hay ayudantes registrados.</small>
                                    ) : (
                                        ayudantes.map((a) => (
                                            <label key={a.id}>
                                                <input
                                                    type="checkbox"
                                                    checked={tallerForm.idsAyudantes.includes(a.id)}
                                                    onChange={(e) =>
                                                        setTallerForm({
                                                            ...tallerForm,
                                                            idsAyudantes: e.target.checked
                                                                ? [...tallerForm.idsAyudantes, a.id]
                                                                : tallerForm.idsAyudantes.filter((id) => id !== a.id),
                                                        })
                                                    }
                                                />
                                                {a.nombre} {a.apellido}
                                            </label>
                                        ))
                                    )}
                                </div>

                                <div className="oferta-modal-actions">
                                    <button type="button" className="secondary-button" onClick={cerrarModal}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="primary-button" disabled={guardando}>
                                        {guardando
                                            ? "Guardando..."
                                            : editandoId
                                                ? "Guardar cambios"
                                                : "Crear taller"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {modal === "disciplina" && (
                            <form onSubmit={guardarDisciplina}>
                                <label>
                                    Nombre
                                    <input
                                        required
                                        maxLength={50}
                                        value={disciplinaForm.nombre}
                                        onChange={(e) =>
                                            setDisciplinaForm({
                                                ...disciplinaForm,
                                                nombre: e.target.value,
                                            })
                                        }
                                        placeholder="Nombre de la disciplina"
                                    />
                                </label>

                                <label>
                                    Descripción
                                    <textarea
                                        maxLength={255}
                                        rows={3}
                                        value={disciplinaForm.descripcion}
                                        onChange={(e) =>
                                            setDisciplinaForm({
                                                ...disciplinaForm,
                                                descripcion: e.target.value,
                                            })
                                        }
                                        placeholder="Descripción opcional"
                                    />
                                </label>

                                <div className="oferta-modal-actions">
                                    <button type="button" className="secondary-button" onClick={cerrarModal}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="primary-button" disabled={guardando}>
                                        {guardando ? "Guardando..." : "Guardar disciplina"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {modal === "periodo" && (
                            <form onSubmit={guardarPeriodo}>
                                <label>
                                    Código del período
                                    <input
                                        required
                                        maxLength={20}
                                        value={periodoForm.codigo}
                                        onChange={(e) =>
                                            setPeriodoForm({ ...periodoForm, codigo: e.target.value })
                                        }
                                        placeholder="Ej. 2026-1"
                                    />
                                </label>

                                <div className="oferta-form-grid">
                                    <label>
                                        Fecha de inicio
                                        <input
                                            required
                                            type="date"
                                            value={periodoForm.fechaInicio}
                                            onChange={(e) =>
                                                setPeriodoForm({
                                                    ...periodoForm,
                                                    fechaInicio: e.target.value,
                                                })
                                            }
                                        />
                                    </label>

                                    <label>
                                        Fecha de finalización
                                        <input
                                            required
                                            type="date"
                                            min={periodoForm.fechaInicio || undefined}
                                            value={periodoForm.fechaFin}
                                            onChange={(e) =>
                                                setPeriodoForm({
                                                    ...periodoForm,
                                                    fechaFin: e.target.value,
                                                })
                                            }
                                        />
                                    </label>
                                </div>

                                <div className="oferta-modal-actions">
                                    <button type="button" className="secondary-button" onClick={cerrarModal}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="primary-button" disabled={guardando}>
                                        {guardando ? "Guardando..." : "Guardar período"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {modal === "cupo" && tallerCupo && (
                            <form onSubmit={cambiarCupo}>
                                <p className="cupo-description">
                                    Estás modificando el cupo de <strong>{tallerCupo.nombre}</strong>.
                                    El backend no permitirá establecer un cupo inferior a los lugares ya
                                    ocupados. Al ampliar el cupo, se revisará la lista de espera.
                                </p>

                                <label>
                                    Cupo máximo
                                    <input
                                        type="number"
                                        min="1"
                                        value={cupoForm}
                                        onChange={(e) => setCupoForm(e.target.value)}
                                        placeholder="Vacío = sin límite"
                                    />
                                </label>

                                <div className="oferta-modal-actions">
                                    <button type="button" className="secondary-button" onClick={cerrarModal}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="primary-button" disabled={guardando}>
                                        {guardando ? "Actualizando..." : "Actualizar cupo"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
}

export default OfertaDeportiva;
