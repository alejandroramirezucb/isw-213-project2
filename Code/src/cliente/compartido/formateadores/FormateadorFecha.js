export class FormateadorFecha {
  static MESES = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
  ];

  static DIAS = [
    'Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado',
  ];

  static aTexto(fecha) {
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return `${this.DIAS[fechaObj.getDay()]}, ${fechaObj.getDate()} de ${this.MESES[fechaObj.getMonth()]} de ${fechaObj.getFullYear()}`;
  }

  static aTextoCorto(fecha) {
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return `${String(fechaObj.getDate()).padStart(2, '0')}/${String(fechaObj.getMonth() + 1).padStart(2, '0')}/${fechaObj.getFullYear()}`;
  }

  static aISO(fecha) {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const día = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${día}`;
  }
}
