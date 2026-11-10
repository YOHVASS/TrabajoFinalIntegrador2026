
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
import Usuarios, { CambiarPassword } from "./Usuarios";
import type { PaginaResponse } from "./types";

interface PreinscripcionPendiente {
    estado: string;
}

interface ResumenPanel {
    participantesActivos: number;
    habilitados: number;
    noHabilitados: number;
    conRequisitosPendientes: number;
    preinscripcionesPendientes: number;
    aptosPorVencer: number;
    alertasActivas: number;
}

interface TallerResumen {
    id: number;
}

interface AlertaItem {
    id: number;
    idParticipante: number;
    dni: string;
    participante: string;
    tipo: string;
    mensaje: string;
    fechaGenerada: string;
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

function formatearNumero(valor: number | null | undefined) {
    if (valor == null) {
        return "—";
    }
    return valor.toLocaleString("es-AR");
}

function etiquetaTipoAlerta(tipo: string) {
    switch (tipo) {
        case "DOCUMENTACION_VENCIDA":
            return "Documentación vencida";
        case "DOCUMENTACION_PENDIENTE":
            return "Documentación pendiente";
        case "APTO_MEDICO_POR_VENCER":
            return "Apto médico por vencer";
        case "SEGURO_VENCIDO":
            return "Seguro vencido";
        case "SEGURO_PROXIMO_A_VENCER":
            return "Seguro próximo a vencer";
        default:
            return tipo;
    }
}

function destinoAlerta(tipo: string) {
    if (
        tipo === "APTO_MEDICO_POR_VENCER" ||
        tipo === "SEGURO_VENCIDO" ||
        tipo === "SEGURO_PROXIMO_A_VENCER"
    ) {
        return "Seguros y aptos";
    }
    return "Documentación";
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
    { label: "Usuarios", icon: UserRound },
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
        "Usuarios",
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
    const [alertasAbiertas, setAlertasAbiertas] = useState(false);
    const [alertasActivasCount, setAlertasActivasCount] = useState(0);
    const [alertasLista, setAlertasLista] = useState<AlertaItem[]>([]);
    const [cargandoAlertas, setCargandoAlertas] = useState(false);

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
        setAlertasAbiertas(false);
    }

    function cerrarSesion() {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        setAutenticado(false);
        setPerfilAbierto(false);
        setAlertasAbiertas(false);
    }

    const [resumen, setResumen] = useState<ResumenPanel | null>(null);
    const [talleresActivos, setTalleresActivos] = useState<number | null>(null);
    const [cargandoPanel, setCargandoPanel] = useState(false);

    const puedeVerReportes = permisosMenu[rolUsuario]?.includes("Reportes");
    const puedeVerPreinscripciones =
        permisosMenu[rolUsuario]?.includes("Preinscripciones");
    const puedeVerAlertas =
        rolUsuario === "ADMINISTRATIVO" || rolUsuario === "COORDINADOR";

    useEffect(() => {
        if (!autenticado || !puedeVerAlertas) {
            setAlertasActivasCount(0);
            setAlertasLista([]);
            return;
        }

        let activo = true;

        async function cargarContador() {
            try {
                const data = await api<{ activas: number }>("/alertas/contador");
                if (activo) {
                    setAlertasActivasCount(data.activas ?? 0);
                }
            } catch {
                if (activo) {
                    setAlertasActivasCount(0);
                }
            }
        }

        void cargarContador();
        const intervalo = window.setInterval(() => {
            void cargarContador();
        }, 30000);

        return () => {
            activo = false;
            window.clearInterval(intervalo);
        };
    }, [autenticado, puedeVerAlertas]);

    useEffect(() => {
        if (!alertasAbiertas || !puedeVerAlertas) {
            return;
        }

        let activo = true;

        async function cargarAlertas() {
            setCargandoAlertas(true);
            try {
                const pagina = await api<PaginaResponse<AlertaItem>>(
                    "/alertas?estado=ACTIVA&pagina=0&tamanio=10"
                );
                if (activo) {
                    setAlertasLista(pagina.contenido);
                    setAlertasActivasCount(pagina.totalElementos);
                }
            } catch {
                if (activo) {
                    setAlertasLista([]);
                }
            } finally {
                if (activo) {
                    setCargandoAlertas(false);
                }
            }
        }

        void cargarAlertas();

        return () => {
            activo = false;
        };
    }, [alertasAbiertas, puedeVerAlertas]);

