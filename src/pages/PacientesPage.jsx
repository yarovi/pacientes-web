import { useState } from 'react'
import { Alert, Box, Button, CircularProgress, Paper, Typography } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import { usePacientes } from '../hooks/usePacientes'
import { contarPacientesPorEstado, filtrarPacientes } from '../utils/pacientesUtils'
import PacientesResumen from '../components/pacientes/PacientesResumen'
import PacientesFiltros from '../components/pacientes/PacientesFiltros'
import PacientesTabla from '../components/pacientes/PacientesTabla'
import PacienteDetalleDialog from '../components/pacientes/PacienteDetalleDialog'

export default function PacientesPage({ token }) {
  const { pacientes, cargando, errorConsulta, consultado, consultarPacientes } = usePacientes()
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('TODOS')
  const { totalActivos, totalInactivos } = contarPacientesPorEstado(pacientes)
  const pacientesFiltrados = filtrarPacientes(pacientes, busqueda, filtroEstado)

  const ejecutarConsulta = () => {
    setPacienteSeleccionado(null)
    consultarPacientes(token)
  }

  return (
    <>
      <Typography variant="h4" fontWeight={700} gutterBottom>Pacientes</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Consulta de pacientes registrados.</Typography>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box>
            <Typography variant="h6">Listado de pacientes</Typography>
            <Typography variant="body2" color="text.secondary">Información obtenida desde Zuplo.</Typography>
          </Box>
          <Button variant="contained" startIcon={cargando ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />} disabled={cargando} onClick={ejecutarConsulta}>
            {cargando ? 'Consultando...' : 'Listar pacientes'}
          </Button>
        </Box>
        {errorConsulta && <Alert severity="error" sx={{ mb: 2 }}>{errorConsulta}</Alert>}
        {consultado && <Alert severity="success" sx={{ mb: 2 }}>Consulta completada. Total: {pacientes.length} pacientes.</Alert>}
        {consultado && (
          <>
            <PacientesResumen total={pacientes.length} totalActivos={totalActivos} totalInactivos={totalInactivos} />
            <PacientesFiltros busqueda={busqueda} setBusqueda={setBusqueda} filtroEstado={filtroEstado} setFiltroEstado={setFiltroEstado} totalFiltrados={pacientesFiltrados.length} totalPacientes={pacientes.length} />
          </>
        )}
        <PacientesTabla pacientes={pacientesFiltrados} cargando={cargando} consultado={consultado} onVerPaciente={setPacienteSeleccionado} />
      </Paper>
      <PacienteDetalleDialog pacienteSeleccionado={pacienteSeleccionado} onClose={() => setPacienteSeleccionado(null)} />
    </>
  )
}
