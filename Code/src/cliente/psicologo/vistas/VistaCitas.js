import { GestorModales } from '../../compartido/gestores/GestorModales.js';
import { Configuracion } from '../../compartido/config/Configuracion.js';
import { FormateadorFecha } from '../../compartido/formateadores/FormateadorFecha.js';
import { FormateadorHora } from '../../compartido/formateadores/FormateadorHora.js';

const NOMBRES_MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export class VistaCitasPsicologo {
  constructor() {
    this._fechaCalendario = new Date();
    this._contenedorCalendario = null;
    this._tituloMes = null;
    this._citasDelMes = {};
    this._suscribirEventos();
  }

  inicializar() {
    this._contenedorCalendario = document.querySelector('#calendario-dias');
    this._tituloMes = document.querySelector('#calendario-mes');
    this._bindEventos();
  }

  _bindEventos() {
    document.querySelectorAll('.periodo__boton').forEach((boton) => {
      boton.addEventListener('click', () => {
        document.querySelectorAll('.periodo__boton').forEach((b) =>
          b.classList.remove(Configuracion.CLASES_CSS.PERIODO_ACTIVO),
        );
        boton.classList.add(Configuracion.CLASES_CSS.PERIODO_ACTIVO);
        document.dispatchEvent(new CustomEvent('psicologo:periodoCambiado', {
          detail: { periodo: boton.dataset.periodo },
        }));
      });
    });

    document.getElementById('btn-cerrar-detalle')?.addEventListener('click', () =>
      GestorModales.cerrar(Configuracion.IDS_MODALES.DETALLE_CITA),
    );

    document.getElementById('btn-cancelar-cita-psicologo')?.addEventListener('click', () =>
      document.dispatchEvent(new CustomEvent('psicologo:cancelarCitaSolicitada')),
    );

    document.getElementById('btn-mes-anterior')?.addEventListener('click', () => {
      this._fechaCalendario.setMonth(this._fechaCalendario.getMonth() - 1);
      document.dispatchEvent(new CustomEvent('psicologo:calendarioNavegado', {
        detail: { fecha: new Date(this._fechaCalendario) },
      }));
    });

    document.getElementById('btn-mes-siguiente')?.addEventListener('click', () => {
      this._fechaCalendario.setMonth(this._fechaCalendario.getMonth() + 1);
      document.dispatchEvent(new CustomEvent('psicologo:calendarioNavegado', {
        detail: { fecha: new Date(this._fechaCalendario) },
      }));
    });
  }

  _suscribirEventos() {
    document.addEventListener('psicologo:citasCargadas', (evento) => {
      this._renderizarListaCitas(evento.detail.citas, evento.detail.periodo, evento.detail.fechas);
      this._sincronizarCalendarioConCitas(evento.detail.citas);
    });

    document.addEventListener('psicologo:citasMesCargadas', (evento) => {
      this._citasDelMes = this._agruparCitasPorFecha(evento.detail.citas);
      this._fechaCalendario = new Date(evento.detail.anio, evento.detail.mes, 1);
      this._renderizarCalendario(evento.detail.anio, evento.detail.mes);
    });

    document.addEventListener('psicologo:detalleAbierto', (evento) =>
      this._mostrarDetalleCita(evento.detail.cita),
    );

    document.addEventListener('psicologo:citaCancelada', () =>
      GestorModales.cerrar(Configuracion.IDS_MODALES.DETALLE_CITA),
    );
  }

  _renderizarListaCitas(citas, periodo, fechas) {
    const listaCitas = document.getElementById('lista-citas-panel');
    const mensajeSinCitas = document.getElementById('sin-citas-panel');
    const tituloPeriodo = document.getElementById('titulo-periodo');
    const fechaActualEl = document.getElementById('fecha-actual');
    const totalCitasEl = document.getElementById('total-citas-dia');
    const siguienteCitaEl = document.getElementById('siguiente-cita-hora');

    if (tituloPeriodo) {
      tituloPeriodo.textContent = periodo === 'semana' ? 'Citas de la Semana' : 'Citas de Hoy';
    }
    if (fechaActualEl) {
      fechaActualEl.textContent = periodo === 'semana'
        ? `${FormateadorFecha.aTextoCorto(new Date(fechas.inicio + 'T00:00:00'))} - ${FormateadorFecha.aTextoCorto(new Date(fechas.fin + 'T00:00:00'))}`
        : FormateadorFecha.aTextoCorto(new Date());
    }
    if (totalCitasEl) totalCitasEl.textContent = citas.length;
    if (siguienteCitaEl) {
      siguienteCitaEl.textContent = citas.length > 0
        ? `${FormateadorFecha.aTextoCorto(new Date(citas[0].bloques_horario.fecha + 'T00:00:00'))} - ${FormateadorHora.formatear(citas[0].bloques_horario.hora_inicio)}`
        : '--:--';
    }

    if (!listaCitas || !mensajeSinCitas) return;
    if (!citas.length) {
      listaCitas.innerHTML = '';
      mensajeSinCitas.classList.remove('mensaje-vacio--oculto');
      return;
    }
    mensajeSinCitas.classList.add('mensaje-vacio--oculto');

    listaCitas.innerHTML = citas.map((cita) => `
      <article class="cita-item" data-cita-id="${cita.id}">
        <div class="cita-item__info">
          <span class="cita-item__fecha">${FormateadorFecha.aTextoCorto(new Date(cita.bloques_horario.fecha + 'T00:00:00'))}</span>
          <span class="cita-item__hora">${FormateadorHora.formatear(cita.bloques_horario.hora_inicio)}</span>
          <span class="cita-item__paciente">${cita.pacientes.nombre} ${cita.pacientes.apellido}</span>
        </div>
        <span class="cita-item__estado cita-item__estado--confirmada">Confirmada</span>
      </article>`).join('');

    listaCitas.querySelectorAll('.cita-item').forEach((elemento) => {
      elemento.addEventListener('click', () =>
        document.dispatchEvent(new CustomEvent('psicologo:citaClickeada', {
          detail: { citaId: elemento.dataset.citaId },
        })),
      );
    });
  }

  _sincronizarCalendarioConCitas(citas) {
    const anio = this._fechaCalendario.getFullYear();
    const mes = this._fechaCalendario.getMonth();
    this._citasDelMes = this._agruparCitasPorFecha(citas);
    this._tituloMes.textContent = `${NOMBRES_MESES[mes]} ${anio}`;
    this._renderizarCalendario(anio, mes);
  }

  _renderizarCalendario(anio, mes) {
    if (!this._contenedorCalendario) return;
    if (this._tituloMes) this._tituloMes.textContent = `${NOMBRES_MESES[mes]} ${anio}`;

    const primerDiaDelMes = new Date(anio, mes, 1);
    const diasEnMes = new Date(anio, mes + 1, 0).getDate();
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);

    let html = '';
    for (let posicionDia = 0; posicionDia < primerDiaDelMes.getDay(); posicionDia++) {
      html += '<button class="calendario__dia calendario__dia--vacio" disabled></button>';
    }
    for (let numeroDia = 1; numeroDia <= diasEnMes; numeroDia++) {
      const fechaDia = new Date(anio, mes, numeroDia); fechaDia.setHours(0, 0, 0, 0);
      const fechaISO = FormateadorFecha.aISO(fechaDia);
      let clases = 'calendario__dia';
      if (fechaDia.getTime() === hoy.getTime()) clases += ' calendario__dia--hoy';
      if (this._citasDelMes[fechaISO]?.length) clases += ' calendario__dia--con-citas';
      html += `<button class="${clases}" data-fecha="${fechaISO}">${numeroDia}</button>`;
    }

    this._contenedorCalendario.innerHTML = html;
    this._contenedorCalendario.querySelectorAll('.calendario__dia--con-citas').forEach((botonDia) => {
      botonDia.addEventListener('click', () =>
        document.dispatchEvent(new CustomEvent('psicologo:diaCalendarioClickeado', {
          detail: { citasDelDia: this._citasDelMes[botonDia.dataset.fecha] || [] },
        })),
      );
    });
  }

  _agruparCitasPorFecha(citas) {
    const citasPorFecha = {};
    citas.forEach((cita) => {
      const fecha = cita.bloques_horario?.fecha;
      if (!fecha) return;
      if (!citasPorFecha[fecha]) citasPorFecha[fecha] = [];
      citasPorFecha[fecha].push(cita);
    });
    return citasPorFecha;
  }

  _mostrarDetalleCita(cita) {
    const obtenerElemento = (id) => document.getElementById(id);
    if (obtenerElemento('detalle-paciente')) obtenerElemento('detalle-paciente').textContent = `${cita.pacientes.nombre} ${cita.pacientes.apellido}`;
    if (obtenerElemento('detalle-correo')) obtenerElemento('detalle-correo').textContent = cita.pacientes.correo;
    if (obtenerElemento('detalle-telefono')) obtenerElemento('detalle-telefono').textContent = cita.pacientes.telefono || 'No registrado';
    if (obtenerElemento('detalle-fecha')) obtenerElemento('detalle-fecha').textContent = FormateadorFecha.aTexto(new Date(cita.bloques_horario.fecha + 'T00:00:00'));
    if (obtenerElemento('detalle-hora')) obtenerElemento('detalle-hora').textContent = `${FormateadorHora.formatear(cita.bloques_horario.hora_inicio)} - ${FormateadorHora.formatear(cita.bloques_horario.hora_fin)}`;
    if (obtenerElemento('detalle-estado')) obtenerElemento('detalle-estado').textContent = cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1);
    GestorModales.abrir(Configuracion.IDS_MODALES.DETALLE_CITA);
  }
}
