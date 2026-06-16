import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { ModeloNotificaciones } from '../../../../src/cliente/paciente/modelos/ModeloNotificaciones.js';
import { capturarEventos, buscarEvento, buscarMensaje } from '../../../helpers/eventos.js';
import { repoNotificaciones } from '../../../helpers/dobles.js';

const INTERVALO_CONTADOR_MS = 60000;

function crearModelo() {
  const repositorio = repoNotificaciones();
  return { modelo: new ModeloNotificaciones(repositorio), repositorio };
}

beforeEach(() => {
  vi.clearAllMocks();
  capturarEventos();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Contar notificacione no leidas', () => {
  test('cuenta solo las no leídas', () => {
    const { modelo } = crearModelo();
    expect(modelo.contarNoLeidas([{ leida: false }, { leida: true }, { leida: false }])).toBe(2);
  });

  test('retorna 0 cuando todas están leídas', () => {
    const { modelo } = crearModelo();
    expect(modelo.contarNoLeidas([{ leida: true }])).toBe(0);
  });

  test('retorna 0 con lista vacía', () => {
    const { modelo } = crearModelo();
    expect(modelo.contarNoLeidas([])).toBe(0);
  });
});

describe('Cargar notificaciones', () => {
  test('despacha el evento con notificaciones y conteo', async () => {
    const { modelo, repositorio } = crearModelo();
    repositorio.obtenerTodas.mockResolvedValue([{ id: 1 }]);
    repositorio.obtenerConteoNoLeidas.mockResolvedValue(1);
    await modelo.cargar();
    expect(buscarEvento('paciente:notificacionesCargadas').detail.conteoNoLeidas).toBe(1);
  });

  test('no propaga errores del repositorio', async () => {
    const { modelo, repositorio } = crearModelo();
    repositorio.obtenerTodas.mockRejectedValue(new Error('DB'));
    await expect(modelo.cargar()).resolves.toBeUndefined();
  });
});

describe('Acciones de notificaciones', () => {
  test('marcarLeida marca y recarga', async () => {
    const { modelo, repositorio } = crearModelo();
    await modelo.marcarLeida('notif-1');
    expect(repositorio.marcarComoLeida).toHaveBeenCalledWith('notif-1');
    expect(repositorio.obtenerTodas).toHaveBeenCalled();
  });

  test('limpiarTodas despacha éxito cuando el repositorio confirma', async () => {
    const { modelo, repositorio } = crearModelo();
    repositorio.marcarTodasLeidasDelPaciente.mockResolvedValue(true);
    await modelo.limpiarTodas();
    expect(buscarMensaje('exito')).toBeTruthy();
  });

  test('limpiarTodas no notifica cuando el repositorio falla', async () => {
    const { modelo, repositorio } = crearModelo();
    repositorio.marcarTodasLeidasDelPaciente.mockResolvedValue(false);
    await modelo.limpiarTodas();
    expect(buscarMensaje('exito')).toBeFalsy();
  });
});

describe('Ciclo de vida de notificaciones', () => {
  test('inicializar arranca el contador y detener lo detiene', async () => {
    vi.useFakeTimers();
    const { modelo, repositorio } = crearModelo();
    repositorio.obtenerConteoNoLeidas.mockResolvedValue(5);

    modelo.inicializar('paciente-1');
    await Promise.resolve();
    expect(buscarEvento('paciente:conteoNotificaciones').detail.conteo).toBe(5);

    modelo.detener();
    const llamadasAntes = repositorio.obtenerConteoNoLeidas.mock.calls.length;
    vi.advanceTimersByTime(INTERVALO_CONTADOR_MS);
    expect(repositorio.obtenerConteoNoLeidas.mock.calls.length).toBe(llamadasAntes);
  });

  test('el contador periódico no propaga errores', async () => {
    vi.useFakeTimers();
    const { modelo, repositorio } = crearModelo();
    repositorio.obtenerConteoNoLeidas.mockRejectedValue(new Error('DB'));
    modelo.inicializar('paciente-1');
    await Promise.resolve();
    modelo.detener();
    expect(buscarEvento('paciente:conteoNotificaciones')).toBeFalsy();
  });
});
