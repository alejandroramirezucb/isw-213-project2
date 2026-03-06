class FormateadorHora {
  static formatear(hora) {
    if (!hora) return '';
    const partes = hora.split(':');
    return `${parseInt(partes[0]).toString().padStart(2, '0')}:${partes[1]}`;
  }
}
