
const catalogosVacios = {
  tipos_documento: [],
  estados_civiles: [],
  tipos_sangre: [],
}

export async function obtenerCatalogos(token) {
  if (!token) {
    throw new Error('No existe una sesión válida.')
  }

  const apiUrl = import.meta.env.VITE_ZUPLO_API_URL

  if (!apiUrl) {
    throw new Error('No está configurada la URL de Zuplo.')
  }

  const response = await fetch(
    `${apiUrl.replace(/\/$/, '')}/catalogos`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' 
      },
    }
  )

  if (response.status === 401) {
    throw new Error('La sesión expiró o el token no es válido.')
  }

  if (response.status === 403) {
    throw new Error('No tienes permisos para consultar catálogos.')
  }

  if (response.status === 429) {
    throw new Error('Se alcanzó el límite de consultas. Intenta más tarde.')
  }

  if (!response.ok) {
    throw new Error(
      `No se pudieron consultar los catálogos. HTTP ${response.status}.`
    )
  }

  const data = await response.json()

  if (data.resultado !== 'OK' || !data.catalogos) {
    throw new Error('La respuesta de catálogos no es válida.')
  }

  for (const nombre of Object.keys(catalogosVacios)) {
    if (!Array.isArray(data.catalogos[nombre])) {
      throw new Error(`El catálogo ${nombre} no tiene un formato válido.`)
    }

    if (
      data.catalogos[nombre].some(
        (item) =>
          typeof item.codigo !== 'string' ||
          typeof item.descripcion !== 'string'
      )
    ) {
      throw new Error(`El catálogo ${nombre} contiene opciones inválidas.`)
    }
  }

  return {
    tipos_documento: data.catalogos.tipos_documento,
    estados_civiles: data.catalogos.estados_civiles,
    tipos_sangre: data.catalogos.tipos_sangre,
  }
}
