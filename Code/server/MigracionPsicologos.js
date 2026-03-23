const ClienteSupabaseAdmin = require('./ClienteSupabaseAdmin');
const Configuracion = require('./Configuracion');

class MigracionPsicologos {
  static async ejecutar() {
    const config = new Configuracion();
    
    if (!config.serviceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY no está configurado en .env');
    }
    
    const cliente = new ClienteSupabaseAdmin(config.supabaseHost, config.serviceRoleKey);

    console.log('🔄 Iniciando migración de psicólogos...');

    try {
      await this.crearPsicologoPorDefecto(cliente);
      await this.asignarPsicologosAPacientes(cliente);
      console.log('✅ Migración completada exitosamente');
    } catch (e) {
      console.error('❌ Error en migración:', e);
    }
  }

  static async crearPsicologoPorDefecto(cliente) {
    console.log('📝 Verificando psicólogos existentes...');
    
    const resultado = await cliente.get('/rest/v1/psicologos?select=id&limit=1');
    
    if (resultado.data && Array.isArray(resultado.data) && resultado.data.length > 0) {
      console.log('✅ Ya existe al menos un psicólogo');
      return resultado.data[0].id;
    }

    console.log('➕ Creando psicólogo por defecto...');
    const nuevoPsiclogo = {
      nombre: 'Psicólogo',
      apellido: 'General',
      correo: 'psicologo@sistema.local',
      telefono: '0000000000',
      contrasena_hash: '0' + '0'.repeat(63)
    };

    const resultadoPost = await cliente.post('/rest/v1/psicologos', nuevoPsiclogo);
    
    if (resultadoPost.status >= 300) {
      throw new Error('No se pudo crear psicólogo: ' + JSON.stringify(resultadoPost.data));
    }

    const id = Array.isArray(resultadoPost.data) ? resultadoPost.data[0].id : resultadoPost.data.id;
    console.log('✅ Psicólogo creado con ID:', id);
    return id;
  }

  static async asignarPsicologosAPacientes(cliente) {
    console.log('🔗 Obteniendo psicólogo...');
    
    const resultadoPsico = await cliente.get('/rest/v1/psicologos?select=id&limit=1');
    if (!resultadoPsico.data || resultadoPsico.data.length === 0) {
      throw new Error('No hay psicólogos disponibles');
    }
    
    const psicologoId = resultadoPsico.data[0].id;
    console.log('📍 Usando psicólogo ID:', psicologoId);

    console.log('👥 Obteniendo pacientes...');
    const resultadoPacientes = await cliente.get('/rest/v1/pacientes?select=id');
    
    if (!resultadoPacientes.data || resultadoPacientes.data.length === 0) {
      console.log('✅ No hay pacientes para actualizar');
      return;
    }

    console.log(`🔄 Actualizando ${resultadoPacientes.data.length} pacientes...`);

    for (const paciente of resultadoPacientes.data) {
      const actualizacion = {
        psicologo_id: psicologoId
      };

      const resultado = await cliente.patch(
        `/rest/v1/pacientes?id=eq.${paciente.id}`,
        actualizacion
      );

      if (resultado.status >= 300) {
        console.warn(`⚠️ Error actualizando paciente ${paciente.id}:`, resultado.data);
      } else {
        console.log(`✅ Paciente ${paciente.id} actualizado`);
      }
    }

    console.log('✅ Todos los pacientes actualizados');
  }
}

module.exports = MigracionPsicologos;
