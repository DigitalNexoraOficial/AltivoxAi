-- Asignar SuperAdmin a un usuario (ejecutar en SQL Editor con cuidado)
-- Sustituye el email antes de ejecutar.

update auth.users
set raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'superadmin')
where email = 'TU_EMAIL@dominio.com';

-- Tras el UPDATE, el usuario debe refrescar sesión (logout/login)
-- para que el JWT incluya app_metadata.role.
