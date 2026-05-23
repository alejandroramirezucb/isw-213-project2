const ICONOS_PSI = { nuevo_turno: '👤', cancelacion: '✕', recordatorio: '⏰' };
const TITULOS_PSI = { nuevo_turno: 'Nuevo Turno Agendado', cancelacion: 'Cita Cancelada', recordatorio: 'Recordatorio' };
const MENSAJES_PSI = { nuevo_turno: 'Un paciente ha agendado una nueva cita contigo.', cancelacion: 'Una cita ha sido cancelada.', recordatorio: 'Tienes una cita próxima.' };

export class VistaNotificacionesPsicologo {
  constructor() {
    this._bindEventos();
    this._suscribirEventos();
  }

  _bindEventos() {
    document.getElementById('btn-limpiar-notificaciones')?.addEventListener('click', () =>
      document.dispatchEvent(new CustomEvent('psicologo:notificacionesLimpiar')),
    );
  }

  _suscribirEventos() {
    document.addEventListener('psicologo:notificacionesCargadas', (e) => this._renderizar(e.detail));
    document.addEventListener('psicologo:conteoNotificaciones', (e) => this._actualizarContador(e.detail.conteo));
  }

  _renderizar({ notificaciones, conteoNoLeidas }) {
    const contenedor = document.getElementById('contenido-notificaciones');
    if (!contenedor) return;
    this._actualizarBotonLimpiar(notificaciones.length > 0);
    this._actualizarContador(conteoNoLeidas);
    if (!notificaciones.length) { contenedor.innerHTML = '<div class="notif-vacia">No tienes notificaciones aún</div>'; return; }
    contenedor.innerHTML = notificaciones.map((n) => `<div class="notif-item${n.enviado ? '' : ' no-leida'}" data-notif-id="${n.id}">
      <div class="notif-icono">${ICONOS_PSI[n.tipo] || 'ℹ️'}</div>
      <div class="notif-cuerpo">
        <h3 class="notif-titulo">${TITULOS_PSI[n.tipo] || 'Notificación'}</h3>
        <p class="notif-mensaje">${MENSAJES_PSI[n.tipo] || 'Tienes una nueva notificación.'}</p>
        <p class="notif-fecha">${this._fmt(n.creado_en)}</p>
      </div>
    </div>`).join('');
    contenedor.querySelectorAll('[data-notif-id]').forEach((el) => {
      el.addEventListener('click', () =>
        document.dispatchEvent(new CustomEvent('psicologo:notificacionMarcarLeida', { detail: { notifId: el.dataset.notifId } })),
      );
    });
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

  _fmt(fecha) {
    const diff = Math.floor((new Date() - new Date(fecha)) / 60000);
    if (diff < 1) return 'Ahora';
    if (diff < 60) return `Hace ${diff}m`;
    if (diff < 1440) return `Hace ${Math.floor(diff / 60)}h`;
    return new Date(fecha).toLocaleDateString('es-ES');
  }
}
