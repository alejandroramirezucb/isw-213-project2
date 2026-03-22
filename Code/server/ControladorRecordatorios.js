const ControladorBase = require('./ControladorBase');

class ControladorRecordatorios extends ControladorBase {
  constructor(cliente) {
    super(cliente);
  }

  async ejecutar() {
    const ahora = new Date();
    const en24h = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);

    const fechaHoy = ahora.toISOString().split('T')[0];
    const fechaEn24h = en24h.toISOString().split('T')[0];

    const citasResult = await this.obtenerCliente().get(
      `/rest/v1/citas?estado=eq.confirmada&select=id,paciente_id,bloques_horario(fecha,hora_inicio),created_at`,
    );

    if (!Array.isArray(citasResult.data)) {
      return { enviados: 0, error: 'No se pudieron obtener citas' };
    }

    let enviados = 0;
    const ahoraTime = ahora.getTime();

    for (const cita of citasResult.data) {
      if (!cita.bloques_horario || !cita.bloques_horario.fecha) {
        continue;
      }

      const fechaCita = new Date(cita.bloques_horario.fecha).toISOString().split('T')[0];

      if (fechaCita < fechaHoy || fechaCita > fechaEn24h) {
        continue;
      }

      const creadaEn = new Date(cita.created_at);
      const margenMs = ahoraTime - creadaEn.getTime();
      const veinticuatroHorasMs = 24 * 60 * 60 * 1000;

      if (margenMs < veinticuatroHorasMs) {
        continue;
      }

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
        destinatario_tipo: 'paciente',
        destinatario_id: cita.paciente_id,
        cita_id: cita.id,
        tipo: 'recordatorio',
        canal: 'sistema',
        enviado: false,
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
