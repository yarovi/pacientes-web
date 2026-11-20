
import { useAuth } from 'react-oidc-context'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material'

import LoginPage from './components/auth/LoginPage'
import AppLayout from './components/layout/AppLayout'
import PacientesPage from './pages/PacientesPage'
import { tienePermiso } from './utils/permisosUtils'

export default function App() {
  const auth = useAuth()

  const puedeEscribirPacientes = tienePermiso(
    auth.user?.profile,
    'pacientes.write'
  )

  if (auth.isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography>Verificando sesión...</Typography>
      </Box>
    )
  }

  if (auth.error) {
    return (
      <Box sx={{ maxWidth: 500, mx: 'auto', mt: 8, p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {auth.error.message}
        </Alert>

        <Button
          variant="contained"
          onClick={() => auth.signinRedirect()}
        >
          Reintentar autenticación
        </Button>
      </Box>
    )
  }

  if (!auth.isAuthenticated) {
    return (
      <LoginPage
        onLogin={() => auth.signinRedirect()}
      />
    )
  }

  const email =
    auth.user?.profile?.email ?? 'Usuario autenticado'

  return (
    <AppLayout
      email={email}
      onLogout={() => auth.removeUser()}
    >
      <PacientesPage
        token={auth.user?.access_token}
        puedeCrear={puedeEscribirPacientes}
        puedeEditar={puedeEscribirPacientes}
      />
    </AppLayout>
  )
}
