
import { useState, type FormEvent } from "react";
import {
    LockKeyhole,
    UserRound,
    ShieldCheck,
    ArrowRight,
} from "lucide-react";
import { api } from "../services/api";
import "./Login.css";

interface LoginResponse {
    token: string;
    tipo: string;
    expiraEnSegundos: number;
    usuario: {
        id: number;
        nombreUsuario: string;
        nombre: string;
        apellido: string;
        rol: string;
        estado: string;
    };
}

function Login() {
    const [nombreUsuario, setNombreUsuario] = useState("");
    const [password, setPassword] = useState("");
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    async function iniciarSesion(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setCargando(true);

        try {
            const respuesta = await api<LoginResponse>("/auth/login", {
                method: "POST",
                body: JSON.stringify({ nombreUsuario, password }),
            });

            localStorage.setItem("token", respuesta.token);
            localStorage.setItem(
                "usuario",
                JSON.stringify(respuesta.usuario)
            );

            window.location.reload();
        } catch (err) {
            // No mostrar respuestas técnicas del servidor.
            const mensaje = err instanceof Error ? err.message : "";

            if (
                mensaje.includes("401") ||
                mensaje.toLowerCase().includes("unauthorized") ||
                mensaje.toLowerCase().includes("incorrectos") ||
                mensaje.toLowerCase().includes("inactiva")
            ) {
                setError(
                    "Usuario o contraseña incorrectos. Verificá tus datos e intentá nuevamente."
                );
            } else {
                setError(
                    "No se pudo iniciar sesión. Verificá tu conexión e intentá nuevamente."
                );
            }
        } finally {
            setCargando(false);
        }
    }

    return (
        <main className="login-page">
            <div className="login-background-shape login-shape-one" />
            <div className="login-background-shape login-shape-two" />

            <section className="login-card">
                <div className="login-header">
                    <div className="login-logo">
                        <ShieldCheck size={34} strokeWidth={1.8} />
                    </div>

                    <span className="login-eyebrow">
                        UNIVERSIDAD NACIONAL DE JUJUY
                    </span>

                    <h1>UNJu Deportes</h1>

                    <p className="login-description">
                        Sistema de gestión de talleres deportivos
                    </p>
                </div>

                <div className="login-divider" />

                <div className="login-welcome">
                    <h2>Bienvenida/o</h2>
                    <p>Ingresá tus datos para acceder al sistema.</p>
                </div>

                <form onSubmit={iniciarSesion} className="login-form">
                    <div className="login-field">
                        <label htmlFor="usuario">Usuario</label>

                        <div className="login-input">
                            <UserRound size={19} />
                            <input
                                id="usuario"
                                type="text"
                                value={nombreUsuario}
                                onChange={(e) =>
                                    setNombreUsuario(e.target.value)
                                }
                                placeholder="Ingresá tu usuario"
                                autoComplete="username"
                                required
                            />
                        </div>
                    </div>

                    <div className="login-field">
                        <label htmlFor="password">Contraseña</label>

                        <div className="login-input">
                            <LockKeyhole size={19} />
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                placeholder="Ingresá tu contraseña"
                                autoComplete="current-password"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="login-error" role="alert">
                            {error}
                        </div>
                    )}

                    <button
                        className="login-button"
                        type="submit"
                        disabled={cargando}
                    >
                        <span>
                            {cargando ? "Ingresando..." : "Iniciar sesión"}
                        </span>
                        {!cargando && <ArrowRight size={18} />}
                    </button>
                </form>

                <div className="login-security">
                    <ShieldCheck size={16} />
                    <span>Acceso seguro al sistema institucional</span>
                </div>

                <footer className="login-footer">
                    <strong>Universidad Nacional de Jujuy</strong>
                    <span>Gestión Deportiva · 2026</span>
                </footer>
            </section>
        </main>
    );
}

export default Login;
