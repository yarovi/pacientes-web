// Activar solo cuando POST /pacientes esté desplegado y validado en Zuplo.
export async function crearPaciente(token, paciente) {
  if (!token) throw new Error('No existe una sesión válida.')
  const base = import.meta.env.VITE_ZUPLO_API_URL
  if (!base) throw new Error('No se configuró VITE_ZUPLO_API_URL.')
  const response = await fetch(`${base.replace(/\/$/, '')}/pacientes`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(paciente),
  })
  const data = await response.json().catch(() => ({}))
  if (response.status === 400) {
    throw new Error(data.mensaje || 'Verifica los datos ingresados.')
  }
  if (response.status === 401) throw new Error('Sesión inválida o expirada.')
  if (response.status === 403) throw new Error('No tienes el permiso pacientes.write.')
  if (response.status === 409) throw new Error(data.mensaje || 'Ya existe un paciente con ese documento.')
  if (response.status === 429) throw new Error('Límite de solicitudes alcanzado.')
  if (!response.ok) throw new Error(data.mensaje || `No se pudo crear el paciente (HTTP ${response.status}).`)
  return data
}
