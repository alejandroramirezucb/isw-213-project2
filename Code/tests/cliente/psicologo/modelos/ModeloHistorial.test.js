import { describe, test, expect } from 'vitest';
import { ModeloHistorial } from '../../../../src/cliente/psicologo/modelos/ModeloHistorial.js';

function crearModelo() {
  return new ModeloHistorial({}, {});
}

const CITAS = [
  { estado: 'completada' },
  { estado: 'cancelada' },
  { estado: 'completada' },
  { estado: 'ausente' },
];

describe('HU-13 Historial de citas por estado', () => {
  test('filtra las citas completadas', () => {
    expect(crearModelo().filtrarPorEstado(CITAS, 'completada')).toHaveLength(2);
  });

  test('filtra las citas canceladas', () => {
    expect(crearModelo().filtrarPorEstado(CITAS, 'cancelada')).toHaveLength(1);
  });

  test('retorna una lista vacía cuando no hay coincidencias', () => {
    expect(crearModelo().filtrarPorEstado(CITAS, 'inexistente')).toEqual([]);
  });
});
