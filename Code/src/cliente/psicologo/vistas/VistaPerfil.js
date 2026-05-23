import { GestorModales } from '../../compartido/gestores/GestorModales.js';
import { Configuracion } from '../../compartido/config/Configuracion.js';

export class VistaPerfilPsicologo {
  constructor() { this._suscribirEventos(); }
  inicializar() { this._bindEventos(); }

  _bindEventos() {
    document.getElementById('btn-cambiar-contrasena')?.addEventListener('click', () =>
      GestorModales.abrir(Configuracion.IDS_MODALES.PASSWORD),
    );
    document.getElementById('btn-cerrar-modal-contrasena')?.addEventListener('click', () =>
      GestorModales.cerrar(Configuracion.IDS_MODALES.PASSWORD),
    );
    document.getElementById('btn-guardar-contrasena')?.addEventListener('click', () =>
      document.dispatchEvent(new CustomEvent('psicologo:perfilPasswordGuardar', {
        detail: {
          nueva: document.getElementById('nueva-contrasena')?.value,
          confirmar: document.getElementById('confirmar-contrasena')?.value,
        },
      })),
    );
    document.getElementById('btn-cerrar-sesion-perfil')?.addEventListener('click', () => {
      if (confirm('¿Deseas cerrar sesión?')) document.dispatchEvent(new CustomEvent('psicologo:sesionCerrar'));
    });
  }

  _suscribirEventos() {
    document.addEventListener('psicologo:perfilCargado', (e) => this._renderizar(e.detail.usuario));
    document.addEventListener('psicologo:passwordActualizado', () => GestorModales.cerrar(Configuracion.IDS_MODALES.PASSWORD));
  }

  _renderizar(usuario) {
    if (!usuario?.psicologos) return;
    const el = (id) => document.getElementById(id);
    if (el('perfil-nombre')) el('perfil-nombre').textContent = usuario.psicologos.nombre || '—';
    if (el('perfil-apellido')) el('perfil-apellido').textContent = usuario.psicologos.apellido || '—';
    if (el('perfil-correo')) el('perfil-correo').textContent = usuario.email || '—';
  }
}
