class MejoradorEventos {
  static mapearEventos(configuracion = {}) {
    Object.entries(configuracion).forEach(([selector, eventos]) => {
      const elemento = document.querySelector(selector);
      if (!elemento) return;

      Object.entries(eventos).forEach(([tipoEvento, controlador]) => {
        elemento.addEventListener(tipoEvento, controlador);
      });
    });
  }

  static mapearEventosMultiples(configuracion = {}) {
    Object.entries(configuracion).forEach(([selector, eventos]) => {
      const elementos = document.querySelectorAll(selector);
      if (!elementos.length) return;

      elementos.forEach((elemento) => {
        Object.entries(eventos).forEach(([tipoEvento, controlador]) => {
          elemento.addEventListener(tipoEvento, (e) =>
            controlador(e, elemento),
          );
        });
      });
    });
  }

  static mapearEventosPorData(selector, atributoData, manejador) {
    document.querySelectorAll(selector).forEach((elemento) => {
      elemento.addEventListener('click', (e) => {
        const valor = elemento.dataset[atributoData];
        if (valor) {
          manejador(valor, e, elemento);
        }
      });
    });
  }

  static crearEventoConPrevencion(elemento, tipoEvento, controlador) {
    if (!elemento) return;

    elemento.addEventListener(tipoEvento, (e) => {
      e.preventDefault();
      controlador(e);
    });
  }

  static crearEventoDelegado(contenedor, selector, tipoEvento, controlador) {
    if (!contenedor) return;

    contenedor.addEventListener(tipoEvento, (e) => {
      const elemento = e.target.closest(selector);
      if (elemento) {
        controlador(e, elemento);
      }
    });
  }

  static esperarElemento(selector, tipoEvento, controlador, timeout = 5000) {
    const verificar = () => {
      const elemento = document.querySelector(selector);
      if (elemento) {
        elemento.addEventListener(tipoEvento, controlador);
        return;
      }

      if (timeout > 0) {
        timeout -= 100;
        setTimeout(verificar, 100);
      }
    };

    verificar();
  }
}
