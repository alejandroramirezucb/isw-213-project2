import { describe, test, expect, beforeEach, vi } from 'vitest';
import { ModeloCancelacion } from '../src/cliente/paciente/modelos/ModeloCancelacion.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('HU-06 · Cancelación de Cita por el Paciente', () => {
  test('cancelación no llama al repositorio si no se estableció citaId', async () => {
    const repositorioCitasMock = { cancelar: vi.fn().mockResolvedValue(true) };
    const modelo = new ModeloCancelacion(repositorioCitasMock);

    await modelo.cancelar();

    expect(repositorioCitasMock.cancelar).not.toHaveBeenCalled();
  });

  test('cancelación llama al repositorio cuando citaId está establecido', async () => {
    const repositorioCitasMock = { cancelar: vi.fn().mockResolvedValue(true) };
    const modelo = new ModeloCancelacion(repositorioCitasMock);

    modelo.setCitaId('cita-123');
    await modelo.cancelar();

    expect(repositorioCitasMock.cancelar).toHaveBeenCalledWith('cita-123');
  });

  test('setCitaId almacena el identificador de cita', () => {
    const repositorioCitasMock = { cancelar: vi.fn() };
    const modelo = new ModeloCancelacion(repositorioCitasMock);

    modelo.setCitaId('cita-456');

    expect(modelo.getCitaId()).toBe('cita-456');
  });

  test('cancelación muestra error cuando repositorio falla', async () => {
    const repositorioCitasMock = { cancelar: vi.fn().mockRejectedValue(new Error('DB Error')) };
    const modelo = new ModeloCancelacion(repositorioCitasMock);

    vi.spyOn(document, 'dispatchEvent');

    modelo.setCitaId('cita-error');
    await modelo.cancelar();

    const eventos = document.dispatchEvent.mock.calls.map((c) => c[0]);
    const mensajeError = eventos.find((e) => e.type === 'paciente:mensaje' && e.detail?.tipo === 'error');
    expect(mensajeError).toBeTruthy();
  });

  test('cancelación muestra error cuando repositorio retorna false', async () => {
    const repositorioCitasMock = { cancelar: vi.fn().mockResolvedValue(false) };
    const modelo = new ModeloCancelacion(repositorioCitasMock);

    vi.spyOn(document, 'dispatchEvent');

    modelo.setCitaId('cita-falso');
    await modelo.cancelar();

    const eventos = document.dispatchEvent.mock.calls.map((c) => c[0]);
    const mensajeError = eventos.find((e) => e.type === 'paciente:mensaje' && e.detail?.tipo === 'error');
    expect(mensajeError).toBeTruthy();
  });

  test('cancelación muestra éxito cuando repositorio retorna true', async () => {
    const repositorioCitasMock = { cancelar: vi.fn().mockResolvedValue(true) };
    const modelo = new ModeloCancelacion(repositorioCitasMock);

    vi.spyOn(document, 'dispatchEvent');

    modelo.setCitaId('cita-123');
    await modelo.cancelar();

    const eventos = document.dispatchEvent.mock.calls.map((c) => c[0]);
    const mensajeExito = eventos.find((e) => e.type === 'paciente:mensaje' && e.detail?.tipo === 'exito');
    const confirmacion = eventos.find((e) => e.type === 'paciente:cancelacionConfirmada');
    expect(mensajeExito).toBeTruthy();
    expect(confirmacion).toBeTruthy();
  });

  test('mostrarModal dispara evento de apertura', () => {
    const repositorioCitasMock = { cancelar: vi.fn() };
    const modelo = new ModeloCancelacion(repositorioCitasMock);

    vi.spyOn(document, 'dispatchEvent');

    modelo.mostrarModal();

    const eventos = document.dispatchEvent.mock.calls.map((c) => c[0]);
    const modal = eventos.find((e) => e.type === 'paciente:modalCancelacionAbrir');
    expect(modal).toBeTruthy();
  });

});
