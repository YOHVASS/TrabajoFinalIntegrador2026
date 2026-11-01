-- =====================================================================
-- V2: datos base imprescindibles para operar el sistema.
-- =====================================================================

-- Los 7 roles definidos en el diccionario (tabla Rol).
INSERT INTO rol (nombre, descripcion) VALUES
    ('ADMIN_SISTEMA',           'Gestiona usuarios internos, roles y permisos (RF-17).'),
    ('ADMINISTRATIVO',          'Gestiona participantes, documentación, seguro, apto médico, oferta, preinscripciones y noticias.'),
    ('COORDINADOR',             'Coordina la oferta deportiva y consulta información de gestión.'),
    ('RESPONSABLE_INGRESO',     'Identifica participantes por QR o DNI y registra la asistencia.'),
    ('PROFESOR',                'Consulta los participantes y la asistencia de sus talleres.'),
    ('AYUDANTE',                'Colabora en los talleres asignados; consulta participantes y asistencia.'),
    ('AUTORIDAD_INSTITUCIONAL', 'Consulta información agregada y estadística, sin datos personales (RN-12).');

-- Usuario administrador inicial. Usuario: admin / Contraseña: Admin2026!
-- IMPORTANTE: cambiar la contraseña después del primer ingreso (PUT /api/usuarios/{id}/password).
INSERT INTO usuario_sistema (id_rol, nombre_usuario, password_hash, nombre, apellido, estado)
SELECT id_rol, 'admin', '$2a$10$PBn4MCybKcILUE2h3R9TJOQDHoUC1duPOhTvbCewkS6SNn0/t4RBa',
       'Administrador', 'del Sistema', 'ACTIVO'
FROM rol WHERE nombre = 'ADMIN_SISTEMA';

-- Catálogo de documentos (RN-03, RN-05). La constancia de alumno es excluyente.
INSERT INTO tipo_documento (nombre, obligatorio, tiene_vencimiento) VALUES
    ('Constancia de alumno', TRUE,  TRUE),
    ('Copia de DNI',         FALSE, FALSE);
