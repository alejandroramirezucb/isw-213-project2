export class ModeloNotificaciones {
  constructor(repositorio) {
    this._repositorio = repositorio;
    this._psicologoId = null;
    this._intervalo = null;
    this._unsub = null;
  }

  inicializar(psicologoId) {
    this._psicologoId = psicologoId;
    this._actualizarContador();
    this._intervalo = setInterval(() => this._actualizarContador(), 30000);
    this._suscribir();
  }

  async cargar() {
    try {
      const [notificaciones, conteoNoLeidas] = await Promise.all([
        this._repositorio.obtenerTodas(this._psicologoId),
        this._repositorio.obtenerConteoNoLeidas(this._psicologoId),
      ]);
      document.dispatchEvent(new CustomEvent('psicologo:notificacionesCargadas', { detail: { notificaciones, conteoNoLeidas } }));
    } catch (_) {}
  }

  async marcarLeida(notifId) {
    await this._repositorio.marcarComoLeida(notifId);
    return this.cargar();
  }

  async limpiarTodas() {
    const exito = await this._repositorio.marcarTodasLeidas(this._psicologoId);
    if (exito) {
      document.dispatchEvent(new CustomEvent('psicologo:mensaje', { detail: { texto: 'Notificaciones marcadas como leídas', tipo: 'exito' } }));
      return this.cargar();
    }
  }

  detener() {
    if (this._intervalo) clearInterval(this._intervalo);
    this._unsub?.();
  }

  async _actualizarContador() {
    try {
      const conteo = await this._repositorio.obtenerConteoNoLeidas(this._psicologoId);
      document.dispatchEvent(new CustomEvent('psicologo:conteoNotificaciones', { detail: { conteo } }));
    } catch (_) {}
  }

  _suscribir() {
    if (!this._repositorio.suscribirseNuevasNotificaciones) return;
    try {
      this._unsub = this._repositorio.suscribirseNuevasNotificaciones(this._psicologoId, async () => {
        await this._actualizarContador();
        await this.cargar();
        document.dispatchEvent(new CustomEvent('psicologo:mensaje', { detail: { texto: 'Nueva notificación recibida', tipo: 'exito' } }));
      });
    } catch (_) {}
  }
}
