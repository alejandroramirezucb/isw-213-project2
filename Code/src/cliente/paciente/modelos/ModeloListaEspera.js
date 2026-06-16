/* globals CustomEvent */

export class ModeloListaEspera {
  constructor(repositorioListaEspera, repositorioBloques) {
    this._repositorioListaEspera = repositorioListaEspera;
    this._repositorioBloques = repositorioBloques;
    this._pacienteId = null;
  }

  inicializar(pacienteId) {
    this._pacienteId = pacienteId;
  }

  yaEstaInscrito(inscritos, pacienteId) {
    let encontrado = false;
    for (let i = 0; i < inscritos.length; i++) {
      if (inscritos[i].paciente_id === pacienteId) {
        encontrado = true;
      }
    }
    return encontrado;
  }

  async mostrarModal(fecha, fechaFormato, psicologoId) {
    const yaEnEspera = await this._repositorioListaEspera.estaEnEspera(
      this._pacienteId,
      psicologoId,
      fecha,
    );
    if (yaEnEspera) {
      return document.dispatchEvent(
        new CustomEvent('paciente:mensaje', {
          detail: {
            texto: 'Ya estás en la lista de espera para esta fecha',
            tipo: 'info',
          },
        }),
      );
    }
    document.dispatchEvent(
      new CustomEvent('paciente:modalListaEsperaAbrir', {
        detail: { fecha, fechaFormato, psicologoId },
      }),
    );
  }

  async unirse(fecha, psicologoId) {
    const ok = await this._repositorioListaEspera.anadirAEspera(
      this._pacienteId,
      psicologoId,
      fecha,
    );
    if (ok) {
      const posicion = await this._repositorioListaEspera.obtenerPosicion(
        this._pacienteId,
        psicologoId,
        fecha,
      );
      document.dispatchEvent(
        new CustomEvent('paciente:mensaje', {
          detail: {
            texto: `¡Te has unido a la lista de espera! Posición: ${posicion}`,
            tipo: 'exito',
          },
        }),
      );
    } else {
      document.dispatchEvent(
        new CustomEvent('paciente:mensaje', {
          detail: {
            texto: 'Error al unirse a la lista de espera. Intenta de nuevo.',
            tipo: 'error',
          },
        }),
      );
    }
  }
}
