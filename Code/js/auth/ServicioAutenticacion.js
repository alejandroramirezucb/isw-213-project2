class ServicioAutenticacion {
  static #mapeoErrores = {
    'Invalid login credentials': 'Correo o contraseña incorrectos',
    'Email not confirmed': 'Por favor confirma tu correo electrónico',
    'User not found': 'El usuario no existe',
    'Weak password': 'La contraseña es muy débil',
    'User already exists': 'El usuario ya está registrado',
    'Email already in use': 'Este correo ya está registrado',
  };

  static #traducirError(mensaje) {
    for (const [original, traducido] of Object.entries(this.#mapeoErrores)) {
      if (mensaje.includes(original)) {
        return traducido;
      }
    }
    if (mensaje.includes('supabase') || mensaje.includes('network')) {
      return 'Error de conexión. Por favor intenta de nuevo';
    }
    return mensaje || 'Algo salió mal. Por favor intenta de nuevo';
  }

  static async iniciarSesion(correo, password) {
    try {
      const resultado = await clienteSupabase.auth.signInWithPassword({
        email: correo,
        password,
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
      const mensajeClaro = this.#traducirError(error.message);
      GestorMensajesAuth.mostrar(mensajeClaro, 'error');
    }
  }

  static async registrar(datos) {
    try {
      const respuesta = await fetch(Configuracion.API.ENDPOINT_REGISTRO, {
        method: 'POST',
        headers: { 'Content-Type': Configuracion.API.TIPO_CONTENIDO },
        body: JSON.stringify(datos),
      });
      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        const mensajeError = resultado.error || 'No se pudo crear la cuenta';
        const mensajeClaro = this.#traducirError(mensajeError);
        throw new Error(mensajeClaro);
      }

      GestorMensajesAuth.mostrar(
        'Cuenta creada exitosamente. Iniciando sesión...',
        'exito',
      );
      await this.iniciarSesion(datos.correo, datos.password);
    } catch (error) {
      console.error('[Registro] Error:', error);
      const mensajeClaro = this.#traducirError(error.message);
      GestorMensajesAuth.mostrar(mensajeClaro, 'error');
    }
  }
}
