import { FormEvent, useEffect, useState } from "react";
import { api } from "./services/api";
import "./Usuarios.css";

type Rol =
    | "ADMINISTRATIVO"
    | "COORDINADOR"
    | "ADMIN_SISTEMA"
    | "RESPONSABLE_INGRESO"
    | "PROFESOR"
    | "AYUDANTE"
    | "AUTORIDAD_INSTITUCIONAL";

type Estado = "ACTIVO" | "INACTIVO";

interface Usuario {
    id: number;
    nombreUsuario: string;
    nombre: string;
    apellido: string;
    rol: Rol;
    estado: Estado;
}

const roles: Rol[] = [
    "ADMINISTRATIVO",
    "COORDINADOR",
    "RESPONSABLE_INGRESO",
    "PROFESOR",
    "AYUDANTE",
    "AUTORIDAD_INSTITUCIONAL",
    "ADMIN_SISTEMA",
];

const nombreRol: Record<Rol, string> = {
    ADMINISTRATIVO: "Administrativo",
    COORDINADOR: "Coordinador",
    ADMIN_SISTEMA: "Administrador del sistema",
    RESPONSABLE_INGRESO: "Responsable de ingreso",
    PROFESOR: "Profesor",
    AYUDANTE: "Ayudante",
    AUTORIDAD_INSTITUCIONAL: "Autoridad institucional",
};

