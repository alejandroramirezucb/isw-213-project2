import { ControladorBase } from './ControladorBase.js';

export class ControladorNotificaciones extends ControladorBase {
  async ejecutar() {
    const resultado = await this.cliente.get(
      `/rest/v1/notificaciones?enviado=eq.false&destinatario_tipo=eq.paciente&select=id`,
    );

    if (!Array.isArray(resultado.data)) return { verificadas: 0 };
    return { verificadas: resultado.data.length };
  }

  async manejar(req, res) {
    try {
      const resultado = await this.ejecutar();
      this.responder(res, 200, { ok: true, ...resultado });
    } catch {
      this.responder(res, 500, { error: 'Error al procesar notificaciones' });
    }
  }
}
