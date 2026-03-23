# Psicoraiden

## Video

<video width="100%" controls>
  <source src="Video/Video.mp4" type="video/mp4">
  Tu navegador no soporta el elemento de video.
</video>

## Tabla de Contenidos

1. [Instalación](#instalación)
2. [Deployment](#deploy)
3. [Documentación Técnica](#documentación-técnica)
4. [Documentación Funcional](#documentación-funcional)
   - [Propósito del Sistema](#propósito-del-sistema)
   - [Problemática que Resuelve](#problemática-que-resuelve)
   - [Usuarios Involucrados](#usuarios-involucrados)
   - [Funcionalidades Contempladas](#funcionalidades-contempladas)
   - [Límites del Proyecto](#límites-del-proyecto)
   - [Alcance de la Solución Entregada](#alcance-de-la-solución-entregada)
   - [Entidades Principales](#entidades-principales)
   - [Estados y Transiciones](#estados-y-transiciones)
   - [Sistema de Notificaciones](#sistema-de-notificaciones)
5. [Diseño de Arquitectura](#diseño-de-arquitectura)
   - [Componentes Principales del Sistema](#componentes-principales-del-sistema)
   - [Relación entre Frontend, Backend y Base de Datos](#relación-entre-frontend-backend-y-base-de-datos)
   - [Flujo General de Interacción](#flujo-general-de-interacción)
   - [Tecnologías Utilizadas](#tecnologías-utilizadas)
6. [Análisis del Problema](#análisis-del-problema)
   - [Descripción del Problema](#descripción-del-problema)
   - [Usuario / Cliente](#usuario--cliente)
   - [Dolor o Necesidad](#dolor-o-necesidad)
   - [Alcance del Sistema](#alcance-del-sistema)
7. [Requerimientos Funcionales](#requerimientos-funcionales)

---

## Deployment

Link: https://psicoraiden.onrender.com

## Instalación

### Requisitos Previos

- **Node.js** versión 14 o superior
- **npm** 
- Una cuenta en **Supabase**

### Pasos de Instalación

#### 1. Acceder al Directorio

```bash
cd Code
```

#### 2. Instalar Dependencias

```bash
npm install
```

#### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `Code/` con las variables de entorno.

```
SUPABASE_URL
SUPABASE_ANON_KEY
DATABASE_URL
SUPABASE_SERVICE_ROLE_KEY
PORT=3000
```

#### 4. Iniciar el Servidor

```bash
npm start
```

El servidor estara en `http://localhost:3000`

---

## Documentación Técnica

### Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | HTML5, CSS3, JavaScript ES6+ |
| **Backend** | Node.js, Express |
| **Base de Datos** | PostgreSQL (Supabase) |
| **Autenticación** | Supabase Auth |

### Arquitectura de Carpetas

```
Code/
├── html/
│   ├── index.html
│   ├── paciente/
│   │   ├── base.html
│   │   ├── calendario.html
│   │   ├── citas.html
│   │   └── perfil.html
│   └── psicologo/
│       ├── base.html
│       ├── historial.html
│       ├── horarios.html
│       ├── panel.html
│       └── perfil.html
├── css/
│   ├── index.css
│   ├── entrada.css
│   ├── compartido/
│   │   ├── botones.css
│   │   ├── comun.css
│   │   ├── encabezado.css
│   │   ├── formularios.css
│   │   ├── listas.css
│   │   ├── mensajes.css
│   │   ├── modal.css
│   │   ├── notificaciones.css
│   │   └── responsive.css
│   ├── paciente/
│   │   ├── calendario.css
│   │   ├── estilos.css
│   │   ├── horarios.css
│   │   ├── perfil.css
│   │   └── tarjeta-cita.css
│   └── psicologo/
│       ├── bloques.css
│       ├── calendario.css
│       ├── configuracion.css
│       ├── estilos.css
│       ├── historial.css
│       ├── panel-citas.css
│       ├── perfil.css
│       ├── periodo.css
│       └── resumen.css
├── js/
│   ├── auth/
│   │   ├── ControladorEventosAuth.js
│   │   ├── GestorFormularios.js
│   │   ├── GestorMensajesAuth.js
│   │   ├── ServicioAutenticacion.js
│   │   ├── ServicioSesion.js
│   │   └── inicio.js
│   ├── config/
│   │   ├── ClienteSupabase.js
│   │   └── Configuracion.js
│   ├── core/
│   │   ├── (Componentes base, gestores UI, utilidades, etc.)
│   ├── paciente/
│   │   ├── AplicacionPaciente.js
│   │   ├── ControladorEventosPaciente.js
│   │   ├── estado/
│   │   │   └── EstadoPaciente.js
│   │   ├── gestor/
│   │   │   ├── GestorReservas.js
│   │   │   ├── GestorCancelacion.js
│   │   │   ├── GestorReprogramacion.js
│   │   │   ├── GestorMisCitas.js
│   │   │   ├── GestorProximaCita.js
│   │   │   ├── GestorListaEspera.js
│   │   │   ├── GestorNotificaciones.js
│   │   │   └── GestorPerfil.js
│   │   ├── renderizador/
│   │   │   ├── RenderizadorCalendario.js
│   │   │   └── RenderizadorHorarios.js
│   │   └── repositorio/
│   │       ├── RepositorioBloques.js
│   │       ├── RepositorioCitas.js
│   │       ├── RepositorioListaEspera.js
│   │       └── RepositorioNotificaciones.js
│   └── psicologo/
│       ├── AplicacionPsicologo.js
│       ├── ControladorEventosPsicologo.js
│       ├── estado/
│       │   └── EstadoPsicologo.js
│       ├── gestor/
│       │   ├── GestorHorarios.js
│       │   ├── GestorConfiguracionUI.js
│       │   ├── GestorDetalleCita.js
│       │   ├── GestorHistorial.js
│       │   ├── GestorPerfil.js
│       │   └── GestorRestriccion.js
│       ├── renderizador/
│       │   ├── RenderizadorCitas.js
│       │   └── RenderizadorCalendarioPsicologo.js
│       └── repositorio/
│           ├── RepositorioConfiguracion.js
│           ├── RepositorioCitasPsicologo.js
│           └── RepositorioPacientes.js
├── server/
│   ├── Servidor.js
│   ├── ClienteSupabaseAdmin.js
│   ├── Configuracion.js
│   ├── ControladorBase.js
│   ├── ControladorRecordatorios.js
│   ├── ControladorNotificaciones.js
│   ├── ControladorListaEspera.js
│   └── ControladorRegistro.js
└── index.js
```

---

## Documentación Funcional

### Propósito del Sistema

Psicoraiden es una web de gestión de citas para consultorios psicológicos que facilita el control de disponibilidad horaria, reduce conflictos en la reserva de turnos, genera recordatorios automáticos y mantiene un registro del estado de las citas.

---

### Problemática que Resuelve

Actualmente, la gestión de citas en consultorios psicológicos se realiza mediante agendas manuales o aplicaciones de mensajería, que provoca:

- **Cruces de horarios:** Dos pacientes pueden agendar el mismo horario.
- **Falta de automatización en los recordatorios:** Los recordatorios se hacen de forma manual, causando que los pacientes se ausenten.
- **Desorganización:** Las citas no tienen un registro centralizado.
- **Sobrecarga del psicólogo:** El psicologo pierde tiempo coordinando horarios por chat en lugar de atender pacientes.

---

### Usuarios Involucrados

#### Psicólogos
Profesionales de salud mental que utilizan la plataforma para:
- Configurar su horario de atención semanal (días y horarios)
- Ver todas las citas agendadas con sus pacientes
- Cancelar citas y bloquear a pacientes con bajo asistencia
- Consultar el historial de citas de cada paciente

#### Pacientes
Personas que buscan atención psicológica y utilizan la plataforma para:
- Visualizar el calendario de disponibilidad
- Reservar horarios disponibles
- Cancelar o reprogramar citas propias
- Entrar en lista de espera si no hay disponibilidad
- Recibir recordatorios y notificaciones de sus citas

---

### Funcionalidades

1. **Configuración de Horarios (Psicólogo)**
   - Definir días laborables y bloques horarios semanales
   - Establecer duración de cada sesión
   - Generar bloques de horarios para próximas semanas

2. **Visualización del calendario (Paciente)**
   - Calendario interactivo con horarios libres
   - Indicador visual si el paciente ya hizo una reserva para ese dia

3. **Agendamiento de Citas**
   - Reserva de horarios disponibles por el paciente
   - Prevención de reservas duplicadas
   - Confirmación inmediata de la cita

4. **Gestión de Citas**
   - Cancelación de citas (paciente y psicólogo)
   - Reprogramación de citas con límite de 24 horas (paciente)
   - Vista de próxima cita en el panel del paciente

5. **Sistema de Notificaciones**
   - Confirmación de reserva instantánea
   - Recordatorios 24 horas antes de la cita (paciente)
   - Notificaciones de cancelación
   - Alertas de nuevos turnos agendados (psicologo)

6. **Historial y Reportes**
   - Registro de citas pasadas por paciente
   - Descarga de historial en PDF

7. **Lista de Espera**
   - Registro de pacientes interesados en días llenos
   - Notificación automática al liberarse un turno

8. **Restricción de Pacientes**
   - Bloqueo de pacientes por parte del psicologo

---

### Límites del Proyecto

**El sistema NO incluye:**

- **Diagnóstico o evaluación clínica:** Psicoraiden no realiza diagnósticos.
- **Integración con metodos de pago:** No se procesa pagos ni genera facturas automáticas.

---

### Alcance de la Solución Entregada

**La solución entregada incluye:**

- Una plataforma web funcional de gestión de citas
- Dos interfaces: una para pacientes y otra para psicólogos
- Base de datos PostgreSQL en Supabase
- Sistema automático de generación de bloques horarios
- Prevención de doble cita en el mismo bloque mediante bloqueo en tiempo real
- Recordatorios automáticos 24 horas antes de citas
- Historial de citas con opción de descarga PDF
- Lista de espera con notificaciones 
- Permite bloquear pacientes y cancelar citas.

#### Citas
Incluyen:
- Paciente y psicólogo involucrados
- Bloque horario asignado
- Estado: confirmada, cancelada o completada

#### Notificaciones
Tipos:
- **Confirmación de Reserva**: Se genera al paciente al agendar
- **Recordatorio**: 24 horas antes de la cita (si fue agendada con tiempo)
- **Cancelación**: Cuando psicólogo o paciente cancela
- **Nuevo Turno**: Al psicólogo cuando un paciente agenda
- **Lista de Espera**: A pacientes en espera cuando se libera un turno

---

## Diseño de Arquitectura

### Componentes Principales del Sistema

#### 1. **Frontend**
- **Paciente:** Incluye calendario, historial de citas, vista de próxima cita, reserva y reprogramación de turnos
- **Psicólogo:** Incluye una vista de las citas del día, configuración de horarios y historial de pacientes. 
- **Componentes Compartidos:** Autenticación y notificaciones.

#### 2. **Capa Backend**
- **Servidor Node.js/Express:** Sirve archivos estáticos (HTML/CSS/JS) y expone APIs específicas
- **APIs del Backend:**
  - `POST /api/registrar` - Registro de nuevos usuarios en Supabase Auth
  - `POST /api/recordatorios` - Generación de recordatorios automáticos (se ejecuta cada 60 minutos)
  - `POST /api/notificaciones` - Procesamiento de notificaciones (se ejecuta cada 5 minutos)
  - `POST /api/lista-espera` - Notificación de pacientes en lista de espera (se ejecuta cada 5 minutos)
- **Nota:** La mayoría de las operaciones CRUD (crear, leer, actualizar, eliminar) se realizan directamente desde el Frontend hacia Supabase, no a través de este Backend

#### 3. **Capa de Persistencia**
- **Base de Datos PostgreSQL (Supabase):** Almacena usuarios, citas, bloques horarios, notificaciones, lista de espera
- **Autenticación Supabase Auth:** Gestión segura de sesiones y credenciales

#### 4. **Servicio de Notificaciones**
- Generación de notificaciones en base de datos
- Recordatorios automáticos

---

### Relación entre Frontend, Backend y Base de Datos

**Diagrama**

```
                    PACIENTE/PSICÓLOGO
                            ↓
                  Frontend (HTML/CSS/JS)  ←→  Backend (Node.js/Express)
                            ↓ (API REST)            ↓ (Tareas)
                            ↓                        ↓
                   Supabase (REST API)  ←→  Supabase (Admin API)
                            ↓
                 Base de Datos PostgreSQL (Supabase)
```

**Comunicación:**
- **Frontend y Supabase (directo):** El Cliente conecta directamente a Supabase para operaciones de:
  - Agendar, cancelar, reprogramar citas
  - Obtener bloques horarios
  - Gestionar configuración
  - Obtener notificaciones
  - Lista de espera
  - Autenticación

- **Frontend y Backend (HTTP):** Solo para registro de nuevos usuarios (POST /api/registrar)

- **Backend** Procesa:
  - Generación de recordatorios
  - Procesamiento de notificaciones
  - Notificación de lista de espera

---

### Flujos Principales

#### Configuración de Horario (Psicólogo)
1. Psicólogo accede a "Configuración de Horarios"
2. Selecciona los días de la semana en que atiende
3. Define hora de inicio y fin para cada día
4. Define duración de cada bloque (ej: 60 minutos)
5. Sistema genera automáticamente los bloques para las próximas semanas
6. Los bloques aparecen en el calendario para pacientes

#### Agendar Cita (Paciente)
1. Paciente accede al calendario de disponibilidad
2. Selecciona un día 
3. Visualiza horarios libres para ese día
4. Selecciona un horario
5. Confirma la reserva
6. Sistema crea la cita y genera notificación de confirmación
7. Psicólogo recibe notificación de "Nuevo turno agendado"

#### Cancelación de Cita
**Paciente:**
1. Paciente entra a "Mis Citas"
2. Selecciona una cita confirmada
3. Hace clic en "Cancelar"
4. Confirma la acción
5. Cita cambia a estado "Cancelada"

**Psicólogo:**
1. Psicólogo entra a "Panel de Citas"
2. Selecciona una cita de su lista
3. Hace clic en "Cancelar Turno"
4. Paciente recibe notificación de cancelación del sistema

#### Reprogramación de Cita (Paciente)
1. Paciente selecciona una cita para modificar
2. Sistema bloquea reprogramación si faltan menos de 24 horas
3. Selecciona nueva fecha y horario disponible
4. Confirma cambio
5. Bloque antiguo vuelve a disponible
6. Nueva cita se crea y se genera notificación de confirmación

#### Lista de Espera
1. Paciente selecciona día sin disponibilidad
2. Sistema le ofrece opción "Avisarme si se libera"
3. Paciente entra a lista de espera para ese día y psicólogo
4. Si alguien cancela en ese día:
   - Sistema notifica a todos en lista de espera
   - Pacientes pueden intentar reservar nuevamente

---

## Análisis del Problema

### Descripción del Problema

**¿Qué ocurre hoy en la realidad?**  
 Actualmente, la gestión de citas en consultorios psicológicos se realiza mediante agendas manuales o apps de mensajería, lo que provoca cruces de horarios. No existe un lugar centralizado y seguro para guardar los horarios y las citas, dependiendo de archivos físicos vulnerables. Además, el proceso de reprogramación o cancelación es complicado, requiriendo llamadas o mensajes de chat.

### Usuario / Cliente

**¿Quién sufre el problema directamente?**

- **Usuario principal:** El paciente (persona que busca atención en salud mental) que necesita agendar citas con privacidad y flexibilidad horaria.

- **Usuario administrador:** El psicólogo/a que requiere gestionar sus citas y configurar su horario de atención.

- **Contexto en el que ocurre el problema:** El problema ocurre en una clínica donde el psicólogo atiende entre 10 y 20 pacientes por semana. Actualmente el paciente escribe por WhatsApp para pedir turno, el psicólogo revisa su agenda y si hay disponibilidad se lo confirma por chat. No existe ningún recordatorio automático.

### Dolor o Necesidad

**¿Qué consecuencia negativa genera el problema?**

- **Ausentismo:** Al no haber recordatorios automatizados, los pacientes olvidan sus sesiones, generando pérdidas económicas ("horas muertas").

- **Desorganización clínica:** La pérdida o dificultad de acceso de los horarios.

- **Sobrecarga administrativa:** El psicólogo pierde tiempo coordinando horarios por chat en lugar de atender pacientes.

- **Falta de privacidad:** Coordinar temas sensibles por redes sociales abiertas no garantiza la confidencialidad necesaria.

### Alcance del Sistema

**Qué SÍ va a resolver:**

- **Agenda inteligente:** Visualización de disponibilidad en tiempo real para pacientes y bloqueo de horarios para el profesional.

- **Gestión de notificaciones:** Envío automático de recordatorios de citas y confirmaciones.

**Qué NO va a resolver:**

- **Diagnóstico automatizado:** El sistema no realizará diagnósticos ni test psicológicos automáticos; es una herramienta de gestión, no clínica.

---

## Requerimientos Funcionales

### HU-01 Configuración del Horario

- **Orden de prioridad:** 1/15
- **Tipo de prioridad:** Alta
- **Historia:** Como psicólogo, quiero configurar mis días y bloques de horarios de atención semanales para que los pacientes sepan cuándo pueden agendar.
- **Criterios de aceptación:**
  - Dado que el administrador accede a la configuración de horarios, cuando marque los días laborables y asigne horas, entonces el sistema debe guardar esta plantilla base.
  - Dado que se ha guardado una disponibilidad, cuando un paciente entre al calendario, entonces solo debe ver habilitados los bloques generados por dicha configuración.
- **Estimación:** 4 h

### HU-02 Visualización de Calendario y Horarios Libres

- **Orden de prioridad:** 2/15
- **Tipo de prioridad:** Alta
- **Historia:** Como paciente, quiero visualizar un calendario interactivo con los horarios disponibles del profesional para elegir el momento que mejor se adapte a mi rutina.
- **Criterios de aceptación:**
  - Dado que el paciente entra a la página principal, cuando seleccione un día en el calendario, entonces el sistema debe mostrar únicamente las horas que no han sido reservadas por otros.
  - Dado que un día no tiene horarios disponibles, cuando el paciente lo visualice en el calendario, entonces el día debe aparecer en gris o marcado como "Sin disponibilidad".
- **Estimación:** 3 h

### HU-03 Reserva de Cita por el Paciente

- **Orden de prioridad:** 3/15
- **Tipo de prioridad:** Alta
- **Historia:** Como paciente, quiero seleccionar un horario libre y confirmar mi reserva para asegurar mi espacio.
- **Criterios de aceptación:**
  - Dado que el paciente selecciona un bloque, cuando presione "Confirmar Reserva", entonces el sistema debe registrar la cita a su nombre de usuario.
  - Dado que el paciente selecciona un horario libre en el calendario, cuando se abra la ventana de confirmación, entonces el sistema debe mostrar un resumen previo indicando la fecha y la hora exacta del bloque seleccionado.
- **Estimación:** 4 h

### HU-04 Prevención de Reservas Duplicadas

- **Orden de prioridad:** 4/15
- **Tipo de prioridad:** Alta
- **Historia:** Como sistema, quiero bloquear un horario inmediatamente después de ser seleccionado para evitar que dos pacientes reserven el mismo turno de forma simultánea.
- **Criterios de aceptación:**
  - Dado que el paciente inicia el proceso de reserva de un turno, cuando otro paciente actualice la página, entonces el turno debe aparecer temporalmente bloqueado u ocupado.
  - Dado que se confirma exitosamente una cita, cuando cualquier otro usuario vea el calendario, entonces ese bloque de tiempo ya no debe existir en la lista de opciones.
- **Estimación:** 5 h

### HU-05 Panel de Citas del Psicólogo

- **Orden de prioridad:** 5/15
- **Tipo de prioridad:** Alta
- **Historia:** Como psicólogo, quiero ver una lista centralizada con todas las citas agendadas por día y semana para organizar mi jornada.
- **Criterios de aceptación:**
  - Dado que el psicólogo entra a su panel, cuando seleccione la vista "Hoy", entonces debe ver una lista ordenada cronológicamente de los pacientes agendados.
  - Dado que el psicólogo visualiza una cita en su panel, cuando haga clic en ella, entonces debe ver el nombre y medio de contacto del paciente.
- **Estimación:** 4 h

### HU-06 Cancelación de Cita por el Paciente

- **Orden de prioridad:** 6/15
- **Tipo de prioridad:** Media
- **Historia:** Como paciente, quiero poder cancelar mi cita desde la web si me surge un imprevisto, para liberar el horario y que otro usuario pueda usarlo.
- **Criterios de aceptación:**
  - Dado que el paciente accede al enlace de gestión de su cita, cuando seleccione "Cancelar", entonces el sistema debe eliminar la reserva y liberar el bloque de horario inmediatamente en el calendario público.
  - Dado que la cita fue cancelada, cuando el horario quede libre, entonces el panel del profesional debe actualizarse reflejando ese espacio como disponible.
- **Estimación:** 3 h

### HU-07 Cancelación de Cita por el Psicólogo

- **Orden de prioridad:** 7/15
- **Tipo de prioridad:** Media
- **Historia:** Como psicólogo, quiero poder cancelar una cita desde mi panel en caso de una emergencia personal, notificando al paciente.
- **Criterios de aceptación:**
  - Dado que el psicólogo selecciona una cita agendada, cuando haga clic en "Cancelar turno", entonces el sistema debe eliminar la cita del calendario.
  - Dado que el profesional cancela la cita, cuando se confirme la acción, entonces el sistema debe enviar una notificación automática al paciente informando de la cancelación.
- **Estimación:** 3 h

### HU-08 Reprogramación de Citas

- **Orden de prioridad:** 8/15
- **Tipo de prioridad:** Media
- **Historia:** Como paciente, quiero cambiar la fecha u hora de mi cita ya reservada sin tener que cancelarla y crear una nueva desde cero.
- **Criterios de aceptación:**
  - Dado que el paciente ingresa a "Modificar cita", cuando seleccione una nueva fecha y horario disponible, entonces el sistema debe actualizar la reserva existente y liberar el horario antiguo.
  - Dado que faltan menos de 24 horas para la cita, cuando el paciente intente reprogramar, entonces el sistema debe bloquear la acción e indicar que el tiempo límite ha expirado.
- **Estimación:** 4 h

### HU-09 Notificación de Confirmación de Reserva

- **Orden de prioridad:** 9/15
- **Tipo de prioridad:** Media
- **Historia:** Como paciente, quiero recibir una notificación al momento de agendar para tener un comprobante y los detalles exactos de mi turno.
- **Criterios de aceptación:**
  - Dado que la reserva se guarda exitosamente en la base de datos, cuando el proceso termine, entonces el sistema debe crear una notificación de confirmación con el detalle de la cita de que ha sido reservada con éxito.
  - Dado que se genera una nueva reserva, cuando se cree la notificación al paciente, entonces el administrador también debe recibir una notificación de "Nuevo turno agendado".
- **Estimación:** 3 h

### HU-10 Vista de "Próxima Cita" del Paciente

- **Orden de prioridad:** 10/15
- **Tipo de prioridad:** Media
- **Historia:** Como paciente, quiero ver rápidamente los datos de mi próxima cita agendada al ingresar a la web para no olvidar mi horario.
- **Criterios de aceptación:**
  - Dado que el paciente entra a la web y se identifica, cuando tenga una cita futura, entonces la pantalla principal debe mostrar una tarjeta con los datos de su próxima cita.
  - Dado que el paciente no tiene citas futuras, cuando ingrese, entonces el sistema le mostrará el calendario directamente para agendar una nueva cita.
- **Estimación:** 2 h

### HU-11 Recordatorios Automatizados

- **Orden de prioridad:** 11/15
- **Tipo de prioridad:** Media
- **Historia:** Como psicólogo, quiero que el sistema genere notificaciones a mis pacientes 24 horas antes de su turno para reducir las inasistencias por olvido.
- **Criterios de aceptación:**
  - Dado que faltan 24 horas exactas para un turno, cuando el sistema ejecute su revisión diaria, entonces debe crear una notificación de recordatorio en la cuenta del paciente.
  - Dado que un paciente agendó con menos de 24 horas de anticipación, cuando Reserve, entonces el sistema no creará un recordatorio adicional (solo el de confirmación de reserva).
- **Estimación:** 4 h

### HU-12 Configuración de Horario de Oficina y Calendario

- **Orden de prioridad:** 12/15
- **Tipo de prioridad:** Media
- **Historia:** Como psicólogo, quiero parametrizar mi horario de oficina para que se generen los bloques de atención de manera automática.
- **Criterios de aceptación:**
  - Dado que el psicólogo accede a "Configuración", cuando defina su jornada y genere los horarios, entonces el sistema debe crear bloques de turnos seleccionables con la duración especificada.
  - Dado que un paciente ve el calendario, cuando visualice el día, entonces solo podrá seleccionar turnos dentro de los bloques generados por el psicólogo.
- **Estimación:** 4 h

### HU-13 Historial de Citas

- **Orden de prioridad:** 13/15
- **Tipo de prioridad:** Baja
- **Historia:** Como psicólogo, quiero ver un registro de las citas pasadas de un paciente específico para saber cuántas veces ha asistido o cancelado.
- **Criterios de aceptación:**
  - Dado que el psicólogo busca el nombre de un paciente, cuando acceda a su perfil básico, entonces el sistema debe listar todas las fechas de citas anteriores y su estado (Completada, Cancelada, Ausente).
  - Dado que el psicólogo está en el historial, cuando aprete “Descargar Historial”, entonces el sistema debe descargar en formato pdf una lista de todas las citas con su información básica y estado.
- **Estimación:** 3 h

### HU-14 Lista de Espera

- **Orden de prioridad:** 14/15
- **Tipo de prioridad:** Baja
- **Historia:** Como paciente, quiero entrar a una lista de espera si un día está completamente lleno, para que me avisen si alguien cancela.
- **Criterios de aceptación:**
  - Dado que un día no tiene bloques disponibles, cuando el paciente lo seleccione, entonces debe aparecer un botón "Avisarme si se libera un turno".
  - Dado que un paciente cancela un turno en un día lleno, cuando ese bloque se libere, entonces el sistema debe enviar una notificación a todos los anotados en la lista de espera de ese día informando que hay un nuevo espacio.
- **Estimación:** 5 h

### HU-15 Restricción de Pacientes

- **Orden de prioridad:** 15/15
- **Tipo de prioridad:** Baja
- **Historia:** Como psicólogo, quiero poder bloquear a pacientes que frecuentemente ocupan horarios en el calendario y no asisten.
- **Criterios de aceptación:**
  - Dado que el administrador añade a un paciente a la lista negra, cuando ese paciente intente realizar una nueva reserva, entonces el sistema debe mostrar un mensaje: "No es posible agendar en este momento".
  - Dado que un paciente bloqueado intenta reservar, cuando presione el botón final de confirmación, entonces la reserva no debe guardarse en la base de datos.
- **Estimación:** 2 h
