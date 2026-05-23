import { createHash } from 'node:crypto';
import { ControladorBase } from './ControladorBase.js';

export class ControladorRegistro extends ControladorBase {
  async manejar(req, res) {
    const cuerpo = await this.leerCuerpo(req);
    const datos = this.analizarJSON(cuerpo);

    if (!datos) return this.responder(res, 400, { error: 'JSON inválido' });

    const requeridos = ['correo', 'password', 'nombre', 'apellido', 'tipoCuenta'];
    if (!this.validarCampos(datos, requeridos)) {
      return this.responder(res, 400, { error: 'Faltan campos requeridos' });
    }

    try {
      const authResult = await this.cliente.post('/auth/v1/admin/users', {
        email: datos.correo,
        password: datos.password,
        email_confirm: true,
      });

      if (authResult.status === 422) return this._manejarUsuarioExistente(res, datos);
      if (authResult.status >= 400) {
        return this.responder(res, authResult.status, { error: this.extraerMensajeError(authResult.data) });
      }

      await this._crearPerfil(res, datos, authResult.data.id);
    } catch (_) {
      this.responder(res, 500, { error: 'Error de conexión con Supabase' });
    }
  }

  async _manejarUsuarioExistente(res, datos) {
    const usersResult = await this.cliente.get(`/auth/v1/admin/users?email=${encodeURIComponent(datos.correo)}`);
    const existente = (usersResult.data?.users || []).find((u) => u.email === datos.correo);

    if (!existente) return this.responder(res, 409, { error: 'El correo ya está registrado' });

    const authRows = await this.cliente.get(`/rest/v1/usuarios_auth?id=eq.${existente.id}&select=id`);
    if (Array.isArray(authRows.data) && authRows.data.length > 0) {
      return this.responder(res, 409, { error: 'El correo ya está registrado' });
    }

    await this._crearPerfil(res, datos, existente.id);
  }

  async _crearPerfil(res, datos, usuarioId) {
    const tabla = datos.tipoCuenta === 'psicologo' ? 'psicologos' : 'pacientes';
    const contrasenaHash = createHash('sha256').update(datos.password).digest('hex');

    const perfilResult = await this.cliente.post(`/rest/v1/${tabla}`, {
      nombre: datos.nombre,
      apellido: datos.apellido,
      correo: datos.correo,
      telefono: datos.telefono || null,
      contrasena_hash: contrasenaHash,
    });

    if (perfilResult.status >= 300) {
      await this.cliente.delete(`/auth/v1/admin/users/${usuarioId}`);
      return this.responder(res, 500, { error: this.extraerMensajeError(perfilResult.data) });
    }

    const perfilId = Array.isArray(perfilResult.data) ? perfilResult.data[0].id : perfilResult.data.id;
    const usuarioAuth = { id: usuarioId, rol: datos.tipoCuenta };
    if (datos.tipoCuenta === 'psicologo') usuarioAuth.psicologo_id = perfilId;
    else usuarioAuth.paciente_id = perfilId;

    const authRow = await this.cliente.post('/rest/v1/usuarios_auth', usuarioAuth);
    if (authRow.status >= 300) {
      await this.cliente.delete(`/auth/v1/admin/users/${usuarioId}`);
      return this.responder(res, 500, { error: this.extraerMensajeError(authRow.data) });
    }

    this.responder(res, 200, { ok: true });
  }
}
