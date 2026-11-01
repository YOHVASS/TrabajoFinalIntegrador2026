-- =====================================================================
-- Datos de DEMOSTRACIÓN. Solo se cargan con el perfil "demo"
-- (SPRING_PROFILES_ACTIVE=demo). Sirven para que el frontend tenga datos
-- con los que trabajar. NO usar en producción.
-- Contraseña de todos los usuarios demo: Demo2026!
-- Las fechas son relativas a CURRENT_DATE para que siempre sean coherentes.
-- =====================================================================

INSERT INTO usuario_sistema (id_rol, nombre_usuario, password_hash, nombre, apellido)
SELECT r.id_rol, u.usuario, '$2a$10$go.iUsNytfoRpcTeiHZDiOjncEx0E1nJDyoBU1gkZ0SdJ/1.GkcCW', u.nombre, u.apellido
FROM (VALUES
    ('coordinador',    'COORDINADOR',             'Carla',   'Coordinadora'),
    ('administrativo', 'ADMINISTRATIVO',          'Andrés',  'Administrativo'),
    ('ingreso',        'RESPONSABLE_INGRESO',     'Inés',    'Ingreso'),
    ('profesor1',      'PROFESOR',                'Pablo',   'Rodríguez'),
    ('ayudante1',      'AYUDANTE',                'Ana',     'Sosa'),
    ('autoridad',      'AUTORIDAD_INSTITUCIONAL', 'Alberto', 'Autoridad')
) AS u(usuario, rol, nombre, apellido)
JOIN rol r ON r.nombre = u.rol;

-- Períodos: uno en curso y uno siguiente.
INSERT INTO periodo (codigo, fecha_inicio, fecha_fin) VALUES
    ('ACTUAL',    CURRENT_DATE - 60, CURRENT_DATE + 120),
    ('SIGUIENTE', CURRENT_DATE + 121, CURRENT_DATE + 300);

INSERT INTO disciplina (nombre, descripcion) VALUES
    ('Vóley',    'Vóley de salón'),
    ('Fútbol',   'Fútbol 5 y fútbol 11'),
    ('Básquet',  'Básquet'),
    ('Handball', 'Handball');

INSERT INTO profesor (dni, nombre, apellido, email, telefono, id_usuario)
VALUES ('20111222', 'Pablo', 'Rodríguez', 'prodriguez@unju.edu.ar', '3884000001',
        (SELECT id_usuario FROM usuario_sistema WHERE nombre_usuario = 'profesor1')),
       ('21333444', 'Laura', 'Mamaní', 'lmamani@unju.edu.ar', '3884000002', NULL);

INSERT INTO ayudante (dni, nombre, apellido, id_usuario)
VALUES ('35111222', 'Ana', 'Sosa', (SELECT id_usuario FROM usuario_sistema WHERE nombre_usuario = 'ayudante1'));

INSERT INTO taller (id_disciplina, id_profesor, id_periodo, nombre, modalidad, cupo_maximo)
SELECT d.id_disciplina, p.id_profesor, pe.id_periodo, t.nombre, t.modalidad, t.cupo
FROM (VALUES
    ('Vóley',   '20111222', 'Vóley Femenino',   'FEMENINA',  2),
    ('Fútbol',  '20111222', 'Fútbol Mixto',     'MIXTA',     30),
    ('Básquet', '21333444', 'Básquet Masculino','MASCULINA', NULL)
) AS t(disciplina, dni_prof, nombre, modalidad, cupo)
JOIN disciplina d ON d.nombre = t.disciplina
JOIN profesor p ON p.dni = t.dni_prof
JOIN periodo pe ON pe.codigo = 'ACTUAL';

INSERT INTO horario_taller (id_taller, dia_semana, hora_inicio, hora_fin)
SELECT ta.id_taller, h.dia, h.ini::time, h.fin::time
FROM (VALUES
    ('Vóley Femenino',    'LUNES',     '18:00', '20:00'),
    ('Vóley Femenino',    'MIERCOLES', '18:00', '20:00'),
    ('Fútbol Mixto',      'MARTES',    '19:00', '21:00'),
    ('Básquet Masculino', 'JUEVES',    '17:00', '19:00')
) AS h(taller, dia, ini, fin)
JOIN taller ta ON ta.nombre = h.taller;

INSERT INTO taller_ayudante (id_taller, id_ayudante)
SELECT ta.id_taller, a.id_ayudante FROM taller ta, ayudante a
WHERE ta.nombre = 'Vóley Femenino' AND a.dni = '35111222';

