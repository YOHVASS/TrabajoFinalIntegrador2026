
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { api } from "../services/api";
import "./InscripcionPublica.css";

interface Taller {
    id: number;
    nombre: string;
    modalidad: string;
    disciplina?: {
        nombre: string;
    };
}

interface RespuestaPreinscripcion {
    idPreinscripcion: number;
    taller: string;
    fechaSolicitud: string;
    estado: string;
    posicionListaEspera: number | null;
    mensaje: string | null;
}

function InscripcionPublica() {
    const idInicial = new URLSearchParams(window.location.search).get("idTaller") || "";

    const [talleres, setTalleres] = useState<Taller[]>([]);
    const [idTaller, setIdTaller] = useState(idInicial);
    const [dni, setDni] = useState("");
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [fechaNacimiento, setFechaNacimiento] = useState("");
    const [sexo, setSexo] = useState("");
    const [facultad, setFacultad] = useState("");
    const [email, setEmail] = useState("");
    const [telefono, setTelefono] = useState("");

    const [cargando, setCargando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");
    const [confirmacion, setConfirmacion] = useState<RespuestaPreinscripcion | null>(null);

    useEffect(() => {
        async function cargarTalleres() {
            try {
                const datos = await api<Taller[]>("/public/talleres");
                setTalleres(datos);
            } catch {
                setError("No se pudieron cargar los talleres. Intentá nuevamente.");
            } finally {
                setCargando(false);
            }
        }

        cargarTalleres();
    }, []);

    async function enviarPreinscripcion(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setConfirmacion(null);

        if (!/^\d{7,15}$/.test(dni)) {
            setError("El DNI debe contener entre 7 y 15 números.");
            return;
        }

        try {
            setEnviando(true);

            const respuesta = await api<RespuestaPreinscripcion>(
                "/public/preinscripciones",
                {
                    method: "POST",
                    body: JSON.stringify({
                        idTaller: Number(idTaller),
                        dni,
                        nombre,
                        apellido,
                        fechaNacimiento,
                        sexo,
                        facultad,
                        email,
                        telefono,
                    }),
                }
            );

            setConfirmacion(respuesta);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo enviar la preinscripción."
            );
        } finally {
            setEnviando(false);
        }
    }

    return (
        <div className="inscripcion-publica">
            <header className="inscripcion-header">
                <Link to="/oferta" className="inscripcion-volver">
                    <ArrowLeft size={18} />
                    Volver a la oferta deportiva
                </Link>
                <strong>UNJu Deportes</strong>
            </header>

            <main className="inscripcion-main">
                <section className="inscripcion-intro">
                    <span>UNIVERSIDAD NACIONAL DE JUJUY</span>
                    <h1>Preinscripción deportiva</h1>
                    <p>
                        Completá tus datos para solicitar tu inscripción
                        a uno de nuestros talleres.
                    </p>
                </section>

                {confirmacion ? (
                    <section className="inscripcion-confirmacion">
                        <CheckCircle2 size={48} />
                        <h2>¡Preinscripción enviada!</h2>
                        <p>
                            Tu solicitud fue registrada correctamente.
                        </p>
                        <p>
                            Número de solicitud: <strong>{confirmacion.idPreinscripcion}</strong>
                        </p>
                        <p>
                            Estado: <strong>{confirmacion.estado}</strong>
                        </p>
                        <Link to="/oferta" className="inscripcion-boton">
                            Volver a la oferta deportiva
                        </Link>
                    </section>
                ) : (
                    <form className="inscripcion-formulario" onSubmit={enviarPreinscripcion}>
                        <h2>Datos personales</h2>

                        <div className="inscripcion-campo">
                            <label htmlFor="dni">DNI *</label>
                            <input
                                id="dni"
                                value={dni}
                                onChange={(e) => setDni(e.target.value)}
                                inputMode="numeric"
                                pattern="[0-9]{7,15}"
                                maxLength={15}
                                required
                                placeholder="Ingresá tu DNI"
                            />
                        </div>

                        <div className="inscripcion-campos-dobles">
                            <div className="inscripcion-campo">
                                <label htmlFor="nombre">Nombre *</label>
                                <input
                                    id="nombre"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    maxLength={100}
                                    required
                                    placeholder="Tu nombre"
                                />
                            </div>

                            <div className="inscripcion-campo">
                                <label htmlFor="apellido">Apellido *</label>
                                <input
                                    id="apellido"
                                    value={apellido}
                                    onChange={(e) => setApellido(e.target.value)}
                                    maxLength={100}
                                    required
                                    placeholder="Tu apellido"
                                />
                            </div>
                        </div>

                        <div className="inscripcion-campos-dobles">
                            <div className="inscripcion-campo">
                                <label htmlFor="fechaNacimiento">Fecha de nacimiento *</label>
                                <input
                                    id="fechaNacimiento"
                                    type="date"
                                    value={fechaNacimiento}
                                    onChange={(e) => setFechaNacimiento(e.target.value)}
                                    max={new Date().toISOString().split("T")[0]}
                                    required
                                />
                            </div>

                            <div className="inscripcion-campo">
                                <label htmlFor="sexo">Sexo *</label>
                                <select
                                    id="sexo"
                                    value={sexo}
                                    onChange={(e) => setSexo(e.target.value)}
                                    required
                                >
                                    <option value="">Seleccioná una opción</option>
                                    <option value="FEMENINO">Femenino</option>
                                    <option value="MASCULINO">Masculino</option>
                                    <option value="X">Otro / No especificar</option>
                                </select>
                            </div>
                        </div>

                        <div className="inscripcion-campo">
                            <label htmlFor="facultad">Facultad</label>
                            <input
                                id="facultad"
                                value={facultad}
                                onChange={(e) => setFacultad(e.target.value)}
                                maxLength={100}
                                placeholder="Tu facultad (opcional)"
                            />
                        </div>

                        <h2>Datos de contacto</h2>

                        <div className="inscripcion-campo">
                            <label htmlFor="email">Correo electrónico *</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                maxLength={150}
                                required
                                placeholder="ejemplo@correo.com"
                            />
                        </div>

                        <div className="inscripcion-campo">
                            <label htmlFor="telefono">Teléfono</label>
                            <input
                                id="telefono"
                                type="tel"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                maxLength={30}
                                placeholder="Tu número de teléfono (opcional)"
                            />
                        </div>

                        <h2>Elegí tu taller</h2>

                        <div className="inscripcion-campo">
                            <label htmlFor="taller">Taller deportivo *</label>
                            <select
                                id="taller"
                                value={idTaller}
                                onChange={(e) => setIdTaller(e.target.value)}
                                required
                                disabled={cargando}
                            >
                                <option value="">
                                    {cargando ? "Cargando talleres..." : "Seleccioná un taller"}
                                </option>
                                {talleres.map((taller) => (
                                    <option key={taller.id} value={taller.id}>
                                        {taller.nombre} - {taller.disciplina?.nombre || taller.modalidad}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {error && <p className="inscripcion-error">{error}</p>}

                        <p className="inscripcion-nota">
                            Los campos marcados con * son obligatorios.
                            La preinscripción no implica una habilitación
                            automática para participar del taller.
                        </p>

                        <button
                            type="submit"
                            className="inscripcion-boton"
                            disabled={enviando || cargando || talleres.length === 0}
                        >
                            {enviando ? "Enviando..." : "Enviar preinscripción"}
                        </button>
                    </form>
                )}
            </main>
        </div>
    );
}

export default InscripcionPublica;
