import { supabase } from './ClienteSupabase.js';
import { Configuracion } from './Configuracion.js';

export class ServicioAutenticacion {
  static async verificarSesion() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      window.location.href = Configuracion.RUTAS.INICIO;
      return null;
    }
    return data.session;
  }

  static async obtenerUsuario() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;

    const { data: perfil } = await supabase
      .from('usuarios_auth')
      .select('*, pacientes(*), psicologos(*)')
      .eq('id', data.user.id)
      .single();

    return perfil ? { ...perfil, email: data.user.email } : null;
  }

  static async cerrarSesion() {
    await supabase.auth.signOut();
    window.location.href = Configuracion.RUTAS.INICIO;
  }
}
