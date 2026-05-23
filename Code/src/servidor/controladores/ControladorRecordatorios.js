import { ControladorBase } from './ControladorBase.js';

export class ControladorRecordatorios extends ControladorBase {
  async ejecutar() {
    const ahora = new Date();
    const en24h = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);
    const fechaHoy = ahora.toISOString().split('T')[0];
    const fechaEn24h = en24h.toISOString().split('T')[0];

    const citasResult = await this.cliente.get(
      `/rest/v1/citas?estado=eq.confirmada&select=id,paciente_id,bloques_horario(fecha,hora_inicio),creado_en`,
    );

    if (!Array.isArray(citasResult.data)) return { enviados: 0 };

    let enviados = 0;
    for (const cita of citasResult.data) {
      if (!cita.bloques_horario?.fecha) continue;

      const fechaCita = new Date(cita.bloques_horario.fecha).toISOString().split('T')[0];
      if (fechaCita < fechaHoy || fechaCita > fechaEn24h) continue;

      const creadaEn = new Date(cita.creado_en);
      if (ahora.getTime() - creadaEn.getTime() < 24 * 60 * 60 * 1000) continue;

      const existe = await this.cliente.get(
        `/rest/v1/notificaciones?cita_id=eq.${cita.id}&tipo=eq.recordatorio&select=id`,
      );
      if (Array.isArray(existe.data) && existe.data.length > 0) continue;

      await this.cliente.post('/rest/v1/notificaciones', {
        destinatario_tipo: 'paciente',
        destinatario_id: cita.paciente_id,
        cita_id: cita.id,
        tipo: 'recordatorio',
        canal: 'email',
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
      this.responder(res, 500, { error: 'Error al generar recordatorios' });
    }
  }
}
