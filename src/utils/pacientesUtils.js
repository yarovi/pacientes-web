export const normalizar = (valor) => String(valor ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()

export function filtrarPacientes(pacientes, busqueda, filtroEstado) {
  const termino = normalizar(busqueda)
  return pacientes.filter((paciente) => {
    const coincideEstado = filtroEstado === 'TODOS' || paciente.estado === filtroEstado
    const nombreCompleto = [
      paciente.nombre, paciente.nombres, paciente.apellido_paterno, paciente.apellido_materno,
    ].filter(Boolean).join(' ')
    const coincideBusqueda = !termino || normalizar(nombreCompleto).includes(termino) ||
      normalizar(paciente.numero_documento).includes(termino)
    return coincideEstado && coincideBusqueda
  })
}

export function contarPacientesPorEstado(pacientes) {
  return {
    totalActivos: pacientes.filter((p) => p.estado === 'ACTIVO').length,
    totalInactivos: pacientes.filter((p) => p.estado === 'INACTIVO').length,
  }
}
