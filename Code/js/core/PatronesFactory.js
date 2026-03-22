class PatronesFactory {
  static crearManejadorCrudSimple(nombre, operaciones = {}) {
    return class extends ComponenteBase {
      static async crear(datos) {
        try {
          const resultado = await operaciones.crear?.(datos);
          MensajesFachada.mostrar(
            `${nombre} creado exitosamente`,
            'exito',
          );
          return resultado;
        } catch (error) {
          MensajesFachada.mostrar(
            `Error al crear ${nombre}`,
            'error',
          );
        }
      }

      static async actualizar(id, datos) {
        try {
          const resultado = await operaciones.actualizar?.(id, datos);
          MensajesFachada.mostrar(
            `${nombre} actualizado exitosamente`,
            'exito',
          );
          return resultado;
        } catch (error) {
          MensajesFachada.mostrar(
            `Error al actualizar ${nombre}`,
            'error',
          );
        }
      }

      static async eliminar(id) {
        try {
          const resultado = await operaciones.eliminar?.(id);
          MensajesFachada.mostrar(
            `${nombre} eliminado exitosamente`,
            'exito',
          );
          return resultado;
        } catch (error) {
          MensajesFachada.mostrar(
            `Error al eliminar ${nombre}`,
            'error',
          );
        }
      }

      static async obtener(id) {
        return await operaciones.obtener?.(id);
      }

      static async obtenerTodos() {
        return await operaciones.obtenerTodos?.();
      }
    };
  }

  static crearValidador(nombre, reglas = {}) {
    return class {
      static validar(datos) {
        const errores = {};

        Object.entries(reglas).forEach(([campo, regla]) => {
          const resultado = regla(datos[campo]);
          if (resultado !== true) {
            errores[campo] = resultado;
          }
        });

        return Object.keys(errores).length === 0 ? null : errores;
      }

      static estaValido(datos) {
        return !this.validar(datos);
      }
    };
  }

  static crearEstadoLocal(estadoInicial = {}) {
    return class {
      static #estado = { ...estadoInicial };

      static obtener(clave) {
        return this.#estado[clave];
      }

      static establecer(clave, valor) {
        this.#estado[clave] = valor;
      }

      static actualizar(cambios = {}) {
        this.#estado = { ...this.#estado, ...cambios };
      }

      static reiniciar() {
        this.#estado = { ...estadoInicial };
      }

      static obtenerTodo() {
        return { ...this.#estado };
      }
    };
  }
}
