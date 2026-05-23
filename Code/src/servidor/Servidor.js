import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Configuracion } from './config/Configuracion.js';
import { ClienteSupabaseAdmin } from './config/ClienteSupabaseAdmin.js';
import { ControladorRegistro } from './controladores/ControladorRegistro.js';
import { ControladorRecordatorios } from './controladores/ControladorRecordatorios.js';
import { ControladorNotificaciones } from './controladores/ControladorNotificaciones.js';
import { ControladorListaEspera } from './controladores/ControladorListaEspera.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, '..', '..', 'dist');
const ROOT_DIR = path.join(__dirname, '..', '..');

export class Servidor {
  constructor(config = null) {
    this._config = config ?? new Configuracion();

    if (!this._config.serviceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY no está configurado en .env');
    }

    const cliente = new ClienteSupabaseAdmin(this._config.supabaseHost, this._config.serviceRoleKey);
    this._registro = new ControladorRegistro(cliente);
    this._recordatorios = new ControladorRecordatorios(cliente);
    this._notificaciones = new ControladorNotificaciones(cliente);
    this._listaEspera = new ControladorListaEspera(cliente);
    this._intervalos = [];
  }

  iniciar(puerto = 3000) {
    const server = http.createServer((req, res) => this._manejar(req, res));
    server.listen(puerto, () => {
      console.log(`Servidor en http://localhost:${puerto}`);
      this._iniciarIntervalos();
    });
  }

  detener() {
    this._intervalos.forEach(clearInterval);
    this._intervalos = [];
  }

  _iniciarIntervalos() {
    this._intervalos.push(
      setInterval(() => this._recordatorios.ejecutar().catch(() => {}), 60 * 60 * 1000),
      setInterval(() => this._notificaciones.ejecutar().catch(() => {}), 5 * 60 * 1000),
      setInterval(() => this._listaEspera.ejecutar().catch(() => {}), 5 * 60 * 1000),
    );
  }

  _manejar(req, res) {
    const { pathname } = new URL(req.url, 'http://localhost');

    if (pathname === '/') {
      res.writeHead(302, { Location: '/index.html' });
      return res.end();
    }

    const rutas = {
      '/api/registrar': () => this._registro.manejar(req, res),
      '/api/recordatorios': () => this._recordatorios.manejar(req, res),
      '/api/notificaciones': () => this._notificaciones.manejar(req, res),
      '/api/lista-espera': () => this._listaEspera.manejar(req, res),
    };

    const manejador = rutas[pathname];
    if (manejador) return manejador();

    this._servirArchivo(pathname, res);
  }

  _servirArchivo(pathname, res) {
    const esProd = process.env.NODE_ENV === 'production';
    const baseDir = esProd ? DIST_DIR : ROOT_DIR;
    const filePath = path.join(baseDir, pathname);
    const ext = path.extname(filePath);
    const contentType = this._config.obtenerMime(ext);

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end(`404 Not found: ${pathname}`);
      }
      const headers = { 'Content-Type': contentType };
      if (ext === '.js' || ext === '.html') headers['Cache-Control'] = 'no-store';
      res.writeHead(200, headers);
      res.end(content);
    });
  }
}
