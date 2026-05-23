import { describe, test, expect, beforeEach, vi } from 'vitest';
import { ModeloReprogramacion } from '../src/cliente/paciente/modelos/ModeloReprogramacion.js';
import { FormateadorFecha } from '../src/cliente/compartido/formateadores/FormateadorFecha.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('HU-08 · Reprogramación de Citas', () => {
  test('bloquea reprogramación cuando faltan menos de 24 horas', () => {
    const modelo = new ModeloReprogramacion();
    const ahora = new Date();
    const en12horas = new Date(ahora.getTime() + 12 * 3600000);

    const mes = FormateadorFecha.MESES[en12horas.getMonth()];
    const fechaTexto = `${en12horas.getDate()} de ${mes}`;
    const horaTexto = `${String(en12horas.getHours()).padStart(2, '0')}:${String(en12horas.getMinutes()).padStart(2, '0')}`;

    modelo.iniciar('cita-001', fechaTexto, horaTexto);

    expect(modelo.getModoActivo()).toBe(false);
  });

  test('permite reprogramación cuando faltan más de 24 horas', () => {
    const modelo = new ModeloReprogramacion();
    const ahora = new Date();
    const en48horas = new Date(ahora.getTime() + 48 * 3600000);

    const mes = FormateadorFecha.MESES[en48horas.getMonth()];
    const fechaTexto = `${en48horas.getDate()} de ${mes}`;
    const horaTexto = `${String(en48horas.getHours()).padStart(2, '0')}:${String(en48horas.getMinutes()).padStart(2, '0')}`;

    modelo.iniciar('cita-001', fechaTexto, horaTexto);

    expect(modelo.getModoActivo()).toBe(true);
  });

  test('almacena el citaId cuando se inicia la reprogramación', () => {
    const modelo = new ModeloReprogramacion();
    const ahora = new Date();
    const en48horas = new Date(ahora.getTime() + 48 * 3600000);

    const mes = FormateadorFecha.MESES[en48horas.getMonth()];
    const fechaTexto = `${en48horas.getDate()} de ${mes}`;
    const horaTexto = `${String(en48horas.getHours()).padStart(2, '0')}:${String(en48horas.getMinutes()).padStart(2, '0')}`;

    modelo.iniciar('cita-002', fechaTexto, horaTexto);

    expect(modelo.getCitaId()).toBe('cita-002');
  });

  test('salir() restablece el modo activo a false', () => {
    const modelo = new ModeloReprogramacion();
    const ahora = new Date();
    const en48horas = new Date(ahora.getTime() + 48 * 3600000);

    const mes = FormateadorFecha.MESES[en48horas.getMonth()];
    const fechaTexto = `${en48horas.getDate()} de ${mes}`;
    const horaTexto = `${String(en48horas.getHours()).padStart(2, '0')}:${String(en48horas.getMinutes()).padStart(2, '0')}`;

    modelo.iniciar('cita-003', fechaTexto, horaTexto);
    expect(modelo.getModoActivo()).toBe(true);

    modelo.salir();
    expect(modelo.getModoActivo()).toBe(false);
  });

  test('iniciar dispara evento cuando hay > 24h', () => {
    const modelo = new ModeloReprogramacion();
    const ahora = new Date();
    const en48horas = new Date(ahora.getTime() + 48 * 3600000);

    const mes = FormateadorFecha.MESES[en48horas.getMonth()];
    const fechaTexto = `${en48horas.getDate()} de ${mes}`;
    const horaTexto = `${String(en48horas.getHours()).padStart(2, '0')}:${String(en48horas.getMinutes()).padStart(2, '0')}`;

    vi.spyOn(document, 'dispatchEvent');

    modelo.iniciar('cita-004', fechaTexto, horaTexto);

    const eventos = document.dispatchEvent.mock.calls.map((c) => c[0].type);
    expect(eventos).toContain('paciente:reprogramacionIniciada');
  });

  test('iniciar dispara error cuando hay < 24h', () => {
    const modelo = new ModeloReprogramacion();
    const ahora = new Date();
    const en12horas = new Date(ahora.getTime() + 12 * 3600000);

    const mes = FormateadorFecha.MESES[en12horas.getMonth()];
    const fechaTexto = `${en12horas.getDate()} de ${mes}`;
    const horaTexto = `${String(en12horas.getHours()).padStart(2, '0')}:${String(en12horas.getMinutes()).padStart(2, '0')}`;

    vi.spyOn(document, 'dispatchEvent');

    modelo.iniciar('cita-005', fechaTexto, horaTexto);

    const eventos = document.dispatchEvent.mock.calls.map((c) => c[0]);
    const mensajeError = eventos.find((e) => e.type === 'paciente:mensaje' && e.detail?.tipo === 'error');
    expect(mensajeError).toBeTruthy();
  });

  test('iniciar no hace nada si citaId es null', () => {
    const modelo = new ModeloReprogramacion();
    const ahora = new Date();
    const en48horas = new Date(ahora.getTime() + 48 * 3600000);

    const mes = FormateadorFecha.MESES[en48horas.getMonth()];
    const fechaTexto = `${en48horas.getDate()} de ${mes}`;
    const horaTexto = `${String(en48horas.getHours()).padStart(2, '0')}:${String(en48horas.getMinutes()).padStart(2, '0')}`;

    vi.spyOn(document, 'dispatchEvent');

    modelo.iniciar(null, fechaTexto, horaTexto);

    expect(modelo.getModoActivo()).toBe(false);
    expect(document.dispatchEvent).not.toHaveBeenCalled();
  });

  test('iniciar retorna false cuando fechaTexto es vacío', () => {
    const modelo = new ModeloReprogramacion();
    const ahora = new Date();
    const en48horas = new Date(ahora.getTime() + 48 * 3600000);
    const horaTexto = `${String(en48horas.getHours()).padStart(2, '0')}:${String(en48horas.getMinutes()).padStart(2, '0')}`;

    vi.spyOn(document, 'dispatchEvent');

    modelo.iniciar('cita-006', '', horaTexto);

    const eventos = document.dispatchEvent.mock.calls.map((c) => c[0]);
    const mensajeError = eventos.find((e) => e.type === 'paciente:mensaje' && e.detail?.tipo === 'error');
    expect(mensajeError).toBeTruthy();
  });

  test('iniciar retorna true cuando formato de fecha es inválido (sin " de ")', () => {
    const modelo = new ModeloReprogramacion();
    const ahora = new Date();
    const en48horas = new Date(ahora.getTime() + 48 * 3600000);
    const horaTexto = `${String(en48horas.getHours()).padStart(2, '0')}:${String(en48horas.getMinutes()).padStart(2, '0')}`;

    vi.spyOn(document, 'dispatchEvent');

    modelo.iniciar('cita-007', '22-05-2026', horaTexto);

    const eventos = document.dispatchEvent.mock.calls.map((c) => c[0]);
    const reprogramacion = eventos.find((e) => e.type === 'paciente:reprogramacionIniciada');
    expect(reprogramacion).toBeTruthy();
    expect(modelo.getModoActivo()).toBe(true);
  });

  test('iniciar retorna true cuando mes es inválido', () => {
    const modelo = new ModeloReprogramacion();
    const ahora = new Date();
    const en48horas = new Date(ahora.getTime() + 48 * 3600000);
    const horaTexto = `${String(en48horas.getHours()).padStart(2, '0')}:${String(en48horas.getMinutes()).padStart(2, '0')}`;

    vi.spyOn(document, 'dispatchEvent');

    modelo.iniciar('cita-008', '22 de MesInvalido', horaTexto);

    const eventos = document.dispatchEvent.mock.calls.map((c) => c[0]);
    const reprogramacion = eventos.find((e) => e.type === 'paciente:reprogramacionIniciada');
    expect(reprogramacion).toBeTruthy();
    expect(modelo.getModoActivo()).toBe(true);
  });

  test('salir limpia citaId', () => {
    const modelo = new ModeloReprogramacion();
    const ahora = new Date();
    const en48horas = new Date(ahora.getTime() + 48 * 3600000);

    const mes = FormateadorFecha.MESES[en48horas.getMonth()];
    const fechaTexto = `${en48horas.getDate()} de ${mes}`;
    const horaTexto = `${String(en48horas.getHours()).padStart(2, '0')}:${String(en48horas.getMinutes()).padStart(2, '0')}`;

    modelo.iniciar('cita-009', fechaTexto, horaTexto);
    expect(modelo.getCitaId()).toBe('cita-009');

    vi.spyOn(document, 'dispatchEvent');
    modelo.salir();

    expect(modelo.getCitaId()).toBeNull();
    const evento = document.dispatchEvent.mock.calls.map((c) => c[0]).find((e) => e.type === 'paciente:reprogramacionCancelada');
    expect(evento).toBeTruthy();
  });
});
