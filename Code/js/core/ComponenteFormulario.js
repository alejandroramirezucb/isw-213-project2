class ComponenteFormulario extends ComponenteBase {
  constructor(selectoresFormulario = {}) {
    super(selectoresFormulario);
    this.formulario = null;
    this.validadores = {};
    this.manejadores = {};
  }

  inicializar(formularioSelector) {
    this.formulario = document.querySelector(formularioSelector);
    if (!this.formulario) return false;

    this.#configurarSubmit();
    return true;
  }

  #configurarSubmit() {
    if (this.formulario) {
      this.formulario.addEventListener('submit', (e) => {
        e.preventDefault();
        this.validarYEnviar();
      });
    }
  }

  agregarValidador(campo, validador) {
    this.validadores[campo] = validador;
  }

  agregarManejador(campo, evento, manejador) {
    if (!this.manejadores[campo]) {
      this.manejadores[campo] = {};
    }
    this.manejadores[campo][evento] = manejador;
  }

  configurarEventos() {
    Object.entries(this.manejadores).forEach(([campo, eventos]) => {
      const elemento = this.obtenerElemento(campo);
      if (!elemento) return;

      Object.entries(eventos).forEach(([evento, manejador]) => {
        elemento.addEventListener(evento, manejador.bind(this));
      });
    });
  }

  obtenerValores() {
    const valores = {};

    if (!this.formulario) return valores;

    Array.from(this.formulario.elements).forEach((elemento) => {
      if (elemento.name) {
        if (
          elemento.type === 'radio' ||
          elemento.type === 'checkbox'
        ) {
          if (elemento.type === 'radio') {
            if (elemento.checked) {
              valores[elemento.name] = elemento.value;
            }
          } else if (elemento.checked) {
            valores[elemento.name] = elemento.value;
          }
        } else {
          valores[elemento.name] = elemento.value;
        }
      }
    });

    return valores;
  }

  establecerValores(valores = {}) {
    Object.entries(valores).forEach(([name, value]) => {
      const elemento = this.formulario?.querySelector(`[name="${name}"]`);
      if (!elemento) return;

      if (elemento.type === 'radio' || elemento.type === 'checkbox') {
        elemento.checked = elemento.value === value;
      } else {
        elemento.value = value;
      }
    });
  }

  validarCampo(campo) {
    if (!this.validadores[campo]) return true;

    const elemento = this.obtenerElemento(campo);
    const valor = elemento?.value || '';

    return this.validadores[campo](valor);
  }

  validar() {
    const errores = {};

    Object.keys(this.validadores).forEach((campo) => {
      const resultado = this.validarCampo(campo);
      if (resultado !== true) {
        errores[campo] = resultado;
      }
    });

    return Object.keys(errores).length === 0 ? null : errores;
  }

  async validarYEnviar() {
    const errores = this.validar();

    if (errores) {
      this.#mostrarErrores(errores);
      return;
    }

    const valores = this.obtenerValores();
    const enviar = this.manejadores.enviar;

    if (enviar) {
      await enviar.call(this, valores);
    }
  }

  #mostrarErrores(errores) {
    Object.entries(errores).forEach(([campo, mensaje]) => {
      const elemento = this.obtenerElemento(campo);
      if (elemento) {
        elemento.setAttribute('aria-invalid', 'true');
        elemento.setAttribute('title', mensaje);
      }
    });
  }

  resetear() {
    this.formulario?.reset();
  }

  limpiarErrores() {
    if (!this.formulario) return;

    Array.from(this.formulario.elements).forEach((elemento) => {
      elemento.setAttribute('aria-invalid', 'false');
      elemento.removeAttribute('title');
    });
  }
}
