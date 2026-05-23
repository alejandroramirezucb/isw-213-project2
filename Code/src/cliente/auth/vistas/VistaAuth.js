import { Configuracion } from '../../compartido/config/Configuracion.js';

export class VistaAuth {
  constructor() {
    this._seccionLogin = document.querySelector(Configuracion.SELECTORES_AUTH.SECCION_LOGIN);
    this._seccionRegistro = document.querySelector(Configuracion.SELECTORES_AUTH.SECCION_REGISTRO);
    this._contenedorMensaje = document.querySelector(Configuracion.SELECTORES_MENSAJES.CONTENEDOR);
    this._temporizador = null;
    this._bindEventos();
    this._suscribirEventos();
  }

  _bindEventos() {
    const sel = Configuracion.SELECTORES_AUTH;

    document.querySelector(sel.BOTON_MOSTRAR_REGISTRO)?.addEventListener('click', (e) => {
      e.preventDefault();
      this._mostrarRegistro();
    });

    document.querySelector(sel.BOTON_MOSTRAR_LOGIN)?.addEventListener('click', (e) => {
      e.preventDefault();
      this._mostrarLogin();
    });

    document.querySelector(sel.FORMULARIO_LOGIN)?.addEventListener('submit', (e) => {
      e.preventDefault();
      document.dispatchEvent(new CustomEvent('auth:loginEnviado', {
        detail: {
          correo: document.querySelector(sel.CORREO_LOGIN).value,
          password: document.querySelector(sel.PASSWORD_LOGIN).value,
        },
      }));
    });

    document.querySelector(sel.FORMULARIO_REGISTRO)?.addEventListener('submit', (e) => {
      e.preventDefault();
      const tipoCuenta = document.querySelector(sel.TIPO_CUENTA);
      document.dispatchEvent(new CustomEvent('auth:registroEnviado', {
        detail: {
          nombre: document.querySelector(sel.NOMBRE_REGISTRO).value,
          apellido: document.querySelector(sel.APELLIDO_REGISTRO).value,
          correo: document.querySelector(sel.CORREO_REGISTRO).value,
          telefono: document.querySelector(sel.TELEFONO_REGISTRO).value,
          password: document.querySelector(sel.PASSWORD_REGISTRO).value,
          tipoCuenta: tipoCuenta?.value ?? 'paciente',
        },
      }));
    });
  }

  _suscribirEventos() {
    document.addEventListener('auth:error', (e) => this._mostrarMensaje(e.detail.mensaje, 'error'));
    document.addEventListener('auth:exito', (e) => this._mostrarMensaje(e.detail.mensaje, 'exito'));
  }

  _mostrarRegistro() {
    this._seccionLogin?.classList.add(Configuracion.CLASES_CSS.ENTRADA_OCULTA);
    this._seccionRegistro?.classList.remove(Configuracion.CLASES_CSS.ENTRADA_OCULTA);
  }

  _mostrarLogin() {
    this._seccionLogin?.classList.remove(Configuracion.CLASES_CSS.ENTRADA_OCULTA);
    this._seccionRegistro?.classList.add(Configuracion.CLASES_CSS.ENTRADA_OCULTA);
  }

  _mostrarMensaje(texto, tipo) {
    const textoEl = this._contenedorMensaje?.querySelector(Configuracion.SELECTORES_MENSAJES.TEXTO);
    if (!this._contenedorMensaje || !textoEl) return;

    if (this._temporizador) clearTimeout(this._temporizador);
    this._contenedorMensaje.className = `mensaje mensaje--${tipo}`;
    textoEl.textContent = texto;

    this._temporizador = setTimeout(() => {
      this._contenedorMensaje.classList.add(Configuracion.CLASES_CSS.MENSAJE_OCULTO);
    }, Configuracion.DURACIONES.MENSAJE_AUTH);
  }
}