    useEffect(() => {
        if (!autenticado) {
            return;
        }

        let activo = true;

        async function cargarPanel() {
            setCargandoPanel(true);

            try {
                const talleresPromise = api<TallerResumen[]>("/talleres")
                    .then((lista) => lista.length)
                    .catch(() => null);

                const resumenPromise = puedeVerReportes
                    ? api<ResumenPanel>("/reportes/resumen").catch(() => null)
                    : puedeVerPreinscripciones
                      ? api<PaginaResponse<PreinscripcionPendiente>>(
                            "/preinscripciones?pagina=0&tamanio=1000&estado=PENDIENTE"
                        )
                            .then(
                                (respuesta): ResumenPanel => ({
                                    participantesActivos: 0,
                                    habilitados: 0,
                                    noHabilitados: 0,
                                    conRequisitosPendientes: 0,
                                    preinscripcionesPendientes:
                                        respuesta.contenido.length,
                                    aptosPorVencer: 0,
                                    alertasActivas: 0,
                                })
                            )
                            .catch(() => null)
                      : Promise.resolve(null);

                const [cantidadTalleres, datosResumen] = await Promise.all([
                    talleresPromise,
                    resumenPromise,
                ]);

                if (!activo) {
                    return;
                }

                setTalleresActivos(cantidadTalleres);
                setResumen(datosResumen);
            } finally {
                if (activo) {
                    setCargandoPanel(false);
                }
            }
        }

        void cargarPanel();

        const intervalo = window.setInterval(() => {
            void cargarPanel();
        }, 30000);

        return () => {
            activo = false;
            window.clearInterval(intervalo);
        };
    }, [autenticado, puedeVerPreinscripciones, puedeVerReportes]);

    const totalParticipantes = resumen
        ? resumen.habilitados +
          resumen.noHabilitados +
          resumen.conRequisitosPendientes
        : null;
    const porcentajeHabilitados =
        totalParticipantes && totalParticipantes > 0 && resumen
            ? Math.round((resumen.habilitados / totalParticipantes) * 100)
            : null;
    const pendientesHabilitacion = resumen
        ? resumen.noHabilitados + resumen.conRequisitosPendientes
        : null;
    const preinscripcionesPendientes =
        resumen?.preinscripcionesPendientes ?? 0;

    const indicators = [
        {
            title: "Participantes registrados",
            value: cargandoPanel
                ? "..."
                : formatearNumero(
                      puedeVerReportes ? totalParticipantes : null
                  ),
            detail: puedeVerReportes
                ? "Participantes en el sistema"
                : "Visible para roles con acceso a reportes",
            change: puedeVerReportes ? "Datos actuales" : "Según permisos",
            icon: Users,
            color: "blue",
            positive: true,
        },
        {
            title: "Talleres activos",
            value: cargandoPanel ? "..." : formatearNumero(talleresActivos),
            detail: "Talleres cargados en la oferta",
            change: "Oferta deportiva",
            icon: Dumbbell,
            color: "purple",
            positive: true,
        },
        {
            title: "Preinscripciones",
            value: cargandoPanel
                ? "..."
                : formatearNumero(
                      puedeVerReportes || puedeVerPreinscripciones
                          ? preinscripcionesPendientes
                          : null
                  ),
            detail: "Pendientes de revisión",
            change:
                preinscripcionesPendientes > 0
                    ? "Requieren atención"
                    : "Sin pendientes",
            icon: ClipboardList,
            color: "orange",
            positive: preinscripcionesPendientes === 0,
        },
        {
            title: "Participantes habilitados",
            value: cargandoPanel
                ? "..."
                : formatearNumero(
                      puedeVerReportes ? resumen?.habilitados : null
                  ),
            detail: "Con requisitos completos",
            change:
                porcentajeHabilitados != null
                    ? `${porcentajeHabilitados}% del total`
                    : "Según permisos",
            icon: ShieldCheck,
            color: "green",
            positive: true,
        },
    ];

    const alertasVisibles = [
        puedeVerPreinscripciones && preinscripcionesPendientes > 0,
        menuVisible.some((item) => item.label === "Documentación") &&
            (resumen?.conRequisitosPendientes ?? 0) > 0,
        menuVisible.some((item) => item.label === "Seguros y aptos") &&
            (resumen?.aptosPorVencer ?? 0) > 0,
    ].filter(Boolean).length;

