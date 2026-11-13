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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  TextField,
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

import VisibilityIcon from '@mui/icons-material/Visibility'
import SearchIcon from '@mui/icons-material/Search'

const drawerWidth = 240

function App() {


  const columnasPacientes = [
    {
      field: 'id',
      headerName: 'ID',
      width: 75,
    },
    {
      field: 'nombre',
      headerName: 'Paciente',
      flex: 1,
      minWidth: 170,
    },
    {
      field: 'tipo_documento',
      headerName: 'Tipo Doc.',
      width: 110,
      valueFormatter: (value) => value ?? '—',
    },
    {
      field: 'numero_documento',
      headerName: 'N.º Documento',
      width: 155,
      valueFormatter: (value) => value ?? '—',
    },
    {
      field: 'correo',
      headerName: 'Correo electrónico',
      flex: 1,
      minWidth: 220,
      valueFormatter: (value) => value ?? '—',
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'ACTIVO'
              ? 'success'
              : 'default'
          }
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 125,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          size="small"
          startIcon={<VisibilityIcon />}
          onClick={(event) => {
            event.stopPropagation()
            setPacienteSeleccionado(params.row)
          }}
        >
          Ver
        </Button>
      ),
    },
  ]


  const auth = useAuth()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [pacientes, setPacientes] = useState([])
  const [cargando, setCargando] = useState(false)
  const [errorConsulta, setErrorConsulta] = useState('')
  const [consultado, setConsultado] = useState(false)

  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('TODOS')

  const totalActivos = pacientes.filter((p) => p.estado === 'ACTIVO').length
  const totalInactivos = pacientes.filter((p) => p.estado === 'INACTIVO').length
  const normalizar = (valor) => String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

  const termino = normalizar(busqueda)
  const pacientesFiltrados = pacientes.filter((paciente) => {
    const coincideEstado = filtroEstado === 'TODOS' || paciente.estado === filtroEstado
    const nombreCompleto = [
      paciente.nombre,
      paciente.nombres,
      paciente.apellido_paterno,
      paciente.apellido_materno,
    ].filter(Boolean).join(' ')
    const coincideBusqueda = !termino || normalizar(nombreCompleto).includes(termino) ||
      normalizar(paciente.numero_documento).includes(termino)
    return coincideEstado && coincideBusqueda
  })

  const consultarPacientes = async () => {
    setCargando(true)
    setErrorConsulta('')
    setPacientes([])
    setConsultado(false)
    setPacienteSeleccionado(null)

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


            {consultado && (
              <>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
                  {[
                    ['Total de pacientes', pacientes.length, 'primary.main'],
                    ['Activos', totalActivos, 'success.main'],
                    ['Inactivos', totalInactivos, 'text.secondary'],
                  ].map(([etiqueta, cantidad, color]) => (
                    <Paper key={etiqueta} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">{etiqueta}</Typography>
                      <Typography variant="h4" fontWeight={700} sx={{ color }}>{cantidad}</Typography>
                    </Paper>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2, alignItems: 'center' }}>
                  <TextField
                    label="Buscar paciente"
                    placeholder="Nombre o número de documento"
                    size="small"
                    value={busqueda}
                    onChange={(event) => setBusqueda(event.target.value)}
                    sx={{ flex: '1 1 260px' }}
                    InputProps={{ startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} /> }}
                  />
                  <TextField
                    select
                    label="Estado"
                    size="small"
                    value={filtroEstado}
                    onChange={(event) => setFiltroEstado(event.target.value)}
                    sx={{ minWidth: 160 }}
                  >
                    <MenuItem value="TODOS">Todos</MenuItem>
                    <MenuItem value="ACTIVO">Activos</MenuItem>
                    <MenuItem value="INACTIVO">Inactivos</MenuItem>
                  </TextField>
                  <Button
                    variant="outlined"
                    disabled={!busqueda && filtroEstado === 'TODOS'}
                    onClick={() => { setBusqueda(''); setFiltroEstado('TODOS') }}
                  >
                    Limpiar filtros
                  </Button>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Mostrando {pacientesFiltrados.length} de {pacientes.length} pacientes
                </Typography>
              </>
            )}

            <Box sx={{ width: '100%', minWidth: 0 }}>
              <DataGrid
                rows={pacientesFiltrados}
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
                    ? 'No hay pacientes que coincidan con la búsqueda o los filtros.'
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

          <Dialog
            open={pacienteSeleccionado !== null}
            onClose={() => setPacienteSeleccionado(null)}
            maxWidth="md"
            fullWidth
            aria-labelledby="detalle-paciente-titulo"
          >
            <DialogTitle id="detalle-paciente-titulo">
              Detalle del paciente
            </DialogTitle>
            <DialogContent dividers>
              {pacienteSeleccionado && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      {[
                        pacienteSeleccionado.nombres,
                        pacienteSeleccionado.apellido_paterno,
                        pacienteSeleccionado.apellido_materno,
                      ].filter(Boolean).join(' ') || pacienteSeleccionado.nombre || 'Paciente'}
                    </Typography>
                    <Chip
                      sx={{ mt: 1 }}
                      size="small"
                      variant="outlined"
                      label={pacienteSeleccionado.estado ?? 'SIN ESTADO'}
                      color={pacienteSeleccionado.estado === 'ACTIVO' ? 'success' : 'default'}
                    />
                  </Box>

                  <Divider />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Identificación y datos personales
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    {[
                      ['ID', pacienteSeleccionado.id],
                      ['Nombres', pacienteSeleccionado.nombres],
                      ['Apellido paterno', pacienteSeleccionado.apellido_paterno],
                      ['Apellido materno', pacienteSeleccionado.apellido_materno],
                      ['Tipo de documento', pacienteSeleccionado.tipo_documento],
                      ['Número de documento', pacienteSeleccionado.numero_documento],
                      ['Fecha de nacimiento', pacienteSeleccionado.fecha_nacimiento],
                      ['Sexo', pacienteSeleccionado.sexo],
                      ['Estado civil', pacienteSeleccionado.estado_civil],
                    ].map(([etiqueta, valor]) => (
                      <Box key={etiqueta}>
                        <Typography variant="caption" color="text.secondary">{etiqueta}</Typography>
                        <Typography sx={{ overflowWrap: 'anywhere' }}>{valor ?? '—'}</Typography>
                      </Box>
                    ))}
                  </Box>

                  <Divider />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Información médica básica
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Tipo de sangre</Typography>
                      <Typography>{pacienteSeleccionado.tipo_sangre ?? '—'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Donador de órganos</Typography>
                      <Typography>
                        {pacienteSeleccionado.donador_organos == null
                          ? '—'
                          : pacienteSeleccionado.donador_organos === true || pacienteSeleccionado.donador_organos === 'true'
                            ? 'Sí'
                            : 'No'}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Contacto y otros datos
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    {[
                      ['Correo', pacienteSeleccionado.correo],
                      ['Dirección', pacienteSeleccionado.direccion],
                      ['Ubigeo', pacienteSeleccionado.ubigeo],
                      ['Ocupación', pacienteSeleccionado.ocupacion],
                      ['Última modificación', pacienteSeleccionado.modificado_en],
                    ].map(([etiqueta, valor]) => (
                      <Box key={etiqueta}>
                        <Typography variant="caption" color="text.secondary">{etiqueta}</Typography>
                        <Typography sx={{ overflowWrap: 'anywhere' }}>{valor ?? '—'}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPacienteSeleccionado(null)}>Cerrar</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </>
  )
}

export default App
