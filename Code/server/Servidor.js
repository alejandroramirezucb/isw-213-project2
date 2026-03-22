const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const Configuracion = require('./Configuracion');
const ClienteSupabaseAdmin = require('./ClienteSupabaseAdmin');
const ControladorRegistro = require('./ControladorRegistro');
const ControladorRecordatorios = require('./ControladorRecordatorios');

class Servidor {
  #config;
  #controladorRegistro;
  #controladorRecordatorios;
  #intervaloRecordatorios;

  constructor(config = null) {
    this.#config = config || new Configuracion();

    if (!this.#config.serviceRoleKey) {
      throw new Error(
        'ERROR: SUPABASE_SERVICE_ROLE_KEY no está configurado en .env',
      );
    }

    const cliente = new ClienteSupabaseAdmin(
      this.#config.supabaseHost,
      this.#config.serviceRoleKey,
    );
    this.#controladorRegistro = new ControladorRegistro(cliente);
    this.#controladorRecordatorios = new ControladorRecordatorios(cliente);
  }

  iniciar(puerto = 3000) {
    http
      .createServer((req, res) => this.#manejarPeticion(req, res))
      .listen(puerto, () => {
        this.#iniciarRecordatorios();
      });
  }

  detener() {
    if (this.#intervaloRecordatorios) {
      clearInterval(this.#intervaloRecordatorios);
    }
  }

  #iniciarRecordatorios() {
    this.#intervaloRecordatorios = setInterval(async () => {
      try {
        await this.#controladorRecordatorios.ejecutar();
      } catch {

      }
    }, 60 * 60 * 1000);
  }

  #manejarPeticion(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (pathname === '/' || pathname === '') {
      res.writeHead(302, { Location: '/html/index.html' });
      return res.end();
    }

    if (pathname === '/js/env.js') {
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      return res.end(this.#config.envJs);
    }

    if (pathname === '/api/registrar' && req.method === 'POST') {
      return this.#controladorRegistro.manejar(req, res);
    }

    if (pathname === '/api/recordatorios' && req.method === 'POST') {
      return this.#controladorRecordatorios.manejar(req, res);
    }

    this.#servirArchivo(pathname, res);
  }

  #servirArchivo(pathname, res) {
    const filePath = '.' + pathname;
    const ext = path.extname(filePath);
    const contentType = this.#config.obtenerMime(ext);

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`404 Not found: ${pathname}`);
      } else {
        const headers = { 'Content-Type': contentType };
        if (ext === '.js' || ext === '.html') {
          headers['Cache-Control'] = 'no-store';
        }
        res.writeHead(200, headers);
        res.end(content);
      }
    });
  }
}

module.exports = Servidor;
