const ControladorBase = require('./ControladorBase');

class ControladorRecordatorios extends ControladorBase {
  constructor(cliente) {
    super(cliente);
  }

  async ejecutar() {
    const ahora = new Date();
    const en24h = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);

    const fechaDesde = ahora.toISOString().slice(0, 10);
    const fechaHasta = en24h.toISOString().slice(0, 10);

    const citasResult = await this.obtenerCliente().get(
      `/rest/v1/citas?estado=eq.reservada&fecha=gte.${fechaDesde}&fecha=lte.${fechaHasta}&select=id,paciente_id,fecha,hora_inicio,created_at`,
    );

    if (!Array.isArray(citasResult.data)) {
      return { enviados: 0, error: 'No se pudieron obtener citas' };
    }

    let enviados = 0;
    for (const cita of citasResult.data) {
      const creadaEn = new Date(cita.created_at);
      const margenMs = ahora.getTime() - creadaEn.getTime();
      if (margenMs < 24 * 60 * 60 * 1000) continue;

      const yaExisteResult = await this.obtenerCliente().get(
        `/rest/v1/notificaciones?cita_id=eq.${cita.id}&tipo=eq.recordatorio&select=id`,
      );

      if (
        Array.isArray(yaExisteResult.data) &&
        yaExisteResult.data.length > 0
      ) {
        continue;
      }

      await this.obtenerCliente().post('/rest/v1/notificaciones', {
        paciente_id: cita.paciente_id,
        cita_id: cita.id,
        tipo: 'recordatorio',
        mensaje: `Recordatorio: tiene una cita el ${cita.fecha} a las ${cita.hora_inicio}.`,
        leida: false,
      });
      enviados++;
    }

    return { enviados };
  }

  async manejar(req, res) {
    try {
      const resultado = await this.ejecutar();
      this.responder(res, 200, { ok: true, ...resultado });
    } catch {
      this.responder(res, 500, {
        error: 'Error interno al generar recordatorios',
      });
    }
  }
}

module.exports = ControladorRecordatorios;
