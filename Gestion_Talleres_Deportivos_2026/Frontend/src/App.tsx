
import {
    Activity,
    AlertTriangle,
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    Bell,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    ClipboardList,
    Dumbbell,
    FileCheck2,
    LayoutDashboard,
    LogOut,
    Menu,
    ShieldCheck,
    Users,
    UserRound,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import "./App.css";

import { api } from "./services/api";
import Participantes from "./Participantes";
import Login from "./pages/Login";
import Preinscripciones from "./Preinscripciones";
import OfertaDeportiva from "./OfertaDeportiva";
import Documentacion from "./Documentacion";
import SegurosAptos from "./SegurosAptos";
import ControlIngreso from "./ControlIngreso";
import ParticipantesTaller from "./ParticipantesTaller";
import Reportes from "./Reportes";
import type { PaginaResponse } from "./types";

interface PreinscripcionPendiente {
    estado: string;
}

interface UsuarioSesion {
    id?: number;
    nombreUsuario?: string;
    nombre?: string;
    apellido?: string;
    rol?: string;
    estado?: string;
}

const menuItems = [
    { label: "Panel principal", icon: LayoutDashboard },
    { label: "Participantes", icon: Users },
    { label: "Preinscripciones", icon: ClipboardList },
    { label: "Oferta deportiva", icon: Dumbbell },
    { label: "Documentación", icon: FileCheck2 },
    { label: "Seguros y aptos", icon: ShieldCheck },
    { label: "Control de ingreso", icon: CheckCircle2 },
    { label: "Participantes por taller", icon: Users },
    { label: "Reportes", icon: Activity },
];

const permisosMenu: Record<string, string[]> = {
    ADMINISTRATIVO: [
        "Panel principal",
        "Participantes",
        "Preinscripciones",
        "Oferta deportiva",
        "Documentación",
        "Seguros y aptos",
        "Reportes",
    ],
    COORDINADOR: [
        "Panel principal",
        "Participantes",
        "Preinscripciones",
        "Oferta deportiva",
        "Documentación",
        "Seguros y aptos",
        "Reportes",
    ],
    PROFESOR: [
        "Panel principal",
        "Oferta deportiva",
        "Participantes por taller",
    ],
    AYUDANTE: [
        "Panel principal",
        "Oferta deportiva",
    ],
    RESPONSABLE_INGRESO: [
        "Panel principal",
        "Oferta deportiva",
        "Control de ingreso",
    ],
    AUTORIDAD_INSTITUCIONAL: [
        "Panel principal",
        "Oferta deportiva",
        "Reportes",
    ],
    ADMIN_SISTEMA: [
        "Panel principal",
        "Oferta deportiva",
    ],
};

const nombreRol: Record<string, string> = {
    ADMINISTRATIVO: "Administrativo",
    COORDINADOR: "Coordinador",
    ADMIN_SISTEMA: "Administrador del sistema",
    RESPONSABLE_INGRESO: "Responsable de ingreso",
    PROFESOR: "Profesor",
    AYUDANTE: "Ayudante",
    AUTORIDAD_INSTITUCIONAL: "Autoridad institucional",
};

function App() {
    const [activeMenu, setActiveMenu] = useState("Panel principal");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [perfilAbierto, setPerfilAbierto] = useState(false);

    const [autenticado, setAutenticado] = useState(() =>
        Boolean(localStorage.getItem("token"))
    );

    const [usuario] = useState<UsuarioSesion>(() => {
        try {
            return JSON.parse(localStorage.getItem("usuario") || "{}");
        } catch {
            return {};
        }
    });

    const rolUsuario = usuario.rol || "";

    const menuVisible = menuItems.filter((item) =>
        permisosMenu[rolUsuario]?.includes(item.label)
    );

    const nombreCompleto =
        `${usuario.nombre || usuario.nombreUsuario || "Usuario"} ${usuario.apellido || ""}`.trim();

    const iniciales = (
        `${usuario.nombre?.charAt(0) || usuario.nombreUsuario?.charAt(0) || "U"}${usuario.apellido?.charAt(0) || ""}`
    ).toUpperCase();

    const rolTexto = nombreRol[rolUsuario] || rolUsuario || "Usuario";

    function navegarA(seccion: string) {
        setActiveMenu(seccion);
        setSidebarOpen(false);
        setPerfilAbierto(false);
    }

    function cerrarSesion() {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        setAutenticado(false);
        setPerfilAbierto(false);
    }

    const [preinscripcionesPendientes, setPreinscripcionesPendientes] =
        useState(0);

    useEffect(() => {
        if (
            !autenticado ||
            !permisosMenu[rolUsuario]?.includes("Preinscripciones")
        ) {
            return;
        }

        let activo = true;

        async function cargarPendientes() {
            try {
                const respuesta = await api<
                    PaginaResponse<PreinscripcionPendiente>
                >("/preinscripciones?pagina=0&tamanio=1000&estado=PENDIENTE");

                if (activo) {
                    setPreinscripcionesPendientes(
                        respuesta.contenido.length
                    );
                }
            } catch (error) {
                console.error(
                    "No se pudo actualizar el contador de preinscripciones:",
                    error
                );
            }
        }

        cargarPendientes();

        const intervalo = window.setInterval(cargarPendientes, 30000);

        return () => {
            activo = false;
            window.clearInterval(intervalo);
        };
    }, [autenticado, rolUsuario]);

    const indicators = [
        {
            title: "Participantes registrados",
            value: "1.248",
            detail: "Participantes en el sistema",
            change: "+12,5%",
            icon: Users,
            color: "blue",
            positive: true,
        },
        {
            title: "Talleres activos",
            value: "32",
            detail: "Disciplinas disponibles",
            change: "+4 este período",
            icon: Dumbbell,
            color: "purple",
            positive: true,
        },
        {
            title: "Preinscripciones",
            value: String(preinscripcionesPendientes),
            detail: "Pendientes de revisión",
            change: "Requieren atención",
            icon: ClipboardList,
            color: "orange",
            positive: false,
        },
        {
            title: "Participantes habilitados",
            value: "936",
            detail: "Con requisitos completos",
            change: "75% del total",
            icon: ShieldCheck,
            color: "green",
            positive: true,
        },
    ];

    if (!autenticado) {
        return <Login />;
    }

    return (
        <div className="app-shell">
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
                <div className="brand">
                    <div className="brand-icon">
                        <Dumbbell size={25} />
                    </div>

                    <div className="brand-text">
                        <strong>UNJu Deportes</strong>
                        <span>Gestión deportiva</span>
                    </div>

                    <button
                        className="mobile-close"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Cerrar menú"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="sidebar-section">
                    <span className="section-label">MENÚ PRINCIPAL</span>

                    <nav className="navigation">
                        {menuVisible.map((item) => {
                            const Icon = item.icon;

                            return (
                                <button
                                    key={item.label}
                                    className={`nav-item ${
                                        activeMenu === item.label
                                            ? "nav-active"
                                            : ""
                                    }`}
                                    onClick={() => navegarA(item.label)}
                                >
                                    <Icon size={19} strokeWidth={1.8} />
                                    <span>{item.label}</span>

                                    {item.label === "Preinscripciones" && (
                                        <span className="nav-count">
                                            {preinscripcionesPendientes}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="sidebar-bottom">
                    <div className="help-card">
                        <div className="help-icon">
                            <ShieldCheck size={20} />
                        </div>

                        <strong>Gestión segura</strong>
                        <p>
                            La información de los participantes está protegida.
                        </p>
                    </div>
                </div>

                <div className="sidebar-footer">
                    <span>Universidad Nacional de Jujuy</span>
                    <span>© 2026 · Sistema de gestión</span>
                </div>
            </aside>

            <main className="main-content">
                <header className="topbar">
                    <div className="topbar-left">
                        <button
                            className="menu-toggle"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Abrir menú"
                        >
                            <Menu size={22} />
                        </button>

                        <div className="breadcrumb">
                            <button
                                type="button"
                                className="breadcrumb-home"
                                onClick={() => navegarA("Panel principal")}
                            >
                                UNJu Deportes
                            </button>

                            <span className="breadcrumb-divider">/</span>

                            <button
                                type="button"
                                className="breadcrumb-current"
                                onClick={() => navegarA("Panel principal")}
                                title="Volver al panel principal"
                            >
                                {activeMenu}
                            </button>
                        </div>
                    </div>

                    <div className="topbar-actions">
                        <button
                            className="notification-button"
                            aria-label="Notificaciones"
                        >
                            <Bell size={20} />
                            <span className="notification-dot" />
                        </button>

                        <div className="user-profile-container">
                            <button
                                type="button"
                                className="user-profile"
                                onClick={() =>
                                    setPerfilAbierto(!perfilAbierto)
                                }
                                aria-expanded={perfilAbierto}
                            >
                                <div className="user-avatar">{iniciales}</div>

                                <div className="user-info">
                                    <strong>{nombreCompleto}</strong>
                                    <span>{rolTexto}</span>
                                </div>

                                <ChevronDown
                                    size={16}
                                    className={
                                        perfilAbierto
                                            ? "profile-chevron-open"
                                            : ""
                                    }
                                />
                            </button>

                            {perfilAbierto && (
                                <div className="profile-dropdown">
                                    <button
                                        type="button"
                                        onClick={() => navegarA("Mi perfil")}
                                    >
                                        <UserRound size={16} />
                                        Ver perfil
                                    </button>

                                    <button
                                        type="button"
                                        onClick={cerrarSesion}
                                    >
                                        <LogOut size={16} />
                                        Cerrar sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {activeMenu === "Participantes" ? (
                    <Participantes />
                ) : activeMenu === "Preinscripciones" ? (
                    <Preinscripciones />
                ) : activeMenu === "Oferta deportiva" ? (
                    <OfertaDeportiva />
                ) : activeMenu === "Documentación" ? (
                    <Documentacion />
                ) : activeMenu === "Seguros y aptos" ? (
                    <SegurosAptos />
                ) : activeMenu === "Control de ingreso" &&
                rolUsuario === "RESPONSABLE_INGRESO" ? (
                    <ControlIngreso />
                ) : activeMenu === "Participantes por taller" &&
                rolUsuario === "PROFESOR" ? (
                    <ParticipantesTaller />
                ) : activeMenu === "Reportes" ? (
                    <Reportes />
                ) : activeMenu === "Mi perfil" ? (
                    <div className="page-container">
                        <section className="welcome-section">
                            <div>
                                <h1>Mi perfil</h1>
                                <p>Información de la cuenta del usuario.</p>
                            </div>
                        </section>

                        <article className="panel-card">
                            <div className="profile-dropdown-info">
                                <p>
                                    <strong>Nombre:</strong> {nombreCompleto}
                                </p>
                                <p>
                                    <strong>Usuario:</strong>{" "}
                                    {usuario.nombreUsuario || "No disponible"}
                                </p>
                                <p>
                                    <strong>Rol:</strong> {rolTexto}
                                </p>
                                <p>
                                    <strong>Estado:</strong>{" "}
                                    {usuario.estado || "No disponible"}
                                </p>
                            </div>
                        </article>
                    </div>
                ) : (
                    <div className="page-container">
                        <section className="welcome-section">
                            <div>
                                <div className="welcome-eyebrow">
                                    <span className="status-indicator" />
                                    SISTEMA DE GESTIÓN DEPORTIVA
                                </div>

                                <h1>Panel principal</h1>

                                <p>
                                    Bienvenida al sistema de gestión de talleres
                                    deportivos de la Universidad Nacional de
                                    Jujuy.
                                </p>
                            </div>

                            <button className="period-button">
                                <CalendarDays size={17} />
                                Período actual
                                <ChevronDown size={16} />
                            </button>
                        </section>

                        <section className="indicator-grid">
                            {indicators.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <article
                                        className="indicator-card"
                                        key={item.title}
                                    >
                                        <div className="indicator-top">
                                            <div
                                                className={`indicator-icon ${item.color}`}
                                            >
                                                <Icon size={21} />
                                            </div>

                                            <span
                                                className={`indicator-change ${
                                                    item.positive
                                                        ? "change-positive"
                                                        : "change-neutral"
                                                }`}
                                            >
                                                {item.positive ? (
                                                    <ArrowUpRight size={14} />
                                                ) : (
                                                    <ArrowDownRight size={14} />
                                                )}
                                                {item.change}
                                            </span>
                                        </div>

                                        <div className="indicator-value">
                                            {item.value}
                                        </div>
                                        <h3>{item.title}</h3>
                                        <p>{item.detail}</p>
                                    </article>
                                );
                            })}
                        </section>

                        <section className="content-grid">
                            <article className="panel-card activity-panel">
                                <div className="panel-heading">
                                    <div>
                                        <h2>Resumen de gestión</h2>
                                        <p>
                                            Estado general de los participantes
                                        </p>
                                    </div>

                                    {menuVisible.some(
                                        (item) => item.label === "Reportes"
                                    ) && (
                                        <button
                                            className="text-action"
                                            onClick={() =>
                                                navegarA("Reportes")
                                            }
                                        >
                                            Ver reportes{" "}
                                            <ArrowRight size={16} />
                                        </button>
                                    )}
                                </div>

                                <div className="progress-summary">
                                    <div className="progress-labels">
                                        <span>
                                            Estado de habilitación
                                        </span>
                                        <strong>75%</strong>
                                    </div>

                                    <div className="progress-track">
                                        <div
                                            className="progress-fill"
                                            style={{ width: "75%" }}
                                        />
                                    </div>

                                    <div className="progress-legend">
                                        <span>
                                            <i className="legend-dot green-dot" />{" "}
                                            Habilitados: 936
                                        </span>
                                        <span>
                                            <i className="legend-dot orange-dot" />{" "}
                                            Pendientes: 312
                                        </span>
                                    </div>
                                </div>

                                <div className="activity-divider" />

                                <div className="quick-actions-title">
                                    Accesos rápidos
                                </div>

                                <div className="quick-actions">
                                    {menuVisible.some(
                                        (item) => item.label === "Participantes"
                                    ) && (
                                        <button
                                            className="quick-action"
                                            onClick={() =>
                                                navegarA("Participantes")
                                            }
                                        >
                                            <div className="quick-icon blue">
                                                <UserRound size={20} />
                                            </div>
                                            <span>Ver participantes</span>
                                            <ArrowRight size={16} />
                                        </button>
                                    )}

                                    <button
                                        className="quick-action"
                                        onClick={() =>
                                            navegarA("Oferta deportiva")
                                        }
                                    >
                                        <div className="quick-icon purple">
                                            <Dumbbell size={20} />
                                        </div>
                                        <span>Ver talleres</span>
                                        <ArrowRight size={16} />
                                    </button>

                                    {menuVisible.some(
                                        (item) => item.label === "Documentación"
                                    ) && (
                                        <button
                                            className="quick-action"
                                            onClick={() =>
                                                navegarA("Documentación")
                                            }
                                        >
                                            <div className="quick-icon green">
                                                <FileCheck2 size={20} />
                                            </div>
                                            <span>
                                                Revisar documentación
                                            </span>
                                            <ArrowRight size={16} />
                                        </button>
                                    )}

                                    {rolUsuario === "PROFESOR" && (
                                        <button
                                            className="quick-action"
                                            onClick={() =>
                                                navegarA("Participantes por taller")
                                            }
                                        >
                                            <div className="quick-icon blue">
                                                <Users size={20} />
                                            </div>
                                            <span>
                                                Ver participantes del taller
                                            </span>
                                            <ArrowRight size={16} />
                                        </button>
                                    )}
                                </div>
                            </article>

                            <article className="panel-card alerts-panel">
                                <div className="panel-heading">
                                    <div>
                                        <h2>Alertas y pendientes</h2>
                                        <p>
                                            Requieren atención administrativa
                                        </p>
                                    </div>

                                    <span className="alert-counter">3</span>
                                </div>

                                <div className="alert-list">
                                    {menuVisible.some(
                                        (item) =>
                                            item.label === "Preinscripciones"
                                    ) && (
                                        <div className="alert-item">
                                            <div className="alert-icon alert-orange">
                                                <ClipboardList size={19} />
                                            </div>

                                            <div className="alert-description">
                                                <strong>
                                                    Preinscripciones pendientes
                                                </strong>
                                                <span>
                                                    Hay solicitudes esperando
                                                    revisión.
                                                </span>
                                                <small>
                                                    {preinscripcionesPendientes}{" "}
                                                    solicitudes
                                                </small>
                                            </div>

                                            <AlertTriangle
                                                size={17}
                                                className="alert-warning"
                                            />
                                        </div>
                                    )}

                                    {menuVisible.some(
                                        (item) =>
                                            item.label === "Documentación"
                                    ) && (
                                        <div className="alert-item">
                                            <div className="alert-icon alert-red">
                                                <FileCheck2 size={19} />
                                            </div>

                                            <div className="alert-description">
                                                <strong>
                                                    Documentación incompleta
                                                </strong>
                                                <span>
                                                    Participantes con requisitos
                                                    pendientes.
                                                </span>
                                                <small>
                                                    42 participantes
                                                </small>
                                            </div>

                                            <AlertTriangle
                                                size={17}
                                                className="alert-warning"
                                            />
                                        </div>
                                    )}

                                    {menuVisible.some(
                                        (item) =>
                                            item.label === "Seguros y aptos"
                                    ) && (
                                        <div className="alert-item">
                                            <div className="alert-icon alert-blue">
                                                <ShieldCheck size={19} />
                                            </div>

                                            <div className="alert-description">
                                                <strong>
                                                    Aptos médicos por vencer
                                                </strong>
                                                <span>
                                                    Revisar próximas fechas de
                                                    vencimiento.
                                                </span>
                                                <small>
                                                    12 participantes
                                                </small>
                                            </div>

                                            <AlertTriangle
                                                size={17}
                                                className="alert-warning"
                                            />
                                        </div>
                                    )}
                                </div>

                                {menuVisible.some(
                                    (item) =>
                                        item.label === "Preinscripciones"
                                ) && (
                                    <button
                                        className="all-alerts"
                                        onClick={() =>
                                            navegarA("Preinscripciones")
                                        }
                                    >
                                        Ver preinscripciones{" "}
                                        <ArrowRight size={16} />
                                    </button>
                                )}
                            </article>
                        </section>

                        <footer className="dashboard-footer">
                            <span>
                                Universidad Nacional de Jujuy · Deportes
                            </span>
                            <span>
                                Plataforma de gestión de talleres deportivos
                            </span>
                        </footer>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
