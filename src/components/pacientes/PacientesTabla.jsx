import { Box, Button, Chip } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import VisibilityIcon from '@mui/icons-material/Visibility'

export default function PacientesTabla({ pacientes, cargando, consultado, onVerPaciente }) {
  const columnas = [
    { field: 'id', headerName: 'ID', width: 75 },
    { field: 'nombre', headerName: 'Paciente', flex: 1, minWidth: 170 },
    { field: 'tipo_documento', headerName: 'Tipo Doc.', width: 110, valueFormatter: (value) => value ?? '—' },
    { field: 'numero_documento', headerName: 'N.º Documento', width: 155, valueFormatter: (value) => value ?? '—' },
    { field: 'correo', headerName: 'Correo electrónico', flex: 1, minWidth: 220, valueFormatter: (value) => value ?? '—' },
    { field: 'estado', headerName: 'Estado', width: 130, renderCell: (params) => <Chip label={params.value} color={params.value === 'ACTIVO' ? 'success' : 'default'} size="small" variant="outlined" /> },
    { field: 'acciones', headerName: 'Acciones', width: 125, sortable: false, filterable: false,
      renderCell: (params) => <Button size="small" startIcon={<VisibilityIcon />} onClick={(event) => { event.stopPropagation(); onVerPaciente(params.row) }}>Ver</Button>,
    },
  ]
  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <DataGrid rows={pacientes} columns={columnas} loading={cargando}
        initialState={{ pagination: { paginationModel: { page: 0, pageSize: 5 } } }}
        pageSizeOptions={[5, 10, 25]} disableRowSelectionOnClick autoHeight
        localeText={{ noRowsLabel: consultado ? 'No hay pacientes que coincidan con la búsqueda o los filtros.' : 'Presiona "Listar pacientes" para consultar.' }}
        sx={{ border: 0, '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f8fafc' } }} />
    </Box>
  )
}
