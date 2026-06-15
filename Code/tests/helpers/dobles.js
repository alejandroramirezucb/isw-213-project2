import { vi } from 'vitest';

export function reposReserva() {
  return {
    citas: { crear: vi.fn(), cancelar: vi.fn(), crearNotificacion: vi.fn() },
    bloques: {
      bloquearTemporal: vi.fn(),
      liberarTemporal: vi.fn(),
      obtenerProfesional: vi.fn(),
      marcarReservado: vi.fn(),
    },
    citasPsi: { crearNotificacionNuevoTurno: vi.fn() },
  };
}

export function repoNotificaciones() {
  return {
    obtenerTodas: vi.fn().mockResolvedValue([]),
    obtenerConteoNoLeidas: vi.fn().mockResolvedValue(0),
    marcarComoLeida: vi.fn().mockResolvedValue(true),
    marcarTodasLeidasDelPaciente: vi.fn(),
  };
}

export function repoListaEspera() {
  return {
    estaEnEspera: vi.fn(),
    anadirAEspera: vi.fn(),
    obtenerPosicion: vi.fn(),
  };
}

export function usuario(bloqueado) {
  return { pacientes: { bloqueado } };
}
