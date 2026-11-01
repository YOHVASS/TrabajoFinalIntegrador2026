
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import "./OfertaPublica.css";

interface Disciplina {
    id: number;
    nombre: string;
    descripcion?: string;
}

interface Horario {
    id: number;
    diaSemana: string;
    horaInicio: string;
    horaFin: string;
}

interface Taller {
    id: number;
    nombre: string;
    modalidad: string;
    cupoMaximo: number;
    lugaresDisponibles: number;
    inscriptosActivos: number;
    enListaEspera: number;
    disciplina: { id: number; nombre: string };
    profesor: { id: number; nombre: string };
    periodo: {
        id: number;
        codigo: string;
        fechaInicio: string;
        fechaFin: string;
    };
    horarios: Horario[];
}

function OfertaPublica() {
    const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
    const [talleres, setTalleres] = useState<Taller[]>([]);
    const [filtro, setFiltro] = useState("todas");
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function cargarOferta() {
            try {
                setCargando(true);
                setError("");

                const [disciplinasData, talleresData] = await Promise.all([
                    api<Disciplina[]>("/public/disciplinas"),
                    api<Taller[]>("/public/talleres"),
                ]);

                setDisciplinas(disciplinasData);
                setTalleres(talleresData);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "No se pudo cargar la oferta deportiva."
                );
            } finally {
                setCargando(false);
            }
        }

        cargarOferta();
    }, []);

    const talleresFiltrados =
        filtro === "todas"
            ? talleres
            : talleres.filter(
                (taller) => String(taller.disciplina?.id) === filtro
            );

    return (
        <div className="oferta-publica">
            <header className="oferta-publica-header">
                <Link to="/" className="oferta-volver">
                    <ArrowLeft size={18} />
                    Volver al inicio
                </Link>
                <strong>UNJu Deportes</strong>
            </header>

            <main className="oferta-publica-main">
                <section className="oferta-publica-intro">
                    <span>UNIVERSIDAD NACIONAL DE JUJUY</span>
                    <h1>Oferta deportiva</h1>
                    <p>
                        Conocé los talleres disponibles y encontrá la actividad
                        ideal para vos.
                    </p>
                </section>

                <section className="oferta-filtros">
                    <label htmlFor="filtro-disciplina">
                        Filtrar por disciplina
                    </label>
                    <select
                        id="filtro-disciplina"
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                    >
                        <option value="todas">Todas las disciplinas</option>
                        {disciplinas.map((disciplina) => (
                            <option key={disciplina.id} value={disciplina.id}>
                                {disciplina.nombre}
                            </option>
                        ))}
                    </select>
                </section>

                {cargando ? (
                    <p className="oferta-mensaje">Cargando talleres...</p>
                ) : error ? (
                    <p className="oferta-error">{error}</p>
                ) : talleresFiltrados.length === 0 ? (
                    <p className="oferta-mensaje">
                        No hay talleres disponibles para esta selección.
                    </p>
                ) : (
                    <section className="oferta-talleres-grid">
                        {talleresFiltrados.map((taller) => (
                            <article className="oferta-taller-card" key={taller.id}>
                                <span className="oferta-taller-disciplina">
                                    {taller.disciplina?.nombre || "Deportes"}
                                </span>

                                <h2>{taller.nombre}</h2>

                                <p className="oferta-taller-modalidad">
                                    {taller.modalidad}
                                </p>

                                <div className="oferta-taller-dato">
                                    <Users size={17} />
                                    <span>
                                        {taller.lugaresDisponibles} lugares disponibles
                                    </span>
                                </div>

                                <div className="oferta-taller-dato">
                                    <CalendarDays size={17} />
                                    <span>
                                        {taller.periodo?.codigo || "Período vigente"}
                                    </span>
                                </div>

                                {taller.horarios?.map((horario) => (
                                    <div className="oferta-taller-dato" key={horario.id}>
                                        <Clock size={17} />
                                        <span>
                                            {horario.diaSemana}: {horario.horaInicio} a{" "}
                                            {horario.horaFin}
                                        </span>
                                    </div>
                                ))}

                                <div className="oferta-taller-profesor">
                                    Profesor: {taller.profesor?.nombre || "A confirmar"}
                                </div>

                                <Link
                                    to={`/inscripcion?idTaller=${taller.id}`}
                                    className="oferta-taller-boton"
                                >
                                    Preinscribirme
                                </Link>
                            </article>
                        ))}
                    </section>
                )}
            </main>
        </div>
    );
}

export default OfertaPublica;

