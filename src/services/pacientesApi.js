export async function obtenerPacientes(token) {
  if (!token) throw new Error('No existe una sesión válida.')
  const apiUrl = import.meta.env.VITE_ZUPLO_API_URL
  if (!apiUrl) throw new Error('No se configuró VITE_ZUPLO_API_URL.')
  const response = await fetch(`${apiUrl.replace(/\/$/, '')}/validacion/lectura`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (response.status === 401) throw new Error('Sesión inválida o expirada. Inicia sesión nuevamente.')
  if (response.status === 403) throw new Error('No tienes el permiso pacientes.read.')
  if (response.status === 429) throw new Error('Límite de solicitudes alcanzado. Intenta nuevamente en un minuto.')
  if (!response.ok) throw new Error(`Error al consultar pacientes: HTTP ${response.status}`)
  const data = await response.json()
  if (data.resultado !== 'OK' || !Array.isArray(data.pacientes)) {
    throw new Error('La API devolvió una respuesta inesperada.')
  }
  return data.pacientes
}

export async function obtenerPacientePorId(token, id) {
  if (!token) throw new Error('No existe una sesión válida.')

  if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0) {
    throw new Error('El identificador del paciente no es válido.')
  }

  const apiUrl = import.meta.env.VITE_ZUPLO_API_URL
  if (!apiUrl) throw new Error('No se configuró VITE_ZUPLO_API_URL.')

  const response = await fetch(
    `${apiUrl.replace(/\/$/, '')}/pacientes/${encodeURIComponent(id)}`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    }
  )

  const data = await response.json().catch(() => ({}))

  if (response.status === 401) throw new Error('Sesión inválida o expirada.')
  if (response.status === 403) throw new Error('No tienes el permiso pacientes.read.')
  if (response.status === 404) throw new Error('El paciente no existe.')
  if (response.status === 429) throw new Error('Límite de solicitudes alcanzado.')

  if (!response.ok) {
    throw new Error(data.mensaje || `Error al consultar paciente (HTTP ${response.status}).`)
  }

  if (data.resultado !== 'OK' || !data.paciente || typeof data.paciente !== 'object' || Array.isArray(data.paciente)) {
    throw new Error('La API devolvió una respuesta inesperada.')
  }

  return data.paciente
}