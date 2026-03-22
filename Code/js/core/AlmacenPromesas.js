class AlmacenPromesas {
  static async ejecutar(funcion, opciones = {}) {
    const {
      intentos = 1,
      delayEntreintentos = 0,
      timeout = 0,
      onError = null,
    } =opciones;

    let ultimoError = null;

    for (let intento = 0; intento < intentos; intento++) {
      try {
        return await this.#ejecutarConTimeout(funcion, timeout);
      } catch (error) {
        ultimoError = error;
        onError?.(error, intento + 1);

        if (intento < intentos - 1 && delayEntreintentos > 0) {
          await this.#esperar(delayEntreintentos);
        }
      }
    }

    throw ultimoError;
  }

  static async #ejecutarConTimeout(funcion, timeout) {
    if (timeout <= 0) {
      return await funcion();
    }

    return await Promise.race([
      funcion(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Timeout de operación excedido')),
          timeout,
        ),
      ),
    ]);
  }

  static #esperar(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static async ejecutarEnParalelo(funciones = [], opciones = {}) {
    return await Promise.all(
      funciones.map((fn) => this.ejecutar(fn, opciones)),
    );
  }

  static async ejecutarEnSerie(funciones = [], opciones = {}) {
    const resultados = [];
    for (const fn of funciones) {
      const resultado = await this.ejecutar(fn, opciones);
      resultados.push(resultado);
    }
    return resultados;
  }
}
