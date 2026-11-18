import { useState } from 'react'
import { obtenerPacientes } from '../services/pacientesApi'

export function usePacientes() {
  const [pacientes, setPacientes] = useState([])
  const [cargando, setCargando] = useState(false)
  const [errorConsulta, setErrorConsulta] = useState('')
  const [consultado, setConsultado] = useState(false)

  const consultarPacientes = async (token) => {
    setCargando(true)
    setErrorConsulta('')
    setPacientes([])
    setConsultado(false)
    try {
      const resultado = await obtenerPacientes(token)
      setPacientes(resultado)
      setConsultado(true)
    } catch (error) {
      setErrorConsulta(error instanceof Error ? error.message : 'No se pudo consultar pacientes.')
    } finally {
      setCargando(false)
    }
  }
  return { pacientes, cargando, errorConsulta, consultado, consultarPacientes }
}
