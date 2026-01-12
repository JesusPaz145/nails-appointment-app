Resumen
======

- El `docker-compose.yml` principal ya no crea el servicio `db` por defecto. Esto evita conflictos con un Postgres existente en el servidor.
- Para desarrollo local, usar `docker-compose.local.yml` que contiene la definición del servicio `db`.

Cómo usar
---------

1) En servidor (Portainer / Stack):
   - No incluyas `docker-compose.local.yml` en el Stack. Asegúrate que las variables del servicio `backend` apunten a la DB existente:
     - `DB_HOST` = nombre del contenedor existente (p. ej. `nails_db`) o IP del host
     - `DB_PORT` = `5432`
   - Si la DB está en otro stack, comprueba que ambos stacks compartan la misma red Docker (usar `external: true` con nombre de red compartida).

2) En local (si quieres levantar tu propia Postgres):
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build
   ```

Notas
-----
- Portainer/`docker stack deploy` no siempre lee `.env` del repo; establece `DB_HOST`/`DB_PORT` en el Stack directamente en la UI o en las variables del entorno del stack.
- Si prefieres que el stack cree la DB en producción, lo mejor es hacerlo con extrema precaución y en un entorno separado porque podría sobreescribir datos.
