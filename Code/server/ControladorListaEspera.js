const ControladorBase = require('./ControladorBase');

class ControladorListaEspera extends ControladorBase {
  constructor(cliente) {
    super(cliente);
  }

  async ejecutar() {
    const hoy = new Date().toISOString().split('T')[0];

    const enEsperaResult = await this.obtenerCliente().get(
      `/rest/v1/lista_espera?notificado=eq.false&fecha=eq.${hoy}&select=id,paciente_id,psicologo_id,fecha,usuarios_auth(email,nombre)`,
    );

    if (!Array.isArray(enEsperaResult.data)) {
      return { notificados: 0, error: 'No se pudieron obtener esperas' };
    }

    let notificados = 0;

    for (const espera of enEsperaResult.data) {
      try {
        await this.obtenerCliente().post('/rest/v1/notificaciones', {
          destinatario_tipo: 'paciente',
          destinatario_id: espera.paciente_id,
          tipo: 'lista_espera',
          canal: 'email',
          enviado: false,
        });

        await this.obtenerCliente().patch(
          `/rest/v1/lista_espera?id=eq.${espera.id}`,
          { notificado: true },
        );

        notificados++;
      } catch (error) {
        console.error(
          `Error notificando a paciente en espera ${espera.paciente_id}:`,
          error.message,
        );
      }
    }

    return { notificados };
  }

  async manejar(req, res) {
    try {
      const resultado = await this.ejecutar();
      this.responder(res, 200, { ok: true, ...resultado });
    } catch (error) {
      this.responder(res, 500, {
        error: 'Error interno al procesar lista de espera',
      });
    }
  }
}

module.exports = ControladorListaEspera;
