const crypto = require('crypto');

class ControladorRegistro {
  #cliente;

  constructor(cliente) {
    this.#cliente = cliente;
  }

  async manejar(req, res) {
    const cuerpo = await this.#leerCuerpo(req);
    let datos;

    try {
      datos = JSON.parse(cuerpo);
    } catch {
      return this.#responder(res, 400, { error: 'JSON inválido' });
    }

    if (
      !datos.correo ||
      !datos.contrasena ||
      !datos.nombre ||
      !datos.apellido ||
      !datos.tipoCuenta
    ) {
      return this.#responder(res, 400, { error: 'Faltan campos requeridos' });
    }

    try {
      const authResult = await this.#cliente.post('/auth/v1/admin/users', {
        email: datos.correo,
        password: datos.contrasena,
        email_confirm: true,
      });

      if (authResult.status === 422) {
        return this.#manejarUsuarioExistente(res, datos);
      }

      if (authResult.status >= 400) {
        const msg =
          authResult.data?.msg ||
          authResult.data?.message ||
          authResult.data?.error_description ||
          'Error al crear usuario';
        return this.#responder(res, authResult.status, { error: msg });
      }

      await this.#crearPerfil(res, datos, authResult.data.id);
    } catch {
      this.#responder(res, 500, { error: 'Error de conexión con Supabase' });
    }
  }

  async #manejarUsuarioExistente(res, datos) {
    console.log(
      '  → 422: usuario ya existe en Auth, verificando si el registro está completo...',
    );

    const usersResult = await this.#cliente.get(
      `/auth/v1/admin/users?email=${encodeURIComponent(datos.correo)}`,
    );
    const users = usersResult.data?.users || [];
    const existingUser = users.find((u) => u.email === datos.correo);

    if (!existingUser) {
      return this.#responder(res, 409, {
        error: 'El correo ya está registrado',
      });
    }

    const authRows = await this.#cliente.get(
      `/rest/v1/usuarios_auth?id=eq.${existingUser.id}&select=id`,
    );

    if (Array.isArray(authRows.data) && authRows.data.length > 0) {
      return this.#responder(res, 409, {
        error: 'El correo ya está registrado',
      });
    }

    console.log('  → Usuario huérfano encontrado, completando registro...');
    await this.#crearPerfil(res, datos, existingUser.id);
  }

  async #crearPerfil(res, datos, usuarioId) {
    const tabla = datos.tipoCuenta === 'psicologo' ? 'psicologos' : 'pacientes';
    const contrasenaHash = crypto
      .createHash('sha256')
      .update(datos.contrasena)
      .digest('hex');

    const perfilResult = await this.#cliente.post(`/rest/v1/${tabla}`, {
      nombre: datos.nombre,
      apellido: datos.apellido,
      correo: datos.correo,
      telefono: datos.telefono || null,
      contrasena_hash: contrasenaHash,
    });

    console.log(
      `  → Crear perfil en tabla "${tabla}": status=${perfilResult.status}`,
      JSON.stringify(perfilResult.data),
    );

    if (perfilResult.status >= 300) {
      console.error('  → ERROR al crear perfil:', perfilResult.data);
      await this.#cliente.delete(`/auth/v1/admin/users/${usuarioId}`);
      const msg =
        perfilResult.data?.message ||
        perfilResult.data?.msg ||
        perfilResult.data?.details ||
        perfilResult.data?.hint ||
        'Error al crear perfil';
      return this.#responder(res, 500, { error: msg });
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

    const authRow = await this.#cliente.post(
      '/rest/v1/usuarios_auth',
      usuarioAuth,
    );
    console.log(
      `  → Crear usuarios_auth: status=${authRow.status}`,
      JSON.stringify(authRow.data),
    );

    if (authRow.status >= 300) {
      console.error('  → ERROR al registrar en usuarios_auth:', authRow.data);
      await this.#cliente.delete(`/auth/v1/admin/users/${usuarioId}`);
      const msg =
        authRow.data?.message ||
        authRow.data?.msg ||
        authRow.data?.details ||
        authRow.data?.hint ||
        'Error al registrar usuario';
      return this.#responder(res, 500, { error: msg });
    }

    this.#responder(res, 200, { ok: true });
  }

  #leerCuerpo(req) {
    return new Promise((resolve) => {
      let cuerpo = '';
      req.on('data', (c) => {
        cuerpo += c;
      });
      req.on('end', () => resolve(cuerpo));
    });
  }

  #responder(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }
}

module.exports = ControladorRegistro;
