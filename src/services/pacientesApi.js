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
