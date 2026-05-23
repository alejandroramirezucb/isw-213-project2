import { Configuracion } from '../../compartido/config/Configuracion.js';
import { GestorModales } from '../../compartido/gestores/GestorModales.js';
import { FormateadorFecha } from '../../compartido/formateadores/FormateadorFecha.js';
import { FormateadorHora } from '../../compartido/formateadores/FormateadorHora.js';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export class VistaCalendario {
  constructor() {
    this._contenedor = null;
    this._tituloMes = null;
    this._fechaSelectEl = null;
    this._seccionHorarios = null;
    this._listaHorarios = null;
    this._vacio = null;
    this._contenedorEspera = null;
    this._btnEspera = null;
    this._resumenFecha = null;
    this._resumenHora = null;
    this._tituloModal = null;
    this._textoConf = null;
    this._citasDelDia = null;
    this._listaCitasDelDia = null;
    this._suscribirEventos();
  }

  inicializar() {
    this._contenedor = document.querySelector('#calendario-dias');
    this._tituloMes = document.querySelector('#calendario-mes');
    this._fechaSelectEl = document.querySelector('#fecha-seleccionada');
    this._seccionHorarios = document.querySelector('#seccion-horarios');
    this._listaHorarios = document.querySelector('#lista-horarios');
    this._vacio = document.querySelector('#sin-horarios');
    this._contenedorEspera = document.querySelector('#contenedor-lista-espera');
    this._btnEspera = document.querySelector('#btn-lista-espera');
    this._resumenFecha = document.querySelector('#resumen-fecha');
    this._resumenHora = document.querySelector('#resumen-hora');
    this._tituloModal = document.querySelector('#titulo-modal-reserva');
    this._textoConf = document.querySelector('#texto-confirmacion-reserva');
    this._citasDelDia = document.querySelector('#citas-del-dia');
    this._listaCitasDelDia = document.querySelector('#lista-citas-del-dia');
    this._bindEventos();
  }

  actualizarTituloModal(esReprogramacion) {
    if (!this._tituloModal || !this._textoConf) return;
    this._tituloModal.textContent = esReprogramacion ? 'Confirmar Reprogramación' : 'Confirmar Reserva';
    this._textoConf.textContent = esReprogramacion ? '¿Deseas reprogramar tu cita a este nuevo horario?' : '¿Deseas confirmar esta cita?';
  }

  _bindEventos() {
    document.getElementById('btn-mes-anterior')?.addEventListener('click', () =>
      document.dispatchEvent(new CustomEvent('paciente:calendarioNavegado', { detail: { direccion: -1 } })),
    );
    document.getElementById('btn-mes-siguiente')?.addEventListener('click', () =>
      document.dispatchEvent(new CustomEvent('paciente:calendarioNavegado', { detail: { direccion: 1 } })),
    );
    document.getElementById('btn-cerrar-modal')?.addEventListener('click', () =>
      document.dispatchEvent(new CustomEvent('paciente:reservaCerrarModalSolicitado')),
    );
    document.getElementById('btn-confirmar-reserva')?.addEventListener('click', () =>
      document.dispatchEvent(new CustomEvent('paciente:reservaConfirmarSolicitada')),
    );
    document.getElementById(Configuracion.IDS_MODALES.RESERVA)?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) document.dispatchEvent(new CustomEvent('paciente:reservaCerrarModalSolicitado'));
    });
  }

  _suscribirEventos() {
    document.addEventListener('paciente:calendarioRenderizar', (e) => this._renderizarMes(e.detail));
    document.addEventListener('paciente:bloquesDisponibles', (e) => this._renderizarBloques(e.detail));
    document.addEventListener('paciente:bloqueReservado', (e) => this._mostrarModalReserva(e.detail));
    document.addEventListener('paciente:bloqueNoDisponible', (e) =>
      document.dispatchEvent(new CustomEvent('paciente:fechaSeleccionadaRecargar', { detail: e.detail })),
    );
    document.addEventListener('paciente:reservaCerrarModal', (e) => {
      GestorModales.cerrar(Configuracion.IDS_MODALES.RESERVA);
      if (e.detail?.fecha) document.dispatchEvent(new CustomEvent('paciente:fechaSeleccionadaRecargar', { detail: e.detail }));
    });
    document.addEventListener('paciente:reservaConfirmada', (e) => {
      GestorModales.cerrar(Configuracion.IDS_MODALES.RESERVA);
      if (e.detail?.fecha) document.dispatchEvent(new CustomEvent('paciente:fechaSeleccionadaRecargar', { detail: e.detail }));
    });
    document.addEventListener('paciente:reservaError', (e) => {
      if (e.detail?.fecha) document.dispatchEvent(new CustomEvent('paciente:fechaSeleccionadaRecargar', { detail: e.detail }));
    });
    document.addEventListener('paciente:reprogramacionIniciada', () => this._bannerReprogramacion(true));
    document.addEventListener('paciente:reprogramacionCancelada', () => this._bannerReprogramacion(false));
    document.addEventListener('paciente:cancelacionConfirmada', () =>
      document.dispatchEvent(new CustomEvent('paciente:calendarioRefrescar')),
    );
    document.addEventListener('paciente:modalCancelacionAbrir', () =>
      GestorModales.abrir(Configuracion.IDS_MODALES.CANCELACION),
    );
  }

  _renderizarMes({ anio, mes, disponibilidad, citasPorFecha }) {
    if (!this._tituloMes || !this._contenedor) return;
    this._tituloMes.textContent = `${MESES[mes]} ${anio}`;

    const primerDia = new Date(anio, mes, 1);
    const diasEnMes = new Date(anio, mes + 1, 0).getDate();
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);

    let html = '';
    for (let i = 0; i < primerDia.getDay(); i++) {
      html += '<button class="calendario__dia calendario__dia--vacio" disabled></button>';
    }
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fechaDia = new Date(anio, mes, dia); fechaDia.setHours(0, 0, 0, 0);
      const fechaISO = FormateadorFecha.aISO(fechaDia);
      const esPasado = fechaDia < hoy;
      let clases = 'calendario__dia';
      if (fechaDia.getTime() === hoy.getTime()) clases += ' calendario__dia--hoy';
      if (esPasado) clases += ' calendario__dia--pasado';
      if (!disponibilidad[fechaISO] && !esPasado) clases += ' calendario__dia--sin-disponibilidad';
      if (citasPorFecha[fechaISO]) clases += ' calendario__dia--con-cita';
      html += `<button class="${clases}" data-fecha="${fechaISO}"${esPasado ? ' disabled' : ''}>${dia}</button>`;
    }

    this._contenedor.innerHTML = html;
    this._contenedor.querySelectorAll('.calendario__dia:not(.calendario__dia--vacio):not(.calendario__dia--pasado)').forEach((dia) => {
      dia.addEventListener('click', () => {
        this._contenedor.querySelectorAll('.calendario__dia').forEach((d) => d.classList.remove('calendario__dia--seleccionado'));
        dia.classList.add('calendario__dia--seleccionado');
        document.dispatchEvent(new CustomEvent('paciente:fechaSeleccionada', { detail: { fecha: dia.dataset.fecha } }));
      });
    });
  }

  _renderizarBloques({ bloques, fecha, psicologoId, citasDelDia }) {
    if (!this._seccionHorarios) return;
    this._seccionHorarios.classList.remove('horarios--oculto');
    this._listaHorarios.innerHTML = '<p class="cargando">Cargando horarios...</p>';
    this._renderizarCitasDelDia(citasDelDia);
    if (this._fechaSelectEl) this._fechaSelectEl.textContent = FormateadorFecha.aTextoCorto(new Date(fecha + 'T00:00:00'));

    if (!bloques.length) {
      this._listaHorarios.innerHTML = '';
      this._vacio?.classList.remove('horarios__vacio--oculto');
      if (this._contenedorEspera) {
        this._contenedorEspera.classList.remove('lista-espera--oculta');
        this._bindEventoListaEspera(fecha, psicologoId);
      }
      return;
    }

    this._vacio?.classList.add('horarios__vacio--oculto');
    this._contenedorEspera?.classList.add('lista-espera--oculta');

    this._listaHorarios.innerHTML = bloques.map((b) => {
      const noDisp = b.estado === 'bloqueado_temporal' || b.estado === 'reservado';
      return `<button class="horarios__boton${noDisp ? ' horarios__boton--bloqueado' : ''}" data-bloque-id="${b.id}"${noDisp ? ' disabled' : ''}>${FormateadorHora.formatear(b.hora_inicio)}</button>`;
    }).join('');

    this._listaHorarios.querySelectorAll('.horarios__boton:not(.horarios__boton--bloqueado)').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._listaHorarios.querySelectorAll('.horarios__boton').forEach((b) => b.classList.remove('horarios__boton--seleccionado'));
        btn.classList.add('horarios__boton--seleccionado');
        document.dispatchEvent(new CustomEvent('paciente:bloqueSeleccionado', {
          detail: { bloqueId: btn.dataset.bloqueId, fecha, hora: btn.textContent },
        }));
      });
    });
  }

  _mostrarModalReserva({ bloqueId, fecha }) {
    const btn = this._listaHorarios?.querySelector(`[data-bloque-id="${bloqueId}"]`);
    if (this._resumenHora && btn) this._resumenHora.textContent = btn.textContent;
    if (this._resumenFecha) this._resumenFecha.textContent = FormateadorFecha.aTexto(new Date(fecha + 'T00:00:00'));
    GestorModales.abrir(Configuracion.IDS_MODALES.RESERVA);
  }

  _bindEventoListaEspera(fecha, psicologoId) {
    if (!this._btnEspera) return;
    const clon = this._btnEspera.cloneNode(true);
    this._btnEspera.parentNode.replaceChild(clon, this._btnEspera);
    this._btnEspera = clon;
    this._btnEspera.addEventListener('click', () => {
      const fechaFormato = FormateadorFecha.aTexto(new Date(fecha + 'T00:00:00'));
      document.dispatchEvent(new CustomEvent('paciente:listaEsperaSolicitada', { detail: { fecha, fechaFormato, psicologoId } }));
    });
  }

  _renderizarCitasDelDia(citasDelDia) {
    if (!this._citasDelDia) return;
    if (!citasDelDia?.length) { this._citasDelDia.classList.add('citas-del-dia--oculto'); return; }
    this._citasDelDia.classList.remove('citas-del-dia--oculto');
    this._listaCitasDelDia.innerHTML = citasDelDia.map((c) => {
      if (!c.bloques_horario) return '';
      return `<div class="cita-item"><div class="cita-item__contenido"><p class="cita-item__hora">${FormateadorHora.formatear(c.bloques_horario.hora_inicio)}</p><p class="cita-item__psicologo">Con ${c.psicologo?.usuario?.nombre || 'Psicólogo'}</p></div><span class="cita-item__estado">${c.estado}</span></div>`;
    }).join('');
  }

  _bannerReprogramacion(visible) {
    const banner = document.querySelector('#banner-reprogramacion');
    if (!banner) return;
    banner.classList.toggle('banner-reprogramacion--oculto', !visible);
    if (visible) {
      const texto = document.querySelector('#texto-reprogramacion');
      if (texto) texto.textContent = 'Selecciona un nuevo día y horario para reprogramar tu cita';
    }
  }
}
