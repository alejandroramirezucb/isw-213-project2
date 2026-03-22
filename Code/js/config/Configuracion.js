class Configuracion {
  static RUTAS = {
    INICIO: 'index.html',
    PSICOLOGO: 'psicologo/base.html',
    PACIENTE: 'paciente/base.html',
  };

  static SELECTORES_AUTENTICACION = {
    BOTON_MOSTRAR_REGISTRO: '#btn-mostrar-registro',
    BOTON_MOSTRAR_LOGIN: '#btn-mostrar-login',
    FORMULARIO_LOGIN: '#formulario-login',
    FORMULARIO_REGISTRO: '#formulario-registro',
    CORREO_LOGIN: '#correo-login',
    PASSWORD_LOGIN: '#contrasena-login',
    NOMBRE_REGISTRO: '#nombre-registro',
    APELLIDO_REGISTRO: '#apellido-registro',
    CORREO_REGISTRO: '#correo-registro',
    TELEFONO_REGISTRO: '#telefono-registro',
    PASSWORD_REGISTRO: '#contrasena-registro',
    TIPO_CUENTA: 'input[name="tipo-cuenta"]:checked',
  };

  static SELECTORES_FORMULARIOS = {
    SECCION_LOGIN: '#seccion-login',
    SECCION_REGISTRO: '#seccion-registro',
  };

  static SELECTORES_MENSAJES = {
    CONTENEDOR_MENSAJES: '#mensaje-estado',
    TEXTO_MENSAJES: '.mensaje__texto',
  };

  static SELECTORES_CALENDARIO = {
    CONTENEDOR: '#calendario-dias',
    TITULO: '#calendario-mes',
  };

  static SELECTORES_PACIENTE = {
    NAVEGACION_BOTONES: '.navegacion__boton',
    BOTON_MES_ANTERIOR: '#btn-mes-anterior',
    BOTON_MES_SIGUIENTE: '#btn-mes-siguiente',
    BOTON_CERRAR_SESION: '#btn-cerrar-sesion',
    MODAL_RESERVA: '#modal-reserva',
    FILTROS_BOTONES: '.filtros__boton',
    PERFIL_NOMBRE: '#perfil-nombre',
    PERFIL_APELLIDO: '#perfil-apellido',
    PERFIL_CORREO: '#perfil-correo',
    MODAL_PASSWORD: '#modal-cambiar-password',
    FORMULARIO_PASSWORD: '#formulario-cambiar-password',
  };

  static SELECTORES_PSICOLOGO = {
    NAVEGACION_BOTONES: '.navegacion__boton',
    PERIODO_BOTONES: '.periodo__boton',
    BOTON_CERRAR_SESION: '#btn-cerrar-sesion',
    FORMULARIO_HORARIOS: '#formulario-horarios',
    CONFIGURACION_CHECKBOX: '.configuracion__checkbox',
    BUSQUEDA_PACIENTE: '#busqueda-paciente',
    MODAL_PASSWORD: '#modal-cambiar-password',
    FORMULARIO_PASSWORD: '#formulario-cambiar-password',
  };

  static CLASES_CSS = {
    OCULTO_AUTENTICACION: 'entrada--oculta',
    OCULTO_MENSAJE: 'mensaje--oculto',
    ACTIVO_MENSAJE_EXITO: 'mensaje--exito',
    ACTIVO_MENSAJE_ERROR: 'mensaje--error',
    ACTIVO_MENSAJE_INFO: 'mensaje--info',
    ACTIVO_VISTA: 'vista--activa',
    ACTIVO_BOTON_NAVEGACION: 'navegacion__boton--activo',
    OCULTO_MODAL: 'modal--oculto',
    FILTRO_ACTIVO: 'filtros__boton--activo',
    PERIODO_ACTIVO: 'periodo__boton--activo',
  };

  static API = {
    ENDPOINT_REGISTRO: '/api/registrar',
    TIPO_CONTENIDO: 'application/json',
  };

  static DURACIONES = {
    MENSAJE_AUTENTICACION: 4000,
    MENSAJE_DASHBOARD: 3000,
  };

  static IDS_MODALES = {
    RESERVA: 'modal-reserva',
    CANCELACION: 'modal-cancelacion',
    DETALLE_CITA: 'modal-detalle-cita',
    HISTORIAL_PACIENTE: 'modal-historial-paciente',
    PASSWORD: 'modal-cambiar-password',
  };

  static VALIDACIONES = {
    MINIMO_CARACTERES_PASSWORD: 6,
    MINIMO_CARACTERES_NOMBRE: 2,
  };
}
