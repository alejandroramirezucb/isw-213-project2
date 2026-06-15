import { describe, test, expect, beforeEach, vi } from 'vitest';
import { ModeloCancelacion } from '../../../../src/cliente/paciente/modelos/ModeloCancelacion.js';
import { capturarEventos, buscarEvento, buscarMensaje } from '../../../helpers/eventos.js';

function crearModelo(resultadoCancelar) {
  const repositorio = { cancelar: vi.fn() };
  if (resultadoCancelar instanceof Error) {
    repositorio.cancelar.mockRejectedValue(resultadoCancelar);
  } else if (resultadoCancelar !== undefined) {
    repositorio.cancelar.mockResolvedValue(resultadoCancelar);
  }
  return { modelo: new ModeloCancelacion(repositorio), repositorio };
}

beforeEach(() => {
  vi.clearAllMocks();
  capturarEventos();
});

describe('HU-06 Cancelación de cita', () => {
  test('no llama al repositorio si no se estableció el citaId', async () => {
    const { modelo, repositorio } = crearModelo(true);
    await modelo.cancelar();
    expect(repositorio.cancelar).not.toHaveBeenCalled();
  });

  test('llama al repositorio con el citaId establecido', async () => {
    const { modelo, repositorio } = crearModelo(true);
    modelo.setCitaId('cita-123');
    await modelo.cancelar();
    expect(repositorio.cancelar).toHaveBeenCalledWith('cita-123');
  });

  test('confirma la cancelación cuando el repositorio responde con éxito', async () => {
    const { modelo } = crearModelo(true);
    modelo.setCitaId('cita-123');
    await modelo.cancelar();
    expect(buscarMensaje('exito')).toBeTruthy();
    expect(buscarEvento('paciente:cancelacionConfirmada')).toBeTruthy();
  });
});

describe('HU-06 Manejo de fallos', () => {
  test('muestra error cuando el repositorio lanza una excepción', async () => {
    const { modelo } = crearModelo(new Error('DB Error'));
    modelo.setCitaId('cita-error');
    await modelo.cancelar();
    expect(buscarMensaje('error')).toBeTruthy();
  });

  test('muestra error cuando el repositorio retorna false', async () => {
    const { modelo } = crearModelo(false);
    modelo.setCitaId('cita-falso');
    await modelo.cancelar();
    expect(buscarMensaje('error')).toBeTruthy();
  });
});

describe('HU-06 Estado del modelo', () => {
  test('setCitaId almacena el identificador', () => {
    const { modelo } = crearModelo();
    modelo.setCitaId('cita-456');
    expect(modelo.getCitaId()).toBe('cita-456');
  });

  test('mostrarModal despacha el evento de apertura', () => {
    const { modelo } = crearModelo();
    modelo.mostrarModal();
    expect(buscarEvento('paciente:modalCancelacionAbrir')).toBeTruthy();
  });
});
