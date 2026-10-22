# Database — Sistema Web de Gestión de Talleres Deportivos (UNJu)

Motor: **PostgreSQL**. Claves primarias BIGINT autoincrementales en todas las tablas, salvo `TallerAyudante` (clave compuesta). Todos los campos de fecha/hora de auditoría usan `TIMESTAMPTZ` de forma consistente.

## Contenido de esta carpeta

- `der.mmd` — código fuente (Mermaid) del modelo entidad-relación.
- `der.png` — imagen exportada del DER, la misma que figura en la documentación de la Etapa 2.

El diccionario de datos completo está en la sección 6.2 del documento de la 2.ª entrega (`Documentos/2-Diseno-y-Modulos/`). Ese diccionario incluye todas las tablas del modelo, entre ellas Disciplina, TallerAyudante, Rol, Noticia y Periodo.

## Decisiones de diseño relevantes

Estas decisiones también están escritas en la sección 6.5 del documento de la entrega.

- `Participante.estado_habilitacion`, `Seguro.estado`, `AptoMedico.estado` y `Documentacion.estado` son datos derivados (excepción documentada a 3FN): se guardan como columna propia, en vez de calcularse en cada consulta, para que el control de ingreso (RNF-09, verificación en menos de 2 segundos) no dependa de recalcular el estado en tiempo real. Se actualizan mediante trigger o tarea programada diaria, y también de forma inmediata cuando se aprueba o carga un registro relacionado.
- `Participante.qr_code`: token único (UUID) generado al aprobarse la primera inscripción del participante; se codifica como imagen QR en su credencial digital (RN-07). Hasta ese momento el campo queda en NULL.
- `Preinscripcion.id_participante` es NOT NULL porque el Participante se crea en el mismo momento en que se envía la preinscripción online, a partir de los datos personales mínimos del formulario público. Si el DNI ya existe, la preinscripción se asocia al Participante existente.
- `Periodo` reemplaza el texto libre que antes estaba en `Taller.periodo` y `Seguro.periodo`. El seguro queda `UNIQUE (id_participante, id_periodo)`.
- `Inscripcion.id_preinscripcion` es UNIQUE, de modo que una preinscripción origina como máximo una inscripción.
- En `Asistencia`, el índice único sobre `(id_participante, id_taller, fecha)` aplica solo cuando `resultado_habilitacion = 'HABILITADO'`. Un ingreso rechazado y, el mismo día, un ingreso ya habilitado pueden convivir.
