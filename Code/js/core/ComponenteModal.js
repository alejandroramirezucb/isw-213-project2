class ComponenteModal extends ComponenteBase {
  #modalId = null;
  #botonesOpen = [];
  #botonesClose = [];
  #formulario = null;

  constructor(modalId, selectoresControles = {}) {
    super(selectoresControles);
    this.#modalId = modalId;
  }

  inicializar() {
    const modal = this.obtenerElementoPorId(this.#modalId);
    if (!modal) return false;

    this.#configurarCierreEnExterno();
    return true;
  }

  agregarBotonesAbrir(selectores = []) {
    selectores.forEach((selector) => {
      const botones = document.querySelectorAll(selector);
      botones.forEach((boton) => {
        this.#botonesOpen.push(boton);
        boton.addEventListener('click', () => this.abrir());
      });
    });
  }

  agregarBotonesCerrar(selectores = []) {
    selectores.forEach((selector) => {
      const botones = document.querySelectorAll(selector);
      botones.forEach((boton) => {
        this.#botonesClose.push(boton);
        boton.addEventListener('click', () => this.cerrar());
      });
    });
  }

  agregarFormulario(formularioSelector) {
    this.#formulario = document.querySelector(formularioSelector);
    if (this.#formulario) {
      this.#formulario.addEventListener('submit', (e) => {
        e.preventDefault();
      });
    }
  }

  #configurarCierreEnExterno() {
    const modal = this.obtenerElementoPorId(this.#modalId);
    if (!modal) return;

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.cerrar();
      }
    });
  }

  abrir() {
    GestorModales.abrir(this.#modalId);
    this.#formulario?.reset();
    this.limpiarErrores();
  }

  cerrar() {
    GestorModales.cerrar(this.#modalId);
    this.resetearFormulario(this.#formulario);
  }

  estaAbierto() {
    return GestorModales.estaAbierto(this.#modalId);
  }

  toggle() {
    GestorModales.toggle(this.#modalId);
  }

  resetearFormulario(formulario) {
    formulario?.reset();
  }

  limpiarErrores() {
    if (this.#formulario) {
      Array.from(this.#formulario.elements).forEach((elemento) => {
        elemento.setAttribute('aria-invalid', 'false');
      });
    }
  }

  obtenerFormulario() {
    return this.#formulario;
  }

  obtenerId() {
    return this.#modalId;
  }
}
