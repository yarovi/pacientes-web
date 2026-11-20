
import { useEffect, useState } from 'react'
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
import { obtenerPacientePorId } from '../../services/pacientesApi'
import { actualizarPaciente } from '../../services/actualizarPacienteApi'

const camposEditables = [
    'nombres',
    'apellido_paterno',
    'apellido_materno',
    'tipo_documento',
    'numero_documento',
    'fecha_nacimiento',
    'sexo',
    'correo',
    'telefono_movil',
    'direccion',
    'ubigeo',
    'ocupacion',
    'estado_civil',
    'tipo_sangre',
]

const camposObligatorios = new Set([
    'nombres',
    'apellido_paterno',
    'tipo_documento',
    'numero_documento',
    'correo',
    'telefono_movil',
])

const formularioInicial = Object.fromEntries(
    camposEditables.map((campo) => [campo, ''])
)

function obtenerFechaLocal() {
    const fecha = new Date()
    const anio = fecha.getFullYear()
    const mes = String(fecha.getMonth() + 1).padStart(2, '0')
    const dia = String(fecha.getDate()).padStart(2, '0')
    return `${anio}-${mes}-${dia}`
}

function normalizarValor(valor) {
    if (valor === null || valor === undefined) return ''
    return String(valor).trim()
}

function normalizarCatalogo(valor, opciones = []) {
    const texto = normalizarValor(valor)

    if (!texto) return ''

    const coincidencia = opciones.find(
        (item) =>
            item.codigo === texto ||
            item.descripcion === texto
    )

    return coincidencia?.codigo ?? texto
}

function construirFormulario(paciente, catalogos) {
    const formulario = { ...formularioInicial }

    for (const campo of camposEditables) {
        formulario[campo] = normalizarValor(paciente[campo])
    }

    formulario.tipo_documento = normalizarCatalogo(
        paciente.tipo_documento,
        catalogos.tipos_documento
    )

    formulario.estado_civil = normalizarCatalogo(
        paciente.estado_civil,
        catalogos.estados_civiles
    )

    formulario.tipo_sangre = normalizarCatalogo(
        paciente.tipo_sangre,
        catalogos.tipos_sangre
    )

    return formulario
}

