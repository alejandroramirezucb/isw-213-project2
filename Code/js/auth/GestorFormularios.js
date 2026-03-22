class GestorFormularios {
  static #seccionLogin = null;
  static #seccionRegistro = null;

  static inicializar() {
    this.#seccionLogin = document.querySelector(
      Configuracion.SELECTORES_FORMULARIOS.SECCION_LOGIN,
    );
    this.#seccionRegistro = document.querySelector(
      Configuracion.SELECTORES_FORMULARIOS.SECCION_REGISTRO,
    );
  }

  static mostrarRegistro() {
    if (!this.#seccionLogin) this.inicializar();
    if (this.#seccionLogin) {
      this.#seccionLogin.classList.add(
        Configuracion.CLASES_CSS.OCULTO_AUTENTICACION,
      );
    }
    if (this.#seccionRegistro) {
      this.#seccionRegistro.classList.remove(
        Configuracion.CLASES_CSS.OCULTO_AUTENTICACION,
      );
    }
  }

  static mostrarLogin() {
    if (!this.#seccionLogin) this.inicializar();
    if (this.#seccionLogin) {
      this.#seccionLogin.classList.remove(
        Configuracion.CLASES_CSS.OCULTO_AUTENTICACION,
      );
    }
    if (this.#seccionRegistro) {
      this.#seccionRegistro.classList.add(
        Configuracion.CLASES_CSS.OCULTO_AUTENTICACION,
      );
    }
  }
}
