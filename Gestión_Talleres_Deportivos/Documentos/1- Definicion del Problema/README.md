# Sistema Web para la Gestión de los Talleres Deportivos - UNJu

Trabajo Final Integrador de la **Tecnicatura Universitaria en Programación a Distancia**. El proyecto propone un sistema web para centralizar y mejorar la gestión de los talleres deportivos de la Universidad Nacional de Jujuy.

## Descripción de la problemática

Actualmente, la Coordinación de Talleres Deportivos trabaja con un proceso fragmentado y predominantemente manual que combina planillas de Excel, Google Drive, documentación física y redes sociales. Esto genera:

- Demoras en la búsqueda y carga de datos de los participantes.
- Dificultades para verificar requisitos como el seguro anual, el apto médico y la constancia de alumno.
- Inscripciones que requieren gestiones presenciales.
- Falta de una herramienta integrada para controlar el ingreso, registrar asistencias y consultar indicadores de gestión.

La solución propuesta contempla un proceso que va desde la consulta de la oferta y la preinscripción online hasta la revisión administrativa, el control de requisitos, el registro de asistencia y la elaboración de reportes.

## Equipo

**Tutora:** Sofía Raia

**Grupo 182:**

- Diana Falla
- Natalia Gutiérrez
- Yohanna Díaz Monroy

## Estado del proyecto

**Segunda entrega: diseño y documentación previa al desarrollo.**

En esta etapa se definieron los requisitos, las reglas de negocio, los módulos, los diagramas y el diseño de la base de datos. El frontend y el backend todavía no se presentan como funcionalidades implementadas: su desarrollo corresponde a la siguiente etapa del proyecto.

## Tecnologías seleccionadas

| Componente | Tecnología | Despliegue previsto |
| --- | --- | --- |
| Frontend | React + TypeScript | Vercel |
| Backend | Java + Spring Boot (API REST) | Render |
| Base de datos | PostgreSQL | Render PostgreSQL, con Supabase como alternativa |
| Autenticación | JWT y autorización basada en roles | Integrada en el backend |

## Segunda entrega: documentación realizada

Esta entrega reúne las definiciones necesarias antes de comenzar a codificar:

- **Requisitos:** 18 requisitos funcionales y 9 requisitos no funcionales.
- **Reglas de negocio:** 12 reglas que establecen condiciones de inscripción, habilitación, control de ingreso y acceso a la información.
- **Módulos:** responsabilidades definidas para organizar el desarrollo del sistema.
- **Diagramas:** casos de uso, flujo del proceso integrado y modelo entidad-relación.
- **Base de datos:** motor seleccionado, entidades, diccionario de datos, relaciones, cardinalidades y criterios de normalización.
- **Trazabilidad:** relación entre requisitos funcionales, reglas de negocio y entidades del modelo de datos.

### Módulos a desarrollar

| Módulo | Responsabilidad principal |
| --- | --- |
| Autenticación y usuarios | Gestionar el acceso interno, los roles y los permisos. |
| Participantes | Registrar datos personales y fotografía. |
| Documentación | Registrar y controlar la documentación requerida. |
| Seguro | Registrar el pago y la vigencia del seguro anual. |
| Apto médico | Registrar el apto médico y controlar su vencimiento. |
| Oferta deportiva | Administrar disciplinas, talleres, horarios, modalidades, profesores y ayudantes. |
| Preinscripciones e inscripciones | Recibir solicitudes online y permitir su revisión administrativa. |
| Control de ingreso y asistencia | Identificar por QR o DNI, verificar la habilitación y registrar asistencias. |
| Alertas | Avisar sobre requisitos pendientes o vencidos. |
| Portal público y noticias | Mostrar la oferta deportiva, noticias y avisos. |
| Reportes e indicadores | Presentar información agregada para la gestión. |

Estos módulos representan la organización **prevista** para el desarrollo en el repositorio.

### Reglas de negocio principales

- El seguro anual y la constancia de alumno son requisitos para participar según las condiciones definidas en el proyecto.
- El seguro se abona una vez por período y puede cubrir la participación en más de una disciplina mientras esté vigente.
- El apto médico tiene una vigencia de un año.
- Un participante se considera habilitado cuando tiene completa la documentación requerida, el seguro vigente y el apto médico vigente.
- Antes de registrar una asistencia, el sistema debe verificar el estado de habilitación.
- La identificación en el control de ingreso puede realizarse mediante código QR o número de documento.
- El acceso a los datos personales y de salud se restringe según el rol del usuario. Las autoridades institucionales consultan información agregada.

## Diseño de la base de datos

Se seleccionó **PostgreSQL** porque el sistema contiene entidades relacionadas que requieren integridad referencial y transaccional.

El modelo incluye la gestión de:

- Participantes y sus requisitos: documentación, seguros, aptos médicos y alertas.
- Oferta deportiva: disciplinas, talleres, profesores y ayudantes.
- Participación: preinscripciones, inscripciones y asistencias.
- Administración del sistema: roles, usuarios internos y noticias.

El diseño se plantea en tercera forma normal. Como excepción documentada, el estado de habilitación del participante se almacena como dato derivado para agilizar el control de ingreso. Durante la implementación deberá mantenerse actualizado cuando cambie la documentación, el seguro o el apto médico.

## Documentación

El documento de la **segunda entrega** contiene el desarrollo completo de los requisitos, las reglas de negocio, los diagramas, el diseño de la base de datos y la trazabilidad entre estos elementos.

## Próxima etapa

A partir de la tercera etapa se prevé implementar el backend con **Java y Spring Boot**, la base de datos en **PostgreSQL** y el frontend con **React y TypeScript**.

Las instrucciones de instalación, configuración y ejecución se agregarán a este README cuando el repositorio cuente con una versión ejecutable del sistema.
