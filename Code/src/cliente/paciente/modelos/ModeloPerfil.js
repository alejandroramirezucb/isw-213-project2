/* globals CustomEvent */

import { supabase } from '../../compartido/config/ClienteSupabase.js';
import { ValidadorFormulario } from '../../compartido/validadores/ValidadorFormulario.js';

export class ModeloPerfil {
  inicializar(usuario) {
    this._usuario = usuario;
    document.dispatchEvent(new CustomEvent('paciente:perfilCargado', { detail: { usuario } }));
  }

  validarNuevaPassword(nueva, confirmar) {
    if (!ValidadorFormulario.noEstaVacio(nueva) || !ValidadorFormulario.noEstaVacio(confirmar)) {
      return { valido: false, mensaje: 'Por favor completa todos los campos' };
    }
    if (!ValidadorFormulario.sonIguales(nueva, confirmar)) {
      return { valido: false, mensaje: 'Las contraseñas no coinciden' };
    }
    if (!ValidadorFormulario.esPasswordValida(nueva)) {
      return { valido: false, mensaje: 'La contraseña debe tener al menos 6 caracteres' };
    }
    return { valido: true, mensaje: '' };
  }

  async actualizarPassword(nueva, confirmar) {
    const validacion = this.validarNuevaPassword(nueva, confirmar);
    if (!validacion.valido) {
      return this._msg(validacion.mensaje, 'error');
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: nueva });
      if (error) throw error;
      this._msg('Contraseña actualizada correctamente', 'exito');
      document.dispatchEvent(new CustomEvent('paciente:passwordActualizado'));
    } catch {
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
