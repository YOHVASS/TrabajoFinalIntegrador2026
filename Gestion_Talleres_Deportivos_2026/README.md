# Sistema Web para la Gestión de los Talleres Deportivos - UNJu

Trabajo Final Integrador de la **Tecnicatura Universitaria en Programación a Distancia**. Sistema web para centralizar y mejorar la gestión de los talleres deportivos de la Universidad Nacional de Jujuy.

## Descripción del problema

La Coordinación de Talleres Deportivos trabajaba con un proceso fragmentado (Excel, Google Drive, documentación física y redes sociales). Eso generaba demoras, dificultad para verificar seguro, apto médico y constancia de alumno, inscripciones presenciales y falta de control de ingreso, asistencias e indicadores.

El sistema cubre el recorrido desde la consulta pública de la oferta y la preinscripción online hasta la revisión administrativa, el control de requisitos, el registro de asistencia y los reportes.

## Equipo

**Tutora:** Sofía Raia

**Grupo 182:**

- Diana Falla
- Natalia Gutiérrez
- Yohanna Díaz Monroy

## Estado del proyecto

Versión funcional implementada y desplegada online.

Incluye portal público, API REST con JWT y roles, gestión interna (participantes, documentación, seguros y aptos, oferta deportiva, preinscripciones, control de ingreso, reportes y administración de usuarios) y base de datos PostgreSQL con migraciones Flyway.

## Tecnologías

| Componente | Tecnología | Despliegue |
| --- | --- | --- |
| Frontend | React 19 + TypeScript + Vite | [Vercel](https://trabajo-final-integrador2026-4g8q.vercel.app) |
| Backend | Java 17 + Spring Boot 3.5 (API REST) | [Render](https://unju-deportes-backend.onrender.com) |
| Base de datos | PostgreSQL 16 | Render PostgreSQL |
| Autenticación | JWT y autorización por roles | Integrada en el backend |

## Sistema desplegado

| Recurso | URL |
| --- | --- |
| Frontend (producción) | https://trabajo-final-integrador2026-4g8q.vercel.app |
| Frontend (alias) | https://trabajo-final-integrador2026.vercel.app |
| Backend (API) | https://unju-deportes-backend.onrender.com |
| Health check | https://unju-deportes-backend.onrender.com/api/health |
| Acceso interno | `/admin` en el frontend |
| Repositorio | https://github.com/YOHVASS/TrabajoFinalIntegrador2026 |

En el plan gratuito de Render el backend puede tardar en responder la primera vez (cold start).

### Credenciales de demostración

- Administrador del sistema: `admin` / `Admin2026!` (siempre disponible).
- Usuarios de demo (`coordinador`, `administrativo`, `ingreso`, `profesor1`, etc.): contraseña `Demo2026!`, solo si el backend corre con el perfil `demo`.

## Cómo ejecutarlo en local

### Requisitos

- Docker Desktop (PostgreSQL local)
- Java 17 y Maven
- Node.js y npm

### 1. Base de datos

```bash
cd Gestion_Talleres_Deportivos_2026/Backend
docker compose up -d
```

### 2. Backend

```bash
cd Gestion_Talleres_Deportivos_2026/Backend
mvn spring-boot:run "-Dspring-boot.run.profiles=demo"
```

La API queda en `http://localhost:8080`. Documentación OpenAPI: `http://localhost:8080/swagger-ui.html`.

### 3. Frontend

```bash
cd Gestion_Talleres_Deportivos_2026/Frontend
npm install
npm run dev
```

Abrir `http://localhost:5173` (portal) o `http://localhost:5173/admin` (gestión).

### Variables de entorno

Los valores reales no se suben al repositorio. Las plantillas están en:

- `Backend/.env.example`
- `Frontend/.env.example`

En local, el frontend usa por defecto `http://localhost:8080`. En Vercel, `VITE_API_URL` debe apuntar a `https://unju-deportes-backend.onrender.com` (sin `/api` ni barra final). En Render, `FRONTEND_URL` debe listar los orígenes de Vercel separados por coma.

Detalle de endpoints: `Backend/API.md`.

## Módulos implementados

| Módulo | Responsabilidad |
| --- | --- |
| Autenticación y usuarios | Login JWT, roles y administración de cuentas (`ADMIN_SISTEMA`). |
| Participantes | Padrón, datos personales y fotografía. |
| Documentación | Carga y control de documentación requerida. |
| Seguro y apto médico | Vigencia del seguro anual y del apto médico. |
| Habilitación | Estado de habilitación a partir de documentación, seguro y apto. |
| Oferta deportiva | Disciplinas, talleres, horarios, modalidades, períodos, docentes. |
| Preinscripciones e inscripciones | Solicitudes online, lista de espera y revisión administrativa. |
| Control de ingreso | Identificación por QR o DNI y registro de asistencia. |
| Alertas | API de avisos por requisitos pendientes o vencidos. |
| Portal público | Oferta, preinscripción y consulta de estado. |
| Reportes | Indicadores agregados para la gestión. |

## Reglas de negocio principales

- Seguro anual y constancia de alumno según las condiciones del proyecto.
- Seguro por período; puede cubrir más de una disciplina mientras esté vigente.
- Apto médico con vigencia de un año.
- Habilitado = documentación completa + seguro vigente + apto vigente.
- Antes de registrar asistencia se verifica la habilitación.
- Identificación de ingreso por QR o documento.
- Cupo completo → nuevas preinscripciones en lista de espera.
- Acceso a datos personales y de salud restringido por rol. `ADMIN_SISTEMA` administra cuentas; no opera datos de salud ni altas de talleres. Eso corresponde a `ADMINISTRATIVO` / `COORDINADOR`.

## Base de datos

PostgreSQL. El esquema se crea con Flyway (`Backend/src/main/resources/db/migration/`). El perfil `demo` carga datos de ejemplo (`db/demo/`).

Modelo entidad-relación: `Database/der.mmd` y `Database/der.png`. Diccionario de datos en el documento de la 2.ª entrega.

## Documentación

| Recurso | Ubicación |
| --- | --- |
| 1.ª entrega (definición del problema) | `Documentos/1-Definicion-del-Problema/` |
| 2.ª entrega (diseño y módulos) | `Documentos/2-Diseno-y-Modulos/` |
| Modelo de datos | `Database/` |
| Backend | `Backend/README.md`, `Backend/API.md` |
| Frontend | `Frontend/README.md` |
| Informe Final (PDF) | Pendiente de incorporar al repositorio |
| Video de presentación | Pendiente de incorporar; el enlace irá aquí y en el PDF |

## Limitaciones conocidas

- El panel principal toma indicadores desde `/api/reportes/resumen` y `/api/talleres` para los roles con permiso; otros roles ven solo lo que su perfil permite.
- La campana del header muestra alertas activas para roles de gestión (`ADMINISTRATIVO` / `COORDINADOR`).
- La cobertura de pruebas automatizadas es limitada (hay pruebas unitarias de la regla de habilitación).
- En Render (plan gratuito) el backend puede demorar la primera respuesta tras un período de inactividad.
- El módulo de noticias del portal público está disponible en API; la gestión editorial en pantalla interna es acotada.

## Estructura del repositorio

```
Gestion_Talleres_Deportivos_2026/
├── Backend/       # API Java + Spring Boot
├── Frontend/      # React + TypeScript
├── Database/      # DER y documentación del modelo
└── Documentos/    # Entregas académicas 1 y 2
```
