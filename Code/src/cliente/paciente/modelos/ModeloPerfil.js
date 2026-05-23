import { supabase } from '../../compartido/config/ClienteSupabase.js';
import { ValidadorFormulario } from '../../compartido/validadores/ValidadorFormulario.js';

export class ModeloPerfil {
  inicializar(usuario) {
    this._usuario = usuario;
    document.dispatchEvent(new CustomEvent('paciente:perfilCargado', { detail: { usuario } }));
  }

  async actualizarPassword(nueva, confirmar) {
    if (!ValidadorFormulario.noEstaVacio(nueva) || !ValidadorFormulario.noEstaVacio(confirmar)) {
      return this._msg('Por favor completa todos los campos', 'error');
    }
    if (!ValidadorFormulario.sonIguales(nueva, confirmar)) {
      return this._msg('Las contraseñas no coinciden', 'error');
    }
    if (!ValidadorFormulario.esPasswordValida(nueva)) {
      return this._msg('La contraseña debe tener al menos 6 caracteres', 'error');
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: nueva });
      if (error) throw error;
      this._msg('Contraseña actualizada correctamente', 'exito');
      document.dispatchEvent(new CustomEvent('paciente:passwordActualizado'));
    } catch (_) {
      this._msg('Error al cambiar contraseña', 'error');
    }
  }

  async cerrarSesion() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  _msg(texto, tipo) {
    document.dispatchEvent(new CustomEvent('paciente:mensaje', { detail: { texto, tipo } }));
  }
}
