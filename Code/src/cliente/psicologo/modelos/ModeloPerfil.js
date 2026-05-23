import { supabase } from '../../compartido/config/ClienteSupabase.js';
import { ValidadorFormulario } from '../../compartido/validadores/ValidadorFormulario.js';

export class ModeloPerfilPsicologo {
  inicializar(usuario) {
    this._usuario = usuario;
    document.dispatchEvent(new CustomEvent('psicologo:perfilCargado', { detail: { usuario } }));
  }

  async actualizarPassword(nueva, confirmar) {
    const msg = (texto, tipo) => document.dispatchEvent(new CustomEvent('psicologo:mensaje', { detail: { texto, tipo } }));

    if (!ValidadorFormulario.noEstaVacio(nueva) || !ValidadorFormulario.noEstaVacio(confirmar)) return msg('Por favor completa todos los campos', 'error');
    if (!ValidadorFormulario.sonIguales(nueva, confirmar)) return msg('Las contraseñas no coinciden', 'error');
    if (!ValidadorFormulario.esPasswordValida(nueva)) return msg('La contraseña debe tener al menos 6 caracteres', 'error');

    try {
      const { error } = await supabase.auth.updateUser({ password: nueva });
      if (error) throw error;
      msg('Contraseña actualizada correctamente', 'exito');
      document.dispatchEvent(new CustomEvent('psicologo:passwordActualizado'));
    } catch (_) {
      msg('Error al cambiar contraseña', 'error');
    }
  }

  async cerrarSesion() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }
}
