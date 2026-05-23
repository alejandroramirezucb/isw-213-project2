import { GestorModales } from '../../compartido/gestores/GestorModales.js';
import { Configuracion } from '../../compartido/config/Configuracion.js';
import { FormateadorFecha } from '../../compartido/formateadores/FormateadorFecha.js';
import { FormateadorHora } from '../../compartido/formateadores/FormateadorHora.js';

export class VistaHistorial {
  constructor() { this._suscribirEventos(); }
  inicializar() { this._bindEventos(); }

  _bindEventos() {
    document.getElementById('busqueda-paciente')?.addEventListener('input', (e) =>
      document.dispatchEvent(new CustomEvent('psicologo:historialBuscar', { detail: { busqueda: e.target.value } })),
    );
    document.getElementById('btn-cerrar-historial-paciente')?.addEventListener('click', () =>
      GestorModales.cerrar(Configuracion.IDS_MODALES.HISTORIAL_PACIENTE),
    );
  }

  _suscribirEventos() {
    document.addEventListener('psicologo:historialCargado', (e) => this._renderizar(e.detail.historial));
    document.addEventListener('psicologo:bloqueoActualizado', () => {
      const busqueda = document.getElementById('busqueda-paciente')?.value || '';
      document.dispatchEvent(new CustomEvent('psicologo:historialBuscar', { detail: { busqueda } }));
    });
  }

  _renderizar(historial) {
    const lista = document.getElementById('lista-historial');
    const vacio = document.getElementById('sin-historial');
    if (!lista || !vacio) return;
    if (!historial.length) { lista.innerHTML = ''; vacio.classList.remove('mensaje-vacio--oculto'); return; }
    vacio.classList.add('mensaje-vacio--oculto');

    lista.innerHTML = historial.map((item) => {
      const total = item.citas.length;
      const completadas = item.citas.filter((c) => c.estado === 'completada').length;
      const canceladas = item.citas.filter((c) => c.estado === 'cancelada').length;
      return `<article class="historial-paciente${item.paciente.bloqueado ? ' historial-paciente--bloqueado' : ''}">
        <div class="historial-paciente__info">
          <span class="historial-paciente__nombre">${item.paciente.nombre} ${item.paciente.apellido}</span>
          <span class="historial-paciente__correo">${item.paciente.correo}</span>
          ${item.paciente.bloqueado ? '<span class="historial-paciente__estado">Bloqueado</span>' : ''}
        </div>
        <div class="historial-paciente__resumen">
          <span>${total} citas</span>
          <span class="historial-paciente__completadas">${completadas} completadas</span>
          <span class="historial-paciente__canceladas">${canceladas} canceladas</span>
        </div>
        <div class="historial-paciente__acciones">
          <button class="boton boton--secundario boton--pequeno btn-ver-historial" data-paciente-id="${item.paciente.id}">Ver historial</button>
          <button class="boton boton--pequeno ${item.paciente.bloqueado ? 'boton--primario' : 'boton--peligro'} btn-toggle-bloqueo" data-paciente-id="${item.paciente.id}" data-bloqueado="${item.paciente.bloqueado}">
            ${item.paciente.bloqueado ? 'Desbloquear' : 'Bloquear'}
          </button>
        </div>
      </article>`;
    }).join('');

    lista.querySelectorAll('.btn-ver-historial').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = historial.find((h) => h.paciente.id === btn.dataset.pacienteId);
        if (item) this._mostrarDetalle(item);
      });
    });
    lista.querySelectorAll('.btn-toggle-bloqueo').forEach((btn) => {
      btn.addEventListener('click', () => {
        btn.disabled = true;
        const bloqueado = btn.dataset.bloqueado === 'true';
        btn.textContent = bloqueado ? 'Desbloqueando...' : 'Bloqueando...';
        document.dispatchEvent(new CustomEvent('psicologo:toggleBloqueo', {
          detail: { pacienteId: btn.dataset.pacienteId, bloqueadoActual: bloqueado },
        }));
      });
    });
  }

  _mostrarDetalle(item) {
    GestorModales.abrir(Configuracion.IDS_MODALES.HISTORIAL_PACIENTE);
    const nombreEl = document.getElementById('historial-nombre-paciente');
    if (nombreEl) nombreEl.textContent = `${item.paciente.nombre} ${item.paciente.apellido}`;
    const listaEl = document.getElementById('lista-historial-paciente');
    if (!listaEl) return;
    listaEl.innerHTML = item.citas.length === 0
      ? '<p style="text-align:center;color:var(--texto-sec)">Sin citas registradas</p>'
      : item.citas.map((c) => {
          const estadoClase = `cita-item__estado--${c.estado}`;
          return `<div class="cita-item">
            <div class="cita-item__info">
              <span class="cita-item__fecha">${FormateadorFecha.aTextoCorto(new Date(c.fecha + 'T00:00:00'))}</span>
              <span class="cita-item__hora">${FormateadorHora.formatear(c.hora)}</span>
            </div>
            <span class="cita-item__estado ${estadoClase}">${c.estado.charAt(0).toUpperCase() + c.estado.slice(1)}</span>
          </div>`;
        }).join('');
    const btnDescargar = document.getElementById('btn-descargar-historial');
    if (btnDescargar) btnDescargar.onclick = () =>
      document.dispatchEvent(new CustomEvent('psicologo:descargarHistorial', { detail: { item } }));
  }
}
