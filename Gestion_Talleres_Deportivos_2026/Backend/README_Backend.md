# Backend — Sistema Web de Gestión de Talleres Deportivos (UNJu)

Backend desarrollado en **Java + Spring Boot**, expone la API REST consumida por el Frontend
(React + TypeScript) y se conecta a la base de datos PostgreSQL diseñada en `Database/`.

## Organización por módulos

El código se organiza en un paquete por módulo, siguiendo la tabla de módulos de la
documentación de diseño (Etapa 2):

```
src/main/java/unju/talleres/
├── auth/            # Autenticación y Usuarios (login, JWT, roles y permisos)
├── participantes/   # Alta y datos personales de participantes
├── documentacion/   # Carga y control de documentación (TipoDocumento, Documentacion)
├── seguro/          # Registro y vigencia del seguro anual
├── aptomedico/      # Registro y vencimiento del apto médico
├── habilitacion/    # Cálculo del estado de habilitación del participante
├── oferta/          # Disciplinas, Talleres, HorarioTaller, Profesores, Ayudantes
├── preinscripcion/  # Alta, revisión, aprobación/rechazo de preinscripciones
├── ingreso/         # Control de ingreso (QR/DNI) y Asistencia
├── alertas/         # Generación de alertas por documentación pendiente/vencida
├── portal/          # Endpoints públicos (oferta, noticias)
└── reportes/        # Indicadores y reportes de gestión
```

Cada paquete de módulo sigue internamente la misma sub-estructura: `controller/`, `service/`,
`repository/`, `model/` (o `dto/` cuando corresponda).

## Autenticación

JWT. Los roles disponibles son: `ADMINISTRATIVO`, `COORDINADOR`, `ADMIN_SISTEMA`,
`RESPONSABLE_INGRESO`, `PROFESOR`, `AYUDANTE`, `AUTORIDAD_INSTITUCIONAL`.

## Despliegue

Backend y base de datos desplegados en Render.
