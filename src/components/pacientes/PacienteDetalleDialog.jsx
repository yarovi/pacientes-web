import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Typography } from '@mui/material'

function Campos({ campos }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
      {campos.map(([etiqueta, valor]) => (
        <Box key={etiqueta}>
          <Typography variant="caption" color="text.secondary">{etiqueta}</Typography>
          <Typography sx={{ overflowWrap: 'anywhere' }}>{valor ?? '—'}</Typography>
        </Box>
      ))}
    </Box>
  )
}

export default function PacienteDetalleDialog({ pacienteSeleccionado, onClose }) {
  const p = pacienteSeleccionado
  const donador = p?.donador_organos == null ? '—' :
    p.donador_organos === true || p.donador_organos === 'true' ? 'Sí' : 'No'
  return (
    <Dialog open={p !== null} onClose={onClose} maxWidth="md" fullWidth aria-labelledby="detalle-paciente-titulo">
      <DialogTitle id="detalle-paciente-titulo">Detalle del paciente</DialogTitle>
      <DialogContent dividers>
        {p && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {[p.nombres, p.apellido_paterno, p.apellido_materno].filter(Boolean).join(' ') || p.nombre || 'Paciente'}
              </Typography>
              <Chip sx={{ mt: 1 }} size="small" variant="outlined" label={p.estado ?? 'SIN ESTADO'} color={p.estado === 'ACTIVO' ? 'success' : 'default'} />
            </Box>
            <Divider />
            <Typography variant="subtitle1" fontWeight={700}>Identificación y datos personales</Typography>
            <Campos campos={[
              ['ID', p.id], ['Nombres', p.nombres], ['Apellido paterno', p.apellido_paterno],
              ['Apellido materno', p.apellido_materno], ['Tipo de documento', p.tipo_documento],
              ['Número de documento', p.numero_documento], ['Fecha de nacimiento', p.fecha_nacimiento],
              ['Sexo', p.sexo], ['Estado civil', p.estado_civil],
            ]} />
            <Divider />
            <Typography variant="subtitle1" fontWeight={700}>Información médica básica</Typography>
            <Campos campos={[[ 'Tipo de sangre', p.tipo_sangre ], [ 'Donador de órganos', donador ]]} />
            <Divider />
            <Typography variant="subtitle1" fontWeight={700}>Contacto y otros datos</Typography>
            <Campos campos={[
              ['Correo', p.correo], ['Dirección', p.direccion], ['Ubigeo', p.ubigeo],
              ['Ocupación', p.ocupacion], ['Última modificación', p.modificado_en],
            ]} />
          </Box>
        )}
      </DialogContent>
      <DialogActions><Button onClick={onClose}>Cerrar</Button></DialogActions>
    </Dialog>
  )
}
