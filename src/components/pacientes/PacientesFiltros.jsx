import { Box, Button, MenuItem, TextField, Typography } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

export default function PacientesFiltros({ busqueda, setBusqueda, filtroEstado, setFiltroEstado, totalFiltrados, totalPacientes }) {
  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2, alignItems: 'center' }}>
        <TextField label="Buscar paciente" placeholder="Nombre o número de documento" size="small" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} sx={{ flex: '1 1 260px' }} InputProps={{ startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} /> }} />
        <TextField select label="Estado" size="small" value={filtroEstado} onChange={(event) => setFiltroEstado(event.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="TODOS">Todos</MenuItem>
          <MenuItem value="ACTIVO">Activos</MenuItem>
          <MenuItem value="INACTIVO">Inactivos</MenuItem>
        </TextField>
        <Button variant="outlined" disabled={!busqueda && filtroEstado === 'TODOS'} onClick={() => { setBusqueda(''); setFiltroEstado('TODOS') }}>Limpiar filtros</Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Mostrando {totalFiltrados} de {totalPacientes} pacientes</Typography>
    </>
  )
}
