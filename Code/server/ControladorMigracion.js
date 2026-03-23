const ControladorBase = require('./ControladorBase');
const MigracionPsicologos = require('./MigracionPsicologos');

class ControladorMigracion extends ControladorBase {
  constructor(cliente) {
    super(cliente);
  }

  async manejar(req, res) {
    if (req.method !== 'POST') {
      return this.responder(res, 405, { error: 'Método no permitido' });
    }

    try {
      console.log('🔄 Ejecutando migración...');
      await MigracionPsicologos.ejecutar();
      this.responder(res, 200, { mensaje: 'Migración completada' });
    } catch (e) {
      console.error('❌ Error:', e);
      this.responder(res, 500, { error: e.message });
    }
  }
}

module.exports = ControladorMigracion;
