export class ModeloNotificaciones {
  constructor(repositorio) {
    this._repositorio = repositorio;
    this._pacienteId = null;
    this._intervalo = null;
  }

  inicializar(pacienteId) {
    this._pacienteId = pacienteId;
    this._actualizarContador();
    this._intervalo = setInterval(() => this._actualizarContador(), 30000);
  }

  async cargar() {
    try {
      const [notificaciones, conteoNoLeidas] = await Promise.all([
        this._repositorio.obtenerTodas(this._pacienteId),
        this._repositorio.obtenerConteoNoLeidas(this._pacienteId),
      ]);
      document.dispatchEvent(new CustomEvent('paciente:notificacionesCargadas', { detail: { notificaciones, conteoNoLeidas } }));
    } catch (_) {}
  }

  async marcarLeida(notifId) {
    await this._repositorio.marcarComoLeida(notifId);
    return this.cargar();
  }

  async limpiarTodas() {
    const exito = await this._repositorio.marcarTodasLeidasDelPaciente(this._pacienteId);
    if (exito) {
      document.dispatchEvent(new CustomEvent('paciente:mensaje', { detail: { texto: 'Notificaciones marcadas como leídas', tipo: 'exito' } }));
      return this.cargar();
    }
  }

  detener() {
    if (this._intervalo) clearInterval(this._intervalo);
  }

  async _actualizarContador() {
    try {
      const conteo = await this._repositorio.obtenerConteoNoLeidas(this._pacienteId);
      document.dispatchEvent(new CustomEvent('paciente:conteoNotificaciones', { detail: { conteo } }));
    } catch (_) {}
  }
}
