
import { useState } from 'react'
import { useAuth } from 'react-oidc-context'

import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
} from '@mui/material'

import MenuIcon from '@mui/icons-material/Menu'
import PeopleIcon from '@mui/icons-material/People'
import HistoryIcon from '@mui/icons-material/History'
import LogoutIcon from '@mui/icons-material/Logout'
import RefreshIcon from '@mui/icons-material/Refresh'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'

import { DataGrid } from '@mui/x-data-grid'

const drawerWidth = 240

function App() {

  const columnasPacientes = [
    {
      field: 'id',
      headerName: 'ID',
      width: 100,
    },
    {
      field: 'nombre',
      headerName: 'Nombre',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'ACTIVO' ? 'success' : 'default'}
          size="small"
          variant="outlined"
        />
      ),
    },
  ]

  const auth = useAuth()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [pacientes, setPacientes] = useState([])
  const [cargando, setCargando] = useState(false)
  const [errorConsulta, setErrorConsulta] = useState('')
  const [consultado, setConsultado] = useState(false)

  const consultarPacientes = async () => {
    setCargando(true)
    setErrorConsulta('')
    setPacientes([])
    setConsultado(false)

    try {
      const token = auth.user?.access_token

      if (!auth.isAuthenticated || !token) {
        throw new Error('No existe una sesión válida.')
      }

      const apiUrl = import.meta.env.VITE_ZUPLO_API_URL

      if (!apiUrl) {
        throw new Error('No se configuró VITE_ZUPLO_API_URL.')
      }

      const response = await fetch(
        `${apiUrl.replace(/\/$/, '')}/validacion/lectura`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.status === 401) {
        throw new Error(
          'Sesión inválida o expirada. Inicia sesión nuevamente.'
        )
      }

      if (response.status === 403) {
        throw new Error('No tienes el permiso pacientes.read.')
      }

      if (response.status === 429) {
        throw new Error(
          'Límite de solicitudes alcanzado. Intenta nuevamente en un minuto.'
        )
      }

      if (!response.ok) {
        throw new Error(
          `Error al consultar pacientes: HTTP ${response.status}`
        )
      }

      const data = await response.json()

      if (data.resultado !== 'OK' || !Array.isArray(data.pacientes)) {
        throw new Error('La API devolvió una respuesta inesperada.')
      }

      setPacientes(data.pacientes)
      setConsultado(true)
    } catch (error) {
      setErrorConsulta(
        error instanceof Error
          ? error.message
          : 'No se pudo consultar pacientes.'
      )
    } finally {
      setCargando(false)
    }
  }

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
      <>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#f4f6f8',
            p: 2,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 5,
              textAlign: 'center',
              maxWidth: 420,
              width: '100%',
              borderRadius: 3,
            }}
          >
            <LocalHospitalIcon
              color="primary"
              sx={{ fontSize: 54, mb: 2 }}
            />

            <Typography variant="h4" fontWeight={700} gutterBottom>
              Pacientes Web
            </Typography>

            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Inicia sesión para consultar pacientes.
            </Typography>

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => auth.signinRedirect()}
            >
              Iniciar sesión con Descope
            </Button>
          </Paper>
        </Box>
      </>
    )
  }

  const email = auth.user?.profile?.email ?? 'Usuario autenticado'

  const drawerContent = (
    <Box>
      <Toolbar>
        <LocalHospitalIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" fontWeight={700}>
          Pacientes Web
        </Typography>
      </Toolbar>

      <Divider />

      <List>
        <ListItemButton
          selected
          onClick={() => setMobileOpen(false)}
        >
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Pacientes" />
        </ListItemButton>

        <ListItemButton disabled>
          <ListItemIcon>
            <HistoryIcon />
          </ListItemIcon>
          <ListItemText
            primary="Historial"
            secondary="Próximamente"
          />
        </ListItemButton>
      </List>
    </Box>
  )

  return (
    <>
      <CssBaseline />

      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f6f8' }}>
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ mr: 2, display: { sm: 'none' } }}
              aria-label="Abrir menú"
            >
              <MenuIcon />
            </IconButton>

            <Typography
              variant="h6"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              Gestión de Pacientes
            </Typography>

            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'secondary.main',
                mr: 1,
              }}
            >
              {email.charAt(0).toUpperCase()}
            </Avatar>

            <Typography
              variant="body2"
              sx={{ mr: 2, display: { xs: 'none', md: 'block' } }}
            >
              {email}
            </Typography>

            <IconButton
              color="inherit"
              onClick={() => auth.removeUser()}
              aria-label="Cerrar sesión local"
              title="Cerrar sesión local"
            >
              <LogoutIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
              },
            }}
          >
            {drawerContent}
          </Drawer>

          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
                pt: 8,
              },
            }}
            open
          >
            {drawerContent}
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minWidth: 0,
            p: { xs: 2, sm: 3 },
          }}
        >
          <Toolbar />

          <Typography variant="h4" fontWeight={700} gutterBottom>
            Pacientes
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Consulta de pacientes registrados.
          </Typography>

          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
                mb: 3,
              }}
            >
              <Box>
                <Typography variant="h6">
                  Listado de pacientes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Información obtenida desde Zuplo.
                </Typography>
              </Box>

              <Button
                variant="contained"
                startIcon={
                  cargando
                    ? <CircularProgress size={18} color="inherit" />
                    : <RefreshIcon />
                }
                disabled={cargando}
                onClick={consultarPacientes}
              >
                {cargando ? 'Consultando...' : 'Listar pacientes'}
              </Button>
            </Box>

            {errorConsulta && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorConsulta}
              </Alert>
            )}

            {consultado && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Consulta completada. Total: {pacientes.length} pacientes.
              </Alert>
            )}


            <Box sx={{ width: '100%', minWidth: 0 }}>
              <DataGrid
                rows={pacientes}
                columns={columnasPacientes}
                loading={cargando}
                initialState={{
                  pagination: {
                    paginationModel: {
                      page: 0,
                      pageSize: 5,
                    },
                  },
                }}
                pageSizeOptions={[5, 10, 25]}
                disableRowSelectionOnClick
                autoHeight
                localeText={{
                  noRowsLabel: consultado
                    ? 'No se encontraron pacientes.'
                    : 'Presiona "Listar pacientes" para consultar.',
                }}
                sx={{
                  border: 0,
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f8fafc',
                  },
                }}
              />
            </Box>
          </Paper>
        </Box>
      </Box>
    </>
  )
}

export default App
