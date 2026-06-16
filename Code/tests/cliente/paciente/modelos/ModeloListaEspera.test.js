import { describe, test, expect, beforeEach, vi } from 'vitest';
import { ModeloListaEspera } from '../../../../src/cliente/paciente/modelos/ModeloListaEspera.js';
import { capturarEventos, buscarEvento, buscarMensaje } from '../../../helpers/eventos.js';
import { repoListaEspera } from '../../../helpers/dobles.js';

function crearModelo() {
  const repositorio = repoListaEspera();
  const modelo = new ModeloListaEspera(repositorio, {});
  modelo.inicializar('paciente-1');
  return { modelo, repositorio };
}

beforeEach(() => {
  vi.clearAllMocks();
  capturarEventos();
});

describe('Ya esta inscrito en la lista de espera', () => {
  test('retorna true cuando el paciente ya está en la lista', () => {
    const { modelo } = crearModelo();
    const inscritos = [{ paciente_id: 'paciente-9' }, { paciente_id: 'paciente-1' }];
    expect(modelo.yaEstaInscrito(inscritos, 'paciente-1')).toBe(true);
  });

  test('retorna false cuando el paciente no está en la lista', () => {
    const { modelo } = crearModelo();
    expect(modelo.yaEstaInscrito([{ paciente_id: 'paciente-9' }], 'paciente-1')).toBe(false);
  });

  test('retorna false con lista vacía', () => {
    const { modelo } = crearModelo();
    expect(modelo.yaEstaInscrito([], 'paciente-1')).toBe(false);
  });
});

describe('Mostrar modal de la lista de espera', () => {
  test('informa cuando el paciente ya está en espera', async () => {
    const { modelo, repositorio } = crearModelo();
    repositorio.estaEnEspera.mockResolvedValue(true);
    await modelo.mostrarModal('2026-05-22', '22/05/2026', 'psi-1');
    expect(buscarMensaje('info')).toBeTruthy();
  });

  test('abre el modal cuando el paciente no está en espera', async () => {
    const { modelo, repositorio } = crearModelo();
    repositorio.estaEnEspera.mockResolvedValue(false);
    await modelo.mostrarModal('2026-05-22', '22/05/2026', 'psi-1');
    expect(buscarEvento('paciente:modalListaEsperaAbrir')).toBeTruthy();
  });
});

describe('Unirse a la lista de espera', () => {
  test('despacha éxito con la posición cuando se une', async () => {
    const { modelo, repositorio } = crearModelo();
    repositorio.anadirAEspera.mockResolvedValue(true);
    repositorio.obtenerPosicion.mockResolvedValue(3);
    await modelo.unirse('2026-05-22', 'psi-1');
    expect(buscarMensaje('exito').detail.texto).toContain('3');
  });

  test('despacha error cuando falla la inscripción', async () => {
    const { modelo, repositorio } = crearModelo();
    repositorio.anadirAEspera.mockResolvedValue(false);
    await modelo.unirse('2026-05-22', 'psi-1');
    expect(buscarMensaje('error')).toBeTruthy();
  });
});
