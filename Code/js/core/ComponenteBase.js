class ComponenteBase {
  constructor(selectores = {}) {
    this.selectores = selectores;
    this.elementos = new Map();
  }

  obtenerElemento(clave) {
    if (!this.elementos.has(clave)) {
      const selector = this.selectores[clave];
      if (selector) {
        const elemento = document.querySelector(selector);
        if (elemento) {
          this.elementos.set(clave, elemento);
        }
      }
    }
    return this.elementos.get(clave);
  }

  obtenerElementoPorId(id) {
    return document.getElementById(id);
  }

  obtenerTodos(selector) {
    return document.querySelectorAll(selector);
  }

  agregarClase(elemento, clase) {
    elemento?.classList.add(clase);
  }

  eliminarClase(elemento, clase) {
    elemento?.classList.remove(clase);
  }

  alternarClase(elemento, clase, condicion) {
    elemento?.classList.toggle(clase, condicion);
  }

  establecerAtributo(elemento, atributo, valor) {
    elemento?.setAttribute(atributo, valor);
  }

  obtenerAtributo(elemento, atributo) {
    return elemento?.getAttribute(atributo);
  }

  establecerPropiedad(elemento, propiedad, valor) {
    if (elemento) {
      elemento[propiedad] = valor;
    }
  }

  obtenerPropiedad(elemento, propiedad) {
    return elemento?.[propiedad];
  }

  establecerTexto(elemento, texto) {
    if (elemento) {
      elemento.textContent = texto;
    }
  }

  establecerHTML(elemento, html) {
    if (elemento) {
      elemento.innerHTML = html;
    }
  }

  obtenerTexto(elemento) {
    return elemento?.textContent || '';
  }

  agregarEventoElemento(elemento, evento, manejador) {
    elemento?.addEventListener(evento, manejador);
  }

  agregarEventoSelector(selector, evento, manejador) {
    const elemento = this.obtenerElemento(selector);
    if (elemento) {
      elemento.addEventListener(evento, manejador);
    }
  }

  agregarEventoMultiple(selector, evento, manejador) {
    this.obtenerTodos(selector).forEach((elemento) => {
      elemento.addEventListener(evento, manejador);
    });
  }

  removerEventoElemento(elemento, evento, manejador) {
    elemento?.removeEventListener(evento, manejador);
  }

  ocultar(elemento) {
    this.agregarClase(elemento, Configuracion.CLASES_CSS.OCULTO_MODAL);
  }

  mostrar(elemento) {
    this.eliminarClase(elemento, Configuracion.CLASES_CSS.OCULTO_MODAL);
  }

  estaOculto(elemento) {
    return elemento?.classList.contains(Configuracion.CLASES_CSS.OCULTO_MODAL);
  }

  establecerFoco(elemento) {
    elemento?.focus();
  }

  limpiarElemento(elemento) {
    if (elemento) {
      elemento.innerHTML = '';
    }
  }

  resetearFormulario(formulario) {
    formulario?.reset?.();
  }

  obtenerValorFormulario(selector) {
    const elemento = this.obtenerElemento(selector);
    return elemento?.value || '';
  }

  establecerValorFormulario(selector, valor) {
    const elemento = this.obtenerElemento(selector);
    if (elemento) {
      elemento.value = valor;
    }
  }
}
