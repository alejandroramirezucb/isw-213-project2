import { GestorModales } from '../../compartido/gestores/GestorModales.js';
import { Configuracion } from '../../compartido/config/Configuracion.js';
import { FormateadorFecha } from '../../compartido/formateadores/FormateadorFecha.js';
import { FormateadorHora } from '../../compartido/formateadores/FormateadorHora.js';

export class VistaCitas {
  constructor() {
    this._citasActuales = [];
    this._usuario = null;
    this._suscribirEventos();
  }

  inicializar() { this._bindEventos(); }
  setUsuario(usuario) { this._usuario = usuario; }

  _bindEventos() {
    document.getElementById('btn-cancelar-proxima')?.addEventListener('click', () =>
      document.dispatchEvent(new CustomEvent('paciente:cancelacionSolicitada')),
    );
    document.getElementById('btn-reprogramar-proxima')?.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('paciente:reprogramacionSolicitada', {
        detail: {
          fechaTexto: document.querySelector('#proxima-cita-fecha')?.textContent,
          horaTexto: document.querySelector('#proxima-cita-hora')?.textContent,
        },
      }));
    });
    document.getElementById('btn-cancelar-reprogramacion')?.addEventListener('click', () =>
      document.dispatchEvent(new CustomEvent('paciente:reprogramacionCanceladaSolicitada')),
    );
    document.getElementById('btn-cerrar-modal-cancelacion')?.addEventListener('click', () =>
      GestorModales.cerrar(Configuracion.IDS_MODALES.CANCELACION),
    );
    document.getElementById('btn-si-cancelar')?.addEventListener('click', () =>
      document.dispatchEvent(new CustomEvent('paciente:cancelacionConfirmarSolicitada')),
    );
    document.getElementById('btn-exportar-pdf')?.addEventListener('click', () =>
      document.dispatchEvent(new CustomEvent('paciente:exportarPdfSolicitado', {
        detail: { citas: this._citasActuales, usuario: this._usuario },
      })),
    );
    document.querySelectorAll('.filtros__boton').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filtros__boton').forEach((b) => b.classList.remove(Configuracion.CLASES_CSS.FILTRO_ACTIVO));
        btn.classList.add(Configuracion.CLASES_CSS.FILTRO_ACTIVO);
        document.dispatchEvent(new CustomEvent('paciente:filtroMisCitasCambiado', { detail: { filtro: btn.dataset.filtro } }));
      });
    });
  }

  _suscribirEventos() {
    document.addEventListener('paciente:proximaCitaCargada', (e) => this._renderizarProxima(e.detail.cita));
    document.addEventListener('paciente:citasCargadas', (e) => {
      this._citasActuales = e.detail.citas;
      this._renderizarMisCitas(e.detail.citas);
    });
    document.addEventListener('paciente:cancelacionConfirmada', () =>
      GestorModales.cerrar(Configuracion.IDS_MODALES.CANCELACION),
    );
  }

  _renderizarProxima(cita) {
    const contenedor = document.querySelector('#proxima-cita');
    if (!contenedor) return;
    if (cita) {
      contenedor.classList.remove('tarjeta-cita--oculta');
      const elFecha = document.querySelector('#proxima-cita-fecha');
      const elHora = document.querySelector('#proxima-cita-hora');
      if (elFecha) elFecha.textContent = FormateadorFecha.aTextoCorto(new Date(cita.bloques_horario.fecha + 'T00:00:00'));
      if (elHora) elHora.textContent = FormateadorHora.formatear(cita.bloques_horario.hora_inicio);
    } else {
      contenedor.classList.add('tarjeta-cita--oculta');
    }
  }

  _renderizarMisCitas(citas) {
    const lista = document.querySelector('#lista-mis-citas');
    const vacio = document.querySelector('#sin-citas');
    if (!lista || !vacio) return;

    if (!citas.length) {
      lista.innerHTML = '';
      vacio.classList.remove('mensaje-vacio--oculto');
      return;
    }
    vacio.classList.add('mensaje-vacio--oculto');

    lista.innerHTML = citas.map((c) => {
      if (!c.bloques_horario) return '';
      const estadoClase = `cita-item__estado--${c.estado}`;
      const estadoTexto = c.estado.charAt(0).toUpperCase() + c.estado.slice(1);
      return `<article class="cita-item" data-cita-id="${c.id}" data-estado="${c.estado}">
        <div class="cita-item__info">
          <span class="cita-item__fecha">${FormateadorFecha.aTextoCorto(new Date(c.bloques_horario.fecha + 'T00:00:00'))}</span>
          <span class="cita-item__hora">${FormateadorHora.formatear(c.bloques_horario.hora_inicio)}</span>
        </div>
        <span class="cita-item__estado ${estadoClase}">${estadoTexto}</span>
      </article>`;
    }).join('');

    lista.querySelectorAll('.cita-item').forEach((el) => {
      el.addEventListener('click', () => {
        if (el.dataset.estado === 'confirmada') {
          document.dispatchEvent(new CustomEvent('paciente:citaSeleccionada', { detail: { citaId: el.dataset.citaId } }));
        }
      });
    });
  }
}
