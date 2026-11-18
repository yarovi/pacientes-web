import { useState } from 'react'
import {
  AppBar, Avatar, Box, CssBaseline, Divider, Drawer, IconButton,
  List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import PeopleIcon from '@mui/icons-material/People'
import HistoryIcon from '@mui/icons-material/History'
import LogoutIcon from '@mui/icons-material/Logout'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'

const drawerWidth = 240

export default function AppLayout({ email, onLogout, children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const drawerContent = (
    <Box>
      <Toolbar>
        <LocalHospitalIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" fontWeight={700}>Pacientes Web</Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItemButton selected onClick={() => setMobileOpen(false)}>
          <ListItemIcon><PeopleIcon /></ListItemIcon>
          <ListItemText primary="Pacientes" />
        </ListItemButton>
        <ListItemButton disabled>
          <ListItemIcon><HistoryIcon /></ListItemIcon>
          <ListItemText primary="Historial" secondary="Próximamente" />
        </ListItemButton>
      </List>
    </Box>
  )
  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f6f8' }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { sm: 'none' } }} aria-label="Abrir menú"><MenuIcon /></IconButton>
            <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>Gestión de Pacientes</Typography>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', mr: 1 }}>{email.charAt(0).toUpperCase()}</Avatar>
            <Typography variant="body2" sx={{ mr: 2, display: { xs: 'none', md: 'block' } }}>{email}</Typography>
            <IconButton color="inherit" onClick={onLogout} aria-label="Cerrar sesión local" title="Cerrar sesión local"><LogoutIcon /></IconButton>
          </Toolbar>
        </AppBar>
        <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
          <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}>
            {drawerContent}
          </Drawer>
          <Drawer variant="permanent" open sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', pt: 8 } }}>
            {drawerContent}
          </Drawer>
        </Box>
        <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, sm: 3 } }}>
          <Toolbar />
          {children}
        </Box>
      </Box>
    </>
  )
}
