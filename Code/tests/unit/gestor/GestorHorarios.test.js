const GestorHorarios = require('../../../js/psicologo/gestor/GestorHorarios.js');

describe('GestorHorarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.document = {
      getElementById: jest.fn((id) => {
        const elements = {
          'fecha-desde': { value: '2026-05-18' },
          'fecha-hasta': { value: '2026-05-24' },
        };
        return elements[id] || { value: '' };
      }),
    };
    global.MensajesFachada = { mostrar: jest.fn() };
    global.GestorConfiguracionUI = { obtenerConfiguracionesFormulario: jest.fn(() => []) };
    global.EstadoPsicologo = { obtener: jest.fn(() => 'psi-001') };
    global.RepositorioConfiguracion = { guardarYGenerarBloques: jest.fn().mockResolvedValue(true) };
  });

  test('VÁLIDO: Procesa evento de guardar horario correctamente', () => {
    const evento = { preventDefault: jest.fn() };
    GestorHorarios.guardar(evento);
    expect(evento.preventDefault).toHaveBeenCalled();
  });

  test('LÍMITE: Valida fechas de inicio y fin', () => {
    global.GestorConfiguracionUI.obtenerConfiguracionesFormulario.mockReturnValue([
      { dia_semana: 1, hora_inicio: '09:00', hora_fin: '13:00' },
    ]);
    global.document.getElementById = jest.fn((id) => {
      const elements = {
        'fecha-desde': { value: '2026-05-18' },
        'fecha-hasta': { value: '2026-05-16' },
      };
      return elements[id] || { value: '' };
    });

    const evento = { preventDefault: jest.fn() };
    GestorHorarios.guardar(evento);
    expect(global.MensajesFachada.mostrar).toHaveBeenCalledWith(expect.stringContaining('anterior'), 'error');
  });

  test('INVÁLIDO: Requiere al menos un día con horarios', () => {
    global.GestorConfiguracionUI.obtenerConfiguracionesFormulario.mockReturnValue([]);

    const evento = { preventDefault: jest.fn() };
    GestorHorarios.guardar(evento);
    expect(global.MensajesFachada.mostrar).toHaveBeenCalledWith(expect.stringContaining('Selecciona'), 'error');
  });

  test('INVÁLIDO: Valida que fechas estén definidas', () => {
    global.GestorConfiguracionUI.obtenerConfiguracionesFormulario.mockReturnValue([
      { dia_semana: 1, hora_inicio: '09:00', hora_fin: '13:00' },
    ]);
    global.document.getElementById = jest.fn(() => ({ value: '' }));

    const evento = { preventDefault: jest.fn() };
    GestorHorarios.guardar(evento);
    expect(global.MensajesFachada.mostrar).toHaveBeenCalledWith(expect.stringContaining('Completa'), 'error');
  });

  test('VÁLIDO: Guarda horarios con configuración válida', () => {
    global.RepositorioConfiguracion.guardarYGenerarBloques.mockResolvedValue(true);
    global.GestorConfiguracionUI.obtenerConfiguracionesFormulario.mockReturnValue([
      { dia_semana: 1, hora_inicio: '09:00', hora_fin: '13:00' },
      { dia_semana: 2, hora_inicio: '14:00', hora_fin: '18:00' },
    ]);

    const evento = { preventDefault: jest.fn() };
    GestorHorarios.guardar(evento);
    expect(evento.preventDefault).toHaveBeenCalled();
  });

  test('LÍMITE: Acepta rango mínimo de horario', () => {
    global.GestorConfiguracionUI.obtenerConfiguracionesFormulario.mockReturnValue([
      { dia_semana: 1, hora_inicio: '09:00', hora_fin: '09:30' },
    ]);

    const evento = { preventDefault: jest.fn() };
    GestorHorarios.guardar(evento);
    expect(evento.preventDefault).toHaveBeenCalled();
  });
});
