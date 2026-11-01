
import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock,
    Dumbbell,
    GraduationCap,
    HeartPulse,
    ShieldCheck,
    Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./PortalPublico.css";

function PortalPublico() {
    return (
        <div className="portal-publico">
            <header className="portal-header">
                <Link to="/" className="portal-brand">
                    <div className="portal-brand-icon">
                        <Dumbbell size={25} />
                    </div>
                    <div>
                        <strong>UNJu Deportes</strong>
                        <span>Universidad Nacional de Jujuy</span>
                    </div>
                </Link>

                <nav className="portal-nav">
                    <a href="#inicio">Inicio</a>
                    <a href="#beneficios">Beneficios</a>
                    <a href="#informacion">Información</a>
                </nav>

                <Link to="/admin" className="portal-admin-link">
                    <ShieldCheck size={17} />
                    Acceso administrativo
                </Link>
            </header>

            <main>
                <section className="portal-hero" id="inicio">
                    <div className="portal-hero-content">
                        <span className="portal-eyebrow">
                            <span className="portal-status-dot" />
                            UNIVERSIDAD NACIONAL DE JUJUY
                        </span>

                        <h1>
                            Tu bienestar comienza
                            <span> con el movimiento.</span>
                        </h1>

                        <p>
                            Descubrí los talleres deportivos de la UNJu,
                            encontrá tu actividad favorita y sumate a nuestra
                            comunidad universitaria.
                        </p>

                        <div className="portal-hero-actions">
                            <Link to="/oferta" className="portal-button-primary">
                                Explorar talleres
                                <ArrowRight size={18} />
                            </Link>

                            <Link to="/inscripcion" className="portal-button-secondary">
                                Inscribirme ahora
                            </Link>

                            <Link
                                to="/consulta-preinscripcion"
                                className="portal-button-secondary"
                            >
                                Consultar mi preinscripción
                            </Link>
                        </div>

                        <div className="portal-hero-note">
                            <CheckCircle2 size={17} />
                            Actividades para la comunidad universitaria
                        </div>
                    </div>

                    <div className="portal-hero-visual">
                        <div className="portal-visual-card">
                            <div className="portal-visual-icon">
                                <Dumbbell size={46} />
                            </div>
                            <span>UNJu Deportes</span>
                            <strong>Movete. Compartí. Crecé.</strong>
                            <div className="portal-visual-decoration decoration-one" />
                            <div className="portal-visual-decoration decoration-two" />
                        </div>
                    </div>
                </section>

                <section className="portal-benefits" id="beneficios">
                    <div className="portal-section-heading">
                        <span>UNA UNIVERSIDAD EN MOVIMIENTO</span>
                        <h2>Mucho más que hacer deporte</h2>
                        <p>
                            El deporte nos conecta, nos fortalece y nos ayuda
                            a construir una vida más saludable.
                        </p>
                    </div>

                    <div className="portal-benefit-grid">
                        <article className="portal-benefit-card">
                            <div className="portal-benefit-icon blue">
                                <HeartPulse size={25} />
                            </div>
                            <h3>Vida saludable</h3>
                            <p>
                                Promové tu bienestar físico y mental mediante
                                la actividad deportiva.
                            </p>
                        </article>

                        <article className="portal-benefit-card">
                            <div className="portal-benefit-icon purple">
                                <Users size={25} />
                            </div>
                            <h3>Comunidad</h3>
                            <p>
                                Compartí experiencias, conocé personas y
                                disfrutá del trabajo en equipo.
                            </p>
                        </article>

                        <article className="portal-benefit-card">
                            <div className="portal-benefit-icon green">
                                <GraduationCap size={25} />
                            </div>
                            <h3>Integración universitaria</h3>
                            <p>
                                Participá de las propuestas deportivas
                                de nuestra comunidad universitaria.
                            </p>
                        </article>
                    </div>
                </section>

                <section className="portal-information" id="informacion">
                    <div>
                        <span className="portal-info-eyebrow">SUMATE A UNJu DEPORTES</span>
                        <h2>Encontrá tu próximo desafío.</h2>
                        <p>
                            Consultá la oferta deportiva, conocé los horarios
                            y realizá tu preinscripción de manera online.
                        </p>
                        <Link to="/oferta" className="portal-button-primary">
                            Conocer los talleres
                            <ArrowRight size={18} />
                        </Link>
                    </div>

                    <div className="portal-info-features">
                        <div>
                            <CalendarDays size={22} />
                            <span>Oferta deportiva</span>
                        </div>
                        <div>
                            <Clock size={22} />
                            <span>Horarios y modalidades</span>
                        </div>
                        <div>
                            <CheckCircle2 size={22} />
                            <span>Preinscripción online</span>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="portal-footer">
                <div className="portal-footer-brand">
                    <Dumbbell size={21} />
                    <strong>UNJu Deportes</strong>
                </div>
                <span>Universidad Nacional de Jujuy · Deportes</span>
                <span>© 2026 · Plataforma de gestión de talleres deportivos</span>
            </footer>
        </div>
    );
}

export default PortalPublico;
