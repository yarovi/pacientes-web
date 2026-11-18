import { Box, Button, CssBaseline, Paper, Typography } from '@mui/material'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'

export default function LoginPage({ onLogin }) {
  return (
    <>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f4f6f8', p: 2 }}>
        <Paper elevation={3} sx={{ p: 5, textAlign: 'center', maxWidth: 420, width: '100%', borderRadius: 3 }}>
          <LocalHospitalIcon color="primary" sx={{ fontSize: 54, mb: 2 }} />
          <Typography variant="h4" fontWeight={700} gutterBottom>Pacientes Web</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>Inicia sesión para consultar pacientes.</Typography>
          <Button variant="contained" size="large" fullWidth onClick={onLogin}>Iniciar sesión con Descope</Button>
        </Paper>
      </Box>
    </>
  )
}
