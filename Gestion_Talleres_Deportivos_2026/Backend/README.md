# Backend — Sistema Web de Gestión de Talleres Deportivos (UNJu)

API REST en **Java 17 + Spring Boot 3.5**. La consume el frontend React y se conecta a **PostgreSQL**. El esquema se aplica con **Flyway**. Autenticación con **JWT** y autorización por roles.

## Despliegue

| Recurso | URL |
| --- | --- |
| API en Render | https://unju-deportes-backend.onrender.com |
| Health | https://unju-deportes-backend.onrender.com/api/health |
| Swagger (local) | http://localhost:8080/swagger-ui.html |

En el plan gratuito de Render el servicio puede tardar en despertar (cold start).

## Requisitos locales

- Java 17
- Maven
- Docker Desktop (PostgreSQL 16 vía `docker-compose.yml`)

## Ejecución local

```bash
cd Gestion_Talleres_Deportivos_2026/Backend
docker compose up -d
mvn spring-boot:run "-Dspring-boot.run.profiles=demo"
```

Sin el perfil `demo` solo queda el usuario inicial de migraciones (`admin` / `Admin2026!`). Con `demo` se cargan talleres de ejemplo y usuarios adicionales (`Demo2026!`). Detalle en `API.md`.

## Variables de entorno

Plantilla: `.env.example`. No subir valores reales al repositorio.

| Variable | Uso |
| --- | --- |
| `PORT` | Puerto HTTP (Render lo asigna) |
| `DB_URL`, `DB_USER`, `DB_PASSWORD` | Conexión PostgreSQL |
| `JWT_SECRET` | Secreto de firma del token (mín. 32 caracteres) |
| `FRONTEND_URL` | Orígenes CORS separados por coma (URLs de Vercel y localhost) |
| `SPRING_PROFILES_ACTIVE` | `demo` para datos de ejemplo |
| `UPLOAD_DIR` | Carpeta de archivos subidos |
| `APP_ZONA_HORARIA` | Zona horaria de la aplicación |

## Organización por módulos

```
src/main/java/unju/talleres/
├── auth/            # Login, JWT, usuarios y roles
├── participantes/   # Padrón de participantes
├── documentacion/   # Documentación requerida
├── seguro/          # Seguro anual
├── aptomedico/      # Apto médico
├── habilitacion/    # Cálculo del estado de habilitación
├── oferta/          # Disciplinas, talleres, períodos, docentes
├── preinscripcion/  # Preinscripciones, cupo y lista de espera
├── ingreso/         # Control de ingreso y asistencia
├── alertas/         # Avisos por requisitos pendientes/vencidos
├── portal/          # Endpoints públicos y noticias
└── reportes/        # Indicadores de gestión
```

Cada módulo usa `controller/`, `service/`, `repository/`, `model/` y `dto/` cuando corresponde.

## Roles

`ADMINISTRATIVO`, `COORDINADOR`, `ADMIN_SISTEMA`, `RESPONSABLE_INGRESO`, `PROFESOR`, `AYUDANTE`, `AUTORIDAD_INSTITUCIONAL`.

La matriz de permisos está centralizada en `Permisos.java`. `ADMIN_SISTEMA` administra cuentas; no opera datos de salud ni la gestión operativa de talleres.

## Pruebas

```bash
mvn test
```

Incluye pruebas unitarias de la regla de habilitación (`EvaluadorHabilitacionTest`).

## Documentación de la API

Ver `API.md` para endpoints, roles y usuarios de demostración.
