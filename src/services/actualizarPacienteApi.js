
export async function actualizarPaciente(token, id, cambios) {
  if (!token) throw new Error('No existe una sesión válida.')

  if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0) {
    throw new Error('El identificador del paciente no es válido.')
  }

  if (!cambios || typeof cambios !== 'object' ||
      Array.isArray(cambios) || Object.keys(cambios).length === 0) {
    throw new Error('No existen cambios para actualizar.')
  }

  const base = import.meta.env.VITE_ZUPLO_API_URL
  if (!base) throw new Error('No se configuró VITE_ZUPLO_API_URL.')

  const response = await fetch(
    `${base.replace(/\/$/, '')}/pacientes/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cambios),
    }
  )

  const data = await response.json().catch(() => ({}))

  if (response.status === 400) {
    throw new Error(data.mensaje || 'Verifica los datos ingresados.')
  }

  if (response.status === 401) {
    throw new Error('Sesión inválida o expirada.')
  }

  if (response.status === 403) {
    throw new Error('No tienes el permiso pacientes.write.')
  }

  if (response.status === 404) {
    throw new Error('El paciente no existe.')
  }

  if (response.status === 409) {
    throw new Error(data.mensaje || 'Ya existe un paciente con ese documento.')
  }

  if (response.status === 429) {
    throw new Error('Límite de solicitudes alcanzado.')
  }

  if (!response.ok) {
    throw new Error(
      data.mensaje || `No se pudo actualizar el paciente (HTTP ${response.status}).`
    )
  }

  if (data.resultado !== 'OK') {
    throw new Error('La API devolvió una respuesta inesperada.')
  }

  return data
}
