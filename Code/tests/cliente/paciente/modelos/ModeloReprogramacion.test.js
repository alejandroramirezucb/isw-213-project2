import { describe, test, expect, beforeEach, vi } from 'vitest';
import { ModeloReprogramacion } from '../../../../src/cliente/paciente/modelos/ModeloReprogramacion.js';
import { capturarEventos, tiposDespachados, buscarMensaje } from '../../../helpers/eventos.js';
import { fechaRelativaEnHoras } from '../../../helpers/tiempo.js';

const DENTRO_DE_24H = 12;
const FUERA_DE_24H = 48;

function iniciarEnHoras(horas, citaId = 'cita-1') {
  const modelo = new ModeloReprogramacion();
  const { fechaTexto, horaTexto } = fechaRelativaEnHoras(horas);
  modelo.iniciar(citaId, fechaTexto, horaTexto);
  return modelo;
}

beforeEach(() => {
  vi.clearAllMocks();
  capturarEventos();
});

describe('HU-08 Regla de las 24 horas', () => {
  test('bloquea la reprogramación cuando faltan menos de 24 horas', () => {
    expect(iniciarEnHoras(DENTRO_DE_24H).getModoActivo()).toBe(false);
  });

  test('permite la reprogramación cuando faltan más de 24 horas', () => {
    expect(iniciarEnHoras(FUERA_DE_24H).getModoActivo()).toBe(true);
  });

  test('despacha reprogramacionIniciada cuando hay más de 24 horas', () => {
    iniciarEnHoras(FUERA_DE_24H);
    expect(tiposDespachados()).toContain('paciente:reprogramacionIniciada');
  });

  test('despacha un mensaje de error cuando hay menos de 24 horas', () => {
    iniciarEnHoras(DENTRO_DE_24H);
    expect(buscarMensaje('error')).toBeTruthy();
  });
});

describe('HU-08 Estado de la reprogramación', () => {
  test('almacena el citaId al iniciar', () => {
    expect(iniciarEnHoras(FUERA_DE_24H, 'cita-2').getCitaId()).toBe('cita-2');
  });

  test('salir desactiva el modo y limpia el citaId', () => {
    const modelo = iniciarEnHoras(FUERA_DE_24H, 'cita-3');
    modelo.salir();
    expect(modelo.getModoActivo()).toBe(false);
    expect(modelo.getCitaId()).toBeNull();
  });
});

describe('HU-08 Validacion de la entrada', () => {
  function iniciarConFecha(fechaTexto) {
    const modelo = new ModeloReprogramacion();
    const { horaTexto } = fechaRelativaEnHoras(FUERA_DE_24H);
    modelo.iniciar('cita-4', fechaTexto, horaTexto);
    return modelo;
  }

  test('no hace nada cuando el citaId es nulo', () => {
    const modelo = new ModeloReprogramacion();
    const { fechaTexto, horaTexto } = fechaRelativaEnHoras(FUERA_DE_24H);
    modelo.iniciar(null, fechaTexto, horaTexto);
    expect(modelo.getModoActivo()).toBe(false);
    expect(document.dispatchEvent).not.toHaveBeenCalled();
  });

  test('rechaza cuando la fecha está vacía', () => {
    iniciarConFecha('');
    expect(buscarMensaje('error')).toBeTruthy();
  });

  test('permite cuando la fecha no tiene el separador " de "', () => {
    expect(iniciarConFecha('22-05-2026').getModoActivo()).toBe(true);
  });

  test('permite cuando el mes no es interpretable', () => {
    expect(iniciarConFecha('22 de MesInvalido').getModoActivo()).toBe(true);
  });
});
