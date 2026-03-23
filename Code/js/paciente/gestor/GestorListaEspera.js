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

    const modalId = this.#crearModalEspera(fecha, fechaFormato);
    GestorModales.abrir(modalId);
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
    const modalId = `modal-espera-${fecha}`;
    
    const modalAnterior = document.getElementById(modalId);
    if (modalAnterior) {
      modalAnterior.remove();
    }

    const html = `
      <div class="modal modal--oculto" id="${modalId}">
        <div class="modal__contenido">
          <header class="modal__encabezado">
            <h3 class="modal__titulo">Unirse a Lista de Espera</h3>
            <button class="modal__boton-cerrar" id="btn-cerrar-espera-${fecha}">&times;</button>
          </header>
          <div class="modal__cuerpo">
            <p class="modal__info">Te notificaremos cuando se libere un horario en esta fecha.</p>
            <div class="resumen-reserva" style="margin-top: 1rem;">
              <p class="resumen-reserva__item"><strong>Fecha:</strong> <span>${fechaFormato}</span></p>
            </div>
          </div>
          <footer class="modal__acciones">
            <button class="boton boton--secundario" id="btn-cancelar-espera-${fecha}">Cancelar</button>
            <button class="boton boton--primario" id="btn-confirmar-espera-${fecha}">Avisarme</button>
          </footer>
        </div>
      </div>
    `;

    const contenedorTemporal = document.createElement('div');
    contenedorTemporal.innerHTML = html;
    const modal = contenedorTemporal.firstElementChild;
    document.body.appendChild(modal);

    document.getElementById(`btn-confirmar-espera-${fecha}`).addEventListener(
      'click',
      async () => {
        await this.unirseAListaEspera(fecha);
        GestorModales.cerrar(modalId);
        modal.remove();
      },
    );

    document.getElementById(`btn-cancelar-espera-${fecha}`).addEventListener(
      'click',
      () => {
        GestorModales.cerrar(modalId);
        modal.remove();
      },
    );

    document.getElementById(`btn-cerrar-espera-${fecha}`).addEventListener(
      'click',
      () => {
        GestorModales.cerrar(modalId);
        modal.remove();
      },
    );

    return modalId;
  }

  #dispararEvento(nombre, datos) {
    if (this.#eventosUI && typeof this.#eventosUI.emit === 'function') {
      this.#eventosUI.emit(nombre, datos);
    }
  }
}
