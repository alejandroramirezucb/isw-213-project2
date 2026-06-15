import { describe, test, expect, beforeEach, vi } from 'vitest';
import { ModeloReserva } from '../../../../src/cliente/paciente/modelos/ModeloReserva.js';
import { capturarEventos, buscarEvento, buscarMensaje } from '../../../helpers/eventos.js';
import { reposReserva, usuario } from '../../../helpers/dobles.js';

const BLOQUE = 'bloque-xyz';
const FECHA = '2026-05-22';

function crearModelo({ bloqueado = false, conBloque = false } = {}) {
  const repos = reposReserva();
  const modelo = new ModeloReserva(repos.citas, repos.bloques, repos.citasPsi);
  modelo.inicializar('paciente-1', usuario(bloqueado));
  if (conBloque) modelo._bloqueId = BLOQUE;
  return { modelo, ...repos };
}

function configurarExito(repos) {
  repos.bloques.bloquearTemporal.mockResolvedValue(true);
  repos.bloques.obtenerProfesional.mockResolvedValue({ psicologo_id: 'psi-1' });
  repos.citas.crear.mockResolvedValue('cita-123');
}

async function confirmarConCrear(resultado) {
  const ctx = crearModelo({ conBloque: true });
  ctx.bloques.obtenerProfesional.mockResolvedValue({ psicologo_id: 'psi-1' });
  if (resultado instanceof Error) ctx.citas.crear.mockRejectedValue(resultado);
  else ctx.citas.crear.mockResolvedValue(resultado);
  await ctx.modelo.confirmar();
  return ctx;
}

beforeEach(() => {
  vi.clearAllMocks();
  capturarEventos();
});

describe('HU-15 Restricción de pacientes bloqueados', () => {
  test('un paciente bloqueado recibe un mensaje de error al confirmar', async () => {
    const { modelo } = crearModelo({ bloqueado: true, conBloque: true });
    await modelo.confirmar();
    expect(buscarMensaje('error')).toBeTruthy();
  });

  test('la reserva de un paciente bloqueado no se persiste', async () => {
    const { modelo, citas } = crearModelo({ bloqueado: true, conBloque: true });
    await modelo.confirmar();
    expect(citas.crear).not.toHaveBeenCalled();
  });

  test('seleccionar bloque se rechaza si el paciente está bloqueado', async () => {
    const { modelo, bloques } = crearModelo({ bloqueado: true });
    await modelo.seleccionarBloque(BLOQUE, FECHA);
    expect(buscarMensaje('error')).toBeTruthy();
    expect(bloques.bloquearTemporal).not.toHaveBeenCalled();
  });
});

describe('Selección de bloque de reserva', () => {
  test('reserva temporalmente el bloque y guarda fecha cuando hay disponibilidad', async () => {
    const { modelo, bloques } = crearModelo();
    bloques.bloquearTemporal.mockResolvedValue(true);
    await modelo.seleccionarBloque(BLOQUE, FECHA);
    expect(bloques.bloquearTemporal).toHaveBeenCalledWith(BLOQUE);
    expect(modelo.getBloqueId()).toBe(BLOQUE);
    expect(modelo.getFecha()).toBe(FECHA);
  });

  test('avisa cuando el bloque ya no está disponible', async () => {
    const { modelo, bloques } = crearModelo();
    bloques.bloquearTemporal.mockResolvedValue(false);
    await modelo.seleccionarBloque(BLOQUE, FECHA);
    expect(buscarEvento('paciente:bloqueNoDisponible')).toBeTruthy();
  });

  test('maneja las excepciones del repositorio', async () => {
    const { modelo, bloques } = crearModelo();
    bloques.bloquearTemporal.mockRejectedValue(new Error('DB Error'));
    await modelo.seleccionarBloque(BLOQUE, FECHA);
    expect(buscarMensaje('error')).toBeTruthy();
  });
});