const vacio = {
    nombreUsuario: "",
    password: "",
    nombre: "",
    apellido: "",
    rol: "ADMINISTRATIVO" as Rol,
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

function Usuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [aviso, setAviso] = useState("");
    const [alta, setAlta] = useState(vacio);
    const [guardando, setGuardando] = useState(false);
    const [editando, setEditando] = useState<Usuario | null>(null);
    const [passwordNueva, setPasswordNueva] = useState("");
    const [reseteando, setReseteando] = useState<Usuario | null>(null);

    const sesion = (() => {
        try {
            return JSON.parse(localStorage.getItem("usuario") || "{}") as {
                id?: number;
            };
        } catch {
            return {};
        }
    })();

    async function cargar() {
        setError("");
        try {
            const datos = await api<Usuario[]>("/usuarios");
            setUsuarios(datos);
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
            await api<Usuario>("/usuarios", {
                method: "POST",
                body: JSON.stringify(alta),
            });
            setAlta(vacio);
            setAviso("La cuenta quedó creada.");
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
            await api<Usuario>(`/usuarios/${editando.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    nombre: editando.nombre,
                    apellido: editando.apellido,
                    rol: editando.rol,
                    estado: editando.estado,
                }),
            });
            setEditando(null);
            setAviso("La cuenta quedó actualizada.");
            await cargar();
        } catch (err) {
            setError(mensajeError(err));
        } finally {
            setGuardando(false);
        }
    }

    async function resetear(e: FormEvent) {
        e.preventDefault();
        if (!reseteando) {
            return;
        }
        setError("");
        setAviso("");
        setGuardando(true);
        try {
            await api<void>(`/usuarios/${reseteando.id}/password`, {
                method: "PUT",
                body: JSON.stringify({ passwordNueva }),
            });
            setReseteando(null);
            setPasswordNueva("");
            setAviso("La contraseña quedó actualizada.");
        } catch (err) {
            setError(mensajeError(err));
        } finally {
            setGuardando(false);
        }
    }

    return (
        <div className="usuarios-page">
            <header className="usuarios-heading">
                <div>
                    <h1>Usuarios</h1>
                    <p>Cuentas internas del sistema y el rol de cada una.</p>
                </div>
            </header>

            {error && <p className="usuarios-error">{error}</p>}
            {aviso && <p className="usuarios-aviso">{aviso}</p>}

            <section className="usuarios-card">
                <h2>Nueva cuenta</h2>
                <form className="usuarios-form" onSubmit={crear}>
                    <label>
                        Usuario
                        <input
                            value={alta.nombreUsuario}
                            onChange={(e) =>
                                setAlta({ ...alta, nombreUsuario: e.target.value })
                            }
                            required
                            maxLength={50}
                        />
                    </label>
                    <label>
                        Contraseña inicial
                        <input
                            type="password"
                            value={alta.password}
                            onChange={(e) =>
                                setAlta({ ...alta, password: e.target.value })
                            }
                            required
                            minLength={8}
                            maxLength={100}
                        />
                    </label>
                    <label>
                        Nombre
                        <input
                            value={alta.nombre}
                            onChange={(e) =>
                                setAlta({ ...alta, nombre: e.target.value })
                            }
                            required
                            maxLength={100}
                        />
                    </label>
                    <label>
                        Apellido
                        <input
                            value={alta.apellido}
                            onChange={(e) =>
                                setAlta({ ...alta, apellido: e.target.value })
                            }
                            required
                            maxLength={100}
                        />
                    </label>
                    <label>
                        Rol
                        <select
                            value={alta.rol}
                            onChange={(e) =>
                                setAlta({ ...alta, rol: e.target.value as Rol })
                            }
                        >
                            {roles.map((rol) => (
                                <option key={rol} value={rol}>
                                    {nombreRol[rol]}
                                </option>
                            ))}
                        </select>
                    </label>
                    <button className="usuarios-primary" disabled={guardando}>
                        Crear cuenta
                    </button>
                </form>
            </section>

            <section className="usuarios-card">
                <h2>Cuentas</h2>
                {cargando ? (
                    <p>Cargando cuentas...</p>
                ) : (
                    <div className="usuarios-tabla-wrap">
                        <table className="usuarios-tabla">
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Nombre</th>
                                    <th>Rol</th>
                                    <th>Estado</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map((cuenta) => (
                                    <tr key={cuenta.id}>
                                        <td>{cuenta.nombreUsuario}</td>
                                        <td>
                                            {cuenta.nombre} {cuenta.apellido}
                                        </td>
                                        <td>{nombreRol[cuenta.rol]}</td>
                                        <td>
                                            {cuenta.estado === "ACTIVO"
                                                ? "Activo"
                                                : "Inactivo"}
                                        </td>
                                        <td className="usuarios-acciones">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditando(cuenta);
                                                    setReseteando(null);
                                                }}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setReseteando(cuenta);
                                                    setPasswordNueva("");
                                                    setEditando(null);
                                                }}
                                                disabled={cuenta.id === sesion.id}
                                            >
                                                Contraseña
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
                <section className="usuarios-card">
                    <h2>Editar {editando.nombreUsuario}</h2>
                    <form className="usuarios-form" onSubmit={guardarEdicion}>
                        <label>
                            Nombre
                            <input
                                value={editando.nombre}
                                onChange={(e) =>
                                    setEditando({
                                        ...editando,
                                        nombre: e.target.value,
                                    })
                                }
                                required
                                maxLength={100}
                            />
                        </label>
                        <label>
                            Apellido
                            <input
                                value={editando.apellido}
                                onChange={(e) =>
                                    setEditando({
                                        ...editando,
                                        apellido: e.target.value,
                                    })
                                }
                                required
                                maxLength={100}
                            />
                        </label>
                        <label>
                            Rol
                            <select
                                value={editando.rol}
                                onChange={(e) =>
                                    setEditando({
                                        ...editando,
                                        rol: e.target.value as Rol,
                                    })
                                }
                                disabled={editando.id === sesion.id}
                            >
                                {roles.map((rol) => (
                                    <option key={rol} value={rol}>
                                        {nombreRol[rol]}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Estado
                            <select
                                value={editando.estado}
                                onChange={(e) =>
                                    setEditando({
                                        ...editando,
                                        estado: e.target.value as Estado,
                                    })
                                }
                                disabled={editando.id === sesion.id}
                            >
                                <option value="ACTIVO">Activo</option>
                                <option value="INACTIVO">Inactivo</option>
                            </select>
                        </label>
                        <div className="usuarios-acciones">
                            <button className="usuarios-primary" disabled={guardando}>
                                Guardar
                            </button>
                            <button type="button" onClick={() => setEditando(null)}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {reseteando && (
                <section className="usuarios-card">
                    <h2>Nueva contraseña para {reseteando.nombreUsuario}</h2>
                    <form className="usuarios-form" onSubmit={resetear}>
                        <label>
                            Contraseña nueva
                            <input
                                type="password"
                                value={passwordNueva}
                                onChange={(e) => setPasswordNueva(e.target.value)}
                                required
                                minLength={8}
                                maxLength={100}
                            />
                        </label>
                        <div className="usuarios-acciones">
                            <button className="usuarios-primary" disabled={guardando}>
                                Actualizar contraseña
                            </button>
                            <button type="button" onClick={() => setReseteando(null)}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </section>
            )}
        </div>
    );
}

export function CambiarPassword({ usuarioId }: { usuarioId?: number }) {
    const [actual, setActual] = useState("");
    const [nueva, setNueva] = useState("");
    const [error, setError] = useState("");
    const [aviso, setAviso] = useState("");
    const [guardando, setGuardando] = useState(false);

    async function enviar(e: FormEvent) {
        e.preventDefault();
        if (!usuarioId) {
            setError("No se pudo identificar la cuenta.");
            return;
        }
        setError("");
        setAviso("");
        setGuardando(true);
        try {
            await api<void>(`/usuarios/${usuarioId}/password`, {
                method: "PUT",
                body: JSON.stringify({
                    passwordActual: actual,
                    passwordNueva: nueva,
                }),
            });
            setActual("");
            setNueva("");
            setAviso("La contraseña quedó actualizada.");
        } catch (err) {
            setError(mensajeError(err));
        } finally {
            setGuardando(false);
        }
    }

    return (
        <section className="usuarios-card usuarios-card-perfil">
            <h2>Cambiar contraseña</h2>
            {error && <p className="usuarios-error">{error}</p>}
            {aviso && <p className="usuarios-aviso">{aviso}</p>}
            <form className="usuarios-form" onSubmit={enviar}>
                <label>
                    Contraseña actual
                    <input
                        type="password"
                        value={actual}
                        onChange={(e) => setActual(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Contraseña nueva
                    <input
                        type="password"
                        value={nueva}
                        onChange={(e) => setNueva(e.target.value)}
                        required
                        minLength={8}
                        maxLength={100}
                    />
                </label>
                <button className="usuarios-primary" disabled={guardando}>
                    Guardar contraseña
                </button>
            </form>
        </section>
    );
}

export default Usuarios;
