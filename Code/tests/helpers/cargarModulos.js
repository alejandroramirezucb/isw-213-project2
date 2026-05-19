const fs = require('fs');
const path = require('path');

const jsDir = path.join(__dirname, '../../js');

function cargarClase(rutaRelativa) {
  const codigoFull = fs.readFileSync(path.join(jsDir, rutaRelativa), 'utf-8');
  const nombreClase = rutaRelativa.split('/').pop().replace('.js', '');

  eval(`global.${nombreClase} = (function() { ${codigoFull}; return ${nombreClase}; })()`);
  return global[nombreClase];
}

module.exports = {
  cargarClase,
  EstadoPsicologo: () => cargarClase('psicologo/estado/EstadoPsicologo.js'),
  RepositorioCitasPsicologo: () => cargarClase('psicologo/repositorio/RepositorioCitasPsicologo.js'),
  RepositorioConfiguracion: () => cargarClase('psicologo/repositorio/RepositorioConfiguracion.js'),
  RepositorioPacientes: () => cargarClase('psicologo/repositorio/RepositorioPacientes.js'),
};
