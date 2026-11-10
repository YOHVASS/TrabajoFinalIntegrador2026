import { useEffect, useState, type FormEvent } from "react";
import { api } from "./services/api";
import type { PaginaResponse } from "./types";
import "./Noticias.css";

type TipoNoticia = "NOTICIA" | "NOVEDAD" | "AVISO";

interface Noticia {
    id: number;
    titulo: string;
    contenido: string;
    tipo: TipoNoticia;
    fechaPublicacion: string;
    autor: string;
}

const tipos: TipoNoticia[] = ["NOTICIA", "NOVEDAD", "AVISO"];

const nombreTipo: Record<TipoNoticia, string> = {
    NOTICIA: "Noticia",
    NOVEDAD: "Novedad",
    AVISO: "Aviso",
};

const vacio = {
    titulo: "",
    contenido: "",
    tipo: "NOTICIA" as TipoNoticia,
};

function mensajeError(error: unknown) {
    const texto = error instanceof Error ? error.message : "";
    try {
        const json = JSON.parse(texto) as { mensaje?: string };
        if (json.mensaje) {
            return json.mensaje;
        }
    } catch {
        // La respuesta no vino en JSON.
    }
    return texto || "No se pudo completar la operación.";
}

function formatearFecha(valor: string) {
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) {
        return "—";
    }
    return fecha.toLocaleString("es-AR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function Noticias() {
    const [noticias, setNoticias] = useState<Noticia[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [aviso, setAviso] = useState("");
    const [alta, setAlta] = useState(vacio);
    const [editando, setEditando] = useState<Noticia | null>(null);
    const [guardando, setGuardando] = useState(false);

    async function cargar() {
        setError("");
        try {
            const pagina = await api<PaginaResponse<Noticia>>(
                "/noticias?pagina=0&tamanio=50"
            );
            setNoticias(pagina.contenido);
        } catch (err) {
            setError(mensajeError(err));
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        void cargar();
    }, []);

    async function crear(e: FormEvent) {
        e.preventDefault();
        setError("");
        setAviso("");
        setGuardando(true);
        try {
            await api<Noticia>("/noticias", {
                method: "POST",
                body: JSON.stringify({
                    titulo: alta.titulo.trim(),
                    contenido: alta.contenido.trim(),
                    tipo: alta.tipo,
                    fechaPublicacion: null,
                }),
            });
            setAlta(vacio);
            setAviso("La noticia quedó publicada.");
            await cargar();
        } catch (err) {
            setError(mensajeError(err));
        } finally {
            setGuardando(false);
        }
    }

    async function guardarEdicion(e: FormEvent) {
        e.preventDefault();
        if (!editando) {
            return;
        }
        setError("");
        setAviso("");
        setGuardando(true);
        try {
            await api<Noticia>(`/noticias/${editando.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    titulo: editando.titulo.trim(),
                    contenido: editando.contenido.trim(),
                    tipo: editando.tipo,
                    fechaPublicacion: editando.fechaPublicacion,
                }),
            });
            setEditando(null);
            setAviso("La noticia quedó actualizada.");
            await cargar();
        } catch (err) {
            setError(mensajeError(err));
        } finally {
            setGuardando(false);
        }
    }

    async function eliminar(noticia: Noticia) {
        const ok = window.confirm(
            `¿Eliminar la publicación "${noticia.titulo}"?`
        );
        if (!ok) {
            return;
        }
        setError("");
        setAviso("");
        setGuardando(true);
        try {
            await api<void>(`/noticias/${noticia.id}`, { method: "DELETE" });
            if (editando?.id === noticia.id) {
                setEditando(null);
            }
            setAviso("La noticia quedó eliminada.");
            await cargar();
        } catch (err) {
            setError(mensajeError(err));
        } finally {
            setGuardando(false);
        }
    }

    return (
        <div className="noticias-page">
            <header className="noticias-heading">
                <div>
                    <h1>Noticias</h1>
                    <p>
                        Publicaciones del portal: noticias, novedades y avisos.
                    </p>
                </div>
            </header>

            {error && <p className="noticias-error">{error}</p>}
            {aviso && <p className="noticias-aviso">{aviso}</p>}

            <section className="noticias-card">
                <h2>Nueva publicación</h2>
                <form className="noticias-form" onSubmit={crear}>
                    <label className="noticias-full">
                        Título
                        <input
                            value={alta.titulo}
                            onChange={(e) =>
                                setAlta({ ...alta, titulo: e.target.value })
                            }
                            required
                            maxLength={150}
                        />
                    </label>
                    <label>
                        Tipo
                        <select
                            value={alta.tipo}
                            onChange={(e) =>
                                setAlta({
                                    ...alta,
                                    tipo: e.target.value as TipoNoticia,
                                })
                            }
                        >
                            {tipos.map((tipo) => (
                                <option key={tipo} value={tipo}>
                                    {nombreTipo[tipo]}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="noticias-full">
                        Contenido
                        <textarea
                            value={alta.contenido}
                            onChange={(e) =>
                                setAlta({ ...alta, contenido: e.target.value })
                            }
                            required
                            rows={4}
                        />
                    </label>
                    <button className="noticias-primary" disabled={guardando}>
                        Publicar
                    </button>
                </form>
            </section>

            <section className="noticias-card">
                <h2>Publicaciones</h2>
                {cargando ? (
                    <p>Cargando noticias...</p>
                ) : noticias.length === 0 ? (
                    <p>No hay publicaciones cargadas.</p>
                ) : (
                    <div className="noticias-tabla-wrap">
                        <table className="noticias-tabla">
                            <thead>
                                <tr>
                                    <th>Tipo</th>
                                    <th>Título</th>
                                    <th>Fecha</th>
                                    <th>Autor</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {noticias.map((noticia) => (
                                    <tr key={noticia.id}>
                                        <td>{nombreTipo[noticia.tipo]}</td>
                                        <td>
                                            <strong>{noticia.titulo}</strong>
                                            <small className="noticias-sub">
                                                {noticia.contenido.length > 120
                                                    ? `${noticia.contenido.slice(0, 120)}…`
                                                    : noticia.contenido}
                                            </small>
                                        </td>
                                        <td>
                                            {formatearFecha(
                                                noticia.fechaPublicacion
                                            )}
                                        </td>
                                        <td>{noticia.autor || "—"}</td>
                                        <td className="noticias-acciones">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditando(noticia);
                                                    setAviso("");
                                                    setError("");
                                                }}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    void eliminar(noticia)
                                                }
                                                disabled={guardando}
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {editando && (
                <section className="noticias-card">
                    <h2>Editar publicación</h2>
                    <form className="noticias-form" onSubmit={guardarEdicion}>
                        <label className="noticias-full">
                            Título
                            <input
                                value={editando.titulo}
                                onChange={(e) =>
                                    setEditando({
                                        ...editando,
                                        titulo: e.target.value,
                                    })
                                }
                                required
                                maxLength={150}
                            />
                        </label>
                        <label>
                            Tipo
                            <select
                                value={editando.tipo}
                                onChange={(e) =>
                                    setEditando({
                                        ...editando,
                                        tipo: e.target.value as TipoNoticia,
                                    })
                                }
                            >
                                {tipos.map((tipo) => (
                                    <option key={tipo} value={tipo}>
                                        {nombreTipo[tipo]}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="noticias-full">
                            Contenido
                            <textarea
                                value={editando.contenido}
                                onChange={(e) =>
                                    setEditando({
                                        ...editando,
                                        contenido: e.target.value,
                                    })
                                }
                                required
                                rows={5}
                            />
                        </label>
                        <div className="noticias-acciones">
                            <button
                                className="noticias-primary"
                                disabled={guardando}
                            >
                                Guardar cambios
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditando(null)}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </section>
            )}
        </div>
    );
}

export default Noticias;
