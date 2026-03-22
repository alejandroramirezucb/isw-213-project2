class GestorListaEspera {
  #pacienteId;
  #psicologoId;
  #eventosUI;

  constructor(pacienteId, psicologoId, eventosUI = null) {
    this.#pacienteId = pacienteId;
    this.#psicologoId = psicologoId;
    this.#eventosUI = eventosUI;
  }

  async mostrarModalListaEspera(fecha, fechaFormato) {
    const yaEnEspera = await RepositorioListaEspera.estaEnEspera(
      this.#pacienteId,
      this.#psicologoId,
      fecha,
    );

    if (yaEnEspera) {
      MensajesFachada.mostrar(
        'Ya estás en la lista de espera para esta fecha',
        'info',
      );
      return;
    }

    const modal = this.#crearModalEspera(fecha, fechaFormato);
    GestorModales.abrirModal(modal);
  }

  async unirseAListaEspera(fecha) {
    const resultado = await RepositorioListaEspera.anadirAEspera(
      this.#pacienteId,
      this.#psicologoId,
      fecha,
    );

    if (resultado) {
      const posicion = await RepositorioListaEspera.obtenerPosicion(
        this.#pacienteId,
        this.#psicologoId,
        fecha,
      );

      MensajesFachada.mostrar(
        `¡Te has unido a la lista de espera! Posición: ${posicion}`,
        'exito',
      );

      GestorModales.cerrarTodos();
      this.#dispararEvento('unido_a_espera', { fecha, posicion });
    } else {
      MensajesFachada.mostrar(
        'Error al unirse a la lista de espera. Intenta de nuevo.',
        'error',
      );
    }
  }

  async obtenerPosicion(fecha) {
    return await RepositorioListaEspera.obtenerPosicion(
      this.#pacienteId,
      this.#psicologoId,
      fecha,
    );
  }

  async obtenerMisEsperas() {
    return await RepositorioListaEspera.obtenerEsperasDePaciente(
      this.#pacienteId,
    );
  }

  async cancelarEspera(esperaId) {
    const resultado = await RepositorioListaEspera.cancelarEspera(esperaId);

    if (resultado) {
      MensajesFachada.mostrar('Te has retirado de la lista de espera.', 'info');
      this.#dispararEvento('cancelada_espera', { esperaId });
    } else {
      MensajesFachada.mostrar(
        'Error al cancelar la espera. Intenta de nuevo.',
        'error',
      );
    }
  }

  #crearModalEspera(fecha, fechaFormato) {
    const contenido = `
      <div class="modal__contenido">
        <h2>Unirse a Lista de Espera</h2>
        <p>El horario que seleccionaste no está disponible en este momento.</p>
        <div class="modal__info">
          <p><strong>Fecha:</strong> ${fechaFormato}</p>
        </div>
        <div class="modal__mensaje">
          <p>¿Quieres que te avisemos cuando se libere un espacio en esta fecha?</p>
          <p class="modal__nota">Te enviaremos una notificación por email cuando se libere un horario.</p>
        </div>
        <div class="modal__acciones">
          <button class="boton boton--principal" id="btn-confirmar-espera">
            Sí, avisarme
          </button>
          <button class="boton boton--secundario" id="btn-cancelar-espera">
            Cancelar
          </button>
        </div>
      </div>
    `;

    const modal = {
      id: `espera-${fecha}`,
      contenido: contenido,
      onAbrir: () => {
        document.getElementById('btn-confirmar-espera').addEventListener(
          'click',
          async () => {
            await this.unirseAListaEspera(fecha);
          },
        );

        document.getElementById('btn-cancelar-espera').addEventListener(
          'click',
          () => {
            GestorModales.cerrarTodos();
          },
        );
      },
    };

    return modal;
  }

  #dispararEvento(nombre, datos) {
    if (this.#eventosUI && typeof this.#eventosUI.emit === 'function') {
      this.#eventosUI.emit(nombre, datos);
    }
  }
}
