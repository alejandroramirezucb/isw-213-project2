const ICONOS = { confirmacion_reserva: '✓', recordatorio: '⏰', cancelacion: '✕', lista_espera: '⭐' };
const TITULOS = { confirmacion_reserva: 'Cita Confirmada', recordatorio: 'Recordatorio', cancelacion: 'Cita Cancelada', lista_espera: '¡Hay disponibilidad!' };
const MENSAJES = {
  confirmacion_reserva: 'Tu cita ha sido confirmada.',
  recordatorio: 'Recordatorio: tienes una cita próximamente.',
  cancelacion: 'Tu cita ha sido cancelada.',
  lista_espera: '¡Hay un turno libre para agendar!',
};

export class VistaNotificaciones {
  constructor() {
    this._bindEventos();
    this._suscribirEventos();
  }

  _bindEventos() {
    document.getElementById('btn-limpiar-notificaciones')?.addEventListener('click', () =>
      document.dispatchEvent(new CustomEvent('paciente:notificacionesLimpiar')),
    );
  }

  _suscribirEventos() {
    document.addEventListener('paciente:notificacionesCargadas', (e) => this._renderizar(e.detail));
    document.addEventListener('paciente:conteoNotificaciones', (e) => this._actualizarContador(e.detail.conteo));
  }

  _renderizar({ notificaciones, conteoNoLeidas }) {
    const contenedor = document.getElementById('contenido-notificaciones');
    if (!contenedor) return;
    this._actualizarBotonLimpiar(notificaciones.length > 0);
    this._actualizarContador(conteoNoLeidas);
    if (!notificaciones.length) { contenedor.innerHTML = '<div class="notif-vacia">No tienes notificaciones aún</div>'; return; }
    contenedor.innerHTML = notificaciones.map((n) => this._renderizarItem(n)).join('');
    contenedor.querySelectorAll('[data-notif-id]').forEach((el) => {
      el.addEventListener('click', () =>
        document.dispatchEvent(new CustomEvent('paciente:notificacionMarcarLeida', { detail: { notifId: el.dataset.notifId } })),
      );
    });
  }

  _renderizarItem(n) {
    return `<div class="notif-item${n.enviado ? '' : ' no-leida'}" data-notif-id="${n.id}">
      <div class="notif-icono">${ICONOS[n.tipo] || 'ℹ️'}</div>
      <div class="notif-cuerpo">
        <h3 class="notif-titulo">${TITULOS[n.tipo] || 'Notificación'}</h3>
        <p class="notif-mensaje">${MENSAJES[n.tipo] || 'Tienes una nueva notificación.'}</p>
        <p class="notif-fecha">${this._formatearFecha(n.creado_en)}</p>
      </div>
    </div>`;
  }

  _actualizarContador(conteo) {
    const el = document.getElementById('contador-notificaciones');
    if (!el) return;
    if (conteo > 0) { el.textContent = conteo > 9 ? '9+' : conteo; el.style.display = 'inline-flex'; }
    else el.style.display = 'none';
  }

  _actualizarBotonLimpiar(visible) {
    const btn = document.getElementById('btn-limpiar-notificaciones');
    if (btn) btn.style.display = visible ? 'block' : 'none';
  }

  _formatearFecha(fechaISO) {
    const diff = Math.floor((new Date() - new Date(fechaISO)) / 1000);
    if (diff < 60) return 'Hace menos de un minuto';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minutos`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`;
    return new Date(fechaISO).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
}
