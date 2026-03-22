const ControladorBase = require('./ControladorBase');

class ControladorNotificaciones extends ControladorBase {
  constructor(cliente) {
    super(cliente);
  }

  async ejecutar() {
    const resultado = await this.obtenerCliente().get(
      `/rest/v1/notificaciones?enviado=eq.false&destinatario_tipo=eq.paciente&select=id`,
    );

    if (!Array.isArray(resultado.data)) {
      return { verificadas: 0, error: 'No se pudieron obtener notificaciones' };
    }

    return { verificadas: resultado.data.length };
  }

  async manejar(req, res) {
    try {
      const resultado = await this.ejecutar();
      this.responder(res, 200, { ok: true, ...resultado });
    } catch (error) {
      this.responder(res, 500, {
        error: 'Error interno al procesar notificaciones',
      });
    }
  }
}

module.exports = ControladorNotificaciones;