function validarFormulario(formulario, catalogos) {
    const errores = {}

    for (const campo of camposObligatorios) {
        if (!formulario[campo].trim()) {
            errores[campo] = 'Este campo es obligatorio.'
        }
    }

    if (
        formulario.tipo_documento &&
        !catalogos.tipos_documento.some(
            (item) => item.codigo === formulario.tipo_documento
        )
    ) {
        errores.tipo_documento = 'Selecciona un tipo de documento válido.'
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

    if (correo && correo.length > 254) {
        errores.correo = 'El correo no puede superar 254 caracteres.'
    } else if (
        correo &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
    ) {
        errores.correo = 'Ingresa un correo electrónico válido.'
    }

    const telefono = formulario.telefono_movil.trim()

    if (telefono && !/^9[0-9]{8}$/.test(telefono)) {
        errores.telefono_movil =
            'Ingresa 9 dígitos, comenzando por 9.'
    }

    const ubigeo = formulario.ubigeo.trim()

    if (ubigeo && !/^[0-9]{6}$/.test(ubigeo)) {
        errores.ubigeo =
            'El ubigeo debe contener exactamente 6 dígitos.'
    }

    return errores
}

function obtenerCambios(original, actual) {
    const cambios = {}

    for (const campo of camposEditables) {
        const valorOriginal = normalizarValor(original[campo])
        const valorActual = normalizarValor(actual[campo])

        if (valorOriginal !== valorActual) {
            cambios[campo] =
                valorActual === '' && !camposObligatorios.has(campo)
                    ? null
                    : valorActual
        }
    }

    return cambios
}

export default function PacienteEditarDialog({
    open,
    pacienteId,
    token,
    onClose,
    onActualizado,
}) {
    const [formulario, setFormulario] = useState(formularioInicial)
    const [original, setOriginal] = useState(null)
    const [errores, setErrores] = useState({})
    const [cargandoPaciente, setCargandoPaciente] = useState(false)
    const [errorCarga, setErrorCarga] = useState('')
    const [errorGuardado, setErrorGuardado] = useState('')
    const [guardando, setGuardando] = useState(false)

    const {
        catalogos,
        cargando: cargandoCatalogos,
        error: errorCatalogos,
        consultarCatalogos,
    } = useCatalogos(token, open)

    const catalogosDisponibles =
        !cargandoCatalogos &&
        !errorCatalogos &&
        Boolean(catalogos)

    useEffect(() => {
        if (!open || !pacienteId || !catalogosDisponibles) return

        let vigente = true

        async function cargarPaciente() {
            setCargandoPaciente(true)
            setErrorCarga('')
            setOriginal(null)
            setFormulario({ ...formularioInicial })
            setErrores({})

            try {
                const paciente = await obtenerPacientePorId(
                    token,
                    pacienteId
                )

                if (!vigente) return

                const datos = construirFormulario(paciente, catalogos)

                setFormulario(datos)
                setOriginal({ ...datos })
            } catch (error) {
                if (vigente) {
                    setErrorCarga(
                        error instanceof Error
                            ? error.message
                            : 'No se pudo consultar el paciente.'
                    )
                }
            } finally {
                if (vigente) setCargandoPaciente(false)
            }
        }

        cargarPaciente()

        return () => {
            vigente = false
        }
    }, [open, pacienteId, token, catalogosDisponibles, catalogos])

    const actualizarCampo = (campo, valor) => {
        setFormulario((anterior) => ({
            ...anterior,
            [campo]: valor,
        }))

        setErrores((anterior) => ({
            ...anterior,
            [campo]: undefined,
        }))

        setErrorGuardado('')
    }

    const cambios = original
        ? obtenerCambios(original, formulario)
        : {}

    const hayCambios = Object.keys(cambios).length > 0

    const cerrar = () => {
        if (guardando) return

        setFormulario({ ...formularioInicial })
        setOriginal(null)
        setErrores({})
        setErrorCarga('')
        setErrorGuardado('')
        onClose()
    }

    const guardar = async () => {
        if (
            guardando ||
            !original ||
            !hayCambios ||
            !catalogosDisponibles
        ) {
            return
        }

        setErrorGuardado('')

        const nuevosErrores = validarFormulario(
            formulario,
            catalogos
        )

        setErrores(nuevosErrores)

        if (Object.keys(nuevosErrores).length > 0) return

        setGuardando(true)

        try {
            const resultado = await actualizarPaciente(
                token,
                pacienteId,
                cambios
            )

            if (resultado.resultado !== 'OK') {
                throw new Error('La API devolvió una respuesta inesperada.')
            }

            setGuardando(false)
            cerrar()
            onActualizado?.()
        } catch (error) {
            setErrorGuardado(
                error instanceof Error
                    ? error.message
                    : 'No se pudo actualizar el paciente.'
            )
            setGuardando(false)
        }
    }

    const bloqueado =
        cargandoPaciente ||
        !catalogosDisponibles ||
        guardando ||
        !original

    const campoTexto = (campo, etiqueta, opciones = {}) => (
        <TextField
            key={campo}
            label={etiqueta}
            value={formulario[campo]}
            onChange={(event) =>
                actualizarCampo(campo, event.target.value)
            }
            required={camposObligatorios.has(campo)}
            error={Boolean(errores[campo])}
            helperText={errores[campo]}
            fullWidth
            {...opciones}
        />
    )

    const campoCatalogo = (campo, etiqueta, items) => (
        <TextField
            key={campo}
            select
            label={etiqueta}
            value={formulario[campo]}
            onChange={(event) =>
                actualizarCampo(campo, event.target.value)
            }
            required={camposObligatorios.has(campo)}
            error={Boolean(errores[campo])}
            helperText={errores[campo]}
            fullWidth
        >
            <MenuItem value="">Sin especificar</MenuItem>
            {items.map((item) => (
                <MenuItem key={item.id} value={item.codigo}>
                    {item.descripcion}
                </MenuItem>
            ))}
        </TextField>
    )

    return (
        <Dialog
            open={open}
            onClose={cerrar}
            fullWidth
            maxWidth="md"
        >
            <DialogTitle>
                Editar paciente {pacienteId ? `#${pacienteId}` : ''}
            </DialogTitle>

            <Divider />

            <DialogContent>
                {(cargandoPaciente || cargandoCatalogos) && (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 2,
                            py: 5,
                        }}
                    >
                        <CircularProgress size={28} />
                        <Typography>Cargando información...</Typography>
                    </Box>
                )}

                {errorCatalogos && (
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
                        {errorCatalogos}
                    </Alert>
                )}

                {errorCarga && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {errorCarga}
                    </Alert>
                )}

                {errorGuardado && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {errorGuardado}
                    </Alert>
                )}

                {!bloqueado && (
                    <>
                        <Typography
                            variant="subtitle1"
                            fontWeight={700}
                            sx={{ mb: 2 }}
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
                            {campoTexto('nombres', 'Nombres')}
                            {campoTexto('apellido_paterno', 'Apellido paterno')}
                            {campoTexto('apellido_materno', 'Apellido materno')}

                            {campoCatalogo(
                                'tipo_documento',
                                'Tipo de documento',
                                catalogos.tipos_documento
                            )}

                            {campoTexto(
                                'numero_documento',
                                'Número de documento'
                            )}

                            {campoTexto(
                                'fecha_nacimiento',
                                'Fecha de nacimiento',
                                {
                                    type: 'date',
                                    slotProps: {
                                        inputLabel: { shrink: true },
                                        htmlInput: { max: obtenerFechaLocal() },
                                    },
                                }
                            )}

                            <TextField
                                select
                                label="Sexo"
                                value={formulario.sexo}
                                onChange={(event) =>
                                    actualizarCampo('sexo', event.target.value)
                                }
                            >
                                <MenuItem value="">Sin especificar</MenuItem>
                                <MenuItem value="M">Masculino</MenuItem>
                                <MenuItem value="F">Femenino</MenuItem>
                                <MenuItem value="X">Otro / No especificado</MenuItem>
                            </TextField>
                        </Box>

                        <Typography
                            variant="subtitle1"
                            fontWeight={700}
                            sx={{ mb: 2 }}
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
                            {campoCatalogo(
                                'estado_civil',
                                'Estado civil',
                                catalogos.estados_civiles
                            )}

                            {campoCatalogo(
                                'tipo_sangre',
                                'Tipo de sangre',
                                catalogos.tipos_sangre
                            )}

                            {campoTexto('correo', 'Correo electrónico', {
                                type: 'email',
                                slotProps: {
                                    htmlInput: { maxLength: 254 },
                                },
                            })}

                            {campoTexto('telefono_movil', 'Teléfono móvil', {
                                type: 'tel',
                                slotProps: {
                                    htmlInput: {
                                        maxLength: 9,
                                        inputMode: 'numeric',
                                    },
                                },
                            })}

                            {campoTexto('ubigeo', 'Ubigeo', {
                                slotProps: {
                                    htmlInput: {
                                        maxLength: 6,
                                        inputMode: 'numeric',
                                    },
                                },
                            })}

                            {campoTexto('direccion', 'Dirección')}
                            {campoTexto('ocupacion', 'Ocupación')}
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
                    onClick={guardar}
                    disabled={bloqueado || !hayCambios}
                    startIcon={
                        guardando
                            ? <CircularProgress
                                size={18}
                                color="inherit"
                            />
                            : null
                    }
                >
                    {guardando ? 'Guardando...' : 'Guardar cambios'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
