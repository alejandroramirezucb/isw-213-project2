class ServicioAutenticacion {
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
      if (!usuarioAuth)
        throw new Error('No se encontró información del usuario');

      ServicioSesion.redirigirPorRol(usuarioAuth.rol);
    } catch (error) {
      GestorMensajesAuth.mostrar(
        `Error: ${error.message || 'No se pudo iniciar sesión'}`,
        'error',
      );
    }
  }

  static async registrar(datos) {
    try {
      const respuesta = await fetch('/api/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      const resultado = await respuesta.json();
      if (!respuesta.ok)
        throw new Error(resultado.error || 'No se pudo crear la cuenta');

      GestorMensajesAuth.mostrar(
        'Cuenta creada exitosamente. Iniciando sesión...',
        'exito',
      );
      await this.iniciarSesion(datos.correo, datos.contrasena);
    } catch (error) {
      GestorMensajesAuth.mostrar(
        `Error: ${error.message || 'No se pudo crear la cuenta'}`,
        'error',
      );
    }
  }
}
