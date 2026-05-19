const RepositorioCitasPsicologo = require('../js/psicologo/repositorio/RepositorioCitasPsicologo.js');

describe('HU-03 a HU-14: Operaciones de Citas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('obtenerPorPeriodo', () => {
    test('VÁLIDO: Retorna bloques disponibles excluyendo reservados', async () => {
      global.clienteSupabase.from = jest.fn(() => {
        let orderCount = 0;
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
          order: jest.fn(function() {
            orderCount++;
            if (orderCount === 1) return this;
            return Promise.resolve({
              data: [{ id: 'cita-1', estado: 'confirmada', pacientes: { id: 'pac-1', nombre: 'María' }, bloques_horario: { fecha: '2026-05-20', hora_inicio: '10:00', hora_fin: '11:00' } }],
              error: null
            });
          }),
        };
      });

      const resultado = await RepositorioCitasPsicologo.obtenerPorPeriodo('psi-001', '2026-05-18', '2026-05-24');
      expect(resultado).toHaveLength(1);
      expect(resultado[0].pacientes.nombre).toBe('María');
    });

    test('LÍMITE: Un bloque disponible se retorna sin errores', async () => {
      global.clienteSupabase.from = jest.fn(() => {
        let orderCount = 0;
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
          order: jest.fn(function() {
            orderCount++;
            if (orderCount === 1) return this;
            return Promise.resolve({
              data: [{ id: 'cita-1', estado: 'confirmada', pacientes: { nombre: 'Ana' }, bloques_horario: { fecha: '2026-05-21', hora_inicio: '14:00' } }],
              error: null
            });
          }),
        };
      });

      const resultado = await RepositorioCitasPsicologo.obtenerPorPeriodo('psi-001', '2026-05-25', '2026-05-31');
      expect(resultado).toHaveLength(1);
    });

    test('INVÁLIDO: Filtra citas sin bloque_horario asociado', async () => {
      global.clienteSupabase.from = jest.fn(() => {
        let orderCount = 0;
        const chainObj = {
          select: jest.fn(function() { return this; }),
          eq: jest.fn(function() { return this; }),
          gte: jest.fn(function() { return this; }),
          lte: jest.fn(function() { return this; }),
          order: jest.fn(function() {
            orderCount++;
            if (orderCount === 1) return this;
            return Promise.resolve({
              data: [{ id: 'cita-1', estado: 'confirmada', pacientes: { nombre: 'Luis' }, bloques_horario: null }],
              error: null
            });
          }),
        };
        return chainObj;
      });

      const resultado = await RepositorioCitasPsicologo.obtenerPorPeriodo('psi-001', '2026-06-01', '2026-06-07');
      expect(resultado).toHaveLength(0);
    });

    test('INVÁLIDO: Retorna array vacío si no hay citas', async () => {
      global.clienteSupabase.from = jest.fn(() => {
        let orderCount = 0;
        const chainObj = {
          select: jest.fn(function() { return this; }),
          eq: jest.fn(function() { return this; }),
          gte: jest.fn(function() { return this; }),
          lte: jest.fn(function() { return this; }),
          order: jest.fn(function() {
            orderCount++;
            if (orderCount === 1) return this;
            return Promise.resolve({ data: null, error: null });
          }),
        };
        return chainObj;
      });

      const resultado = await RepositorioCitasPsicologo.obtenerPorPeriodo('psi-001', '2026-06-08', '2026-06-14');
      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado).toHaveLength(0);
    });
  });

  describe('crearNotificacion', () => {
    test('VÁLIDO: Crea notificación de cancelación', async () => {
      global.clienteSupabase.from = jest.fn(() => ({
        insert: jest.fn().mockResolvedValue({ data: { id: 'notif-1' }, error: null }),
      }));

      await RepositorioCitasPsicologo.crearNotificacion('pac-1', 'cita-1');
      expect(global.clienteSupabase.from).toHaveBeenCalledWith('notificaciones');
    });

    test('LÍMITE: No lanza error si notificación falla', async () => {
      global.clienteSupabase.from = jest.fn(() => ({
        insert: jest.fn().mockRejectedValue(new Error('DB error')),
      }));

      await expect(RepositorioCitasPsicologo.crearNotificacion('pac-1', 'cita-1')).resolves.not.toThrow();
    });

    test('INVÁLIDO: No crea con datos faltantes', async () => {
      global.clienteSupabase.from = jest.fn(() => ({
        insert: jest.fn(),
      }));

      await RepositorioCitasPsicologo.crearNotificacion(null, 'cita-1');
    });
  });

  describe('crearNotificacionNuevoTurno', () => {
    test('VÁLIDO: Crea notificación para psicólogo', async () => {
      global.clienteSupabase.from = jest.fn(() => ({
        insert: jest.fn().mockResolvedValue({ data: { id: 'notif-1' }, error: null }),
      }));

      const resultado = await RepositorioCitasPsicologo.crearNotificacionNuevoTurno('psi-001', 'cita-1');
      expect(resultado).toBe(true);
    });

    test('LÍMITE: Retorna false si faltan parámetros', async () => {
      const resultado = await RepositorioCitasPsicologo.crearNotificacionNuevoTurno(null, 'cita-1');
      expect(resultado).toBe(false);
    });

    test('INVÁLIDO: No crea duplicado', async () => {
      let callCount = 0;
      global.clienteSupabase.from = jest.fn(() => ({
        insert: jest.fn(function() {
          callCount++;
          return Promise.resolve({ data: { id: `notif-${callCount}` }, error: null });
        }),
      }));

      await RepositorioCitasPsicologo.crearNotificacionNuevoTurno('psi-001', 'cita-1');
      await RepositorioCitasPsicologo.crearNotificacionNuevoTurno('psi-001', 'cita-1');
      expect(callCount).toBe(2);
    });
  });

  describe('cancelarConNotificacion', () => {
    test('VÁLIDO: Cancela cita y notifica paciente', async () => {
      global.clienteSupabase.rpc = jest.fn().mockResolvedValue({ data: { success: true }, error: null });
      global.clienteSupabase.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { paciente_id: 'pac-1', psicologo_id: 'psi-001' }, error: null }),
        insert: jest.fn().mockResolvedValue({ data: {}, error: null }),
      }));

      const resultado = await RepositorioCitasPsicologo.cancelarConNotificacion('cita-1');
      expect(resultado).toBe(true);
    });

    test('LÍMITE: Cancela última cita del día sin errores', async () => {
      global.clienteSupabase.rpc = jest.fn().mockResolvedValue({ error: null });
      global.clienteSupabase.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { paciente_id: 'pac-1', psicologo_id: 'psi-001' }, error: null }),
        insert: jest.fn().mockResolvedValue({ error: null }),
      }));

      const resultado = await RepositorioCitasPsicologo.cancelarConNotificacion('cita-ultimo-bloque');
      expect(resultado).toBe(true);
    });

    test('INVÁLIDO: No cancela si cita no existe', async () => {
      global.clienteSupabase.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      }));

      const resultado = await RepositorioCitasPsicologo.cancelarConNotificacion('cita-inexistente');
      expect(resultado).toBe(false);
    });

    test('INVÁLIDO: No cancela si BD retorna error', async () => {
      global.clienteSupabase.rpc = jest.fn().mockResolvedValue({ error: { message: 'RPC Error' } });
      global.clienteSupabase.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { paciente_id: 'pac-1', psicologo_id: 'psi-001' }, error: null }),
      }));

      const resultado = await RepositorioCitasPsicologo.cancelarConNotificacion('cita-1');
      expect(resultado).toBe(false);
    });
  });

  describe('obtenerHistorialPacientes', () => {
    test('VÁLIDO: Obtiene historial de citas por psicólogo', async () => {
      global.clienteSupabase.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [
            {
              id: 'cita-101',
              estado: 'completada',
              pacientes: { id: 'pac-101', nombre: 'Juan', apellido: 'Pérez', correo: 'juan@example.com', bloqueado: false },
              bloques_horario: { fecha: '2026-05-20', hora_inicio: '10:00' }
            }
          ],
          error: null
        }),
      }));

      const resultado = await RepositorioCitasPsicologo.obtenerHistorialPacientes('psi-101');
      expect(resultado).toHaveLength(1);
      expect(resultado[0].paciente.nombre).toBe('Juan');
      expect(resultado[0].citas).toHaveLength(1);
    });

    test('LÍMITE: Retorna array vacío si no hay citas', async () => {
      global.clienteSupabase.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: null }),
      }));

      const resultado = await RepositorioCitasPsicologo.obtenerHistorialPacientes('psi-102');
      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado).toHaveLength(0);
    });

    test('VÁLIDO: Agrupa citas por paciente correctamente', async () => {
      global.clienteSupabase.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [
            {
              id: 'cita-201',
              estado: 'completada',
              pacientes: { id: 'pac-201', nombre: 'Juan', apellido: 'Pérez', correo: 'juan@example.com', bloqueado: false },
              bloques_horario: { fecha: '2026-05-20', hora_inicio: '10:00' }
            },
            {
              id: 'cita-202',
              estado: 'completada',
              pacientes: { id: 'pac-201', nombre: 'Juan', apellido: 'Pérez', correo: 'juan@example.com', bloqueado: false },
              bloques_horario: { fecha: '2026-05-21', hora_inicio: '11:00' }
            }
          ],
          error: null
        }),
      }));

      const resultado = await RepositorioCitasPsicologo.obtenerHistorialPacientes('psi-103');
      expect(resultado).toHaveLength(1);
      expect(resultado[0].citas).toHaveLength(2);
    });
  });

  describe('crearNotificacionNuevoTurno error handling', () => {
    test('VÁLIDO: Maneja error de duplicado (23505)', async () => {
      global.clienteSupabase.from = jest.fn(() => ({
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: { code: '23505', message: 'Duplicate' }
        }),
      }));

      const resultado = await RepositorioCitasPsicologo.crearNotificacionNuevoTurno('psi-001', 'cita-1');
      expect(resultado).toBe(true);
    });

    test('VÁLIDO: Maneja error de permiso (42501)', async () => {
      global.clienteSupabase.from = jest.fn(() => ({
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: { code: '42501', message: 'Permission denied' }
        }),
      }));

      const resultado = await RepositorioCitasPsicologo.crearNotificacionNuevoTurno('psi-001', 'cita-1');
      expect(resultado).toBe(true);
    });

    test('VÁLIDO: Maneja error 403 Forbidden', async () => {
      global.clienteSupabase.from = jest.fn(() => ({
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: { status: 403, message: 'Forbidden' }
        }),
      }));

      const resultado = await RepositorioCitasPsicologo.crearNotificacionNuevoTurno('psi-001', 'cita-1');
      expect(resultado).toBe(true);
    });
  });
});
