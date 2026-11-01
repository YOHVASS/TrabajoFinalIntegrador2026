package unju.talleres.common.security;

/**
 * Expresiones de autorización por rol (RF-17, RF-18, RN-11, RN-12).
 * Se usan en {@code @PreAuthorize} para que la matriz de permisos quede en un solo lugar.
 *
 * <ul>
 *   <li>GESTION: datos personales, documentación, seguro, oferta, preinscripciones, noticias.</li>
 *   <li>SALUD: apto médico (dato de salud). Solo quien lo necesita operativamente.</li>
 *   <li>INGRESO: control de ingreso y registro de asistencia.</li>
 *   <li>REPORTES: información agregada. La autoridad institucional solo accede aquí (RN-12).</li>
 *   <li>USUARIOS: administración de usuarios internos y roles.</li>
 * </ul>
 */
public final class Permisos {

    public static final String GESTION = "hasAnyRole('ADMINISTRATIVO','COORDINADOR')";
    public static final String SALUD = "hasAnyRole('ADMINISTRATIVO','COORDINADOR')";
    public static final String INGRESO =
            "hasAnyRole('RESPONSABLE_INGRESO','PROFESOR','AYUDANTE','ADMINISTRATIVO','COORDINADOR')";
    public static final String DOCENTE_O_GESTION =
            "hasAnyRole('PROFESOR','AYUDANTE','ADMINISTRATIVO','COORDINADOR')";
    public static final String REPORTES = "hasAnyRole('ADMINISTRATIVO','COORDINADOR','AUTORIDAD_INSTITUCIONAL')";
    public static final String REPORTES_NOMINALES = "hasAnyRole('ADMINISTRATIVO','COORDINADOR')";
    public static final String USUARIOS = "hasRole('ADMIN_SISTEMA')";
    public static final String USUARIOS_O_GESTION = "hasAnyRole('ADMIN_SISTEMA','ADMINISTRATIVO','COORDINADOR')";

    private Permisos() {
    }
}
