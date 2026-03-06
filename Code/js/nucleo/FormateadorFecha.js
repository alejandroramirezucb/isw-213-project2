class FormateadorFecha {
  static MESES = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  static DIAS = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ];

  static aTexto(fecha) {
    const f = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return `${this.DIAS[f.getDay()]}, ${f.getDate()} de ${this.MESES[f.getMonth()]} de ${f.getFullYear()}`;
  }

  static aTextoCorto(fecha) {
    const f = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return `${f.getDate()} de ${this.MESES[f.getMonth()]}`;
  }

  static aISO(fecha) {
    const a = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${a}-${m}-${d}`;
  }
}
