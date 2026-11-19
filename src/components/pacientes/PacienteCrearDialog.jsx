
import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'

import { useCatalogos } from '../../hooks/useCatalogos'
import { crearPaciente } from '../../services/crearPacienteApi'

const formularioInicial = {
  nombres: '',
  apellido_paterno: '',
  apellido_materno: '',
  tipo_documento: '',
  numero_documento: '',
  fecha_nacimiento: '',
  sexo: '',
  correo: '',
  telefono_movil: '',
  direccion: '',
  ubigeo: '',
  ocupacion: '',
  estado_civil: '',
  tipo_sangre: '',
}

function obtenerFechaLocal() {
  const fecha = new Date()
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')

  return `${anio}-${mes}-${dia}`
}

function validarDatos(formulario, catalogos) {
  const errores = {}

  if (!formulario.nombres.trim()) {
    errores.nombres = 'Los nombres son obligatorios.'
  }

  if (!formulario.apellido_paterno.trim()) {
    errores.apellido_paterno = 'El apellido paterno es obligatorio.'
  }

  if (!formulario.tipo_documento) {
    errores.tipo_documento = 'Selecciona un tipo de documento.'
  } else if (
    !catalogos.tipos_documento.some(
      (item) => item.codigo === formulario.tipo_documento
    )
  ) {
    errores.tipo_documento = 'Selecciona un tipo de documento válido.'
  }

  if (!formulario.numero_documento.trim()) {
    errores.numero_documento = 'El número de documento es obligatorio.'
  }

  if (
    formulario.fecha_nacimiento &&
    formulario.fecha_nacimiento > obtenerFechaLocal()
  ) {
    errores.fecha_nacimiento =
      'La fecha de nacimiento no puede ser futura.'
  }

  if (
    formulario.sexo &&
    !['M', 'F', 'X'].includes(formulario.sexo)
  ) {
    errores.sexo = 'Selecciona un sexo válido.'
  }

  const correo = formulario.correo.trim()

  if (!correo) {
    errores.correo = 'El correo electrónico es obligatorio.'
  } else if (correo.length > 254) {
    errores.correo = 'El correo no puede superar 254 caracteres.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    errores.correo = 'Ingresa un correo electrónico válido.'
  }

  const telefono = formulario.telefono_movil.trim()

  if (!telefono) {
    errores.telefono_movil = 'El teléfono móvil es obligatorio.'
  } else if (!/^9[0-9]{8}$/.test(telefono)) {
    errores.telefono_movil =
      'Ingresa 9 dígitos, comenzando por 9.'
  }

  const ubigeo = formulario.ubigeo.trim()

  if (ubigeo && !/^[0-9]{6}$/.test(ubigeo)) {
    errores.ubigeo = 'El ubigeo debe contener exactamente 6 dígitos.'
  }

  if (
    formulario.estado_civil &&
    !catalogos.estados_civiles.some(
      (item) => item.codigo === formulario.estado_civil
    )
  ) {
    errores.estado_civil = 'Selecciona un estado civil válido.'
  }

  if (
    formulario.tipo_sangre &&
    !catalogos.tipos_sangre.some(
      (item) => item.codigo === formulario.tipo_sangre
    )
  ) {
    errores.tipo_sangre = 'Selecciona un tipo de sangre válido.'
  }

  return errores
}

