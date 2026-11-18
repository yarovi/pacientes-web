import { Box, Paper, Typography } from '@mui/material'

export default function PacientesResumen({ total, totalActivos, totalInactivos }) {
  const indicadores = [
    ['Total de pacientes', total, 'primary.main'],
    ['Activos', totalActivos, 'success.main'],
    ['Inactivos', totalInactivos, 'text.secondary'],
  ]
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
      {indicadores.map(([etiqueta, cantidad, color]) => (
        <Paper key={etiqueta} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">{etiqueta}</Typography>
          <Typography variant="h4" fontWeight={700} sx={{ color }}>{cantidad}</Typography>
        </Paper>
      ))}
    </Box>
  )
}
