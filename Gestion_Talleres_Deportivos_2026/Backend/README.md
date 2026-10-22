# Backend — Sistema Web de Gestión de Talleres Deportivos (UNJu)

Backend a desarrollar en **Java + Spring Boot**. Expondrá la API REST consumida por el Frontend (React + TypeScript) y se conectará a la base de datos PostgreSQL diseñada en `Database/`.

El código de este módulo todavía no está implementado. La estructura de abajo es la organización prevista.

## Organización por módulos

El código se organizará en un paquete por módulo, siguiendo la tabla de módulos de la documentación de diseño (Etapa 2):

```
src/main/java/unju/talleres/
├── auth/            # Autenticación y Usuarios (login, JWT, roles y permisos)
├── participantes/   # Alta y datos personales de participantes
├── documentacion/   # Carga y control de documentación (TipoDocumento, Documentacion)
├── seguro/          # Registro y vigencia del seguro anual, e informe a la productora
├── aptomedico/      # Registro y vencimiento del apto médico
├── habilitacion/    # Cálculo del estado de habilitación del participante
├── oferta/          # Disciplinas, Talleres, HorarioTaller, Periodo, Profesores, Ayudantes
├── preinscripcion/  # Alta, revisión, aprobación/rechazo y lista de espera
├── ingreso/         # Control de ingreso (QR/DNI) y Asistencia
├── alertas/         # Generación de alertas por documentación pendiente/vencida
├── portal/          # Endpoints públicos (oferta, noticias)
└── reportes/        # Indicadores y reportes de gestión
```

Cada paquete de módulo seguirá internamente la misma subestructura: `controller/`, `service/`, `repository/`, `model/` (o `dto/` cuando corresponda).

## Autenticación

JWT. Los roles previstos son: `ADMINISTRATIVO`, `COORDINADOR`, `ADMIN_SISTEMA`, `RESPONSABLE_INGRESO`, `PROFESOR`, `AYUDANTE`, `AUTORIDAD_INSTITUCIONAL`.

## Despliegue previsto

Backend y base de datos tienen previsto su despliegue en Render. Todavía no hay ningún componente desplegado.
