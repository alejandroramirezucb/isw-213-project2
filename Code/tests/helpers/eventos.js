import { vi } from 'vitest';

export function capturarEventos() {
  vi.spyOn(document, 'dispatchEvent');
}

export function eventosDespachados() {
  return document.dispatchEvent.mock.calls.map((llamada) => llamada[0]);
}

export function tiposDespachados() {
  return eventosDespachados().map((evento) => evento.type);
}

export function buscarEvento(tipo) {
  return eventosDespachados().find((evento) => evento.type === tipo);
}

export function buscarMensaje(tipo) {
  return eventosDespachados().find(
    (evento) => evento.type === 'paciente:mensaje' && evento.detail?.tipo === tipo,
  );
}
