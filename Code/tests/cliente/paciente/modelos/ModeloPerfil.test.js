import { describe, test, expect, beforeEach, vi } from 'vitest';
import { capturarEventos, buscarEvento, buscarMensaje } from '../../../helpers/eventos.js';

const updateUser = vi.fn();
const signOut = vi.fn();

vi.mock('../../../../src/cliente/compartido/config/ClienteSupabase.js', () => ({
  supabase: { auth: { updateUser: (...args) => updateUser(...args), signOut: (...args) => signOut(...args) } },
}));

import { ModeloPerfil } from '../../../../src/cliente/paciente/modelos/ModeloPerfil.js';

beforeEach(() => {
  vi.clearAllMocks();
  capturarEventos();
});

describe('Validar nueva password', () => {
  test('rechaza cuando algún campo está vacío', () => {
    const modelo = new ModeloPerfil();
    expect(modelo.validarNuevaPassword('', 'abcdef').valido).toBe(false);
    expect(modelo.validarNuevaPassword('abcdef', '').valido).toBe(false);
  });

  test('rechaza cuando las contraseñas no coinciden', () => {
    const resultado = new ModeloPerfil().validarNuevaPassword('abcdef', 'ghijkl');
    expect(resultado).toEqual({ valido: false, mensaje: 'Las contraseñas no coinciden' });
  });

  test('rechaza cuando la contraseña es muy corta', () => {
    const resultado = new ModeloPerfil().validarNuevaPassword('abc', 'abc');
    expect(resultado.valido).toBe(false);
    expect(resultado.mensaje).toContain('al menos 6');
  });

  test('acepta cuando es válida y coincide', () => {
    expect(new ModeloPerfil().validarNuevaPassword('abcdef', 'abcdef')).toEqual({ valido: true, mensaje: '' });
  });
});

describe('Actualizar password', () => {
  test('no llama a supabase cuando la validación falla', async () => {
    await new ModeloPerfil().actualizarPassword('abc', 'abc');
    expect(updateUser).not.toHaveBeenCalled();
    expect(buscarMensaje('error')).toBeTruthy();
  });

  test('despacha passwordActualizado cuando supabase responde ok', async () => {
    updateUser.mockResolvedValue({ error: null });
    await new ModeloPerfil().actualizarPassword('abcdef', 'abcdef');
    expect(buscarEvento('paciente:passwordActualizado')).toBeTruthy();
  });

  test('despacha error cuando supabase retorna error', async () => {
    updateUser.mockResolvedValue({ error: new Error('fallo') });
    await new ModeloPerfil().actualizarPassword('abcdef', 'abcdef');
    expect(buscarMensaje('error')).toBeTruthy();
  });
});

describe('Inicializar y cerrar sesion', () => {
  test('inicializar despacha perfilCargado con el usuario', () => {
    const usuarioActual = { id: 'u-1' };
    new ModeloPerfil().inicializar(usuarioActual);
    expect(buscarEvento('paciente:perfilCargado').detail.usuario).toEqual(usuarioActual);
  });

  test('cerrarSesion delega en supabase signOut', async () => {
    signOut.mockResolvedValue({});
    await new ModeloPerfil().cerrarSesion();
    expect(signOut).toHaveBeenCalled();
  });
});
