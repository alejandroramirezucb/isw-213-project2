export class ControladorCitasPsicologo {
  constructor(modeloCitas) {
    this._modeloCitas = modeloCitas;
    this._bindEventos();
  }

  _bindEventos() {
    document.addEventListener('psicologo:periodoCambiado', (evento) =>
      this._modeloCitas.cargarPeriodo(evento.detail.periodo),
    );
    document.addEventListener('psicologo:citaClickeada', (evento) =>
      this._modeloCitas.mostrarDetalle(evento.detail.citaId),
    );
    document.addEventListener('psicologo:diaCalendarioClickeado', (evento) => {
      if (evento.detail.citasDelDia.length) {
        document.dispatchEvent(new CustomEvent('psicologo:citasCargadas', {
          detail: { citas: evento.detail.citasDelDia, periodo: 'dia', fechas: {} },
        }));
      }
    });
    document.addEventListener('psicologo:cancelarCitaSolicitada', () =>
      this._modeloCitas.cancelarCita(),
    );
    document.addEventListener('psicologo:citaCancelada', () => {
      const botonPeriodoActivo = document.querySelector('.periodo__boton--activo');
      this._modeloCitas.cargarPeriodo(botonPeriodoActivo?.dataset.periodo || 'hoy');
    });
    document.addEventListener('psicologo:calendarioNavegado', (evento) => {
      const fecha = evento.detail.fecha;
      this._modeloCitas.cargarMes(fecha.getFullYear(), fecha.getMonth());
    });
  }
}
