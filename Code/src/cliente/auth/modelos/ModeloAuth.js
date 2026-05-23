import { supabase } from '../../compartido/config/ClienteSupabase.js';
import { Configuracion } from '../../compartido/config/Configuracion.js';

const ERRORES = {
  'Invalid login credentials': 'Correo o contraseña incorrectos',
  'Email not confirmed': 'Por favor confirma tu correo electrónico',
  'User not found': 'El usuario no existe',
  'Weak password': 'La contraseña es muy débil',
  'User already exists': 'El usuario ya está registrado',
  'Email already in use': 'Este correo ya está registrado',
};

export class ModeloAuth {
  async iniciarSesion(correo, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: correo, password });
      if (error) throw error;

      const { data: usuarioAuth } = await supabase
        .from('usuarios_auth')
        .select('rol')
        .eq('id', data.user.id)
        .single();

      if (!usuarioAuth) throw new Error('No se encontró información del usuario');
      this._redirigir(usuarioAuth.rol);
    } catch (error) {
      document.dispatchEvent(new CustomEvent('auth:error', {
        detail: { mensaje: this._traducir(error.message) },
      }));
    }
  }

  async registrar(datos) {
    try {
      const res = await fetch(Configuracion.API.ENDPOINT_REGISTRO, {
        method: 'POST',
        headers: { 'Content-Type': Configuracion.API.TIPO_CONTENIDO },
        body: JSON.stringify(datos),
      });
      const resultado = await res.json();
      if (!res.ok) throw new Error(this._traducir(resultado.error || 'No se pudo crear la cuenta'));

      document.dispatchEvent(new CustomEvent('auth:exito', {
        detail: { mensaje: 'Cuenta creada. Iniciando sesión...' },
      }));
      await this.iniciarSesion(datos.correo, datos.password);
    } catch (error) {
      document.dispatchEvent(new CustomEvent('auth:error', {
        detail: { mensaje: this._traducir(error.message) },
      }));
    }
  }

  async verificarSesionActiva() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;

    const { data: usuarioAuth } = await supabase
      .from('usuarios_auth')
      .select('rol')
      .eq('id', data.session.user.id)
      .single();

    if (usuarioAuth) this._redirigir(usuarioAuth.rol);
  }

  _redirigir(rol) {
    window.location.href = rol === 'psicologo'
      ? Configuracion.RUTAS.PSICOLOGO
      : Configuracion.RUTAS.PACIENTE;
  }

  _traducir(mensaje) {
    for (const [original, traducido] of Object.entries(ERRORES)) {
      if (mensaje?.includes(original)) return traducido;
    }
    if (mensaje?.includes('supabase') || mensaje?.includes('network')) {
      return 'Error de conexión. Por favor intenta de nuevo';
    }
    return mensaje || 'Algo salió mal. Por favor intenta de nuevo';
  }
}
