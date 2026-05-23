import { describe, test, expect, beforeEach, vi } from 'vitest';
import { ModeloReserva } from '../src/cliente/paciente/modelos/ModeloReserva.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('HU-15 · Restricción de Pacientes', () => {
  test('paciente bloqueado recibe mensaje de error al intentar confirmar reserva', async () => {
    const repositorioCitasMock = { crear: vi.fn(), cancelar: vi.fn(), crearNotificacion: vi.fn() };
    const repositoriosBloquesMock = {
      bloquearTemporal: vi.fn(),
      liberarTemporal: vi.fn(),
      obtenerProfesional: vi.fn(),
      marcarReservado: vi.fn(),
    };
    const repositorioCitasPsiMock = { crearNotificacionNuevoTurno: vi.fn() };

    vi.spyOn(document, 'dispatchEvent');

    const modelo = new ModeloReserva(repositorioCitasMock, repositoriosBloquesMock, repositorioCitasPsiMock);
    modelo._bloqueId = 'bloque-xyz';
    modelo.inicializar('paciente-1', { pacientes: { bloqueado: true } });

    await modelo.confirmar();

    const llamadas = document.dispatchEvent.mock.calls.map((c) => c[0]);
    const mensajeError = llamadas.find((e) => e.type === 'paciente:mensaje' && e.detail?.tipo === 'error');
    expect(mensajeError).toBeTruthy();
    expect(repositorioCitasMock.crear).not.toHaveBeenCalled();
  });


  test('reserva no se persiste cuando paciente está bloqueado', async () => {
    const repositorioCitasMock = { crear: vi.fn(), cancelar: vi.fn(), crearNotificacion: vi.fn() };
    const repositoriosBloquesMock = {
      bloquearTemporal: vi.fn(),
      liberarTemporal: vi.fn(),
      obtenerProfesional: vi.fn(),
      marcarReservado: vi.fn(),
    };
    const repositorioCitasPsiMock = { crearNotificacionNuevoTurno: vi.fn() };

    const modelo = new ModeloReserva(repositorioCitasMock, repositoriosBloquesMock, repositorioCitasPsiMock);
    modelo._bloqueId = 'bloque-xyz';
    modelo.inicializar('paciente-1', { pacientes: { bloqueado: true } });

    await modelo.confirmar();

    expect(repositorioCitasMock.crear).not.toHaveBeenCalled();
  });

  test('seleccionar bloque rechaza si paciente está bloqueado', async () => {
    const repositorioCitasMock = { crear: vi.fn(), cancelar: vi.fn(), crearNotificacion: vi.fn() };
    const repositoriosBloquesMock = {
      bloquearTemporal: vi.fn(),
      liberarTemporal: vi.fn(),
      obtenerProfesional: vi.fn(),
      marcarReservado: vi.fn(),
    };
    const repositorioCitasPsiMock = { crearNotificacionNuevoTurno: vi.fn() };

    vi.spyOn(document, 'dispatchEvent');

    const modelo = new ModeloReserva(repositorioCitasMock, repositoriosBloquesMock, repositorioCitasPsiMock);
    modelo.inicializar('paciente-1', { pacientes: { bloqueado: true } });

    await modelo.seleccionarBloque('bloque-xyz', '2026-05-22');

    const eventos = document.dispatchEvent.mock.calls.map((c) => c[0]);
    const mensajeError = eventos.find((e) => e.type === 'paciente:mensaje' && e.detail?.tipo === 'error');
    expect(mensajeError).toBeTruthy();
    expect(repositoriosBloquesMock.bloquearTemporal).not.toHaveBeenCalled();
  });

  test('inicializar establece pacienteId y usuario', () => {
    const repositorioCitasMock = { crear: vi.fn(), cancelar: vi.fn(), crearNotificacion: vi.fn() };
    const repositoriosBloquesMock = {
      bloquearTemporal: vi.fn(),
      liberarTemporal: vi.fn(),
      obtenerProfesional: vi.fn(),
      marcarReservado: vi.fn(),
    };
    const repositorioCitasPsiMock = { crearNotificacionNuevoTurno: vi.fn() };

    const modelo = new ModeloReserva(repositorioCitasMock, repositoriosBloquesMock, repositorioCitasPsiMock);
    const usuario = { pacientes: { bloqueado: false } };

    modelo.inicializar('paciente-123', usuario);

    expect(modelo._pacienteId).toBe('paciente-123');
    expect(modelo._usuario).toEqual(usuario);
  });

  test('getBloqueId retorna el bloque seleccionado', async () => {
    const repositorioCitasMock = { crear: vi.fn(), cancelar: vi.fn(), crearNotificacion: vi.fn() };
    const repositoriosBloquesMock = {
      bloquearTemporal: vi.fn().mockResolvedValue(true),
      liberarTemporal: vi.fn(),
      obtenerProfesional: vi.fn(),
      marcarReservado: vi.fn(),
    };
    const repositorioCitasPsiMock = { crearNotificacionNuevoTurno: vi.fn() };

    vi.spyOn(document, 'dispatchEvent');

    const modelo = new ModeloReserva(repositorioCitasMock, repositoriosBloquesMock, repositorioCitasPsiMock);
    modelo.inicializar('paciente-1', { pacientes: { bloqueado: false } });

    await modelo.seleccionarBloque('bloque-xyz', '2026-05-22');

    expect(modelo.getBloqueId()).toBe('bloque-xyz');
  });

  test('getFecha retorna la fecha seleccionada', async () => {
    const repositorioCitasMock = { crear: vi.fn(), cancelar: vi.fn(), crearNotificacion: vi.fn() };
    const repositoriosBloquesMock = {
      bloquearTemporal: vi.fn().mockResolvedValue(true),
      liberarTemporal: vi.fn(),
      obtenerProfesional: vi.fn(),
      marcarReservado: vi.fn(),
    };
    const repositorioCitasPsiMock = { crearNotificacionNuevoTurno: vi.fn() };

    vi.spyOn(document, 'dispatchEvent');

    const modelo = new ModeloReserva(repositorioCitasMock, repositoriosBloquesMock, repositorioCitasPsiMock);
    modelo.inicializar('paciente-1', { pacientes: { bloqueado: false } });

    await modelo.seleccionarBloque('bloque-xyz', '2026-05-22');

    expect(modelo.getFecha()).toBe('2026-05-22');
  });

  test('seleccionarBloque bloquea temporal cuando éxito', async () => {
    const repositorioCitasMock = { crear: vi.fn(), cancelar: vi.fn(), crearNotificacion: vi.fn() };
    const repositoriosBloquesMock = {
      bloquearTemporal: vi.fn().mockResolvedValue(true),
      liberarTemporal: vi.fn(),
      obtenerProfesional: vi.fn(),
      marcarReservado: vi.fn(),
    };
    const repositorioCitasPsiMock = { crearNotificacionNuevoTurno: vi.fn() };

    vi.spyOn(document, 'dispatchEvent');

    const modelo = new ModeloReserva(repositorioCitasMock, repositoriosBloquesMock, repositorioCitasPsiMock);
    modelo.inicializar('paciente-1', { pacientes: { bloqueado: false } });

    await modelo.seleccionarBloque('bloque-xyz', '2026-05-22');

    expect(repositoriosBloquesMock.bloquearTemporal).toHaveBeenCalledWith('bloque-xyz');
  });

  test('seleccionarBloque dispara evento cuando bloque no disponible', async () => {
    const repositorioCitasMock = { crear: vi.fn(), cancelar: vi.fn(), crearNotificacion: vi.fn() };
    const repositoriosBloquesMock = {
      bloquearTemporal: vi.fn().mockResolvedValue(false),
      liberarTemporal: vi.fn(),
      obtenerProfesional: vi.fn(),
      marcarReservado: vi.fn(),
    };
    const repositorioCitasPsiMock = { crearNotificacionNuevoTurno: vi.fn() };

    vi.spyOn(document, 'dispatchEvent');

    const modelo = new ModeloReserva(repositorioCitasMock, repositoriosBloquesMock, repositorioCitasPsiMock);
    modelo.inicializar('paciente-1', { pacientes: { bloqueado: false } });

    await modelo.seleccionarBloque('bloque-xyz', '2026-05-22');

    const eventos = document.dispatchEvent.mock.calls.map((c) => c[0]);
    const bloqueNoDisponible = eventos.find((e) => e.type === 'paciente:bloqueNoDisponible');
    expect(bloqueNoDisponible).toBeTruthy();
  });

  test('seleccionarBloque maneja excepciones', async () => {
    const repositorioCitasMock = { crear: vi.fn(), cancelar: vi.fn(), crearNotificacion: vi.fn() };
    const repositoriosBloquesMock = {
      bloquearTemporal: vi.fn().mockRejectedValue(new Error('DB Error')),
      liberarTemporal: vi.fn(),
      obtenerProfesional: vi.fn(),
      marcarReservado: vi.fn(),
    };
    const repositorioCitasPsiMock = { crearNotificacionNuevoTurno: vi.fn() };

    vi.spyOn(document, 'dispatchEvent');

    const modelo = new ModeloReserva(repositorioCitasMock, repositoriosBloquesMock, repositorioCitasPsiMock);
    modelo.inicializar('paciente-1', { pacientes: { bloqueado: false } });

    await modelo.seleccionarBloque('bloque-xyz', '2026-05-22');

    const eventos = document.dispatchEvent.mock.calls.map((c) => c[0]);
    const error = eventos.find((e) => e.type === 'paciente:mensaje' && e.detail?.tipo === 'error');
    expect(error).toBeTruthy();
  });

  test('confirmar retorna si confirmando está activo', async () => {
    const repositorioCitasMock = { crear: vi.fn(), cancelar: vi.fn(), crearNotificacion: vi.fn() };
    const repositoriosBloquesMock = {
      bloquearTemporal: vi.fn(),
      liberarTemporal: vi.fn(),
      obtenerProfesional: vi.fn(),
      marcarReservado: vi.fn(),
    };
    const repositorioCitasPsiMock = { crearNotificacionNuevoTurno: vi.fn() };

    const modelo = new ModeloReserva(repositorioCitasMock, repositoriosBloquesMock, repositorioCitasPsiMock);
    modelo._confirmando = true;
    modelo.inicializar('paciente-1', { pacientes: { bloqueado: false } });

    await modelo.confirmar();

    expect(repositorioCitasMock.crear).not.toHaveBeenCalled();
  });

  test('confirmar retorna error si falta bloqueId', async () => {
    const repositorioCitasMock = { crear: vi.fn(), cancelar: vi.fn(), crearNotificacion: vi.fn() };
    const repositoriosBloquesMock = {
      bloquearTemporal: vi.fn(),
      liberarTemporal: vi.fn(),
      obtenerProfesional: vi.fn(),
      marcarReservado: vi.fn(),
    };
    const repositorioCitasPsiMock = { crearNotificacionNuevoTurno: vi.fn() };

    vi.spyOn(document, 'dispatchEvent');

    const modelo = new ModeloReserva(repositorioCitasMock, repositoriosBloquesMock, repositorioCitasPsiMock);
    modelo.inicializar('paciente-1', { pacientes: { bloqueado: false } });

    await modelo.confirmar();

    const eventos = document.dispatchEvent.mock.calls.map((c) => c[0]);
    const error = eventos.find((e) => e.type === 'paciente:mensaje' && e.detail?.tipo === 'error');
    expect(error).toBeTruthy();
  });

  test('confirmar exitoso crea cita y notificaciones', async () => {
    const repositorioCitasMock = { crear: vi.fn().mockResolvedValue('cita-123'), cancelar: vi.fn(), crearNotificacion: vi.fn().mockResolvedValue(true) };
    const repositoriosBloquesMock = {
      bloquearTemporal: vi.fn().mockResolvedValue(true),
      liberarTemporal: vi.fn(),
      obtenerProfesional: vi.fn().mockResolvedValue({ psicologo_id: 'psi-1' }),
      marcarReservado: vi.fn(),
    };
    const repositorioCitasPsiMock = { crearNotificacionNuevoTurno: vi.fn().mockResolvedValue(true) };

    vi.spyOn(document, 'dispatchEvent');

    const modelo = new ModeloReserva(repositorioCitasMock, repositoriosBloquesMock, repositorioCitasPsiMock);
    modelo.inicializar('paciente-1', { pacientes: { bloqueado: false } });
    modelo._bloqueId = 'bloque-xyz';

    await modelo.confirmar();

    expect(repositorioCitasMock.crear).toHaveBeenCalled();
    expect(repositorioCitasMock.crearNotificacion).toHaveBeenCalled();
    expect(repositorioCitasPsiMock.crearNotificacionNuevoTurno).toHaveBeenCalled();
  });

  test('confirmar con reprogramación cancela cita anterior', async () => {
    const repositorioCitasMock = { crear: vi.fn().mockResolvedValue('cita-456'), cancelar: vi.fn().mockResolvedValue(true), crearNotificacion: vi.fn().mockResolvedValue(true) };
    const repositoriosBloquesMock = {
      bloquearTemporal: vi.fn().mockResolvedValue(true),
      liberarTemporal: vi.fn(),
      obtenerProfesional: vi.fn().mockResolvedValue({ psicologo_id: 'psi-1' }),
      marcarReservado: vi.fn(),
    };
    const repositorioCitasPsiMock = { crearNotificacionNuevoTurno: vi.fn().mockResolvedValue(true) };

    vi.spyOn(document, 'dispatchEvent');

    const modelo = new ModeloReserva(repositorioCitasMock, repositoriosBloquesMock, repositorioCitasPsiMock);
    modelo.inicializar('paciente-1', { pacientes: { bloqueado: false } });
    modelo._bloqueId = 'bloque-xyz';

    await modelo.confirmar(true, 'cita-anterior-123');

    expect(repositorioCitasMock.cancelar).toHaveBeenCalledWith('cita-anterior-123');
  });

  test('confirmar maneja error cuando bloque no válido', async () => {
    const repositorioCitasMock = { crear: vi.fn(), cancelar: vi.fn(), crearNotificacion: vi.fn() };
    const repositoriosBloquesMock = {
      bloquearTemporal: vi.fn(),
      liberarTemporal: vi.fn(),
      obtenerProfesional: vi.fn().mockResolvedValue({ psicologo_id: null }),
      marcarReservado: vi.fn(),
    };
    const repositorioCitasPsiMock = { crearNotificacionNuevoTurno: vi.fn() };

    vi.spyOn(document, 'dispatchEvent');

    const modelo = new ModeloReserva(repositorioCitasMock, repositoriosBloquesMock, repositorioCitasPsiMock);
    modelo.inicializar('paciente-1', { pacientes: { bloqueado: false } });
    modelo._bloqueId = 'bloque-xyz';

    await modelo.confirmar();

    const eventos = document.dispatchEvent.mock.calls.map((c) => c[0]);
    const error = eventos.find((e) => e.type === 'paciente:mensaje' && e.detail?.tipo === 'error');
    expect(error).toBeTruthy();
  });

  test('confirmar libera bloque temporal si crear falla', async () => {
    const repositorioCitasMock = { crear: vi.fn().mockRejectedValue(new Error('DB Error')), cancelar: vi.fn(), crearNotificacion: vi.fn() };
    const repositoriosBloquesMock = {
      bloquearTemporal: vi.fn(),
      liberarTemporal: vi.fn().mockResolvedValue(true),
      obtenerProfesional: vi.fn().mockResolvedValue({ psicologo_id: 'psi-1' }),
      marcarReservado: vi.fn(),
    };
    const repositorioCitasPsiMock = { crearNotificacionNuevoTurno: vi.fn() };

    vi.spyOn(document, 'dispatchEvent');

    const modelo = new ModeloReserva(repositorioCitasMock, repositoriosBloquesMock, repositorioCitasPsiMock);
    modelo.inicializar('paciente-1', { pacientes: { bloqueado: false } });
    modelo._bloqueId = 'bloque-xyz';

    await modelo.confirmar();

    expect(repositoriosBloquesMock.liberarTemporal).toHaveBeenCalledWith('bloque-xyz');
  });

  test('confirmar maneja race condition', async () => {
    const repositorioCitasMock = { crear: vi.fn().mockRejectedValue(new Error('bloque ya fue reservado')), cancelar: vi.fn(), crearNotificacion: vi.fn() };
    const repositoriosBloquesMock = {
      bloquearTemporal: vi.fn(),
      liberarTemporal: vi.fn(),
      obtenerProfesional: vi.fn().mockResolvedValue({ psicologo_id: 'psi-1' }),
      marcarReservado: vi.fn(),
    };
    const repositorioCitasPsiMock = { crearNotificacionNuevoTurno: vi.fn() };

    vi.spyOn(document, 'dispatchEvent');

    const modelo = new ModeloReserva(repositorioCitasMock, repositoriosBloquesMock, repositorioCitasPsiMock);
    modelo.inicializar('paciente-1', { pacientes: { bloqueado: false } });
    modelo._bloqueId = 'bloque-xyz';

    await modelo.confirmar();

    const eventos = document.dispatchEvent.mock.calls.map((c) => c[0]);
    const error = eventos.find((e) => e.type === 'paciente:mensaje');
    expect(error?.detail?.texto).toContain('Intenta con otro');
  });

  test('cerrarModal libera bloque si no exitosa', async () => {
    const repositorioCitasMock = { crear: vi.fn(), cancelar: vi.fn(), crearNotificacion: vi.fn() };
    const repositoriosBloquesMock = {
      bloquearTemporal: vi.fn(),
      liberarTemporal: vi.fn().mockResolvedValue(true),
      obtenerProfesional: vi.fn(),
      marcarReservado: vi.fn(),
    };
    const repositorioCitasPsiMock = { crearNotificacionNuevoTurno: vi.fn() };

    vi.spyOn(document, 'dispatchEvent');

    const modelo = new ModeloReserva(repositorioCitasMock, repositoriosBloquesMock, repositorioCitasPsiMock);
    modelo._bloqueId = 'bloque-xyz';
    modelo._fecha = '2026-05-22';

    await modelo.cerrarModal(false);

    expect(repositoriosBloquesMock.liberarTemporal).toHaveBeenCalledWith('bloque-xyz');
  });

  test('cerrarModal no libera bloque si exitosa', async () => {
    const repositorioCitasMock = { crear: vi.fn(), cancelar: vi.fn(), crearNotificacion: vi.fn() };
    const repositoriosBloquesMock = {
      bloquearTemporal: vi.fn(),
      liberarTemporal: vi.fn().mockResolvedValue(true),
      obtenerProfesional: vi.fn(),
      marcarReservado: vi.fn(),
    };
    const repositorioCitasPsiMock = { crearNotificacionNuevoTurno: vi.fn() };

    vi.spyOn(document, 'dispatchEvent');

    const modelo = new ModeloReserva(repositorioCitasMock, repositoriosBloquesMock, repositorioCitasPsiMock);
    modelo._bloqueId = 'bloque-xyz';

    await modelo.cerrarModal(true);

    expect(repositoriosBloquesMock.liberarTemporal).not.toHaveBeenCalled();
  });

  test('cerrarModal dispara evento', async () => {
    const repositorioCitasMock = { crear: vi.fn(), cancelar: vi.fn(), crearNotificacion: vi.fn() };
    const repositoriosBloquesMock = {
      bloquearTemporal: vi.fn(),
      liberarTemporal: vi.fn(),
      obtenerProfesional: vi.fn(),
      marcarReservado: vi.fn(),
    };
    const repositorioCitasPsiMock = { crearNotificacionNuevoTurno: vi.fn() };

    vi.spyOn(document, 'dispatchEvent');

    const modelo = new ModeloReserva(repositorioCitasMock, repositoriosBloquesMock, repositorioCitasPsiMock);
    modelo._fecha = '2026-05-22';

    await modelo.cerrarModal(true);

    const eventos = document.dispatchEvent.mock.calls.map((c) => c[0]);
    const cerrar = eventos.find((e) => e.type === 'paciente:reservaCerrarModal');
    expect(cerrar).toBeTruthy();
  });

  test('confirmar maneja error en obtenerProfesional', async () => {
    const repositorioCitasMock = { crear: vi.fn(), cancelar: vi.fn(), crearNotificacion: vi.fn() };
    const repositoriosBloquesMock = {
      bloquearTemporal: vi.fn(),
      liberarTemporal: vi.fn().mockResolvedValue(true),
      obtenerProfesional: vi.fn().mockRejectedValue(new Error('DB Error')),
      marcarReservado: vi.fn(),
    };
    const repositorioCitasPsiMock = { crearNotificacionNuevoTurno: vi.fn() };

    vi.spyOn(document, 'dispatchEvent');

    const modelo = new ModeloReserva(repositorioCitasMock, repositoriosBloquesMock, repositorioCitasPsiMock);
    modelo.inicializar('paciente-1', { pacientes: { bloqueado: false } });
    modelo._bloqueId = 'bloque-xyz';

    await modelo.confirmar();

    expect(repositoriosBloquesMock.liberarTemporal).toHaveBeenCalledWith('bloque-xyz');
    const eventos = document.dispatchEvent.mock.calls.map((c) => c[0]);
    const error = eventos.find((e) => e.type === 'paciente:mensaje' && e.detail?.tipo === 'error');
    expect(error).toBeTruthy();
  });

  test('mapearError con "duplicate" retorna mensaje específico', async () => {
    const repositorioCitasMock = { crear: vi.fn().mockRejectedValue(new Error('duplicate key')), cancelar: vi.fn(), crearNotificacion: vi.fn() };
    const repositoriosBloquesMock = {
      bloquearTemporal: vi.fn(),
      liberarTemporal: vi.fn(),
      obtenerProfesional: vi.fn().mockResolvedValue({ psicologo_id: 'psi-1' }),
      marcarReservado: vi.fn(),
    };
    const repositorioCitasPsiMock = { crearNotificacionNuevoTurno: vi.fn() };

    vi.spyOn(document, 'dispatchEvent');

    const modelo = new ModeloReserva(repositorioCitasMock, repositoriosBloquesMock, repositorioCitasPsiMock);
    modelo.inicializar('paciente-1', { pacientes: { bloqueado: false } });
    modelo._bloqueId = 'bloque-xyz';

    await modelo.confirmar();

    const eventos = document.dispatchEvent.mock.calls.map((c) => c[0]);
    const error = eventos.find((e) => e.type === 'paciente:mensaje');
    expect(error?.detail?.texto).toContain('fue tomado');
  });

  test('mapearError con "disponible" retorna mensaje específico', async () => {
    const repositorioCitasMock = { crear: vi.fn().mockRejectedValue(new Error('no disponible')), cancelar: vi.fn(), crearNotificacion: vi.fn() };
    const repositoriosBloquesMock = {
      bloquearTemporal: vi.fn(),
      liberarTemporal: vi.fn(),
      obtenerProfesional: vi.fn().mockResolvedValue({ psicologo_id: 'psi-1' }),
      marcarReservado: vi.fn(),
    };
    const repositorioCitasPsiMock = { crearNotificacionNuevoTurno: vi.fn() };

    vi.spyOn(document, 'dispatchEvent');

    const modelo = new ModeloReserva(repositorioCitasMock, repositoriosBloquesMock, repositorioCitasPsiMock);
    modelo.inicializar('paciente-1', { pacientes: { bloqueado: false } });
    modelo._bloqueId = 'bloque-xyz';

    await modelo.confirmar();

    const eventos = document.dispatchEvent.mock.calls.map((c) => c[0]);
    const error = eventos.find((e) => e.type === 'paciente:mensaje');
    expect(error?.detail?.texto).toContain('no está disponible');
  });

  test('confirmar maneja cuando crear retorna null/falsy', async () => {
    const repositorioCitasMock = { crear: vi.fn().mockResolvedValue(null), cancelar: vi.fn(), crearNotificacion: vi.fn() };
    const repositoriosBloquesMock = {
      bloquearTemporal: vi.fn(),
      liberarTemporal: vi.fn(),
      obtenerProfesional: vi.fn().mockResolvedValue({ psicologo_id: 'psi-1' }),
      marcarReservado: vi.fn(),
    };
    const repositorioCitasPsiMock = { crearNotificacionNuevoTurno: vi.fn() };

    vi.spyOn(document, 'dispatchEvent');

    const modelo = new ModeloReserva(repositorioCitasMock, repositoriosBloquesMock, repositorioCitasPsiMock);
    modelo.inicializar('paciente-1', { pacientes: { bloqueado: false } });
    modelo._bloqueId = 'bloque-xyz';

    await modelo.confirmar();

    const eventos = document.dispatchEvent.mock.calls.map((c) => c[0]);
    const error = eventos.find((e) => e.type === 'paciente:mensaje');
    expect(error?.detail?.texto).toContain('intenta de nuevo');
  });

  test('cerrarModal usa default parameter reservaExitosa', async () => {
    const repositorioCitasMock = { crear: vi.fn(), cancelar: vi.fn(), crearNotificacion: vi.fn() };
    const repositoriosBloquesMock = {
      bloquearTemporal: vi.fn(),
      liberarTemporal: vi.fn().mockResolvedValue(true),
      obtenerProfesional: vi.fn(),
      marcarReservado: vi.fn(),
    };
    const repositorioCitasPsiMock = { crearNotificacionNuevoTurno: vi.fn() };

    vi.spyOn(document, 'dispatchEvent');

    const modelo = new ModeloReserva(repositorioCitasMock, repositoriosBloquesMock, repositorioCitasPsiMock);
    modelo._bloqueId = 'bloque-xyz';
    modelo._fecha = '2026-05-22';

    await modelo.cerrarModal();

    const eventos = document.dispatchEvent.mock.calls.map((c) => c[0]);
    const cerrar = eventos.find((e) => e.type === 'paciente:reservaCerrarModal');
    expect(cerrar?.detail?.fecha).toBe('2026-05-22');
  });

  test('mapearError con "bloque ya fue reservado" retorna mensaje específico', async () => {
    const repositorioCitasMock = { crear: vi.fn().mockRejectedValue(new Error('bloque ya fue reservado')), cancelar: vi.fn(), crearNotificacion: vi.fn() };
    const repositoriosBloquesMock = {
      bloquearTemporal: vi.fn(),
      liberarTemporal: vi.fn(),
      obtenerProfesional: vi.fn().mockResolvedValue({ psicologo_id: 'psi-1' }),
      marcarReservado: vi.fn(),
    };
    const repositorioCitasPsiMock = { crearNotificacionNuevoTurno: vi.fn() };

    vi.spyOn(document, 'dispatchEvent');

    const modelo = new ModeloReserva(repositorioCitasMock, repositoriosBloquesMock, repositorioCitasPsiMock);
    modelo.inicializar('paciente-1', { pacientes: { bloqueado: false } });
    modelo._bloqueId = 'bloque-xyz';

    await modelo.confirmar();

    const eventos = document.dispatchEvent.mock.calls.map((c) => c[0]);
    const error = eventos.find((e) => e.type === 'paciente:mensaje');
    expect(error?.detail?.texto).toContain('ya está reservado');
  });
});
