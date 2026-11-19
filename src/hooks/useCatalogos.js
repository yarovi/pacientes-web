
import { useCallback, useEffect, useState } from 'react'
import { obtenerCatalogos } from '../services/catalogosApi'

const catalogosIniciales = {
  tipos_documento: [],
  estados_civiles: [],
  tipos_sangre: [],
}

export function useCatalogos(token, habilitado) {
  const [catalogos, setCatalogos] = useState(catalogosIniciales)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const consultarCatalogos = useCallback(async () => {
    if (!habilitado) return

    setCargando(true)
    setError('')

    try {
      const resultado = await obtenerCatalogos(token)
      setCatalogos(resultado)
    } catch (err) {
      setCatalogos(catalogosIniciales)
      setError(err.message || 'Error al consultar catálogos.')
    } finally {
      setCargando(false)
    }
  }, [token, habilitado])

  useEffect(() => {
    if (habilitado) {
      consultarCatalogos()
    }
  }, [habilitado, consultarCatalogos])

  return {
    catalogos,
    cargando,
    error,
    consultarCatalogos,
  }
}
