import { FormateadorFecha } from '../../src/cliente/compartido/formateadores/FormateadorFecha.js';

const MS_POR_HORA = 3600000;

function conCeros(valor) {
  return String(valor).padStart(2, '0');
}

export function fechaRelativaEnHoras(horas) {
  const objetivo = new Date(Date.now() + horas * MS_POR_HORA);
  const mes = FormateadorFecha.MESES[objetivo.getMonth()];
  return {
    fechaTexto: `${objetivo.getDate()} de ${mes}`,
    horaTexto: `${conCeros(objetivo.getHours())}:${conCeros(objetivo.getMinutes())}`,
  };
}