export default function PacienteCrearDialog({
  open,
  onClose,
  onCreado,
  token,
}) {
  const [formulario, setFormulario] = useState(formularioInicial)
  const [errores, setErrores] = useState({})

  const [guardando, setGuardando] = useState(false)
  const [errorGuardado, setErrorGuardado] = useState('')

  const {
    catalogos,
    cargando,
    error,
    consultarCatalogos,
  } = useCatalogos(token, open)

  const actualizarCampo = (campo, valor) => {
    setErrorGuardado('')

    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }))

    setErrores((anteriores) => ({
      ...anteriores,
      [campo]: undefined,
    }))

  }

  const cerrar = () => {
    setFormulario({ ...formularioInicial })
    setErrores({})
    onClose()
    setErrorGuardado('')
  }

  const validarFormulario = () => {
    const nuevosErrores = validarDatos(formulario, catalogos)

    setErrores(nuevosErrores)

    const esValido = Object.keys(nuevosErrores).length === 0

    return esValido
  }

  const guardarPaciente = async () => {
    if (guardando || catalogosNoDisponibles) return

    setErrorGuardado('')

    if (!validarFormulario()) return

    setGuardando(true)

    try {
      const paciente = Object.fromEntries(
        Object.entries(formulario).map(([campo, valor]) => [
          campo,
          typeof valor === 'string' ? valor.trim() : valor,
        ])
      )

      const resultado = await crearPaciente(token, paciente)

      if (resultado.resultado !== 'OK') {
        throw new Error('La API devolvió una respuesta inesperada.')
      }

      cerrar()
      onCreado?.()
    } catch (error) {
      setErrorGuardado(
        error instanceof Error
          ? error.message
          : 'No se pudo registrar el paciente.'
      )
    } finally {
      setGuardando(false)
    }
  }

  const catalogosNoDisponibles =
    cargando || Boolean(error)

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!guardando) cerrar()
      }}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        Registrar nuevo paciente
      </DialogTitle>

      <Divider />

      <DialogContent>
        {cargando && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              py: 6,
            }}
          >
            <CircularProgress size={36} />
            <Typography color="text.secondary">
              Cargando catálogos...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={consultarCatalogos}
              >
                Reintentar
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {errorGuardado && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorGuardado}
          </Alert>
        )}


        {!catalogosNoDisponibles && (
          <>
            <Typography
              variant="subtitle1"
              sx={{ mb: 2, fontWeight: 600 }}
            >
              Identificación
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                },
                gap: 2,
                mb: 3,
              }}
            >
              <TextField
                label="Nombres"
                required
                value={formulario.nombres}
                onChange={(e) =>
                  actualizarCampo('nombres', e.target.value)
                }
                error={Boolean(errores.nombres)}
                helperText={errores.nombres}
              />

              <TextField
                label="Apellido paterno"
                required
                value={formulario.apellido_paterno}
                onChange={(e) =>
                  actualizarCampo('apellido_paterno', e.target.value)
                }
                error={Boolean(errores.apellido_paterno)}
                helperText={errores.apellido_paterno}
              />

              <TextField
                label="Apellido materno"
                value={formulario.apellido_materno}
                onChange={(e) =>
                  actualizarCampo('apellido_materno', e.target.value)
                }
              />

              <TextField
                select
                label="Tipo de documento"
                required
                value={formulario.tipo_documento}
                disabled={catalogosNoDisponibles}
                onChange={(e) =>
                  actualizarCampo('tipo_documento', e.target.value)
                }
                error={Boolean(errores.tipo_documento)}
                helperText={errores.tipo_documento}
              >
                <MenuItem value="">Seleccionar</MenuItem>

                {catalogos.tipos_documento.map((item) => (
                  <MenuItem key={item.id} value={item.codigo}>
                    {item.descripcion}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Número de documento"
                required
                value={formulario.numero_documento}
                onChange={(e) =>
                  actualizarCampo('numero_documento', e.target.value)
                }
                error={Boolean(errores.numero_documento)}
                helperText={errores.numero_documento}
              />

              <TextField
                label="Fecha de nacimiento"
                type="date"
                slotProps={{
                  inputLabel: { shrink: true },
                  htmlInput: { max: obtenerFechaLocal() },
                }}
                value={formulario.fecha_nacimiento}
                onChange={(e) =>
                  actualizarCampo('fecha_nacimiento', e.target.value)
                }
                error={Boolean(errores.fecha_nacimiento)}
                helperText={errores.fecha_nacimiento}
              />

              <TextField
                select
                label="Sexo"
                value={formulario.sexo}
                onChange={(e) =>
                  actualizarCampo('sexo', e.target.value)
                }
                error={Boolean(errores.sexo)}
                helperText={errores.sexo}
              >
                <MenuItem value="">Sin especificar</MenuItem>
                <MenuItem value="M">Masculino</MenuItem>
                <MenuItem value="F">Femenino</MenuItem>
                <MenuItem value="X">Otro / No especificado</MenuItem>
              </TextField>
            </Box>

            <Typography
              variant="subtitle1"
              sx={{ mb: 2, fontWeight: 600 }}
            >
              Información adicional
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                },
                gap: 2,
              }}
            >
              <TextField
                select
                label="Estado civil"
                value={formulario.estado_civil}
                disabled={catalogosNoDisponibles}
                onChange={(e) =>
                  actualizarCampo('estado_civil', e.target.value)
                }
                error={Boolean(errores.estado_civil)}
                helperText={errores.estado_civil}
              >
                <MenuItem value="">Sin especificar</MenuItem>

                {catalogos.estados_civiles.map((item) => (
                  <MenuItem key={item.id} value={item.codigo}>
                    {item.descripcion}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Tipo de sangre"
                value={formulario.tipo_sangre}
                disabled={catalogosNoDisponibles}
                onChange={(e) =>
                  actualizarCampo('tipo_sangre', e.target.value)
                }
                error={Boolean(errores.tipo_sangre)}
                helperText={errores.tipo_sangre}
              >
                <MenuItem value="">Sin especificar</MenuItem>

                {catalogos.tipos_sangre.map((item) => (
                  <MenuItem key={item.id} value={item.codigo}>
                    {item.descripcion}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Correo electrónico"
                type="email"
                required
                value={formulario.correo}
                onChange={(e) =>
                  actualizarCampo('correo', e.target.value)
                }
                error={Boolean(errores.correo)}
                helperText={errores.correo}
                slotProps={{
                  htmlInput: { maxLength: 254 },
                }}
              />

              <TextField
                label="Teléfono móvil"
                type="tel"
                required
                value={formulario.telefono_movil}
                onChange={(e) =>
                  actualizarCampo('telefono_movil', e.target.value)
                }
                error={Boolean(errores.telefono_movil)}
                helperText={
                  errores.telefono_movil ||
                  '9 dígitos, comenzando por 9.'
                }
                slotProps={{
                  htmlInput: {
                    maxLength: 9,
                    inputMode: 'numeric',
                  },
                }}
              />

              <TextField
                label="Ubigeo"
                value={formulario.ubigeo}
                onChange={(e) =>
                  actualizarCampo('ubigeo', e.target.value)
                }
                error={Boolean(errores.ubigeo)}
                helperText={errores.ubigeo}
                slotProps={{
                  htmlInput: {
                    maxLength: 6,
                    inputMode: 'numeric',
                  },
                }}
              />

              <TextField
                label="Dirección"
                value={formulario.direccion}
                onChange={(e) =>
                  actualizarCampo('direccion', e.target.value)
                }
              />

              <TextField
                label="Ocupación"
                value={formulario.ocupacion}
                onChange={(e) =>
                  actualizarCampo('ocupacion', e.target.value)
                }
              />

            </Box>
          </>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={cerrar}
          color="inherit"
          disabled={guardando}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={guardarPaciente}
          disabled={catalogosNoDisponibles || guardando}
          startIcon={
            guardando
              ? <CircularProgress size={18} color="inherit" />
              : null
          }
        >
          {guardando ? 'Guardando...' : 'Guardar paciente'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
