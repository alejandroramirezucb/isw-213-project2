class ControladorEventosAuth {
  static inicializar() {
    this.#configurarEventosCambioFormulario();
    this.#configurarEventosFormularios();
  }

  static #configurarEventosCambioFormulario() {
    setTimeout(() => {
      const btnRegistro = document.querySelector(
        Configuracion.SELECTORES_AUTENTICACION.BOTON_MOSTRAR_REGISTRO,
      );
      const btnLogin = document.querySelector(
        Configuracion.SELECTORES_AUTENTICACION.BOTON_MOSTRAR_LOGIN,
      );

      if (btnRegistro) {
        btnRegistro.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          GestorFormularios.mostrarRegistro();
          return false;
        });
      }

      if (btnLogin) {
        btnLogin.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          GestorFormularios.mostrarLogin();
          return false;
        });
      }
    }, 0);
  }

  static #configurarEventosFormularios() {
    const formularioLogin = document.querySelector(
      Configuracion.SELECTORES_AUTENTICACION.FORMULARIO_LOGIN,
    );
    const formularioRegistro = document.querySelector(
      Configuracion.SELECTORES_AUTENTICACION.FORMULARIO_REGISTRO,
    );

    formularioLogin?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.#manejarLogin();
    });

    formularioRegistro?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.#manejarRegistro();
    });
  }

  static #manejarLogin() {
    const correo = document.querySelector(
      Configuracion.SELECTORES_AUTENTICACION.CORREO_LOGIN,
    ).value;
    const password = document.querySelector(
      Configuracion.SELECTORES_AUTENTICACION.PASSWORD_LOGIN,
    ).value;
    ServicioAutenticacion.iniciarSesion(correo, password);
  }

  static #manejarRegistro() {
    const tipoSeleccionado = document.querySelector(
      Configuracion.SELECTORES_AUTENTICACION.TIPO_CUENTA,
    );
    const sel = Configuracion.SELECTORES_AUTENTICACION;
    const datos = {
      nombre: document.querySelector(sel.NOMBRE_REGISTRO).value,
      apellido: document.querySelector(sel.APELLIDO_REGISTRO).value,
      correo: document.querySelector(sel.CORREO_REGISTRO).value,
      telefono: document.querySelector(sel.TELEFONO_REGISTRO).value,
      password: document.querySelector(sel.PASSWORD_REGISTRO).value,
      tipoCuenta: tipoSeleccionado ? tipoSeleccionado.value : 'paciente',
    };
    ServicioAutenticacion.registrar(datos);
  }
}
