# Sistema Web para la Gestión de los Talleres Deportivos - UNJu

Sistema web desarrollado como Trabajo Final Integrador para la **Tecnicatura Universitaria en Programación (UNJu)**, diseñado para centralizar, automatizar y optimizar la gestión de los talleres deportivos de la Universidad Nacional de Jujuy.

---

## 💡 Descripción de la Problemática
Actualmente, la Coordinación de Talleres Deportivos opera mediante un proceso fragmentado y predominantemente manual (combinando planillas de Excel, Google Drive, documentación física y redes sociales). Esto genera:
* Ineficiencia en la búsqueda y carga de datos de los participantes.
* Dificultades para verificar de forma rápida requisitos excluyentes (seguro anual, apto médico, constancia de alumno).
* Procesos de inscripción totalmente presenciales.
* Ausencia de una herramienta integrada para el control de ingresos mediante asistencia y la generación de indicadores de gestión.

La solución propuesta centraliza toda la lógica de negocio, permitiendo un flujo ordenado desde la preinscripción online y revisión administrativa hasta el control de ingresos mediante códigos QR/DNI y la emisión de reportes estadísticos.

---
## Tutora 
Sofia Raia 
## Integrantes del Grupo 
Grupo 182 
Diana Falla
Natalia Gutierrez 
Yohanna Díaz Monroy 

## 🛠️ Stack Tecnológico

* **Frontend:** React + TypeScript (Landing pública y panel de gestión administrativo).
* **Backend:** Java + Spring Boot (API REST y lógica de negocio).
* **Base de Datos:** PostgreSQL (Modelo relacional para asegurar la integridad transaccional de participantes, talleres, inscripciones y asistencias).
* **Autenticación:** JWT (JSON Web Tokens) para control de accesos basados en roles.

---

## ⚙️ Instrucciones Básicas de Instalación y Ejecución

### Prerrequisitos
Asegúrate de tener instalado en tu entorno de desarrollo:
* **Node.js** (versión recomendada LTS) y gestor de paquetes (`npm` o `pnpm`).
* **Java Development Kit (JDK)** (versión compatible con Spring Boot).
* **PostgreSQL** instalado y configurado localmente o mediante Docker.

---

### 1. Base de Datos
1. Crea una base de datos en PostgreSQL con el nombre correspondiente (ej. `talleres_unju_db`).
2. Configura las credenciales de conexión en el archivo de propiedades del backend (`application.properties` o `application.yml`).

---

### 2. Backend (Spring Boot)
1. Navega hacia la carpeta del backend:
   ```bash
   cd backend
