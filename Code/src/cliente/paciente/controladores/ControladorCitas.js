import { GestorModales } from '../../compartido/gestores/GestorModales.js';

export class ControladorCitas {
  constructor(modeloCancelacion, modeloReprogramacion, modeloCitas, modeloListaEspera) {
    this._modeloCancelacion = modeloCancelacion;
    this._modeloReprogramacion = modeloReprogramacion;
    this._modeloCitas = modeloCitas;
    this._modeloListaEspera = modeloListaEspera;
    this._bindEventos();
  }

  _bindEventos() {
    document.addEventListener('paciente:proximaCitaCargada', (evento) => {
      this._modeloCancelacion.setCitaId(evento.detail.cita?.id ?? null);
    });
    document.addEventListener('paciente:cancelacionSolicitada', () =>
      this._modeloCancelacion.mostrarModal(),
    );
    document.addEventListener('paciente:citaSeleccionada', (e) => {
      this._modeloCancelacion.setCitaId(e.detail.citaId);
      this._modeloCancelacion.mostrarModal();
    });
    document.addEventListener('paciente:cancelacionConfirmarSolicitada', () =>
      this._modeloCancelacion.cancelar(),
    );
    document.addEventListener('paciente:cancelacionConfirmada', () => {
      this._modeloCitas.cargarProximaCita();
      this._modeloCitas.cargarMisCitas('proximas');
    });
    document.addEventListener('paciente:reprogramacionSolicitada', (e) =>
      this._modeloReprogramacion.iniciar(this._modeloCancelacion.getCitaId(), e.detail.fechaTexto, e.detail.horaTexto),
    );
    document.addEventListener('paciente:reprogramacionCanceladaSolicitada', () =>
      this._modeloReprogramacion.salir(),
    );
    document.addEventListener('paciente:filtroMisCitasCambiado', (e) =>
      this._modeloCitas.cargarMisCitas(e.detail.filtro),
    );
    document.addEventListener('paciente:exportarPdfSolicitado', (e) =>
      this._modeloCitas.exportarPdf(e.detail.citas, e.detail.usuario),
    );
    document.addEventListener('paciente:reservaConfirmada', () =>
      this._modeloCitas.cargarProximaCita(),
    );
    document.addEventListener('paciente:listaEsperaSolicitada', (e) =>
      this._modeloListaEspera.mostrarModal(e.detail.fecha, e.detail.fechaFormato, e.detail.psicologoId),
    );
    document.addEventListener('paciente:modalListaEsperaAbrir', (e) =>
      this._crearModalListaEspera(e.detail),
    );
  }

  _crearModalListaEspera({ fecha, fechaFormato, psicologoId }) {
    const modalId = `modal-espera-${fecha}`;
    document.getElementById(modalId)?.remove();

    const html = `<div class="modal modal--oculto" id="${modalId}" role="dialog" aria-modal="true">
      <div class="modal__contenido">
        <header class="modal__encabezado">
          <h3 class="modal__titulo">Unirse a Lista de Espera</h3>
          <button class="modal__boton-cerrar" id="btn-cerrar-espera-${fecha}">&times;</button>
        </header>
        <div class="modal__cuerpo">
          <p class="modal__info">Te notificaremos cuando se libere un horario.</p>
          <div class="resumen-reserva"><p class="resumen-reserva__item"><strong>Fecha:</strong> ${fechaFormato}</p></div>
        </div>
        <footer class="modal__acciones">
          <button class="boton boton--secundario" id="btn-cancelar-espera-${fecha}">Cancelar</button>
          <button class="boton boton--primario" id="btn-confirmar-espera-${fecha}">Avisarme</button>
        </footer>
      </div>
    </div>`;

    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    document.body.appendChild(tmp.firstElementChild);
    GestorModales.abrir(modalId);

    const cerrar = () => { GestorModales.cerrar(modalId); document.getElementById(modalId)?.remove(); };
    document.getElementById(`btn-cerrar-espera-${fecha}`)?.addEventListener('click', cerrar);
    document.getElementById(`btn-cancelar-espera-${fecha}`)?.addEventListener('click', cerrar);
    document.getElementById(`btn-confirmar-espera-${fecha}`)?.addEventListener('click', async () => {
      await this._modeloListaEspera.unirse(fecha, psicologoId);
      cerrar();
    });
  }
}
