# Psicoraiden

## Tabla de Contenidos

1. [Análisis del Problema](#análisis-del-problema)
   - [Descripción del Problema](#descripción-del-problema)
   - [Usuario / Cliente](#usuario--cliente)
   - [Dolor o Necesidad](#dolor-o-necesidad)
   - [Alcance del Sistema](#alcance-del-sistema)
2. [Requerimientos Funcionales](#requerimientos-funcionales)

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
- **Historia:** Como paciente, quiero seleccionar un horario libre y confirmar mi reserva ingresando mis datos para asegurar mi espacio.
- **Criterios de aceptación:**
  - Dado que el paciente selecciona un bloque, cuando ingrese su nombre y correo y presione "Reservar", entonces el sistema debe registrar la cita a su nombre.
  - Dado que el paciente intenta reservar sin llenar sus datos de contacto, cuando presione "Reservar", entonces el sistema debe mostrar un error pidiendo los campos obligatorios.
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
  - Dado que la reserva se guarda exitosamente en la base de datos, cuando el proceso termine, entonces el sistema debe enviar un email al paciente con el día, hora y opciones para gestionar la cita (cancelar/reprogramar).
  - Dado que se genera una nueva reserva, cuando se envíe la notificación al paciente, entonces el administrador también debe recibir una notificación de "Nuevo turno agendado".
- **Estimación:** 3 h

### HU-10 Vista de "Próxima Cita" del Paciente

- **Orden de prioridad:** 10/15
- **Tipo de prioridad:** Media
- **Historia:** Como paciente, quiero ver rápidamente los datos de mi próxima cita agendada al ingresar a la web para no olvidar mi horario.
- **Criterios de aceptación:**
  - Dado que el paciente entra a la web y se identifica, cuando tenga una cita futura, entonces la pantalla principal debe mostrar una tarjeta con el texto "Tu próxima cita es el \[Día\] a las \[Hora\]".
  - Dado que el paciente no tiene citas futuras, cuando ingrese, entonces el sistema debe mostrarle directamente el botón para "Agendar nueva cita".
- **Estimación:** 2 h

### HU-11 Recordatorios Automatizados

- **Orden de prioridad:** 11/15
- **Tipo de prioridad:** Media
- **Historia:** Como psicólogo, quiero que el sistema envíe una notificación a mis pacientes 24 horas antes de su turno para reducir las inasistencias por olvido.
- **Criterios de aceptación:**
  - Dado que faltan 24 horas exactas para un turno, cuando el sistema ejecute su revisión diaria, entonces debe enviar una notificación con el recordatorio a la cuenta del paciente.
  - Dado que un paciente agendó con menos de 24 horas de anticipación, cuando reserve, entonces el sistema no enviará un recordatorio adicional (solo el de confirmación de reserva).
- **Estimación:** 4 h

### HU-12 Configuración de Horario de Oficina y Calendario

- **Orden de prioridad:** 12/15
- **Tipo de prioridad:** Media
- **Historia:** Como psicólogo, quiero parametrizar mi horario de oficina, pero que el calendario muestre el día completo para diferenciar mi tiempo regular de posibles excepciones.
- **Criterios de aceptación:**
  - Dado que el psicólogo accede a "Configuración", cuando defina su jornada, entonces el sistema debe marcar esos bloques como "Laborables" por defecto.
  - Dado que un paciente ve el calendario, cuando visualice el día, entonces debe ver el día completo, pero solo podrá seleccionar turnos dentro del rango que se configuró.
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
  - Dado que el administrador añade a un paciente a la lista negra, cuando ese paciente intente realizar una nueva reserva, entonces el sistema debe mostrar un mensaje: "No es posible agendar en este momento, comuníquese directamente con administración."
  - Dado que un paciente bloqueado intenta reservar, cuando presione el botón final de confirmación, entonces la reserva no debe guardarse en la base de datos.
- **Estimación:** 2 h
