const EstadoPsicologo = require('../../../js/psicologo/estado/EstadoPsicologo');

describe('EstadoPsicologo', () => {

  describe('obtener', () => {
    test('VÁLIDO: retorna valor establecido previamente', () => {
      EstadoPsicologo.establecer('usuario', { id: 1, nombre: 'Test' });
      const resultado = EstadoPsicologo.obtener('usuario');
      expect(resultado).toEqual({ id: 1, nombre: 'Test' });
    });

    test('LÍMITE: retorna undefined cuando clave no existe', () => {
      const resultado = EstadoPsicologo.obtener('claveInexistente');
      expect(resultado).toBeUndefined();
    });

    test('INVÁLIDO: no retorna valores de otros ciclos', () => {
      EstadoPsicologo.establecer('citaSeleccionada', '123');
      const resultado = EstadoPsicologo.obtener('usuario');
      expect(resultado).not.toEqual('123');
    });
  });

  describe('establecer', () => {
    test('VÁLIDO: almacena y recupera psicologoId', () => {
      EstadoPsicologo.establecer('psicologoId', 'psi-001');
      const resultado = EstadoPsicologo.obtener('psicologoId');
      expect(resultado).toBe('psi-001');
    });

    test('VÁLIDO: sobrescribe valor anterior', () => {
      EstadoPsicologo.establecer('psicologoId', 'psi-001');
      EstadoPsicologo.establecer('psicologoId', 'psi-002');
      const resultado = EstadoPsicologo.obtener('psicologoId');
      expect(resultado).toBe('psi-002');
    });

    test('LÍMITE: acepta null como valor válido', () => {
      EstadoPsicologo.establecer('usuario', null);
      const resultado = EstadoPsicologo.obtener('usuario');
      expect(resultado).toBeNull();
    });

    test('INVÁLIDO: mantiene integridad con múltiples claves', () => {
      EstadoPsicologo.establecer('usuario', { id: 1 });
      EstadoPsicologo.establecer('psicologoId', 'psi-001');
      expect(EstadoPsicologo.obtener('usuario')).toEqual({ id: 1 });
      expect(EstadoPsicologo.obtener('psicologoId')).toBe('psi-001');
    });
  });

  describe('citasCargadas', () => {
    test('VÁLIDO: inicializa como array vacío', () => {
      const citasCargadas = EstadoPsicologo.obtener('citasCargadas');
      expect(Array.isArray(citasCargadas)).toBe(true);
    });

    test('VÁLIDO: puede almacenar array de citas', () => {
      const citas = [
        { id: 1, fecha: '2026-05-20', hora: '10:00' },
        { id: 2, fecha: '2026-05-21', hora: '11:00' },
      ];
      EstadoPsicologo.establecer('citasCargadas', citas);
      const resultado = EstadoPsicologo.obtener('citasCargadas');
      expect(resultado).toHaveLength(2);
      expect(resultado[0].id).toBe(1);
    });
  });
});
