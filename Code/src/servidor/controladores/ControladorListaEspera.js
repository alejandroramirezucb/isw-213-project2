import { ControladorBase } from './ControladorBase.js';

export class ControladorListaEspera extends ControladorBase {
  async ejecutar() {
    const hoy = new Date().toISOString().split('T')[0];

    const enEsperaResult = await this.cliente.get(
      `/rest/v1/lista_espera?notificado=eq.false&fecha=eq.${hoy}&select=id,paciente_id,psicologo_id,fecha`,
    );

    if (!Array.isArray(enEsperaResult.data)) return { notificados: 0 };

    let notificados = 0;
    for (const espera of enEsperaResult.data) {
      try {
        await this.cliente.post('/rest/v1/notificaciones', {
          destinatario_tipo: 'paciente',
          destinatario_id: espera.paciente_id,
          tipo: 'lista_espera',
          canal: 'email',
          enviado: false,
        });

        await this.cliente.patch(`/rest/v1/lista_espera?id=eq.${espera.id}`, { notificado: true });
        notificados++;
      } catch {}
    }

    return { notificados };
  }

  async manejar(req, res) {
    try {
      const resultado = await this.ejecutar();
      this.responder(res, 200, { ok: true, ...resultado });
    } catch {
      this.responder(res, 500, { error: 'Error al procesar lista de espera' });
    }
  }
}
