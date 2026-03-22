const crypto = require('crypto');
const ControladorBase = require('./ControladorBase');

class ControladorRegistro extends ControladorBase {
  constructor(cliente) {
    super(cliente);
  }

  async manejar(req, res) {
    const cuerpo = await this.leerCuerpo(req);
    const datos = this.analizarJSON(cuerpo);

    if (!datos) {
      return this.responder(res, 400, { error: 'JSON inválido' });
    }

    const camposRequeridos = [
      'correo',
      'password',
      'nombre',
      'apellido',
      'tipoCuenta',
    ];
    if (!this.validarCamposRequeridos(datos, camposRequeridos)) {
      return this.responder(res, 400, { error: 'Faltan campos requeridos' });
    }

    try {
      const authResult = await this.obtenerCliente().post(
        '/auth/v1/admin/users',
        {
          email: datos.correo,
          password: datos.password,
          email_confirm: true,
        },
      );

      if (authResult.status === 422) {
        return this.#manejarUsuarioExistente(res, datos);
      }

      if (authResult.status >= 400) {
        const msg = this.extraerMensajeError(authResult.data);
        return this.responder(res, authResult.status, { error: msg });
      }

      await this.#crearPerfil(res, datos, authResult.data.id);
    } catch {
      this.responder(res, 500, {
        error: 'Error de conexión con Supabase',
      });
    }
  }

  async #manejarUsuarioExistente(res, datos) {
    const usersResult = await this.obtenerCliente().get(
      `/auth/v1/admin/users?email=${encodeURIComponent(datos.correo)}`,
    );
    const users = usersResult.data?.users || [];
    const existingUser = users.find((u) => u.email === datos.correo);

    if (!existingUser) {
      return this.responder(res, 409, {
        error: 'El correo ya está registrado',
      });
    }

    const authRows = await this.obtenerCliente().get(
      `/rest/v1/usuarios_auth?id=eq.${existingUser.id}&select=id`,
    );

    if (Array.isArray(authRows.data) && authRows.data.length > 0) {
      return this.responder(res, 409, {
        error: 'El correo ya está registrado',
      });
    }

    await this.#crearPerfil(res, datos, existingUser.id);
  }

  async #crearPerfil(res, datos, usuarioId) {
    const tabla = datos.tipoCuenta === 'psicologo' ? 'psicologos' : 'pacientes';
    const contrasenaHash = crypto
      .createHash('sha256')
      .update(datos.password)
      .digest('hex');

    const perfilResult = await this.obtenerCliente().post(
      `/rest/v1/${tabla}`,
      {
        nombre: datos.nombre,
        apellido: datos.apellido,
        correo: datos.correo,
        telefono: datos.telefono || null,
        contrasena_hash: contrasenaHash,
      },
    );

    if (perfilResult.status >= 300) {
      await this.obtenerCliente().delete(
        `/auth/v1/admin/users/${usuarioId}`,
      );
      const msg = this.extraerMensajeError(perfilResult.data);
      return this.responder(res, 500, { error: msg });
    }

    const perfilId = Array.isArray(perfilResult.data)
      ? perfilResult.data[0].id
      : perfilResult.data.id;
    const usuarioAuth = { id: usuarioId, rol: datos.tipoCuenta };

    if (datos.tipoCuenta === 'psicologo') {
      usuarioAuth.psicologo_id = perfilId;
    } else {
      usuarioAuth.paciente_id = perfilId;
    }

    const authRow = await this.obtenerCliente().post(
      '/rest/v1/usuarios_auth',
      usuarioAuth,
    );

    if (authRow.status >= 300) {
      await this.obtenerCliente().delete(
        `/auth/v1/admin/users/${usuarioId}`,
      );
      const msg = this.extraerMensajeError(authRow.data);
      return this.responder(res, 500, { error: msg });
    }

    this.responder(res, 200, { ok: true });
  }
}

module.exports = ControladorRegistro;
