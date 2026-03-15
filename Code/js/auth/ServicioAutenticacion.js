class ServicioAutenticacion {
  static #ENDPOINT_REGISTRO = '/api/registrar';
  static #CONTENIDO_TIPO = 'application/json';

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
      if (!usuarioAuth) {
        throw new Error('No se encontró información del usuario');
      }

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
      const respuesta = await fetch(this.#ENDPOINT_REGISTRO, {
        method: 'POST',
        headers: { 'Content-Type': this.#CONTENIDO_TIPO },
        body: JSON.stringify(datos),
      });
      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.error || 'No se pudo crear la cuenta');
      }

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
