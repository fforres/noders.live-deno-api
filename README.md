# Deno app para Noders.live

1. Instalar Deno [Deno.land](https://deno.land/)
2. Registrar tu aplicación en Twitch [https://dev.twitch.tv/console/apps/create](https://dev.twitch.tv/console/apps/create)
   - En `URL de redireccionamiento de OAuth` poner: `http://localhost:3000/api/twitch/callback`
   - En categoría seleccionar `Chat Bot`
   - Copiar el `ID de cliente`
3. Pegar el `ID de cliente` en `TWITCH_APPLICATION_CLIENT_ID` dentro de `src/config.ts`
4. Correr la applicacion usando: `deno run --allow-net ./src/index.ts`
5. Abrir [localhost:3000](http://localhost:3000)
6. Loguearte con Twitch
7. Copiar el código en la variable `TWITCH_CODE` dentro de `src/config.ts`
8. Detener DENO (`ctrl+c`) y correrlo nuevamente :) `deno run --allow-net ./src/index.ts`

Tadaaaa! Sockets y twitch! :D