describe('Confirmacion exitosa de reserva', () => {
  test('crea la cita y despacha las notificaciones', async () => {
    const ctx = crearModelo({ conBloque: true });
    configurarExito(ctx);
    await ctx.modelo.confirmar();
    expect(ctx.citas.crear).toHaveBeenCalled();
    expect(ctx.citas.crearNotificacion).toHaveBeenCalled();
    expect(ctx.citasPsi.crearNotificacionNuevoTurno).toHaveBeenCalled();
  });

  test('al reprogramar cancela la cita anterior', async () => {
    const ctx = crearModelo({ conBloque: true });
    configurarExito(ctx);
    await ctx.modelo.confirmar(true, 'cita-anterior-123');
    expect(ctx.citas.cancelar).toHaveBeenCalledWith('cita-anterior-123');
  });
});

describe('Confirmación con errores', () => {
  test('no hace nada si ya hay una confirmación en curso', async () => {
    const { modelo, citas } = crearModelo({ conBloque: true });
    modelo._confirmando = true;
    await modelo.confirmar();
    expect(citas.crear).not.toHaveBeenCalled();
  });

  test('rechaza cuando falta el bloque seleccionado', async () => {
    const { modelo } = crearModelo();
    await modelo.confirmar();
    expect(buscarMensaje('error')).toBeTruthy();
  });

  test('falla cuando el bloque no tiene profesional asignado', async () => {
    const { modelo, bloques } = crearModelo({ conBloque: true });
    bloques.obtenerProfesional.mockResolvedValue({ psicologo_id: null });
    await modelo.confirmar();
    expect(buscarMensaje('error')).toBeTruthy();
  });

  test('libera el bloque temporal si la creación de la cita falla', async () => {
    const { bloques } = await confirmarConCrear(new Error('DB Error'));
    expect(bloques.liberarTemporal).toHaveBeenCalledWith(BLOQUE);
  });

  test('libera el bloque y avisa si obtenerProfesional falla', async () => {
    const { modelo, bloques } = crearModelo({ conBloque: true });
    bloques.obtenerProfesional.mockRejectedValue(new Error('DB Error'));
    await modelo.confirmar();
    expect(bloques.liberarTemporal).toHaveBeenCalledWith(BLOQUE);
    expect(buscarMensaje('error')).toBeTruthy();
  });
});

describe('Mensajes de error de la reserva', () => {
  test.each([
    ['duplicate key', 'fue tomado'],
    ['no disponible', 'no está disponible'],
    ['bloque ya fue reservado', 'ya está reservado'],
  ])('traduce el error "%s"', async (mensajeOriginal, textoEsperado) => {
    await confirmarConCrear(new Error(mensajeOriginal));
    expect(buscarMensaje('error').detail.texto).toContain(textoEsperado);
  });

  test('avisa cuando la creación devuelve un valor vacio', async () => {
    await confirmarConCrear(null);
    expect(buscarMensaje('error').detail.texto).toContain('intenta de nuevo');
  });
});

describe('Cierre del modal de la reserva', () => {
  test('libera el bloque cuando la reserva no fue exitosa', async () => {
    const { modelo, bloques } = crearModelo({ conBloque: true });
    bloques.liberarTemporal.mockResolvedValue(true);
    await modelo.cerrarModal(false);
    expect(bloques.liberarTemporal).toHaveBeenCalledWith(BLOQUE);
  });

  test('no libera el bloque cuando la reserva fue exitosa', async () => {
    const { modelo, bloques } = crearModelo({ conBloque: true });
    await modelo.cerrarModal(true);
    expect(bloques.liberarTemporal).not.toHaveBeenCalled();
  });

  test('despacha el evento de cierre con la fecha por defecto', async () => {
    const { modelo, bloques } = crearModelo({ conBloque: true });
    bloques.liberarTemporal.mockResolvedValue(true);
    modelo._fecha = FECHA;
    await modelo.cerrarModal();
    expect(buscarEvento('paciente:reservaCerrarModal').detail.fecha).toBe(FECHA);
  });
});

describe('Estado inicial de la reserva', () => {
  test('inicializar establece el pacienteId y el usuario', () => {
    const usuarioActual = usuario(false);
    const repos = reposReserva();
    const modelo = new ModeloReserva(repos.citas, repos.bloques, repos.citasPsi);
    modelo.inicializar('paciente-123', usuarioActual);
    expect(modelo._pacienteId).toBe('paciente-123');
    expect(modelo._usuario).toEqual(usuarioActual);
  });
});
