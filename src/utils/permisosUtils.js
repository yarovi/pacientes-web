// src/utils/permisosUtils.js

export function tienePermiso(profile, permisoRequerido) {
  if (!profile || !permisoRequerido) {
    return false
  }

  const permisos = profile.permissions

  if (!Array.isArray(permisos)) {
    return false
  }

  return permisos.includes(permisoRequerido)
}