-- Participantes:
--   40000001 María  -> todo vigente (HABILITADO)
--   40000002 Lucía  -> apto médico vencido (NO_HABILITADO)
--   40000003 Sofía  -> sin documentación (PENDIENTE), preinscripción en revisión
--   40000004 Juan   -> preinscripto a Fútbol, pendiente
--   40000005 Carla  -> en lista de espera de Vóley Femenino (cupo 2)
INSERT INTO participante (dni, nombre, apellido, fecha_nacimiento, sexo, facultad, email, telefono, qr_code, estado_habilitacion) VALUES
    ('40000001', 'María', 'Quispe',  '2002-03-10', 'FEMENINO',  'Ingeniería',            'maria@example.com', '3885000001', 'b6a1f0c2-6a55-4d0e-9a4f-000000000001', 'HABILITADO'),
    ('40000002', 'Lucía', 'Flores',  '2001-07-22', 'FEMENINO',  'Ciencias Económicas',   'lucia@example.com', '3885000002', 'b6a1f0c2-6a55-4d0e-9a4f-000000000002', 'NO_HABILITADO'),
    ('40000003', 'Sofía', 'Cruz',    '2003-11-05', 'FEMENINO',  'Humanidades',           'sofia@example.com', NULL,         NULL,                                    'PENDIENTE'),
    ('40000004', 'Juan',  'Vilte',   '2000-01-15', 'MASCULINO', 'Ciencias Agrarias',     'juan@example.com',  NULL,         NULL,                                    'PENDIENTE'),
    ('40000005', 'Carla', 'Tolaba',  '2002-09-30', 'FEMENINO',  'Ingeniería',            'carla@example.com', NULL,         NULL,                                    'PENDIENTE');

INSERT INTO documentacion (id_participante, id_tipo_documento, archivo_url, fecha_presentacion, fecha_vencimiento, estado)
SELECT p.id_participante, td.id_tipo_documento, '/api/archivos/demo-constancia.pdf', CURRENT_DATE - 30, CURRENT_DATE + 150, 'VIGENTE'
FROM participante p, tipo_documento td
WHERE p.dni IN ('40000001', '40000002') AND td.nombre = 'Constancia de alumno';

INSERT INTO seguro (id_participante, id_periodo, numero_poliza, fecha_pago, vigencia_desde, vigencia_hasta, estado, informado_productora)
SELECT p.id_participante, pe.id_periodo, 'POL-' || p.dni, CURRENT_DATE - 30, CURRENT_DATE - 30, CURRENT_DATE + 335, 'VIGENTE', p.dni = '40000001'
FROM participante p, periodo pe
WHERE p.dni IN ('40000001', '40000002') AND pe.codigo = 'ACTUAL';

INSERT INTO apto_medico (id_participante, fecha_emision, fecha_vencimiento, archivo_url, estado)
SELECT id_participante, CURRENT_DATE - 340, CURRENT_DATE + 25, '/api/archivos/demo-apto.pdf', 'VIGENTE'
FROM participante WHERE dni = '40000001';
INSERT INTO apto_medico (id_participante, fecha_emision, fecha_vencimiento, archivo_url, estado)
SELECT id_participante, CURRENT_DATE - 400, CURRENT_DATE - 35, '/api/archivos/demo-apto.pdf', 'VENCIDO'
FROM participante WHERE dni = '40000002';

INSERT INTO preinscripcion (id_participante, id_taller, fecha_solicitud, estado)
SELECT p.id_participante, t.id_taller, now() - (x.dias || ' days')::interval, x.estado
FROM (VALUES
    ('40000001', 'Vóley Femenino', 40, 'APROBADA'),
    ('40000002', 'Vóley Femenino', 39, 'APROBADA'),
    ('40000001', 'Fútbol Mixto',   38, 'APROBADA'),
    ('40000003', 'Fútbol Mixto',    3, 'PENDIENTE'),
    ('40000004', 'Fútbol Mixto',    2, 'PENDIENTE'),
    ('40000005', 'Vóley Femenino',  1, 'LISTA_ESPERA')
) AS x(dni, taller, dias, estado)
JOIN participante p ON p.dni = x.dni
JOIN taller t ON t.nombre = x.taller;

INSERT INTO inscripcion (id_participante, id_taller, id_preinscripcion, fecha_inscripcion, estado)
SELECT pr.id_participante, pr.id_taller, pr.id_preinscripcion, CURRENT_DATE - 35, 'ACTIVA'
FROM preinscripcion pr WHERE pr.estado = 'APROBADA';

INSERT INTO asistencia (id_participante, id_taller, id_usuario_registro, fecha, hora_ingreso, metodo_verificacion, resultado_habilitacion)
SELECT p.id_participante, t.id_taller, u.id_usuario, CURRENT_DATE - x.dias, '18:05', x.metodo, x.resultado
FROM (VALUES
    ('40000001', 'Vóley Femenino', 7, 'QR',  'HABILITADO'),
    ('40000002', 'Vóley Femenino', 7, 'DNI', 'RECHAZADO'),
    ('40000001', 'Vóley Femenino', 2, 'QR',  'HABILITADO'),
    ('40000001', 'Fútbol Mixto',   1, 'DNI', 'HABILITADO')
) AS x(dni, taller, dias, metodo, resultado)
JOIN participante p ON p.dni = x.dni
JOIN taller t ON t.nombre = x.taller
JOIN usuario_sistema u ON u.nombre_usuario = 'ingreso';

INSERT INTO noticia (id_usuario, titulo, contenido, tipo, fecha_publicacion)
SELECT u.id_usuario, n.titulo, n.contenido, n.tipo, now() - (n.dias || ' days')::interval
FROM (VALUES
    ('Abrió la preinscripción online', 'Ya podés preinscribirte a los talleres deportivos desde el portal.', 'NOTICIA', 5),
    ('Recordatorio: apto médico',      'El apto médico tiene vigencia de un año. Revisá su vencimiento.',    'AVISO',   2)
) AS n(titulo, contenido, tipo, dias)
JOIN usuario_sistema u ON u.nombre_usuario = 'administrativo';
