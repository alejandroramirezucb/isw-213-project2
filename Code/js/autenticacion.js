class GestorMensajesAuth {
  static #contenedor = null;
  static #temporizador = null;

  static inicializar() {
    this.#contenedor = document.getElementById('mensaje-estado');
  }

  static mostrar(texto, tipo = 'info') {
    if (!this.#contenedor) this.inicializar();
    if (!this.#contenedor) return;

    const textoElemento = this.#contenedor.querySelector('.mensaje__texto');
    if (this.#temporizador) clearTimeout(this.#temporizador);

    this.#contenedor.classList.remove(
      'mensaje--oculto',
      'mensaje--exito',
      'mensaje--error',
      'mensaje--info',
    );
    this.#contenedor.classList.add(`mensaje--${tipo}`);
    textoElemento.textContent = texto;

    this.#temporizador = setTimeout(() => {
      this.#contenedor.classList.add('mensaje--oculto');
    }, 4000);
  }
}

class GestorFormularios {
  static #seccionLogin = null;
  static #seccionRegistro = null;

  static inicializar() {
    this.#seccionLogin = document.getElementById('seccion-login');
    this.#seccionRegistro = document.getElementById('seccion-registro');
  }

  static mostrarRegistro() {
    if (!this.#seccionLogin) this.inicializar();
    if (this.#seccionLogin) this.#seccionLogin.classList.add('auth--oculto');
    if (this.#seccionRegistro)
      this.#seccionRegistro.classList.remove('auth--oculto');
  }

  static mostrarLogin() {
    if (!this.#seccionLogin) this.inicializar();
    if (this.#seccionLogin) this.#seccionLogin.classList.remove('auth--oculto');
    if (this.#seccionRegistro)
      this.#seccionRegistro.classList.add('auth--oculto');
  }
}

class ServicioSesion {
  static redirigirPorRol(rol) {
    window.location.href =
      rol === 'psicologo' ? 'psicologo.html' : 'paciente.html';
  }

  static async obtenerRol(usuarioId) {
    const resultado = await clienteSupabase
      .from('usuarios_auth')
      .select('rol')
      .eq('id', usuarioId)
      .single();
    return resultado.data;
  }

  static async verificarActiva() {
    const resultado = await clienteSupabase.auth.getSession();
    if (!resultado.data.session) return;
    const usuarioAuth = await this.obtenerRol(resultado.data.session.user.id);
    if (usuarioAuth) this.redirigirPorRol(usuarioAuth.rol);
  }
}

class ServicioAutenticacion {
  static async iniciarSesion(correo, contrasena) {
    try {
      const resultado = await clienteSupabase.auth.signInWithPassword({
        email: correo,
        password: contrasena,
      });

      if (resultado.error) throw resultado.error;

      const usuarioAuth = await ServicioSesion.obtenerRol(
        resultado.data.user.id,
      );
      if (!usuarioAuth)
        throw new Error('No se encontró información del usuario');

      ServicioSesion.redirigirPorRol(usuarioAuth.rol);
    } catch (error) {
      console.error('[Login] Error:', error);
      GestorMensajesAuth.mostrar(
        `Error: ${error.message || 'No se pudo iniciar sesión'}`,
        'error',
      );
    }
  }

  static async registrar(datos) {
    try {
      const respuesta = await fetch('/api/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      const resultado = await respuesta.json();
      if (!respuesta.ok)
        throw new Error(resultado.error || 'No se pudo crear la cuenta');

      GestorMensajesAuth.mostrar(
        'Cuenta creada exitosamente. Iniciando sesión...',
        'exito',
      );
      await this.iniciarSesion(datos.correo, datos.contrasena);
    } catch (error) {
      console.error('[Registro] Error:', error);
      GestorMensajesAuth.mostrar(
        `Error: ${error.message || 'No se pudo crear la cuenta'}`,
        'error',
      );
    }
  }
}

class ControladorEventosAuth {
  static inicializar() {
    const btnMostrarRegistro = document.getElementById('btn-mostrar-registro');
    const btnMostrarLogin = document.getElementById('btn-mostrar-login');
    const formularioLogin = document.getElementById('formulario-login');
    const formularioRegistro = document.getElementById('formulario-registro');

    btnMostrarRegistro?.addEventListener('click', (e) => {
      e.preventDefault();
      GestorFormularios.mostrarRegistro();
    });

    btnMostrarLogin?.addEventListener('click', (e) => {
      e.preventDefault();
      GestorFormularios.mostrarLogin();
    });

    formularioLogin?.addEventListener('submit', (e) => {
      e.preventDefault();
      ServicioAutenticacion.iniciarSesion(
        document.getElementById('correo-login').value,
        document.getElementById('contrasena-login').value,
      );
    });

    formularioRegistro?.addEventListener('submit', (e) => {
      e.preventDefault();
      const tipoSeleccionado = document.querySelector(
        'input[name="tipo-cuenta"]:checked',
      );
      ServicioAutenticacion.registrar({
        nombre: document.getElementById('nombre-registro').value,
        apellido: document.getElementById('apellido-registro').value,
        correo: document.getElementById('correo-registro').value,
        telefono: document.getElementById('telefono-registro').value,
        contrasena: document.getElementById('contrasena-registro').value,
        tipoCuenta: tipoSeleccionado ? tipoSeleccionado.value : 'paciente',
      });
    });
  }
}

(function () {
  GestorMensajesAuth.inicializar();
  GestorFormularios.inicializar();
  ControladorEventosAuth.inicializar();
  ServicioSesion.verificarActiva();
})();
