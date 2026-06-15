import { describe, test, expect } from 'vitest';
import { FormateadorHora } from '../../../../src/cliente/compartido/formateadores/FormateadorHora.js';

describe('Formato de horas', () => {
  test('formatear devuelve HH:MM con ceros a la izquierda', () => {
    expect(FormateadorHora.formatear('08:00:00')).toBe('08:00');
  });

  test('formatear devuelve cadena vacía si la hora es nula', () => {
    expect(FormateadorHora.formatear(null)).toBe('');
  });
});
