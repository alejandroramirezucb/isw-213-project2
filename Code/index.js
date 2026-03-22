const Servidor = require('./server/Servidor');

const servidor = new Servidor();
servidor.iniciar(process.env.PORT || 3000);

process.on('SIGTERM', () => {
  servidor.detener();
  process.exit(0);
});
