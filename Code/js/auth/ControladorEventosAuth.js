class ControladorEventosAuth {
  static #SELECTORS = {
    btnMostrarRegistro: '#btn-mostrar-registro',
    btnMostrarLogin: '#btn-mostrar-login',
    formularioLogin: '#formulario-login',
    formularioRegistro: '#formulario-registro',
    correoLogin: '#correo-login',
    contrasenaLogin: '#contrasena-login',
    nombreRegistro: '#nombre-registro',
    apellidoRegistro: '#apellido-registro',
    correoRegistro: '#correo-registro',
    telefonoRegistro: '#telefono-registro',
    contrasenaRegistro: '#contrasena-registro',
    tipoCuenta: 'input[name="tipo-cuenta"]:checked',
  };

  static inicializar() {
    this.#configurarEventosCambioFormulario();
    this.#configurarEventosFormularios();
  }

  static #configurarEventosCambioFormulario() {
    const btnRegistro = document.querySelector(
      this.#SELECTORS.btnMostrarRegistro,
    );
    const btnLogin = document.querySelector(this.#SELECTORS.btnMostrarLogin);

    btnRegistro?.addEventListener('click', (e) => {
      e.preventDefault();
      GestorFormularios.mostrarRegistro();
    });

    btnLogin?.addEventListener('click', (e) => {
      e.preventDefault();
      GestorFormularios.mostrarLogin();
    });
  }

  static #configurarEventosFormularios() {
    const formularioLogin = document.querySelector(
      this.#SELECTORS.formularioLogin,
    );
    const formularioRegistro = document.querySelector(
      this.#SELECTORS.formularioRegistro,
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
    const correo = document.querySelector(this.#SELECTORS.correoLogin).value;
    const contrasena = document.querySelector(
      this.#SELECTORS.contrasenaLogin,
    ).value;
    ServicioAutenticacion.iniciarSesion(correo, contrasena);
  }

  static #manejarRegistro() {
    const tipoSeleccionado = document.querySelector(this.#SELECTORS.tipoCuenta);
    const datos = {
      nombre: document.querySelector(this.#SELECTORS.nombreRegistro).value,
      apellido: document.querySelector(this.#SELECTORS.apellidoRegistro).value,
      correo: document.querySelector(this.#SELECTORS.correoRegistro).value,
      telefono: document.querySelector(this.#SELECTORS.telefonoRegistro).value,
      contrasena: document.querySelector(this.#SELECTORS.contrasenaRegistro)
        .value,
      tipoCuenta: tipoSeleccionado ? tipoSeleccionado.value : 'paciente',
    };
    ServicioAutenticacion.registrar(datos);
  }
}
