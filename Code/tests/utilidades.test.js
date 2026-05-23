import { describe, test, expect, beforeEach, vi } from 'vitest';
import { ValidadorFormulario } from '../src/cliente/compartido/validadores/ValidadorFormulario.js';
import { FormateadorFecha } from '../src/cliente/compartido/formateadores/FormateadorFecha.js';
import { FormateadorHora } from '../src/cliente/compartido/formateadores/FormateadorHora.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('FormateadorFecha · Utilidades de fecha', () => {
  test('aISO devuelve formato YYYY-MM-DD correcto', () => {
    const fecha = new Date(2026, 4, 22);
    expect(FormateadorFecha.aISO(fecha)).toBe('2026-05-22');
  });

  test('aTextoCorto devuelve formato DD/MM/YYYY', () => {
    const fecha = new Date(2026, 0, 5);
    expect(FormateadorFecha.aTextoCorto(fecha)).toBe('05/01/2026');
  });

  test('aTextoCorto usa array MESES correctamente en todos los meses', () => {
    const meses = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    meses.forEach((mes) => {
      const fecha = new Date(2026, mes, 15);
      const resultado = FormateadorFecha.aTextoCorto(fecha);
      expect(resultado).toMatch(/^15\/\d{2}\/2026$/);
    });
  });

  test('aISO maneja fechas en diferentes meses correctamente', () => {
    const fechaEnero = new Date(2026, 0, 1);
    const fechaDiciembre = new Date(2026, 11, 31);
    expect(FormateadorFecha.aISO(fechaEnero)).toBe('2026-01-01');
    expect(FormateadorFecha.aISO(fechaDiciembre)).toBe('2026-12-31');
  });

  test('aTexto devuelve formato "Día, DD de Mes de AAAA"', () => {
    const fecha = new Date(2026, 4, 22);
    const resultado = FormateadorFecha.aTexto(fecha);
    expect(resultado).toMatch(/^[A-Z][a-z]+, \d{1,2} de [A-Z][a-z]+ de \d{4}$/);
    expect(resultado).toContain('Mayo');
  });

  test('aTexto acepta string ISO y lo convierte', () => {
    const resultado = FormateadorFecha.aTexto('2026-05-22');
    expect(resultado).toContain('Mayo');
    expect(resultado).toMatch(/\d{4}$/);
  });
});

describe('ValidadorFormulario · Validaciones de lógica', () => {
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

describe('FormateadorHora · Formato de horas', () => {
  test('formatear devuelve HH:MM con ceros a la izquierda', () => {
    expect(FormateadorHora.formatear('08:00:00')).toBe('08:00');
  });

  test('formatear devuelve cadena vacía si la hora es nula', () => {
    expect(FormateadorHora.formatear(null)).toBe('');
  });
});
