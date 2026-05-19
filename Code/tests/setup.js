global.clienteSupabase = {};
global.MensajesFachada = { mostrar: jest.fn() };
global.GestorConfiguracionUI = { obtenerConfiguracionesFormulario: jest.fn(() => []) };
global.RepositorioNotificaciones = {
  obtenerTodas: jest.fn().mockResolvedValue([]),
  obtenerConteoNoLeidas: jest.fn().mockResolvedValue(0),
  marcarTodasLeidas: jest.fn().mockResolvedValue(true),
  marcarComoLeida: jest.fn().mockResolvedValue(true),
  crear: jest.fn().mockResolvedValue({ data: { id: 'notif-1' }, error: null }),
  suscribirseNuevasNotificaciones: jest.fn(() => () => {}),
};
global.document = { getElementById: jest.fn(() => ({ value: '' })), addEventListener: jest.fn() };
global.window = { clienteSupabase: global.clienteSupabase };
