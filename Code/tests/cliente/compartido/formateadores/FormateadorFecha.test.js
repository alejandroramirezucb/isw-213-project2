import { describe, test, expect } from 'vitest';
import { FormateadorFecha } from '../../../../src/cliente/compartido/formateadores/FormateadorFecha.js';

describe('Utils de fecha', () => {
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