    const contadorAlertas =
        puedeVerReportes && resumen
            ? resumen.alertasActivas
            : alertasVisibles;

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
                        <div className="notification-container">
                            <button
                                type="button"
                                className="notification-button"
                                aria-label="Notificaciones"
                                aria-expanded={alertasAbiertas}
                                onClick={() => {
                                    setAlertasAbiertas(!alertasAbiertas);
                                    setPerfilAbierto(false);
                                }}
                            >
                                <Bell size={20} />
                                {puedeVerAlertas && alertasActivasCount > 0 && (
                                    <span className="notification-dot" />
                                )}
                            </button>

                            {alertasAbiertas && (
                                <div className="notification-dropdown">
                                    <div className="notification-dropdown-header">
                                        <strong>Alertas</strong>
                                        <span>
                                            {puedeVerAlertas
                                                ? `${formatearNumero(alertasActivasCount)} activas`
                                                : "Sin acceso"}
                                        </span>
                                    </div>

                                    {!puedeVerAlertas ? (
                                        <p className="notification-empty">
                                            Tu rol no administra alertas de
                                            participantes.
                                        </p>
                                    ) : cargandoAlertas ? (
                                        <p className="notification-empty">
                                            Cargando alertas...
                                        </p>
                                    ) : alertasLista.length === 0 ? (
                                        <p className="notification-empty">
                                            No hay alertas activas.
                                        </p>
                                    ) : (
                                        <ul className="notification-list">
                                            {alertasLista.map((alerta) => (
                                                <li key={alerta.id}>
                                                    <button
                                                        type="button"
                                                        className="notification-item"
                                                        onClick={() =>
                                                            navegarA(
                                                                destinoAlerta(
                                                                    alerta.tipo
                                                                )
                                                            )
                                                        }
                                                    >
                                                        <strong>
                                                            {etiquetaTipoAlerta(
                                                                alerta.tipo
                                                            )}
                                                        </strong>
                                                        <span>
                                                            {alerta.participante}{" "}
                                                            · DNI {alerta.dni}
                                                        </span>
                                                        <small>
                                                            {alerta.mensaje}
                                                        </small>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="user-profile-container">
                            <button
                                type="button"
                                className="user-profile"
                                onClick={() => {
                                    setPerfilAbierto(!perfilAbierto);
                                    setAlertasAbiertas(false);
                                }}
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
                ) : activeMenu === "Usuarios" &&
                rolUsuario === "ADMIN_SISTEMA" ? (
                    <Usuarios />
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
                        <CambiarPassword usuarioId={usuario.id} />
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
                                        <strong>
                                            {cargandoPanel
                                                ? "..."
                                                : porcentajeHabilitados != null
                                                  ? `${porcentajeHabilitados}%`
                                                  : "—"}
                                        </strong>
                                    </div>

                                    <div className="progress-track">
                                        <div
                                            className="progress-fill"
                                            style={{
                                                width: `${porcentajeHabilitados ?? 0}%`,
                                            }}
                                        />
                                    </div>

                                    <div className="progress-legend">
                                        <span>
                                            <i className="legend-dot green-dot" />{" "}
                                            Habilitados:{" "}
                                            {cargandoPanel
                                                ? "..."
                                                : formatearNumero(
                                                      puedeVerReportes
                                                          ? resumen?.habilitados
                                                          : null
                                                  )}
                                        </span>
                                        <span>
                                            <i className="legend-dot orange-dot" />{" "}
                                            Pendientes:{" "}
                                            {cargandoPanel
                                                ? "..."
                                                : formatearNumero(
                                                      puedeVerReportes
                                                          ? pendientesHabilitacion
                                                          : null
                                                  )}
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

                                    <span className="alert-counter">
                                        {cargandoPanel ? "…" : contadorAlertas}
                                    </span>
                                </div>

                                <div className="alert-list">
                                    {puedeVerPreinscripciones && (
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
                                                    {cargandoPanel
                                                        ? "..."
                                                        : formatearNumero(
                                                              preinscripcionesPendientes
                                                          )}{" "}
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
                                                    {cargandoPanel
                                                        ? "..."
                                                        : formatearNumero(
                                                              resumen?.conRequisitosPendientes
                                                          )}{" "}
                                                    participantes
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
                                                    {cargandoPanel
                                                        ? "..."
                                                        : formatearNumero(
                                                              resumen?.aptosPorVencer
                                                          )}{" "}
                                                    participantes
                                                </small>
                                            </div>

                                            <AlertTriangle
                                                size={17}
                                                className="alert-warning"
                                            />
                                        </div>
                                    )}

                                    {!cargandoPanel &&
                                        alertasVisibles === 0 &&
                                        contadorAlertas === 0 && (
                                            <p className="alert-description">
                                                No hay alertas pendientes por
                                                ahora.
                                            </p>
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
