
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, CheckCircle2, Clock, XCircle } from "lucide-react";
import { api } from "../services/api";
import "./ConsultaPreinscripcion.css";

interface ConsultaResponse {
    idPreinscripcion: number;
    taller: string;
    fechaSolicitud: string;
    estado: string;
    posicionListaEspera: number | null;
    mensaje: string | null;
}

function ConsultaPreinscripcion() {
    const [numeroSolicitud, setNumeroSolicitud] = useState("");
    const [dni, setDni] = useState("");
    const [resultado, setResultado] = useState<ConsultaResponse | null>(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    async function consultar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setResultado(null);

        if (!/^\d+$/.test(numeroSolicitud)) {
            setError("Ingresá un número de solicitud válido.");
            return;
        }

        if (!/^\d{7,15}$/.test(dni)) {
            setError("El DNI debe contener entre 7 y 15 números.");
            return;
        }

        try {
            setCargando(true);
            const respuesta = await api<ConsultaResponse>(
                `/public/preinscripciones/${numeroSolicitud}?dni=${encodeURIComponent(dni)}`
            );
            setResultado(respuesta);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo consultar la preinscripción. Verificá los datos."
            );
        } finally {
            setCargando(false);
        }
    }

    function iconoEstado(estado: string) {
        if (estado === "APROBADA") return <CheckCircle2 size={22} />;
        if (estado === "RECHAZADA") return <XCircle size={22} />;
        return <Clock size={22} />;
    }

    return (
        <main className="consulta-publica">
            <header className="consulta-encabezado">
                <span>UNIVERSIDAD NACIONAL DE JUJUY</span>
                <h1>Consultar preinscripción</h1>
                <p>Ingresá tu número de solicitud y DNI para conocer el estado de tu trámite.</p>
            </header>

            <section className="consulta-tarjeta">
                <Link to="/" className="consulta-volver">
                    <ArrowLeft size={18} /> Volver al portal
                </Link>

                <form onSubmit={consultar} className="consulta-formulario">
                    <label htmlFor="numeroSolicitud">Número de solicitud</label>
                    <input
                        id="numeroSolicitud"
                        type="number"
                        min="1"
                        value={numeroSolicitud}
                        onChange={(e) => setNumeroSolicitud(e.target.value)}
                        placeholder="Ej.: 8"
                        required
                    />

                    <label htmlFor="dniConsulta">DNI</label>
                    <input
                        id="dniConsulta"
                        type="text"
                        inputMode="numeric"
                        value={dni}
                        onChange={(e) => setDni(e.target.value)}
                        placeholder="Ingresá tu DNI"
                        required
                    />

                    {error && <p className="consulta-error">{error}</p>}

                    <button type="submit" disabled={cargando}>
                        <Search size={18} />
                        {cargando ? "Consultando..." : "Consultar estado"}
                    </button>
                </form>

                {resultado && (
                    <section className="consulta-resultado">
                        <h2>Resultado de tu consulta</h2>
                        <p><strong>Número de solicitud:</strong> {resultado.idPreinscripcion}</p>
                        <p><strong>Taller:</strong> {resultado.taller}</p>
                        <p>
                            <strong>Fecha de solicitud:</strong>{" "}
                            {new Date(resultado.fechaSolicitud).toLocaleString("es-AR")}
                        </p>
                        <p className="consulta-estado">
                            {iconoEstado(resultado.estado)}
                            <strong>Estado: {resultado.estado}</strong>
                        </p>
                        {resultado.posicionListaEspera !== null && (
                            <p>
                                <strong>Posición en lista de espera:</strong>{" "}
                                {resultado.posicionListaEspera}
                            </p>
                        )}
                        {resultado.mensaje && <p>{resultado.mensaje}</p>}
                    </section>
                )}
            </section>
        </main>
    );
}

export default ConsultaPreinscripcion;
