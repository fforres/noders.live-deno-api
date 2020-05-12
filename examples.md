https://id.twitch.tv/oauth2/authorize?client_id=<TWITCH_APPLICATION_CLIENT_ID>&redirect_uri=http://localhost:3000/api/twitch/callback&response_type=code&scope=analytics:read:extensions analytics:read:games bits:read channel:edit:commercial channel:read:subscriptions clips:edit user:edit user:edit:broadcast user:edit:follows user:read:broadcast user:read:email chat:read

// Esto va a retornar una URL como esta
..../api/twitch/callback?code=<CODE>&scope=analytics%3Aread%.....

en CODE estas lo que necesitamos :)
