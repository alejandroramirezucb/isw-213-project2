import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baseDir = path.join(__dirname, '../../js');

export function cargarModulo(relativePath) {
  const fullPath = path.join(baseDir, relativePath);
  const codigo = fs.readFileSync(fullPath, 'utf-8');
  eval(codigo);
  return eval(codigo.match(/class (\w+)/)?.[1]);
}

export function cargarModuloCompleto(relativePath) {
  const fullPath = path.join(baseDir, relativePath);
  const codigo = fs.readFileSync(fullPath, 'utf-8');
  eval(codigo);
}

export function obtenerClaseDelCodigo(codigo, className) {
  eval(codigo);
  return global[className];
}
