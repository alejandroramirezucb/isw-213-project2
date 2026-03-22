class GestorNotificaciones {
  static #pacienteId = null;
  static #repositorio = RepositorioNotificaciones;
  static #intervaloActualizacion = null;

  static inicializar(pacienteId) {
    this.#pacienteId = pacienteId;
    this.#iniciarPolling();
  }

  static async cargar() {
    try {
      const contenidoNotif = document.getElementById('contenido-notificaciones');
      if (!contenidoNotif) return;

      const notificaciones = await this.#repositorio.obtenerTodas(this.#pacienteId);
      const conteoNoLeidas = await this.#repositorio.obtenerConteoNoLeidas(this.#pacienteId);

      contenidoNotif.innerHTML = this.#renderizarVista(notificaciones, conteoNoLeidas);
      this.#vincularEventos();
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    }
  }

  static #renderizarVista(notificaciones, conteo) {
    if (notificaciones.length === 0) {
      return `<div class="notif-vacia">No tienes notificaciones aún</div>`;
    }

    return notificaciones.map(n => this.#renderizarItem(n)).join('');
  }

  static #renderizarItem(notificacion) {
    const icono = this.#obtenerIcono(notificacion.tipo);
    const titulo = this.#obtenerTitulo(notificacion.tipo);
    const mensaje = this.#obtenerMensaje(notificacion.tipo);
    const claseLeida = notificacion.enviado ? '' : 'no-leida';

    return `
      <div class="notif-item ${claseLeida}" data-notif-id="${notificacion.id}">
        <div class="notif-icono">${icono}</div>
        <div class="notif-cuerpo">
          <h3 class="notif-titulo">${titulo}</h3>
          <p class="notif-mensaje">${mensaje}</p>
          <p class="notif-fecha">${this.#formatearFecha(notificacion.creado_en)}</p>
        </div>
      </div>
    `;
  }

  static #vincularEventos() {
    const contenidoNotif = document.getElementById('contenido-notificaciones');
    if (!contenidoNotif) return;

    contenidoNotif.querySelectorAll('[data-notif-id]').forEach(elemento => {
      elemento.addEventListener('click', async () => {
        try {
          const notifId = elemento.dataset.notifId;
          await this.#repositorio.marcarComoLeida(notifId);
          await this.cargar();
        } catch (error) {
          console.error('Error al marcar notificación como leída:', error);
        }
      });
    });
  }

  static #obtenerIcono(tipo) {
    switch (tipo) {
      case 'confirmacion_reserva':
        return '✓';
      case 'recordatorio':
        return '⏰';
      case 'cancelacion':
        return '✕';
      case 'libracion_horario':
        return '⭐';
      default:
        return 'ℹ️';
    }
  }

  static #obtenerTitulo(tipo) {
    switch (tipo) {
      case 'confirmacion_reserva':
        return 'Cita Confirmada';
      case 'recordatorio':
        return 'Recordatorio de Cita';
      case 'cancelacion':
        return 'Cita Cancelada';
      case 'libracion_horario':
        return '¡Hay disponibilidad!';
      default:
        return 'Notificación';
    }
  }

  static #obtenerMensaje(tipo) {
    switch (tipo) {
      case 'confirmacion_reserva':
        return 'Tu cita ha sido confirmada. Tienes una sesión agendada.';
      case 'recordatorio':
        return 'Recordatorio: tienes una cita próximamente.';
      case 'cancelacion':
        return 'Tu cita ha sido cancelada.';
      case 'libracion_horario':
        return '¡Excelente! Hay disponibilidad. Rápido, hay un turno libre para agendar.';
      default:
        return 'Tienes una nueva notificación.';
    }
  }

  static #formatearFecha(fechaISO) {
    const ahora = new Date();
    const fecha = new Date(fechaISO);
    const diff = Math.floor((ahora - fecha) / 1000);

    if (diff < 60) return 'Hace menos de un minuto';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minutos`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`;

    return fecha.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  static #iniciarPolling() {
    if (this.#intervaloActualizacion) {
      clearInterval(this.#intervaloActualizacion);
    }

    this.#intervaloActualizacion = setInterval(async () => {
      try {
        const vistaNotif = document.getElementById('vista-notificaciones');
        if (vistaNotif && vistaNotif.classList.contains('vista--activa')) {
          await this.cargar();
        }
      } catch (error) {
        console.error('Error en polling de notificaciones:', error);
      }
    }, 30000);
  }

  static detener() {
    if (this.#intervaloActualizacion) {
      clearInterval(this.#intervaloActualizacion);
    }
  }
}
