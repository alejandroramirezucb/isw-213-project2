import { describe, test, expect } from 'vitest';
import { ValidadorFormulario } from '../../../../src/cliente/compartido/validadores/ValidadorFormulario.js';

describe('Validaciones', () => {
  test('esPasswordValida rechaza contraseña con menos de 6 caracteres', () => {
    expect(ValidadorFormulario.esPasswordValida('abc')).toBe(false);
  });

  test('esPasswordValida acepta contraseña con 6 o más caracteres', () => {
    expect(ValidadorFormulario.esPasswordValida('abcdef')).toBe(true);
  });

  test('esPasswordValida rechaza null/undefined', () => {
    expect(ValidadorFormulario.esPasswordValida(null)).toBe(false);
    expect(ValidadorFormulario.esPasswordValida(undefined)).toBe(false);
  });

  test('sonIguales retorna true cuando ambos valores son idénticos', () => {
    expect(ValidadorFormulario.sonIguales('test123', 'test123')).toBe(true);
  });

  test('sonIguales retorna false cuando los valores difieren', () => {
    expect(ValidadorFormulario.sonIguales('abc', 'xyz')).toBe(false);
  });

  test('esCorreoValido rechaza email sin @', () => {
    expect(ValidadorFormulario.esCorreoValido('correosinarray')).toBe(false);
  });

  test('esCorreoValido acepta email válido', () => {
    expect(ValidadorFormulario.esCorreoValido('usuario@ejemplo.com')).toBe(true);
  });

  test('esCorreoValido rechaza email con formato incorrecto', () => {
    expect(ValidadorFormulario.esCorreoValido('usuario@')).toBe(false);
    expect(ValidadorFormulario.esCorreoValido('@ejemplo.com')).toBe(false);
  });

  test('esTelefonoValido rechaza números con menos de 7 dígitos', () => {
    expect(ValidadorFormulario.esTelefonoValido('123456')).toBe(false);
  });

  test('esTelefonoValido acepta números con 7 o más dígitos', () => {
    expect(ValidadorFormulario.esTelefonoValido('1234567')).toBe(true);
    expect(ValidadorFormulario.esTelefonoValido('123456789')).toBe(true);
  });

  test('esTelefonoValido rechaza teléfono con caracteres no numéricos', () => {
    expect(ValidadorFormulario.esTelefonoValido('123-456-78')).toBe(false);
  });

  test('noEstaVacio rechaza valores vacíos', () => {
    expect(ValidadorFormulario.noEstaVacio('')).toBe(false);
    expect(ValidadorFormulario.noEstaVacio('   ')).toBe(false);
    expect(ValidadorFormulario.noEstaVacio(null)).toBe(false);
  });

  test('noEstaVacio acepta valores válidos', () => {
    expect(ValidadorFormulario.noEstaVacio('texto')).toBe(true);
    expect(ValidadorFormulario.noEstaVacio('123')).toBe(true);
  });
});
