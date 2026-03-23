class GestorNotificaciones {
  static #psicologoId = null;
  static #repositorio = RepositorioNotificaciones;
  static #intervaloActualizacion = null;

  static inicializar(psicologoId) {
    this.#psicologoId = psicologoId;
    this.#iniciarPolling();
  }

  static async cargar() {
    try {
      const contenidoNotif = document.getElementById('contenido-notificaciones');
      if (!contenidoNotif) return;

      const notificaciones = await this.#repositorio.obtenerTodas(this.#psicologoId);
      const conteoNoLeidas = await this.#repositorio.obtenerConteoNoLeidas(this.#psicologoId);

      contenidoNotif.innerHTML = this.#renderizarVista(notificaciones, conteoNoLeidas);
      this.#vincularEventos();
      this.#actualizarBotonesCleanup(notificaciones.length > 0);
      this.#actualizarContador(conteoNoLeidas);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    }
  }

  static #actualizarBotonesCleanup(hayNotificaciones) {
    const btnLimpiar = document.getElementById('btn-limpiar-notificaciones');
    if (btnLimpiar) {
      btnLimpiar.style.display = hayNotificaciones ? 'block' : 'none';
    }
  }

  static async #manejarLimpiarNotificaciones() {
    const exito = await this.#repositorio.marcarTodasLeidas(this.#psicologoId);
    if (exito) {
      MensajesFachada.mostrar('Notificaciones marcadas como leídas', 'exito');
      await this.cargar();
    }
  }

  static #actualizarContador(conteo) {
    const contador = document.getElementById('contador-notificaciones');
    if (!contador) return;

    if (conteo > 0) {
      contador.textContent = conteo > 9 ? '9+' : conteo;
      contador.style.display = 'inline-flex';
    } else {
      contador.style.display = 'none';
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
      case 'nuevo_turno':
        return '👤';
      case 'cancelacion':
        return '✕';
      case 'recordatorio':
        return '⏰';
      default:
        return 'ℹ️';
    }
  }

  static #obtenerTitulo(tipo) {
    switch (tipo) {
      case 'nuevo_turno':
        return 'Nuevo Turno Agendado';
      case 'cancelacion':
        return 'Cita Cancelada';
      case 'recordatorio':
        return 'Recordatorio';
      default:
        return 'Notificación';
    }
  }

  static #obtenerMensaje(tipo) {
    switch (tipo) {
      case 'nuevo_turno':
        return 'Un paciente ha agendado una nueva cita contigo.';
      case 'cancelacion':
        return 'Una cita ha sido cancelada.';
      case 'recordatorio':
        return 'Tienes una cita próxima.';
      default:
        return 'Tienes una nueva notificación.';
    }
  }

  static #formatearFecha(fecha) {
    const hoy = new Date();
    const fechaNotif = new Date(fecha);
    const diffMs = hoy - fechaNotif;
    const diffMinutos = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMinutos < 1) return 'Ahora';
    if (diffMinutos < 60) return `Hace ${diffMinutos}m`;
    if (diffHoras < 24) return `Hace ${diffHoras}h`;
    if (diffDias < 7) return `Hace ${diffDias}d`;

    return fechaNotif.toLocaleDateString('es-ES');
  }

    static #iniciarPolling() {
    const btnLimpiar = document.getElementById('btn-limpiar-notificaciones');
    if (btnLimpiar && !btnLimpiar.dataset.eventoRegistrado) {
      btnLimpiar.addEventListener('click', () => this.#manejarLimpiarNotificaciones());
      btnLimpiar.dataset.eventoRegistrado = 'true';
    }

    this.#intervaloActualizacion = setInterval(async () => {
      try {
        const conteo = await this.#repositorio.obtenerConteoNoLeidas(this.#psicologoId);
        this.#actualizarContador(conteo);

        const contenidoNotif = document.getElementById('contenido-notificaciones');
        if (contenidoNotif) { await this.cargar(); }
      } catch (error) {
        console.warn('Error en polling de notificaciones:', error);
      }
    }, 30000);

    // Suscripción en tiempo real (opcional, no rompe si falla)
    if (this.#repositorio.suscribirseNuevasNotificaciones) {
      try {
        this.unsuscriber = this.#repositorio.suscribirseNuevasNotificaciones(this.#psicologoId, async () => {
          try {
            const conteo = await this.#repositorio.obtenerConteoNoLeidas(this.#psicologoId);
            this.#actualizarContador(conteo);
            const contenidoNotif = document.getElementById('contenido-notificaciones');
            if (contenidoNotif) { await this.cargar(); }
            MensajesFachada.mostrar('Nueva notificación recibida', 'exito');
          } catch (cbError) {
            console.warn('Error en callback de notificación:', cbError);
          }
        });
      } catch (subError) {
        console.warn('No se pudo suscribir a notificaciones en tiempo real:', subError);
      }
    }

    (async () => {
      try {
        const conteo = await this.#repositorio.obtenerConteoNoLeidas(this.#psicologoId);
        this.#actualizarContador(conteo);
      } catch (error) {
        console.warn('Error al obtener conteo inicial de notificaciones:', error);
      }
    })();
  }

  static detener() {
    if (this.#intervaloActualizacion) { clearInterval(this.#intervaloActualizacion); this.#intervaloActualizacion = null; }
    if (this.unsuscriber) { this.unsuscriber(); this.unsuscriber = null; }
  }
}


